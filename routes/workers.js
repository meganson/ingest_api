/**
 * Created by megan on 2016-10-25.
 */

var workerController = require('controllers/workerController');

// 워커 상태 체크 (주기적 보고)
exports.heartbeat = function(req, res){
    workerController.heartbeat(req, res, function(rows){
        res.send(rows);
    });
};

// 워커 기동
exports.start = function(req, res){
    workerController.start(req, res, function(rows){
        res.send(rows);
    });
};

// 워커 중지
exports.stop = function(req, res){
    workerController.stop(req, res, function(rows){
        res.send(rows);
    });
};