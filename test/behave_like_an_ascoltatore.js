
var expect = require("chai").expect;
var wrap = require("../lib/util").wrap;

module.exports = function() {

  it("should have have a subscribe function", function() {
    var that = this;
    expect(that.instance).to.respondTo("subscribe");
  });

  it("should have have an publish function", function() {
    var that = this;
    expect(that.instance).to.respondTo("publish");
  });

  it("should support a publish/subscribe pattern", function(done) {
    var that = this;
    that.instance.subscribe("hello", wrap(done), function() {
      that.instance.publish("hello");
    });
  });

  it("should support 'pub/sub combination for pub/sub", function(done) {
    var that = this;
    that.instance.sub("hello", wrap(done), function() {
      that.instance.pub("hello");
    });
  });

  it("should not raise an exception if pub is called without a done callback", function() {
    var that = this;
    that.instance.pub("hello");
  });

  it("should not raise an exception if pub is called without a done callback", function() {
    var that = this;
    that.instance.sub("hello", function() {});
  });

  it("should support wildcards", function(done) {
    var that = this;
    that.instance.sub("hello/*", wrap(done), function() {
      that.instance.pub("hello/42");
    });
  });

  it("should publish the topic name", function(done) {
    var that = this;
    that.instance.sub("hello/*", function(topic) {
      expect(topic).to.equal("hello/42");
      done();
    }, function() {
      that.instance.pub("hello/42");
    });
  });

  it("should publish the passed argument", function(done) {
    var that = this;
    that.instance.sub("hello/*", function(topic, value) {
      expect(value).to.equal(42);
      done();
    }, function() {
      that.instance.pub("hello/123", 42);
    });
  });

  it("should have have a removeListener function", function() {
    var that = this;
    expect(that.instance).to.respondTo("removeListener");
  });

  it("should remove a listener", function(done) {
    var that = this;
    var funcToRemove = function(topic, value) {
      throw "that should never run";
    };
    that.instance.sub("hello", funcToRemove, function() {
      that.instance.removeListener("hello", funcToRemove, function() {
        that.instance.sub("hello", wrap(done), function() {
          that.instance.pub("hello");
        });
      });
    });
  });

  it("should remove a listener for global searches", function(done) {
    var that = this;
    var funcToRemove = function(topic, value) {
      throw "that should never run";
    };
    that.instance.sub("hello/*", funcToRemove, function() {
      that.instance.removeListener("hello/*", funcToRemove, function() {
        that.instance.sub("hello/42", wrap(done), function() {
          that.instance.pub("hello/42");
        });
      });
    });
  });
};
