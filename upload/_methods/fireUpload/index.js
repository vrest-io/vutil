
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
  request({
    method : vars.params.body.method,
    url: vars.params.body.url,
    headers : vars.params.body.headers,
    formData: formData
  },function(err,res,body){
    var rs = {};
    if(err) {
      rs.error = err;
    }
    if(body){
      rs.output = body;
    }
    if(res){
      if(res.statusCode) {
        rs.statusCode = res.statusCode;
      }
      if(!(rs.output) && res.body){
        rs.output = res.body;
      }
    }
    next(rs);
  });
}

module.exports = func;
