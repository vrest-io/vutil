var path = require("path"), fs = require("fs");

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

  fs.stat(filename, function(err,exists) {
    if(err) {
      return sendError(res, err.message || err, 401);
    }
    if(!exists) {
      return sendError(res, "File Not Found", 404);
    }

    if (!(exists.isFile())) {
      return sendError(res,"The path is a directory. Please provide a path of file", 406);
    }

    fs.readFile(filename, function(err, file) {
      if(err) {
        return sendError(res, err.message || err, 401);
      }

      if(filename.endsWith('json')){
        res.writeHead(200, { "Content-Type": "application/json" });
      } else if(filename.endsWith('xml')){
        res.writeHead(200, { "Content-Type": "application/xml" });
      } else {
        res.writeHead(200, { "Content-Type": "text/plain" });
      }

      res.write(file);
      res.end();
    });
  });
}

module.exports = func;
