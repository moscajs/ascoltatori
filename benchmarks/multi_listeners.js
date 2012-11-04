
var ascoltatori = require("../");
var async = require("async");
var runner = require("./runner");

function bench(type, options, counter, done) {
  var instance = new type(options);

  var callback = function() {
    if(--counter == 0) {
      done();
    }
  };

  var a = [];
  for(var i = counter; i > 0; i--) {
    a.push(instance.sub.bind(instance, "hello", callback));
  }

  async.parallel(a, instance.publish.bind(instance, "hello", null));
}

var argv = require('optimist').
  usage('Usage: $0 -c CLASS -r RUNS -o FILE -l LISTENERS').
  demand(['c','r', 'o', "l"]).
  alias("c", "class").
  alias("r", "runs").
  alias("o", "output").
  alias("l", "listeners").
  alias("d", "header").
  describe("c", "use the specified class MemoryAscoltatore, RedisAscoltatore, RabbitAscoltatore, ZeromqAscoltatore").
  describe("r", "the number of runs of this bench").
  describe("o", "the output file").
  describe("l", "the listeners to attach to use in each bench").
  describe("d", "write the header of the CSV sequence").
  boolean("header").
  check(function(args) {
    if(ascoltatori[args.class] === undefined)
      throw "ERROR: You can specify only one of: MemoryAscoltatore, RedisAscoltatore, RabbitAscoltatore, ZeromqAscoltatore";
  }).
  argv;

function toCSV() {
  var array = Array.prototype.slice.apply(arguments);
  return array.reduce(function (acc, e) {
    return acc + ", " + e;
  });
}

runner(argv.output, async.apply(bench, ascoltatori[argv.class], {}, argv.listeners), argv.runs, function(results) {
  if(argv.header) {
    console.log(toCSV("class", "mean", "standard deviation", "runs", "listeners"));
  }
  console.log(toCSV(argv.class, results.mean, results.standardDeviation, argv.runs, argv.listeners));
});
