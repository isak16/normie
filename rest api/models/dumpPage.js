
// Dependencies
var restful = require('node-restful');
var mongoose = restful.mongoose;

// Schema
var dumpPageSchema = new mongoose.Schema({
    title : String,
    albumId: String,
    linkToScrapedFrom: String,
    timestamp: Number,
    nsfw : Boolean,
    views : Number,
    images: Array,
    imagesAmount: Number
});


// Return model
module.exports = restful.model('dump', dumpPageSchema);
