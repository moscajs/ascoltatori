global.sinon = require("sinon");
global.chai = require("chai");
global.expect = require("chai").expect;
global.ascoltatori = require("../");

global.redisSettings = {
  redis: require('redis')
};

var sinonChai = require("sinon-chai");
chai.use(sinonChai);
