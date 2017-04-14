var path = require("path"), fs = require("fs"),
mmm = require("mmmagic");

function sendError(res,msg,st){
  res.writeHead(st, {"Content-Type": "application/json"});
  res.write('{"error":"'+msg+'."}');
  res.end();
}

function func(req, res) {

  var filename = req.query.filename;
  if(typeof filename !== 'string' || !filename.length){
    return sendError(res,'`filename` is a required query parameter', 400);
  }

  fs.stat(filename, function(err, stats) {
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
    magic.detectFile(filename, function(err, contentType) {
      if(err) return sendError(res, 'Error while detecting the mime type for file.', 400);
      if(contentType.indexOf("text") === -1){
        return sendError(res, 'File type not supported', 400);
      }

      fs.readFile(filename, function(err, file) {
        if(err) {
          return sendError(res, err.message || err, 501);
        }
        
        if(filename.endsWith('json')){
          res.writeHead(200, { "Content-Type": "application/json" });
        } else if(filename.endsWith('xml')){
          res.writeHead(200, { "Content-Type": "application/xml" });
        } else {
          res.writeHead(200, { "Content-Type": contentType });
        }

        res.write(file);
        res.end();
      });
    });
  });
}

module.exports = func;
