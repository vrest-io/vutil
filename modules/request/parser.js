var Dicer = require('dicer'),
    fs = require('fs'),
    streamBuffers = require('stream-buffers');

function parseFromRequire(type,cont,next){
  switch(type){
    case 'csv' : return require('./parsers/csv')(cont,{},next);
    case 'xml' : return require('./parsers/xml')(cont,{},next);
    case 'json' : return require('./parsers/json')(cont,{},next);
    default : return require('./parsers/default')(cont,{},next);
  }
}

function getContentTypeKey(hdr){
  if(String(hdr).indexOf("json") !== -1){
    return 'json';
  } else if(String(hdr).indexOf("csv") !== -1){
    return 'json';
  } else if(String(hdr).indexOf("xml") !== -1){
    return 'xml';
  }
}

var parser = {
  isMultipartBody: function(header,cont){
    if(typeof header === 'object' && header){
      var contentType = header["content-type"];
      var bndr,hdk;
      if(contentType){
        if(Array.isArray(contentType)){
          for(var i = 0; i < contentType.length; i++){
            if(String(contentType[i]).indexOf("multipart") !== -1){
              bndr = String(contentType[i]).replace(/.*boundary=([^\s;]+).*/, '$1');
            } else {
              hdk = getContentTypeKey(String(contentType[i]));
            }
          }
        } else if(String(contentType).indexOf("multipart") !== -1){
          bndr = String(contentType).replace(/.*boundary=([^\s;]+).*/, '$1');
        } else {
          hdk = getContentTypeKey(String(contentType[i]));
        }
      }
      if(bndr){
        if(cont) return [bndr,hdk];
        else return bndr;
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

  handlePart: function(p, state, dicer, parserObject){
    var part = {
      body: undefined,
      bodylen: 0,
      error: undefined,
      header: undefined
    }, parseType;

    p.on('header', function(h) {
      if(!p.isMultipart){
        part.header = h;
        var mulres = parser.isMultipartBody(h,cont);
        var boundary = mulres[0];
        parseType = mulres[1];
        if(boundary){
          //dicer.setBoundary(boundary);
          part.body = {};
          p.isMultiPart = true;
          dicer.mainDicer.evs++;
          var d = parser.parse(part, part.body, {
            parserObject : parserObject,
            boundary: boundary
          }, dicer.mainDicer);
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
      part.body = parseFromRequire(parseType, part.body, function(err,body){
        if(err){
          part.parserError = err;
        }
        if(body !== undefined){
          part.body = body;
        }
        state.parts.push(part);
        dicer.emit('one_finish');
      });
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
      mainDicer = dicer;
      mainDicer.evs = 1;
    }
    dicer.mainDicer = mainDicer;
    dicer.b = opts.boundary;
    dicer.on('preamble', function(p) {
      parser.handlePreamble(p, state, dicer);
    });
    dicer.on('part', function(p) {
      parser.handlePart(p, state, dicer, opts.parserObject);
    }).on('error', function(err) {
      console.log("err", err);
      error = err;
    }).on('one_finish', function(){
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
