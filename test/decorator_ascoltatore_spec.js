describe("ascoltatori.DecoratorAscoltatore", function() {

  behaveLikeAnAscoltatore();

  beforeEach(function(done) {
    this.wrapped = new ascoltatori.MemoryAscoltatore();
    this.instance = new ascoltatori.DecoratorAscoltatore(this.wrapped);
    this.instance.on("ready", done);
  });
});
