const jsonBody = require("body/json");

function func(vars,methods,req,res){
  var func = function(err,json){
    if(typeof json === 'object' && json !== null){
      vars.params.body = json;
    }
    console.log('emittting... ', vars.requestId);
    req.emit('body-recieved');
  };
  jsonBody(req,res,func);
  return vars.params;
}

module.exports = func;
