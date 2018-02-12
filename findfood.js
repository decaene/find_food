


var express     =   require("express");
var app         =   express();
var bodyParser  =   require("body-parser");
var router      =   express.Router();
var mongoose    =   require('mongoose');
var MongoClient =   require('mongodb').MongoClient
    , format    =   require('util').format;
var ObjectId    =   require('mongodb').ObjectId; 
var path        =   require('path');
var multer      =   require('multer');
var fs          =   require('fs');
var bodyParser  =   require('body-parser');
var http 		= 	require('http');
// var dateFormat  =   require('dateformat');
// var moment      =   require('moment');
// var QRCode      =   require('qrcode');
// var gcm         =   require('node-gcm');
// var apn         =   require('apn');
var nodemailer  	=   require('nodemailer');
var smtpTransport 	= 	require('nodemailer-smtp-transport');
var handlebars 	  	= 	require('handlebars');

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

var io = require('socket.io')(server);

// IO SOCKETS

// Set socket.io listeners.
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
		var dLat = $scope.deg2rad(lat2-lat1);  // deg2rad below
		var dLon = $scope.deg2rad(lon2-lon1); 
		var a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos($scope.deg2rad(lat1)) * Math.cos($scope.deg2rad(lat2)) * 
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

router.post("/nuevo_usuario",function(req,res){
    var collection                  = datb.collection('Usuario');
    var email_register              = req.body.data.email;
    req.body.data.tipo_id          = new ObjectId(req.body.data.tipo_id);

    collection.find( { "email" : email_register } ).toArray(function(err, result){  
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }
        else{
            if(result.length === 0){
                collection.insert(req.body.data, function(err, result) {
                    if(err){
                        var res_err      = {};
                        res_err.status   = "error";
                        res_err.error    = err;
                        res_err.message  = err;
                        res.send(res_err);
                    }
                    else{
                        console.log(result.insertedIds[0]);
                        result.status = "success";
                        res.send(result);
                        // res.send(req.body);
                    }
                });
            }else{
                var res_err      = {};
                res_err.status   = "info";
                res_err.message  = "Este correo electrónico ya fue registrado anteriormente.";
                res.send(res_err);
            }
        }
    });
});

router.post("/recuperar_contrasena",function(req,res){
	var collection	     = datb.collection('Usuario');
	var nueva_contrasena = random_password();
    collection.update(
		{ 'email' : req.body.data.email }, 
		{ $set: { 'contrasena' : nueva_contrasena 
		} },
		function(err, result){  
			if(err){
				var res_err      = {};
				res_err.status   = "error";
				res_err.error    = err;
				res_err.message  = err;
				res.send(res_err);
			}
			else{
				
				var message = "<b> Test de correo </b>";
				let transporter = nodemailer.createTransport({
					host: 'smtp.gmail.com',
					port: 587,
					secure: false, // true for 465, false for other ports
					auth: {
						user: 'alanbarreraff@gmail.com', // generated ethereal user
						pass: 'pbo031117'  // generated ethereal password
					}
				});
				let mailOptions = {
					from: 'alanbarreraff@gmail.com', // sender address
					to: 'alanbarreraf@hotmail.com', // list of receivers
					subject: 'Recupera tu contraseña', // Subject line
					text: 'Hello world?', // plain text body
					html: message // html body
				};
				
				readHTMLFile('plantillas_correo/test.html', function(err, html) {
					var template = handlebars.compile(html);
					var replacements = {
						 user_p			: req.body.data.nombre,
						 contrasena_p	: nueva_contrasena
					};
					var htmlToSend = template(replacements);
					var mailOptions = {
						from: 'alanbarreraff@gmail.com', // sender address
						to: req.body.data.email, // list of receivers
						subject: 'Recupera tu contraseña', // Subject line
						text: 'Recupera tu contraseña', // plain text body
						html: htmlToSend // html body
					 };
					transporter.sendMail(mailOptions, (error, info) => {
						if (error) {
							return console.log(error);
						}
						console.log('Message sent: %s', info.messageId);
						console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
						
						res.json({"mail" : true,"message" : "Hello World"});
					});
				});
				result.status  = "success";
				result.message = "Contraseña actualizada";
				res.send(result);
			}
	});
});

router.post("/inicio_con_facebook",function(req,res){
    var collection                  = datb.collection('Usuario');
    req.body.data.tipo_id          = new ObjectId(req.body.data.tipo_id);

    collection.find( { "fb_id" : req.body.data.fb_id } ).toArray(function(err, result){  
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }
        else{
            if(result.length === 0){
                collection.insert(req.body.data, function(err, result) {
                    if(err){
                        var res_err      = {};
                        res_err.status   = "error";
                        res_err.error    = err;
                        res_err.message  = err;
                        res.send(res_err);
                    }
                    else{
                        collection.find( { "fb_id" : req.body.data.fb_id } ).toArray(function(err, result2){  
							if(err){
								var res_err      = {};
								res_err.status   = "error";
								res_err.error    = err;
								res_err.message  = err;
								res.send(res_err);
							}
							else{
								var res_data      = {};
								res_data.status   = "success";
								res_data.message  = "Bienvenido a FindFood. ¡Disfruta tu comida!";
								res_data.data     = result2[0];
								res.send(res_data);
							}
						});
                    }
                });
            }else{
                var res_data      = {};
                res_data.status   = "success";
                res_data.message  = "Bienvenido a FindFood. ¡Disfruta tu comida!";
                res_data.data     = result[0];
                res.send(res_data);
            }
        }
    });
});

router.post("/autenticacion",function(req,res){
    var name_collection = "Usuario";
    var email_login     =  req.body.data.email;
    var password_login  =  req.body.data.contrasena;

    var collection      = datb.collection('Usuario');
    collection.aggregate([
        { $match : { "email" : email_login, "contrasena" : password_login } },
        { $lookup: { from: "Tipo_Usuario", localField: "tipo_id",    foreignField: "_id",        as: "tipo_usuario" } },
        { $lookup: { from: "Restaurante",  localField: "_id",        foreignField: "usuario_id", as: "restaurantes" } },
		{ $lookup: { from: "Ubicaciones",  localField: "_id",        foreignField: "usuario_id", as: "ubicaciones" } }
    ]).toArray(function(err, result){  
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }
        if(result.length === 0){
            var res_err      = {};
            res_err.status   = "info";
            res_err.message  = "Correo electrónico o contraseña equivocada.";
            res.send(res_err);
        }else{
            if(result[0].status != 1){
                var res_data      = {};
                res_data.status   = "info";
                res_data.message  = "Tu cuenta esta inactiva, para mas información contacta soporte.";
                res_data.data     = result[0];
                res.send(res_data);
            }else{
                var res_data      = {};
                res_data.status   = "success";
                res_data.message  = "Bienvenido a FindFood. ¡Disfruta tu comida!";
                res_data.data     = result[0];
                res.send(res_data);
            }
        }
    });
});

router.post("/get_tipo_comida",function(req,res){
    var collection      = datb.collection('Tipo_Comida');
    collection.aggregate([
        { $sort : { "descripcion" : 1 } }
    ]).toArray(function(err, result){  
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }else{
            var res_data      = {};
            res_data.status   = "success";
            res_data.message  = "Tipos de comida";
            res_data.data     = result;
            res.send(res_data);
        }
    });
});

router.post("/get_ubicaciones_usuario",function(req,res){
    var collection      = datb.collection('Ubicacion');
    collection.aggregate([
        { $match:  { "usuario_id" : ObjectId(req.body.usuario._id) } },
    ]).toArray(function(err, result){  
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }else{
            var res_data      = {};
            res_data.status   = "success";
            res_data.message  = "Ubicaciones";
            res_data.data     = result;
            res.send(res_data);
        }
    });
});

router.post("/get_cupones_usuario",function(req,res){
    var collection      = datb.collection('Cupon');
    collection.aggregate([
        { $match:  { "usuario_id" : ObjectId(req.body.usuario._id) } },
    ]).toArray(function(err, result){  
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }else{
            var res_data      = {};
            res_data.status   = "success";
            res_data.message  = "Cupones";
            res_data.data     = result;
            res.send(res_data);
        }
    });
});

router.post("/get_credito_usuario",function(req,res){
    var collection      = datb.collection('Credito');
    collection.aggregate([
        { $match:  { "usuario_id" : ObjectId(req.body.usuario._id) } },
    ]).toArray(function(err, result){  
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }else{
            var res_data      = {};
            res_data.status   = "success";
            res_data.message  = "Creditos";
            res_data.data     = result;
            res.send(res_data);
        }
    });
});

router.post("/get_categoria_platillo",function(req,res){
    var collection      = datb.collection('Categoria_Platillo');
    collection.aggregate([
		{ $match:  { "restaurante_id" : ObjectId(req.body.data._id) } },
        { $sort : { "descripcion" : 1 } }
    ]).toArray(function(err, result){  
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }else{
            var res_data      = {};
            res_data.status   = "success";
            res_data.message  = "Categoria platillo";
            res_data.data     = result;
            res.send(res_data);
        }
    });
});

router.post("/get_adicional_platillo",function(req,res){
    var collection      = datb.collection('Adicional_Platillo');
    collection.aggregate([
		{ $match:  { "restaurante_id" : ObjectId(req.body.data._id) } },
        { $sort : { "descripcion" : 1 } }
    ]).toArray(function(err, result){  
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }else{
            var res_data      = {};
            res_data.status   = "success";
            res_data.message  = "Adicional platillo";
            res_data.data     = result;
            res.send(res_data);
        }
    });
});

router.post("/get_detalles_restaurante",function(req,res){
    var collection      = datb.collection('Detalles_Restaurante');
    collection.aggregate([]).toArray(function(err, result){  
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }else{
            var res_data      = {};
            res_data.status   = "success";
            res_data.message  = "Detalles Restaurante";
            res_data.data     = result;
            res.send(res_data);
        }
    });
});

router.post("/get_restaurante_by_id",function(req,res){
    var collection      = datb.collection('Restaurante');
    collection.aggregate([
		{ $match:  { "_id" : ObjectId(req.body.data._id) } }
	]).toArray(function(err, result){  
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }else{
            var res_data      = {};
            res_data.status   = "success";
            res_data.message  = "Restaurante";
            res_data.data     = result;
            res.send(res_data);
        }
    });
});

router.post("/get_restaurantes_usuario",function(req,res){
    console.log(ObjectId(req.body.data._id));
    var collection       =  datb.collection("Restaurante");
    collection.aggregate([
        { $lookup: { from: "Menu", localField: "_id", foreignField: "restaurante_id", as: "menu" } },
		{ $lookup: { from: "Promocion", localField: "_id", foreignField: "restaurante_id", as: "promociones" } },
		{ $lookup: { from: "Publicacion", localField: "_id", foreignField: "restaurante_id", as: "publicaciones" } },
        { $match:  { "usuario_id" : ObjectId(req.body.data._id) } }
    ]).toArray(function(err, result){ 
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }
        else{
            var res_data      = {};
            res_data.status   = "success";
            res_data.message  = "Restaurantes";
            res_data.data     = result;
            res.send(res_data);
        }
    });
});

router.post("/get_restaurante_menu",function(req,res){
    var collection       =  datb.collection("Menu");
    collection.aggregate([
        { $match:  { "restaurante_id" : ObjectId(req.body.data._id) } }
    ]).toArray(function(err, result){ 
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }
        else{
            var res_data      = {};
            res_data.status   = "success";
            res_data.message  = "Menu";
            res_data.data     = result;
            res.send(res_data);
        }
    });
});

router.post("/get_restaurante_combos",function(req,res){
    var collection       =  datb.collection("Combo");
    collection.aggregate([
        { $match:  { "restaurante_id" : ObjectId(req.body.data._id) } }
    ]).toArray(function(err, result){ 
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }
        else{
            var res_data      = {};
            res_data.status   = "success";
            res_data.message  = "Combos";
            res_data.data     = result;
            res.send(res_data);
        }
    });
});

router.post("/get_restaurante_ofertas",function(req,res){
    var collection       =  datb.collection("Oferta");
    collection.aggregate([
        { $match:  { "restaurante_id" : ObjectId(req.body.data._id) } }
    ]).toArray(function(err, result){ 
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }
        else{
            var res_data      = {};
            res_data.status   = "success";
            res_data.message  = "Ofertas";
            res_data.data     = result;
            res.send(res_data);
        }
    });
});

router.post("/get_restaurantes_publicaciones",function(req,res){
    var collection       =  datb.collection("Publicacion");
	// "tipo_uid": new ObjectId("5a24a415b0881016f70801e7")
    collection.aggregate([
		{ $lookup: { from: "Restaurante", localField: "restaurante_id", foreignField: "_id", as: "restaurante" } },
		{ $lookup: { from: "Comentario_Publicacion", localField: "_id", foreignField: "publicacion_id", as: "comentarios" } },
        { $unwind: { path: "$restaurante"  } },
        { $lookup: { from: "Categoria_Platillo", localField: "restaurante._id", foreignField: "restaurante_id", as: "restaurante.categorias" } },
        { $lookup: { from: "Menu", localField: "restaurante._id", foreignField: "restaurante_id", as: "restaurante.menu" } },
        { $lookup: { from: "Oferta", localField: "restaurante._id", foreignField: "restaurante_id", as: "restaurante.oferta" } },
        { $lookup: { from: "Combo", localField: "restaurante._id", foreignField: "restaurante_id", as: "restaurante.combo" } },
		{ $lookup: { from: "Comentario_Restaurante", localField: "restaurante._id", foreignField: "restaurante_id", as: "restaurante.comentarios" } },
		{ $lookup: { from: "Like", localField: "_id", foreignField: "publicacion_id", as: "likes" } },
    ]).toArray(function(err, result){ 
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }
        else{
			
			for(var i = 0; i < result.length; i++){
				collection.findOne({ "usuario_id" : ObjectId(req.body.data.usuario_id), "publicacion_id" : ObjectId(result[i].id) })
				.toArray(function(err, its_liked_by_user){ 
					if(err){
						var res_err      = {};
						res_err.status   = "error";
						res_err.error    = err;
						res_err.message  = err;
						res.send(res_err);
					}
					else{
						if(its_liked_by_user.length > 0){
							result[i].like = true;
							result[i].like_icon = "brand/like_icon_color.png";
						}else{
							result[i].like = false;
							result[i].like_icon = "brand/like_icon.png";
						}
					}
				});
			}
            
			var res_data      = {};
            res_data.status   = "success";
            res_data.message  = "Restaurantes";
            res_data.data     = result;
            res.send(res_data);
        }
    });
});

router.post("/get_restaurantes_publicaciones_by_id",function(req,res){
    var collection       =  datb.collection("Publicacion");
	// "tipo_uid": new ObjectId("5a24a415b0881016f70801e7")
    collection.aggregate([
		{ $match:  { "restaurante_id" : ObjectId(req.body.data._id) } },
		{ $lookup: { from: "Restaurante", localField: "restaurante_id", foreignField: "_id", as: "restaurante" } },
    ]).toArray(function(err, result){ 
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }
        else{
            var res_data      = {};
            res_data.status   = "success";
            res_data.message  = "Publicaciones";
            res_data.data     = result;
            res.send(res_data);
        }
    });
});

router.post("/get_comentarios_publicacion",function(req,res){
    var collection       =  datb.collection("Comentario_Publicacion");
    collection.aggregate([
		{ $match:  { "publicacion_id" : ObjectId(req.body.data._id) } },
		{ $lookup: { from: "Usuario", localField: "usuario_alta", foreignField: "_id", as: "usuario" } }
    ]).toArray(function(err, result){ 
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }
        else{
            var res_data      = {};
            res_data.status   = "success";
            res_data.message  = "Comentarios";
            res_data.data     = result;
            res.send(res_data);
        }
    });
});

router.post("/get_restaurantes_publicaciones_by_publicacion_id",function(req,res){
    var collection       =  datb.collection("Publicacion");
	// "tipo_uid": new ObjectId("5a24a415b0881016f70801e7")
    collection.aggregate([
		{ $match:  { "_id" : ObjectId(req.body.data._id) } },
		{ $lookup: { from: "Restaurante", localField: "restaurante_id", foreignField: "_id", as: "restaurante" } },
    ]).toArray(function(err, result){ 
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }
        else{
            var res_data      = {};
            res_data.status   = "success";
            res_data.message  = "Publicación individual";
            res_data.data     = result;
            res.send(res_data);
        }
    });
});

router.post("/get_restaurantes_feed",function(req,res){
    var collection       =  datb.collection("Restaurante");
    collection.aggregate([
        { $lookup: { from: "Menu", localField: "_id", foreignField: "restaurante_id", as: "menu" } }
    ]).toArray(function(err, result){ 
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }
        else{
            var res_data      = {};
            res_data.status   = "success";
            res_data.message  = "Restaurantes";
            res_data.data     = result;
            res.send(res_data);
        }
    });
});

router.post("/testing_files",function(req,res){
	console.log(req.body);
	console.log(req.files);
	var res_err      = {};
	res_err.status   = "error";
	res_err.message  = "Test";
	res.send(res_err);
});

router.post("/nuevo_restaurante",function(req,res){
    var collection           =  datb.collection('Restaurante');
    var restaurante          =  req.body.data;
    var foto_restaurante     =  req.body.data.foto;
	var cover_restaurante    =  req.body.data.cover;
    var menu                 =  req.body.data.menu;
    restaurante.foto         =  "";
    restaurante.menu         =  [];
    restaurante.usuario_id   =  ObjectId(req.body.data.usuario_id);
    collection.insert(restaurante, function(err, result) {
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }
        else{
            console.log(result.insertedIds[0]);
            var data = foto_restaurante.replace(/^data:image\/\w+;base64,/, "");
            var buf = new Buffer(data, 'base64');
            fs.writeFile('restaurantes/'+result.insertedIds[0]+'_foto.png', buf);
			
			var data = cover_restaurante.replace(/^data:image\/\w+;base64,/, "");
            var buf = new Buffer(data, 'base64');
            fs.writeFile('restaurantes_cover/'+result.insertedIds[0]+'_foto.png', buf);

            collection.update(
                { '_id' : ObjectId(result.insertedIds[0]) }, 
                { $set: { 'foto' : 'restaurantes/'+result.insertedIds[0]+'_foto.png' ,
						  'cover' : 'restaurantes_cover/'+result.insertedIds[0]+'_foto.png' 
				} }, 
                function(err, result2){  
                    if(err){
                        var res_err      = {};
                        res_err.status   = "error";
                        res_err.error    = err;
                        res_err.message  = err;
                        res.send(res_err);
                    }
                    else{
                        collection       =  datb.collection('Menu');
                        for(var i = 0; i<menu.length; i++){
                            menu[i].restaurante_id   = ObjectId(result.insertedIds[0]);
                            var menu_foto            = menu[i].foto;
                            menu[i]._foto            = "";
                            collection.insert(menu[i], function(err, result3) {
                                if(err){
                                    var res_err      = {};
                                    res_err.status   = "error";
                                    res_err.error    = err;
                                    res_err.message  = err;
                                    res.send(res_err);
                                }
                                else{
                                    console.log(result3.insertedIds[0]);
                                    var data = menu_foto.replace(/^data:image\/\w+;base64,/, "");
                                    var buf = new Buffer(data, 'base64');
                                    fs.writeFile('menus/'+result.insertedIds[0]+'_foto.png', buf);
									
									fs.mkdirSync('restaurantes_documentos/'+result.insertedIds[0]);
									for(var i = 0; i < req.body.documentos.length; i++){
										fs.writeFile('restaurantes_documentos/'+result.insertedIds[0]+'/'+req.body.documentos[i].name, 
											req.body.documentos[i]);
									}									
									
                                    collection.update(
                                        { '_id' : ObjectId(result3.insertedIds[0]) }, 
                                        { $set: { 'foto' : 'menus/'+result.insertedIds[0]+'_foto.png' } }, 
                                        function(err, result4){  
                                            if(err){
                                                var res_err      = {};
                                                res_err.status   = "error";
                                                res_err.error    = err;
                                                res_err.message  = err;
                                                res.send(res_err);
                                            }
                                    });
                                }
                            });
                        }
                        result.status = "success";
                        res.send(result);
                    }
            });
        }
    });
});

router.post("/nueva_promocion",function(req,res){
    var collection           		=  datb.collection('Promocion');
    var promocion           		=  req.body.data;
    var foto_promocion       		=  req.body.data.foto;
    promocion.foto         	 		=  "";
	req.body.data.restaurante_id 	=  ObjectId(req.body.data.restaurante_id);
    collection.insert(promocion, function(err, result) {
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }
        else{
            console.log(result.insertedIds[0]);
            var data = foto_promocion.replace(/^data:image\/\w+;base64,/, "");
            var buf = new Buffer(data, 'base64');
            fs.writeFile('promociones/'+result.insertedIds[0]+'_foto.png', buf);

            collection.update(
                { '_id' : ObjectId(result.insertedIds[0]) }, 
                { $set: { 'foto' : 'promociones/'+result.insertedIds[0]+'_foto.png' } }, 
                function(err, result2){  
                    if(err){
                        var res_err      = {};
                        res_err.status   = "error";
                        res_err.error    = err;
                        res_err.message  = err;
                        res.send(res_err);
                    }
                    else{
                        result.status  = "success";
						result.message = "Promoción insertada con éxito, espera la confirmación cuando se acepte el contenido. ¡Gracias! :)";
                        res.send(result);
                    }
            });
        }
    });
});

router.post("/update_user_preferencias",function(req,res){
    var collection           		=  datb.collection('Usuario');
    var user_id           			=  ObjectId(req.body.data._id);
    collection.update(
		{ '_id' : user_id }, 
		{ $push: { 'preferencias' : req.body.data.preferencias_seleccionadas } }, 
		function(err, result){  
			if(err){
				var res_err      = {};
				res_err.status   = "error";
				res_err.error    = err;
				res_err.message  = err;
				res.send(res_err);
			}
			else{
				result.status  = "success";
				result.message = "Preferencias actualizadas. ¡Gracias :)!";
				res.send(result);
			}
	});
});

router.post("/update_user_location",function(req,res){
    var collection           		=  datb.collection('Usuario');
    var user_id           			=  ObjectId(req.body.data._id);
    collection.update(
		{ '_id' : user_id }, 
		{ $push: { 'location' : req.body.data.ubicacion } }, 
		function(err, result){  
			if(err){
				var res_err      = {};
				res_err.status   = "error";
				res_err.error    = err;
				res_err.message  = err;
				res.send(res_err);
			}
			else{
				collection =  datb.collection('Ubicacion');
				req.body.ubicaciones.usuario_id = ObjectId(req.body.ubicaciones.usuario_id);
				var catalogo_de_ubicaciones = {};
				catalogo_de_ubicaciones = req.body.ubicaciones.ubicacion[0];
				catalogo_de_ubicaciones.usuario_id = req.body.ubicaciones.usuario_id;
				collection.insert(catalogo_de_ubicaciones, function(err, result) {
				if(err){
					var res_err      = {};
					res_err.status   = "error";
					res_err.error    = err;
					res_err.message  = err;
					res.send(res_err);
				}
				else{
					var res_data      = {};
					res_data.status   = "success";
					res_data.message  = "Ubicación actualizada. ¡Gracias!";
					res.send(res_data);
				}
				});
			}
	});
});

router.post("/update_like_restaurante",function(req,res){
    var collection           		=  datb.collection('Restaurante');
    var user_id           			=  ObjectId(req.body.user._id);
	var post_id           			=  ObjectId(req.body.post._id);
    collection.update(
		{ '_id' : post_id }, 
		{ $push: { 'likes' : { "user_id" : user_id } } }, 
		function(err, result){  
			if(err){
				var res_err      = {};
				res_err.status   = "error";
				res_err.error    = err;
				res_err.message  = err;
				res.send(res_err);
			}
			else{
				result.status  = "success";
				result.message = "Like guardado";
				res.send(result);
			}
	});
});

router.post("/eliminar_ubicacion",function(req,res){
    var collection              =  datb.collection('Ubicacion');
    var ubicacion_id              =  ObjectId(req.body.ubicacion._id);
    collection.deleteOne(
        { '_id' : ubicacion_id },
        function(err, result){  
            if(err){
                var res_err      = {};
                res_err.status   = "error";
                res_err.error    = err;
                res_err.message  = err;
                res.send(res_err);
            }
            else{
                var res_data    = {};
                res_data.status  = "success";
                res_data.message = "Ubicación eliminada :)";
                res.send(res_data);
            }
    });
});

router.post("/quitar_like",function(req,res){
    var collection           	=  datb.collection('Like');
    var usuario_id           	=  ObjectId(req.body.like.usuario_id);
	var publicacion_id          =  ObjectId(req.body.like.publicacion_id);
    collection.deleteOne(
		{ 'usuario_id' : usuario_id , 'publicacion_id' : publicacion_id },
		function(err, result){  
			if(err){
				var res_err      = {};
				res_err.status   = "error";
				res_err.error    = err;
				res_err.message  = err;
				res.send(res_err);
			}
			else{
				var res_data    = {};
				res_data.status  = "success";
				res_data.message = "Like eliminado";
				res.send(res_data);
			}
	});
});

router.post("/update_comment_restaurante",function(req,res){
    var collection           		=  datb.collection('Restaurante');
    var user_id           			=  ObjectId(req.body.user._id);
	var post_id           			=  ObjectId(req.body.post._id);
    collection.update(
		{ '_id' : post_id }, 
		{ $push: { 'comentarios' : { "user_id" : user_id , "comment" : req.body.user.comment } } }, 
		function(err, result){  
			if(err){
				var res_err      = {};
				res_err.status   = "error";
				res_err.error    = err;
				res_err.message  = err;
				res.send(res_err);
			}
			else{
				result.status  = "success";
				result.message = "Comentario guardado";
				res.send(result);
			}
	});
});

router.post("/update_location_usuario",function(req,res){
    var collection                  =  datb.collection('Usuario');
    var usuario_id                  =  ObjectId(req.body.usuario._id);
    collection.update(
        { '_id' : usuario_id }, 
        { $set: { 'location' : req.body.usuario.location } }, 
        function(err, result){  
            if(err){
                var res_err      = {};
                res_err.status   = "error";
                res_err.error    = err;
                res_err.message  = err;
                res.send(res_err);
            }
            else{
                result.status  = "success";
                result.message = "Ubicación actualizada";
                res.send(result);
            }
    });
});

router.post("/nueva_publicacion",function(req,res){
    var collection           		=  datb.collection('Publicacion');
    var publicacion          		=  req.body.data;
    var foto_publicacion     		=  req.body.data.foto;
    publicacion.foto         		=  "";
	req.body.data.restaurante_id 	=  ObjectId(req.body.data.restaurante_id);
    collection.insert(publicacion, function(err, result) {
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }
        else{
            console.log(result.insertedIds[0]);
            var data = foto_publicacion.replace(/^data:image\/\w+;base64,/, "");
            var buf = new Buffer(data, 'base64');
            fs.writeFile('publicaciones/'+result.insertedIds[0]+'_foto.png', buf);

            collection.update(
                { '_id' : ObjectId(result.insertedIds[0]) }, 
                { $set: { 'foto' : 'publicaciones/'+result.insertedIds[0]+'_foto.png' } }, 
                function(err, result2){  
                    if(err){
                        var res_err      = {};
                        res_err.status   = "error";
                        res_err.error    = err;
                        res_err.message  = err;
                        res.send(res_err);
                    }
                    else{
                        result.status  = "success";
						result.message = "Publicación insertada con éxito, espera la confirmación cuando se acepte el contenido. ¡Gracias! :)";
                        res.send(result);
                    }
            });
        }
    });
});

router.post("/nueva_categoria",function(req,res){
    var collection           		=  datb.collection('Categoria_Platillo');
	req.body.data.restaurante_id 	=  ObjectId(req.body.data.restaurante_id);
	req.body.data.usuario_alta 		=  ObjectId(req.body.data.usuario_alta);
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
			result.message = "Categoría agregada :)";
			res.send(result);
        }
    });
});

router.post("/nuevo_comentario_publicacion",function(req,res){
    var collection           		=  datb.collection('Comentario_Publicacion');
	req.body.data.publicacion_id 	=  ObjectId(req.body.data.publicacion_id);
	req.body.data.usuario_alta 		=  ObjectId(req.body.data.usuario_alta);
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
			result.message = "Comentario agregado :)";
			res.send(result);
        }
    });
});

router.post("/nuevo_like",function(req,res){
    var collection    =  datb.collection('Like');
	req.body.like.usuario_id 	 =  ObjectId(req.body.like.usuario_id);
	req.body.like.publicacion_id =  ObjectId(req.body.like.publicacion_id);
    collection.insert(req.body.like, function(err, result) {
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }
        else{
            result.status  = "success";
			result.message = "Like agregado :)";
			res.send(result);
        }
    });
});

router.post("/nuevo_ubicacion",function(req,res){
    var collection    =  datb.collection('Ubicacion');
    req.body.ubicacion.usuario_id     =  ObjectId(req.body.ubicacion.usuario_id);
    collection.insert(req.body.ubicacion, function(err, result) {
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }
        else{
            result.status  = "success";
            result.message = "Ubicación agregada :)";
            res.send(result);
        }
    });
});

router.post("/nuevo_adicional",function(req,res){
    var collection           		=  datb.collection('Adicional_Platillo');
	req.body.data.restaurante_id 	=  ObjectId(req.body.data.restaurante_id);
	req.body.data.usuario_alta 		=  ObjectId(req.body.data.usuario_alta);
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
			result.message = "Adicional agregado :)";
			res.send(result);
        }
    });
});

router.post("/nuevo_platillo",function(req,res){
    var collection           		=  datb.collection('Menu');
	req.body.data.restaurante_id 	=  ObjectId(req.body.data.restaurante_id);
	req.body.data.usuario_alta 		=  ObjectId(req.body.data.usuario_alta);
	var menu_foto            		=  req.body.data.foto;
    collection.insert(req.body.data, function(err, result) {
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }
        else{
			
			var data = menu_foto.replace(/^data:image\/\w+;base64,/, "");
			var buf = new Buffer(data, 'base64');
			fs.writeFile('menus/'+result.insertedIds[0]+'_foto.png', buf);
			collection.update(
				{ '_id' : ObjectId(result.insertedIds[0]) }, 
				{ $set: { 'foto' : 'menus/'+result.insertedIds[0]+'_foto.png' } }, 
				function(err, result2){  
					if(err){
						var res_err      = {};
						res_err.status   = "error";
						res_err.error    = err;
						res_err.message  = err;
						res.send(res_err);
					}else{
						result2.status  = "success";
						result2.message = "Platillo agregado :)";
						res.send(result2);
					}
			});
        }
    });
});

router.post("/nuevo_combo",function(req,res){
    var collection           		=  datb.collection('Combo');
	req.body.data.restaurante_id 	=  ObjectId(req.body.data.restaurante_id);
	req.body.data.usuario_alta 		=  ObjectId(req.body.data.usuario_alta);
	var menu_foto            		=  req.body.data.foto;
    collection.insert(req.body.data, function(err, result) {
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }
        else{
			
			var data = menu_foto.replace(/^data:image\/\w+;base64,/, "");
			var buf = new Buffer(data, 'base64');
			fs.writeFile('combos/'+result.insertedIds[0]+'_foto.png', buf);
			collection.update(
				{ '_id' : ObjectId(result.insertedIds[0]) }, 
				{ $set: { 'foto' : 'combos/'+result.insertedIds[0]+'_foto.png' } }, 
				function(err, result2){  
					if(err){
						var res_err      = {};
						res_err.status   = "error";
						res_err.error    = err;
						res_err.message  = err;
						res.send(res_err);
					}else{
						result2.status  = "success";
						result2.message = "Combo agregado :)";
						res.send(result2);
					}
			});
        }
    });
});

router.post("/nuevo_oferta",function(req,res){
    var collection           		=  datb.collection('Oferta');
	req.body.data.restaurante_id 	=  ObjectId(req.body.data.restaurante_id);
	req.body.data.usuario_alta 		=  ObjectId(req.body.data.usuario_alta);
	var menu_foto            		=  req.body.data.foto;
    collection.insert(req.body.data, function(err, result) {
        if(err){
            var res_err      = {};
            res_err.status   = "error";
            res_err.error    = err;
            res_err.message  = err;
            res.send(res_err);
        }
        else{
			
			var data = menu_foto.replace(/^data:image\/\w+;base64,/, "");
			var buf = new Buffer(data, 'base64');
			fs.writeFile('promociones/'+result.insertedIds[0]+'_foto.png', buf);
			collection.update(
				{ '_id' : ObjectId(result.insertedIds[0]) }, 
				{ $set: { 'foto' : 'promociones/'+result.insertedIds[0]+'_foto.png' } }, 
				function(err, result2){  
					if(err){
						var res_err      = {};
						res_err.status   = "error";
						res_err.error    = err;
						res_err.message  = err;
						res.send(res_err);
					}else{
						result2.status  = "success";
						result2.message = "Oferta agregada :)";
						res.send(result2);
					}
			});
        }
    });
});

app.post('/savedata', upload.single('file'), function(req,res,next){
    console.log('Uploade Successful ', req.file, req.body);
});

app.use('/',router);
