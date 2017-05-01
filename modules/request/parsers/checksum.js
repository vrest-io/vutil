var crypto = require('crypto');

function getHash(type){
  if(!type) type = 'md5';
  return crypto.createHash(type);
}

function calculateHash(stream,hash,next,into){
  hash.update(stream);
  next( null, hash.digest(into || 'hex'));
}

module.exports = function(data,opts,next){
  calculateHash(data,getHash(opts.hashType),next, opts.hexEncoding);
}
