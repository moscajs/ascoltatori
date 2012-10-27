
var Set = require("./lib/set");
var util = require("./lib/util");
var MemoryAscoltatore = require('./lib/memory_ascoltatore');

module.exports = new MemoryAscoltatore();
module.exports.MemoryAscoltatore = MemoryAscoltatore;
module.exports.Set = Set;
module.exports.util = util;
