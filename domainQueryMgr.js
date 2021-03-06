var http = require('http');
var resultsArr = [];
var resultsAddedEvent;
var domainTshd = 50;

var request = require('./ExecuteRequest_http');

module.exports = {

    checkDomains: function(domains, batchSize, showResponseXml, callbackFunction, errHandler) {
        domainTshd  = batchSize;
        if (domains)      {
            console.log('domains to process: ' + domains.length + ' batch size: ' + domainTshd);
            if (Array.isArray(domains) && domains.length > domainTshd){
                var domainsTmp = domains.slice(0);
                while (domainsTmp.length){
                    var arr = domainsTmp.splice(0,domainTshd);
                    // mainRequest(arr.toString(), showResponseXml);
                    request.ExecuteRequest(arr.toString(), getNameCheapSettings(), showResponseXml, callbackFunction, errHandler);

                }
            }
            else
                // mainRequest(domains.toString(), showResponseXml);
                request.ExecuteRequest(domains.toString(), getNameCheapSettings(), showResponseXml, callbackFunction, errHandler);

        }
    },
    results: resultsArr,
    batchSize: domainTshd,
    resultAddedEvt: function(evt){
        resultsAddedEvent = evt;
    }
}



function getNameCheapSettings() {
    return {
        user:       'sonicraf',
        apiKey:     '4ba061d21c2a49cdb1d90e87fc241aa2',
        url:        'api.sandbox.namecheap.com',
        query:      '/xml.response?ApiUser=[USER_NAME]&ApiKey=[API_KEY]&UserName=[USER_NAME]&ClientIP=[IP]&Command=namecheap.domains.check&DomainList=[DOMAINS]',
        clientIp:    '198.228.201.161' // '74.66.231.216' //
    }
}

function resolve(obj, propertyPath) {
    if (!propertyPath) return;

    var props = propertyPath.split('.');
    var o = obj;
    for(var i=1; i<props.length; i++) {
        o = o[props[i]];
        if(!o) return false;
    }
    return o;
}

