"use strict";

var util = require("./util");
var wrap = util.wrap;
var MemoryAscoltatore = require("./memory_ascoltatore");
var AbstractAscoltatore = require('./abstract_ascoltatore');
var SubsCounter = require("./subs_counter");
var debug = require("debug")("ascoltatori:mongodb");
var mongo = require('mongodb');

function Promise(context) {
    this.context = context || this;
    this.callbacks = [];
    this.resolved = undefined;
};

Promise.prototype.then = function(callback) {
    if (this.resolved) {
        callback.apply(this.context, this.resolved);
    } else {
        this.callbacks.push(callback);
    }
};

Promise.prototype.resolve = function() {
    if (this.resolved) throw new Error('Promise already resolved');

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
    this.uri = this._opts.uri || 'mongodb://localhost/ascoltatori';

    this._ascoltatore = new MemoryAscoltatore();

    this._ascoltatore.on("newTopic", this.emit.bind(this, "newTopic"));

    this.db = mongo.db(this.uri, this._opts);
    this.channels = {};
    this._closed = false;

    this.wait = this._opts.wait || 100;

    this.connectionParams = {
        capped: true,
        size: this._opts.size || 100000,
        max: this._opts.max
    };

    this.__defineGetter__('state', function () {
        return this.db.db.state;
    });
}

/**
 * Inheriting
 *
 * @api private
 */
MongoAscoltatore.prototype = Object.create(AbstractAscoltatore.prototype);


MongoAscoltatore.prototype.publish = function (channel, callback, done) {
    callback = callback || function () {};

    // create always a new collection. It will be actually created ONLY the first time.
    this.db.createCollection(channel, params, function (err, collectionId){
        if (!err) {
            this.collection.then(function(err, collection) {
                if (err) return callback(err);
                collection.insert(obj, callback);
            });
        } else {
            console.error(err);
        }
    });
};

Channel.prototype.subscribe = function(query, callback) {
    this._raiseIfClosed();

    var self = this;
    var subscribed = true;

    if (typeof query === 'function' && callback === undefined) {
        callback = query;
        query = {};
    }

    var handle = function(die, callback) {
        if (typeof die === 'function' && callback === undefined) {
            callback = die;
            die = false;
        }

        return function() {
            if (!subscribed) return;
            if (self.connection.disconnected()) return;

            var args = [].slice.call(arguments);
            var err = args.shift();

            if (err) self.emit('error', err);
            if (err && die) return;

            callback.apply(self, args);
        };
    };

    this.collection.then(handle(true, function(collection) {
        var latest = null;

        collection.find({}).sort({ $natural: -1 }).limit(1).nextObject(handle(function(doc) {
            if (doc) latest = doc._id;

            (function poll() {
                if (latest) query._id = { $gt: latest };

                var options = { tailable: true, awaitdata: true, numberOfRetries: -1 };
                var cursor = collection.find(query, options).sort({ $natural: 1 });

                (function more() {
                    cursor.nextObject(handle(function(doc) {
                        if (!doc) return setTimeout(poll, self.wait);

                        callback(doc);
                        latest = doc._id;
                        more();
                    }));
                })();
            })();
        }));
    }));

    return {
        unsubscribe: function() {
            subscribed = false;
        }
    };
};






RedisAscoltatore.prototype._updateReady = function updateReady(key) {
    this[key] = true;
    if (this._ready_pub && this._ready_sub) {
        this.emit("ready");
    }
};

function containsWildcard(topic) {
    return topic.indexOf("*") >= 0;
}

RedisAscoltatore.prototype.subscribe = function subscribe(topic, callback, done) {
    this._raiseIfClosed();

    var newDone = function () {
        debug("registered new subscriber for topic " + topic);
        util.defer(done);
    };

    if (containsWildcard(topic)) {
        this._sub.psubscribe(topic, newDone);
    } else {
        this._sub.subscribe(topic, newDone);
    }

    this._subs_counter.add(topic);
    this._ascoltatore.subscribe(topic, callback);
};

RedisAscoltatore.prototype.publish = function publish(topic, message, done) {
    this._raiseIfClosed();

    if (message === undefined || message === null) {
        message = false; // so we can convert it to JSON
    }

    message = JSON.stringify(message);
    this._client.publish(topic, message, function () {
        debug("new message published to " + topic);
        util.defer(done);
    });
};

RedisAscoltatore.prototype.unsubscribe = function unsubscribe(topic, callback, done) {
    this._raiseIfClosed();
    this._subs_counter.remove(topic);
    this._ascoltatore.unsubscribe(topic, callback);

    var newDone = function () {
        debug("deregistered subscriber for topic " + topic);
        util.defer(done);
    };


    if (this._subs_counter.include(topic)) {
        newDone();
        return this;
    }

    if (containsWildcard(topic)) {
        this._sub.punsubscribe(topic, newDone);
    } else {
        this._sub.unsubscribe(topic, newDone);
    }

    return this;
};

RedisAscoltatore.prototype.close = function close(done) {
    var that = this, newDone = null;

    newDone = function () {
        debug("closed");
        util.defer(done);
    };

    if (this._closed) {
        newDone();
        return;
    }

    this.db.close(function closed() {
        this._ascoltatore.close();
        this.emit("closed");
        done();
        this._closed = true;
    });

    return this;
};

util.aliasAscoltatore(RedisAscoltatore.prototype);

/**
 * Exports the RedisAscoltatore
 *
 * @api public
 */
module.exports = RedisAscoltatore;
