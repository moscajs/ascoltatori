
describe(ascoltatori.MQTTAscoltatore, function () {

  behaveLikeAnAscoltatore();

  beforeEach(function (done) {
    this.instance = new ascoltatori.MQTTAscoltatore(mqttSettings());
    this.instance.on("ready", done);
  });

  afterEach(function (done) {
    this.instance.close(done);
    delete this.instance;
  });

  it("should sync two instances", function (done) {
    var other = new ascoltatori.MQTTAscoltatore(mqttSettings());
    var that = this;
    async.series([
      function (cb){
        other.on("ready", cb);
      },
      function (cb) {
        that.instance.subscribe("hello", wrap(done), cb);
      },
      function (cb) {
        other.publish("hello", null, cb);
      },
      function (cb) {
        other.close(cb);
      }
    ]);
  });

  it("should send the MQTT keepalive", function (done) {
    var timer = new Date();
    Object.keys(mqttServer.clients).forEach(function (c) {
      mqttServer.clients[c].once("pingreq", function () {
        expect(new Date() - timer).to.be.below(1000);
        done();
      });
    });
  });
});
