
var MongoClient = require('mongodb').MongoClient;
var async = require('async');

describeAscoltatore("mongo", function() {
  afterEach(function(done) {
    this.instance.close(done);
  });

  it("should publish a binary payload", function(done) {
    var that = this;
    that.instance.sub("hello/*", function(topic, value) {
      expect(value).to.eql(new Buffer("42"));
      done();
    }, function() {
      that.instance.pub("hello/123", new Buffer("42"));
    });
  });

  it("should support the old connect uri + db", function(done) {
    this.instance.close(function() {
      this.instance = new ascoltatori.MongoAscoltatore({ uri: 'mongodb://127.0.0.1/', db: 'ascoltatoriTests2' });
      this.instance.on('ready', function() {
        expect(this.instance.db.databaseName).to.eql('ascoltatoriTests2');
        done();
      }.bind(this));
    }.bind(this));
  });

  it("should reuse another mongo connection", function(done) {
    this.instance.close(function() {
      MongoClient.connect('mongodb://127.0.0.1/ascoltatoriTest3', {}, function(err, db) {
        this.instance = new ascoltatori.MongoAscoltatore({ db: db });
        this.instance.on('ready', done);
      }.bind(this));
    }.bind(this));
  });

  it("should publish 2000 messages without skipping one", function(done) {
    var that = this;
    var count = 0;
    var max = 2000;

    function doPub() {
      async.setImmediate(function() {
        that.instance.pub("hello/123", "abcde");
      });
    }

    that.instance.sub("hello/*", function(topic, value) {
      count++;
      if (count === max) {
        done();
      }
    }, function() {
      for (var i = 0; i < max; i++) {
        doPub();
      }
    });
  });

  it("should publish a big payload", function(done) {
    var that = this;
    var payload = new Buffer(5 * 1024);
    that.instance.sub("hello/*", function(topic, value) {
      expect(value).to.eql(payload);
      done();
    }, function(err) {
      that.instance.pub("hello/123", payload);
    });
  });

  it("should publish with options", function(done) {
    var that = this;
    that.instance.subscribe("hello/*", function(topic, value, options) {
      expect(value).to.equal("42");
      expect(options.qos).to.equal(1);
      expect(options.messageId).to.equal(5);
      done();
    }, function() {
      that.instance.publish("hello/123", "42", { qos: 1, messageId: 5 });
    });
  });

  it("should not suffer from mongo interruptions", function (done) {
    this.instance.close(function () {
      MongoClient.connect('mongodb://127.0.0.1/ascoltatoriTest4', {}, function (err, db) {
        db.on('error', function (dontCare) {
          // I don't care
        });
        this.instance = new ascoltatori.MongoAscoltatore({ db: db });
        this.instance.on('error', function (dontCare) {
          // I don't care
        });
        this.instance.on('ready', function () {
          _test(this);
        }.bind(this));
      }.bind(this));
    }.bind(this));

    function _test(that) {
      that.instance.subscribe("hello/*", function (topic, value, options) {
        if (value === "42") {
          done();
        }
      }, function () {
        that.instance.publish("hello/123", "21");
        var admin = that.instance.db.admin();
        admin.command({closeAllDatabases: 1}, {}, function (err, res) {
          if (err) {
            throw(err);
          }
          that.instance.publish("hello/456", "42");
        });
      });
    }
  });
});
