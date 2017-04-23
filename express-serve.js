/**
 * Created by isak16 on 2017-04-10.
 */
var express = require('express');
var app = express();


app.use(express.static('site'));

app.listen(80);