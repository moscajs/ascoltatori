"use strict";

var DecoratorAscoltatore = require("./decorator_ascoltatore");
var util = require("./util");
var debug = require("debug")("ascoltatori:json");

/**
 * An Ascoltatore decorator to publish messages on a
 * parent Ascoltatore with a prefix.
 *
 * @param {AbstractAscoltatore} ascoltatore
 * @api public
 */
function JSONAscoltatore(ascoltatore) {
  DecoratorAscoltatore.call(this, ascoltatore);
}

/**
 * See AbstractAscoltatore for the public API definitions.
 *
 * @api private
 */
JSONAscoltatore.prototype = Object.create(DecoratorAscoltatore.prototype);

JSONAscoltatore.prototype.wrapCallback = function(callback, next) {
  var that = this;
  if (!callback._json_ascoltatore_wrapper) {
    callback._json_ascoltatore_wrapper = function(t, payload, options) {
      debug("converting from JSON");
      var errored = false;

      try {
        payload = JSON.parse(payload);
      } catch (e) {
        errored = true;
        debug("The payload is not a valid JSON", e);
      }

      if (!errored) {
        callback(t, payload, options);
      }
    };
  }
  next(null, callback._json_ascoltatore_wrapper);
};

JSONAscoltatore.prototype.wrapPayload = function(payload, next) {

  if (payload === undefined || payload === null) {
    payload = false; // so we can convert it to JSON
  }

  debug("converting to JSON");
  next(null, JSON.stringify(payload));
};

/**
 * Exports the JSONAscoltatore.
 *
 * @api public
 */
module.exports = JSONAscoltatore;
