/**
 * Created by megan on 2017-10-17.
 */

var commonController = require('controllers/commonController_v3');

// server version - v 3.0
exports.version = function(req, res){
    commonController.version(req, res, function(rows){
        res.send(rows);
    });
};
