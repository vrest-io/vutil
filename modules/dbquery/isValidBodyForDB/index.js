
const utils = require('../../../utils');

function func(vars,methods){
  var query = utils.lastValue(vars.params, 'body','query');
  if(!query) return false;
  switch(utils.lastValue(vars,'connType')){
    case 'mysql' :
    case 'mssql' :
    case 'postgres' :
    case 'oracle' :
      return (typeof query === 'string' && query.length);
    case 'mongodb' :
      vars.params.body.query = {};
      if(typeof query !== 'object' || query === null){
        query = { colName : typeof query === 'string' ? query : false };
      }
      if(!(typeof query.colName === 'string' && query.colName.length)){
        return false;
      }
      if(!(typeof query.command === 'string' && query.command.length)){
        query.command = 'findOne';
      }
      if(typeof query.operate !== 'object' || query.operate === null){
        query.operate = {};
      }
      if(typeof query.options !== 'object' || query.options === null){
        query.options = {};
      }
      if(typeof query.cursorCalls !== 'object' || query.cursorCalls === null){
        query.cursorCalls = false;
      }
      if(!(Array.isArray(query.cursorCalls))){
        var opt = query.cursorCalls;
        query.cursorCalls = [];
        if(opt){ query.cursorCalls.push(opt); }
      }
      vars.params.body.query = query;
      return true;
    default : return false;
  }
}

module.exports = func;
