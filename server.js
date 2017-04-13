const restify = require('restify');
const pckg = require('./package.json');
const activatedModules = require('./config.json').activatedModules || {};
var server = restify.createServer({
  handleUncaughtExceptions : false,
  name : pckg.name+'@'+pckg.version
});

var rootHandler = require('./modules/root'),
  dbQuery = require('./modules/dbquery'),
  cmdQuery = require('./modules/command'),
  csv2json = require('./modules/csv2json'),
  request = require('./modules/request'),
  reader = require('./modules/reader');

server.use(restify.acceptParser(server.acceptable));

server.get('/', rootHandler);

var bodyParser = restify.bodyParser({ mapParams: false });
var queryParser = restify.queryParser({ mapParams: false });

if(activatedModules.dbquery){
  server.post('/execute/dbquery/:conn', bodyParser, dbQuery);
}
if(activatedModules.command){
  server.post('/execute/command', bodyParser, cmdQuery);
}
if(activatedModules.csv2json){
  server.post('/convert/csv/json', bodyParser, csv2json);
}
if(activatedModules.request){
  server.post('/request', bodyParser, request);
}

if(activatedModules.read){
  server.get('/read', queryParser, reader);
}

server.listen(process.env.PORT || 3000, function() {
  console.log('%s listening at %s', server.name, server.url);
});
