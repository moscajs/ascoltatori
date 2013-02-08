
var util = require("./util");
var wrap = util.wrap;
var MemoryAscoltatore = require("./memory_ascoltatore");
var AbstractAscoltatore = require('./abstract_ascoltatore');

function MQTTAscoltatore(opts) {
  AbstractAscoltatore.call(this);

  this._opts = opts;
  this._ascoltatore = new MemoryAscoltatore();
  this._client;
  this._ascoltatore.on("newTopic", this.emit.bind(this, "newTopic"));
}

var globalCounter = 0;
MQTTAscoltatore.prototype = Object.create(AbstractAscoltatore.prototype, {
  "_client": {
    configurable: false,
    get: function() {
      var that = this;
      if(this._client_conn === undefined) {
        that._opts.mqtt.createClient(that._opts.port, that._opts.host, function(err, client) {
          if (err) throw err;

          that._client_conn = client;

          client.connect({ keepalive: 3000, client: "ascoltatore_" + globalCounter++ });
          client.setMaxListeners(0);

          client.on('connack', function(packet) {
            if (packet.returnCode === 0) {
              that.emit("ready");
            } else {
              that.emit("error", util.format('connack error %d', packet.returnCode));
            }
          });

          client.on("publish", function(packet) {
            that._ascoltatore.publish(packet.topic, JSON.parse(packet.payload));
          });

          client.on('error', function(e) {
            delete that._client_conn;
            that.emit("error", e);
          });
        });
      }
      return this._client_conn;
    }
  }
});

MQTTAscoltatore.prototype._wrapEvent = function wrapEvent(messageId, event, done) {
  var that = this;
  var wrapper = function(packet) {
    if(packet.messageId === messageId) {
      that._client.removeListener(event, wrapper);
      wrap(done)();
    }
  };
  //console.log("waiting for %s number %s", event, messageId);
  this._client.on(event, wrapper);
}

MQTTAscoltatore.prototype.subscribe = function subscribe(topic, callback, done) {
  this._raiseIfClosed();
  var messageId = buildMessageId(topic);
  this._client.subscribe({ topic: topic.replace("*", "#"), messageId: messageId, qos: 0 });
  this._wrapEvent(messageId, "suback", done);
  this._ascoltatore.subscribe(topic, callback);
};

MQTTAscoltatore.prototype.publish = function publish(topic, message, done) {
  this._raiseIfClosed();
  var messageId = buildMessageId(topic);
  message = JSON.stringify(message || true);
  this._client.publish({ topic: topic, messageId: messageId, qos: 0, payload: message });
  setTimeout(wrap(done), 0);
};

MQTTAscoltatore.prototype.unsubscribe = function unsubscribe(topic, callback, done) {
  this._raiseIfClosed();
  var messageId = buildMessageId(topic);
  this._client.unsubscribe({ topic: topic, messageId: messageId});
  this._wrapEvent(messageId, "unsuback", done);
  this._ascoltatore.unsubscribe(topic, callback);
};

MQTTAscoltatore.prototype.close = function close(done) {
  var that = this;
  if(!this._closed) {
    that._ascoltatore.close();
    this._client_conn.on("close", function() {
      delete that._client_conn;
      wrap(done)();
    });
    this._client_conn.disconnect();
  } else {
    wrap(done)();
  }
  this.emit("closed");
};

util.aliasAscoltatore(MQTTAscoltatore.prototype);

function buildMessageId() {
  return Math.floor(Math.random() * 0xFFFF);
}

module.exports = MQTTAscoltatore;
