
const driver = require('oracledb'), conf = { };
const utils = require('../../../utils');

function func(vars,methods,next){
  methods.predb(vars,methods,function(cn,cb){
    var hn = utils.assign(false,conf);
    hn = utils.assign(hn,cn);
    driver.getConnection(hn,cb);
  }, function(ert,con){
    var query = utils.lastValue(vars.params, 'body','query');
    if(ert) {
      next({ message : (vars.messages[ert] || ert), status : 400 });
    } else {
      con.execute(query, function(err, recordset) {
        if(err) {
          next({ message : (vars.messages.queryfail+(err.message || '')), status : 400 });
        } else {
          next({ output : recordset, status : 200 });
        }
      });
    }
  });
};

module.exports = func;
