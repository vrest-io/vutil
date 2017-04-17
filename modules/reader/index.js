var path = require("path"), fs = require("fs"), mmm;
try{
  mmm = require("mmmagic");
} catch(er){
  var Magic = function(){};
  Magic.prototype.detectFile = function(path,cb){
    cb(null,'text/plain');
  };
  mmm = { Magic : Magic };
}

function sendError(res,msg,st){
  res.writeHead(st, {"Content-Type": "application/json"});
  res.write('{"error":"'+msg+'."}');
  res.end();
}

function func(req, res) {

  var fileName = req.query.fileName;
  if(typeof fileName !== 'string' || !fileName.length){
    return sendError(res,'`fileName` is a required query parameter', 400);
  }

  fs.stat(fileName, function(err, stats) {
    if(err) {
      if(err.code === "ENOENT"){
        return sendError(res, "File Not Found", 404);
      }
      return sendError(res, err.message || err, 400);
    }

    if (!(stats.isFile())) {
      return sendError(res,"The path is a directory. Please provide a path of file", 400);
    }

    var magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);
    magic.detectFile(fileName, function(err, contentType) {
      if(err) return sendError(res, 'Error while detecting the mime type for file.', 400);
      fs.readFile(fileName, function(err, file) {
        if(err) {
          return sendError(res, err.message || err, 501);
        }

        if(fileName.endsWith('json')){
          res.writeHead(200, { "Content-Type": "application/json" });
        } else if(fileName.endsWith('xml')){
          res.writeHead(200, { "Content-Type": "application/xml" });
        } else {
          res.writeHead(200, {
            "Content-Type": String(req.body.defaultContentType || contentType)
          });
        }

        res.write(file);
        res.end();
      });
    });
  });
}

module.exports = func;
