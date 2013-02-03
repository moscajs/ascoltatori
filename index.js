
var SubsCounter = require("./lib/subs_counter");
var util = require("./lib/util");
var MemoryAscoltatore = require('./lib/memory_ascoltatore');

module.exports.use = function use(ascoltatore) {
  ["publish", "subscribe", "unsubscribe", "close", "on",
    "removeListener", "registerDomain"].forEach(function(f) {

    module.exports[f] = ascoltatore[f].bind(ascoltatore);
  });

  util.aliasAscoltatore(this);

  return this;
};

module.exports.use(new MemoryAscoltatore());

module.exports.MemoryAscoltatore = MemoryAscoltatore;
module.exports.RedisAscoltatore = require("./lib/redis_ascoltatore");
module.exports.ZeromqAscoltatore = require("./lib/zeromq_ascoltatore");
module.exports.AMQPAscoltatore = require("./lib/amqp_ascoltatore");
module.exports.MQTTAscoltatore= require("./lib/mqtt_ascoltatore");
module.exports.SubsCounter = SubsCounter;
module.exports.util = util;
