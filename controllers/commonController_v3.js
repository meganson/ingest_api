/**
 * Created by megan on 2017-10-17.
 */

var megan = require('modules');

module.exports = {
    version: function(req, res, callback){
        megan.log.debug(req.url);
        megan.db.execute(megan.sp_GetAmi_V3.name, {}, function (err, rows) {
            callback(megan.sp_GetAmi_V3.getResult(rows));
        });
    }
};