
var behave_like_an_ascoltatore = require("./behave_like_an_ascoltatore");

describe(ascoltatori, function() {

  behave_like_an_ascoltatore();

  beforeEach(function() {
    ascoltatori.reset();
    this.instance = ascoltatori;
    this.sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    this.sandbox.restore();
  });

  it("should have an use method", function() {
    expect(this.instance).to.respondTo("use");
  });

  it("should return the ascoltatori object when calling use", function() {
    var ascoltatore = new ascoltatori.MemoryAscoltatore();
    expect(ascoltatori.use(ascoltatore)).to.have.be.equal(ascoltatori);
  });

  it("should delegate to the use ascoltatore for 'emit'", function() {
    var ascoltatore = new ascoltatori.MemoryAscoltatore();
    var spy = this.sandbox.spy(ascoltatore, "emit");
    ascoltatori.use(ascoltatore);
    ascoltatori.emit("hello");
    expect(spy).to.have.been.calledWith("hello");
  });

  it("should delegate to _global for 'on'", function() {
    var ascoltatore = new ascoltatori.MemoryAscoltatore();
    var spy = this.sandbox.spy(ascoltatore, "on");
    var func = function(argument) {}
    ascoltatori.use(ascoltatore);
    ascoltatori.on("hello", func);
    expect(spy).to.have.been.calledWith("hello", func);
  });

  it("should delegate to _global for 'removeListener'", function() {
    var ascoltatore = new ascoltatori.MemoryAscoltatore();
    var spy = this.sandbox.spy(ascoltatore, "removeListener");
    var func = function(argument) {}
    ascoltatori.use(ascoltatore);
    ascoltatori.on("hello", func);
    ascoltatori.removeListener("hello", func);
    expect(spy).to.have.been.calledWith("hello", func);
  });

  it("should delegate to _global for 'reset'", function() {
    var ascoltatore = new ascoltatori.MemoryAscoltatore();
    var spy = this.sandbox.spy(ascoltatore, "reset");
    ascoltatori.use(ascoltatore);
    ascoltatori.reset()
    expect(spy).to.have.been.called;
  });
});
