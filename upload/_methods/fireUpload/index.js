
const fs = require('fs'), path = require('path'),
      request = require('request').defaults({ json : true });

if(!GLOBAL_APP_CONFIG.dataPath) {
  GLOBAL_APP_CONFIG.dataPath = process.cwd();
}

function func(vars,methods,req,res,next){
  var formData = {}, bd = vars.params.body.body;
  if(typeof bd === 'object' && bd){
    for(var ky in bd){
      formData[ky] = bd;
    }
  }
  if(vars.params.body.filePath){
    var fl = 'file1';
    if(GLOBAL_METHODS.isAlphaNum(vars.params.body.fileKey)){
      fl = vars.params.body.fileKey;
    }
    formData[fl] =
      fs.createReadStream(path.join(GLOBAL_APP_CONFIG.dataPath,vars.params.body.filePath));
  }
  var toSend = {
    method : vars.params.body.method,
    url: vars.params.body.url,
    headers : vars.params.body.headers,
    formData: formData
  };
  if(Array.isArray(vars.params.body.multipart)){
    var bds = vars.params.body.multipart, ln = bds.length;
    for(var z=0;z<ln;z++){
      if(bds[z].body && typeof bds[z].body === 'object'
          && GLOBAL_METHODS._isStr(bds[z].body.filePath)){
            bds[z].body =
              fs.createReadStream(path.join(GLOBAL_APP_CONFIG.dataPath,bds[z].body.filePath));
      }
    }
    toSend.multipart = bds;
  }
  request(toSend,function(err,res,body){
    var rs = {};
    if(err) {
      rs.error = err;
    }
    if(body){
      rs.output = body;
    }
    if(res){
      if(res.statusCode) {
        rs.statusCode = res.statusCode;
      }
      if(!(rs.output) && res.body){
        rs.output = res.body;
      }
    }
    next(rs);
  });
}

module.exports = func;
