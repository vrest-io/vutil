
module.exports = function(data,opts,next){
  try {
    next(null, (typeof data === 'string' ? data : JSON.stringify(data)));
  } catch(er){
    next(er.message || er);
  }
}
