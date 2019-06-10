(function() {
	
   "use strict";
	
	
	angular.module('myApp', []).controller('myCtrl', ['$scope', '$compile', function($scope, $compile) {			
						
		$scope.test = "Cheers";
		$scope.records = [];	

		$scope.activateView = function(ele) {
			$compile(ele.contents())($scope);
			$scope.$apply();
		};
		
	}]);
		
		//angular.bootstrap(document.body, ['myApp']);	
		
		$('body').attr('ng-app', 'myApp');
		$('body').attr('ng-controller', 'myCtrl');
	
	
	
	   //Event that triggers when the record list page is displayed
		kintone.events.on('app.record.detail.show', function(event) {
			
		//Adding a button
		
			//Prevent duplication of the button
			
			if (document.getElementById ('my_index_button') != null) {
				return;
			}　　　
			// Set a button
			var myIndexButton = document.createElement('button');
			myIndexButton.id = 'my_index_button';
			myIndexButton.style = "background-color: #cde3f2; margin: 20px; height: 40px; border: 2px solid #3498db; border-radius: 4px;";
			myIndexButton.innerHTML = 'Get details';
			
			// Retrieve the header menu space element and set the button there
			kintone.app.record.getHeaderMenuSpaceElement().appendChild(myIndexButton);
			
			console.log(event);
			
						
			var modal = 	'<div class="modal fade" id="myModal" role="dialog">' +
								'<div class="modal-dialog modal-lg" style = "width: 90%" >' +   
									'<!-- Modal content-->' +
									'<div class="modal-content" style="border-radius: 0px;">' +
										'<div class="modal-header" style = "text-align: center">Server Response data'+
											'<button type="button" class="close" data-dismiss="modal">&times;</button>'+
											'<h4 class="modal-title">{{test}}</h4>'+
										'</div>'+
										'<div class="modal-body">'+									
											'<table style = "font-size: 12px;" ng-if = "records" class = "table-hover table-bordered">'+
											'<tbody>'+
												'<tr class="bg-success">'+
												'<td ng-if = "record_options" ng-repeat = "option in record_options track by $index"><strong>{{option}}</strong></td>'+
												'</tr>'+
												'<tr ng-repeat = "record in records">'+
												'<td ng-repeat = "option in record_options track by $index">'+
												'<div style = "display: inline">{{record[option]}}</div>'+
												'</td>'+
												'</tr>'+
											'</tbody>'+
											'</table>'+										
										'</div>'+		
										'<div class="modal-footer">'+
											'<button type="button" class="btn btn-success" data-dismiss="modal">Ok</button>'+
											'</div>'+
										'</div>'+
									'</div>'+
							'</div>';
						
			var div = document.createElement('div');
			div.id = 'modal';
			div.style.display = 'none';
			
			kintone.app.record.getHeaderMenuSpaceElement().appendChild(div);
			
			
			//Adding modal window content to the Angular controller scope
			var e1 = angular.element(document.getElementById("modal"));
			e1.html(modal);
			
			var mController = angular.element(document.getElementById("modal"));
			mController.scope().activateView(e1);
			
				
				
				// Button onclick function
				
				$("#my_index_button").on("click", function(){	
			
					console.log('Button clicked!');	
					
					//get data about record name from the event to use in query					
					
					var comp_name = event.record.companyName.value.toString();
					console.log(comp_name);
					
					var body = {
						"app": 143,
						"query": "組織名_通常_ like \"" + comp_name + "\""
					};
					
					//send REST GET request to [dev]組織名分析Data
					
					kintone.api(kintone.api.url('/k/v1/records', true), 'GET', body, function(resp) {					
						
						console.log(resp);
						
						dislayData(resp);
														
						}, function(error) {
							// error
							console.log(error);
					});				

			});					
				
		}); 	
		
		/*---------------------------------------------*/
				
				function dislayData(resp) {
					
					
					var scope = angular.element(document.getElementById('modal')).scope();
										
					console.log('Retrieving Scope');
					console.log(scope);
					
					//Adding response data to the Angular controller scope
					
					scope.$apply(function(){					
						
						var data = resp.records;
						var display_data = [];
						scope.record_options = Object.keys(data[0]);						
						

						for (var i=0; i<data.length; i++) {	

							display_data[i] = {};
							
							for (var j=0; j<scope.record_options.length; j++) {
								
								var prop = scope.record_options[j];								
								var type = data[i][prop].type;								
								
								if (type == "CREATOR" || type == "MODIFIER") {									
									display_data[i][prop] = data[i][prop].value.name;									
								}								
								else {
									display_data[i][prop] = data[i][prop].value;
								}								
							}							
						}
						
						scope.records = display_data;						
								
						console.log(scope.record_options);	
						
					});
					
					console.log('Display function called');						
					
					$("table").css({display: "flex", "justify-content": "center", "table-layout": "auto", "border": "none"});
					$("tbody tr").css({ padding: "5px", "text-align": "center" });
					$("tbody td").css({ padding: "5px", "text-align": "center" });
					
					$("#modal").css({ display: "inline" });
					$("#myModal").modal();						
				
				}		
	 
   
   
})();