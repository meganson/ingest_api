/**
 * Created by megan on 2017-06-19.
 */

module.exports = {
    name: 'sp_ReportWorker_V3',
    setParameters: function (data) {
        return [
            {
                name: 'workerId',
                value: data.workerId
            },
            {
                name: 'workerStatus',
                value: data.workerStatus
            }
        ];
    },
    getResult: function(rows){
        if(rows.length > 0)
            return { 'result': rows[0][0].result };
        return { 'result': 1 };
    }
};
