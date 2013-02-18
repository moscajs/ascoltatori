
var behave_like_an_ascoltatore = require("./behave_like_an_ascoltatore");

describe(ascoltatori, function () {

  behave_like_an_ascoltatore();

  beforeEach(function () {
    ascoltatori.use(new ascoltatori.MemoryAscoltatore);
    this.instance = ascoltatori;
    this.sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    this.sandbox.restore();
  });

  it("should have an use method", function () {
    expect(this.instance).to.respondTo("use");
  });

  it("should return the ascoltatori object when calling use", function () {
    var ascoltatore = new ascoltatori.MemoryAscoltatore();
    expect(ascoltatori.use(ascoltatore)).to.have.be.equal(ascoltatori);
  });

  it("should delegate to the use ascoltatore for 'pub'", function () {
    var ascoltatore = new ascoltatori.MemoryAscoltatore();
    var spy = this.sandbox.spy(ascoltatore, "publish");
    ascoltatori.use(ascoltatore);
    ascoltatori.publish("hello");
    expect(spy).to.have.been.calledWith("hello");
  });

  it("should delegate to _global for 'subscribe'", function () {
    var ascoltatore = new ascoltatori.MemoryAscoltatore();
    var spy = this.sandbox.spy(ascoltatore, "subscribe");
    var func = function (argument) {}
    ascoltatori.use(ascoltatore);
    ascoltatori.subscribe("hello", func);
    expect(spy).to.have.been.calledWith("hello", func);
  });

  it("should delegate to _global for 'removeListener'", function () {
    var ascoltatore = new ascoltatori.MemoryAscoltatore();
    var spy = this.sandbox.spy(ascoltatore, "removeListener");
    var func = function (argument) {}
    ascoltatori.use(ascoltatore);
    ascoltatori.sub("hello", func);
    ascoltatori.removeListener("hello", func);
    expect(spy).to.have.been.calledWith("hello", func);
  });

  it("should delegate to _global for 'close'", function () {
    var ascoltatore = new ascoltatori.MemoryAscoltatore();
    var spy = this.sandbox.spy(ascoltatore, "close");
    ascoltatori.use(ascoltatore);
    ascoltatori.close()
    expect(spy).to.have.been.called;
  });
});
