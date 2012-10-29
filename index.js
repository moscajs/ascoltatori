
var Set = require("./lib/set");
var util = require("./lib/util");
var MemoryAscoltatore = require('./lib/memory_ascoltatore');

module.exports.use = function use(ascoltatore) {
  ["emit", "on", "removeListener", "reset"].forEach(function(f) {
    module.exports[f] = ascoltatore[f].bind(ascoltatore);
  });

  util.aliasAscoltatore(this);

  return this;
};

module.exports.use(new MemoryAscoltatore());

module.exports.MemoryAscoltatore = MemoryAscoltatore;
module.exports.RedisAscoltatore = require("./lib/redis_ascoltatore");
module.exports.Set = Set;
module.exports.util = util;
