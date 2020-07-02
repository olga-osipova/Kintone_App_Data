try {
	Zabbix.Log(127, 'Kintone webhook script value='+value);
 
	var result = {
		'tags': {
			'endpoint': 'kintone'
		}
	},
	params = JSON.parse(value),
    req = new CurlHttpRequest(),
    req2 = new CurlHttpRequest(),
    body = {},
    body2 = {},
    resp,
    resp2;
    
    //req.setProxy(params.proxy);
 
    req.AddHeader('Content-Type: application/json');
    req.AddHeader('X-Cybozu-API-Token: Han3FREbdlbccJaKMWcwT435Ylw3S09DotkuGMZY');

    req2.AddHeader('Content-Type: application/json');
    req2.AddHeader('X-Cybozu-API-Token: sRL4Y0Lff1AQF6sla7OKuj1BmUhGkKuDUCDQvoO6');
    
    body = {
        "app": 9,
        "record": {
            "Contents": {
                "value": params.content
            },
            "Ticket_Number": {
                "value": params.number
            },
            "Type" : {
                "value": 'Alert'
            },
            "Title" : {
                "value": params.title
            },
        }
    };
    
    resp = req.Post('https://iclservices.kintone.com/k/v1/record.json', JSON.stringify(body));
 
	/*if (req.Status()!= 201 || req.Status()!= 200) {
		throw 'Response code: '+req.Status();
	}*/
 
	resp = JSON.parse(resp);
    result.tags.resp1 = resp;
    Zabbix.Log(127, 'Kintone Response Status='+req.Status());

    body2 = {
        "app": 9,
        "id": resp.id.toString(),
        "action": "Receive"        
    };
    Zabbix.Log(127, 'Kintone Request '+ JSON.stringify(body2));
     
    resp2 = req2.Put('https://iclservices.kintone.com/k/v1/record/status.json', JSON.stringify(body2));
    Zabbix.Log(127, 'Kintone Response Status='+req2.Status());
    result.tags.resp2 = resp2;

Zabbix.Log(127, 'Kintone request: '+ JSON.stringify(resp2));
    
} catch (error) {
	Zabbix.Log(127, 'Kintone request issue : '+error);
 
    result = {};
}
 
return JSON.stringify(result);