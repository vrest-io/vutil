
const exec = require('child_process').exec;

function func(vars,methods,req,res,comd,next){
  var error = null, childProcess = null;
  var result = {
    hasErrors: false
  };
  childProcess = exec(comd, function (err, stdout, stderr) {
    result.pid = childProcess.pid;
    if (stderr || error !== null) {
      result.error = stderr || error.message || error;
      result.hasErrors = true;
      result.status = 400;
    } else {
      result.output = stdout;
      result.status = 200;
    }
    next(result);
  });
}

module.exports = func;
