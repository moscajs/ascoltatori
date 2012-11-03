
describe(ascoltatori, function() {

  behaveLikeAnAscoltatore();

  beforeEach(function(done) {
    this.instance = new ascoltatori.MemoryAscoltatore();
    this.instance.on("ready", done);
  });
});
