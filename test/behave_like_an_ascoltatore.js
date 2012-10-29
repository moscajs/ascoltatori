
var expect = require("chai").expect;

function wrap(done) {
  return function() {
    done();
  };
}

module.exports = function() {

  it("should have have a subscribe function", function() {
    expect(this.instance).to.respondTo("subscribe");
  });

  it("should have have an publish function", function() {
    expect(this.instance).to.respondTo("publish");
  });

  it("should support a publish/subscribe pattern", function(done) {
    this.instance.subscribe("hello", wrap(done));
    this.instance.publish("hello");
  });

  it("should support 'pub/sub combination for pub/sub", function(done) {
    this.instance.sub("hello", wrap(done));
    this.instance.pub("hello");
  });

  it("should support wildcards", function(done) {
    this.instance.sub("hello/*", wrap(done));
    this.instance.pub("hello/42");
  });

  it("should publish the topic name", function(done) {
    this.instance.sub("hello/*", function(topic) {
      expect(topic).to.equal("hello/42");
      done();
    });
    this.instance.pub("hello/42");
  });

  it("should publish the passed argument", function(done) {
    this.instance.sub("hello/*", function(topic, value) {
      expect(value).to.equal(42);
      done();
    });
    this.instance.pub("hello/123", 42);
  });

  it("should have have a removeListener function", function() {
    expect(this.instance).to.respondTo("removeListener");
  });

  it("should remove a listener", function(done) {
    funcToRemove = function(topic, value) {
      throw "this should never run";
    };
    this.instance.sub("hello", funcToRemove);
    this.instance.removeListener("hello", funcToRemove);
    this.instance.sub("hello", wrap(done));
    this.instance.pub("hello");
  });

  it("should remove a listener for global searches", function(done) {
    funcToRemove = function(topic, value) {
      throw "this should never run";
    };
    this.instance.sub("hello/*", funcToRemove);
    this.instance.removeListener("hello/*", funcToRemove);
    this.instance.sub("hello/42", wrap(done));
    this.instance.pub("hello/42");
  });
};
