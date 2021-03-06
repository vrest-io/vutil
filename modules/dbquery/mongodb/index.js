
const client = require('mongodb').MongoClient, conf = {};
const ObjectId = require('mongodb').ObjectId.createFromHexString;
const utils = require('../../../utils');
const MONGOID_REG = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;

/*
 * Payload
{
  "query" :{
    "collection" : "<Collection Name>",
    "command" : "<function to call, eg findOne, find, remove, update etc>",
    "args" : "<Array or object as parameters object passed into db query, eg [{ "$where" : "blah blah" },{ $set : { setIt : true } }]>",
    "cursorMethods" : "<Array or object, each can have two properties. 1. method : 'string,<of which cursor have a method>' 2.params: the object/Array/Mixed/absent <that will be passed as parameter to above call> eg { method : 'limit', params : 1 }>"
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
    var query = utils.lastValue(vars.params, 'body');
    if(ert) {
      next({ message : (vars.messages[ert] || ert), status : 400 });
    } else {
      var col;
      try { col = con.collection(query && query.collection); } catch(erm){}
      if(!col){
        return next({message :vars.messages.queryfail,
          code : 'COL_NOT_AVL', status : 400 });
      }
      if(typeof col[query.command] !== 'function'){
        return next({message :vars.messages.queryfail,
          code : 'METHOD_NOT_AVL', status : 400 });
      }
      try {
        var cur = col[query.command].apply(col, query.args);
      } catch(er){
        return next({ message : (er.message || er), status : 400 });
      }
      var callback = function(er,rs){
        if(er) {
          next({ message :
            (vars.messages.queryfail+(er.message || er)), status : 400 });
        } else {
          next({ output : rs, status : 200 });
        }
      };
      utils.objwalk(function(obj, key, rt){
        if(typeof obj === 'string' && obj.test(MONGOID_REG)){
          rt[key] = ObjectId(obj);
          rt[key]['$W_END']=true;
        }
      },query.args);
      if(typeof cur.then === 'function'){
        cur.then(callback.bind(null,null),callback.bind(null));
      } else if(typeof cur.toArray === 'function'){
        var cln = query.cursorMethods.length;
        for(var mak, prms, z = 0; z< cln; z++){
          mak = query.cursorMethods[z];
          if(mak && utils.isStr(mak.method) && typeof cur[mak.method] === 'function'){
            prms = mak.params;
            if(prms !== undefined){
              if(!(Array.isArray(prms))){
                prms = [prms];
              }
            } else {
              prms = [];
            }
            cur = cur[mak.method].apply(cur, prms);
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
