var util = ascoltatori.util;

describe("ascoltatori.util", function() {

  it("should respond to alias", function() {
    expect(util).to.respondTo("alias");
  });

  it("should create copy a function into another", function() {
    var obj = {
      meth: function() {}
    };
    util.alias(obj, "meth", "methB");
    expect(obj.methB).to.eql(obj.meth);
  });

  it("should return the object when aliasing", function() {
    var obj = {
      meth: function() {}
    };
    expect(util.alias(obj, "meth", "methB")).to.eql(obj);
  });

  it("should raise an exception if we try to alias something that's not a function", function() {
    var obj = {
      a: function() {}
    };
    expect(function() {
      util.alias({}, "a", "c");
    }).to.throw ("'a' is not a function");
  });

  describe("aliasAscoltatore", function() {
    it("should alias all pub/sub method for each ascoltatore", function() {
      var obj = {};
      var mock = sinon.mock(util);
      mock.expects("alias").withArgs(obj, "publish", "pub").once();
      mock.expects("alias").withArgs(obj, "subscribe", "sub").once();
      mock.expects("alias").withArgs(obj, "unsubscribe", "unsub").once();
      util.aliasAscoltatore(obj);
      mock.verify();
    });

    it("should alias all pub/sub method for each ascoltatore", function() {
      var obj = {};
      var stub = sinon.stub(util, "alias");
      expect(util.aliasAscoltatore(obj)).to.equal(obj);
      stub.restore();
    });
  });

  it("should build two different unique identifiers", function() {
    expect(util.buildIdentifier()).not.to.be.eql(util.buildIdentifier());
  });
});
