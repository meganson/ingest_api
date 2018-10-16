/**
 * Created by megan on 2017-10-17.
 */

module.exports = {
    name: 'sp_GetAmi_V3',
    getResult: function(rows){
        var strReturn = {};
        if(rows.length > 0) {
            if (typeof rows[0][0].result !== 'undefined') return rows[0][0];
            else {
                strReturn.result = 0;
                strReturn.ver = rows[0][0].ami;
                return strReturn;
            }
        }
        strReturn.result = 1;
        return strReturn;
    }
};