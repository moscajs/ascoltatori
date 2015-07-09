Contributing
============

Fork the repo on github and send a pull requests with topic branches.
Do not forget to provide specs to your contribution.


Running specs
-------------

### Prerequisites

- [RabbitMQ](https://www.rabbitmq.com)
- [MongoDB](https://www.mongodb.org)
- [Redis](http://redis.io)
- [ZeroMQ](http://zeromq.org)

#### MacOS Notes

All dependencies can be installed with [Homebrew](http://brew.sh).  After installing Homebrew, execute:

```shell
$ brew install zmq rabbitmq redis mongodb
```

After installation of each server, Homebrew should print further instructions. 

### Steps

- Install prerequisites
- Ensure all servers are running on the default port of `localhost`
- Fork and clone the repository
- Run `npm install`
- Run `npm test`


Coding guidelines
----------------

Follow [felix](http://nodeguide.com/style.html) guidelines.
This project use [JSHint](http://www.jshint.com/) to validate the
source code formatting with a pre commit hook: please respect that.


Contribution License Agreement
----------------

Project license: MIT

* You will only Submit Contributions where You have authored 100% of
  the content.
* You will only Submit Contributions to which You have the necessary
  rights. This means that if You are employed You have received the
  necessary permissions from Your employer to make the Contributions.
* Whatever content You Contribute will be provided under the Project
  License.
