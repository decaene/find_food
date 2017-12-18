var connect = require('connect'),
    directory = '/var/lib/jenkins/workspace/Find_Food',
    serveStatic = require('serve-static');

var app = connect();

app.use(serveStatic(directory));
app.listen(3010);
console.log('Listening on port 3010.');