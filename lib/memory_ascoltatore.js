var EventEmitter = require('events').EventEmitter;
var Set = require("./set");
var util = require("./util");

function MemoryAscoltatore() {
  this._event = new EventEmitter();
  this._set = new Set();
}

MemoryAscoltatore.prototype.on = function on(topic, callback) {
  if(containsWildcard(topic)) {
    var regexp = new RegExp(topic.replace("*", ".+"));
    var that = this;
    var handler = function(e) {
      if(e.match(regexp)) {
        that._event.on(e, callback);
      }
    };
    callback._ascoltatori_global_handler = handler;
    this._set.forEach(handler);
    this._event.on("newTopic", handler);
  } else {
    if(!this._set.include(topic)) {
      this._set.add(topic);
      this._event.emit("newTopic", topic);
    }
    this._event.on(topic, callback);
  }
};

MemoryAscoltatore.prototype.emit = function emit(topic) {
  if(!this._set.include(topic)) {
    this._set.add(topic);
    this._event.emit("newTopic", topic);
  }
  var args = Array.prototype.slice.call(arguments);
  args.unshift(topic);
  this._event.emit.apply(this._event, args);
};

MemoryAscoltatore.prototype.removeListener = function removeListener(topic, callback) {
  if(callback._ascoltatori_global_handler !== undefined) {
    this._event.removeListener("newTopic", callback._ascoltatori_global_handler);
    this._set.forEach(function(e) {
      if(e.match(regexp)) {
        this._event.removeListener(e, callback._ascoltatori_global_handler);
      }
    });
  } else {
    this._event.removeListener(topic, callback);
  }
};

MemoryAscoltatore.prototype.reset = function reset() {
  this._set.clear();
  this._event.removeAllListeners();
};

util.aliasAscoltatore(MemoryAscoltatore.prototype);

function containsWildcard(topic) {
  return topic.indexOf("*") >= 0;
}

module.exports = MemoryAscoltatore;
