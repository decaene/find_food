
var express = require('express');
var app = express();

//setting middleware
app.use(express.static('restaurantes' + 'public')); //Serves resources from public folder


var server = app.listen(5000);
