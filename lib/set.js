
function Set() {
  this.clear();
}

Set.prototype.clear = function() {
  this._length = 0;
  this._obj = {};
  return this;
};

Set.prototype.add = function(elem) {
  if(!this.include(elem)) {
    this._length += 1;
    this._obj[elem] = true;
  }
  return this;
};

Set.prototype.remove = function(elem) {
  if(this.include(elem)) {
    this._length -= 1;
    delete this._obj[elem];
  }
  return this;
};

Set.prototype.include = function(elem) {
  return elem in this._obj;
};

Set.prototype.forEach = function(callback) {
  for(var key in this._obj) {
    if(this._obj.hasOwnProperty(key)) {
      callback(key);
    }
  }

  return this;
};

Set.prototype.keys = function() {
  var array = [];
  this.forEach(function(e) { array.push(e) });
  return array;
};

Set.prototype.__defineGetter__("length", function() {
  return this._length;
});

module.exports = Set;
