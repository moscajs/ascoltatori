
var util = require("./util");
var wrap = util.wrap;
var MemoryAscoltatore = require("./memory_ascoltatore");
var AbstractAscoltatore = require('./abstract_ascoltatore');
var async = require("async");
var SubsCounter = require("./subs_counter");

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
function AMQPAscoltatore(opts) {
  AbstractAscoltatore.call(this);

  this._opts = opts || {};
  this._opts.amqp = this._opts.amqp || require("amqp");
  this._ascoltatore = new MemoryAscoltatore();

  this._subs_counter = new SubsCounter();
  this._ascoltatore.on("newTopic", this.emit.bind(this, "newTopic"));
  this._startConn();
}

/**
 * The client connection decends from AbstractAscoltatore.
 *
 * @api private
 */
AMQPAscoltatore.prototype = Object.create(AbstractAscoltatore.prototype);

/**
 * Starts a new connection to an AMQP server.
 * Do nothing if it is already started.
 *
 * @api private
 */
AMQPAscoltatore.prototype._startConn = function() {
  var that = this;
  if(this._client_conn == undefined) {
    var conn = this._opts.amqp.createConnection(this._opts.client);
    this._client_conn = conn;
    async.series([
    function(callback) {
      that._client_conn.once("ready", wrap(callback));
    },
    function(callback) {
      that._exchange = conn.exchange(that._opts.exchange, { type: "topic", confirm: true });
      that._exchange.once("open", wrap(callback));
    },
    function(callback) {
      that._queue = conn.queue(util.buildIdentifier(), wrap(callback));
      that._queue.setMaxListeners(0); // avoid problems with listeners
    },
    function(callback) {
      that._queue.subscribe({ ack: true, prefetchCount: 42 }, function (message, headers, deliveryInfo) {
        that._queue.shift();
        that._ascoltatore.publish(deliveryInfo.routingKey.replace(".", "/"), JSON.parse(message.data));
      });
      that._queue.once("basicConsumeOk", function() {
        process.nextTick(function() {
          that.emit("ready");
          callback();
        });
      });
    }]);
  }
  return this._client_conn;
};

AMQPAscoltatore.prototype.subscribe = function subscribe(topic, callback, done) {
  this._raiseIfClosed();
  this._ascoltatore.subscribe(topic, callback);
  if(!this._subs_counter.include(topic)) {
    this._queue.once("queueBindOk", wrap(done));
    this._queue.bind(this._exchange, topic.replace("/", ".").replace("*", "#"));
  } else {
    process.nextTick(wrap(done));
  }
  this._subs_counter.add(topic);
};

AMQPAscoltatore.prototype.publish = function publish(topic, message, done) {
  this._raiseIfClosed();
  message = JSON.stringify(message || true);
  this._exchange.publish(topic.replace("/", "."), message);
  process.nextTick(wrap(done));
};

AMQPAscoltatore.prototype.unsubscribe = function unsubscribe(topic, callback, done) {
  this._raiseIfClosed();
  this._subs_counter.remove(topic);
  if(!this._subs_counter.include(topic)) {
    this._queue.once("queueUnbindOk", wrap(done));
    this._queue.unbind(this._exchange, topic.replace("/", ".").replace("*", "#"));
  } else {
    process.nextTick(wrap(done));
  }

  this._ascoltatore.unsubscribe(topic, callback);

  return this;
};

AMQPAscoltatore.prototype.close = function close(done) {

  if (this._closed) {
    wrap(done)();
    return;
  }

  if(this._client_conn !== undefined) {
    this._client_conn.on("close", wrap(done));
    this._queue.destroy();
    this._client_conn.end();
    delete this._client_conn;
    delete this._exchange;
    delete this._queue;
  }

  this.emit("closed");
};

util.aliasAscoltatore(AMQPAscoltatore.prototype);

/**
 * Exports the AMQPAscoltatore
 *
 * @api public
 */
module.exports = AMQPAscoltatore;
