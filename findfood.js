


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
// var dateFormat  =   require('dateformat');
// var moment      =   require('moment');
// var QRCode      =   require('qrcode');
// var gcm         =   require('node-gcm');
// var apn         =   require('apn');

// Run server to listen on port 3001.
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

router.post("/autenticacion",function(req,res){
    var name_collection = "Usuario";
    var email_login     =  req.body.data.email;
    var password_login  =  req.body.data.contrasena;

    var collection      = datb.collection('Usuario');
    collection.aggregate([
        { $match : { "email" : email_login, "contrasena" : password_login } },
        { $lookup: { from: "Tipo_Usuario", localField: "tipo_id", foreignField: "_id", as: "tipo_usuario" } }
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

router.post("/nuevo_restaurante",function(req,res){
    var collection       =  datb.collection('Restaurante');
    var restaurante      =  req.body.data;
    var foto_restaurante =  req.body.data.foto;
    var restaurante.foto =  "";
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
            fs.writeFile(result.insertedIds[0]+'_foto.png', buf);
            result.status = "success";
            res.send(result);
            // res.send(req.body);
        }
    });
});

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  }
});
var upload = multer({ storage : storage}).single('userPhoto');

app.post('/api/photo',function(req,res){
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });
});

app.use('/',router);
