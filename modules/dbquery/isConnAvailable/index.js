
const utils = require('../../../utils');
const messages = require('../vars').messages;
const mainConfig = require('../../../config.json');

var conMap = {};
var connections = utils.lastValue(mainConfig, 'db', 'connections');
if(!Array.isArray(connections)){
  connections = [];
}

var ln = connections.length;

const contypes = ['mongodb','mysql','postgres'];

for(var z = 0; z < ln; z++){
  if(contypes.indexOf(connections[z].type) === -1){
    console.log(connections[z].type +' : '+ messages.connnotavail);
  } else {
    if(utils.isAlphaNum(connections[z].name)){
      conMap[connections[z].name] = connections[z];
    } else {
      console.log('Invalid connection name : ' + connections[z]);
    }
  }
}

const cons = Object.keys(conMap);

function func(vars){
  var con = vars.params.path.connection;
  if(cons.indexOf(con) !== -1){
    vars.connType = conMap[con].type;
    vars.connConfig = conMap[con].config;
    return true;
  } else {
    vars.conErrorType = 'invalidconname';
    return false;
  }
}

module.exports = func;
