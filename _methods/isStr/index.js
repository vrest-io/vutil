function func(a,b,c,d,str,allowEmpty){
  if(typeof str !== 'string') return false;
  var sl = str.length;
  if(!sl){ return Boolean(allowEmpty); }
  if(str.charAt(0) === '{' && str.charAt(1) === '{' && str.charAt(sl-1) === '}' && str.charAt(sl-2) === '}'){ return false; }
  return true;
}

GLOBAL_METHODS._isStr = func.bind(undefined,0,0,0,0);

module.exports = func;
