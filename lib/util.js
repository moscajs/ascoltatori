
var util = require('util');

function alias(obj, from, to) {
  if(typeof obj[from] !== 'function') {
    throw util.format("'%s' is not a function", from);
  }
  obj[to] = obj[from];
  return obj;
}
module.exports.alias = alias;

var aliases = {
  emit: ["pub", "publish"],
  on: ["sub", "subscribe"]
};

function aliasAscoltatore(obj) {
  for (var key in aliases) {
    if(aliases.hasOwnProperty(key)) {
      aliases[key].forEach(function(a) {
        module.exports.alias(obj, key, a);
      });
    }
  }
  return obj;
};
module.exports.aliasAscoltatore = aliasAscoltatore;

module.exports.format = util.format;
