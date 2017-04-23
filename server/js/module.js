var hotPage = require("../models/hotPage");


module.exports.returnInputObj = function (countData, type, listInHot, temp){
    var hotPageObj = new hotPage;
    var media = {};
    if(countData.media){
        media = countData.media;
        //        thumbnail = countData.media.oembed.thumbnail_url;
    }

    hotPageObj.subreddit_name_prefixed = countData.subreddit_name_prefixed;
    hotPageObj.subreddit = countData.subreddit;
    hotPageObj.title = countData.title;
    hotPageObj.incId = temp;
    hotPageObj.post_hint = countData.post_hint;
    hotPageObj.type = type;
    hotPageObj.permalink = countData.permalink;
    hotPageObj.url = countData.url;
    hotPageObj.domain = countData.domain;
    hotPageObj.ups = countData.ups;
    hotPageObj.timestamp = Math.floor(Date.now() / 1000);
    hotPageObj.over_18 = countData.over_18;
    hotPageObj.hotness = listInHot;
    hotPageObj.media = media;

   return hotPageObj;
};


module.exports.checkUrlImg = function (url) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
};

module.exports.returnType = function (postHint, url) {
    if(postHint === "rich:video"){
        return "video";
    }else if(this.checkUrlImg(url)){
       return "image";
    }
};