const async = require('async'),
      req = require('request').defaults({ json : true }),
      path = require('path'),
      assert = require('assert'),
      BU = 'http://localhost:3000/';

module.exports = function(finl){
  async.parallel([
    function(cb){
      req.post({
        url : BU+'execute/command'
      } ,function(err,res,body){
        assert(res.statusCode === 400);
        assert.equal(body.message,'Parameter `command` was missing in request.');
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/command',
        json : { command : 'r9803jfe' }
      } ,function(err,res,body){
        assert(res.statusCode === 400);
        assert(body.error.indexOf('not') !== -1);
        //assert(body.message.indexOf('command') !== -1);
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/command',
        json : { command : 'ls -a' }
      }, function(err,res,body){
        assert(res.statusCode === 200);
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/command',
        form : { command : 'ls -a' }
      }, function(err,res,body){
        assert(res.statusCode === 200);
        cb();
      });
    }
  ],finl);
};
