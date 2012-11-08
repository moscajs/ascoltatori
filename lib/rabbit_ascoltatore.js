
var util = require("./util");
var wrap = util.wrap;
var MemoryAscoltatore = require("./memory_ascoltatore");
var AbstractAscoltatore = require('./abstract_ascoltatore');
var async = require("async");
var SubsCounter = require("./subs_counter");

function RabbitAscoltatore(opts) {
  AbstractAscoltatore.call(this);

  this._opts = opts;
  this._ascoltatore = new MemoryAscoltatore();
  this._client;

  this._subs_counter = new SubsCounter();
}

RabbitAscoltatore.prototype = Object.create(AbstractAscoltatore.prototype);

var globalCounter = 0;
RabbitAscoltatore.prototype.__defineGetter__("_client", function() {
  var that = this;
  if(this._client_conn == undefined) {
    this._opts.amqp = this._opts.amqp || require("amqp");
    var conn = this._opts.amqp.createConnection(this._opts.client);
    this._client_conn = conn;
    async.series([
      function(callback) {
        that._client_conn.on("ready", wrap(callback));
      },
      function(callback) {
        that._exchange = conn.exchange(that._opts.exchange, { type: "topic" });
        that._exchange.on("open", wrap(callback));
      },
      function(callback) {
        that._queue = conn.queue(util.format('ascoltatore-%s-%s', process.pid, globalCounter++), wrap(callback));
        that._queue.setMaxListeners(0); // avoid problems with listeners
      },
      function(callback) {
        that._queue.subscribe(function (message, headers, deliveryInfo) {
          that._ascoltatore.publish(deliveryInfo.routingKey.replace(".", "/"), JSON.parse(message.data));
        });
        that.emit("ready");
        callback();
      }
    ]);
  }
  return this._client_conn;
});

RabbitAscoltatore.prototype.subscribe = function subscribe(topic, callback, done) {
  this._raiseIfClosed();
  this._queue.bind(this._exchange, topic.replace("/", ".").replace("*", "#"));
  this._ascoltatore.subscribe(topic, callback);
  this._subs_counter.add(topic);
  this._queue.once("queueBindOk", wrap(done));
};

RabbitAscoltatore.prototype.publish = function publish(topic, message, done) {
  this._raiseIfClosed();
  message = JSON.stringify(message || true);
  this._exchange.publish(topic.replace("/", "."), message);
  process.nextTick(wrap(done)); //simulate some asynchronicity
};

RabbitAscoltatore.prototype.unsubscribe = function unsubscribe(topic, callback, done) {
  this._raiseIfClosed();
  this._subs_counter.remove(topic);
  if(!this._subs_counter.include(topic)) {
    this._queue.unbind(this._exchange, topic.replace("/", ".").replace("*", "#"));
  }

  this._ascoltatore.unsubscribe(topic, callback);
  process.nextTick(wrap(done));

  return this;
};

RabbitAscoltatore.prototype.close = function close(done) {
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

util.aliasAscoltatore(RabbitAscoltatore.prototype);

module.exports = RabbitAscoltatore;
