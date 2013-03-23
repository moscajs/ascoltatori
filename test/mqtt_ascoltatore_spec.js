describe("ascoltatori.MQTTAscoltatore", function() {

  behaveLikeAnAscoltatore();

  beforeEach(function(done) {
    this.instance = new ascoltatori.MQTTAscoltatore(mqttSettings());
    this.instance.on("ready", done);
  });

  afterEach(function(done) {
    this.instance.close(function() {
      done();
    });
    delete this.instance;
  });

  it("should sync two instances", function(done) {
    var other = new ascoltatori.MQTTAscoltatore(mqttSettings());
    var that = this;
    async.series([

      function(cb) {
        other.on("ready", cb);
      },

      function(cb) {
        that.instance.subscribe("hello", wrap(done), cb);
      },

      function(cb) {
        other.publish("hello", null, cb);
      },

      function(cb) {
        other.close(cb);
      }
    ]);
  });
});
