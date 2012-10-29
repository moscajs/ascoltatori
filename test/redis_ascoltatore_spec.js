var behave_like_an_ascoltatore = require("./behave_like_an_ascoltatore");

describe(ascoltatori, function() {

  behave_like_an_ascoltatore();

  beforeEach(function() {
    this.instance = new ascoltatori.RedisAscoltatore(redisSettings);
  });

  afterEach(function() {
    this.instance.reset();
  });
});
