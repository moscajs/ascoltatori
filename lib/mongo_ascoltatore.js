"use strict";

var util = require("./util");
var wrap = util.wrap;
var MemoryAscoltatore = require("./memory_ascoltatore");
var AbstractAscoltatore = require('./abstract_ascoltatore');
var SubsCounter = require("./subs_counter");
var debug = require("debug")("ascoltatori:mongodb");
var mongo = require('mongoskin');

function Promise(context) {
  this.context = context || this;
  this.callbacks = [];
  this.resolved = undefined;
}

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
function MongoAscoltatore(opts) {
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

  this.mongoOpts['safe'] = false;

  this.db = mongo.db(this.uri, this.mongoOpts);

  this.__defineGetter__('state', function () {
    return this.db.db.state;
  });

  this.collections = {};
  this._subs_counter = new SubsCounter();
}

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
    this.collections[channel] = collection;
  }
  return collection;
};

MongoAscoltatore.prototype.publish = function (channel, callback, done) {
  this._raiseIfClosed();
  callback = callback || function () {};
  var that = this;

  // create always a new collection. It will be actually created ONLY the first time.
  this.db.createCollection(channel, this.connectionParams, function (err, obj) {
    if (!err) {
      var collection = that._getCollection(channel);

      delete obj._id;

      collection.then(function (err, collection) {
        if (err) {
          return callback(err);
        }
        collection.insert(obj, callback);
      });
    } else {
      console.error(err);
    }
  });
};

MongoAscoltatore.prototype._disconnected = function () {
  return this.db.db.state === 'disconnected';
};

MongoAscoltatore.prototype.subscribe = function (query, callback) {
  this._raiseIfClosed();


  var that = this,
    subscribed = true;

  if (typeof query === 'function' && callback === undefined) {
    callback = query;
    query = {};
  }

  var handle = function (die, callback) {
    if (typeof die === 'function' && callback === undefined) {
      callback = die;
      die = false;
    }

    return function () {
      if (!subscribed) {
        return;
      }
      if (that._disconnected()) {
        return;
      }

      var args = [].slice.call(arguments),
        err = args.shift();

      if (err) {
        that.emit('error', err);
      }
      if (err && die) {
        return;
      }

      callback.apply(that, args);
    };
  };

  var collection = this.collections[query];
  collection.then(handle(true, function (collection) {
    var latest = null;

    collection.find({}).sort({ $natural: -1 }).limit(1).nextObject(handle(function (doc) {
      if (doc) {
        latest = doc._id;
      }

      (function poll() {
        if (latest) {
          query._id = { $gt: latest };
        }

        var options = { tailable: true, awaitdata: true, numberOfRetries: -1 },
          cursor = collection.find(query, options).sort({ $natural: 1 });

        (function more() {
          cursor.nextObject(handle(function (doc) {
            if (!doc) {
              return setTimeout(poll, that.wait);
            }

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
