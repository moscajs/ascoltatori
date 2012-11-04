
var fs = require("fs");
var microtime = require("microtime");
var util = require("util");
var async = require("async");

function mean(array) {
  return array.reduce(function(acc, e) {
    return acc + e;
  }) / array.length;
}

function standardDeviation(array) {
  var mean = array.map(function(e) {
    return Math.pow(e, 2);
  }).reduce(function(acc, e) {
    return acc + e;
  }) / array.length;

  return Math.sqrt(mean);
}

module.exports = function runner(setup, bench, teardown, runs, complete) {
  var total = 0;
  var remainingRuns = runs;
  var results = [];

  var execute = function() {
    var pre = 0;
    var preFunc = function() {
      var array = Array.prototype.slice.apply(arguments);
      var callback = array.pop();
      array.unshift(null);
      pre = microtime.now();
      callback.apply(null, array);
    };
    
    var postFunc = function() {
      var post = microtime.now();
      var duration = post - pre;
      results.push(duration);

      var array = Array.prototype.slice.apply(arguments);
      var callback = array.pop();
      array.unshift(null);
      callback.apply(null, array);
    };
    
    async.waterfall([
      setup,
      preFunc,
      bench,
      postFunc,
      teardown
    ], function(err) {
      if(err) throw err;

      if(--remainingRuns === 0) {
        complete({
          mean: mean(results),
          standardDeviation: standardDeviation(results)
        });
      } else {
        process.nextTick(execute);
      }
    });
  }
  execute();
}
