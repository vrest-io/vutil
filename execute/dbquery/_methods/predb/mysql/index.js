
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
    GLOBAL_METHODS.assign(hn,conf);
    hn = mysql.createConnection(hn);
    client.connect(function(er){ cb(er,hn); });
  }, function(){
    if(ert) {
      next({ _ : (vars.$locale[vars.locale][ert] || ert), status : 400 });
    } else {
      var col = con.collection(query.colName);
      if(!col){
        return next({ _ : GLOBAL_METHODS.makemsg(vars,'queryfail',[]), code : 'COL_NOT_AVL', status : 400 });
      }
      if(typeof col[query.command] !== 'function'){
        return next({ _ :GLOBAL_METHODS.makemsg(vars,'queryfail',[]), code : 'METHOD_NOT_AVL', status : 400 });
      }
      col[query.command](query.operate, query.options, function(er,rs){
        if(er) {
          next({ _ : (vars.$locale[vars.locale].queryfail+(er.message || '')), status : 400 });
        } else {
          next({ _ : rs, status : 200 });
        }
      });
    }
  });
}

module.exports = func;
