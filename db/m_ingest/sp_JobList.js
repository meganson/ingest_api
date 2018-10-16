/**
 * Created by megan on 2016-11-02.
 */

module.exports = {
    name: 'sp_JobList',
    setParameters: function (data) {
        return [
            {
                name: 'workerId',
                value: data.workerId
            }
        ];
    },
    getResult: function(rows){
        if(rows.length > 0){
            return {
                'result': rows[0][0].result,
                'jobList': rows[1]
            };
        }
        return { 'result': 1 };
    }
};
