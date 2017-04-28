var Dicer = require('dicer'),
    fs = require('fs'),
    parsersMap = {
      "csv2json": require('./parsers/csv2json'),
      "xml2json": require('./parsers/xml2json'),
      json: require('./parsers/json'),
      blank: require('./parsers/blank'),
      base64: require('./parsers/base64'),
      checksum: require('./parsers/checksum'),
      string: require('./parsers/string')
    },
    streamBuffers = require('stream-buffers');

function isBinary(content){
  //return /[\x00-\x1F\x80-\xFF]/.test(content);
  var result = content.match(/[\x00-\x1F\x80-\xFF]/);
  return result;
}

function getDefaultProcessor(contentType, content){
  var processor = null;
  if(contentType.indexOf("json") !== -1){
    processor = "json";
  } else if(contentType.indexOf("xml") !== -1){
    processor = "xml2json";
  } else if(contentType.indexOf("csv") !== -1){
    processor = "csv2json";
  } else if(isBinary(content)){
    processor = "checksum";
  } else {
    processor = "string";
  }

  return processor;
}

function parseFromRequire(contentType, parserObject, content, next){
  contentType = contentType.toLowerCase();
  var keys = Object.keys(parserObject), i, count, key;
  var processor = null, opts = {};
  for(i = 0, count = keys.length; i < count; i++){
    key = keys[i].toLowerCase();
    if(contentType.indexOf(key) !== -1){
      processor = parserObject[keys[i]]; //do not change keys[i] to key here
      if(typeof processor === 'object'){
        processor = processor.processor;
        if(processor.options){
          opts = processor.options;  
        }
      }
      break;
    }
  }

  if(!processor){ //if no processor for this content type specified, pick a default one
    processor = getDefaultProcessor(contentType, content);
  }

  if(parsersMap[processor]){ //if processor found
    return parsersMap[processor](content, opts, next);
  } else {
    return next('Processor "'+processor+'" not found.');
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
              hdk = String(contentType[i]);
            }
          }
        } else if(String(contentType).indexOf("multipart") !== -1){
          bndr = String(contentType).replace(/.*boundary=([^\s;]+).*/, '$1');
        } else {
          hdk = String(contentType[i]);
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
    }, contentType;

    p.on('header', function(h) {
      if(!p.isMultipart){
        part.header = h;
        var mulres = parser.isMultipartBody(h, true);
        var boundary = mulres[0];
        contentType = mulres[1];
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
        parseFromRequire(contentType, parserObject, part.body, function(err, body){
          if(err){
            part.parserError = err;
          }
          if(body !== undefined){
            part.body = body;
          }
          dicer.emit('part_end');
        });
      } else {
        dicer.emit('part_end');
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
