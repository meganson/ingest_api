/**
 * Created by megan on 2017-04-27.
 */

module.exports = {
    name: 'sp_ReportJob_V3',
    setParameters: function (data) {
        return [
            {
                name: 'jobId',
                value: data.jobId
            },
            {
                name: 'bitrate',
                value: data.bitrate
            },
            {
                name: 'jobState',
                value: data.jobState
            },
            {
                name: 'jobStep',
                value: data.jobStep
            },
            {
                name: 'errCode',
                value: data.errCode
            },
            {
                name: 'playtime',
                value: data.playtime
            },
            {
                name: 'filesize',
                value: data.filesize
            },
            {
                name: 'mediaVersion',
                value: data.mediaVersion
            },
            {
                name: 'drmType',
                value: data.drmType
            },
            {
                name: 'isAdaptive',
                value: data.isAdaptive
            },
            {
                name: 'videoCodec',
                value: data.videoCodec
            },
            {
                name: 'headerModDate',
                value: data.headerModDate
            }
        ];
    },
    getResult: function(rows){
        var strReturn = {};
        if(rows.length > 0){
            if (typeof rows[0][0].result !== 'undefined') return rows[0][0];
            else {
                strReturn.result = 0;
                return strReturn;
            }
        }
        strReturn.result = 1;
        return strReturn;
    }
};
