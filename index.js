
var EventEmitter = require('events').EventEmitter;

var globalEventEmitter = new EventEmitter();

var ascoltatori = {
  on: function(topic, callback) {
    globalEventEmitter.on(topic, callback);
  },
  emit: function() {
    globalEventEmitter.emit.apply(globalEventEmitter, arguments);
  },
  reset: function() {
    globalEventEmitter.removeAllListeners();
  }
};

ascoltatori.pub = ascoltatori.emit;
ascoltatori.publish = ascoltatori.emit;
ascoltatori.sub = ascoltatori.on;
ascoltatori.subscribe = ascoltatori.on;

module.exports = ascoltatori;
