        
        //Case the record number allowed to be updated/created at once is limited
        //using multiple promises method: https://stackoverflow.com/questions/5627284/pass-in-an-array-of-deferreds-to-when        


        function updateRecords(appId, records) {
			
			return $.Deferred(function(defer){	
								
				var promises_array = [];
				
				//group records by 100
				
				var rec_group_arr = [];
				var group_amount = Math.ceil(records.length/100);
				
				var current_group = 0;				
				var current_group_arr = [];
				
				for (var i = 0; i < records.length; i++) {
					
					if ( (i < 100*(current_group + 1)) && (i < (records.length - 1)) ) {
						current_group_arr.push(records[i]);
					}
					else if ( i == 100*(current_group + 1) ) {
						rec_group_arr.push(current_group_arr);
						
						current_group++;
						current_group_arr = [];	
						current_group_arr.push(records[i]);
					}
					else if ( i == (records.length - 1) ) {
						current_group_arr.push(records[i]);
						rec_group_arr.push(current_group_arr);					
					}
				}
				
				//create promises and send PUT requests	for every group of records				
				
				for (var i = 0; i < rec_group_arr.length; i++) {
					
					var record_body = [];
					
					//set the body array
					for (var j = 0; j < rec_group_arr[i].length; j++) {	
						record_body.push(rec_group_arr[i][j]);
					}
					
					var request_body = {
						"app": appId,
						"records": record_body	
					};

					var promise = new $.Deferred(function(defer) {						
												
						//update the record
						kintone.api(kintone.api.url('/k/v1/records', true), 'PUT', request_body, function(resp) {							
							defer.resolve(resp);
						}, function(error) {							
							defer.reject(error);
						});														
								
					}).promise();
					
					//set the promise in the array
					promises_array[i] = promise;
						
				}
							
				
				//return a result when all promises are processed
				$.when.apply($, promises_array)
				.then(function(resp){
					defer.resolve(resp);					 					
					
				},function(error){
					defer.reject(error);
				});			
			});
		}
		
		
		
		function createRecords(appId, records) {
			
			return $.Deferred(function(defer){	
								
				var promises_array = [];
				
				//group records by 100
				
				var rec_group_arr = [];
				var group_amount = Math.ceil(records.length/100);
				
				var current_group = 0;				
				var current_group_arr = [];
				
				for (var i = 0; i < records.length; i++) {
					
					if ( (i < 100*(current_group + 1)) && (i < (records.length - 1)) ) {
						current_group_arr.push(records[i]);
					}
					else if ( i == 100*(current_group + 1) ) {
						rec_group_arr.push(current_group_arr);
						
						current_group++;
						current_group_arr = [];	
						current_group_arr.push(records[i]);
					}
					else if ( i == (records.length - 1) ) {
						current_group_arr.push(records[i]);
						rec_group_arr.push(current_group_arr);					
					}
				}
				
				//create promises and send POST requests for every group of records				
				
				for (var i = 0; i < rec_group_arr.length; i++) {
					
					var record_body = [];
					
					//set the body array
					for (var j = 0; j < rec_group_arr[i].length; j++) {	
						record_body.push(rec_group_arr[i][j]);
					}
					
					var request_body = {
						"app": appId,
						"records": record_body	
					};

					var promise = new $.Deferred(function(defer) {						
												
						//update the record
						kintone.api(kintone.api.url('/k/v1/records', true), 'POST', request_body, function(resp) {
							defer.resolve(resp);
						}, function(error) {
							defer.reject(error);
						});														
								
					}).promise();
					
					//set the promise in the array
					promises_array[i] = promise;
						
				}							
				
				//return a result when all promises are processed
				$.when.apply($, promises_array)
				.then(function(resp){
					defer.resolve(resp);					 					
					
				},function(error){
					defer.reject(error);
				});			
			});
		}