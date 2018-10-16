/**
 * Created by megan on 2018-01-19.
 */


module.exports = {
    name: 'sp_pooq_set_forbackoffice',
    setParameters: function (reportId, reportState) {
        return [
            {
                name: 'reportId',
                value: reportId
            },
            {
                name: 'reportState',
                value: reportState
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