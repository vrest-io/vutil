
var xml2js = require('xml2js').parseString;//, builder = new xml2js.Builder({cdata : true});

function afterString(data,next){
  xml2js(data,next);
};

module.exports = function(data,opts,next){
  if(typeof data === 'string') {
    afterString(data,next);
  } else if(typeof data.on === 'function') {
    var st = '';
    data.on('data',function(chk){
      st += chk;
    }).once('error',function(er){
      next(er.message || er);
    }).on('end',function(){
      afterString(st, next);
    });
  }
}
