var SubsCounter = ascoltatori.SubsCounter;

describe("ascoltatori.SubsCounter", function() {

  it("should be able to add elements", function() {
    expect(function() {
      var set = new SubsCounter();
      set.add("hello world");
    }).to.not.
    throw ();
  });

  it("should have a 0 length by default", function() {
    expect(new SubsCounter().length).to.equal(0);
  });

  it("should have a length of 1 after adding an element", function() {
    var set = new SubsCounter();
    set.add("hello world");
    expect(set.length).to.equal(1);
  });

  it("should have a length of 1 after adding two time the same element", function() {
    var set = new SubsCounter();
    set.add("hello world");
    set.add("hello world");
    expect(set.length).to.equal(1);
  });

  it("should have a length of 2 after adding two elements", function() {
    var set = new SubsCounter();
    set.add("hello world");
    set.add("hello matteo");
    expect(set.length).to.equal(2);
  });

  it("should include an added key", function() {
    var set = new SubsCounter();
    set.add("hello world");
    expect(set.include("hello world")).to.be.true;
  });

  it("should not include a not added key", function() {
    expect(new SubsCounter().include("hello world")).to.be.false;
  });

  it("should have a length of 0 after adding and removing the same element", function() {
    var set = new SubsCounter();
    set.add("hello world");
    set.remove("hello world");
    expect(set.length).to.equal(0);
  });

  it("should not reduce the length if the removed element is not present", function() {
    var set = new SubsCounter();
    set.remove("hello world");
    expect(set.length).to.equal(0);
  });

  it("should handle the adding, the removing and the readding of a key", function() {
    var set = new SubsCounter();
    set.add("hello world");
    set.remove("hello world");
    set.add("hello world");
    expect(set.length).to.equal(1);
  });

  it("should support adding a key twice, removing once, and it still should include it", function() {
    var set = new SubsCounter();
    set.add("hello world");
    set.add("hello world");
    set.remove("hello world");
    expect(set.include("hello world")).to.be.true;
  });

  it("should have a fluent interface for adding and removing", function() {
    expect(function() {
      new SubsCounter().add("hello world").remove("b").add("c");
    }).to.not.
    throw ();
  });

  it("should have a forEach that iterates over all added members", function() {
    var ary = [];
    new SubsCounter().add("a").add("b").add("c").add("d").remove("c").forEach(function(e) {
      ary.push(e);
    });
    expect(ary).to.eql(["a", "b", "d"]);
  });

  it("should have a keys method that returns all members", function() {
    expect(new SubsCounter().add("a").add("b").add("c").add("d").
    remove("c").keys()).to.eql(["a", "b", "d"]);
  });

  it("should have a clear method the cleans up the set", function() {
    expect(new SubsCounter().add("a").add("b").clear().add("c").add("d").
    remove("c").keys()).to.eql(["d"]);
  });
});
