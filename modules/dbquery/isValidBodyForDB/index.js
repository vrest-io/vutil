
const utils = require('../../../utils');

function func(vars,methods){
  var query = utils.lastValue(vars.params, 'body','query');
  switch(utils.lastValue(vars,'connType')){
    case 'mysql' :
    case 'mssql' :
    case 'postgres' :
    case 'oracle' :
      return (typeof query === 'string' && query.length);
    case 'mongodb' :
      query = (query || utils.lastValue(vars.params, 'body'));
      vars.params.body.query = {};
      if(typeof query !== 'object' || query === null){
        query = { collection : typeof query === 'string' ? query : false };
      }
      if(!(typeof query.collection === 'string' && query.collection.length)){
        return false;
      }
      if(!(typeof query.command === 'string' && query.command.length)){
        query.command = 'findOne';
      }
      ['args','cursorMethods'].forEach((inp)=>{
        if(typeof query[inp] !== 'object' || query[inp] === null){
          query[inp] = false;
        }
        if(!(Array.isArray(query[inp]))){
          var opt = query[inp];
          query[inp] = [];
          if(opt){ query[inp].push(opt); }
        }
      });
      vars.params.body.query = query;
      return true;
    default : return false;
  }
}

module.exports = func;
