var behave_like_an_ascoltatore = require("./behave_like_an_ascoltatore");

describe(ascoltatori, function() {

  behave_like_an_ascoltatore();

  beforeEach(function(done) {
    this.instance = new ascoltatori.RedisAscoltatore(redisSettings);
    this.instance.ensureConnected(done);
  });

  afterEach(function() {
    this.instance.reset();
  });
});
