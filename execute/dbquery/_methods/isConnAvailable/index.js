
var conMap = {};
var connections = GLOBAL_METHODS.lastValue(GLOBAL_APP_CONFIG, 'db', 'connections');
if(!Array.isArray(connections)){
  connections = [];
}

var ln = connections.length;

const contypes = ['mongodb','mysql','postgres','mssql','oracle'];

for(var z = 0; z < ln; z++){
  if(contypes.indexOf(connections[z].type) === -1){
    console.log(connections[z].type +' : '+GLOBAL_VARS.locale.en.connnotavail);
  } else {
    if(GLOBAL_METHODS.isAlphaNum(connections[z].name)){
      conMap[connections[z].name] = connections[z];
    } else {
      console.log('Invalid connection name : ' + connections[z]);
    }
  }
}

const cons = Object.keys(conMap);

function func(vars){
  if(cons.indexOf(vars.params.path.conn) !== -1){
    vars.connType = conMap[vars.params.path.conn].type;
    vars.connConfig = conMap[vars.params.path.conn].config;
    return true;
  } else {
    vars.conErrorType = 'invalidconname';
    return false;
  }
}

module.exports = func;
