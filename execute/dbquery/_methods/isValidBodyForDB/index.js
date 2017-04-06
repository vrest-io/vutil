function func(vars,methods,req,res){
  var query = GLOBAL_METHODS.lastValue(vars.params, 'body','query');
  if(!query) return false;
  switch(GLOBAL_METHODS.lastValue(vars,'connType')){
    case 'mysql' :
    case 'mssql' :
    case 'postgres' :
    case 'oracle' :
      return GLOBAL_METHODS._isStr(query);
    case 'mongodb' :
      vars.params.body.query = {};
      if(typeof query !== 'object' || query === null){
        query = { colName : typeof query === 'string' ? query : false };
      }
      if(!(GLOBAL_METHODS._isStr(query.colName))){
        return false;
      }
      if(!(GLOBAL_METHODS._isStr(query && query.command))){
        query.command = 'findOne';
      }
      if(typeof query.operate !== 'object' || query.operate === null){
        query.operate = {};
      }
      if(typeof query.options !== 'object' || query.options === null){
        query.options = {};
      }
      vars.params.body.query = query;
      return true;
    default : return false;
  }
}

module.exports = func;
