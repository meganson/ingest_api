/**
 * Created by megan on 2016-10-27.
 */

module.exports = {
    name: 'sp_MetaInsert',
    setParameters: function (data) {
        return [
            {
                name: 'workerId',
                value: data.workerId
            }
        ];
    }
};
