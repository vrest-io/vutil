const async = require('async'),
      req = require('request').defaults({ json : true }),
      path = require('path'),
      assert = require('assert'),
      BU = 'http://localhost:3000/',
      MDS = process.env.MDS || '';

async.parallel([
  function(cb){
    req(BU,function(err,res,body){
      assert(res.statusCode === 200);
      assert.deepEqual(body,{ name : "vutil", version : "0.0.1" });
      cb();
    });
  },
  function(cb){
    req.post(BU,function(err,res,body){
      assert(res.statusCode === 404);
      assert.equal(body.message,'Invalid request route.');
      cb();
    });
  },
  function(cb){
    if(MDS.indexOf('db')!==-1){
      require('../execute/dbquery/_test')(cb);
    } else {
      cb();
    }
  },
  function(cb){
    if(MDS.indexOf('cmd')!==-1){
      require('../execute/command/_test')(cb);
    } else {
      cb();
    }
  },
  function(cb){
    if(MDS.indexOf('rq')!==-1){
      require('../request/_test')(cb);
    } else {
      cb();
    }
  },
  function(cb){
    if(MDS.indexOf('cnv')!==-1){
      require('../convert/_test')(cb);
    } else {
      cb();
    }
  }
],function(){
  console.log('ALL PASSED...!');
});
