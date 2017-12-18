var connect = require('connect'),
    directory = '/var/lib/jenkins/workspace/Find_Food';

connect()
    .use(connect.static(directory))
    .listen(3010);

console.log('Listening on port 3010.');