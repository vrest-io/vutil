var csvtojson = require('csvtojson');

module.exports = function (data, opts, next) {
  if (typeof next !== 'function') next = function (ab) {
    return ab;
  };
  var out = [];
  var checkOn, c2j = csvtojson(opts);
  if (Buffer.isBuffer(data)) {
    c2j = c2j.fromString(data.toString());
  } else if (typeof data === 'string') {
    c2j = c2j.fromString(data);
  } else if (typeof data.on === 'function') {
    data.on('error', function (er) {
      return next(er.message);
    });
    c2j = c2j.fromStream(data);
  } else {
    return next('Invalid input');
  }
  switch (opts && opts.recordType) {
    case 'object':
      checkOn = 'json';
      break;
    default:
      checkOn = 'csv';
  }
  c2j.on(checkOn, (csvRow) => {
      out.push(csvRow);
    })
    .on('done', () => {
      return next(null, out);
    })
    .on('error', (err) => {
      return next(err.message);
    });
}