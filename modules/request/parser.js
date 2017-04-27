var Dicer = require('dicer'),
    fs = require('fs'),
    parsersMap = {
      csv:require('./parsers/csv'),
      xml:require('./parsers/xml'),
      json:require('./parsers/json'),
      blank:require('./parsers/blank'),
      default:require('./parsers/default')
    },
    streamBuffers = require('stream-buffers');

function parseFromRequire(type, cont, next){
  var tp;
  if(typeof type === 'string'){
    tp = type;
  } else if(typeof type.processor === 'string'){
    tp = type.processor;
  }
  switch(tp){
    case 'csv' : return parsersMap.csv(cont, type.options || {}, next);
    case 'xml' : return parsersMap.xml(cont, type.options || {}, next);
    case 'json' : return parsersMap.json(cont, type.options || {}, next);
    case 'blank' : return parsersMap.blank(cont, type.options || {}, next);
    default : return parsersMap.default(cont, (type && type.options || {}), next);
  }
}

function getContentTypeKey(hdr){
  if(String(hdr).indexOf("json") !== -1){
    return 'json';
  } else if(String(hdr).indexOf("csv") !== -1){
    return 'csv';
  } else if(String(hdr).indexOf("xml") !== -1){
    return 'xml';
  }
}

function finish(dicer){
  if(dicer.evs === 0 && dicer.parts === 0){
    dicer.emit("_finish");
  }
}

var parser = {
  isMultipartBody: function(header, cont){
    if(typeof header === 'object' && header){
      var contentType = header["content-type"];
      var bndr, hdk;
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
      if(bndr || hdk){
        if(cont) return [bndr, hdk];
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
        var mulres = parser.isMultipartBody(h, true);
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
        if (part.body){
          part.body = Buffer.concat(part.body, part.bodylen).toString();
        }
        parseFromRequire(parserObject[parseType], part.body, function(err, body){
          if(err){
            part.parserError = err;
          }
          if(body !== undefined){
            part.body = body;
          }
          dicer.emit('part_end');
        });
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
      mainDicer = dicer;
      mainDicer.parts = 0;
      mainDicer.evs = 1;
    }
    dicer.mainDicer = mainDicer;
    dicer.b = opts.boundary;
    dicer.on('preamble', function(p) {
      parser.handlePreamble(p, state, dicer);
    });
    dicer.on('part', function(p) {
      mainDicer.parts++;
      parser.handlePart(p, state, dicer, opts.parserObject);
    }).on('part_end', function(){
      mainDicer.parts--;
      finish(mainDicer);
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
      finish(mainDicer);
    });

    return dicer;
  }
};

module.exports = parser;
