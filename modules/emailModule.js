/**
 * Created by megan on 2016-11-29.
 */

var nodemailer = require('nodemailer');
var config = require('./configModule');
var log = require('./logModule');

var EmailModule = function(){};

EmailModule.prototype.send = function(emailAddr, adminAddr, sbj, text, html){
    var transport = nodemailer.createTransport({
        host: config.conf.email.host,
        port: config.conf.email.port || 25,
        secure: false // use SSL
        , auth: {
            user: config.conf.email.authAddr,
            pass: config.conf.email.authPass
        }
    });

    var mailOptions = {
        from: config.conf.email.from,
        to: emailAddr,
        bcc: adminAddr,
        subject: sbj,
        text: text,
        html: html
    };

    transport.sendMail(mailOptions, function(error, response){
        if(error){
            log.error(error);
        }else{
            log.info("Message %s sent: %s", response.messageId, response.response);
        }
    });
};

module.exports = new EmailModule();
