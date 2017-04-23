var mongoose = require('mongoose');


// Schema
var hotPageSchema = new mongoose.Schema({
    _id: String,
    incId: Number,
    title: String,
    subreddit_name_prefixed: String,
    subreddit: String,
    permalink: String,
    ups: Number,
    post_hint: String,
    type: String,
    linkToScrapedFrom: String,
    scrapedFromDomain: String,
    url: String,
    domain: String,
    timestamp: Number,
    media: Object,
    over_18: Boolean,
    hotness: Number
});

hotPageSchema.statics.findNewData = function (type, gt, callback) {
    this.find({$and:[{"type":type}, {"incId": {$gt: gt}}]})
        .count()
        .exec(callback);
};



// Return model
module.exports = mongoose.model('HotPage', hotPageSchema);
