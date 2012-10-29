
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
      that._ascoltatore.publish(topic, JSON.parse(message));
    });
    this._sub_conn.on("pmessage", function(sub, topic, message) {
      that._ascoltatore.publish(topic, JSON.parse(message));
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

RedisAscoltatore.prototype.subscribe = function subscribe(topic, callback, done) {
  if(containsWildcard(topic)) {
    this._sub.psubscribe(topic, wrap(done));
  } else {
    this._sub.subscribe(topic, wrap(done));
  }
  this._ascoltatore.subscribe(topic, callback);
};

RedisAscoltatore.prototype.publish = function publish(topic, message, done) {
  message = JSON.stringify(message || true);
  this._client.publish(topic, message, wrap(done));
};

RedisAscoltatore.prototype.removeListener = function removeListener(topic, callback, done) {
  if(containsWildcard(topic)) {
    this._sub.punsubscribe(topic, wrap(done));
  } else {
    this._sub.unsubscribe(topic, wrap(done));
  }
  this._ascoltatore.removeListener(topic, callback);
};

RedisAscoltatore.prototype.reset = function reset(done) {
  var that = this;
  ["_sub_conn", "_client_conn"].forEach(function(c) {
    if(that[c] !== undefined) {
      that[c].end();
      delete that[c];
    }
  });
  wrap(done)();
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

function wrap(done) {
  return function() {
    if(typeof done === 'function') {
      done();
    }
  };
}

module.exports = RedisAscoltatore;
