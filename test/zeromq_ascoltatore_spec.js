describe(ascoltatori.ZeromqAscoltatore, function() {

  behaveLikeAnAscoltatore();

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
    async.series([
      function(cb) {
        other.on("ready", cb);
      },
      function(cb) {
        instance.connect(other._opts.port, cb);
      },
      function(cb) {
        other.connect(instance._opts.port, cb);
      },
      function(cb) {
        instance.subscribe("world", wrap(done), cb);
      },
      function(cb) {
        other.publish("world", null, cb);
      }
    ]);
  });
});
