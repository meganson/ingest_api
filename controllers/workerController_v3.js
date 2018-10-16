/**
 * Created by megan on 2017-04-27.
 */

var megan = require('modules');

module.exports = {
    heartbeat: function(req, res, callback){
        megan.log.debug(req.url);
        if(req.query.workerStatus == 'S') {
            var params = megan.sp_ReportWorker_V3.setParameters(req.query);
            megan.common.validateParameters(params, function (output) {
                if (output) return callback(megan.common.getParamErr(output));
                megan.db.execute(megan.sp_ReportWorker_V3.name, params, function (err, rows) {
                    callback(megan.sp_ReportWorker_V3.getResult(rows));
                });
            });
            return;
        }
        callback({ 'result': 0 });
    }
};