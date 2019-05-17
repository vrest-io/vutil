var Dicer = require('dicer'),
  Readable = require('stream').Readable,
  fs = require('fs'),
  parsersMap = {
    "csv2json": require('./parsers/csv2json'),
    "xml2json": require('./parsers/xml2json'),
    "xls2json": require('./parsers/xls2json'),
    json: require('./parsers/json'),
    blank: require('./parsers/blank'),
    base64: require('./parsers/base64'),
    checksum: require('./parsers/checksum'),

    string: require('./parsers/string')
  },
  //http://stackoverflow.com/questions/1677644/detect-non-printable-characters-in-javascript
  forBin = /[\x00-\x08\x0E-\x1F]/,
  streamBuffers = require('stream-buffers');

function isBinary(content) {
  return Boolean(content.match(forBin));
}

function arrayOrSingle(inp) {
  if (Array.isArray(inp) && inp.length === 1) return inp[0];
  else return inp;
}

function patchHeaders(headers) {
  var result = {};
  for (var name in headers) {
    result[name] = arrayOrSingle(headers[name]);
  }
  return result;
}

function getDefaultProcessor(contentType, content) {
  var processor = null;
  if (contentType.indexOf("json") !== -1) {
    processor = "json";
  } else if (contentType.indexOf("xml") !== -1) {
    processor = "xml2json";
  } else if (contentType.indexOf("csv") !== -1) {
    processor = "csv2json";
  } else if (isBinary(content)) {
    processor = "checksum";
  } else {
    processor = "string";
  }

  return processor;
}

function parseFromRequire(contentType, parserObject, content, next) {
  if (contentType) {
    contentType = contentType.toLowerCase();
    var keys = Object.keys(parserObject),
      i, count, key;
    var processor = null,
      opts = {};

    var handleProcessor = function () {
      if (typeof processor === 'object') {
        if (processor.options) {
          opts = processor.options;
        }
        processor = processor.processor;
      }
    };

    for (i = 0, count = keys.length; i < count; i++) {
      key = keys[i].toLowerCase();
      if (contentType.indexOf(key) !== -1) {
        processor = parserObject[keys[i]]; //do not change keys[i] to key here
        handleProcessor();
        break;
      }
    }

    if (!processor && parserObject["default"]) {
      processor = parserObject["default"];
      handleProcessor();
    }

    if (!processor) { //if no processor for this content type specified, pick a default one
      processor = getDefaultProcessor(contentType, content);
    }

    if (parsersMap[processor]) { //if processor found
      return parsersMap[processor](content, opts, next);
    } else {
      return next('Processor "' + processor + '" not found.');
    }
  } else {
    return next(null, content);
  }
}

function finish(dicer) {
  if (dicer.evs === 0 && dicer.parts === 0) {
    dicer.emit("_finish", dicer.state);
  }
}

var parser = {
  isMultipartBody: function (header, cont) {
    if (typeof header === 'object' && header) {
      var contentType = header["content-type"];
      var bndr, hdk;
      if (contentType) {
        if (Array.isArray(contentType)) {
          for (var i = 0; i < contentType.length; i++) {
            if (String(contentType[i]).indexOf("multipart") !== -1) {
              bndr = String(contentType[i]).replace(/.*boundary=([^\s;]+).*/, '$1');
            } else {
              hdk = String(contentType[i]);
            }
          }
        } else if (String(contentType).indexOf("multipart") !== -1) {
          bndr = String(contentType).replace(/.*boundary=([^\s;]+).*/, '$1');
        } else {
          hdk = String(contentType[i]);
        }
      }
      if (bndr || hdk) {
        if (cont) return [bndr, hdk];
        else return bndr;
      }
    }

    return false;
  },

  handlePreamble: function (p, state, dicer) {
    var preamble = {
      body: undefined,
      bodylen: 0,
      error: undefined,
      headers: undefined
    };

    p.on('header', function (h) {
      preamble.headers = patchHeaders(h);
    }).on('data', function (data) {
      // make a copy because we are using readSync which re-uses a buffer ...
      var copy = new Buffer(data.length);
      data.copy(copy);
      data = copy;
      if (!preamble.body)
        preamble.body = [data];
      else
        preamble.body.push(data);
      preamble.bodylen += data.length;
    }).on('error', function (err) {
      preamble.error = err;
    }).on('end', function () {
      if (preamble.body)
        preamble.body = Buffer.concat(preamble.body, preamble.bodylen).toString();
      if (preamble.body || preamble.header)
        state.preamble = preamble;
    });
  },

  handlePart: function (p, state, dicer, parserObject) {
    var part = {
        body: undefined,
        bodylen: 0,
        error: undefined,
        headers: undefined
      },
      contentType;

    p.on('header', function (h) {
      if (!p.isMultipart) {
        part.headers = patchHeaders(h);
        var mulres = parser.isMultipartBody(h, true);
        var boundary = mulres[0];
        contentType = mulres[1];
        if (boundary) {
          //dicer.setBoundary(boundary);
          part.body = {};
          p.isMultiPart = true;
          dicer.mainDicer.evs++;
          var d = parser.parse(p, part, part.body, {
            parserObject: parserObject,
            boundary: boundary
          }, dicer.mainDicer);
        }
      }
    }).on('data', function (data) {
      if (!p.isMultiPart) {
        if (!part.body)
          part.body = [data];
        else
          part.body.push(data);
        part.bodylen += data.length;
      }
    }).on('error', function (err) {
      if (!p.isMultiPart) {
        part.error = err;
        ++partErrors;
      }
    }).on('end', function () {
      if (!p.isMultiPart) {
        if (part.body) {
          part.body = Buffer.concat(part.body, part.bodylen);
        }
        parseFromRequire(contentType, parserObject, part.body, function (err, body) {
          if (err) {
            part.parserError = err;
          }
          if (body !== undefined) {
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

  parse: function (stream, mainPart, state, opts, mainDicer) {
    if (opts.boundary) { //if multipart body
      state = state || {};
      state.parts = [];
      state.preamble = undefined;

      var dicer = new Dicer(opts),
        error,
        partErrors = 0;

      if (!mainDicer) {
        mainDicer = dicer;
        mainDicer.state = state;
        mainDicer.parts = 0;
        mainDicer.evs = 1;
      }
      dicer.mainDicer = mainDicer;
      dicer.b = opts.boundary;
      dicer.on('preamble', function (p) {
        parser.handlePreamble(p, state, dicer);
      });
      dicer.on('part', function (p) {
        mainDicer.parts++;
        parser.handlePart(p, state, dicer, opts.parserObject);
      }).on('part_end', function () {
        mainDicer.parts--;
        finish(mainDicer);
      }).on('error', function (err) {
        console.log("err", err);
        error = err;
      }).on('finish', function () {
        if (mainPart) {
          var len = 0;
          for (var i = 0, count = state.parts.length; i < count; i++) {
            len += state.parts[i].bodylen;
          }
          mainPart.bodylen = len;
        }
        mainDicer.evs--;
        finish(mainDicer);
      });
      stream.pipe(dicer);
      return dicer;
    } else {
      var body = [],
        bodylen = 0;
      stream.on('data', function (data) {
        body.push(data);
        bodylen += data.length;
      });
      stream.on('end', function () {
        body = Buffer.concat(body, bodylen);
        parseFromRequire(opts.contentType, opts.parserObject, body, function (err, body) {
          var result = err;
          if (!result && body !== undefined) {
            result = body;
          }
          stream.emit('_finish', result);
        });
      });
      return stream;
    }
  }
};

module.exports = parser;