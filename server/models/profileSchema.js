/**
 * Created by isak16 on 2017-03-30.
 */
var mongoose = require('mongoose');

// Schema
var profileSchema = new mongoose.Schema({
    _id: String,
    username: String,
    password: String,
    name: String
});

// Return model
module.exports = mongoose.model('Profile', profileSchema);
