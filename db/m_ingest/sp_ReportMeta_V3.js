/**
 * Created by megan on 2017-04-27.
 */

module.exports = {
    name: 'sp_ReportMeta_V3',
    setParameters: function (data) {
        return [
            {
                name: 'mediaId',
                value: data.mediaId
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
                name: 'filesize',
                value: data.filesize
            },
            {
                name: 'headerModDate',
                value: data.headerModDate
            }
        ];
    },
    getResult: function(rows){
        var strReturn = {};
        // if(!err){
            if(rows[0].length > 0) {
                if (typeof rows[0][0].result !== 'undefined') return rows[0][0];
                else{
                    strReturn.result = 0;
                    return strReturn;
                }
            }
            strReturn.result = 0;
            return strReturn;
        // }
        // strReturn.result = 1;
        // return strReturn;
    }
};
