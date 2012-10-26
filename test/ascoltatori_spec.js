
var ascoltatori = require("../index");
var expect = require("chai").expect;

function wrap(done) {
  return function() {
    done();
  };
}

describe(ascoltatori, function() {

  beforeEach(function() {
    ascoltatori.reset();
  });

  it("should have have an on function", function() {
    expect(ascoltatori).to.respondTo("on");
  });

  it("should have have an emit function", function() {
    expect(ascoltatori).to.respondTo("emit");
  });

  it("should support 'on/emit' combination for pub/sub", function(done) {
    ascoltatori.on("hello", wrap(done));
    ascoltatori.emit("hello");
  });

  it("should support 'pub/sub combination for pub/sub", function(done) {
    ascoltatori.sub("hello", wrap(done));
    ascoltatori.pub("hello");
  });

  it("should support 'publish/subscribe combination for pub/sub", function(done) {
    ascoltatori.subscribe("hello", wrap(done));
    ascoltatori.publish("hello");
  });

  it("should support wildcards", function(done) {
    ascoltatori.on("hello/*", wrap(done));
    ascoltatori.emit("hello/42");
  });

  it("should publish the topic name", function(done) {
    ascoltatori.on("hello/*", function(topic) {
      expect(topic).to.equal("hello/42");
      done();
    });
    ascoltatori.emit("hello/42");
  });

  it("should publish the passed argument", function(done) {
    ascoltatori.on("hello/*", function(topic, value) {
      expect(value).to.equal(42);
      done();
    });
    ascoltatori.emit("hello/123", 42);
  });

  it("should have have a removeListener function", function() {
    expect(ascoltatori).to.respondTo("removeListener");
  });

  it("should remove a listener", function(done) {
    funcToRemove = function(topic, value) {
      throw "this should never run";
    };
    ascoltatori.on("hello", funcToRemove);
    ascoltatori.removeListener("hello", funcToRemove);
    ascoltatori.on("hello", wrap(done));
    ascoltatori.emit("hello");
  });

  it("should remove a listener for global searches", function(done) {
    funcToRemove = function(topic, value) {
      throw "this should never run";
    };
    ascoltatori.on("hello/*", funcToRemove);
    ascoltatori.removeListener("hello/*", funcToRemove);
    ascoltatori.on("hello/42", wrap(done));
    ascoltatori.emit("hello/42");
  });
});
