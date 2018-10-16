/**
 * Created by megan on 2017-07-27.
 */

var WebClient = require('@slack/client').WebClient;
var log = require('./logModule');
var config = require('./configModule');

var SlackModule = function(){};

SlackModule.prototype.send = function(channel, message, opts){
    var token = process.env.SLACK_API_TOKEN || config.conf.slack.token;

    var web = new WebClient(token);
    web.chat.postMessage(channel, message, opts, function(err, res) {
        if (err) {
            log.error('Error:', err);
            return;
        }
        log.debug('Message sent: ', res);
    });
};

module.exports = new SlackModule();