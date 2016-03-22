var fs = require("fs");
var util = require("../lib/util");

describeAscoltatore("kafka", function() {
  before(function() {
      // runs before all tests in this block
      // ensure that the test topics exist.
      var default_connectionString = "localhost:2181/";
      var settings = kafkaSettings();
      var topics = [];
      for(var i=0;i< settings.topics.length;i++){
        if(typeof settings.topics[i] == 'string'){
          topics.push(settings.topics[i]);
        }else{
          topics.push(settings.topics[i].topic);
        }
      }
      var kafka = settings.kafka || require("kafka-node");
      var connectionString = settings.connectionString || default_connectionString;
      var clientId = settings.clientId || "ascoltatori";
      var zkOptions = settings.zkOptions || {};
      var noAckBatchOptions = settings.noAckBatchOptions || { noAckBatchSize: null, noAckBatchAge: null };
      var Client = settings.kafka.Client;
      var client = new Client(connectionString,clientId,zkOptions,noAckBatchOptions);
      var Producer = settings.kafka.Producer;
      var producer = new Producer(client);
      var that = this;
      producer.on('ready',function(){
      // Create topics sync
        producer.createTopics(topics, false, function (err, data) {
          console.log("create topics "+topics+" -- "+data);
          topics_created = true;
          producer.close(function(){client.close(function(){});});
        });
      });

    });
    var topics_created = false;
    var waitForTopics = function(done){
      if(!topics_created){
        setTimeout(function(){ waitForTopics(done); }, 100);
        return;
      }
      done();
    };
   beforeEach(function(done) {
     waitForTopics(done);
   });

  afterEach(function(done) {
    this.instance.close();
    done();
  });

  it("should sync two instances", function(done) {
    var other = new ascoltatori.KafkaAscoltatore(kafkaSettings());
    var that = this;
    async.series([

      function(cb) {
        other.on("ready", cb);
      },

      function(cb) {
        that.instance.subscribe("hello", util.wrap(done), cb);
      },

      function(cb) {
        other.publish("hello", null, cb);
      }
    ]);
  });

  it("should publish a binary payload", function(done) {
    var that = this;
    that.instance.sub("image",function(topic, value) {
      expect(value).to.eql(new Buffer("42"));
      util.wrap(done)();
    }, function() {
      that.instance.pub("image", new Buffer("42"));
    });
  });

  it("should publish a utf8 payload", function(done) {
    var that = this;
    that.instance.sub("hello",function(topic, value) {
      expect(value).to.eql("€99");
      util.wrap(done)();
    }, function() {
      that.instance.pub("hello", "€99");
    });
  });

});
