
var crypto = require('crypto');

function getHash(type){
  if(!type) type = 'md5';
  return crypto.createHash(type);
}

function calculateHash(stream,hash,next,into){
  if(typeof stream.on !== 'function'){
    try {
      stream = Buffer.from(stream);
    } catch(erm){
      return next(erm.message||erm);
    }
  }
  stream.on('readable', () => {
    const data = stream.read();
    if (data){
      hash.update(data);
    } else {
      next(null,hash.digest(into||'hex'));
    }
  });
}

module.exports = function(data,opts,next){
  calculateHash(data,getHash(opts.hashType),next, opts.hexEncoding);
}
