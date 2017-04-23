var mongoose = require('mongoose');
var async = require('async');

// MongoDB
mongoose.connect('mongodb://localhost:27017/content');

var hotPage = require('./models/hotPage.js');

var counter = 0;

/*
hotPage.update({}, {$set: {incId: 0}}, {multi: true}, function(err, result){
    console.log(err);
    console.log(result);
});
*/
/*
hotPage.find({}, {}, {}, function (err, data) {

    update();

    function update(){
        if(counter > data.length-1){
            console.log("done");
            return;
        }
        console.log(data[counter]["_id"]);
        hotPage.update(data[counter]["_id"], {$set : {"incId": counter }}, false, function(err, result){
            console.log(counter);
            console.log(result);
            console.log(err);

            counter++;
            update();
        });
    }


});
*/

//hotPage.find().forEach( function(myDoc) { print( "user: " + myDoc ); } );



var q = async.queue(function (doc, callback) {

    // code for your update
    hotPage.update({
        _id: doc._id
    }, {
        $set: {incId: counter}
    }, {
        multi: false
    }, callback);
counter++;
}, Infinity);

var cursor = hotPage.find({});

cursor.stream()
    .on('data', function(doc){
        q.push(doc);
    })
    .on('error', function(err){
        // handle error
    })
    .on('end', function(){
        // final callback
        cursor.isClosed = true;
        console.log("asd");
    });
