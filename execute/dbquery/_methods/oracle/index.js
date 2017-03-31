
const driver = { getConnection : function(a,b){
  b( { message : 'error' });
} } || require('oracledb'), conf = {
  user          : "hr",
  password      : "welcome",
  connectString : "localhost/XE"
};

function func(vars,methods,req,res,next){
  var connName = GLOBAL_METHODS.lastValue(vars.params, 'body','connName');
  var query = GLOBAL_METHODS.lastValue(vars.params, 'body','query');
  methods.predb(vars,methods,req,res,vars.params.path.conn,connName, function(cn,cb){
    var hn = GLOBAL_METHODS.assign(false,conf);
    hn = GLOBAL_METHODS.assign(hn,cn);
    driver.getConnection(hn,cb);
  }, function(ert,con){
    if(ert) {
      next({ _ : (vars.$locale[vars.locale][ert] || ert), status : 400 });
    } else {
      con.execute(query, function(err, recordset) {
        if(err) {
          next({ _ : (vars.$locale[vars.locale].queryfail+(err.message || '')), status : 400 });
        } else {
          next({ _ : recordset, status : 200 });
        }
      });
    }
  });
}

module.exports = func;
