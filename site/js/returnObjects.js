/**
 * Created by isak16 on 2017-03-02.
 */

function returnVideoObject(obj, from, domain) {
    var type;
    if (obj.post_hint === "rich:video") {
        type = "video";
    } else if (checkUrlImage(obj.url)) {
        type = "image";
    }

    var media = {};
    if (obj.media) {
        media = obj.media;
    }

    return {
        "subreddit_name_prefixed": obj.subreddit_name_prefixed,
        "title": obj.title,
        "subreddit": obj.subreddit,
        "type": type,
        "url": obj.url,
        "permalink": obj.permalink,
        "post_hint": obj.post_hint,
        "domain": obj.domain,
        "ups": obj.ups,
        "timestamp": Math.floor(Date.now() / 1000),
        "over_18": obj.over_18,
        "media": media,
        "customDomain": from,
        "userDomain": domain
    };
}

var executeAllReq = function (requestData, reddits, domains, displayBool, callback) {
    var sourceObj = {
        subreddits: reddits,
        domains: domains
    };

    var loadTheseSubs = shouldWeLoadMoreData(sourceObj.subreddits, "r");
    var type = requestTypeFromBools(displayBool);
    var counterObj = getLocalStorage("counterObj");

    var urls = [];

    type = reqLowData(counterObj, type);

    //add mainflow
    if (type) {
        if(!counterObj) counterObj = {firstRequest: true};
        var url1 = 'http://normie.tv:3000/api/hotpage/'+type;

        urls.push({
            url: url1,
            counterObj: counterObj,
            from: type
        });
    }
    //add subs
    for(var p = 0; p < loadTheseSubs.length; p++){
        var sourceData = getLocalStorage(loadTheseSubs[p]), after = "";
        if(sourceData)after = sourceData.after;
        var url = 'https://www.reddit.com/r/' + loadTheseSubs[p] + '/hot/.json?after=' + after + '&limit=50';
        urls.push({
            url: url,
            from: loadTheseSubs[p],
            domain: false
        });
    }
    //add domain requests
    for (var i = 0; i < sourceObj.domains.length; i++) {
        if (shouldWeLoadMoreData(sourceObj.domains[i], "domain")) {
            var sourceData = getLocalStorage(sourceObj.domains[i]), after = "";
            if(sourceData)after = sourceData.after;
            var url = 'https://www.reddit.com/domain/' + sourceObj.domains[i] + '/hot/.json?after=' + after + '&limit=50';
            urls.push({
                url: url,
                from: sourceObj.domains[i],
                domain: true
            });
        }
    }
    console.log(urls);
    async.map(urls, requestData.request, function(err, results){
        if (err){
            var String=err.config.url.substring(err.config.url.lastIndexOf("com/")+4,err.config.url.lastIndexOf("/hot"));
            callback(String);
        } else {
            angular.forEach(results, function (value) {
                if(value.reddit){
                    var obj = {after: value.response.data.data.after, data: getMediaOnly(value.response.data.data.children, value.from, value.domain)};

                    saveLocalStorage(value.from, obj);
                }else{
                    saveResponseLocal(value.from, value.response);
                }
            });
            callback("");
        }
    });


};

function shouldWeLoadMoreData(sourceName, from) {
    if (from === "r") {
        var tempArr = [];
        for (var i = 0; i < sourceName.length; i++) {
            var sourceObj = getLocalStorage(sourceName[i]);
            if (sourceObj === null || sourceObj.data.length <= dataLimitLoadMore) {
                tempArr.push(sourceName[i]);
            }
        }
        return tempArr;
    }
    if (from === "domain") {
        var domainObj = getLocalStorage(sourceName);
        return (domainObj === null || domainObj.data.length <= dataLimitLoadMore);
    }
}

function getMediaFromLocalStorage(source, amount, tempData) {
    var tempArr = tempData.data.slice(0, amount);
    tempData.data.splice(0, amount);
    saveLocalStorage(source, tempData);

    return tempArr;
}

function requestTypeFromBools(displayBool) {
    if(!displayBool)return false;
    if(!displayBool.mainflow) return false;

    if (displayBool.image && !displayBool.video) {
        return "images";
    } else if (!displayBool.image && displayBool.video) {
        return "videos";
    } else if (!displayBool.image && !displayBool.video) {
        return false;
    } else {
        return "both";
    }
}

function saveCounterObj(data) {
    var obj = getLocalStorage("counterObj");
    if (!obj) {
        obj = {};
    }
    if (!obj.imgHigh || !obj.imgLow) {
        obj.imgHigh = data.imgHigh;
        obj.imgLow = data.imgLow;
    }
    if (!obj.vidHigh || !obj.vidLow) {
        obj.vidHigh = data.vidHigh;
        obj.vidLow = data.vidLow;
    }

    var tempObj = {};
    if (data.from === "video") {
        tempObj.imgHigh = obj.imgHigh;
        tempObj.imgLow = obj.imgLow;
        if (data.gt !== -1) {
            tempObj.vidHigh = data.vidHigh;
            tempObj.vidLow = obj.vidLow;
        } else {
            tempObj.vidHigh = obj.vidHigh;
            tempObj.vidLow = data.vidLow;
        }

    } else if (data.from === "image") {
        tempObj.vidHigh = obj.vidHigh;
        tempObj.vidLow = obj.vidLow;
        if (data.gt !== -1) {
            tempObj.imgHigh = data.imgHigh;
            tempObj.imgLow = obj.imgLow;
        } else {
            tempObj.imgHigh = obj.imgHigh;
            tempObj.imgLow = data.imgLow;
        }
    }
    saveLocalStorage("counterObj", tempObj);
}

function saveResponseLocal(type, response) {
    if(type === "both"){
        saveSessionLocalStorage("images", response.data.dataImages.media);
        saveSessionLocalStorage("videos", response.data.dataVideos.media);
        saveCounterObj(response.data.dataImages);
        saveCounterObj(response.data.dataVideos);
    }else{
        saveSessionLocalStorage(type, response.data.media);
        saveCounterObj(response.data);
    }
}

function reqLowData(obj, type) {
    if(!type || !obj)return type;
    if(type === "both"){
        if(obj.vidLow < 26){
            if(obj.imgLow < 26){
                return false;
            }else {
                return "images";
            }
        }else if(obj.imgLow < 26){
            if(obj.vidLow < 26){
                return false;
            }else {
                return "videos";
            }
        }else {
            return type;
        }
    }

    if(type === "images" && obj.imgLow < 26){
        return false;
    }
    if(type === "videos" && obj.vidLow < 26){
        return false;
    }

    return type;
}