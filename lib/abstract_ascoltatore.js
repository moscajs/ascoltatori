
var EventEmitter = require('events').EventEmitter;

function AbstractAscoltatore() {
  EventEmitter.call(this);

  this._ready = false;

  var that = this;

  this.on("ready", function() {
    that._ready = true;
  });

  this.on("newListener", function(event, listener) {
    if(event === "ready" && that._ready) {
      listener();
    }
  });
}

AbstractAscoltatore.prototype = Object.create(EventEmitter.prototype);

module.exports = AbstractAscoltatore;
