
var ascoltatori = require("../");
var async = require("async");
var runner = require("./runner");
var settings = require("./settings");

function setup(type, options, counter, done) {
  var instance = new type(options());
  var pass = {};
  instance.on("ready", function() { 
    var callback = function() {
      if(--counter === 0) {
        pass.complete(null, instance);
      }
    };

    var a = [];
    for(var i = counter; i > 0; i--) {
      a.push(instance.subscribe.bind(instance, "hello", callback));
    }

    async.parallel(a, function() {
      done(null, pass, instance);
    });
  });
}

function teardown(instance, callback) {
  instance.reset(callback);
}

function bench(pass, instance, done) {
  pass.complete = done;
  instance.publish("hello", null);
}

var argv = require('optimist').
  usage('Usage: $0 -c CLASS -r RUNS -o FILE -l LISTENERS').
  demand(['c','r', "l"]).
  alias("c", "class").
  alias("r", "runs").
  alias("l", "listeners").
  alias("d", "header").
  describe("c", "use the specified class MemoryAscoltatore, RedisAscoltatore, RabbitAscoltatore, ZeromqAscoltatore").
  describe("r", "the number of runs of this bench").
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

runner(async.apply(setup, ascoltatori[argv.class], settings[argv.class], argv.listeners), bench, teardown, argv.runs, function(results) {
  if(argv.header) {
    console.log(toCSV("class", "mean", "standard deviation", "runs", "listeners"));
  }
  console.log(toCSV(argv.class, results.mean, results.standardDeviation, argv.runs, argv.listeners));
  setTimeout(function() {
    process.exit(0);
  }, 10);
});
