(function() {

  function loop(inp, key) {
      if (inp !== undefined && inp !== null) {
          return inp[key];
      } else return undefined;
  }

  /* util module start */
  var utilModule = {
      stringify : function(inp, pretty,defMsg,dontStringifyString){
        if(dontStringifyString && typeof inp === 'string'){
          return inp;
        }
        try { return pretty ? JSON.stringify(inp, undefined, 2) : JSON.stringify(inp); }
        catch(e) { return defMsg || 'CIRCULAR_JSON_FOUND'; }
      },
      assign : function func(ab, bb, noob) {
          if (typeof ab !== 'object' || !ab) ab = Array.isArray(bb) ? new Array(bb.length) : {};
          if (typeof bb === 'object' && bb) {
              var kys = Object.keys(bb),
                  kl = kys.length;
              for (var j = 0; j < kl; j++) {
                  if (!noob || (typeof ab[kys[j]] !== 'object') || (typeof bb[kys[j]] !== 'object')) {
                      ab[kys[j]] = bb[kys[j]];
                  }
              }
          }
          return ab;
      },
      isAlphaNum : function func(st) {
          return Boolean(!(/[^A-Za-z0-9]/).test(st));
      },
      lastValue : function func(root) {
        var len = arguments.length,
            now = root;
        for (var z = 1; z < len; z++) {
            now = loop(root, arguments[z]);
            if (now === undefined) {
                break;
            } else {
                root = now;
            }
        }
        return now;
      },
      isStr : function(inp){
        return typeof inp === 'string' && inp.length;
      },
      objwalk : function walkInto(fun, rt, obj, key, isLast) {
        fun(obj, key, rt, typeof isLast === 'boolean' ? isLast : true);
        if (typeof obj === 'object' && obj && obj['$W_END'] !== true) {
            var kys = Object.keys(obj),
                kl = kys.length;
            for (var j = 0; j < kl; j++) {
                walkInto(fun, obj, obj[kys[j]], kys[j], (j === (kl - 1)));
            }
        }
      }
  };
  /* util modules ends here. */

  //boilerplate code starts
  var root = this;
  // Export the utilModule object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `utilModule` as a global object.
  if (typeof exports !== 'undefined') {
      if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = utilModule;
      }
      exports.utilModule = utilModule;
  } else {
      root.utilModule = utilModule;
  }

  //for browser
  if (typeof define === 'function' && define.amd) {
      define('commonModule', [], function() {
          return utilModule;
      });
    }
}.call(this));
