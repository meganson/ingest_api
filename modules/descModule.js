/**
 * Created by megan on 2017-04-03.
 */

var DescModule = function(){
    this._code = {
        Success: 0,
        Fail: 1,

        NoParam: 100,
        WorkingWorker: 200,
        WrongWorker: 201,
        DiscardJob: 202,

        NoJob: 500,
        FailReporting: 505
    };

    this._desc = {
        0: 'Success',
        1: 'Fail',

        100: 'No parameters',

        200: 'This worker is working',
        201: 'This worker is wrong',
        202: 'Discard this job',

        500: 'Job does not exist',

        505: 'Reporting Fail'
    };
};

DescModule.prototype.getDesc = function(errCode){
    return this._desc[errCode];
};

DescModule.prototype.getCode = function(errMsg){
    return this._code[errMsg];
};

module.exports = new DescModule();