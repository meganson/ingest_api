/**
 * Created by megan on 2016-10-19.
 */

var megan = require('modules');

module.exports = {
    /**
     * version 1.0 / 2.0
     * @param req
     * @param res
     * @param callback
     */
    getJob: function(req, res, callback){
        megan.log.debug(req.url);
        var params = megan.sp_AssignJob.setParameters(req.query);
        megan.common.validateParameters(params, function(output){
            if(output){
                callback(megan.common.getParamErr(output));
                return;
            }
            // if(!megan.config.conf.stopIngest){
                megan.db.execute(megan.sp_AssignJob.name, params, function(err, rows){
                    // // 진행 중 잡 보고 (pooq api) - 진행 중 잡 보고 처리는 filter 에서 report job api 호출하여 처리하기로
                    // if(rows.length > 0){
                    //     if(rows[1][0].result == 0 && rows[0].length) self.fn_executeReportJob(rows[0][0]);
                    // }

                    // // 등록 안 된 스팟 요쳥 취소
                    // if(rows[1][0].result !== 'undefined'){
                    //     if(rows[1][0].result == '201'){
                    //         megan.aws.describeInstance(req.query.workerId, function(err, data){
                    //             var spotInstanceReqId = data.Reservations[0].Instances[0].SpotInstanceRequestId;
                    //             if(!megan.common.isNull(spotInstanceReqId)){
                    //                 megan.aws.cancelSpotInstanceRequest([spotInstanceReqId], function(err, data){});
                    //                 megan.aws.terminateInstance([req.query.workerId], function (err, data) {});
                    //             }
                    //         });
                    //     }
                    // }

                    callback(megan.sp_AssignJob.getResult(rows));
                });
            //     return;
            // }
            // callback({ 'result': 500 });
        });
    },
    reportJob: function(req, res, callback){
        var self = this;
        megan.log.debug(req.url, req.body);
        var params = megan.sp_ReportJob.setParameters(req.body);
        megan.common.validateParameters(params, function(output){
            if(output){
                callback(megan.common.getParamErr(output));
                return;
            }
            megan.db.execute(megan.sp_ReportJob.name, params, function(err, rows){
                // 완료 잡 보고 (pooq api, cp api)
                if(rows.length > 0){
                    if(req.body.acquireState == 'P'){   // 진행 중 잡 보고 일시 최초 1회만 pooq api 보고 하기 위한 처리
                        if(req.body.acquireStep <= 3) fn_Report(rows[0][0]);
                    }else fn_Report(rows[0][0]);
                }

                callback(megan.sp_ReportJob.getResult(rows[0]));
            });
        });

        function fn_Report (rows){
            var isRptConf = megan.config.conf.isReport;
            // procedure 처리결과 성공일 시 보고
            if(rows.result == 0){
                // pooq api 보고
                if(isRptConf.pooq === true) self.fn_ReportPooq(rows);
                // 방송사 api 보고
                if(isRptConf.cp === true) self.fn_ReportCp(rows);
                // 방송사 sms 보고
                if(isRptConf.sms === true) self.fn_SendSms(rows);
                // email 보고
                if(isRptConf.email === true) self.fn_SendEmail(rows);
                // slack msg
                if(isRptConf.slack === true) self.fn_SendSlack(rows);
            }
        }
    },
    reportJobMV: function (req, res, callback) {
        var self = this;
        megan.log.debug(req.url, req.body);

        var params = megan.sp_Bo_ReportJobMV.setParameters(req.body);
        megan.common.validateParameters(params, function (output) {
            if (output) return callback(megan.common.getParamErr(output));

            megan.db.execute(megan.sp_Bo_ReportJobMV.name, params, function (err, rows) {
                self.fn_ReportPooq(rows[0][0], function (err) {
                    err = (rows[0][0].result > 0) ? rows[0][0].result: err;
                    callback({'result': err, 'message': megan.desc.getDesc(err)});
                });
            });
        });
    },
    /**
     * functions
     * @param data
     */
    fn_executeReportJob: function(data){
        var self = this;
        var params = megan.sp_ReportJob.setParameters(data);
        megan.db.execute(megan.sp_ReportJob.name, params, function(err, rows){
            // 진행 중 잡 보고 (cp api)
            self.fn_ReportPooq(rows);
        });
    },
    fn_ReportPooq: function(rows, callback){
        var self = this;
        var params;
        // 무조건 보고
        // 재입수 시 파일 없는 경우 성공으로 보고하지만 코멘트 존재
        if(!megan.common.isNull(rows.reportApiUrl)){
            var json = {
                'contentId': rows.contentId,
                'cornerId': rows.cornerId,
                'bitrate': rows.bitrate,
                'acquire': rows.acquire,
                'comment': rows.comment,
                'playTime': rows.playtime,
                'fileSize': rows.filesize,
                'mediaVersion': rows.mediaVersion,
                'transcodingType': rows.transcodingType,
                'drmType': rows.drmType
            };
            megan.http.request(rows.reportApiUrl+'/'+rows.channelId, 'POST', json, 5 * 60 * 1000, function (err, statusCode, data) {
                if(!err && statusCode == 200 && megan.common.isJsonString(data)) {
                    var responseObject;
                    responseObject = JSON.parse(data);
                    if (responseObject.message == 'success' && responseObject.returnCode == '200' && responseObject.result.status == 'OK') {
                        params = {'reportId': rows.reportId, 'reportState': 'S'};
                        self.fn_executeReportState(params);
                        megan.log.debug('pooq api report success', responseObject);
                        if(typeof callback !== 'undefined') return callback(0);
                        return;
                    }
                }

                params = {'reportId': rows.reportId, 'reportState': 'F'};
                self.fn_executeReportState(params);
                megan.log.error('pooq api report fail', data);
                if(typeof callback !== 'undefined') return callback(505);
            });
            return;
        }
        if(typeof callback !== 'undefined') callback(500);
    },
    fn_executeReportState: function(data){
        var params = megan.sp_SetReportState.setParameters(data);
        megan.db.execute(megan.sp_SetReportState.name, params, function(err, rows){});
    },
    fn_ReportCp: function(rows){
        // 무조건 보고
        // 재입수 시 파일 없는 경우 실패로 보고
        // content id, comment 보고
        // http://svc.jtbc.joins.com/pooq/setVodTrans.aspx?contentid=C2301_EP10031983&cornerid=1&bitrate=700
        if(!megan.common.isNull(rows.cpReportUrl)){
            var json = {
                'contentid': rows.contentId,
                'cornetid': rows.cornerId,
                'bitrate': rows.bitrate
            };
            megan.http.request(rows.cpReportUrl, 'GET', json, 5 * 60 * 1000, function (err, statusCode, data) {
                megan.log.debug(data);
            });
        }
    },
    fn_SendSms: function(rows){
        // 신규 입수 실패시에만 보고 (연결실패, 파일없음, MP4파일오류(청킹실패 등등등....)
        // channelId, contentId, cornerId, comment 보고
        var smsConf = megan.config.conf.sms;
        // if((rows.acquire == 'F') && (!megan.common.isNull(rows.comment)) && (rows.mediaVersion == 0) && (rows.reingestCnt == 0) && (rows.regDate == rows.modDate)){ // 보류
        if((rows.acquire == 'F') && (!megan.common.isNull(rows.comment)) && (rows.mediaVersion == 0) && (rows.reingestCnt == 0)){
            var mobile = rows.mobile.replace(rows.mobile.replace(/-/g, ''), /,/g, ';') + (smsConf.sendAdmin == true) ? ';' + smsConf.adminMobile : '';
            var text = "[pooq] " + rows.channelId + "/" + rows.contentId + "/" + rows.cornerId + "/" + rows.comment;
            (!megan.common.isNull(mobile)) ? megan.sms.send('SMS', megan.common.replaceBlank(mobile), text) : 0;
        }
    },
    fn_SendEmail: function(rows){
        // 입수 성공 했으나 errCode 발생 시 보고
        // 재입수시 파일없는경우 업데이트 실패 알려줌....
        // channelId, contentId, cornerId, comment, programid, title 보고
        if((rows.acquire == 'Y' && !megan.common.isNull(rows.comment)) || (rows.acquire == 'F' && rows.errCode == 'C001' && rows.mediaVersion > 0)){
            var sbj = "[pooq] 동영상 입수 에러 건";
            // var email = rows.email;
            // var arrEmail = email.split(",");
            // for (var i in arrEmail){
            //     console.error(arrEmail[i], sbj, smsTxt);
            //     megan.email.send(megan.common.replaceBlank(arrEmail[i]), sbj, "", smsTxt);
            // }
            megan.email.send(rows.email, megan.config.conf.email.adminEmail, sbj, _getText(rows), _getHtml(rows));
            var email = rows.email + ', ' + megan.config.conf.email.adminEmail;
            megan.email.send(email, sbj, _getText(rows), _getHtml(rows));
        }

        function _getHtml(data){
            var html = "channelId : " + data.channelId + "<br>";
            html += "Content ID : " + data.contentId + "<br>";
            html += "Corner ID : " + data.cornerId + "<br>";
            html += "Program ID : " + data.programId + "<br>";
            html += "Program Title : " + data.programTitle + "<br>";
            html += "Comment : " + data.comment + "<br>";
            return html;
        }

        function _getText(data){
            var text = "channelId : " + data.channelId;
            text += "Content ID : " + data.contentId;
            text += "Corner ID : " + data.cornerId;
            text += "Program ID : " + data.programId;
            text += "Program Title : " + data.programTitle;
            text += "Comment : " + data.comment;
            return text;
        }
    },


    test: function(){
        // 보고
        // http.request("www.google.co.kr", "80", "/", "GET", "test", function(data){
        //     console.error(data);
        // });
        // var email = 'mkson@captv.co.kr';
        var email = 'mkson@captv.co.kr, mkson@captv.co.kr, mkson@captv.co.kr';
        var sbj = 'test title';
        var text = "test Email";
        var arrEmail = email.split(",");
        for(var i in arrEmail){
            megan.email.send(megan.common.replaceBlank(arrEmail[i]), sbj, text);
        }
    }
};