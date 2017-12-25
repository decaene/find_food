
var express = require('express');
var app = express();

app.use('/img_platillos', express.static('menus'));
app.use('/img_restaurantes', express.static('restaurantes'));

var server = app.listen(5000);
