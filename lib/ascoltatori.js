
var SubsCounter = require("./subs_counter");
var util = require("./util");

/**
 * You can require any Ascolatore through this module.
 *
 * @api public
 */
module.exports.MemoryAscoltatore = require('./memory_ascoltatore');
module.exports.RedisAscoltatore = require("./redis_ascoltatore");
module.exports.ZeromqAscoltatore = require("./zeromq_ascoltatore");
module.exports.AMQPAscoltatore = require("./amqp_ascoltatore");
module.exports.MQTTAscoltatore = require("./mqtt_ascoltatore");
module.exports.PrefixAscoltatore = require("./prefix_acoltatore");

/**
 * Use an Ascoltatore as a global pub/sub broker inside
 * the current node process.
 * Everyone requiring ascoltatori can use it.
 *
 * @param {AbstractAscoltatore} ascoltatore the Ascoltatore to use
 * @return {Object} the `ascoltatori` module
 * @api public
 */
module.exports.use = function use(ascoltatore) {
  ["publish", "subscribe", "unsubscribe", "close", "on",
    "removeListener", "registerDomain"].forEach(function(f) {

    module.exports[f] = ascoltatore[f].bind(ascoltatore);
  });

  util.aliasAscoltatore(this);

  return this;
};

/**
 * The default global Ascoltatore is a MemoryAscoltatore.
 *
 * @api public
 */
module.exports.use(new module.exports.MemoryAscoltatore());

/**
 * These are just utilities
 *
 * @api private
 */
module.exports.SubsCounter = SubsCounter;
module.exports.util = util;
