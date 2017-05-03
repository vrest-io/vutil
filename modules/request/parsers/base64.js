
module.exports = function(data, opts, next){
  if(typeof data === 'string') {
    next(null, (new Buffer(data)).toString('base64'));
  } else if(typeof data.on === 'function') {
    var buffers = [];
    data.on('data', function(buffer) {
      buffers.push(buffer);
    });
    data.on('end', function() {
      next(null, Buffer.concat(buffers).toString('base64'));
    }).once('error',function(er){
      next(er.message || er);
    });
  }
}
