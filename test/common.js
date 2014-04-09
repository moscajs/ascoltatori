"use strict";

global.sinon = require("sinon");
global.chai = require("chai");
global.expect = require("chai").expect;
global.async = require("async");

global.redisSettings = function() {
  return {
    json: false,
    redis: require('redis')
  };
};

var portCounter = 9042;
global.nextPort = function() {
  return ++portCounter;
};

global.zeromqSettings = function(remote_ports) {
  return {
    json: false,
    zmq: require("zmq"),
    port: "tcp://127.0.0.1:" + global.nextPort(),
    controlPort: "tcp://127.0.0.1:" + global.nextPort(),
    delay: 10
  };
};

global.AMQPSettings = function() {
  return {
    json: false,
    amqp: require("amqp"),
    exchange: "ascolatore" + global.nextPort()
  };
};

global.MQTTSettings = function() {
  return {
    json: false,
    mqtt: require("mqtt"),
    host: "127.0.0.1",
    port: 5883
  };
};

global.mongoSettings = function() {
  return {
    url: 'mongodb://127.0.0.1/ascoltatoriTests?auto_reconnect',
    pubsubCollection: 'pubsub',
    json: false,
    mongo: {} // put here your mongo-specific options!
  };
};

global.trieSettings = function() {
  return {
    json: false
  };
};

global.fileSystemSettings = function() {
  return {
    json: false
  };
};

global.eventEmitter2Settings = function() {
  return {
    json: false
  };
};

global.trieSettings = function() {
  return {
    json: false
  };
};

global.decoratorSettings = function() {
  var r = global.trieSettings();
  r.WrappedAscoltatore = global.ascoltatori.TrieAscoltatore;
  return r;
};

global.JSONSettings = global.decoratorSettings;

global.prefixSettings = function() {
  var r = global.decoratorSettings();
  r.args = [this.separator + "myprefix"];
  return r;
};

var mosca = require("mosca");

global.mqttServer = new mosca.Server({
  port: 5883,
  logger: {
    level: "fatal"
  }
});

if (process.env.COVER) {
  global.ascoltatori = require("../lib-cov/ascoltatori");
} else {
  global.ascoltatori = require("../");
}

global.wrap = require("../lib/util").wrap;

global.chai.use(require("sinon-chai"));

function intercept(instance)
{
  var subscribe = instance.subscribe;
  var unsubscribe = instance.unsubscribe;
  var publish = instance.publish;
  instance.subscribe = function(topic, callback, done) {
    subscribe.call(this,
                   topic.replace(/\//g, '|')
                        .replace(/\+/g, '!')
                        .replace(/\*/g, '$'),
                   callback,
                   done);
  };
  instance.unsubscribe = function(topic, callback, done) {
    unsubscribe.call(this,
                     topic.replace(/\//g, '|')
                          .replace(/\+/g, '!')
                          .replace(/\*/g, '$'),
                     callback,
                     done);
  };
  instance.publish = function(topic, message, options, done) {
    publish.call(this, topic.replace(/\//g, '|'), message, options, done);
  };
  instance.sub = instance.subscribe;
  instance.unsub = instance.unsubscribe;
  instance.pub = instance.publish;
}

global.describeAscoltatore = function(type, f) {
  var typeCap = type[0].toUpperCase() + type.slice(1) + "Ascoltatore",
      makeSettings = global[type + "Settings"];

  describe("ascoltatori." + typeCap, function () {
    beforeEach(function(done) {
      this.separator = "/";
      var settings = makeSettings.call(this),
          args = settings.args || [];
      if (settings.WrappedAscoltatore) {
        settings = this.wrapped = new settings.WrappedAscoltatore(settings);
      }
      args.push(settings);
      this.instance = new global.ascoltatori[typeCap](args[0], args[1]);
      this.instance.on("ready", done);
    });
    global.ascoltatori.behaveLikeAnAscoltatore();
    if (f) { f(); }
  });

  describe("ascoltatori." + typeCap + "WildcardAndSeparator", function() {
    beforeEach(function(done) {
      this.separator = "|";
      var settings = makeSettings.call(this),
          args = settings.args || [];
      settings.separator = this.separator;
      settings.wildcardOne = "!";
      settings.wildcardSome = "$";
      if (settings.WrappedAscoltatore) {
        this.wrapped = settings = new settings.WrappedAscoltatore(settings);
        intercept(this.wrapped);
      }
      args.push(settings);
      this.instance = new global.ascoltatori[typeCap](args[0], args[1]);
      intercept(this.instance);
      this.instance.on("ready", done);
    });
    global.ascoltatori.behaveLikeAnAscoltatore();
    if (f) { f(); }
  });
};
