
const Formidable = require('formidable'), Fs = require('fs');
var form = new Formidable.IncomingForm();

function func(vars,methods,req,res){
  var allfiles = vars.params.file, cu;
  form.parse(req, function(err, fields, files) {
    for(var nm in files){
      cu = files[nm].toJSON();
      allfiles.push(cu);
    }
    req.emit('files-recieved');
  });
  return vars.params;
}

module.exports = func;
