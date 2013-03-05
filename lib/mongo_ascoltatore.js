"use strict";

var util = require("./util");
var wrap = util.wrap;
var MemoryAscoltatore = require("./memory_ascoltatore");
var AbstractAscoltatore = require('./abstract_ascoltatore');
var SubsCounter = require("./subs_counter");
var debug = require("debug")("ascoltatori:mongodb");

var mongo = require('mongoskin'),
  mongodb = require('mongodb'),
  BSON = mongodb.BSONPure;

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
  this.uri = this._opts.uri || 'mongodb://localhost:27017/';
  this._pubsubCollection = opts.pubsubCollection || 'ascoltatori';
  this.uri = this.uri + this._pubsubCollection;
  this.uri = this.uri + '?auto_reconnect';
  this.mongoOpts = this._opts.mongo || {};

  this._ascoltatore = new MemoryAscoltatore();

  this._ascoltatore.on("newTopic", this.emit.bind(this, "newTopic"));

  this.channels = {};
  this._closed = false;

  this.wait = this._opts.wait || 100;

  this.connectionParams = {
    capped: true,
    size: this._opts.size || 100000,
    max: this._opts.max || 500
  };

  this.mongoOpts.safe = true;

  // this operation is SYNC, so emit after this will work
  this.db = mongo.db(this.uri, this.mongoOpts);

  var pubsub = 'pubsub',
    that = this;

  this.db.createCollection(pubsub, that.connectionParams, function (err, collection) {
    if (err) {
      console.err(err);
    } else {
      that.collection = collection;
      // be sure to have a capped collection on the run
      that.db.executeDbCommand({"convertToCapped": pubsub, size: that.connectionParams.size}, function ready() {
        debug('ready');

        // create a new object id. We will get all the events from now on
        that._poll(new BSON.ObjectID());

        that.emit('ready');
      });
    }
  });

  this.__defineGetter__('state', function () {
    return this.db.db.state;
  });

  this._subs_counter = new SubsCounter();
};

/**
 * Inheriting
 *
 * @api private
 */
MongoAscoltatore.prototype = Object.create(AbstractAscoltatore.prototype);

MongoAscoltatore.prototype.publish = function (topic, message, done) {
  this._raiseIfClosed();
  message = message || "";
  done = done || function () {};

  var messageObj = {
    value : message,
    topic : topic
  };

  debug('publishing message: ' + message + ' on ' + topic + '...');

  this.collection.insert(messageObj, done);
};

MongoAscoltatore.prototype._disconnected = function () {
  return this.db.db.state === 'disconnected';
};

/**
 * Used to avoid to continue to go on if an error occurs
 *
 * @param die if true, avoid to keep going and just report the error
 * @param callback real callback to call
 * @return {Function} simply exit
 * @private
 */
MongoAscoltatore.prototype._handle = function (die, callback) {

  debug('handle');

  var that = this;

  return function () {
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

MongoAscoltatore.prototype.subscribe = function (topic, callback, done) {
  this._raiseIfClosed();

  debug('subscribe');
  this._ascoltatore.subscribe(topic, callback, done);

};

MongoAscoltatore.prototype._poll = function (latest) {
  debug('poll');

  var query = {};
  if (latest) {
    query._id = { $gt: latest };
  }

  var options = { tailable: true, awaitdata: true, numberOfRetries: -1 },
    cursor = this.collection.find(query, options).sort({ $natural: 1 });

  this._more(latest, cursor);

};

MongoAscoltatore.prototype._more = function (latest, cursor) {
  var that = this;

  debug('more');

  cursor.each(that._handle(false, function (doc) {
    if (!doc) {
      debug('setting the subscriber polling');
      return setTimeout(function () {
        that._poll(latest);
      }, that.wait);
    }

    debug('calling the subscriber callback');

    if (doc._id !== latest && !this._closed) {
      this._ascoltatore.publish(doc.topic, doc.value);
    }
  }));
};

MongoAscoltatore.prototype.unsubscribe = function () {
  this._raiseIfClosed();
  this._ascoltatore.unsubscribe.apply(this._ascoltatore, arguments);
};

MongoAscoltatore.prototype.unsub = MongoAscoltatore.prototype.unsubscribe;

MongoAscoltatore.prototype.close = function close(done) {
  this._closed = true;
  this._ascoltatore.close(done);
  this.emit("closed");
  this.db.close();
};

util.aliasAscoltatore(MongoAscoltatore.prototype);

/**
 * Exports the MongoAscoltatore
 *
 * @api public
 */
module.exports = MongoAscoltatore;
