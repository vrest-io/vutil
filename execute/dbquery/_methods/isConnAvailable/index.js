
var cons = {};
var connections = GLOBAL_METHODS.lastValue(GLOBAL_APP_CONFIG, 'db', 'connections');
if(!Array.isArray(connections)){
  connections = [];
}

var ln = connections.length;

for(var z = 0; z < ln; z++){
  if(GLOBAL_METHODS.isAlphaNum(connections[z].type)){
    cons[connections[z].type] = 1;
  }
}

cons = Object.keys(cons);

if(!GLOBAL_API._root.execute.dbquery._vars) GLOBAL_API._root.execute.dbquery._vars = {};
GLOBAL_API._root.execute.dbquery._vars.connections = cons;

function func(vars,methods,req,res,connName){
  return cons.indexOf(connName) !== -1;
}

module.exports = func;
