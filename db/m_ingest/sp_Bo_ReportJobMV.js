/**
 * Created by Mathias on 2017-03-28.
 */

module.exports = {
    name: 'sp_Bo_ReportJobMV',
    setParameters: function (data) {
        return [
            {
                name: 'mediaId',
                value: data.mediaId
            },
            {
                name: 'drmType',
                value: data.drmType
            }
        ];
    },
    getResult: function () {

    }
};