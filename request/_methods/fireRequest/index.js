
const fs = require('fs'), path = require('path'),
      request = require('request').defaults({ json : true });

const encoders = function(ab){
  try {
    return require(ab).encode();
  } catch(erm) {
    return false;
  }
};

const getFile = function(ab,nostr){
  if(typeof ab === 'string'){
    return nostr ? ab : fs.createReadStream(ab);
  } else if(typeof ab === 'object' && ab && typeof ab.filePath === 'string'){
    var enc = ab.encode;
    var ret = fs.createReadStream(ab.filePath);
    if(typeof enc === 'string'){
      var enc = encoders(enc);
      if(enc){
        ret.pipe(enc);
      }
    }
    return ret;
  } else {
    return false;
  }
};

function func(vars,methods,req,res,next){
  var formData = {}, rs, kl, kn, bd = vars.params.body.formData;
  if(typeof bd === 'object' && bd){
    for(var ky in bd){
      if(ky === 'attachments' && Array.isArray(bd[ky])){
        kn = bd[ky], kl = kn.length;
        for(var z=0;z<kl;z++){
          rs = getFile(kn[z]);
          if(rs) { kn[z] = rs; }
        }
      } else {
        formData[ky] = getFile(bd,true);
      }
    }
  }
  if(vars.params.body.filePath){
    var fl = 'file1';
    if(GLOBAL_METHODS._isStr(vars.params.body.fileKey)
        && GLOBAL_METHODS.isAlphaNum(vars.params.body.fileKey)){
      fl = vars.params.body.fileKey;
    }
    rs = getFile(vars.params.body);
    if(rs) {
      formData[fl] = rs;
    }
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
        rs = getFile(bds[z].body);
        if(rs){
          bds[z].body = getFile(bds[z].body);
        }
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
