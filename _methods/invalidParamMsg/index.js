
function func(vars,methods){
  return methods.makemsg(vars,'invalidParamMsg',Array.prototype.slice.call(arguments,4));
}

module.exports = func;
