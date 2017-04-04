
const csvtojson = require('csvjson'), path = require('path'), fs = require('fs');

function func(vars,methods,req,res,next){
  fs.readFile(vars.params.body.filePath,function(error,data){
    if(error){
      next({ status : 400, message : error.message || 'FILE_NOT_FOUND' });
    } else {
      next({ output : csvtojson.toObject(data.toString()) });
    }
  });
}

module.exports = func;
