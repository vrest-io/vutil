
const fs = require('fs'), path = require('path'),
      allowedOptions = [
        'preambleCRLF','postambleCRLF','timeout',
        'auth','oauth','encoding','gzip'
      ],
      request = require('request').defaults({ json : true });

var CombinedStream = require('combined-stream'), uuid = require('uuid');

var setHeaders = require('request/lib/multipart').Multipart.prototype.setHeaders;

function handlePartHeader(part,chunked){
  var plk = Object.keys(part), pln = plk.length;
  var that = {
    boundary : uuid(),
    request : {
      getHeader : function(ky){
        for(var z=0;z<pln;z++){
          if(plk[z].toLowerCase()===ky.toLowerCase()){
            return (part[plk[z]]);
          }
        }
        return false;
      },
      hasHeader : function(ky){
        return Boolean(this.getHeader(ky));
      },
      setHeader : function(ky,vl){
        for(var st = true, z=0;z<pln;z++){
          if(plk[z].toLowerCase()===ky.toLowerCase()){
            part[plk[z]] = vl;
            st = false;
            break;
          }
        }
        if(st){
          part[ky] = vl;
        }
      }
    }
  };
  setHeaders.bind(that)(chunked);
  return that.boundary;
}

require('request/lib/multipart').Multipart.prototype.build = function (parts, chunked) {
  var self = this
  var body = chunked ? new CombinedStream() : []

  function add (part,boundary) {
    if (typeof part === 'number') {
      part = part.toString()
    // change part starts
    } else if(typeof part === 'object' && part) {
      if(Array.isArray(part)){
        var prvB = self.boundary;
        self.boundary = boundary;
        part = self.build(part,chunked);
        self.boundary = prvB;
      } else if(part.filePath){
        part = getFile(part,true);
      }
    }
    // change part ends
    return chunked ? body.append(part) : body.push(Buffer.from(part))
  }

  if (self.request.preambleCRLF) {
    add('\r\n')
  }


  parts.forEach(function (part) {
    var defaultBoundary = handlePartHeader(part,chunked);
    var preamble = '--' + self.boundary + '\r\n'
    Object.keys(part).forEach(function (key) {
      if (key === 'body') { return }
      preamble += key + ': ' + part[key] + '\r\n'
    })
    preamble += '\r\n'
    add(preamble)
    add(part.body,defaultBoundary)
    add('\r\n')
  })
  add('--' + self.boundary + '--')

  if (self.request.postambleCRLF) {
    add('\r\n')
  }

  return body
}

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
  } else if(typeof ab === 'object' && ab){
    if(Array.isArray(ab)){
      return ab;
    } else if(typeof ab.filePath === 'string'){
      var enc = ab.encode;
      var ret = fs.createReadStream(ab.filePath);
      if(typeof enc === 'string'){
        var enc = encoders(enc);
        if(enc){
          ret.pipe(enc);
        }
      }
      return ret;
    }
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
  if(typeof vars.params.body.options === 'object' && vars.params.body.options){
    allowedOptions.forEach(function(op){
      if(vars.params.body.options[op] !== undefined){
        toSend[op] = vars.params.body.options[op];
      }
    });
  }
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
          bds[z].body = rs;
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
