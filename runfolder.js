
var express = require('express');
var app = express();

app.use('/static', express.static('menus'));

var server = app.listen(5000);
