module.exports = function (data, opts, next) {
  try {
    if (Buffer.isBuffer(data)) {
      next(null, data.toString());
    } else {
      next(null, (typeof data === 'string' ? data : JSON.stringify(data)));
    }
  } catch (er) {
    next(er.message || er);
  }
}