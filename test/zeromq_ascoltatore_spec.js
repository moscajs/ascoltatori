var behave_like_an_ascoltatore = require("./behave_like_an_ascoltatore");
var wrap = require("../lib/util").wrap;

describe(ascoltatori, function() {

  behave_like_an_ascoltatore();

  beforeEach(function(done) {
    this.instance = new ascoltatori.ZeromqAscoltatore(zeromqSettings());
    this.instance.on("ready", done);
  });

  afterEach(function() {
    this.instance.reset();
  });

  it("should sync two instances", function(done) {
    var instance = this.instance;
    var other = new ascoltatori.ZeromqAscoltatore(zeromqSettings());
    other.on("ready", function() {
      instance.connect(other._opts.port, function() {
        other.connect(instance._opts.port, function() {
          instance.subscribe("world", wrap(done), function() {
            other.publish("world");
          });
        });
      });
    });
  });
});
