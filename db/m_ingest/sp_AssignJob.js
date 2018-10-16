/**
 * Created by megan on 2016-11-07.
 */

module.exports = {
    name: 'sp_AssignJob',
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
        if(rows.length > 0){
            return {
                'result': rows[1][0].result,
                'jobList': rows[0]
            };
        }
        return { 'result': 1 };
    }
};
