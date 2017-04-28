
const csvtojson = require('../../modules/request/parsers/csv'),
      utils = require('../../utils'),
      path = require('path'), fs = require('fs');

function func(req,res,next){
  if(!req.body){
    return res.send(400, { message : "Invalid request payload" });
  }
  var filePath = req.body.filePath || req.body.filepath;
  if(!utils.isStr(filePath)){
    return res.send(400, { message : "Parameter `filePath` was missing in request." });
  }
  csvtojson(fs.createReadStream(req.body.filePath),req.body.options,function(err,out){
    if(err) res.send(400,{ message : err });
    else res.send({ output : out });
  });
}

module.exports = func;
