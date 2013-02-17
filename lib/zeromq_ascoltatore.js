
var util = require("./util");
var wrap = util.wrap;
var MemoryAscoltatore = require("./memory_ascoltatore");
var AbstractAscoltatore = require('./abstract_ascoltatore');

/**
 * ZeromqAscoltatore is a class that inherits from AbstractAscoltatore.
 * It is implemented through the `zmq` package.
 * ZeromqAscoltatore operates in a true peer-to-peer fashion, so there is
 * no central broker.
 * The two or more instances MUST be aware of each other and connect to each
 * other by the `connect` method.
 * All the instances transmit to everyone ALL messages in a broadcast fashion,
 * however loops are avoided.
 *
 * The options are:
 *  - `port`, the zmq port to listen from;
 *  - `remotePorts`, the remote ports to connect to;
 *  - `zmq`, the zmq module (it will automatically be required if not present);
 *  - `delay`, a delay that is applied to the `ready` and `closed` events.
 *
 * @api public
 */
function ZeromqAscoltatore(opts) {
  AbstractAscoltatore.call(this);

  this._opts = opts || {};
  this._opts.delay = this._opts.delay || 5;
  this._opts.zmq = this._opts.zmq || require("zmq");

  this._ascoltatore = new MemoryAscoltatore();
  this._startSubs();
  this._startPub();
  this._ascoltatore.on("newTopic", this.emit.bind(this, "newTopic"));
}

/**
 * Inherits from AbstractAscoltatore
 *
 * @api private
 */
ZeromqAscoltatore.prototype = Object.create(AbstractAscoltatore.prototype);

/**
 * Starts a connection to all the remote ports.
 *
 * @api private
 */
ZeromqAscoltatore.prototype._startSubs = function() {
  var that = this;
  if(this._sub_conns == undefined) {
    that._sub_conns = [];
    that._opts.remotePorts = that._opts.remotePorts || [];
    that._opts.remotePorts.forEach(function(port) {
      that.connect(port);
    });
  }
  return this._sub_conns;
}

ZeromqAscoltatore.prototype._startPub = function() {
  var that = this;
  if(that._pub_conn == undefined) {
    that._pub_conn = createConn(that._opts, "pub");
    that._pub_conn.bind(that._opts.port, function(err) {
      if(err) throw err;
      setTimeout(function() {
        that.connect(that._opts.port, function() {
          that.emit("ready");
        });
      }, that._opts.delay);
    });
  }
  return that._pub_conn;
};

/**
 * Connect the Ascoltatore to a remote ZMQ port.
 *
 * @param {String} port
 * @param {Function} callback
 * @api public
 */
ZeromqAscoltatore.prototype.connect = function connect(port, callback) {
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
  setTimeout(wrap(callback), this._opts.delay);
  return this;
}

/**
 * Private stuff
 *
 * @api private
 */
ZeromqAscoltatore.prototype.subscribe = function subscribe(topic, callback, done) {
  this._raiseIfClosed();
  this._ascoltatore.subscribe(topic, callback, done);
};

ZeromqAscoltatore.prototype.publish = function publish(topic, message, done) {
  this._raiseIfClosed();
  var toSend = topic + " " + JSON.stringify(message || true);
  this._pub_conn.send(toSend);
  util.defer(done); // simulate some asynchronicity
};

ZeromqAscoltatore.prototype.unsubscribe = function unsubscribe(topic, callback, done) {
  this._raiseIfClosed();
  this._ascoltatore.unsubscribe(topic, callback);
  util.defer(done); // simulate some asynchronicity
};

ZeromqAscoltatore.prototype.close = function close(done) {
  var that = this;

  if (this._closed) {
    wrap(done)();
    return;
  }

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
  this._ascoltatore.close();
  this.emit("closed");
  setTimeout(wrap(done), this._opts.delay);
};

util.aliasAscoltatore(ZeromqAscoltatore.prototype);

/**
 * Create 0MQ connection using of the given type.
 *
 * @api private
 */
function createConn(opts, type) {
  var conn = opts.zmq.socket(type);
  conn.identity = util.buildIdentifier();
  return conn;
}

/**
 * Export ZeromqAscoltatore
 *
 * @api public
 */
module.exports = ZeromqAscoltatore;
