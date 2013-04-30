"use strict";

var util = require('util');
var uuid = require("node-uuid");
var async = require("async");

/**
 * A function to build an unique identifier.
 * @api public
 */
function buildIdentifier() {
  var result = util.format('asc_%s', uuid.v1());
  return result;
}
module.exports.buildIdentifier = buildIdentifier;

/**
 * Alias two methods from the same object
 *
 * @api public
 * @param {Object} obj The object
 * @param {String} from The source property name
 * @param {String} to The destination property name
 */
function alias(obj, from, to) {
  if (typeof obj[from] !== 'function') {
    throw util.format("'%s' is not a function", from);
  }
  obj[to] = obj[from];
  return obj;
}
module.exports.alias = alias;

/**
 * The list of common aliases for all ascoltatori.
 *
 * @api public
 */
var aliases = {
  publish: ["pub"],
  subscribe: ["sub"],
  unsubscribe: ["unsub"]
};

/**
 * Applies the `aliases` list to an ascoltatore.
 *
 * @param {AbstractAscoltatore} obj The ascolatore
 * @api public
 */
function aliasAscoltatore(obj) {
  var key = null;
  Object.keys(aliases).forEach(function(key) {
    if (aliases.hasOwnProperty(key)) {
      aliases[key].forEach(function(a) {
        module.exports.alias(obj, key, a);
      });
    }
  });
  return obj;
}
module.exports.aliasAscoltatore = aliasAscoltatore;

/**
 * Wrap a function in another function, which might
 * be null.
 *
 * @api public
 * @param {Function} done the funcion to be wrapped.
 */
function wrap(done) {
  return function() {
    if (typeof done === 'function') {
      done();
    }
  };
}
module.exports.wrap = wrap;

/**
 * Defer the execution of the passed function to the
 * next tick. The function might be null.
 *
 * @api public
 * @param {Function} done the funcion to be deferred.
 */
function defer(done) {
  if (typeof done === 'function') {
    async.setImmediate(done);
  }
}
module.exports.defer = defer;
