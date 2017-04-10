
const csvtojson = require('csvtojson'),
      utils = require('../../utils'),
      path = require('path'), fs = require('fs');

function func(req,res,next){
  if(!req.body){
    return res.send(400, { message : "Invalid request payload" });
  }
  if(!utils.isStr(req.body.filePath)){
    return res.send(400, { message : "Parameter `filePath` was missing in request." });
  }
  fs.readFile(req.body.filePath, function(error,data){
    if(error){
      res.send(400,{ message : error.message || 'FILE_NOT_FOUND' });
    } else {
      var out = [];
      var checkOn, c2j = csvtojson(req.body.options).fromString(data.toString());
      switch(req.body.options.recordType){
        case 'object':
          checkOn = 'json';
          break;
        default :
          checkOn = 'csv';
      }
      c2j.on(checkOn,(csvRow)=>{
        out.push(csvRow);
      });
      .on('done',()=>{
        res.send({ output : out });
      });
    }
  });
}

module.exports = func;
