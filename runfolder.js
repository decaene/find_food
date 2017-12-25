
var express = require('express');
var app = express();

app.use(express.static('menus'));
app.use(express.static('restaurantes'));

var server = app.listen(5000);
