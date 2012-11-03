
var util = require("./util");
var wrap = util.wrap;
var MemoryAscoltatore = require("./memory_ascoltatore");
var AbstractAscoltatore = require('./abstract_ascoltatore');

function RabbitAscoltatore(opts) {
  AbstractAscoltatore.call(this);

  this._opts = opts;
  this._ascoltatore = new MemoryAscoltatore();
  this._client;
}

RabbitAscoltatore.prototype = Object.create(AbstractAscoltatore.prototype);

var globalCounter = 0;
RabbitAscoltatore.prototype.__defineGetter__("_client", function() {
  var that = this;
  if(this._client_conn == undefined) {
    this._opts.amqp = this._opts.amqp || require("amqp");
    var conn = this._opts.amqp.createConnection(this._opts.client);
    this._client_conn = conn;
    this._client_conn.on("ready", function() {
      that._exchange = conn.exchange(that._opts.exchange, { type: "topic" });
      that._exchange.on("open", function() {
        that._queue = conn.queue(util.format('ascoltatore-%s-%s', process.pid, globalCounter++), function() {
          that._queue.subscribe(function (message, headers, deliveryInfo) {
            that._ascoltatore.publish(deliveryInfo.routingKey.replace(".", "/"), JSON.parse(message.data));
          });
          that.emit("ready");
        });
      });
    });
  }
  return this._client_conn;
});

RabbitAscoltatore.prototype.subscribe = function subscribe(topic, callback, done) {
  this._queue.bind(this._exchange, topic.replace("/", ".").replace("*", "#"));
  this._ascoltatore.subscribe(topic, callback);
  this._queue.once("queueBindOk", wrap(done));
};

RabbitAscoltatore.prototype.publish = function publish(topic, message, done) {
  message = JSON.stringify(message || true);
  this._exchange.publish(topic.replace("/", "."), message, wrap(done));
};

RabbitAscoltatore.prototype.removeListener = function removeListener(topic, callback, done) {
  this._queue.unbind(this._exchange, topic.replace("/", ".").replace("*", "#"));
  this._ascoltatore.removeListener(topic, callback, done);
};

RabbitAscoltatore.prototype.reset = function reset(done) {
  if(this._client_conn !== undefined) {
    this._client_conn.on("close", wrap(done));
    this._queue.destroy();
    this._client_conn.end();
    delete this._client_conn;
    delete this._exchange;
    delete this._queue;
  }
};

util.aliasAscoltatore(RabbitAscoltatore.prototype);

function containsWildcard(topic) {
  return topic.indexOf("*") >= 0;
}

module.exports = RabbitAscoltatore;
