
function SubsCounter() {
  this.clear();
}

SubsCounter.prototype.clear = function() {
  this._length = 0;
  this._obj = {};
  return this;
};

SubsCounter.prototype.add = function(elem) {
  if(!this.include(elem)) {
    this._length += 1;
    this._obj[elem] = 1;
  } else {
    this._obj[elem] = this._obj[elem] + 1;
  }

  return this;
};

SubsCounter.prototype.remove = function(elem) {
  if(!this.include(elem)) {
    return this;
  }

  if(this._obj[elem] == 1) {
    this._length -= 1;
    delete this._obj[elem];
  } else {
    this._obj[elem] = this._obj[elem] - 1;
  }

  return this;
};

SubsCounter.prototype.include = function(elem) {
  return this._obj[elem] !== undefined;
};

SubsCounter.prototype.forEach = function(callback) {
  for(var key in this._obj) {
    if(this._obj.hasOwnProperty(key)) {
      callback(key);
    }
  }

  return this;
};

SubsCounter.prototype.keys = function() {
  var array = [];
  this.forEach(function(e) { array.push(e) });
  return array;
};

SubsCounter.prototype.__defineGetter__("length", function() {
  return this._length;
});

module.exports = SubsCounter;
