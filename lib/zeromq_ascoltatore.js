
var util = require("./util");
var wrap = util.wrap;
var MemoryAscoltatore = require("./memory_ascoltatore");

function ZeromqAscoltatore(opts) {
  this._opts = opts
  this._ascoltatore = new MemoryAscoltatore();
  this._subs;
  this._pub;
}

ZeromqAscoltatore.prototype.__defineGetter__("_subs", function() {
  var that = this;
  if(this._sub_conns == undefined) {
    that._sub_conns = [];
    that._opts.remotePorts = that._opts.remotePorts || [];
    that._opts.remotePorts.forEach(function(port) {
      that.connect(port);
    });
  }
  return this._sub_conns;
});

ZeromqAscoltatore.prototype.connect = function connect(port) {
  var that = this;
  var conn = createConn(that._opts, "sub");
  conn.connect(port);
  conn.subscribe("");
  conn.on("message", function(data) {
    data = data.toString();
    var topic = data.substr(0, data.indexOf(" "));
    var message = JSON.parse(data.substr(data.indexOf(" ")));
    that._ascoltatore.publish(topic, message);
  });
  that._sub_conns.push(conn);
  return this;
}

ZeromqAscoltatore.prototype.__defineGetter__("_pub", function() {
  var that = this;
  if(that._pub_conn == undefined) {
      that._pub_conn = createConn(that._opts, "pub");
      that._pub_conn.bindSync(that._opts.port);
      that.connect(that._opts.port);
  }
  return that._pub_conn;
});

ZeromqAscoltatore.prototype.subscribe = function subscribe(topic, callback, done) {
  this._ascoltatore.subscribe(topic, callback, done);
};

ZeromqAscoltatore.prototype.publish = function publish(topic, message, done) {
  var toSend = topic + " " + JSON.stringify(message || true);
  this._pub.send(toSend);
  setTimeout(wrap(done), 0); // simulate some asynchronicity
};

ZeromqAscoltatore.prototype.removeListener = function removeListener(topic, callback, done) {
  this._ascoltatore.removeListener(topic, callback);
  process.nextTick(wrap(done)); // simulate some asynchronicity
};

ZeromqAscoltatore.prototype.reset = function reset(done) {
  var that = this;
  if(that._sub_conns !== undefined) {
    that._sub_conns.forEach(function(s) {
      s.close();
    });
    delete that._sub_conns;
  }
  if(that._pub_conn !== undefined) {
    that._pub_conn.close();
    delete that._pub_conn;
  }
  wrap(done)();
};

util.aliasAscoltatore(ZeromqAscoltatore.prototype);

function containsWildcard(topic) {
  return topic.indexOf("*") >= 0;
}

var globalCounter = 0;
function createConn(opts, type) {
  var conn = opts.zmq.socket(type);
  conn.identity = util.format('ascoltatore-%s-%s-%s', type, process.pid, globalCounter++);
  return conn;
}

module.exports = ZeromqAscoltatore;
