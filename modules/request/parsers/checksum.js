var crypto = require('crypto');

function getHash(type){
  if(!type) type = 'md5';
  return crypto.createHash(type);
}

function calculateHash(stream,hash,next,into){
  if(stream){
    hash.update(stream);
  }
  if(typeof next === 'function'){
    next( null, hash.digest(into || 'hex'));
  }
}

module.exports = function(data,opts,next){
  var hash = getHash(opts.hashType);
  if(typeof data === 'string'){
    calculateHash(data, hash, next, opts.hexEncoding);
  } else {
    data.on('readable', () => {
      const dt = stream.read();
      calculateHash(dt,hash,dt?false:next,opts.hexEncoding);
    }).on('error',(err)=>{
      next(erm.message || err || 'Unable to calculate checksum.');
    });
  }
}
