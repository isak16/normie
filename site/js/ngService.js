/**
 * Created by isak16 on 2017-03-02.
 */

app.service('requestData', function ($http) {


    var request = {
        request: function (input, callback) {
            var params = '';
            if (input.counterObj) params = {"counterObj": input.counterObj};
            $http({
                method: 'GET',
                url: input.url,
                params: params,
                paramSerializer: '$httpParamSerializerJQLike'
            }).then(function (response) {
                callback(null, {response: response, reddit: !params, from: input.from, domain: input.domain});
            }, function (error) {
                callback(error);
            });

        }
    };

    return request;


});

