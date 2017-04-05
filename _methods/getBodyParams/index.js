const jsonBody = require("body/json");
const formBody = require("body/form");

function func(vars,methods,req,res){
  var func = function(err,json){
    if(!err && typeof json === 'object' && json !== null){
      methods.assign(vars.params.body,json);
    }
    req.emit('body-recieved');
  };
  var cnt = req.headers['content-type'];
  if(typeof cnt === 'string' && cnt.indexOf('encoded') !== -1){
    formBody(req,vars.params.body,func);
  } else {
    jsonBody(req,res,func);
  }
  return vars.params;
}

module.exports = func;
