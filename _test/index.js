const async = require('async'), req = require('request').defaults({ json : true }),
      assert = require('assert'), BU = 'http://localhost:3000/', DBS = process.env.DBS || '';

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
      assert.equal(body._,'Invalid request route.');
      cb();
    });
  },
  function(cb){
    req.post({
      url : BU+'execute'
    }, function(err,res,body){
      assert(res.statusCode === 404);
      assert.equal(body._,'Invalid request route.');
      cb();
    });
  },
  function(cb){
    req.post({
      url : BU+'execute/dbquery'
    }, function(err,res,body){
      assert(res.statusCode === 404);
      assert.equal(body._,'Invalid request route.');
      cb();
    });
  },
  function(cb){
    req.post({
      url : BU+'execute/dbquery/mysql'
    }, function(err,res,body){
      assert(res.statusCode === 400);
      assert.equal(body._,'Value of parameter `query` was not valid.');
      cb();
    });
  },
  function(cb){
    req.post({
      url : BU+'execute/dbquery/mong'
    }, function(err,res,body){
      assert(res.statusCode === 400);
      assert.equal(body._,'Connection not available. Please notify for connection setup at support@vrest.io.');
      cb();
    });
  },
  function(cb){
    req.post({
      url : BU+'execute/dbquery',
      json : { query : '55' }
    } ,function(err,res,body){
      assert(res.statusCode === 404);
      assert.equal(body._,'Invalid request route.');
      cb();
    });
  },
  function(cb){
    req.post({
      url : BU+'execute/dbquery/mysql',
      json : { query : '55', connName : '09u309u23' }
    },function(err,res,body){
      assert(res.statusCode === 400);
      assert.equal(body._,'Please provide a valid connection name.');
      cb();
    });
  },
  function(cb){
    req.post({
      url : BU+'execute/dbquery/mysql',
      json : { query : '55', connName : 'con1' }
    }, function(err,res,body){
      assert(res.statusCode === 400);
      assert(body._.indexOf('error connecting') !== -1);
      cb();
    });
  },
  function(cb){
    req.post({
      url : BU+'execute/dbquery/mysql',
      json : { query : 'SHOW TABLES;', connName : 'con2' }
    }, function(err,res,body){
      if(DBS.indexOf('mysql') !== -1){
        assert(res.statusCode === 200);
        assert.deepEqual(body._,[ { Tables_in_play: 'schema_version' },
          { Tables_in_play: 'troop' }, { Tables_in_play: 'user' }, { Tables_in_play: 'user_troop' } ]);
      } else {
        assert(res.statusCode === 400);
        assert(body._.indexOf('error connecting') !== -1);
      }
      cb();
    });
  },
  function(cb){
    req.post({
      url : BU+'execute/dbquery/mongodb'
    }, function(err,res,body){
      assert(res.statusCode === 400);
      assert.equal(body._,'Value of parameter `query` was not valid.');
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
        assert.equal(body._,null);
      } else {
        assert(res.statusCode === 400);
        assert(body._.indexOf('error connecting') !== -1);
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
        assert.equal(body._,null);
      } else {
        assert(res.statusCode === 400);
        assert(body._.indexOf('error connecting') !== -1);
      }
      cb();
    });
  },
  function(cb){
    req.post({
      url : BU+'execute/dbquery/mongodb',
      json : { query : { colName : '55' }, connName : 'c093509232' }
    },function(err,res,body){
      assert(res.statusCode === 400);
      assert.equal(body._,'Please provide a valid connection name.');
      cb();
    });
  },
  function(cb){
    req.post({
      url : BU+'execute/dbquery/mongodb',
      json : { query : { colName : 'role',command : 'insertOne',operate : { name : 'role4',displayName : 'byby' } },
        connName : 'con2' }
    },function(err,res,body){
      if(DBS.indexOf('mongodb') !== -1){
        assert(res.statusCode === 200);
        assert.deepEqual(body._,{ n: 1, ok: 1 });
      } else {
        assert(res.statusCode === 400);
        assert(body._.indexOf('error connecting') !== -1);
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
      assert(body._.indexOf('error connecting') !== -1);
      cb();
    });
  },
  function(cb){
    req.post({
      url : BU+'execute/dbquery/mssql',
      json : { query : '55', connName : 'cewrjwerweron2' }
    },function(err,res,body){
      assert(res.statusCode === 400);
      assert.equal(body._,'Please provide a valid connection name.');
      cb();
    });
  },
  function(cb){
    req.post({
      url : BU+'execute/dbquery/mssql',
      json : { query : 'select * from dbo.category;', connName : 'con2' }
    }, function(err,res,body){
      if(DBS.indexOf('mssql') !== -1){
        assert(res.statusCode === 200);
        assert.deepEqual(body._,[]);
      } else {
        assert(res.statusCode === 400);
        assert(body._.indexOf('error connecting') !== -1);
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
      assert(body._.indexOf('error connecting') !== -1);
      cb();
    });
  },
  function(cb){
    req.post({
      url : BU+'execute/dbquery/postgres',
      json : { query : '55', connName : 'con23r23' }
    },function(err,res,body){
      assert(res.statusCode === 400);
      assert.equal(body._,'Please provide a valid connection name.');
      cb();
    });
  },
  function(cb){
    req.post({
      url : BU+'execute/dbquery/postgres',
      json : { query : 'select * from avatar;', connName : 'con2' }
    }, function(err,res,body){
      if(DBS.indexOf('postgres') !== -1){
        assert(res.statusCode === 200);
        assert.deepEqual(body._.command,'SELECT');
      } else {
        assert(res.statusCode === 400);
        assert(body._.indexOf('error connecting') !== -1);
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
      assert(body._.indexOf('error connecting') !== -1);
      cb();
    });
  },
  function(cb){
    req.post({
      url : BU+'execute/dbquery/oracle',
      json : { query : '55', connName : 'con2' }
    },function(err,res,body){
      assert(res.statusCode === 400);
      assert.equal(body._,'Please provide a valid connection name.');
      cb();
    });
  },
  function(cb){
    req.post({
      url : BU+'execute/command'
    } ,function(err,res,body){
      assert(res.statusCode === 400);
      assert.equal(body._,'Parameter `command` was missing in request.');
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
      assert(body.error.indexOf('command') !== -1);
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
    req.get(BU+'convert',function(err,res,body){
      assert(res.statusCode === 404);
      assert.equal(body._,'Invalid request route.');
      cb();
    });
  },
  function(cb){
    req.post(BU+'convert',function(err,res,body){
      assert(res.statusCode === 404);
      assert.equal(body._,'Invalid request route.');
      cb();
    });
  },
  function(cb){
    req.get(BU+'convert/csv/json',function(err,res,body){
      assert(res.statusCode === 404);
      assert.equal(body._,'Invalid request route.');
      cb();
    });
  },
  function(cb){
    req.post({
      url:BU+'convert/csv/json',
      formData: { afile : require('fs').createReadStream(__dirname+'/one.csv') }
    },function(err,res,body){
      assert(res.statusCode === 200);
      assert.deepEqual(body,{ _: [ { a: '1', b: '2', c: '3' } ] });
      cb();
    });
  },
  function(cb){
    req.post(BU+'upload',function(err,res,body){
      assert(res.statusCode === 400);
      assert.equal(body._,'Parameter `method` was missing in request.');
      cb();
    });
  },
  function(cb){
    req.post({
      url:BU+'upload',
      json : { method : 'GET' }
    },function(err,res,body){
      assert(res.statusCode === 400);
      assert.equal(body._,'Value of parameter `method` must be one of `[\'POST\',\'PUT\',\'DELETE\']`.');
      cb();
    });
  },
  function(cb){
    req.post({
      url:BU+'upload',
      json : { method : 'POST' }
    },function(err,res,body){
      assert(res.statusCode === 400);
      assert.equal(body._,'Parameter `url` was missing in request.');
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
      assert.equal(body._,'Parameter `url` was missing in request.');
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
      assert(body._.indexOf('301 Moved Permanently') !== -1);
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
      assert(body._.indexOf('301 Moved Permanently') !== -1);
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
      assert.deepEqual(body,{ error: null, _ : {  _ : [ { a: '1', b: '2', c: '3' } ]  } });
      cb();
    });
  }
],function(){
  console.log('ALL PASSED...!');
});
