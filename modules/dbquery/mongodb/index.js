
const client = require('mongodb').MongoClient, conf = {};
const utils = require('../../../utils');

/*
 * Payload
{
  "query" :{
    "colName" : "<Collection Name>",
    "command" : "<function to call, eg findOne, find, remove, update etc>",
    "operate" : "<first parameter object passed into db query, eg {}, { "$where" : "blah blah" }>",
    "options" : "<second parameter object passed into db query, eg { "$set" : {} }>"
  }
}
*/

function func(vars,methods,next){
  methods.predb(vars,methods,function(cn,cb){
    var hn = utils.assign(false,conf);
    hn = utils.assign(hn,cn);
    try {
      client.connect(hn.url, hn.options, cb);
    } catch(erm){
      cb(erm.message);
    }
  }, function(ert,con){
    var query = utils.lastValue(vars.params, 'body','query');
    if(ert) {
      next({ message : (vars.messages[ert] || ert), status : 400 });
    } else {
      var col;
      try { col = con.collection(query && query.colName); } catch(erm){}
      if(!col){
        return next({message : utils.makemsg(vars,'queryfail',[]),
          code : 'COL_NOT_AVL', status : 400 });
      }
      if(typeof col[query.command] !== 'function'){
        return next({message :utils.makemsg(vars,'queryfail',[]),
          code : 'METHOD_NOT_AVL', status : 400 });
      }
      col[query.command](query.operate, query.options, function(er,rs){
        if(er) {
          next({ message : (vars.messages.queryfail+(er.message || '')), status : 400 });
        } else {
          next({ output : rs.toJSON(), status : 200 });
        }
      });
    }
  });
}

module.exports = func;
