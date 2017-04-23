/**
 * Created by isak16 on 2016-11-28.
 */
var request = require('request');
var mongoose = require('mongoose');
var each = require('sync-each');
var modFunc = require('./js/module');
var hotPage = require('./models/hotPage');

var autoIncId = false;
var redditArray = ["top", "r/funny", "r/pics", "r/dankmemes", "r/videos", "domain/youtube.com", "domain/imgur.com"];
var avoidReddit = ["The_Donald", "politics"];
var counterArray = 0;
var listInHot = 0;
var minUpvotes = 550;

var videosAmount = 0;
var imagesAmount = 0;
var startDate = new Date();


// MongoDB
mongoose.connect('mongodb://localhost:27017/content');

//Auto inc setup and getdata start
hotPage.findMax(function(err, res){
    if(err) throw err;
    if(!res){
        autoIncId = 0;
    }else{
        autoIncId = res.incId + 1;
    }
    getData(redditArray[counterArray], '');
});



setInterval(function(){
    counterArray = 0;
    getData(redditArray[counterArray], '');
}, 10800000);



var getDataFromReddit = function(reddit, after, callback) {
    console.log("requesting data "+reddit);
    request('https://www.reddit.com/'+reddit+'/.json?after='+after+'&limit=50', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var jsonObject = JSON.parse(body);
            callback (jsonObject);
        }else{
            console.log("retrying");
            getData(reddit, after);
        }
    });
};




function getData(subredit, after){
    getDataFromReddit (subredit, after, function(response) {
        insertDataFromReddit(response);

        setTimeout(function () {
        if(response.data.after){
            getData(subredit, response.data.after);

        }else if (response.data.after === null && redditArray.length-1 > counterArray){
            counterArray++;
            getData(redditArray[counterArray], '');
            listInHot = 0;
        }
        }, 2000);

    });
}



function insertDataFromReddit(data){
    each(data.data.children,
        function (item,next) {

            var countData = item.data;
            if(countData.post_hint === "rich:video" || modFunc.checkUrlImg(countData.url)){
                if(isNotInAvoidArray(countData.subreddit) && countData.ups >= minUpvotes) {
                    var type = modFunc.returnType(countData.post_hint, countData.url);
                    var videoJson = modFunc.returnInputObj(countData, type, listInHot, autoIncId);
                    hotPage.update({url: videoJson.url}, {$setOnInsert: videoJson}, {upsert: true}, function (err, result) {
                        if (err) {
                            throw (err)
                        } else {
                            if (result.upserted) {
                                if(countData.post_hint === "rich:video") {
                                    videosAmount++;
                                }else {
                                    imagesAmount++;
                                }
                                autoIncId++;
                                listInHot++;
                                next(null, "");
                            } else {
                                next(null, "");
                            }
                        }
                    });
                }else{
                    console.log("This reddit is avoided");
                    next(null, "");
                }
        }else{
         next(null, "");
        }
        },
        function (err) {
            console.log("\n\n\n\n\n\n");
            console.log("_____________________________________________________________________");
            console.log("start date: "+ startDate);
            console.log("videos: " + videosAmount);
            console.log("images: " + imagesAmount);
            console.log("This session: " + (videosAmount + imagesAmount));
            console.log("Total in database: " + autoIncId);
            console.log("_____________________________________________________________________");
        }
    );

}

function isNotInAvoidArray(value) {
    return avoidReddit.indexOf(value) === -1;
}
