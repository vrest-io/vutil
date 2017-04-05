
var conMap = {};
var connections = GLOBAL_METHODS.lastValue(GLOBAL_APP_CONFIG, 'db', 'connections');
if(!Array.isArray(connections)){
  connections = [];
}

var ln = connections.length;

for(var z = 0; z < ln; z++){
  if(GLOBAL_METHODS.isAlphaNum(connections[z].type)){
    conMap[connections[z].name] = 1;
  }
}

const contypes = ['mongodb','mysql','postgres','mssql','oracle'],
      cons = Object.keys(conMap);

function func(vars){
  var isAvl = false, isValid = cons.indexOf(vars.params.path.conn) !== -1;
  if(isValid){
    vars.connType = conMap[vars.params.path.conn].type;
    vars.connConfig = conMap[vars.params.path.conn].config;
    isAvl = contypes.indexOf(vars.connType) !== -1;
    if(isAvl){
      return true;
    } else {
      vars.conErrorType = 'connnotavail';
      return false;
    }
  } else {
    vars.conErrorType = 'invalidconname';
    return false;
  }
  return ret;
}

module.exports = func;
