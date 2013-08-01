# Ascoltatori

[![Build
Status](https://travis-ci.org/mcollina/ascoltatori.png)](https://travis-ci.org/mcollina/ascoltatori)

Ascoltatori is a simple publish/subscribe library supporting the following brokers/protocols:

* [Redis](http://redis.io/), a key/value store created by [@antirez](https://github.com/antirez).
* [MongoDB](http://www.mongodb.org/), a scalable, high-performance, document-oriented database.
* [Mosquitto](http://mosquitto.org/) and all implementations of the [MQTT](http://mqtt.org/) protocol.
* [RabbitMQ](http://www.rabbitmq.com/) and all implementations of the [AMQP](http://www.amqp.org/) protocol.
* [ZeroMQ](http://www.zeromq.org/) to use Ascoltatori in a P2P fashion.

Find out more aout Ascoltatori reading the
[dox generated documentation](http://mcollina.github.com/ascoltatori/docs/ascoltatori.js.html)

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

ascoltatori.build(function (ascoltatore) {

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

### Brokers

Ascoltatori supports different brokers. Here we show how to use each of them.

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

#### MQTT (Mosquitto)


```javascript
var ascoltatori = require('ascoltatori');
settings = {
  type: 'mqtt',
  json: false,
  mqtt: require('mqtt'),
  host: '127.0.0.1',
  port: 1883
};

ascoltatori.build(settings, function (ascoltatore) {
  // ...
```

#### AMQP (RabbitMQ)

```javascript
var ascoltatori = require('ascoltatori');
settings = {
  type: 'amqp',
  json: false,
  amqp: require('amqp'),
  exchange: 'ascolatore5672'
};

ascoltatori.build(settings, function (ascoltatore) {
  // ...
```

#### ZeroMQ (RabbitMQ)

```javascript
var ascoltatori = require('ascoltatori');
settings = {
  type: 'zmq',
  json: false,
  zmq: require("zmq"),
  port: "tcp://127.0.0.1:33333",
  controlPort: "tcp://127.0.0.1:33334",
  delay: 10
};

ascoltatori.build(settings, function (ascoltatore) {
  // ...
```

#### Memory

```javascript
var ascoltatori = require('ascoltatori');
ascoltatori.build(function (ascoltatore) {
  // ...
```


### Matching operators

Ascoltatori supports wildcards and the '+' operator, which match only one step in
in a tree of topics. Here a simple example showing how to use both of them.

```javascript
ascoltatori.build(function (ascoltatore) {

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


### JSON

By default, every ascoltatore built by the `ascoltatori.build` wraps every
published message in a JSON format. This behaviour can be triggered off by
passing the `{ json: false }` option.

```javascript
require('ascoltatori').build({ json: false }, function(a) {
  // ...
});
```


### Domain support

Ascoltatori supports the [node.js domain API](http://nodejs.org/api/domain.html).
Use it calling the `registerDomain` function on your Ascoltatore and it will take
care of routing the exceptions to the given domain. Look at this example:

```javascript
var ascoltatori = require('ascoltatori');
var domain = require('domain');

var d = domain.create();
d.on('error', function() {
  console.log(arguments);
});

ascoltatori.build(function (ascoltatore) {
  ascoltatore.registerDomain(d);

  ascoltatore.subscribe('hello/*', function() {
    throw new Error();
  });

  ascoltatore.publish('hello/42', 'a message', function() {
    console.log('message published');
  });
});
```


## Debugging

Ascoltatori supports the [debug](https://github.com/visionmedia/debug) package
and triggers the logs based on an external enviroment variable.

```
$ DEBUG=ascoltatori:mqtt node exaples/mqtt_topic_bridge.js
```

The following debug flags are supported:
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
transports. However, the MQTT and AMQP ascoltatori provides at-least-once
semantics, which means that the message might be received more than once,
but at least once.


## Contributing

Fork the repo on github and send a pull requests with topic branches.
Do not forget to provide specs to your contribution.


### Running specs

* Fork and clone the repository
* Run `npm install`
* Run `npm test`


## Coding guidelines

Follow [felix](http://nodeguide.com/style.html) guidelines.


## Feedback

Use the [issue tracker](http://github.com/mcollina/ascoltatori/issues) for bugs.
[Mail](mailto:touch@lelylan.com) or [Tweet](http://twitter.com/matteocollina) us
for any idea that can improve the project.


## Links

* [GIT Repository](http://github.com/mcollina/ascoltatori)
* [Ascoltaori Documentation](http://mcollina.github.com/ascoltatori/docs/ascoltatori.js.html)
* [Redis](http://redis.io/)
* [MongoDB](http://www.mongodb.org/)
* [Mosquitto](http://mosquitto.org/)
* [RabbitMQ](http://www.rabbitmq.com/)
* [ZeroMQ](http://www.zeromq.org/)


## Authors

[Matteo Collina](http://twitter.com/matteocollina)


## Contributors

Special thanks to the [following people](https://github.com/mcollina/ascoltatori/contributors) for submitting patches.


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
