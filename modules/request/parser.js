var Dicer = require('dicer'),
    fs = require('fs'),
    streamBuffers = require('stream-buffers');

var parser = {
  isMultipartBody: function(header){
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
  },

  handlePreamble: function(p, state, dicer){
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
        preamble.body = Buffer.concat(preamble.body, preamble.bodylen).toString();
      if (preamble.body || preamble.header)
        state.preamble = preamble;
    });
  },

  handlePart: function(p, state, dicer){
    var part = {
      body: undefined,
      bodylen: 0,
      error: undefined,
      header: undefined
    };

    p.on('header', function(h) {
      if(!p.isMultipart){
        part.header = h;
        var boundary = parser.isMultipartBody(h);
        if(boundary){
          //dicer.setBoundary(boundary);
          part.body = {};
          p.isMultiPart = true;
          dicer.mainDicer.evs++;
          var d = parser.parse(part, part.body, {boundary: boundary}, dicer.mainDicer);
          p.pipe(d);
        }
      }
    }).on('data', function(data) {
      if(!p.isMultiPart){
        if (!part.body)
          part.body = [ data ];
        else
          part.body.push(data);
        part.bodylen += data.length;  
      }
    }).on('error', function(err) {
      if(!p.isMultiPart){
        part.error = err;
        ++partErrors;  
      }
    }).on('end', function() {
      if(!p.isMultiPart){
        if (part.body)
          part.body = Buffer.concat(part.body, part.bodylen).toString();
      }
      state.parts.push(part);
    });
  },
  
  parse: function(mainPart, state, opts, mainDicer) {
    var buffer = new Buffer(32);
    state.parts = [];
    state.preamble = undefined;

    var dicer = new Dicer(opts),
        error,
        partErrors = 0;
    if(!mainDicer) {
      mainDicer.evs = 1;
      mainDicer = dicer;
    }
    dicer.mainDicer = mainDicer;
    dicer.b = opts.boundary;
    dicer.on('preamble', function(p) {
      parser.handlePreamble(p, state, dicer);
    });
    dicer.on('part', function(p) {
      parser.handlePart(p, state, dicer);
    }).on('error', function(err) {
      console.log("err", err);
      error = err;
    }).on('finish', function(){
      if(mainPart){
        var len = 0; 
        for(var i = 0, count = state.parts.length; i < count; i++){
          len += state.parts[i].bodylen;
        }
        mainPart.bodylen = len;
      }
      mainDicer.evs--;
      if(mainDicer.evs === 0){
        mainDicer.emit("_finish");
      }
    });

    return dicer;
  }  
};

module.exports = parser;