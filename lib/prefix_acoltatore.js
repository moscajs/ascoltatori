"use strict";

var AbstractAscoltatore = require("./abstract_ascoltatore");
var MemoryAscoltatore = require("./memory_ascoltatore");
var util = require("./util");
var debug = require("debug")("prefix-ascoltatore");
var path = require("path");

/**
 * An Ascoltatore decorator to publish messages on a
 * parent Ascoltatore with a prefix.
 *
 * @param {String} prefix
 * @param {AbstractAscoltatore} ascoltatore
 * @api public
 */
function PrefixAscoltatore(prefix, ascoltatore) {
  AbstractAscoltatore.call(this);

  this._ascoltatore = ascoltatore || new MemoryAscoltatore();
  this._prefix = prefix;
  var that = this;

  this._ascoltatore.once("ready", function () {
    that.emit("ready");
  });

  this._ascoltatore.once("closed", function () {
    that.emit("closed");
  });

  this._ascoltatore.on("newTopic", function (topic) {
    that.emit("newTopic", that._parentToLocal(topic));
  });
}

/**
 * See AbstractAscoltatore for the public API definitions.
 *
 * @api private
 */
PrefixAscoltatore.prototype = Object.create(AbstractAscoltatore.prototype);

PrefixAscoltatore.prototype.subscribe = function (topic, callback, done) {
  var that = this;

  if (!callback.wrapper) {
    callback.wrapper = function (t, payload) {
      callback(that._parentToLocal(t), payload);
    };
  }

  this._ascoltatore.subscribe(this._localToParent(topic), callback.wrapper, function () {
    debug("registered new subscriber for topic " + topic);
    util.defer(done);
  });
};

PrefixAscoltatore.prototype.unsubscribe = function (topic, callback, done) {

  callback = callback.wrapper || callback;
  this._ascoltatore.unsubscribe(this._localToParent(topic), callback, function () {
    debug("deregistered subscriber for topic " + topic);
    util.defer(done);
  });
};

PrefixAscoltatore.prototype.publish = function (topic, message, done) {
  this._ascoltatore.publish(this._localToParent(topic), message, function () {
    debug("new message published to " + topic);
    util.defer(done);
  });
};

PrefixAscoltatore.prototype.close = function (done) {
  debug("closed");
  this._ascoltatore.close(done);
};

PrefixAscoltatore.prototype._localToParent = function (topic) {
  var newTopic = path.join(this._prefix, topic);
  debug("rewriting local topic " + topic + " into " + newTopic);
  return newTopic;
};

PrefixAscoltatore.prototype._parentToLocal = function (topic) {
  var newTopic = topic.replace(new RegExp("^" + this._prefix + "/"), "");
  debug("rewriting remote topic " + topic + " into " + newTopic);
  return newTopic;
};

util.aliasAscoltatore(PrefixAscoltatore.prototype);

/**
 * Exports the PrefixAscoltatore.
 *
 * @api public
 */
module.exports = PrefixAscoltatore;
