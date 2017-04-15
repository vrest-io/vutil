
const mysql = require('mysql'), conf = { },
      utils = require('../../../utils');

function func(vars,methods,next){
  methods.predb(vars,methods,function(cn,cb){
    var hn = utils.assign(false,conf);
    hn = utils.assign(hn,cn);
    hn = mysql.createConnection(hn);
    hn.connect(function(er){ cb(er,hn); });
  }, function(ert,con){
    var query = utils.lastValue(vars.params, 'body','query');
    if(ert) {
      next({ message : (vars.messages[ert] || ert), status : 400 });
    } else {
      con.query(query,function(err,results){
        if(err) {
          next({
            message : (vars.messages.queryfail+(err.message || '')),
            status : 400
          });
        } else {
          next({ output : results, status : 200 });
        }
      });
    }
  });
}

module.exports = func;
