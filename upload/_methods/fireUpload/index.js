
const fs = require('fs'), request = require('request').defaults({ json : true });

function func(vars,methods,req,res,next){
  var formData = {}, bd = vars.params.body.body;
  if(typeof bd === 'object' && bd){
    for(var ky in bd){
      formData[ky] = bd;
    }
  }
  if(vars.params.body.filePath){
    var fl = 'file1';
    if(GLOBAL_METHODS.isAlphaNum(vars.params.body.fileKey)){
      fl = vars.params.body.fileKey;
    }
    formData[fl] = fs.createReadStream(vars.params.body.filePath);
  }
  request.post({
    url:vars.params.body.url,
    formData: formData
  },function(err,res,body){
    next({ error : err, _ : (body || (res && res.body))});
  });
}

module.exports = func;
