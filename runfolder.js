var express = require('express')
  , app = express.createServer();

app.configure(function() {
  var hourMs = 1000*60*60;
  app.use(express.static(__dirname + '/public', { maxAge: hourMs }));
  app.use(express.directory(__dirname + '/public'));
  app.use(express.errorHandler());
});
app.listen(3010);
console.log('Listening on port 3010.');