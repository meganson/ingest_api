/**
 * Created by megan on 2016-10-17.
 */

process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

var cluster = require('cluster');
var log = require('./modules/logModule');

if(cluster.isMaster){
    cluster.fork();

    cluster.on('exit', function(worker, code, signal){
        log.notice('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        log.notice('Starting a new worker');
        cluster.fork();
    });
}else{
    var express = require('express');
    var app = express();
    var bodyParser = require('body-parser');

    var config = require('modules/configModule');

    var common = require('routes/common');
    var jobs = require('routes/jobs');
    var workers = require('routes/workers');

    var common_v3 = require('routes/common_v3');
    var jobs_v3 = require('routes/jobs_v3');
    var workers_v3 = require('routes/workers_v3');

    var resTimeout = function(req, res, next){
        res.setTimeout(20 * 1000, function(){
            log.warn('Response has timed out.');
            res.send(408);
        });
        next();
    };

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(resTimeout);

    // codedeploy 용 서버 상태 체크
    app.get('/validate', common.validate);

    /**
     * api version 1.0 / 2.0
     */
    // 잡 체크 (보유 여부)
    app.get('/job', jobs.getJob);
    // 잡 보고 (단계별 보고)
    app.post('/job', jobs.reportJob);
    // Movie Content 잡 보고 (drmType 보고)
    app.post('/jobMV', jobs.reportJobMV);

    // 워커 상태 체크 (주기적 보고)
    app.get('/heartbeat', workers.heartbeat);
    // // 워커 기동
    // app.get('/startWorker', workers.start);
    // // 워커 중지
    // app.get('/stopWorker', workers.stop);

    /**
     * api version 3.0
     */
    // 잡 체크 (보유 여부)
    app.get('/v3/job', jobs_v3.getJob);
    // 잡 보고 (단계별 보고)
    app.post('/v3/job', jobs_v3.reportJob);
    // 잡 보고 Meta 용
    app.post('/v3/report', jobs_v3.reportMeta);

    // 워커 상태 체크 (S 보고)
    app.get('/v3/heartbeat', workers_v3.heartbeat);
    // 워커 버전 체크
    app.get('/v3/version', common_v3.version);

    var server = app.listen(config.conf.port, function(){
        var host = server.address().address;
        var port = server.address().port;
        log.info('Server listening on ', host, port);
    });
}

process.on('uncaughtException', function(err) {
    log.error('uncaughtException :', err.message);
    // process.exit(1);
});