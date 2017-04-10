
const mssql = require('mssql'), conf = { };
const utils = require('../../../utils');

function func(vars,methods,next){
  methods.predb(vars,methods,function(cn,cb){
    var hn = utils.assign(false,conf);
    hn = utils.assign(hn,cn);
    var hcn = new mssql.Connection(hn, function(err) { cb(err,hcn); });
  }, function(ert,con){
    var query = utils.lastValue(vars.params, 'body','query');
    if(ert) {
      next({ message : (vars.messages[ert] || ert), status : 400 });
    } else {
      var request = new mssql.Request(con);
      request.query(query, function(err, recordset) {
        if(err) {
          next({ message : (vars.messages.queryfail+(err.message || '')), status : 400 });
        } else {
          next({ output : recordset, status : 200 });
        }
      });
    }
  });
}

module.exports = func;
