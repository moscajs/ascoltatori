ascoltatori
===========

[![Build
Status](https://travis-ci.org/mcollina/ascoltatori.png)](https://travis-ci.org/mcollina/ascoltatori)

The pub/sub library for node backed by Redis, RabbitMQ, ZeroMQ,
Mosquitto or just plain node!

## Usage

__Ascoltatori__ is built to be extremely easy to use, and can provide a
useful abstraction for every compatible pub/sub broker.
In this way you can choose whatever broker suits you.

```
var ascoltatori = require('ascoltatori');

var ascoltatore = new ascoltatori.MemoryAscoltatore();

ascoltatore.subscribe("hello/*", function() {
  // this will print { '0': "hello/42", '1': "a message" }
  console.log(arguments); 
  process.exit(0);
});

ascoltatore.publish("hello/42", "a message", function() {
  console.log("message published");
});

```

See the tests for more examples regarding RedisAscoltatore,
RabbitAscoltatore, ZeromqAscoltatore, MQTTAscoltatore.

In the test/common.js file you can find all the options for
all the ascoltatori.

All ascoltatori supports the use of a wildcards, so everything
should work smoothly on every broker.
You might find some differences, and in that case file a bug
report, so I can fix them.

## Dependencies

This library does not depend directly on redis, amqp (RabbitMQ),
zmq, MQTT.js, but rather it encourages you to pass them to the
ascoltatori via an options object, like so (for Redis):

```
var ascoltatori = require('ascoltatori');

var ascoltatore = new ascoltatori.RedisAscoltatore({
  redis: require('redis'),
  db: 12,
  port: 424242,
  host: 192.168.42.42
});

ascoltatore.subscribe("hello/*", function() {
  // this will print { '0': "hello/42", '1': "a message" }
  console.log(arguments); 
  process.exit(0);
});

ascoltatore.publish("hello/42", "a message", function() {
  console.log("message published");
});

```

If you feel one more option is missing, feel free to fork this library,
add it, and then send a pull request.

## Install

```
npm install ascoltatori
```

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
* Please try not to mess with the Cakefile and package.json. If you
  want to have your own version, or is otherwise necessary, that is
  fine, but please isolate to its own commit so I can cherry-pick around
  it.

## LICENSE - "MIT License"

Copyright (c) 2012 Matteo Collina, http://matteocollina.com

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
