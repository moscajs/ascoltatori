
var runner = require("async_bench");
var EventEmitter = require("events").EventEmitter;

function setup(done) {
  var instance = new EventEmitter();
  instance.on("message", function () {
    instance.complete();
  });
  done(null, instance);
}

function bench(instance, done) {
  instance.complete = done;
  instance.emit("message");
}

var argv = require('optimist').
  alias("r", "runs").
  alias("d", "header").
  describe("r", "the number of runs of this bench").
  describe("d", "write the header of the CSV sequence").
  boolean("header").
  argv;

function toCSV() {
  var array = Array.prototype.slice.apply(arguments);
  return array.reduce(function (acc, e) {
    return acc + ", " + e;
  });
}

runner({
  preHeat: argv.runs,
  runs: argv.runs,
  setup: setup,
  bench: bench,
  complete: function (err, results) {
    if(argv.header) {
      console.log(toCSV("mean", "standard deviation", "median", "mode", "runs"));
    }
    console.log(toCSV(results.mean, results.stdDev, results.median, results.mode, argv.runs));
    setTimeout(function() {
      process.exit(0);
    }, 10);
  }
});
