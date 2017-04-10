const restify = require('restify');
const pckg = require('./package.json');
var server = restify.createServer({ name : pckg.name+'@'+pckg.version });

var rootHandler = require('./modules/root'),
  dbQuery = require('./modules/dbquery'),
  cmdQuery = require('./modules/command'),
  csv2json = require('./modules/csv2json'),
  request = require('./modules/request');

server.use(restify.acceptParser(server.acceptable));
server.use(restify.bodyParser({ mapParams: false }));
server.get('/', rootHandler);
server.post('/execute/dbquery/:conn', dbQuery);
server.post('/execute/command', cmdQuery);
server.post('/convert/csv/json', csv2json);
server.post('/request', request);

server.listen(process.env.PORT || 3000, function() {
  console.log('%s listening at %s', server.name, server.url);
});
