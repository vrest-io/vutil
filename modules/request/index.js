
const fs = require('fs'), path = require('path'),
  querystring = require('querystring'),
  parser = require('./parser'),
  utils = require('../../utils'),
  allowedOptions = [
    'preambleCRLF','postambleCRLF','timeout',
    'auth','oauth','encoding','gzip'
  ],
  request = require('request').defaults({ json : true }),
  CombinedStream = require('combined-stream'), uuid = require('uuid'),
  setHeaders = require('request/lib/multipart').Multipart.prototype.setHeaders,
  FormData = require('form-data/lib/form_data');

FormData.prototype.getBoundary = function(){
  if (!this._boundary) {
    this._generateBoundary();
  }

  return this._boundary;
};

function getContentType(headers){
  for(var key in headers){
    if(key.toLowerCase() === "content-type") return headers[key];
  }
  return null;
}

function getParsedResponse(opts,res, parserObject){
  var stream = parser.parse(res, null, null, {
    parserObject: parserObject,
    boundary: parser.isMultipartBody(opts.headers),
    contentType: getContentType(opts.headers)
  });
  return stream;
}

const encoders = function(ab){
  try {
    return require(ab).encode();
  } catch(erm) {
    return false;
  }
};

const getParamValue = function(obj){

  if(typeof obj === "object" && obj !== null && typeof obj.filePath === 'string'){
    var enc = obj.encode;
    var st;

    try {
      st = fs.accessSync(obj.filePath, fs.constants.F_OK);
    } catch(er){ return false; }

    var ret = fs.createReadStream(obj.filePath);
    if(typeof enc === 'string'){
      var enc = encoders(enc);
      if(enc){
        ret.pipe(enc);
      }
    }
    return ret;
  } else {
    return obj;
  }
};

function handlePartHeader(part, chunked){
  if(Array.isArray(part.body) && part.body.length > 1){
    var plk = Object.keys(part), pln = plk.length;
    var that = {
      boundary : uuid(),
      request : {
        getHeader : function(ky){
          for(var z = 0; z < pln; z++){
            if(plk[z].toLowerCase() === ky.toLowerCase()){
              return (part[plk[z]]);
            }
          }
          return false;
        },
        hasHeader : function(ky){
          return Boolean(this.getHeader(ky));
        },
        setHeader : function(ky, vl){
          for(var st = true, z = 0; z < pln; z++){
            if(plk[z].toLowerCase() === ky.toLowerCase()){
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
  } else {
    return undefined;
  }
}

require('request/lib/multipart').Multipart.prototype.build = function (parts, chunked) {
  var self = this
  var body = chunked ? new CombinedStream() : []

  function add(part, boundary) {
    if (typeof part === 'number') {
      part = part.toString()
    // change part starts
    } else if(typeof part === 'object' && part) {
      if(Array.isArray(part)){
        if(boundary !== undefined){
          var prvB = self.boundary;
          self.boundary = boundary;
        }
        part = self.build(part,chunked);
        if(boundary !== undefined){
          self.boundary = prvB;
        }
      } else if(part.filePath){
        var filePath = part.filePath;
        var part = getParamValue(part);
        if(part === false){
          self.request.emit('error', new Error('File path not found at `' + filePath + '`'));
          part = '';
        }
      }
    }
    // change part ends
    return chunked ? body.append(part) : body.push(Buffer.from(part))
  }

  if (self.request.preambleCRLF) {
    add('\r\n')
  }


  parts.forEach(function (part) {
    if(typeof part.headers === 'object' && part.headers !== null){
      Object.keys(part.headers).forEach(function(key){
        part[key] = part.headers[key];
      });
      delete part.headers;
    }
    var defaultBoundary = handlePartHeader(part, chunked);
    var preamble = '--' + self.boundary + '\r\n'
    if(typeof part === 'object' && part !== null){
      Object.keys(part).forEach(function (key) {
        if (key === 'body') { return }
        preamble += key + ': ' + part[key] + '\r\n'
      })
    }
    preamble += '\r\n'
    add(preamble)
    add(part.body, defaultBoundary)
    add('\r\n')
  })
  add('--' + self.boundary + '--')

  if (self.request.postambleCRLF) {
    add('\r\n')
  }

  return body;
}

/*
 * fileForm {
 *  filePath : <path of file>
 *  encode : <encoding>
 *  body : ArrayOf(fileForm)
 * }
 *
 * request payload
 *
 * url : <url>
 * method : <method>
 * headers : {}
 * json : {
 *  data for json payload
 * }
 * formData : {
 *  // Pass a simple key-value pair
    my_field: 'my_value',
    // Pass multiple values /w an Array
    attachments: [
      <fileForm>
      <fileForm>
    ]
 * },
 * multipart : ArrayOf(fileForm)
 * options : {
 *  above available options plus parseResponse to parse multipart response
 * }
 *
 * */


function func(req,res,next){
  if(!req.body){
    return res.send(400, { message : "Invalid request payload" });
  }
  if(!utils.isStr(req.body.url)){
    return res.send(400, { message : "Parameter `url` was missing in request." });
  }
  if(!utils.isStr(req.body.method)){
    return res.send(400, { message : "Parameter `method` was missing in request." });
  }
  var formData = {}, rs, kl, kn, bd = req.body.formData;
  if(typeof bd === 'object' && bd){
    for(var ky in bd){
      kn = bd[ky];
      if(ky === 'attachments' && Array.isArray(kn)){
        kl = kn.length;
        for(var z = 0; z < kl; z++){
          rs = getParamValue(kn[z]);
          if(rs) {
            kn[z] = rs;
          } else {
            return res.send(400, { message : 'File "' + kn[z] +'" to upload not found.' });
          }
        }
        formData["attachments"] = kn;
      } else {
        formData[ky] = getParamValue(kn);
      }
    }
  }

  var requestOptions = req.body.requestOptions;

  var toSend = {
    method : req.body.method,
    url: req.body.url,
    headers : req.body.headers || {}
  };

  if(req.headers.authorization && (!requestOptions || !requestOptions.oauth)){
    toSend.headers.authorization = req.headers.authorization;
  }

  if(typeof req.body.requestOptions === 'object' && req.body.requestOptions){
    allowedOptions.forEach(function(op){
      if(req.body.requestOptions[op] !== undefined){
        toSend[op] = req.body.requestOptions[op];
      }
    });
  }

  if(Object.keys(formData).length){
    toSend.formData = formData;
  }

  var jsn = req.body.json;
  if(typeof jsn === 'object' && jsn !== null && Object.keys(jsn).length){
    toSend.json = jsn;
  }

  if(Array.isArray(req.body.multipart)){
    var bds = req.body.multipart, ln = bds.length;
    for(var z = 0; z < ln; z++){
      if(bds[z].body && typeof bds[z].body === 'object' && utils.isStr(bds[z].body.filePath)){
        rs = getParamValue(bds[z].body);
        if(rs){
          bds[z].body = rs;
        } else {
          return res.send(400, { message : "File to upload not found at path `" + bds[z].body.filePath + "`." });
        }
      }
    }
    toSend.multipart = bds;
  }

  var ars = {},
      toParse = utils.lastValue(req.body, 'responseOptions', 'parse'),
      processMap = utils.lastValue(req.body, 'responseOptions', 'process') || {},
      mainRequest = null,
      statusCode = 0;

  var send = function(body){
    res.send({
      body: body,
      headers: mainRequest.response && mainRequest.response.headers,
      statusCode: mainRequest.response && mainRequest.response.statusCode
    });
  };

  var cbs = function(err, rs, body){
    send(err || body || (rs && res.body));
  };

  if(toParse === true){
    mainRequest = request(toSend);

    mainRequest.once('response',function(){
      var opts = {
        headers : mainRequest.response.headers
      }

      var stream = getParsedResponse(opts, mainRequest, processMap);
      stream.once('_finish', function(state){
        send(state);
      });
    });
    mainRequest.once('error',function(err){
      console.log("error", err);
      send = function(){};
      res.send(400, { message : err.message || err })
    });
  } else {
    mainRequest = request(toSend, cbs);
  }
}

module.exports = func;
