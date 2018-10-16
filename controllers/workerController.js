/**
 * Created by megan on 2016-10-25.
 */

var megan = require('modules');

module.exports = {
    heartbeat: function(req, res, callback){
        megan.log.debug(req.url);
        if(req.query.workerStatus == 'S'){
            var params = megan.sp_ReportWorker.setParameters(req.query);
            megan.common.validateParameters(params, function(output) {
                if(output) return callback(megan.common.getParamErr(output));
                megan.db.execute(megan.sp_ReportWorker.name, params, function (err, rows) {
                    callback(megan.sp_ReportWorker.getResult(rows));
                });
            });
            return;
        }
        callback({ 'result': 0 });
    },
    start: function(req, res, callback){
        var params = req.workerId;
        megan.aws.startInstance(params, function(err){
            callback(err);
        });
    },
    stop: function(req, res, callback){
        var params = req.workerId;
        megan.aws.stopInstance(params, function(err){
            callback(err);
        });
    }
};