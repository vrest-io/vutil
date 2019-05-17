var xlsx = require("xlsx");
var csv2json = require("./csv2json");

module.exports = function (data, opts, next) {
  try {
    if (Buffer.isBuffer(data)) {
      let wb = xlsx.read(data);
      let ws = wb.Sheets[opts.sheet ? opts.sheet : wb.SheetNames[0]];
      let csv = xlsx.utils.sheet_to_csv(ws, {
        blankrows: false
      });
      return csv2json(csv, opts.csvOpts || {
        recordType: "object"
      }, next);
    } else {
      next("Data type not supported.");
    }
  } catch (er) {
    console.error(er.message);
    next(er.message || er);
  }
}