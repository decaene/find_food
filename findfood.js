


var express     =   require("express");
var app         =   express();
var bodyParser  =   require("body-parser");
var router      =   express.Router();
var mongoose    =   require('mongoose');
var MongoClient =   require('mongodb').MongoClient
    , format    =   require('util').format;
var ObjectId    =   require('mongodb').ObjectId; 
// var dateFormat  =   require('dateformat');
// var moment      =   require('moment');
// var QRCode      =   require('qrcode');
// var gcm         =   require('node-gcm');
// var apn         =   require('apn');

// Run server to listen on port 3001.
var server = app.listen(3002, () => {
    console.log('Find food en:3003');
});

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
        // var collection = db.collection('test_insert');
        // collection.insert({a:2}, function(err, docs) {
        //     collection.count(function(err, count) {
        //         console.log(format("count = %s", count));
        //     });
        // });

        // Locate all the entries using find
        // collection.find().toArray(function(err, results) {
        //     console.dir(results);
        //     // Let's close the db
        //     db.close();
        // });
    });

// Database Mongo Connection //

// Router and Routes

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false}));

router.get("/",function(req,res){
    res.json({"error" : false,"message" : "Hello World11"});
});

router.get("/test2",function(req,res){

    var request = new Request('sps_Familias', function(err, rowCount) {
        if (err) {
            console.log(err);
        } else {
            console.log(rowCount + ' rows');
        }
    });

    request.on('row', function(columns) {
      columns.forEach(function(column) {
        console.log(column.value);
      });
    });

    // request.on("row", function (columns) { 
    //     var item = {}; 
    //     columns.forEach(function (column) { 
    //         item[column.metadata.colName] = column.value; 
    //     }); 
    //     result.push(item); 
    // }); 

    my_connection.callProcedure(request);

});

router.post("/get_data",function(req,res){
	res.json({"tst" : true,"message" : my_connection});
});

app.use('/',router);
