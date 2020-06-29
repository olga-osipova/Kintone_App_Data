(function() {
	
   "use strict";

    kintone.events.on('app.record.create.submit.success', function (event) {       

		/* Updates the assignee to the first person listed in the User selection field
        after adding a record and changes the status to the next status.*/
        

        console.log('Created a record');
        
        var appid = event.appId;
        var record = event.record;

        alert("The record ID is " + record["$id"]["value"] + ", Caller " + record['Caller'].value[0].code);


        var body = {
            'app': appid,
            'id': record['$id'].value,
            "action": "Receive"            
            //'assignees': [record['Caller'].value[0].code]
        };

        alert(JSON.stringify(body));
 
        //kintone.api(kintone.api.url('/k/v1/record/assignees', true), 'PUT', body).then(function(resp) {
        kintone.api(kintone.api.url('/k/v1/record/status', true), 'PUT', body).then(function(resp) {
            //success
            alert(JSON.stringify(resp));
        }, function(error) {
            //error
            alert(JSON.stringify(error));
        });
    });



})();