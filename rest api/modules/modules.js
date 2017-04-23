/**
 * Created by isak16 on 2017-03-04.
 */

module.exports.createArrSkipObjs = function (data, type) {
    if (data.length === 0) return {};
    var tempArr = [], obj, gte, lte;
    for (var i = 0; i < data.length; i++) {
        for (var p = 0; p < data[i].length; p++) {
            lte = data[i][p][type].lte;
            gte = data[i][p][type].gte;
            if (gte == null) {
                gte = 0;
            }
            if (lte == null) {
                lte = 0;
            }

            obj = {
                incId: {
                    $not: {$gt: gte, $lt: lte}
                }
            };

            tempArr.push(obj)
        }
    }

    return (tempArr);
};




