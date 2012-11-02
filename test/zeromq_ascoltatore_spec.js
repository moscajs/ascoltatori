var behave_like_an_ascoltatore = require("./behave_like_an_ascoltatore");
var wrap = require("../lib/util").wrap;

function postpone(task) {
  setTimeout(task, 5);
}

describe(ascoltatori, function() {

  behave_like_an_ascoltatore();

  beforeEach(function(done) {
    this.instance = new ascoltatori.ZeromqAscoltatore(zeromqSettings());
    postpone(done); // this is needed to actually make 0mq work
  });

  afterEach(function() {
    this.instance.reset();
  });

  it("should sync two instances", function(done) {
    var instance = this.instance;
    var other = new ascoltatori.ZeromqAscoltatore(zeromqSettings());
    postpone(function() {
      instance.connect(other._opts.port);
      other.connect(instance._opts.port);
      postpone(function() {
        instance.subscribe("world", wrap(done), function() {
          postpone(function() {
            other.publish("world");
          });
        });
      });
    });
  });
});
