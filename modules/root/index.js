
var pck = require('../../package.json'),
  utils = require('../../utils');

module.exports = function(req,res,next){
  res.send({ name : pck.name, version : pck.version });
};
