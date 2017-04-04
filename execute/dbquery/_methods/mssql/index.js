
const mssql = require('mssql'), conf = {
  user: 'admin',
  password: 'admin',
  server: 'localhost',
  database: 'mydb'
};

function func(vars,methods,req,res,next){
  var connName = GLOBAL_METHODS.lastValue(vars.params, 'body','connName');
  var query = GLOBAL_METHODS.lastValue(vars.params, 'body','query');
  methods.predb(vars,methods,req,res,vars.params.path.conn,connName, function(cn,cb){
    var hn = GLOBAL_METHODS.assign(false,conf);
    hn = GLOBAL_METHODS.assign(hn,cn);
    var hcn = new mssql.Connection(hn, function(err) { cb(err,hcn); });
  }, function(ert,con){
    if(ert) {
      next({ message : (vars.$locale[vars.locale][ert] || ert), status : 400 });
    } else {
      var request = new mssql.Request(con);
      request.query(query, function(err, recordset) {
        if(err) {
          next({ message : (vars.$locale[vars.locale].queryfail+(err.message || '')), status : 400 });
        } else {
          next({ output : recordset, status : 200 });
        }
      });
    }
  });
}

module.exports = func;
