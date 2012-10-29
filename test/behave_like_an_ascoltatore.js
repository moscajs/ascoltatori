
var expect = require("chai").expect;

function wrap(done) {
  return function() {
    done();
  };
}

module.exports = function() {

  it("should have have an on function", function() {
    expect(this.instance).to.respondTo("on");
  });

  it("should have have an emit function", function() {
    expect(this.instance).to.respondTo("emit");
  });

  it("should support 'on/emit' combination for pub/sub", function(done) {
    this.instance.on("hello3", wrap(done));
    this.instance.emit("hello3");
  });

  it("should support 'pub/sub combination for pub/sub", function(done) {
    this.instance.sub("hello1", wrap(done));
    this.instance.pub("hello1");
  });

  it("should support 'publish/subscribe combination for pub/sub", function(done) {
    this.instance.subscribe("hello2", wrap(done));
    this.instance.publish("hello2");
  });

  it("should support wildcards", function(done) {
    this.instance.on("hello/*", wrap(done));
    this.instance.emit("hello/42");
  });

  it("should publish the topic name", function(done) {
    this.instance.on("hello/*", function(topic) {
      expect(topic).to.equal("hello/42");
      done();
    });
    this.instance.emit("hello/42");
  });

  it("should publish the passed argument", function(done) {
    this.instance.on("hello/*", function(topic, value) {
      expect(value).to.equal(42);
      done();
    });
    this.instance.emit("hello/123", 42);
  });

  it("should have have a removeListener function", function() {
    expect(this.instance).to.respondTo("removeListener");
  });

  it("should remove a listener", function(done) {
    var funcToRemove = function(topic, value) {
      throw "this should never run";
    };
    this.instance.on("hello", funcToRemove);
    this.instance.removeListener("hello", funcToRemove);
    this.instance.on("hello", wrap(done));
    this.instance.emit("hello");
  });

  it("should remove a listener for global searches", function(done) {
    var funcToRemove = function(topic, value) {
      throw "this should never run";
    };
    this.instance.on("hello/*", funcToRemove);
    this.instance.removeListener("hello/*", funcToRemove);
    this.instance.on("hello/42", wrap(done));
    this.instance.emit("hello/42");
 });
};
