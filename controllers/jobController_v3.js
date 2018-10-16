/**
 * Created by megan on 2017-04-27.
 */

var megan = require('modules');

module.exports = {
    /**
     * version 3.0
     * @param req
     * @param res
     * @param callback
     */
    getJob: function(req, res, callback){
        megan.log.debug(req.url);
        var params = megan.sp_AssignJob_V3.setParameters(req.query);
        megan.common.validateParameters(params, function(output) {
            if (output) return callback(megan.common.getParamErr(output));

            megan.db.execute(megan.sp_AssignJob_V3.name, params, function (err, rows) {
                callback(megan.sp_AssignJob_V3.getResult(rows));
                
                // // 등록 안 된 스팟 요쳥 취소
                // if(!err){
                //     if(rows[0][0].result !== 'undefined'){
                //         if(rows[0][0].result == '201'){
                //             megan.aws.describeInstance(req.query.workerId, function(err, data){
                //                 var spotInstanceReqId = data.Reservations[0].Instances[0].SpotInstanceRequestId;
                //                 if(!megan.common.isNull(spotInstanceReqId)){
                //                     megan.aws.cancelSpotInstanceRequest([spotInstanceReqId], function(err, data){});
                //                     megan.aws.terminateInstance([req.query.workerId], function (err, data) {});
                //                 }
                //             });
                //         }
                //     }
                // }
            });
        });
    },
    /**
     * 필터용 report
     * @param req
     * @param res
     * @param callback
     */
    reportMeta: function(req, res, callback){
        var self = this;
        megan.log.debug(req.url, req.body);
        var params = megan.sp_ReportMeta_V3.setParameters(req.body);
        megan.common.validateParameters(params, function(output){
            if(output) return callback(megan.common.getParamErr(output));

            megan.db.execute(megan.sp_ReportMeta_V3.name, params, function(err, rows){
                if(!err){
                    if(rows[0].length > 0){
                        switch (req.body.acquireState){
                            case 'P':
                                if(req.body.acquireStep < 1) self.fn_Report(rows[0][0]);
                                break;
                            case 'F': case 'Y':
                                self.fn_Report(rows[0][0]);
                                break;
                            default:
                                break;
                        }
                    }
                    /*
                    else{
                        var params = {
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
                        self.fn_Report(params);
                    }
                    */
                }

                callback(megan.sp_ReportMeta_V3.getResult(rows));
            });
        });
    },
    /**
     * 워커용 report
     * @param req
     * @param res
     * @param callback
     */
    reportJob: function(req, res, callback){
        var self = this;
        megan.log.debug(req.url, req.body);
        var params = megan.sp_ReportJob_V3.setParameters(req.body);
        megan.common.validateParameters(params, function(output){
            if(output) return callback(megan.common.getParamErr(output));

            megan.db.execute(megan.sp_ReportJob_V3.name, params, function(err, rows){
                if(!err){
                    if(rows.length > 0){
                        switch (req.body.jobState){
                            case 'P':
                                // 20180212 job 단위의 P 상태일 시 보고 안 함
                                // if(req.body.jobStep < 1) self.fn_Report(rows[0][0]);
                                break;
                            default:
                                if(rows[0][0].acquire != 'P') self.fn_Report(rows[0][0]);
                                break;
                        }
                    }
                }

                callback(megan.sp_ReportJob_V3.getResult(rows));
            });
        });
    },
    /**
     * functions
     * @param rows
     */
    fn_Report: function(rows){
        var self = this;
        var isRptConf = megan.config.conf.isReport;
        // procedure 처리결과 성공일 시 보고
        if(typeof rows.result === 'undefined'){
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
                    if (responseObject.message == 'success' && responseObject.returnCode == '200' &&
                        (responseObject.result.status == 'OK' || responseObject.result.status == 'Success')) {
                        params = {'reportId': rows.reportId, 'reportState': 'S'};
                        self.fn_executeReportState(params);
                        // 임시
                        console.error(rows.reportId);
                        self.fn_pooq_v3_report(rows.reportId, 'N');
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
    fn_pooq_v3_report: function(reportId, reportState){
        var params = megan.sp_pooq_set_forbackoffice.setParameters(reportId, reportState);
        megan.common.validateParameters(params, function(output){
            if(output) return;

            megan.db.execute(megan.sp_pooq_set_forbackoffice.name, params, function(err, rows){});
        });
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
            megan.email.send(rows.email, megan.config.conf.email.adminEmail, sbj, _getText(rows), _getHtml(rows));
            var email = rows.email + ', ' + megan.config.conf.email.adminEmail;
            megan.email.send(email, sbj, _getText(rows), _getHtml(rows));
        }

        function _getHtml(data){
            var html = "channel ID : " + data.channelId + "<br>";
            html += "Content ID : " + data.contentId + "<br>";
            html += "Corner ID : " + data.cornerId + "<br>";
            html += "Program ID : " + data.programId + "<br>";
            html += "Program Title : " + data.programTitle + "<br>";
            html += "Comment : " + data.comment + "<br>";
            return html;
        }

        function _getText(data){
            var text = "channel ID : " + data.channelId;
            text += "Content ID : " + data.contentId;
            text += "Corner ID : " + data.cornerId;
            text += "Program ID : " + data.programId;
            text += "Program Title : " + data.programTitle;
            text += "Comment : " + data.comment;
            return text;
        }
    },
    fn_SendSlack: function(rows){
        if(!megan.common.isUndefined(rows.channelName) && !megan.common.isNull(rows.errCode) && rows.acquire == 'F' && (rows.mediaVersion == 0) && (rows.reingestCnt == 0)){
            var channel = megan.common.toLowerCase(rows.channelName);
            channel = megan.common.replaceBlank(channel);
            channel = channel + '-' + megan.common.toLowerCase(rows.channelId);
            var message = '[' + rows.programTitle + ' / ' + rows.contentNumber + '] ' + rows.errCode + ' : ' + rows.comment;
            megan.slack.send(channel, message, {username: 'Ingest System'});
        }
    }
};
