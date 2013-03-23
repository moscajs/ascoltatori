"use strict";

/**
 * This is a counter for the subscriptions.
 * It is used by all the ascoltatori to keep track to
 * for what topics there are subscribers.
 *
 * @api public
 */
function SubsCounter() {
  this.clear();
}

/**
 * Clear the SubsCounter
 *
 * @api public
 */
SubsCounter.prototype.clear = function() {
  this._length = 0;
  this._obj = {};
  return this;
};

/**
 * Add a new element to the SubsCounter.
 * The SubsCounter keep track of the number of times
 * this method was called for every passed `elem`.
 *
 * @param {String} elem The element to track
 * @return {SubsCounter}
 * @api public
 */
SubsCounter.prototype.add = function(elem) {
  if (!this.include(elem)) {
    this._length += 1;
    this._obj[elem] = 1;
  } else {
    this._obj[elem] = this._obj[elem] + 1;
  }

  return this;
};

/**
 * Removes an element.
 * The SubsCounter keep track of the total
 * times an `elem` is added or removed.
 *
 * @api public
 * @param {String} elem The element to track
 * @return {SubsCounter}
 */
SubsCounter.prototype.remove = function(elem) {
  if (!this.include(elem)) {
    return this;
  }

  if (this._obj[elem] === 1) {
    this._length -= 1;
    delete this._obj[elem];
  } else {
    this._obj[elem] = this._obj[elem] - 1;
  }

  return this;
};

/**
 * The SubsCounter keep track of the total
 * times an `elem` is added or removed, and it
 * offers the `include` method to verify if it is
 * greater than zero.
 *
 * @param {String} elem The element to track
 * @return {boolean} true if the element has more than one subscription
 * @api public
 */
SubsCounter.prototype.include = function(elem) {
  return this._obj[elem] !== undefined;
};


/**
 * List all the elements for which `include` returns true.
 *
 * @api public
 * @param {Function} callback the function where the elements will be
 * yield
 * @return {SubsCounter}
 */
SubsCounter.prototype.forEach = function(callback) {
  var key = null;
  for (key in this._obj) {
    if (this._obj.hasOwnProperty(key)) {
      callback(key);
    }
  }

  return this;
};

/**
 * List all the elements for which `include` returns true.
 *
 * @api public
 * @return {Array} a list of elements
 */
SubsCounter.prototype.keys = function() {
  var array = [];
  this.forEach(function(e) {
    array.push(e);
  });
  return array;
};

/**
 * Returns the number of elements for which `include` returns true.
 *
 * @api public
 * @return {Number} 
 */
SubsCounter.prototype.__defineGetter__("length", function() {
  return this._length;
});

module.exports = SubsCounter;
