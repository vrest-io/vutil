
var connectionMap = {};

function getConnection(config,nm,connect,next){
  if(connectionMap.hasOwnProperty(nm)){
    next(typeof connectionMap[nm] === 'string' ? connectionMap[nm] : null, connectionMap[nm]);
  } else {
    connect(config,function(err,dn){
      if (err) {
        console.error('error connecting: ' + err.stack);
        connectionMap[nm] = 'error connecting `'+nm+'` '+(err.message ? (': '+err.message) : '');
        next(connectionMap[nm]);
      } else {
        connectionMap[nm] = dn;
        next(null, dn);
      }
    });
  }
}

function func(vars,methods,req,res,connect,next){
  getConnection(vars.connConfig,vars.params.path.conn,connect,next);
}

module.exports = func;
