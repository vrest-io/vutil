const async = require('async'),
      req = require('request').defaults({ json : true }),
      path = require('path'),
      assert = require('assert'),
      BU = 'http://localhost:3000/',
      DBS = process.env.DBS || '';
var test =
  [
    function(cb){
      req.post({
        url : BU+'execute/dbquery'
      }, function(err,res,body){
        assert(res.statusCode === 404);
        assert.equal(body.message,'Invalid request route.');
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery/mqcon1'
      }, function(err,res,body){
        assert(res.statusCode === 400);
        assert.equal(body.message,'Value of parameter `query` was not valid.');
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery/mong'
      }, function(err,res,body){
        assert(res.statusCode === 400);
        assert.equal(body.message,'Please provide a valid connection name.');
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery',
        json : { query : '55' }
      } ,function(err,res,body){
        assert(res.statusCode === 404);
        assert.equal(body.message,'Invalid request route.');
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery/09u309u23',
        json : { query : '55' }
      },function(err,res,body){
        assert(res.statusCode === 400);
        assert.equal(body.message,'Please provide a valid connection name.');
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery/mqcon1',
        json : { query : '55' }
      }, function(err,res,body){
        assert(res.statusCode === 400);
        assert(body.message.indexOf('error connecting') !== -1);
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery/mqcon2',
        json : { query : 'SHOW TABLES;' }
      }, function(err,res,body){
        if(DBS.indexOf('mysql') !== -1){
          assert(res.statusCode === 200);
          assert.deepEqual(body.output,[ { Tables_in_play: 'schema_version' },
            { Tables_in_play: 'troop' }, { Tables_in_play: 'user' }, { Tables_in_play: 'user_troop' } ]);
        } else {
          assert(res.statusCode === 400);
          assert(body.message.indexOf('error connecting') !== -1);
        }
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery/mgcon1'
      }, function(err,res,body){
        assert(res.statusCode === 400);
        assert.equal(body.message,'Value of parameter `query` was not valid.');
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery/mgcon2',
        json : { query : '55' }
      }, function(err,res,body){
        if(DBS.indexOf('mongodb') !== -1){
          assert(res.statusCode === 200);
          assert.equal(body.message,null);
        } else {
          assert(res.statusCode === 400);
          assert(body.message.indexOf('error connecting') !== -1);
        }
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery/mgcon2',
        json : { query :  { colName : '55' } }
      }, function(err,res,body){
        if(DBS.indexOf('mongodb') !== -1){
          assert(res.statusCode === 200);
          assert.equal(body.message,null);
        } else {
          assert(res.statusCode === 400);
          assert(body.message.indexOf('error connecting') !== -1);
        }
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery/c093509232',
        json : { query : { colName : '55' } }
      },function(err,res,body){
        assert(res.statusCode === 400);
        assert.equal(body.message,'Please provide a valid connection name.');
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery/mgcon2',
        json : { query : { colName : 'role',command : 'insertOne',operate : { name : 'role4',displayName : 'byby' } } }
      },function(err,res,body){
        if(DBS.indexOf('mongodb') !== -1){
          assert(res.statusCode === 200);
          assert.deepEqual(body.message,{ n: 1, ok: 1 });
        } else {
          assert(res.statusCode === 400);
          assert(body.message.indexOf('error connecting') !== -1);
        }
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery/mscon1',
        json : { query : '55' }
      }, function(err,res,body){
        assert(res.statusCode === 400);
        assert(body.message.indexOf('error connecting') !== -1);
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery/cewrjwerweron2',
        json : { query : '55' }
      },function(err,res,body){
        assert(res.statusCode === 400);
        assert.equal(body.message,'Please provide a valid connection name.');
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery/mscon2',
        json : { query : 'select * from dbo.category;' }
      }, function(err,res,body){
        if(DBS.indexOf('mssql') !== -1){
          assert(res.statusCode === 200);
          assert.deepEqual(body.message,[]);
        } else {
          assert(res.statusCode === 400);
          assert(body.message.indexOf('error connecting') !== -1);
        }
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery/pscon1',
        json : { query : '55' }
      }, function(err,res,body){
        assert(res.statusCode === 400);
        assert(body.message.indexOf('error connecting') !== -1);
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery/con23r23',
        json : { query : '55' }
      },function(err,res,body){
        assert(res.statusCode === 400);
        assert.equal(body.message,'Please provide a valid connection name.');
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery/pscon2',
        json : { query : 'select * from avatar;' }
      }, function(err,res,body){
        if(DBS.indexOf('postgres') !== -1){
          assert(res.statusCode === 200);
          assert.deepEqual(body.message.command,'SELECT');
        } else {
          assert(res.statusCode === 400);
          assert(body.message.indexOf('error connecting') !== -1);
        }
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery/occon1',
        json : { query : '55' }
      }, function(err,res,body){
        assert(res.statusCode === 400);
        assert(body.message.indexOf('error connecting') !== -1);
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery/con4345342',
        json : { query : '55' }
      },function(err,res,body){
        assert(res.statusCode === 400);
        assert.equal(body.message,'Please provide a valid connection name.');
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery/occon2',
        json : { query : 'select 2+2 from dual' }
      }, function(err,res,body){
        if(DBS.indexOf('oracle') !== -1){
          assert(res.statusCode === 200);
          assert.deepEqual(body,{"output":{"rows":[[4]],"metaData":[{"name":"2+2"}]}});
        } else {
          assert(res.statusCode === 400);
          assert(body.message.indexOf('error connecting') !== -1);
        }
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery/invalidmysql',
        json : { query : '55' }
      }, function(err,res,body){
        assert(res.statusCode === 400);
        assert(body.message.indexOf('error connecting') !== -1);
        assert(body.message.indexOf('127.0.0.1') !== -1);
        cb();
      });
    },
    function(cb){
      req.post({
        url : BU+'execute/dbquery/mysql',
        json : { query : '55' }
      }, function(err,res,body){
        assert(res.statusCode === 400);
        assert(body.message.indexOf('error connecting') !== -1);
        assert(body.message.indexOf('halwahost') !== -1);
        cb();
      });
    }
  ];

module.exports = function(finl){
  async.series(test,finl)
};
