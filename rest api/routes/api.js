var express = require('express');
var router = express.Router();
var DumpPage = require('../models/dumpPage.js');
var hotPage = require('../models/hotPage.js');
var moduleFunctions = require('../modules/modules.js');
var async = require('async');

var limit = 15;


router.get('/hotPage/images/', function (req, res, next) {
    getImages(req, res, next, function(err, response) {
        if(err){
            res.status(500).send({error: 'Could not get request'});
        }else{
            res.send(response);
        }
        next();
    });
});

router.get('/hotPage/videos', function (req, res, next) {
    getVideos(req, res, next, function(err, response) {
        if(err){
            res.status(500).send({error: 'Could not get request'});
        }else{
            res.send(response);
        }
        next();
    });
});

router.get('/hotPage/both', function (req, res, next) {
    async.parallel({
        dataImages: function (cb){
            getImages(req, res, next, function(err, response) {
                cb(err, response)
            });
        },
        dataVideos: function (cb){
            getVideos(req, res, next, function(err, response) {
                cb(err, response)
            });
        }
    }, function(err, result){
        if(err){
            res.status(500).send({error: 'Could not get request'});
        }else{
            res.send(result);
        }
        next();
    });
});

module.exports = router;


function getFormatRanger(dataImg, dataVid, gt, from) {
    var tempImgHigh, tempImgLow, tempVidHigh, tempVidLow, media;

    if (from === "image") {
        if(dataImg.length === 0) return;
        tempImgHigh = Math.max(dataImg[0]["incId"], dataImg[dataImg.length - 1]["incId"]);
        tempImgLow = Math.min(dataImg[0]["incId"], dataImg[dataImg.length - 1]["incId"]);
        media = dataImg;
    }
    if (from === "video") {
        if(dataVid.length === 0) return;
        tempVidHigh = Math.max(dataVid[0]["incId"], dataVid[dataVid.length - 1]["incId"]);
        tempVidLow = Math.min(dataVid[0]["incId"], dataVid[dataVid.length - 1]["incId"]);
        media = dataVid;
    }

    return {
        media: media,
        gt: gt,
        imgHigh: tempImgHigh,
        imgLow: tempImgLow,
        vidHigh: tempVidHigh,
        vidLow: tempVidLow,
        from: from
    }
}

var getImages = function(req, res, next, callback) {
    var imgHigh = req.query.counterObj.imgHigh;
    var imgLow = req.query.counterObj.imgLow;
    if(req.query.counterObj.firstRequest){
        imgHigh = false;
        imgLow = false;
    }

    var queryArr = [{"type": "image"}];
    var options = {
        select: '',
        sort: {incId: -1},
        limit: limit,
        lean: true
    };

    async.waterfall([
        function (next) {
            //fresh request, pass to load old data
            if (!imgHigh || !imgLow) {
                next(null, -1)
            } else {
                hotPage.findNewData("image", imgHigh, function (err, data) {
                    next(err, data);
                });
            }
        },
        function (docAmount, callback) {
            //If theres are more then x "new" data to load, load them
            if (docAmount >= limit) {
                options.sort.incId = 1;
                queryArr.push({"incId": {$gt: imgHigh}});
                //If the request is not the first, load regular data
            } else if (docAmount !== -1) {
                queryArr.push(({"incId": {$lt: imgLow}}));
            }
            hotPage.find({$and: queryArr}, {}, options)
                .exec(function (err, data) {
                    callback(err, data);
                });
        },
        function (data, callback) {
            var obj = getFormatRanger(data, "", options.sort.incId, "image");
            callback(null, obj);
        }
    ], function (err, obj) {
        if (err) {
            callback(err);
        } else {
            callback(null, obj);
        }
    });
};

var getVideos = function(req, res, next, callback) {
    var vidHigh = req.query.counterObj.vidHigh;
    var vidLow = req.query.counterObj.vidLow;
    if(req.query.counterObj.firstRequest){
        vidHigh = false;
        vidLow = false;
    }
    var queryArr = [{"type": "video"}];
    var options = {
        select: '',
        sort: {incId: -1},
        limit: limit,
        lean: true
    };

    async.waterfall([
        function (next) {
            //fresh request, pass to load old data
            if (!vidHigh || !vidLow) {
                next(null, -1)
            } else {
                hotPage.findNewData("video", vidHigh, function (err, data) {
                    next(err, data);
                });
            }
        },
        function (docAmount, callback) {
            //If theres are more then x "new" data to load, load them
            if (docAmount >= limit) {
                options.sort.incId = 1;
                queryArr.push({"incId": {$gt: vidHigh}});
                //If the request is not the first, load regular data
            } else if (docAmount !== -1) {
                queryArr.push(({"incId": {$lt: vidLow}}));
            }
            hotPage.find({$and: queryArr}, {}, options)
                .exec(function (err, data) {
                    callback(err, data);
                });
        },
        function (data, callback) {
            var obj = getFormatRanger("", data, options.sort.incId, "video");
            callback(null, obj);
        }
    ], function (err, obj) {
        if (err) {
            callback(err);
        } else {
            callback(null, obj);
        }
    });
};
