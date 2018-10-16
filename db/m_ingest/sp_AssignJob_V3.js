/**
 * Created by megan on 2017-04-23.
 */

module.exports = {
    name: 'sp_AssignJob_V3',
    setParameters: function (data) {
        return [
            {
                name: 'workerId',
                value: data.workerId
            }
        ];
    },
    setFields: function(rows){

    },
    getResult: function(rows){
        var strReturn = {};
        if(rows.length > 0){
            if (typeof rows[0][0].result !== 'undefined') return rows[0][0];
            else{
                strReturn.result = 0;
                strReturn.jobList = rows[0];
                return strReturn;
            }
        }
        strReturn.result = 1;
        return strReturn;
    }
};