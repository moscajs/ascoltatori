
var EventEmitter = require('events').EventEmitter;
var Set = require("./lib/set");
var util = require("./lib/util");

var globalEventEmitter = new EventEmitter();
var globalSet = new Set();

function containsWildcard(topic) {
  return topic.indexOf("*") >= 0;
}

var ascoltatori = {
  on: function(topic, callback) {
    if(containsWildcard(topic)) {
      var regexp = new RegExp(topic.replace("*", ".+"));
      var handler = function(e) {
        if(e.match(regexp)) {
          globalEventEmitter.on(e, callback);
        }
      };
      globalSet.forEach(handler);
      globalEventEmitter.on("newTopic", handler);
    } else {
      if(!globalSet.include(topic)) {
        globalSet.add(topic);
        globalEventEmitter.emit("newTopic", topic);
      }
      globalEventEmitter.on(topic, callback);
    }
  },
  emit: function(topic) {
    if(!globalSet.include(topic)) {
      globalSet.add(topic);
      globalEventEmitter.emit("newTopic", topic);
    }
    var args = Array.prototype.slice.call(arguments);
    args.unshift(topic);
    globalEventEmitter.emit.apply(globalEventEmitter, args);
  },
  reset: function() {
    globalSet.clear();
    globalEventEmitter.removeAllListeners();
  }
};

util.aliasAscoltatore(ascoltatori);

module.exports = ascoltatori;
module.exports.Set = Set;
module.exports.util = util;
