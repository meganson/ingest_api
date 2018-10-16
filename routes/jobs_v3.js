/**
 * Created by megan on 2017-04-27.
 */

var jobController = require('controllers/jobController_v3');

// 잡 체크 (보유 여부) - v 3.0
exports.getJob = function(req, res){
    jobController.getJob(req, res, function(rows){
        res.send(rows);
    });
};

// 잡 보고 (단계적 보고) - v 3.0
exports.reportJob = function(req, res){
    jobController.reportJob(req, res, function(rows){
        res.send(rows);
    });
};

// 잡 보고 Meta 용 - v 3.0
exports.reportMeta = function(req, res){
    jobController.reportMeta(req, res, function(rows){
        res.send(rows);
    });
};