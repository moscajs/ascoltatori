"use strict";

var util = require("./util");
var wrap = util.wrap;
var MemoryAscoltatore = require("./memory_ascoltatore");
var AbstractAscoltatore = require('./abstract_ascoltatore');
var debug = require("debug")("ascoltatori:mqtt");
var SubsCounter = require("./subs_counter");

/**
 * MQTTAscoltatore is a class that inherits from AbstractAscoltatore.
 * It is implemented through the `mqtt` package and it could be
 * backed up by any MQTT broker out there.
 *
 * The options are:
 *  - `keepalive`, the keepalive timeout in seconds (see the MQTT spec), the default is 3000;
 *  - `port`, the port to connect to;
 *  - `host`, the host to connect to;
 *  - `mqtt`, the mqtt module (it will automatically be required if not present).
 *
 * @api public
 * @param {Object} opts The options object
 */
function MQTTAscoltatore(opts) {
  AbstractAscoltatore.call(this);

  this._opts = opts || {};
  this._opts.keepalive = this._opts.keepalive || 3000;
  this._opts.mqtt = this._opts.mqtt || require("mqtt");

  this._subs_counter = new SubsCounter();

  this._ascoltatore = new MemoryAscoltatore();
  this._ascoltatore.on("newTopic", this.emit.bind(this, "newTopic"));
  this._startConn();
}

/**
 * MQTTAscoltatore inherits from AbstractAscoltatore
 *
 * @api private
 */
MQTTAscoltatore.prototype = Object.create(AbstractAscoltatore.prototype);

/**
 * Starts a new connection to an MQTT server.
 * Do nothing if it is already started.
 *
 * @api private
 */
MQTTAscoltatore.prototype._startConn = function () {
  var that = this;
  if (this._client === undefined) {
    that._opts.mqtt.createClient(that._opts.port, that._opts.host, function (err, client) {
      if (err) {
        throw err;
      }

      that._client = client;

      debug("sending connect packet");
      client.connect({ keepalive: that._opts.keepalive, client: util.buildIdentifier() });

      client.setMaxListeners(0);

      client.on('connack', function (packet) {
        if (packet.returnCode === 0) {
          debug("connack received");
          that.emit("ready");
        } else {
          that.emit("error", util.format('connack error %d', packet.returnCode));
        }
      });

      client.on("publish", function (packet) {
        debug("received new packet on topic " + packet.topic);
        that._ascoltatore.publish(packet.topic, packet.payload);
      });

      client.on('error', function (e) {
        debug("error in the client");

        delete that._client;
        that.emit("error", e);
      });

      client.timer = setInterval(function () {
        debug("sending keepalive");
        client.pingreq();
      }, that._opts.keepalive * 1000 / 2);
    });
  }
  return this._client;
};

MQTTAscoltatore.prototype._wrapEvent = function wrapEvent(messageId, event, done) {
  var that = this, wrapper = null;
  wrapper = function (packet) {
    if (packet.messageId === messageId) {
      that._client.removeListener(event, wrapper);
      wrap(done)();
    }
  };
  this._client.on(event, wrapper);
};

function buildMessageId() {
  return Math.floor(Math.random() * 0xFFFF);
}

MQTTAscoltatore.prototype.subscribe = function subscribe(topic, callback, done) {
  this._raiseIfClosed();
  var messageId = buildMessageId(topic);

  this._subs_counter.add(topic);
  this._client.subscribe({ topic: topic.replace("*", "#"), messageId: messageId, qos: 0 });

  this._wrapEvent(messageId, "suback", function () {
    debug("registered new subscriber for topic " + topic);
    util.defer(done);
  });

  debug("registering new subscriber for topic " + topic);
  this._ascoltatore.subscribe(topic, callback);
};

MQTTAscoltatore.prototype.publish = function publish(topic, message, done) {
  this._raiseIfClosed();
  var messageId = buildMessageId(topic);

  this._client.publish({ topic: topic, messageId: messageId, qos: 0, payload: String(message) });

  debug("new message published to " + topic);
  util.defer(done);
};

MQTTAscoltatore.prototype.unsubscribe = function unsubscribe(topic, callback, done) {
  this._raiseIfClosed();

  var newDone = null, messageId = null;

  newDone = function () {
    debug("deregistered subscriber for topic " + topic);
    util.defer(done);
  };

  this._ascoltatore.unsubscribe(topic, callback);
  this._subs_counter.remove(topic);

  if (this._subs_counter.include(topic)) {
    newDone();
    return;
  }

  messageId = buildMessageId(topic);

  debug("deregistering subscriber for topic " + topic);
  this._client.unsubscribe({ topic: topic, messageId: messageId});
  this._wrapEvent(messageId, "unsuback", newDone);
};

MQTTAscoltatore.prototype.close = function close(done) {
  var that = this;
  if (!this._closed) {
    this._subs_counter.clear();
    that._ascoltatore.close();
    this._client.on("close", function () {
      debug("closed");
      clearInterval(that._client.timer);
      delete that._client;
      util.defer(done);
    });
    this._client.disconnect();
  } else {
    wrap(done)();
  }
  this.emit("closed");
};

util.aliasAscoltatore(MQTTAscoltatore.prototype);

/**
 * Exports the MQTTAscoltatore
 *
 * @api public
 */
module.exports = MQTTAscoltatore;
