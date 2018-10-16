/**
 * Created by megan on 2016-11-02.
 */

module.exports = {
    name: 'sp_ReportJob',
    setParameters: function (data) {
        return [
            {
                name: 'mediaId',
                value: data.mediaId
            },
            {
                name: 'bitrate',
                value: data.bitrate
            },
            {
                name: 'acquireState',
                value: data.acquireState
            },
            {
                name: 'acquireStep',
                value: data.acquireStep
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
        if(rows.length > 0){
            return {
                'result': rows[0].result
            };
        }
        return {
            'result': 1
        };
    }
};
