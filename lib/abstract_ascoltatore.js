
var EventEmitter = require('events').EventEmitter;

function AbstractAscoltatore() {
  EventEmitter.call(this);

  this._ready = false;
  this._closed = false;

  var that = this;

  this.on("ready", function() {
    that._ready = true;
  });

  this.on("closed", function() {
    that._closed = true;
  });

  this.on("newListener", function(event, listener) {
    if(event === "ready" && that._ready) {
      listener();
    }
  });

  this.setMaxListeners(0);
}

AbstractAscoltatore.prototype = Object.create(EventEmitter.prototype);

AbstractAscoltatore.prototype._raiseIfClosed = function raiseIfClosed() {
  if(this._closed)
    throw "This ascoltatore " + this.prototype.name + " is closed";
};

module.exports = AbstractAscoltatore;
