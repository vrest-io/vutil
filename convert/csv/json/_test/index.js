const async = require('async'),
      req = require('request').defaults({ json : true }),
      path = require('path'),
      assert = require('assert'),
      BU = 'http://localhost:3000/';

module.exports = function(finl){
  async.parallel([
    function(cb){
      req.get(BU+'convert',function(err,res,body){
        assert(res.statusCode === 404);
        assert.equal(body.message,'Invalid request route.');
        cb();
      });
    },
    function(cb){
      req.post(BU+'convert',function(err,res,body){
        assert(res.statusCode === 404);
        assert.equal(body.message,'Invalid request route.');
        cb();
      });
    },
    function(cb){
      req.get(BU+'convert/csv/json',function(err,res,body){
        assert(res.statusCode === 404);
        assert.equal(body.message,'Invalid request route.');
        cb();
      });
    },
    function(cb){
      req.post(BU+'convert/csv/json',function(err,res,body){
        assert(res.statusCode === 400);
        assert.equal(body.message,'Parameter `filePath` was missing in request.');
        cb();
      });
    },
    function(cb){
      req.post({
        url:BU+'convert/csv/json',
        json: { filePath : 'convert/csv/json/_test/a.csv' }
      },function(err,res,body){
        assert(res.statusCode === 200);
        assert.deepEqual(JSON.parse(body.output[0][0]), {"_id": "{{contactId}}","name": "","email": "john.doe@example.com","designation": "Chief Technical Officer","organization": "Example.com","country": "India","aboutMe": "My name can be used as a placeholder name and I don't have any identity.","twitterId": "fake.john.doe","facebookId": "fake.john.doe","githubId": "fake.john.doe","createdOn": "2014-05-03T06:28:45.479Z"});
        assert.deepEqual(JSON.parse(body.output[0][1]),{"errors": { "name": "required field"}});
        assert.deepEqual(body.output[0][2],400);
        assert.deepEqual(JSON.parse(body.output[1][0]), {"_id": "{{contactId}}","name": "Sample Name whose length is greater than the limit","email": "john.doe@example.com","designation": "Chief Technical Officer","organization": "Example.com","country": "India","aboutMe": "My name can be used as a placeholder name and I don't have any identity.","twitterId": "fake.john.doe","facebookId": "fake.john.doe","githubId": "fake.john.doe","createdOn": "2014-05-03T06:28:45.479Z"});
        assert.deepEqual(JSON.parse(body.output[1][1]),{"errors": { "name": "field length cannot be greater than 35"}});
        assert.deepEqual(body.output[1][2],400);
        cb();
      });
    }
  ],finl);
};
