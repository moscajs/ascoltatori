
var ascoltatori = require("../index");
var expect = require("chai").expect;
var behave_like_an_ascoltatore = require("./behave_like_an_ascoltatore");

describe(ascoltatori, function() {

  behave_like_an_ascoltatore();

  beforeEach(function() {
    this.instance = new ascoltatori.MemoryAscoltatore();
  });
});
