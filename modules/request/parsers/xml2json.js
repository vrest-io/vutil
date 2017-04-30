
var DOMParser = new (require('xmldom').DOMParser)();

// Changes XML to JSON, https://davidwalsh.name/convert-xml-json
function xmlToJson(xml) {

  // Create the return object
  var obj = {};

  if (xml.nodeType == 1) { // element
    // do attributes
    if (xml.attributes.length > 0) {
    obj["@attributes"] = {};
      for (var j = 0; j < xml.attributes.length; j++) {
        var attribute = xml.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType == 3) { // text
    obj = xml.nodeValue.trim();
  } else if (xml.nodeType == 4) { // text
    return xml.textContent;
  }

  // do children
  if (xml.hasChildNodes()) {
    for(var i = 0; i < xml.childNodes.length; i++) {
      var item = xml.childNodes.item(i);
      var nodeName = item.nodeName;
      if (typeof(obj[nodeName]) == "undefined") {
        obj[nodeName] = xmlToJson(item);
      } else if(nodeName !== '#text'){
        if (typeof(obj[nodeName].push) == "undefined") {
          var old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
      if((String(nodeName) === 'undefined') ||
          (String(nodeName) === '#text' && !(Object.key(obj[nodeName]).length))){
        delete obj[nodeName];
      }
    }
  }
  return obj;
};

function parseString(xml){
  return DOMParser.parseFromString(xml,'application/xml')
}

function afterString(data,next){
  var res;
  try {
    res = xmlToJson(parseString(data));
  } catch(erm){
    console.log("error: ", erm);
    return next(erm.message);
  }
  next(null, res);
};

module.exports = function(data,opts,next){
  if(typeof data === 'string') {
    afterString(data,next);
  } else if(typeof data.on === 'function') {
    var st = '';
    data.on('data',function(chk){
      st += chk;
    }).once('error',function(er){
      next(er.message || er);
    }).on('end',function(){
      afterString(st, next);
    });
  }
}
