"use strict";

var util = require("./util");
var TrieAscoltatore = require("./trie_ascoltatore");
var AbstractAscoltatore = require('./abstract_ascoltatore');
var debug = require("debug")("ascoltatori:kafka");
var SubsCounter = require("./subs_counter");
var async = require("async");

/**
 * KafkaAscoltatore is a class that inherits from AbstractAscoltatore.
 * It is implemented through the `kafka-node` package and it could be
 * backed up by kafka 0.8 and above.
 *
 * The options are:
 *  - connectionString: Zookeeper connection string, default localhost:2181/
 *  - clientId: This is a user-supplied identifier for the client application, default kafka-node-client
 *  - zkOptions: Object, Zookeeper options, see node-zookeeper-client
 *  - noAckBatchOptions: Object, when requireAcks is disabled on Producer side we can define the batch properties, 'noAckBatchSize' in bytes and 'noAckBatchAge' in milliseconds. The default value is { noAckBatchSize: null, noAckBatchAge: null } and it acts as if there was no batch
 *  - groupId: Consumer group id, defaults to kafka-node-group
 *  - topics: List of available topics for subscribe
 *
 * @api public
 * @param {Object} opts The options object
 */
function KafkaAscoltatore(opts) {
  AbstractAscoltatore.call(this, opts, {
    separator: '_',
    wildcardOne: '[^_]+',
    wildcardSome: '.*'
  });
  this._default_opts = {connectionString: "localhost:2181/", clientId: "kafka-node-client", groupId: "kafka-node-group"};
  this._opts = opts || this._default_opts;
  this._opts.keepalive = this._opts.keepalive || 3000;
  this._opts.kafka = this._opts.kafka || require("kafka-node");
  this._opts.topics = this._opts.topics || [];
  this._topicmap = {};
  for(var i=0;i<this._opts.topics.length; i++){
    if(typeof this._opts.topics[i] == 'string'){
      this._topicmap[this._opts.topics[i]] = {topic: this._opts.topics[i], encoding: "utf8"};
    }else{
      var topic = this._opts.topics[i].topic;
      this._topicmap[topic] = this._opts.topics[i];
      if(this._topicmap[topic].encoding === undefined){
        this._topicmap[topic].encoding = "utf8";
      }
    }
  }
  this._opts.noAckBatchOptions = this._opts.noAckBatchOptions || { noAckBatchSize: null, noAckBatchAge: null };

  this._subs_counter = new SubsCounter();

  this._ascoltatore = new TrieAscoltatore(opts);
  this._consumerStarting = false;
  var connectionString = this._opts.connectionString || this._default_opts.connectionString;
  var clientId = this._opts.clientId || this._default_opts.clientId;
  var zkOptions = this._opts.zkOptions || this._default_opts.zkOptions;
  var noAckBatchOptions = this._opts.noAckBatchOptions;
  var Client = this._opts.kafka.Client;
  this._producerClient = new Client(connectionString,clientId,zkOptions,noAckBatchOptions);
  var HighLevelProducer = this._opts.kafka.HighLevelProducer;
  this._producer = new HighLevelProducer(this._producerClient);
  debug("producer created");
  var that = this;
  this._producer.on('ready',function(){that.emit("ready");});
}

/**
 * KafkaAscoltatore inherits from AbstractAscoltatore
 *
 * @api private
 */
KafkaAscoltatore.prototype = Object.create(AbstractAscoltatore.prototype);

KafkaAscoltatore.prototype.withTopicPartitionsExpanded = function withTopicPartitionsExpanded(client,topics,callback){
  var that = this;
  var wanted = [];
  topics.forEach(function(t){
     wanted.push(t.topic);
  });
  client.loadMetadataForTopics(wanted, function(err, results) {
       //TODO handle err
       var metadata = results[1].metadata;
       var partitions = [];
       for(var i=0;i<topics.length;i++){
           var topic = topics[i].topic;
           if (topic in metadata){
             var dictionary = metadata[topic];
             for (var key in dictionary) {
               if (dictionary.hasOwnProperty(key)) {
                  partitions.push({topic: topic, partition: dictionary[key].partition, time: -1, maxNum: 1});
               }
             }
           }
       }
       callback(partitions);
   });
};
KafkaAscoltatore.prototype.withTopicOffsetsAdded = function withTopicOffsetsAdded(client,topics,callback){
     var that = this;
     this.withTopicPartitionsExpanded(client, topics, function(partitions){
       for(var i=0;i<partitions.length;i++){
          partitions[i].time = -1;
          partitions[i].maxNum = 1;
       }
       var kafka = that._opts.kafka;
       var offset = new kafka.Offset(client);
       offset.fetch(partitions, function (err, data) {
           var offsets = [];
           //TODO handle err
           for (var topic in data) {
             if (data.hasOwnProperty(topic)) {
                for(var partition in data[topic]){
                   if(data[topic].hasOwnProperty(partition)){
                      offsets.push({topic: topic, partition: parseInt(partition), offset: data[topic][partition][0]});
                   }
                }
             }
           }
           callback(offsets);
       });
   });
};

/**
 * Starts a new connection to an Kafka server.
 * Do nothing if it is already started.
 *
 * @api private
 */
KafkaAscoltatore.prototype._startConn = function(cb) {
  var that = this;
  if (this._consumer === undefined) {
     this._consumerStarting = true;
     var newcb = function(){
          that._consumerStarting = false;
          util.wrap(cb)();
     };
     var connectionString = that._opts.connectionString || that._default_opts.connectionString;
     var clientId = that._opts.clientId || that._default_opts.clientId;
     var zkOptions = that._opts.zkOptions || that._default_opts.zkOptions;
     var noAckBatchOptions = that._opts.noAckBatchOptions;
     var groupId = that._opts.groupId || that._default_opts.groupId;
    debug("consumer connecting..");
    var Client = this._opts.kafka.Client;
    var HighLevelConsumer = this._opts.kafka.HighLevelConsumer;
    var Consumer = this._opts.kafka.Consumer;
    debug("consumer connecting with connectionString=["+connectionString+"], clientId=["+clientId+"], groupId=["+groupId+"]");
    this._consumerClient = new Client(connectionString,clientId,zkOptions,noAckBatchOptions);
    var subscribedTopics = that._subs_counter.keys();
    var subscriptions = [];
    subscribedTopics.forEach(function(topic){
        subscriptions.push({topic: topic, offset: -1});
    });
    var initConsumer = function(subscriptions){
        debug("initial subscriptions are: ",subscriptions);
        that._consumer = new Consumer(that._consumerClient,subscriptions,{groupId: groupId,
                fromOffset: true,    autoCommit: false, encoding: "buffer" });

        that._consumer.on("message", function(message) {
          debug("received new message on topic " + message.topic);
          var publish = function(){
                var value = message.value;
                var encoding = "utf8";
                if(message.topic in that._topicmap){
                  encoding = that._topicmap[message.topic].encoding || "utf8";
                }
                if(message.value && encoding !== "buffer"){
                  value = message.value.toString(encoding);
                }
              that._ascoltatore.publish(that._recvTopic(message.topic), value);
          };
          publish();
        });
        that._consumer.on('error', function(e) {
          debug("error in client",e);
          that.emit("error", e);
        });
        if(false && subscriptions.length){
          that._consumer.on("registered", function() {
              newcb();
          });
        }else{
              util.defer(newcb);
        }
    };
    that._consumerClient.on('ready',function() {
        that.withTopicOffsetsAdded(that._consumerClient,subscriptions,initConsumer);
    });
  }
};

KafkaAscoltatore.prototype._matchTopics = function _matchTopics(pattern){
  if(this._opts.topics.length === 0){
    return [pattern];
  }
  var regex = new RegExp("^"+pattern+"$");
  var matched = [];
  Object.keys(this._topicmap).forEach(function(topic){
    if(regex.test(topic)||regex.test(topic+"_")){
      matched.push(topic);
    }
  });
  return matched;
};
KafkaAscoltatore.prototype.subscribe = function subscribe(topic, callback, done) {
  this._raiseIfClosed();
  var that = this;
  if(this._consumerStarting){
     debug("waiting for startup before subscribing");
     setTimeout(function(){ that.subscribe(topic,callback,done); }, 500);
     return;
  }

  var topics = this._matchTopics(this._subTopic(topic));
  if(topics.length === 0){
    throw new Error("The topic ["+topic+"] is not recognised");
  }
  var subscribe_topics = [];
  topics.forEach(function(topic){
    if(!that._subs_counter.include(topic)){
        subscribe_topics.push({topic: topic});
    }
    that._subs_counter.add(topic);
  });
  this._ascoltatore.subscribe(topic, callback);
  if(this._consumer === undefined){
    this._startConn(done);
    return;
  }
     if(subscribe_topics.length){
      debug("registering new subscriber for topics ", subscribe_topics);
       that.withTopicOffsetsAdded(that._consumerClient,subscribe_topics,function(subscriptions){
          that._consumer.addTopics(subscriptions,function(err,added) {
                debug("registered new subscriber for topic " + topic);
                util.defer(done);
              },true);
          });
    } else {
      debug("NOT registering new subscriber for topics " + topic);
      util.defer(done);
    }
};

KafkaAscoltatore.prototype.publish = function publish(topic, message, done) {
  this._raiseIfClosed();
  var that = this;
  // kafka cannot send a null message. Why are messages missing in the tests...
  if(message === undefined || message === null){
    message = '';
  }
  var pubtopic = this._pubTopic(topic);
  var payload = {
    messages: message,
    topic: pubtopic
  };
  debug("about to publish new message to "+pubtopic);
  that._producer.send([payload], function(err,data) {
   if(err){
     debug("something went wrong publishing to "+pubtopic,err);
   }else{
      debug("new message published to " + pubtopic);
    }
   util.wrap(done)();
 });
};

KafkaAscoltatore.prototype.unsubscribe = function unsubscribe(topic, callback, done) {
  this._raiseIfClosed();
  var that = this;

  var newDone = null;

  var subtopic = this._subTopic(topic);
  newDone = function() {
    debug("deregistered subscriber for topic " + subtopic);
    util.defer(done);
  };

  this._ascoltatore.unsubscribe(topic, callback);
  this._subs_counter.remove(subtopic);

  if (this._subs_counter.include(subtopic)) {
    newDone();
    return;
  }

  if(this._consumer){
    debug("deregistering subscriber for topic " + topic);
    this.withTopicPartitionsExpanded(this._consumerClient,[{topic: subtopic}],function(partitions){
        that._consumer.removeTopics(partitions,function(err,removed){ newDone(); });
    });
  }else{
    newDone();
  }
};

KafkaAscoltatore.prototype.close = function close(done) {
  var that = this;
  debug("closing");
  if (!this._closed) {
    this._subs_counter.clear();
    if(this._producer){
      this._producer.close(function(){
        that._producerClient.close(function() {
          debug("closed producer");
          delete that._producerClient;
          delete that._producer;
        });
      });
    }
    if(this._consumer){
       that._consumer.close(function(){
        debug("closed consumer");
        that._consumerClient.close(function() {
          debug("closed");
          that._ascoltatore.close();
          delete that._consumerClient;
          delete that._consumer;
          that.emit("closed");
          util.defer(done);
        });
     });
    }else{
      this.emit("closed");
      util.wrap(done)();
    }
  } else {
    util.wrap(done)();
  }
};

util.aliasAscoltatore(KafkaAscoltatore.prototype);

/**
 * Exports the KafkaAscoltatore
 *
 * @api public
 */
module.exports = KafkaAscoltatore;
