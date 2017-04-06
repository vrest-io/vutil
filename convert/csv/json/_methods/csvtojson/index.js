
const csvtojson = require('csvtojson'),
      path = require('path'), fs = require('fs');

function func(vars,methods,req,res,next){
  fs.readFile(path.join(GLOBAL_APP_CONFIG.dataPath,vars.params.body.filePath),
      function(error,data){
    if(error){
      next({ status : 400, message : error.message || 'FILE_NOT_FOUND' });
    } else {
      var out = [];
      csvtojson(vars.params.body.options).fromString(data.toString())
        .on('csv',(csvRow)=>{
          out.push(csvRow);
        })
        .on('done',()=>{
          next({ output : out });
        });
    }
  });
}

module.exports = func;
