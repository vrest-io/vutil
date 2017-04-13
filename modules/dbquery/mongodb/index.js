
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
      var cur = col[query.command](query.operate, query.options);
      var callback = function(er,rs){
        if(er) {
          next({ message :
            (vars.messages.queryfail+(er.message || '')), status : 400 });
        } else {
          next({ output : rs, status : 200 });
        }
      };
      if(typeof cur.then === 'function'){
        cur.then(callback);
      } else if(typeof cur.toArray === 'function'){
        var cln = query.cursorCalls.length;
        for(var mak, prms, z = 0; z< cln; z++){
          mak = cur[query.cursorCalls];
          if(mak && utils.isStr(mak.call) && typeof cur[mak.call] === 'function'){
            prms = mak.params;
            if(prms){
              if(!(Array.isArray(prms))){
                prms = [prms];
              }
            } else {
              prms = [];
            }
            cur = cur[mak.call].apply(cur, prms);
          }
        }
        if(cur && typeof cur.toArray === 'function'){
          cur.toArray(callback);
        } else {
          next({ message : 'Invalid cursor calls.', status : 400 });
        }
      } else {
        next({ message : '`command` must return a promise or cursor.', status : 400 });
      }
    }
  });
}

module.exports = func;
