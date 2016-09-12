"use strict";

var util = require("./util");
var wrap = util.wrap;
var defer = util.defer;
var TrieAscoltatore = require("./trie_ascoltatore");
var AbstractAscoltatore = require('./abstract_ascoltatore');
var steed = require("steed")();
var SubsCounter = require("./subs_counter");
var debug = require("debug")("ascoltatori:amqplib");

/**
 * The AMQPAscoltatore is a class that inherits from AbstractAscoltatore.
 * It is backed by node-amqp.
 * It creates or use an exchange with the given name, using a "topic" topology.
 * It creates a single amqp queue for this process, in order to keep
 * the overhead low.
 *
 * It accepts these options:
 *  - `client`, which is passed through to the amq.createConnection method;
 *  - `exchange`, the exchange name;
 *  - `amqp`, the amqp module (it will automatically be required if not present);
 *
 * @param {Object} opts The options for creating this ascoltatore.
 * @api public
 */

function AMQPLibAscoltatore(opts) {
  AbstractAscoltatore.call(this, opts, {
    separator: '.',
    wildcardOne: '*',
    wildcardSome: '#'
  });

  this._opts = opts || {};
  this._opts.amqp = this._opts.amqp || require("amqplib/callback_api");
  this._ascoltatore = new TrieAscoltatore(opts);

  this._subs_counter = new SubsCounter();
  this._startConn();
}

/**
 * The client connection decends from AbstractAscoltatore.
 *
 * @api private
 */
AMQPLibAscoltatore.prototype = Object.create(AbstractAscoltatore.prototype);

/**
 * Starts a new connection to an AMQP server.
 * Do nothing if it is already started.
 *
 * @api private
 */
AMQPLibAscoltatore.prototype._startConn = function () {
  var conn = null,
    channel = null,
    that = this;

  if (this._client_conn === undefined) {

    var url = this._opts.url || 'amqp://127.0.0.1:5672';

    var socketOptions = this._opts.socketOptions || {};

    debug("connecting to " + this._opts.url);

    steed.series([
      function (callback) {
        that._opts.amqp.connect(url, socketOptions, function (err, conn) {
          that._client_conn = conn;
          conn.on("error", function (error) {
            if (typeof error === 'string') {
              error = (new Error(error));
            }

            that.emit("error", error);
          });
          callback();
        });
      },

      function (callback) {
        debug('connected');
        that._client_conn.createChannel(function(err, channel){
          that._channel = channel;
          that._channel.prefetch(42); // magic number?
          callback();
        });
      },

      function(callback){
        debug('channel created');
        that._queue = util.buildIdentifier();
        that._channel.assertQueue(that._queue, null, wrap(callback));
      },

      function (callback){
        debug('queue created');
        that._channel.assertExchange(that._opts.exchange, 'topic', {}, wrap(callback));
      },

      function (callback){
        debug('exchange existed');
        that._channel.consume(that._queue, function(msg){
          that._channel.ack(msg);
          var topic = that._recvTopic(msg.fields.routingKey);
          debug("new message received from queue on topic " + topic);
          that._ascoltatore.publish(topic, msg.content.toString());
        }, null, wrap(callback));
      },

      function (callback) {
        debug("subscribed to queue");
        that.emit("ready");
        callback();
      }
    ]);
  }
  return this._client_conn;
};

AMQPLibAscoltatore.prototype.subscribe = function subscribe(topic, callback, done) {
  this._raiseIfClosed();

  this._ascoltatore.subscribe(topic, callback);

  if (!this._subs_counter.include(topic)) {
    debug("binding queue to topic " + topic);

    this._channel.bindQueue(this._queue, this._opts.exchange, this._subTopic(topic), {}, function(err, ok){
        debug("queue bound to topic " + topic);
        defer(done);
    });
  } else {
    defer(done);
  }

  this._subs_counter.add(topic);

  debug("registered new subscriber for topic " + topic);
};

AMQPLibAscoltatore.prototype.publish = function publish(topic, message, done) {
  this._raiseIfClosed();

  debug("new message published to " + topic);

  this._channel.publish(this._opts.exchange, this._pubTopic(topic), new Buffer(String(message)));
  defer(done);
};

AMQPLibAscoltatore.prototype.unsubscribe = function unsubscribe(topic, callback, done) {
  this._raiseIfClosed();
  this._subs_counter.remove(topic);

  debug("deregistered subscriber for topic " + topic);

  this._ascoltatore.unsubscribe(topic, callback);

  if (!this._subs_counter.include(topic)) {
    this._channel.unbindQueue(this._queue, this._opts.exchange, this._subTopic(topic), {}, function(err, ok) {
      debug("queue unbound to topic " + topic);
      defer(done);
    });
  } else {
    defer(done);
  }

  return this;
};

AMQPLibAscoltatore.prototype.close = function close(done) {
  var that = this;

  if (this._closed) {
    wrap(done)();
    return;
  }

  if (this._closing) {
    this.on("closed", done);
    return;
  }

  this._closing = true;

  if (this._client_conn !== undefined) {
    var doClose = function () {
      if (that._closed) {
        debug("closing twice, one was an error");
        return;
      }

      debug("closed");
      defer(done);
      that.emit("closed");
    };

    this._client_conn.on("close", doClose);
    this._channel.deleteQueue(this._queue);
    this._channel.close();

    this._client_conn.close();
    this._client_conn.removeAllListeners("error");
    this._client_conn.on("error", doClose);

    delete this._client_conn;
    delete this._channel;
    delete this._queue;
  }
};

util.aliasAscoltatore(AMQPLibAscoltatore.prototype);

/**
 * Exports the AMQPAscoltatore
 *
 * @api public
 */
module.exports = AMQPLibAscoltatore;
