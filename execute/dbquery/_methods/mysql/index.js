
const mysql = require('mysql'), conf = {
  host     : 'localhost',
  user     : 'me',
  password : 'secret',
  database : 'my_db'
};

function func(vars,methods,req,res,next){
  var connName = GLOBAL_METHODS.lastValue(vars.params, 'body','connName');
  var query = GLOBAL_METHODS.lastValue(vars.params, 'body','query');
  methods.predb(vars,methods,req,res,vars.params.path.conn,connName, function(cn,cb){
    var hn = GLOBAL_METHODS.assign(false,conf);
    hn = GLOBAL_METHODS.assign(hn,cn);
    hn = mysql.createConnection(hn);
    hn.connect(function(er){ cb(er,hn); });
  }, function(ert,con){
    if(ert) {
      next({ message : (vars.$locale[vars.locale][ert] || ert), status : 400 });
    } else {
      con.query(query,function(err,results){
        if(err) {
          next({ message : (vars.$locale[vars.locale].queryfail+(err.message || '')), status : 400 });
        } else {
          next({ output : results, status : 200 });
        }
      });
    }
  });
}

module.exports = func;
