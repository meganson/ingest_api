/**
 * Created by megan on 2016-11-22.
 */

var httpModule = require('./httpModule');
var config = require('./configModule');
var logModule = require('./logModule');

var SmsModule = function(){};

SmsModule.prototype.send = function(type, tel, text){
    var smsConf = config.conf.sms;
    var data = {
        "cb": smsConf.cb,
        "ctn": tel,
        "id": smsConf.mplaceId,
        "pwd": smsConf.mplacePwd,
        "msgtype": type,
        "text": text
    };

    httpModule.request('https://'+smsConf.url+smsConf.path, 'GET', data, 5 * 60 * 1000, function(err, statusCode, data){
        logModule.debug('send sms :', data);
    });
};

module.exports = new SmsModule();