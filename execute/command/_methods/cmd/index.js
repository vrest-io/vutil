
const exec = require('child_process').exec;

function func(vars,methods,req,res,comd,next){
  var error = null, childProcess = null;
  var result = {
  };
  childProcess = exec(comd, function (err, stdout, stderr) {
    result.pid = childProcess.pid;
    if (stderr || error !== null) {
      result._ = stderr || error.message || error;
      result.status = 400;
    } else {
      result._ = stdout;
      result.status = 200;
    }
    next(result);
  });
}

module.exports = func;
