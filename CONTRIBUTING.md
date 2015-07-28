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

### Steps (Testing Locally)

1. Install prerequisites
2. Ensure all servers are running on the default port of `localhost`
3. Fork and clone the repository; enter the repository directory
4. Run `npm install`
5. Run `npm test` (repeat as necessary)

#### MacOS Notes

All prerequisites can be installed with [Homebrew](http://brew.sh).  After installing Homebrew, execute:

```shell
$ brew install zmq rabbitmq redis mongodb
```

After installation of each server, Homebrew should print further instructions. 

### Steps (Testing with Vagrant)

A Vagrant installation will provide a virtual machine with all prerequisites installed for you.  If you are having trouble installing the prerequisites locally (or do not wish to), try this method instead.

1. Install [Vagrant](https://www.vagrantup.com/downloads.html)
2. Install [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
3. Fork and clone the repository; enter the repository directory.  Do *not* run `npm install`.
4. Run `vagrant up`.  Wait.
5. Run `vagrant ssh -c 'cd /vagrant && npm install`
6. Run `vagrant ssh -c 'cd /vagrant && npm test` (repeat as necessary)

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
