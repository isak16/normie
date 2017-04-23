var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


// MongoDB
mongoose.connect('mongodb://localhost:27017/content');

// Express
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
  //  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Routes
app.use('/api', require('./routes/api.js'));

// Start server
app.listen(3000);

console.log('API is running on port 3000');