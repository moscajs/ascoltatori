
var util = require("./util");
var MemoryAscoltatore = require("./memory_ascoltatore");

function RedisAscoltatore(opts) {
  this._opts = opts
  this._ascoltatore = new MemoryAscoltatore();
  this._sub;
  this._client;
}

RedisAscoltatore.prototype.__defineGetter__("_sub", function() {
  var that = this;
  if(this._sub_conn == undefined) {
    this._sub_conn = createConn(this._opts);

    this._sub_conn.on("message", function(topic, message) {
      that._ascoltatore.emit(topic, JSON.parse(message));
    });
    this._sub_conn.on("pmessage", function(sub, topic, message) {
      that._ascoltatore.emit(topic, JSON.parse(message));
    });
  }
  return this._sub_conn;
});

RedisAscoltatore.prototype.__defineGetter__("_client", function() {
  if(this._client_conn == undefined) {
    this._client_conn = createConn(this._opts);
  }
  return this._client_conn;
});

RedisAscoltatore.prototype.ensureConnected = function ensureConnected(callback) {
  var that = this;
  var alreadyConnected = false;
  var checkFunc = function() {
    var connected = true;
    [that._sub, that._client].forEach(function(conn) {
      connected = conn.connected && connected;
    });
    if(connected && !alreadyConnected) {
      alreadyConnected = true;
      callback();
    }
    return connected;
  }
  if(!checkFunc()) {
    that._sub.on("ready", checkFunc);
    that._client.on("ready", checkFunc);
  }
};

RedisAscoltatore.prototype.on = function on(topic, callback) {
  if(containsWildcard(topic)) {
    this._sub.psubscribe(topic, function() {
      console.log("psubscribe completed");
    });
  } else {
    this._sub.subscribe(topic, function() {
      console.log("subscribe completed");
    });
  }
  this._ascoltatore.on(topic, callback);
};

RedisAscoltatore.prototype.emit = function on(topic, message) {
  message = JSON.stringify(message || true);
  this._client.publish(topic, message, function() {
    console.log("publish completed");
  });
};

RedisAscoltatore.prototype.removeListener = function removeListener(topic, callback) {
  if(containsWildcard(topic)) {
    this._sub.punsubscribe(topic);
  } else {
    this._sub.unsubscribe(topic);
  }
  this._ascoltatore.removeListener(topic, callback);
};

RedisAscoltatore.prototype.reset = function reset() {
  var that = this;
  ["_sub_conn", "_client_conn"].forEach(function(c) {
    if(that[c] !== undefined) {
      that[c].end();
      delete that[c];
    }
  });
};

util.aliasAscoltatore(RedisAscoltatore.prototype);

function containsWildcard(topic) {
  return topic.indexOf("*") >= 0;
}

function createConn(opts) {
  var conn = opts.redis.createClient(opts.port, opts.host, opts);
  conn.select(opts.db || 0);
  return conn;
}

module.exports = RedisAscoltatore;
