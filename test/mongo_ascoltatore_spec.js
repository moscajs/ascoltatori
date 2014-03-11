
var MongoClient = require('mongodb').MongoClient;

describe("ascoltatori.MongoAscoltatore", function() {

  behaveLikeAnAscoltatore(ascoltatori.MongoAscoltatore, "mongo", mongoSettings);

  beforeEach(function(done) {
    this.instance = new ascoltatori.MongoAscoltatore(mongoSettings());
    this.instance.on("ready", done);
  });

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
      setImmediate(function() {
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
});
