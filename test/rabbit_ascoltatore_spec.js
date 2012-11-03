var behave_like_an_ascoltatore = require("./behave_like_an_ascoltatore");
var wrap = require("../lib/util").wrap;

describe(ascoltatori, function() {

  behave_like_an_ascoltatore();

  beforeEach(function(done) {
    this.instance = new ascoltatori.RabbitAscoltatore(rabbitSettings());
    this.instance.on("ready", done);
  });

  afterEach(function() {
    this.instance.reset();
  });

  it("should sync two instances", function(done) {
    var other = new ascoltatori.RabbitAscoltatore(this.instance._opts);
    var that = this;
    other.on("ready", function() {
      that.instance.subscribe("hello", wrap(done), function() {
        other.publish("hello");
      });
    });
  });
});
