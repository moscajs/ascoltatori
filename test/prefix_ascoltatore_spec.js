describeAscoltatore("prefix", function() {

  it("should publish messages on the parent with a prefix", function(done) {
    var that = this;
    this.wrapped.subscribe("/myprefix/hello", wrap(done), function() {
      that.instance.publish("/hello", "world");
    });
  });

  it("should pass options through", function(done) {
    var that = this;
    var opts = { hello: "world" };
    this.instance.subscribe("/hello", function(topic, payload, receivedOpts) {
      expect(receivedOpts).to.eql(opts);
      done();
    }, function() {
      that.instance.publish("/hello", "world", opts);
    });
  });
});
