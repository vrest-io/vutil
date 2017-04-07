
const fs = require('fs'), path = require('path'),
      request = require('request').defaults({ json : true });

function func(vars,methods,req,res,next){
  var formData = {}, kl, kn, bd = vars.params.body.body;
  if(typeof bd === 'object' && bd){
    for(var ky in bd){
      if(ky === 'attachments' && Array.isArray(bd[ky])){
        kn = bd[ky], kl = kn.length;
        for(var z=0;z<kl;z++){
          if(typeof kn[z] === 'string'){
            kn[z] = fs.createReadStream(kn[z]);
          }
        }
      } else {
        formData[ky] = bd;
      }
    }
  }
  if(vars.params.body.filePath){
    var fl = 'file1';
    if(GLOBAL_METHODS._isStr(vars.params.body.fileKey)
        && GLOBAL_METHODS.isAlphaNum(vars.params.body.fileKey)){
      fl = vars.params.body.fileKey;
    }
    formData[fl] =
      fs.createReadStream(vars.params.body.filePath);
  }
  var toSend = {
    method : vars.params.body.method,
    url: vars.params.body.url,
    headers : vars.params.body.headers
  };
  if(Object.keys(formData).length){
    toSend.formData = formData;
  }
  var jsn = vars.params.body.json;
  if(typeof jsn === 'object' && jsn !== null && Object.keys(json).length){
    toSend.json = jsn;
  }
  if(Array.isArray(vars.params.body.multipart)){
    var bds = vars.params.body.multipart, ln = bds.length;
    for(var z=0;z<ln;z++){
      if(bds[z].body && typeof bds[z].body === 'object'
          && GLOBAL_METHODS._isStr(bds[z].body.filePath)){
            bds[z].body =
              fs.createReadStream(bds[z].body.filePath);
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
