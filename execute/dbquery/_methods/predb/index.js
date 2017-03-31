
var defName = false, connections = GLOBAL_METHODS.lastValue(GLOBAL_APP_CONFIG, 'db', 'connections');
if(!Array.isArray(connections)){
  connections = [];
}

var ln = connections.length;

var mainMap = {}, mainConnectionMap = {};

for(var z = 0; z < ln; z++){
  if(GLOBAL_API._root.execute.dbquery._vars.connections.indexOf(connections[z].type) !== -1){
    if(!mainMap[connections[z].type]){
      mainMap[connections[z].type] = {};
    }
    if(!mainConnectionMap[connections[z].type]){
      mainConnectionMap[connections[z].type] = {};
    }
    if(GLOBAL_METHODS.isAlphaNum(connections[z].name)){
      if(!defName) defName = connections[z].name;
      mainMap[connections[z].type][connections[z].name] = {};
      GLOBAL_METHODS.assign(mainMap[connections[z].type][connections[z].name],connections[z].config);
    }
  }
}


function getConnection(conn,nm,connect,next){
  var conMap = mainMap[conn], connectionMap = mainConnectionMap[conn];
  if(!conMap) return next('invalidconname');
  if(!GLOBAL_METHODS._isStr(nm)) nm = defName || 'default';
  if(connectionMap.hasOwnProperty(nm)){
    next(typeof connectionMap[nm] === 'string' ? connectionMap[nm] : null, connectionMap[nm]);
  } else {
    var cn = false;
    if(conMap.hasOwnProperty(nm)){
      connect(conMap[nm],function(err,dn){
        if (err) {
          console.error('error connecting: ' + err.stack);
          connectionMap[nm] = 'error connecting `'+nm+'` '+(err.message ? (': '+err.message) : '');
          next(connectionMap[nm]);
        } else {
          connectionMap[nm] = dn;
          next(null, dn);
        }
      });
    } else {
      next('invalidconname');
    }
  }
}

function func(vars,methods,req,res,conn,nm,connction,next){
  getConnection(conn,nm,connction,next);
}

module.exports = func;
