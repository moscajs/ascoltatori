"use strict";

var util = require("./util");
var wrap = util.wrap;
var MemoryAscoltatore = require("./memory_ascoltatore");
var AbstractAscoltatore = require('./abstract_ascoltatore');
var SubsCounter = require("./subs_counter");
var debug = require("debug")("ascoltatori:mongodb");
var mongo = require('mongoskin');

var Promise = function (context) {
  this.context = context || this;
  this.callbacks = [];
  this.resolved = undefined;
};

Promise.prototype.then = function (callback) {
  if (this.resolved) {
    callback.apply(this.context, this.resolved);
  } else {
    this.callbacks.push(callback);
  }
};

Promise.prototype.resolve = function () {
  if (this.resolved) {
    throw new Error('Promise already resolved');
  }

  var callback;
  this.resolved = arguments;

  while (callback = this.callbacks.shift()) {
    callback.apply(this.context, this.resolved);
  }
};

/**
 * MongoAscoltatore is a class that inherits from AbstractAscoltatore.
 * It is implemented through the `mongodb` package.

 *
 * The options are:
 *
 * @api public
 * @param {Object} opts The options object
 */
var MongoAscoltatore = function (opts) {
  AbstractAscoltatore.call(this);
  this._opts = opts || {};
  this.uri = this._opts.uri || 'mongodb://localhost:27017/ascoltatori';
  this.uri = this.uri + '?auto_reconnect';
  this.mongoOpts = opts.mongo || {};

  this._ascoltatore = new MemoryAscoltatore();

  this._ascoltatore.on("newTopic", this.emit.bind(this, "newTopic"));

  this.channels = {};
  this._closed = false;

  this.wait = this._opts.wait || 100;

  this.connectionParams = {
    capped: true,
    size: this._opts.size || 100000,
    max: this._opts.max
  };

  this.mongoOpts.safe = false;

  // this operation is SYNC, so emit after this will work
  this.db = mongo.db(this.uri, this.mongoOpts);

  this.__defineGetter__('state', function () {
    return this.db.db.state;
  });

  this.collections = {};
  this._subs_counter = new SubsCounter();
  this.emit('ready');
  debug('ready');
};

/**
 * Inheriting
 *
 * @api private
 */
MongoAscoltatore.prototype = Object.create(AbstractAscoltatore.prototype);

MongoAscoltatore.prototype._getCollection = function (channel) {
  var collection = this.collections[channel];
  if (collection === undefined) {
    collection = new Promise();
    // create always a new collection. It will be actually created ONLY the first time.
    this.db.createCollection(channel, this.connectionParams, collection.resolve.bind(collection));

    this.collections[channel] = collection;
  }
  return collection;
};

MongoAscoltatore.prototype.publish = function (topic, message, done) {
  this._raiseIfClosed();
  message = message || {};
  done = done || function () {};
  var that = this,
    collection = that._getCollection(topic);

  debug('entering the publish method');
  collection.then(function (err, collection) {
    if (err) {
      return done(err);
    }
    debug('publishing message: ' + message + ' on ' + topic + '...');
    collection.insert(message, done);
  });
};

MongoAscoltatore.prototype._disconnected = function () {
  return this.db.db.state === 'disconnected';
};

MongoAscoltatore.prototype.subscribe = function (topic, callback, done) {
  this._raiseIfClosed();

  var that = this,
    subscribed = true,
    collection = this._getCollection(topic);

  debug('collection created, ready to received events');

  var handle = function (die, callback) {

    debug('subscribe -> handle');

    return function () {
      if (!subscribed) {
        debug('not subscribed');
        return;
      }
      if (that._disconnected()) {
        debug('disconnected');
        return;
      }

      var args = [].slice.call(arguments),
        err = args.shift();

      if (err) {
        that.emit('error', err);
      }
      if (err && die) {
        debug('ERROR: ' + err);
        return;
      }

      debug('handle -> calling the callback');
      callback.apply(that, args);
    };
  };

  collection.then(handle(true, function (collection) {

    var latest = null;

    debug('running the collection callback');

    collection.find({}).sort({ $natural: -1 }).limit(1).nextObject(handle(false, function (doc) {
      if (doc) {
        latest = doc._id;
      }

      debug('inside the collection find callback');

      (function poll() {
        if (latest) {
          topic._id = { $gt: latest };
        }

        var options = { tailable: true, awaitdata: true, numberOfRetries: -1 },
          cursor = collection.find(topic, options).sort({ $natural: 1 });

        (function more() {
          cursor.nextObject(handle(false, function (doc) {
            if (!doc) {
              debug('setting the subscriber polling');
              done();
              return setTimeout(poll, that.wait);
            }

            debug('calling the subscriber callback');

            callback(doc);
            latest = doc._id;
            more();
          }));
        })();
      })();
    }));
  }));

  return {
    unsubscribe: function () {
      subscribed = false;
    }
  };
};

MongoAscoltatore.prototype._poll =

MongoAscoltatore.prototype.close = function close() {
  // nothing now
};

function containsWildcard(topic) {
  return topic.indexOf("*") >= 0;
}

util.aliasAscoltatore(MongoAscoltatore.prototype);

/**
 * Exports the MongoAscoltatore
 *
 * @api public
 */
module.exports = MongoAscoltatore;
