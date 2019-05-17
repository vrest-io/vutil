function afterString(data, next) {
  try {
    var ps = JSON.parse(data);
    next(null, ps);
  } catch (er) {
    next(er.message || er);
  }
};

module.exports = function (data, opts, next) {
  if (Buffer.isBuffer(data)) {
    afterString(data.toString(), next);
  } else if (typeof data === 'string') {
    afterString(data, next);
  } else if (typeof data.on === 'function') {
    var st = '';
    data.on('data', function (chk) {
      st += chk;
    }).once('error', function (er) {
      next(er.message || er);
    }).on('end', function () {
      afterString(st, next);
    });
  }
}