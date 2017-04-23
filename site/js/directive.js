app.directive('youtube', function () {
    return {
        controller: "youtubeController",
        templateUrl: './partial/media/youtube.html'
    };
});
app.directive('imagemedia', function () {
    return {
        templateUrl: './partial/media/image.html'
    };
});

app.directive('twitch', function () {
    return {
        controller: "twitchController",
        templateUrl: './partial/media/twitch.html'
    };
});

app.directive('gfycat', function () {
    return {
        controller: "gfycatController",
        templateUrl: './partial/media/gfycat.html'
    };
});

app.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
            if(event.which === 13) {
                scope.$apply(function(){
                    scope.$eval(attrs.ngEnter, {'event': event});
                });

                event.preventDefault();
            }
        });
    };
});