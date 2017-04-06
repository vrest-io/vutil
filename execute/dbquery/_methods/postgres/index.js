
const driver = require('pg'), conf = { };

function func(vars,methods,req,res,next){
  methods.predb(vars,methods,req,res, function(cn,cb){
    var hn = GLOBAL_METHODS.assign(false,conf);
    hn = GLOBAL_METHODS.assign(hn,cn);
    const pool = new driver.Pool(hn);
    pool.connect(cb);
  }, function(ert,con){
    var query = GLOBAL_METHODS.lastValue(vars.params, 'body','query');
    if(ert) {
      next({ message : (vars.locale[vars.currentLocale][ert] || ert), status : 400 });
    } else {
      con.query(query, function(err, recordset) {
        if(err) {
          next({ output : (vars.locale[vars.currentLocale].queryfail+(err.message || '')), status : 400 });
        } else {
          next({ output : recordset, status : 200 });
        }
      });
    }
  });
}

module.exports = func;
