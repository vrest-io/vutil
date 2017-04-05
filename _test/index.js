const async = require('async'),
      req = require('request').defaults({ json : true }),
      path = require('path'),
      assert = require('assert'),
      BU = 'http://localhost:3000/',
      DBS = process.env.DBS || '';

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
    req.post({
      url : BU+'execute'
    }, function(err,res,body){
      assert(res.statusCode === 404);
      assert.equal(body.message,'Invalid request route.');
      cb();
    });
  },
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
      url : BU+'execute/dbquery/mysql'
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
      assert.equal(body.message,'Connection not available. Please notify for connection setup at support@vrest.io.');
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
      url : BU+'execute/dbquery/con1',
      json : { query : '55' }
    }, function(err,res,body){
      assert(res.statusCode === 400);
      assert(body.message.indexOf('error connecting') !== -1);
      cb();
    });
  },
  function(cb){
    req.post({
      url : BU+'execute/dbquery/con2',
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
      url : BU+'execute/dbquery/mongodb'
    }, function(err,res,body){
      assert(res.statusCode === 400);
      assert.equal(body.message,'Value of parameter `query` was not valid.');
      cb();
    });
  },
  function(cb){
    req.post({
      url : BU+'execute/dbquery/mongodb',
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
      url : BU+'execute/dbquery/mongodb',
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
      url : BU+'execute/dbquery/con2',
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
      url : BU+'execute/dbquery/mssql',
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
      url : BU+'execute/dbquery/con2',
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
      url : BU+'execute/dbquery/postgres',
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
      url : BU+'execute/dbquery/con2',
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
      url : BU+'execute/dbquery/oracle',
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
      url : BU+'execute/dbquery/con2',
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
  },
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
      json: { filePath : path.join(__dirname,'one.csv') }
    },function(err,res,body){
      assert(res.statusCode === 200);
      assert.deepEqual(body,{ output: [ { a: '1', b: '2', c: '3' } ] });
      cb();
    });
  },
  function(cb){
    req.post(BU+'upload',function(err,res,body){
      assert(res.statusCode === 400);
      assert.equal(body.message,'Parameter `method` was missing in request.');
      cb();
    });
  },
  function(cb){
    req.post({
      url:BU+'upload',
      json : { method : 'GET' }
    },function(err,res,body){
      assert(res.statusCode === 400);
      assert.equal(body.message,'Value of parameter `method` must be one of `[\'POST\',\'PUT\',\'DELETE\']`.');
      cb();
    });
  },
  function(cb){
    req.post({
      url:BU+'upload',
      json : { method : 'POST' }
    },function(err,res,body){
      assert(res.statusCode === 400);
      assert.equal(body.message,'Parameter `url` was missing in request.');
      cb();
    });
  },
  function(cb){
    req.post({
      url:BU+'upload',
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
      url:BU+'upload',
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
      url:BU+'upload',
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
      url:BU+'upload',
      json : {
        method : 'POST',
        url : 'http://service.com/upload',
        filePath : 'ab',
        body : 'a body'
      }
    },function(err,res,body){
      assert(res.statusCode === 200);
      assert.equal(body.error.code,'ENOENT');
      cb();
    });
  },
  function(cb){
    req.post({
      url:BU+'upload',
      json : {
        method : 'POST',
        url : 'http://service.com/upload',
        filePath : 'ab',
        body : ''
      }
    },function(err,res,body){
      assert(res.statusCode === 200);
      assert.equal(body.error.code,'ENOENT');
      cb();
    });
  },
  function(cb){
    req.post({
      url:BU+'upload',
      json : {
        method : 'POST',
        url : BU+'convert/csv/json',
        filePath : 'ab',
        body : '{"a":4}',
      }
    },function(err,res,body){
      assert(res.statusCode === 200);
      assert.equal(body.error.code,'ENOENT');
      cb();
    });
  },
  function(cb){
    req.post({
      url:BU+'upload',
      json : {
        method : 'POST',
        url : BU+'convert/csv/json',
        filePath : __dirname+'/one.csv',
        body : '{"a":4}',
      }
    },function(err,res,body){
      assert(res.statusCode === 200);
      assert.deepEqual(body,
        { output: { message: 'Parameter `filePath` was missing in request.' }, statusCode: 400 });
      cb();
    });
  }
],function(){
  console.log('ALL PASSED...!');
});
