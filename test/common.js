global.sinon = require("sinon");
global.chai = require("chai");
global.expect = require("chai").expect;
global.ascoltatori = require("../");

global.redisSettings = function() {
  return {
    redis: require('redis')
  };
};

var portCounter = 50042;
global.nextPort = function() {
  return ++portCounter;
};

global.zeromqSettings = function(remote_ports) {
  return {
    zmq: require("zmq"),
    port: "tcp://127.0.0.1:" + global.nextPort()
  };
};

var sinonChai = require("sinon-chai");
chai.use(sinonChai);
