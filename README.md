# Ascoltatori

[![Build
Status](https://travis-ci.org/mcollina/ascoltatori.png)](https://travis-ci.org/mcollina/ascoltatori)

Ascoltatori is a simple publish/subscribe library supporting the following brokers/protocols:

* [Redis](http://redis.io/), a key/value store created by [@antirez](https://github.com/antirez).
* [MongoDB](http://www.mongodb.org/), a scalable, high-performance, document-oriented database.
* [Mosquitto](http://mosquitto.org/) and all implementations of the [MQTT](http://mqtt.org/) protocol.
* [RabbitMQ](http://www.rabbitmq.com/) and all implementations of the [AMQP](http://www.amqp.org/) protocol.
* [ZeroMQ](http://www.zeromq.org/) to use Ascoltatori in a P2P fashion.

Find out more aout Ascoltatori reading the [dox documentation](http://mcollina.github.com/ascoltatori/docs/ascoltatori.js.html)

> TIP: Ascoltatori is an italian word which means listeners.
An Ascoltatore is therefore a single listener.


## Install

Install the client library using [npm](http://npmjs.org/).

```
$ npm install ascoltatori --save
```

Install the client library using git.

```
$ git clone git://github.com/mcollina/ascoltatori.git
$ cd ascoltatori
$ npm install
```


## Getting Started

Ascoltatori focuses on providing a simple and unique abstraction for all
supported brokes. Here a simple example using Redis.

```javascript
var ascoltatori = require('ascoltatori');
var settings = {
  type: 'redis',
  redis: require('redis'),
  db: 12,
  port: 6379,
  host: localhost
};

ascoltatori.build(settings, function (ascoltatore) {

  // subscribes all messages published with root hello/
  ascoltatore.subscribe('hello/*', function() {
    console.log(arguments);
    // { '0': 'hello/42', '1': 'a message' }
  });

  // publishes a message to the topic hello/42
  ascoltatore.publish('hello/42', 'a message', function() {
    console.log('message published');
  });
});
```

## Configurations

### Matching operators

Ascoltatori supports wildcards and the '+' operator, which match only one step in
in a tree of topics. Here a simple example showing how to use both of them.

```javascript
ascoltatori.build(settings, function (ascoltatore) {

  // subscribes all messages published with root hello/
  // examples: hello/world, hello/world/42, hello/world/super/42
  ascoltatore.subscribe('hello/*', function() {
    console.log(arguments);
    // { '0': 'hello/world/42', '1': 'a message' }
  });

  // subscribes all messages published with root hello/ and one more step
  // examples: hello/world, hello/42, hello/super
  ascolatore.subscribe('hello/+', function() {
    // this subscription will not be called
  });

  // publishes a message to the topic hello/world/42
  ascoltatore.publish('hello/world/42', 'a message', function() {
    console.log('message published');
  });
});
```

### Broker configs

Ascoltatori supports different brokers (see [introduction](#ascoltatori)).
Here we show how to use each of them.

#### Redis

```javascript
var ascoltatori = require('ascoltatori');
var settings = {
  type: 'redis',
  redis: require('redis'),
  db: 12,
  port: 6379,
  host: localhost
};

ascoltatori.build(settings, function (ascoltatore) {
  // ...
```

#### MongoDB

MongoDB uses [Capped Collections](http://docs.mongodb.org/manual/core/capped-collections/)
to implement the pub/sub pattern.

```javascript
var ascoltatori = require('ascoltatori');
settings = {
  type: 'mongo',
  uri: 'mongodb://127.0.0.1/',
  db: 'ascoltatori',
  pubsubCollection: 'ascoltatori',
  mongo: {} // mongo specific options
};

ascoltatori.build(settings, function (ascoltatore) {
  // ...
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
