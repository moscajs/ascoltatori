# Ascoltatori

[![Build
Status](https://travis-ci.org/mcollina/ascoltatori.png)](https://travis-ci.org/mcollina/ascoltatori)

Ascoltatori is a simple publish/subscribe library supporting the followint brokers/protocols:

* [Redis](http://redis.io/), a key/value store created by [@antirez](https://github.com/antirez).
* [MongoDB](http://www.mongodb.org/), a scalable, high-performance, document-oriented database.
* [Mosquitto](http://mosquitto.org/) and all implementations of the [MQTT](http://mqtt.org/) protocol.
* [RabbitMQ](http://www.rabbitmq.com/) and all implementations of the [AMQP](http://www.amqp.org/) protocol.
* [ZeroMQ](http://www.zeromq.org/) without a central broker. In this way Ascoltatori can be used in a P2P fashion.

Find out more aout Ascoltatori reading the [dox documentation](http://mcollina.github.com/ascoltatori/docs/ascoltatori.js.html)

> TIP: Ascoltatori is an italian word which means listeners.
An Ascoltatore is therefore a single listener.


## Install

Install the client library using [npm](http://npmjs.org/)

```
$ npm install ascoltatori --save
```

Install the client library using git

```
$ git clone git://github.com/mcollina/ascoltatori.git
$ cd ascoltatori
$ npm install
```


## Getting Started

Ascoltatori focuses on providing a simple and unique abstraction for all
supported brokes. Here a simple example using Redis.

```
var ascoltatori = require('ascoltatori');

ascoltatori.build(function (ascoltatore) {

  ascoltatore.subscribe('hello/*', function() {
    console.log(arguments); // { '0': 'hello/42', '1': 'a message' }
  });

  ascoltatore.publish('hello/42', 'a message', function() {
    console.log('message published');
  });
});
```





See the tests for more examples regarding RedisAscoltatore,
AMQPAscoltatore, ZeromqAscoltatore, MQTTAscoltatore.

In the test/common.js file you can find all the options for
all the ascoltatori.

All ascoltatori supports the use of a wildcards, so everything
should work smoothly on every broker.
You might find some differences, and in that case file a bug
report, so I can fix them.

Ascoltatori also support the '+' operator, which match only one step in
in a tree of topics:
```
var ascoltatori = require('ascoltatori');

ascoltatori.build(function (ascoltatore) {

  ascolatore.subscribe("hello/+", function() {
    // this will print { '0': "hello/world/42", '1': "a message" }
    console.log(arguments);
  });

  ascoltatore.publish("hello/42", "a message", function() {
    console.log("message published");
  });
});
```

This is an example with both a '*' and a '+':
```
var ascoltatori = require('ascoltatori');

ascoltatori.build(function (ascoltatore) {

  ascoltatore.subscribe("hello/*", function() {
    // this will print { '0': "hello/world/42", '1': "a message" }
    console.log(arguments);
  });

  ascolatore.subscribe("hello/+", function() {
    // this will not be called
  });

  ascoltatore.publish("hello/world/42", "a message", function() {
    console.log("message published");
  });
});
```

## Configuration and dependencies

This library does not depend directly on redis, AMQP (RabbitMQ),
0MQ, MQTT.js, but rather it encourages you to pass them to the
ascoltatori via an options object, like so (for Redis):

```
var ascoltatori = require('ascoltatori');

var settings = {
  type: 'redis',
  redis: require('redis'),
  db: 12,
  port: 424242,
  host: 192.168.42.42
};

ascoltatori.build(settings, function (ascoltatore) {

  ascoltatore.subscribe("hello/*", function() {
    // this will print { '0': "hello/42", '1': "a message" }
    console.log(arguments);
    process.exit(0);
  });

  ascoltatore.publish("hello/42", "a message", function() {
    console.log("message published");
  });
});
```


By default, every ascoltatore built by the `ascoltatori.build`
wraps every published message in a JSON format.
This behaviour can be triggered off by passing a `{ json: false }`
settings object, like so:
```
require('ascoltatori').build({ json: false }, function(a) {
  // ...
});
```

If you feel one more option is missing, feel free to fork this library,
add it, and then send a pull request.

### Domain support

__Ascoltatori__ properly supports the [node.js domain API](http://nodejs.org/api/domain.html).
To use it, you have to call the `registerDomain` function on your
_Ascoltatore_, and it will take care of routing the exceptions to the
given domain. Look at this example:
```
var ascoltatori = require('ascoltatori');
var domain      = require("domain");

var d = domain.create();
d.on("error", function() {
  console.log(arguments);
  process.exit(0);
});

ascoltatori.build(function (ascoltatore) {

  ascoltatore.registerDomain(d);

  ascoltatore.subscribe("hello/*", function() {
    throw new Error();
  });

  ascoltatore.publish("hello/42", "a message", function() {
    console.log("message published");
  });
});
```

## Debugging

__Ascoltatori__ supports the clever
[debug](https://github.com/visionmedia/debug) package, so it is able to
trigger the logging based on an external enviroment variable, like so:
```
$: DEBUG=ascoltatori:mqtt node exaples/mqtt_topic_bridge.js
```

The following debug flags are supported, one for each ascoltatore:
* `ascoltatori:amqp`
* `ascoltatori:memory`
* `ascoltatori:trie`
* `ascoltatori:mqtt`
* `ascoltatori:prefix`
* `ascoltatori:redis`
* `ascoltatori:zmq`

## Reliability

Due to the various transports Ascoltatori uses, it is impossible to
garantee one of the various reliability properties across all of the
transports.
However, the MQTT and AMQP ascoltatori provides at-least-once semantics,
which means that the message might be received more than once, but at
least once.

## Contributing to Ascoltatori

* Check out the latest master to make sure the feature hasn't been
  implemented or the bug hasn't been fixed yet
* Check out the issue tracker to make sure someone already hasn't
  requested it and/or contributed it
* Fork the project
* Start a feature/bugfix branch
* Commit and push until you are happy with your contribution
* Make sure to add tests for it. This is important so I don't break it
  in a future version unintentionally.
* Please try not to mess with the Makefile and package.json. If you
  want to have your own version, or is otherwise necessary, that is
  fine, but please isolate to its own commit so I can cherry-pick around
  it.

## Contributors

Ascoltatori is only possible due to the excellent work of the following contributors:

<table><tbody>
<tr><th align="left">Matteo Collina</th><td><a href="https://github.com/mcollina">GitHub/mcollina</a></td><td><a href="https://twitter.com/matteocollina">Twitter/@matteocollina</a></td></tr>
<tr><th align="left">Filippo de Pretto</th><td><a href="https://github.com/filnik">GitHub/filnik</a></td><td><a href="https://twitter.com/filnik90">Twitter/@filnik90</a></td></tr>
<tr><th align="left">David Halls</th><td><a href="https://github.com/davedoesdev">GitHub/davedoesdev</a></td><td><a href="https://twitter.com/davedoesdev">Twitter/@davedoesdev</a></td></tr>
</tbody></table>

## LICENSE - "MIT License"

Copyright (c) 2012-2013 Matteo Collina and Contributors, http://matteocollina.com

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
