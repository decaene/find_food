var express = require('express')  
var serveStatic = require('serve-static')

var staticBasePath = '/var/lib/jenkins/workspace/Find_Food';

var app = express()

app.use(serveStatic(staticBasePath, {'index': false}));
app.listen(3010);
console.log('Listening on port 3010.');