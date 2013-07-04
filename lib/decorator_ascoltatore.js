"use strict";

var async = require("async");
var AbstractAscoltatore = require("./abstract_ascoltatore");

/**
 * Decorates totally another ascoltatore, doing nothing
 * but forwarding the method calls, this should
 * be a reference implementation for other decorators.
 *
 * @param {Object} decorated The decorated Ascoltatore
 * @api public
 */
function DecoratorAscoltatore(decorated) {
  this._ascoltatore = decorated;
  AbstractAscoltatore.prototype._setPublish.call(this);
}

/**
 * Translate the topic name in another
 *
 * @param String topic The topic name
 * @param Function next The function that will be called
 * @api public
 */
DecoratorAscoltatore.prototype.wrapTopic = function(topic, next) {
  next(null, topic);
};

/**
 * Translate the callback in another
 *
 * @param Function callback The callback to be translated
 * @param Function next The function that will be called
 * @api public
 */
DecoratorAscoltatore.prototype.wrapCallback = function(callback, next) {
  next(null, callback);
};

/**
 * Translate the payload in another
 *
 * @param String payload The payload
 * @param Function next The function that will be called
 * @api public
 */
DecoratorAscoltatore.prototype.wrapPayload = function(payload, next) {
  next(null, payload);
};

/**
 * Forwarding methods
 *
 * @api private
 */

DecoratorAscoltatore.prototype.on = function(event, callback) {
  this._ascoltatore.on(event, callback);
};

DecoratorAscoltatore.prototype.once = function(event, callback) {
  this._ascoltatore.once(event, callback);
};

DecoratorAscoltatore.prototype.removeListener = function(event, callback) {
  this._ascoltatore.removeListener(event, callback);
};

DecoratorAscoltatore.prototype.subscribe = function(topic, callback, done) {
  var that = this;
  async.series([

    function(cb) {
      that.wrapTopic(topic, cb);
    },

    function(cb) {
      that.wrapCallback(callback,cb);
    }

  ], function(err, results) {
    if (err) {
      done(err);
    } else {
      that._ascoltatore.subscribe(results[0], results[1], done);
    }
  });
};

DecoratorAscoltatore.prototype.unsubscribe = function(topic, callback, done) {
  var that = this;
  async.series([

    function(cb) {
      that.wrapTopic(topic, cb);
    },

    function(cb) {
      that.wrapCallback(callback, cb);
    }

  ], function(err, results) {
    if (err) {
      done(err);
    } else {
      that._ascoltatore.unsubscribe(results[0], results[1], done);
    }
  });
};

DecoratorAscoltatore.prototype.publish = function(topic, payload, options, done) {
  var that = this;
  async.series([

    function(cb) {
      that.wrapTopic(topic, cb);
    },

    function(cb) {
      that.wrapPayload(payload, cb);
    }

  ], function(err, results) {
    if (err) {
      done(err);
    } else {
      that._ascoltatore.publish(results[0], results[1], options, done);
    }
  });
};

DecoratorAscoltatore.prototype.close = function(done) {
  this._ascoltatore.close(done);
};

DecoratorAscoltatore.prototype.registerDomain = function(domain) {
  this._ascoltatore.registerDomain(domain);
};

DecoratorAscoltatore.prototype.unsub = function(topic, callback, done) {
  this.unsubscribe(topic, callback, done);
};

DecoratorAscoltatore.prototype.sub = function(topic, callback, done) {
  this.subscribe(topic, callback, done);
};

DecoratorAscoltatore.prototype.pub = function(topic, payload, options, done) {
  this.publish(topic, payload, options, done);
};

module.exports = DecoratorAscoltatore;
