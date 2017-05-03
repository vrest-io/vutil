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
  if(typeof data === 'string'){
    calculateHash(data,,next, opts.hexEncoding);
  } else {
    var hash = getHash(opts.hashType);
    data.on('readable', () => {
      const dt = stream.read();
      calculateHash(dt,hash,dt?false:next,opts.hexEncoding);
    });
  }
}
