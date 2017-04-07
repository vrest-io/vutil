const async = require('async'),
      req = require('request').defaults({ json : true }),
      path = require('path'),
      assert = require('assert'),
      BU = 'http://localhost:3000/';

module.exports = function(finl){
  async.parallel([
    function(cb){
      req.post(BU+'request',function(err,res,body){
        assert(res.statusCode === 400);
        assert.equal(body.message,'Parameter `method` was missing in request.');
        cb();
      });
    },
    function(cb){
      req.post({
        url:BU+'request',
        json : { method : 'GET' }
      },function(err,res,body){
        assert(res.statusCode === 400);
        assert.equal(body.message,'Parameter `url` was missing in request.');
        cb();
      });
    },
    function(cb){
      req.post({
        url:BU+'request',
        json : { method : 'POST' }
      },function(err,res,body){
        assert(res.statusCode === 400);
        assert.equal(body.message,'Parameter `url` was missing in request.');
        cb();
      });
    },
    function(cb){
      req.post({
        url:BU+'request',
        json : {
          method : 'POST',
          url : ''
        }
      },function(err,res,body){
        assert(res.statusCode === 400);
        assert.equal(body.message,'Parameter `url` was missing in request.');
        cb();
      });
    },
    function(cb){
      req.post({
        url:BU+'request',
        json : {
          method : 'POST',
          url : 'http://service.com/upload'
        }
      },function(err,res,body){
        assert(res.statusCode === 200);
        assert(body.output.indexOf('301 Moved Permanently') !== -1);
        cb();
      });
    },
    function(cb){
      req.post({
        url:BU+'request',
        json : {
          method : 'POST',
          url : 'http://service.com/upload'
        }
      },function(err,res,body){
        assert(res.statusCode === 200);
        assert(body.output.indexOf('301 Moved Permanently') !== -1);
        cb();
      });
    },
    function(cb){
      req.post({
        url:BU+'request',
        json : {
          method : 'POST',
          url : 'http://service.com/upload',
          filePath : 'ab'
        }
      },function(err,res,body){
        assert(res.statusCode === 200);
        assert.equal(body.error.code,'ENOENT');
        cb();
      });
    },
    function(cb){
      req.post({
        url:BU+'request',
        json : {
          method : 'POST',
          url : 'http://service.com/upload',
          filePath : 'ab'
        }
      },function(err,res,body){
        assert(res.statusCode === 200);
        assert.equal(body.error.code,'ENOENT');
        cb();
      });
    },
    function(cb){
      req.post({
        url:BU+'request',
        json : {
          method : 'POST',
          url : BU+'convert/csv/json',
          filePath : 'ab'
        }
      },function(err,res,body){
        assert(res.statusCode === 200);
        assert.equal(body.error.code,'ENOENT');
        cb();
      });
    },
    function(cb){
      req.post({
        url:BU+'request',
        json : {
          method : 'POST',
          url : 'https://localhost/co/csv/json',
          filePath : __dirname+'/one.csv'
        }
      },function(err,res,body){
        assert(res.statusCode === 200);
        assert.equal(body.error.code,'ECONNREFUSED');
        cb();
      });
    }
  ],finl);
};
