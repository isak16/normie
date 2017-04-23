/**
 * Created by isak16 on 2017-02-27.
 */
var app = angular.module('app', []);
var loading = false;

app.config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        'https://www.youtube.com/**',
        'https://clips.twitch.tv/**'
    ]);
});



app.controller('mainflow', function ($scope, $rootScope, $http, $q, requestData) {

    $scope.dataArr = [];
    $scope.nsfw = false;
    $scope.sourceArr = [];
    $scope.domainArr = [];
    $scope.display = {};
    $scope.input = {};
    $scope.input.type = "Reddit";



    $scope.hideReddit = [];

    if (getLocalStorage("mainflowBool") === null) {
        $scope.display.mainflow = true;
    } else {
        $scope.display.mainflow = getLocalStorage("mainflowBool");
    }
    $scope.setMainFlowBool = function () {
        $scope.display.mainflow = !$scope.display.mainflow;
        saveLocalStorage("mainflowBool", $scope.display.mainflow);
        //TODO  Append data
    };

    if (getLocalStorage("displayVideoBool") === null) {
        $scope.display.video = true;
    } else {
        $scope.display.video = getLocalStorage("displayVideoBool");
    }
    $scope.setDisplayVideoBool = function () {
        $scope.display.video = !$scope.display.video;
        saveLocalStorage("displayVideoBool", $scope.display.video);
    };

    if (getLocalStorage("displayImageBool") === null) {
        $scope.display.image = true;
    } else {
        $scope.display.image = getLocalStorage("displayImageBool");
    }
    $scope.setDisplayImageBool = function () {
        $scope.display.image = !$scope.display.image;
        saveLocalStorage("displayImageBool", $scope.display.image);
    };

    if (getLocalStorage("displayFilterBool") === null) {
        $scope.display.filter = false;
    } else {
        $scope.display.filter = getLocalStorage("displayFilterBool");
    }
    $scope.setDisplayFilterBool = function () {
        $scope.display.filter = !$scope.display.filter;
        saveLocalStorage("displayFilterBool", $scope.display.filter);
    };

    if(!$scope.display.filter){
        clearReddits();
    }

    $scope.filterMainflow = function(item) {
        return $scope.display.mainflow && item.incId || !item.incId;
    };

    $scope.filterType = function(item) {
        if($scope.display){
            return $scope.display[item.type];
        }else {
            return false;
        }
    };

    $scope.filterReddit = function (item) {
     return $scope.sourceArr.indexOf(item.subreddit.toLowerCase()) !== -1 || item.incId || item.userDomain;
    };

    $scope.filterDomain = function (item) {
     return $scope.domainArr.indexOf(item.customDomain) !== -1 || item.incId || !item.userDomain;
    };

    $scope.reset = function () {
        localStorage.clear();
        location.reload();
    };

    var reddits = getLocalStorage("reddits");
    var domains = getLocalStorage("domains");
    if(reddits) $scope.sourceArr = reddits;
    if(domains) $scope.domainArr = domains;


    $scope.removeItemReddit = function(index, item){
        $scope.sourceArr.splice(index, 1);
        saveLocalStorage("reddits", $scope.sourceArr);
    };
    $scope.removeItemDomain = function(index){
        $scope.domainArr.splice(index, 1);
        saveLocalStorage("domains", $scope.domainArr);
    };


    $scope.addSrc = function () {
        if($scope.input.type === "Reddit"){
            if($scope.sourceArr.indexOf($scope.input.source) > -1){
                $scope.err = "r/"+$scope.input.source+" already exists in source list";
                return;
            }
            $scope.sourceArr.push($scope.input.source.toLowerCase());

            saveLocalStorage("reddits", $scope.sourceArr);
            var temparr2 = [];
            temparr2.push($scope.input.source);
            $scope.input.source = "";
            //TODO  Append data
        }
        if($scope.input.type === "Domain"){
            $scope.domainArr.push($scope.input.source);
            saveLocalStorage("domains", $scope.domainArr);
            var temparr = [];
            temparr.push($scope.input.source);
            //TODO  Append data
        }
    };

    $scope.openModal = function (url) {
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
           return;
        }
        $('.enlargeImageModalSource').attr('src', url);
        $('#enlargeImageModal').modal('show');
    };

    $scope.getData = function(){
        executeAllReq(requestData, $scope.sourceArr, $scope.domainArr, $scope.display, function (callback) {
            if(callback) $scope.err = "Reddit "+callback+ " couldn't load. Please check that you spelled it right.";
            $scope.displayData($scope.sourceArr, $scope.domainArr);
            loading = false;
        });
    };

    $scope.displayData = function(sourceArr, domainArr){
        var dataArrsDom = [];
        var dataArrsSub = [];
        var amountEachSubb = Math.ceil((displayAmount/(sourceArr.length + domainArr.length)));


        var images = getSessionLocalStorage("images");
        var videos = getSessionLocalStorage("videos");

        if(images){
            dataArrsSub = dataArrsSub.concat(images);
            saveSessionLocalStorage("images", "");
        }
        if(videos){
            dataArrsSub = dataArrsSub.concat(videos);
            saveSessionLocalStorage("videos", "");
        }

        angular.forEach(sourceArr, function (value) {
            var tempData1 = getLocalStorage(value);
            if(tempData1){
                dataArrsSub = dataArrsSub.concat(getMediaFromLocalStorage(value, amountEachSubb, tempData1));
            }
        });

        angular.forEach(domainArr, function (value) {
            var tempData = getLocalStorage(value);
            if(tempData){
                dataArrsDom = dataArrsDom.concat(getMediaFromLocalStorage(value, amountEachSubb, tempData));
            }
        });

        dataArrsDom = dataArrsDom.concat(dataArrsSub);
        sessionDataArray.push(dataArrsDom);

        if(dataArrsDom.length === 0){
          //  $scope.err = "No data to display, please check your source list or try load again";
        }else{
            $scope.dataArr = sessionDataArray;
        }
    };

    $scope.removeError = function () {
        $scope.err = "";
    };


    $scope.dataType = function (type, domain) {
        if(type === "video"){
            switch(domain) {
                case "youtube.com":
                    return "youtube";
                    break;
                case "youtu.be":
                    return "youtube";
                    break;
                case "gfycat.com":
                    return "gfycat";
                    break;
                case "clips.twitch.tv":
                    return "twitch";
                    break;
                default:
                    return false;
            }
        }else if(type === "image"){
            return "image";
        }else {
            return false;
        }
    };

    $scope.getData();

    $(window).scroll(function() {
        if($(window).scrollTop() + $(window).height() > $(document).height() - 100 && !loading) {
            loading = true;
            $scope.getData();
        }
    });



});



app.controller("youtubeController", function ($scope) {
    $scope.videoId = function getYoutubeVideoId(url) {
        var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        p = (url.match(p)) ? RegExp.$1 : false;
        if(p){
            return 'https://www.youtube.com/embed/'+p+'?rel=0&autoplay=true';
        }else {
            return false;
        }
    }
});

app.controller("twitchController", function ($scope) {
    $scope.play = false;
    $scope.videoId = function getTwitchVideoId(url) {
        url = url.replace('https://clips.twitch.tv/','');
        return 'https://clips.twitch.tv/embed?clip='+url+'&autoplay=true';
    };

});


app.controller("gfycatController", function ($scope) {
    $scope.videoId = function getGfyCat(url){
        var oldUrl = url;
        oldUrl = oldUrl.replace('https://gfycat.com/','');
        return oldUrl;
    }

});

