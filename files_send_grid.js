
/*------------------------------------------------
Considering that 'mail_data' is a global variable


SendGrid Send mail API v3
https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/index.html
https://sendgrid.com/docs/API_Reference/Web_API_v3/How_To_Use_The_Web_API_v3/authentication.html

Base64 encoding
https://developer.mozilla.org/ru/docs/Web/API/WindowBase64/Base64_encoding_and_decoding

Send files via $.ajax()
https://makandracards.com/makandra/39225-manually-uploading-files-via-ajax
https://stackoverflow.com/questions/5392344/sending-multipart-formdata-with-jquery-ajax

--------------------------------------------------*/


    function getAttach(event) {
        
        return $.Deferred(function(defer){
        
            var attach = event.record.file.value;
            var attachArr = [];
            var blobArr = [];
            
            var response = {
                attach: attachArr,
                blob: blobArr					
            }				
            
            if (!attach.length) {
                
                defer.resolve(response);
            }
            else {
                
                var promises_array = [];					
            
                //get data for every attachment
                for (var i=0; i < attach.length; i++) {
                
                    var promise = new $.Deferred(function(defer) {
                        
                        var url = kintone.api.url('/k/v1/file', true) + '?fileKey=' + attach[i].fileKey;					
                        var fileName = attach[i].name;
                        var fileType = attach[i].contentType;
                        
                        $.ajax({
                            method: "GET",
                            url: url,
                            xhrFields:{
                                responseType: 'blob'
                            }
                        })
                        .then(function(resp) {
                            
                            if (resp) {
                                
                                var blob = resp;
                                
                                var reader = new FileReader();
                                reader.readAsDataURL(resp);
                                
                                reader.onloadend = function() {
                                    
                                    var base64data = reader.result;
                                    
                                    var obj = {										
                                        filename: fileName,
                                        content: base64data,
                                        type: fileType,
                                        disposition: "attachment"
                                    }
                                    
                                    attachArr.push(obj); //for SendGrid
                                    
                                    var blobObj = {
                                        filename: fileName,
                                        content: blob											
                                    }
                                    
                                    blobArr.push(blobObj); //for creating attachment when saving sent mail record
                                    
                                    defer.resolve();
                                }
                            }								
                                            
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
                    
                    response.attach = attachArr;
                    response.blob = blobArr;
                    
                    defer.resolve(response);						
                    
                }, function(error) {
                    defer.reject(error);
                });
            }
        });		
    }		


    function saveFiles(arr) {
        
        return $.Deferred(function(defer){
        
            var createdFiles = [];
            
            if (arr.length) {
                
                var promises_array = [];
            
                //upload every attachment
                for (var i=0; i < arr.length; i++) {
                
                    var promise = new $.Deferred(function(defer) {
                        
                        var url = kintone.api.url('/k/v1/file', true);
                        
                        var blob = arr[i].content;
                        var name = arr[i].filename;
                        
                        var formData = new FormData();
                        formData.append("__REQUEST_TOKEN__", kintone.getRequestToken());
                        formData.append("file", blob, name);
                        
                        $.ajax({
                            method: "POST",
                            url: url,
                            data: formData,
                            cache: false,
                            contentType: false,
                            processData: false
                        })
                        .then(function(resp) {
                            
                            var obj = resp; //object containing fileKey
                            
                            obj.contentType = blob.type;
                            obj.name = name;
                            obj.size = blob.size;
                            
                            createdFiles.push(obj);
                            
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
                    defer.resolve(createdFiles);
                }, function(error) {
                    defer.reject(error);
                });				
            }
            else {
                
                defer.resolve(createdFiles);				
            }
        });
    }
    

    function sendMail(api, params) {
        
        return $.Deferred(function(defer){				
                                    
            //set SendGrid api data
            var header = {
                "Content-Type": "application/json",				
                "Authorization": "Bearer " + api.api_key
            };
                
            var endPoint = api.api_endpoint;
            
            var user = kintone.getLoginUser();
            
            var promises_array = [];
            
            //send a separate mail for every addressee 
            for (var i=0; i < params.to.length; i++) {
            
                var promise = new $.Deferred(function(defer) {
            
                    //set SendGrid request body
                    
                    var addressee = params.to[i];
                    
                    var obj = {							
                        "personalizations": [
                            {
                            "to": [
                                {
                                    "name": addressee.name,
                                    "email": addressee.mailAddr
                                }
                            ],
                            "subject": params.subject
                            }
                        ],
                        "from": {
                            "name": user.name,
                            "email": user.email
                        },
                        "content": [
                            {
                            "type": "text/plain"
                            }
                        ]							
                    }

                    if (params.attach) {
                        
                        obj.personalizations[0].attachments = params.attach;							
                        
                    }
                    
                    if (params.cc) {
                        
                        obj.personalizations[0].cc = [
                            {
                                "name": params.cc[0].name,
                                "email": params.cc[0].mailAddr									
                            }							
                        ];				
                    }
                    
                    if (params.bcc) {
                        
                        obj.personalizations[0].bcc = [
                            {
                                "name": params.bcc[0].name,
                                "email": params.bcc[0].mailAddr									
                            }							
                        ];					
                    }
                        
                    var content = params.body;							
                    
                    var name_reg_exp = /\$\{mailName\}/gi;
                    var mail_reg_exp = /\$\{mailAddr\}/gi;
                    var comp_reg_exp = /\$\{orgName\}/gi;
                    
                    content = content.replace(name_reg_exp, addressee.name);
                    content = content.replace(mail_reg_exp, addressee.mailAddr);
                    content = content.replace(comp_reg_exp, addressee.company);
                    
                    obj.content[0].value = content; 
                    
                    var data = JSON.stringify(obj);	
                    
                    var param = {
                        url: endPoint,
                        header: header,
                        obj: obj,
                        data: data
                    };
                        
                    sendRequest(param, addressee.company).then(function(resp){
                        
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
                defer.resolve(mail_data);
            }, function(error) {
                defer.reject(error);
            });	
        });
    }
    

    function sendRequest(param, company) {
        
        return $.Deferred(function(defer){
            
            kintone.proxy(param.url, 'POST', param.header, param.data).then(function(args) {
                        
                /*  args[0] -> body(string)
                    *  args[1] -> status(number)
                    *  args[2] -> headers(object)
                */
                
                var obj = param.obj;
                
                if (args[1] == "202") {
                    
                    obj.messageId = args[2]["X-Message-Id"];
                    
                    var date = new Date();							
                    obj.date = date;
                    
                    obj.company = company;
                    
                    mail_data.push(obj);								
                }
                
                defer.resolve(args);
                
            }, function(error) {
                defer.reject(error);
            });
        });			
    }