
const exec = require('child_process').exec;
const utils = require('../../utils');

function func(req,res,next){
  if(!req.body || !(utils.isStr(req.body.command))){
    return res.send(400,{ message: 'Parameter `command` was missing in request.' });
  }
  var error = null, childProcess = null;
  var result = {
  };
  childProcess = exec(req.body.command, function (err, stdout, stderr) {
    result.pid = childProcess.pid;
    if (stderr || error !== null) {
      result.error = stderr || error.message || error;
      res.status(400);
    } else {
      result.output = stdout;
    }
    res.send(result);
  });
}

module.exports = func;
