/**
 * Created by isak16 on 2017-02-11.
 */
var MongoClient = require('mongodb').MongoClient;
var request = require('request');
var mongoUrl = 'mongodb://127.0.0.1:27017/content';
var counter = 1;

getDataGoogle();



function getDataGoogle(){

    if(counter >= 1000){
        console.log("Done, max api usage maxed");
        return
    }

    var url = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyAgQpqBpwHjCD1C7uVPO-lEJ4Yw4BF5djU&cx=014507143985239295906:qpkcjqbwpdy&q=dump%20OR%20dumperino&start='+counter;
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            var data = JSON.parse(body);
            for (var i = 0; i < data.items.length; i++) {

                var countData = data.items[i];

                var val = countData.link;
                var id_array = val.split('/');
                var albumId = id_array[id_array.length - 1];

                var videoJson = {
                    "title" : countData.title,
                    "albumId": albumId,
                    "linkToScrapedFrom": false,
                    "timestamp": Math.floor(Date.now() / 1000),
                    "nsfw" : false,
                    "views" : false,
                    "poster": false,
                    "images": false,
                    "imagesAmount": 0
                };

                insertImgurDataFromGoogle(videoJson);
            }

            setTimeout(function(){
                counter +=10;
                getDataGoogle();
            }, 3000);

        }else{

        }
    });

}


function insertImgurDataFromGoogle(data){
    console.log("inserting data");
    MongoClient.connect(mongoUrl, function(err, db) {
        if(err){
            console.log("mongoerror", err);
            return;
        }
        var collection = db.collection("dumps");

            collection.update({ albumId : data.albumId }, data, { upsert: true }, function(err, result){
                if(err){ console.log(err)
                }else{
                    if(result.result.upserted){
                        console.log("*****Fresh meme added*****");

                        getDataFromImgur (data.albumId, function(response) {
                            insertDataFromImgur(response, data.albumId);
                        });

                    }else{
                        console.log("*******Old meme skipped*******");
                    }
                }
            });


        })
}




var getDataFromImgur = function(id, callback) {
    var options = {
        url: 'https://api.imgur.com/3/album/'+id,
        headers: {
            'Authorization': 'Client-ID 5aba07920baf85c'
        }
    };
    request(options, handleData);

    function handleData(error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);
            callback(data);
        }
    }


};



function insertDataFromImgur(data, albumId){


    MongoClient.connect(mongoUrl, function(err, db) {
    var collection = db.collection("dumps");



    var countData = data.data;


        if(!data.success || countData.images.length  < 10 || !countData.images){
            collection.remove( {"albumId": albumId});
            console.log("No data / low data: "+albumId);
            return;
        }


        var videoJson = {
        "title" : countData.title,
        "albumId": albumId,
        "linkToScrapedFrom": countData.link,
        "timestamp": Math.floor(Date.now() / 1000),
        "nsfw" : countData.nsfw,
        "views" : countData.views,
        "poster": countData.account_url,
        "images": countData.images,
        "imagesAmount": countData.images.length
    };

    collection.update({ albumId : albumId }, videoJson, { upsert: true }, function(err, result){
        if(err){ console.log(err)
        }else{
                console.log("Dump REFRESHED");
        }
    });


    });
}
