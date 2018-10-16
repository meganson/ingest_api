/**
 * Created by megan on 2016-10-25.
 */

var jobController = require('controllers/jobController');

// 잡 체크 (보유 여부)
exports.getJob = function(req, res){
    jobController.getJob(req, res, function(rows){
        res.send(rows);
    });
};

// 잡 보고 (단계적 보고)
exports.reportJob = function(req, res){
    jobController.reportJob(req, res, function(rows){
        res.send(rows);
    });
};

// Movie Content 잡 보고 (drmType 보고)
exports.reportJobMV = function (req, res) {
    jobController.reportJobMV(req, res, function (rows) {
        res.send(rows);
    });
};