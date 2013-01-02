
var MQTTAscoltatore = require('../').MQTTAscoltatore;
var ascoltatore = new MQTTAscoltatore({
    mqtt: require("mqttjs"),
    host: "127.0.0.1",
    port: 1883
});

ascoltatore.on("ready", function() {

  ascoltatore.subscribe("sink", function(topic, message) {
    console.log(message);
  });

  ascoltatore.subscribe("a/*", function(topic, message) {
    ascoltatore.publish("sink", topic + ": " + message);
  });

  ascoltatore.publish("a/g", "hello world");
  ascoltatore.publish("a/f", "hello world");
});


