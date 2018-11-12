


var express     	=   require("express");
var app         	=   express();
var bodyParser  	=   require("body-parser");
var router      	=   express.Router();
var mongoose    	=   require('mongoose');
var MongoClient 	=   require('mongodb').MongoClient
    , format    	=   require('util').format;
var ObjectId    	=   require('mongodb').ObjectId; 
var path        	=   require('path');
var multer      	=   require('multer');
var fs          	=   require('fs');
var bodyParser  	=   require('body-parser');
var http 			= 	require('http');
var nodemailer  	=   require('nodemailer');
var smtpTransport 	= 	require('nodemailer-smtp-transport');
var handlebars 	  	= 	require('handlebars');
var socket			=   require('socket.io')(http, { path: '/findfood/socket.io'});

app.use(bodyParser({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb'}));
app.use(bodyParser());

app.use('/menus', express.static('menus'));
app.use('/restaurantes', express.static('restaurantes'));
app.use('/promociones', express.static('promociones'));
app.use('/publicaciones', express.static('publicaciones'));
app.use('/restaurantes_cover', express.static('restaurantes_cover'));
app.use('/restaurantes_documentos', express.static('restaurantes_documentos'));
app.use('/combos', express.static('combos'));
app.use('/usuario', express.static('usuario'));

var readHTMLFile = function(path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};


var storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.originalname.replace(path.extname(file.originalname), "") + '-' + Date.now() + path.extname(file.originalname))
  }
})

var upload = multer({ storage: storage });


var server = app.listen(3003, () => {
    console.log('Find food en:3003');
});

var io = socket.listen(server);

// IO SOCKETS

// Set socket.io listeners.
io.of('/passmovilidad/');
io.on('connection', (socket) => {
    console.log('Usuario esta viendo FindFood');

    socket.on('join', function(data) { //Listen to any join event from connected users
        socket.user_id = data._id;
        socket.email   = data.email;

        socket.join(data._id);
        // socket.join(data._id); User joins a unique room/channel that's named after the userId 
        // console.log("User joined room: " + data.user_id);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado de FindFood');
    });
});

// IO SOCKETS

// Add Security Headers
  
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
}); 

// Add Security Headers


// FUNCTIONS 

function getDistanceFromLatLonInKm (lat1,lon1,lat2,lon2) {
    	var R = 6371; // Radius of the earth in km
		var dLat = deg2rad(lat2-lat1);  // deg2rad below
		var dLon = deg2rad(lon2-lon1); 
		var a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
			Math.sin(dLon/2) * Math.sin(dLon/2)
			; 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c; // Distance in km
		return d;
	}

function  deg2rad (deg) {
	return deg * (Math.PI/180)
}

function random_password() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function publicacion_like(publicacion, usuario){
	var liked = 0;
	var liked_id = "";
	for( var i = 0; i<publicacion.likes.length; i++){
		if(publicacion.likes[i].usuario_id.toString().trim() === usuario._id.toString().trim()){
			liked = 1;
			liked_id = publicacion.likes[i]._id;
		}else{
			liked = 0;
		}
	}
	
	if( liked === 1){
		publicacion.like = true;
		publicacion.like_icon 	= "brand/like_icon_color.png";
		publicacion.liked_id 	= liked_id;
	}else{
		publicacion.like = false;
		publicacion.like_icon 	= "brand/like_icon.png";
		publicacion.liked_id 	= liked_id;
	}
	return publicacion;
}

function publicacion_no_ver_mas(publicacion, usuario){
	var no_ver_mas = 0;
	for( var i = 0; i<publicacion.no_ver_mas.length; i++){
		if(publicacion.no_ver_mas[i].usuario_alta.toString().trim() === usuario._id.toString().trim()){
			no_ver_mas = 1;
		}else{
			no_ver_mas = 0;
		}
	}
	
	if( no_ver_mas === 1){
		publicacion.no_ver_mas_bol = true;
	}else{
		publicacion.no_ver_mas_bol = false;
	}
	return publicacion;
}

// FUNCTIONS

// Database Mongo Connection //

var datb;
MongoClient.connect('mongodb://127.0.0.1:27017/find_food', function(err, db) {
    if(err) throw err;
    datb = db;
});

// Database Mongo Connection //

// Router and Routes

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false}));

router.get("/",function(req,res){
    res.json({"error" : false,"message" : "Hello World11"});
});

router.post("/nuev_proximamente",function(req,res){
    var collection	=  datb.collection('Proximamente');
    collection.insert(req.body.data, function(err, result) {
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }
        else{
            result.status  = "success";
			result.message = "C - OK";
			res.send(result);
        }
    });
});

app.use('/',router);
