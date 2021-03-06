

var request = 0;

module.exports = {
    ExecuteRequest: function(path,ncSettings, showResponseXml, requestResultsEvent, errHandler) {
        // do the GET request
        var body = '';
        var opt = CreateRequestOptions(path, ncSettings);
        var reqGet = require('http').request( opt, function(res) {

            if (res.statusCode != 200){
                console.log('STATUS: ' + res.statusCode);
                console.log('HEADERS: ' + JSON.stringify(res.headers));
            }
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                body = body + chunk;
//                body.push(chunk);

                // console.log('data ' + chunk);

            });
            res.on('end', function() {
                if (showResponseXml)
                    console.log('body: ' + body.toString());

                var executionTime = null;
                var arr = parseResponseObjects(body, executionTime, errHandler);
                if (arr && requestResultsEvent)
                    requestResultsEvent(arr, executionTime);

            });
        });
        reqGet.end();

        reqGet.on('error', function(e) {
            console.log(' ** Rquest ERROR ** ');
            console.error(e);
            console.dir(e);
//            requestResultsEvent(e);
        });

    }
}


function parseResponseObjects(responseXml, executionTime, errHandler) {
    var resultsArr = [];

    require('xml2js').parseString(responseXml, function (err, obj) {
        if (err) {
            console.log('Error in parsing XML: ' + responseXml);
            console.log(err);

        }
        try {
            // check for errors
            if (obj.ApiResponse && obj.ApiResponse.Errors)
                for (var e in obj.ApiResponse.Errors)   {
                    if (errHandler)
                        errHandler(obj.ApiResponse.Errors[e].Error);
                    console.log(obj.ApiResponse.Errors[e]);
                }

            // parse objects
            var res = resolve(obj, 'ApiResponse.CommandResponse');
            ///console.log(res);
            executionTime = obj.ApiResponse.ExecutionTime;
            if (res){
               for (var i in res){
                   var domainArr = res[i].DomainCheckResult;
                   if (domainArr)
                    for (var j in domainArr) {
//                        console.log(domainArr[j]);
                        var r = domainArr[j];
                        var ro = {
                            isAvailable: r.$.Available == 'true',
                            domain: r.$.Domain
                        }
                        resultsArr.push(ro);

                   }
               }
            }
        }
        catch (e){
            console.dir(e);
        }
    });
    return resultsArr;
}


function CreateRequestOptions(pathString, ncSettings) {
    console.log('path: ' + pathString);
    console.log('ncSettings: ' + ncSettings);
    console.log('ncsettings.url: ' + ncSettings.url);
    console.log('ncSettings.query: ' + ncSettings.query);

    var url = ncSettings.url
    var p = ncSettings.query
        .replace('[USER_NAME]', ncSettings.user)
        .replace('[API_KEY]', ncSettings.apiKey)
        .replace('[DOMAINS]', pathString)
        .replace('[IP]', ncSettings.clientIp)
        .replace('[USER_NAME]', ncSettings.user);

    console.log('Creating Request ' + url + p) //  + url + p)

    var optionsget = {
        host: url,
        // (no http/http !)
        port: 80,
        path: p.replace('{0}', pathString),
        method: 'GET' // do GET
    };
    return optionsget;
}

function resolve(obj, propertyPath) {
    if (!propertyPath) return;

    var props = propertyPath.split('.');
    var o = obj;
    for(var i in props) {
        o = o[props[i]];
        if(!o) return false;
    }
    return o;
}
