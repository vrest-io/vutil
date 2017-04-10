
const driver = require('pg'), conf = { };
const utils = require('../../../utils');

function func(vars,methods,next){
  methods.predb(vars,methods,function(cn,cb){
    var hn = utils.assign(false,conf);
    hn = utils.assign(hn,cn);
    const pool = new driver.Pool(hn);
    pool.connect(cb);
  }, function(ert,con){
    var query = utils.lastValue(vars.params, 'body','query');
    if(ert) {
      next({ message : (vars.messages[ert] || ert), status : 400 });
    } else {
      con.query(query, function(err, recordset) {
        if(err) {
          next({ output : (vars.messages.queryfail+(err.message || '')), status : 400 });
        } else {
          next({ output : recordset, status : 200 });
        }
      });
    }
  });
}

module.exports = func;
