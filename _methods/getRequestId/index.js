
var counter = parseInt(process.env.REQ_COUNT);
if(isNaN(counter) || counter < 0){ counter = 0; }

function func(){
  return String(++counter);
}

module.exports = func;
