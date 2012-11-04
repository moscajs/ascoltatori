
var fs = require("fs");
var microtime = require("microtime");
var util = require("util");

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

module.exports = function runner(outFile, fn, runs, complete) {
  var total = 0;
  var remainingRuns = runs;
  var results = [];

  var execute = function() {
    var pre = microtime.now();
    fn(function() {
      var post = microtime.now();
      var duration = post - pre;
      results.push(duration);

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
