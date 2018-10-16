/**
 * Created by megan on 2017-04-27.
 */

var workerController = require('controllers/workerController_v3');

// 워커 상태 체크 (주기적 보고) - v 3.0
exports.heartbeat = function(req, res){
    workerController.heartbeat(req, res, function(rows){
        res.send(rows);
    });
};