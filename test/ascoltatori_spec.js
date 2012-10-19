
var ascoltatori = require("../index");
var expect = require("chai").expect;

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
    ascoltatori.on("hello", done);
    ascoltatori.emit("hello");
  });

  it("should support 'pub/sub combination for pub/sub", function(done) {
    ascoltatori.sub("hello", done);
    ascoltatori.pub("hello");
  });

  it("should support 'publish/subscribe combination for pub/sub", function(done) {
    ascoltatori.subscribe("hello", done);
    ascoltatori.publish("hello");
  });
});
