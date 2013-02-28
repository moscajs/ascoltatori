"use strict";

global.sinon = require("sinon");
global.chai = require("chai");
global.expect = require("chai").expect;
global.async = require("async");

global.redisSettings = function () {
  return {
    redis: require('redis')
  };
};

var portCounter = 50042;
global.nextPort = function () {
  return ++portCounter;
};

global.zeromqSettings = function (remote_ports) {
  return {
    zmq: require("zmq"),
    port: "tcp://127.0.0.1:" + global.nextPort()
  };
};

global.rabbitSettings = function () {
  return {
    amqp: require("amqp"),
    exchange: "ascolatore" + global.nextPort()
  };
};

global.mqttSettings = function () {
  return {
    mqtt: require("mqtt"),
    host: "127.0.0.1",
    port: 5883,
    keepalive: 1
  };
};

global.mongoSettings = function () {
  return {

  };
};

var mosca = require("mosca");

global.mqttServer = new mosca.Server({ port: 5883 });

global.ascoltatori = require("../");

global.behaveLikeAnAscoltatore = ascoltatori.behaveLikeAnAscoltatore;

global.wrap = require("../lib/util").wrap;

var sinonChai = require("sinon-chai");
chai.use(sinonChai);
