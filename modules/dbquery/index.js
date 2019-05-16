const utils = require('../../utils'),
  appVars = require('../../vars.json'),
  isConnAvailable = require('./isConnAvailable'),
  isValidBodyForDB = require('./isValidBodyForDB'),
  mainVars = require('./vars.json'),
  methods = {
    predb: require('./predb')
  };

module.exports = function (req, res, next) {
  var nowVars = utils.assign({
    params: {
      path: {},
      body: {}
    }
  }, mainVars);
  utils.assign(nowVars.params.body, req.body);
  utils.assign(nowVars.params.path, req.params);
  if (isConnAvailable(nowVars)) {
    if (isValidBodyForDB(nowVars, methods)) {
      function after(data) {
        res.status(data.status || 200);
        delete data.status;
        res.send(data);
      }
      switch (nowVars.connType) {
        case 'mongodb':
          return require('./mongodb')(nowVars, methods, after);
        case 'mysql':
          return require('./mysql')(nowVars, methods, after);
        case 'mssql':
          return require('./mssql')(nowVars, methods, after);
        case 'oracle':
          return require('./oracle')(nowVars, methods, after);
        case 'postgres':
          return require('./postgres')(nowVars, methods, after);
        default:
          res.send(400, {
            "message": "Invalid connection type"
          });
      }
    } else {
      res.send(400, {
        "message": 'Value of parameter `query` was not valid.'
      });
    }
  } else {
    res.send(400, {
      "message": mainVars.messages[nowVars.conErrorType]
    });
  }
};