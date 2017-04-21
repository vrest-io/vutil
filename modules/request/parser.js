var Dicer = require('dicer'),
    fs = require('fs'),
    setHeaders = require('request/lib/multipart').Multipart.prototype.setHeaders,
    streamBuffers = require('stream-buffers');

var forOnePart = function(ps,part,mainBody){
  var partResult = {
    headers: part.header,
    bodylen: part.bodylen,
    body: []
  }
  if(!Array.isArray(part.body)){
    part.body = [part.body];
  }
  mainBody.push(partResult);
  var mulHeader = isMultipartBody(part.header);
  if(mulHeader){
    var partStream = new streamBuffers.ReadableStreamBuffer({
      frequency: 10,       // in milliseconds.
      chunkSize: 2048     // in bytes.
    });
    partStream.put(part.body);
    next(partStream, partResult.body, {boundary: mulHeader}).
      on('finish',function(){
        ps.emit('_end');
    });
  } else {
    partResult.body = part.body.toString();
    ps.emit('_end');
  }
};

function isMultipartBody(header){
  if(typeof header === 'object' && header){
    var contentType = header["content-type"];
    if(contentType){
      if(Array.isArray(contentType)){
        for(var i = 0; i < contentType.length; i++){
          if(String(contentType[i]).indexOf("multipart") !== -1){
            return String(contentType[i]).replace(/.*boundary=([^\s;]+).*/, '$1');
          }
        }
      } else if(String(contentType).indexOf("multipart") !== -1){
        return String(contentType).replace(/.*boundary=([^\s;]+).*/, '$1');
      }
    }
  }

  return false;
}

function next(stream, body, opts) {
  var buffer = new Buffer(32),
      state = { preamble: undefined };

  var dicer = new Dicer(opts),
      error,
      partErrors = 0;

  dicer.on('preamble', function(p) {
    var preamble = {
      body: undefined,
      bodylen: 0,
      error: undefined,
      header: undefined
    };

    p.on('header', function(h) {
      preamble.header = h;
    }).on('data', function(data) {
      // make a copy because we are using readSync which re-uses a buffer ...
      var copy = new Buffer(data.length);
      data.copy(copy);
      data = copy;
      if (!preamble.body)
        preamble.body = [ data ];
      else
        preamble.body.push(data);
      preamble.bodylen += data.length;
    }).on('error', function(err) {
      preamble.error = err;
    }).on('end', function() {
      if (preamble.body)
        preamble.body = Buffer.concat(preamble.body, preamble.bodylen);
      if (preamble.body || preamble.header)
        state.preamble = preamble;
    });
  });
  function checkLastAndFinish(){
    if(allevs === 0){
      dicer.emit('_finish');
    }
  }
  var allevs = 0;
  dicer.on('part', function(ps) {
    allevs++;
    var part = {
      body: undefined,
      bodylen: 0,
      error: undefined,
      header: undefined
    };

    ps.on('header', function(h) {
      part.header = h;
    }).on('data', function(data) {
      if (!part.body)
        part.body = [ data ];
      else
        part.body.push(data);
      part.bodylen += data.length;
    }).on('error', function(err) {
      part.error = err;
      ++partErrors;
    }).on('end', function() {
      if (part.body)
        part.body = Buffer.concat(part.body, part.bodylen);
      forOnePart(ps,part,body);
    }).on('_end', function() {
      allevs--;
      checkLastAndFinish();
    });
  }).on('error', function(err) {
    error = err;
  }).on('finish', function() {
    checkLastAndFinish();
  });

  stream.pipe(dicer);
  return dicer;
}

next.isMultipartBody = isMultipartBody;
module.exports = next;
