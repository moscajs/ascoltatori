
History
=======

## 0.12.3

* Fixed skipped message by MongoAscoltatore
  [#90](https://github.com/mcollina/ascoltatori/pull/90).

## 0.12.2

* Fixed PrefixAscoltatore support on Windows
  [#86](https://github.com/mcollina/ascoltatori/pull/86).
* Pass through message options in PrefixAscoltatore
  [#86](https://github.com/mcollina/ascoltatori/pull/86).

## 0.12.1

* Fixed broken link to docs in the README.

## 0.12.0

* Changed the MongoAscoltatore setup API
  [#83](https://github.com/mcollina/ascoltatori/pull/83).

## 0.11.5

* Fixed binary payload support in Redis
  [#85](https://github.com/mcollina/ascoltatori/pull/85).

## 0.11.4

* Fixed Redis duplicate messages when using wildcards
  [#84](https://github.com/mcollina/ascoltatori/pull/84).

## 0.11.3

* Updated MQTT.js `optionalDependency` to v0.3.1.

## 0.11.2

* New README, thanks to [Andrea Reginato](https://github.com/andreareginato).

## 0.11.1

* Reverted "Handling of duplicate topics "/hello/world" and "hello/world" on
  MQTT, which are the same."

## 0.11.0

* MQTTAscolatore should send a `clientId.length` < 23 chars #73.
  Made the `clientId` an option in MQTTAscoltatore.
* Handling of duplicate topics "/hello/world" and "hello/world" on
  MQTT, which are the same.

## 0.10.0

* Refactoring of the MongoAscoltatore `close` method, to close up everything for real #68.
* Add the TrieAscoltatore 'global' testing #69.
* Ascoltatori.build should allow a function as a type #70.
* Added code coverage with istanbul #67.

## 0.9.0

* Removed MemoryAscoltatore.
* Removed 'newTopic' event from every Ascoltatore.

## 0.8.0

* Made consistent behaviour for the wildcards
  (https://github.com/mcollina/ascoltatori/pull/62).
* Added EventEmitter2Ascoltatore
  (https://github.com/mcollina/ascoltatori/pull/61).

## 0.7.4

* Made ascoltatori.build return a TrieAscoltatore.

## 0.7.3

* Setted TrieAscoltatore as the default ascoltatore.

## 0.7.2

* README fixes.

## 0.7.1

* README fixes.

## 0.7.0

* Added the TrieAscolatore, thanks to 
  [@davedoesdev](https://github.com/davedoesdev).
* Using the TrieAscoltatore as the basis of all the other
  Ascoltatori.

## 0.6.0

* Removed the option object from #subscribe, thanks to
  [@davedoesdev](https://github.com/davedoesdev).

## 0.5.0

* Ascoltatore#publish and #subscribe accepts an option,
  just before the callbacks
  (https://github.com/mcollina/ascoltatori/pull/55), thanks to 
  [@davedoesdev](https://github.com/davedoesdev).

## 0.4.3

* Ascoltatori.build now accepts a custom `type`, so that it is
  pluggable with a new Ascoltatore
  (https://github.com/mcollina/ascoltatori/pull/52), thanks to
  [@davedoesdev](https://github.com/davedoesdev).

## 0.4.2

* Replaced mongoskin with mongodb.
* Stabilized MongoAscoltatore on node v0.10.

## 0.4.1

* Stabilized AMQP on node v0.10.

## 0.4.0

* Suppor for node v0.10.
* Added error handling for amqp (@unlucio).
* Updated MQTT.js to v0.2.6.
* Updated node-zeromq to v2.4.0.

## 0.3.5

* More docs for MongoAscoltatore.

## 0.3.4

* Bugfixes to MQTTAscoltatore.

## 0.3.3

* Fixed Mosca version at 0.2.0.
* Added MongoAscoltatore, thanks to [filnik](https://github.com/filnik).

## 0.3.2

* Fixed Mosca version at 0.2.0.

## 0.3.1

* Using QoS 1 for MQTTAscoltatore
  ([#36](https://github.com/mcollina/ascoltatori/issues/36)).
* Added peer discovery in ZeromqAscolatore
  ([#26](https://github.com/mcollina/ascoltatori/issues/26)).
* Fixed RedisAscoltatore to work without hiredis
  ([#42](https://github.com/mcollina/ascoltatori/issues/42)).
* Uses node-uuid for identifiers
  ([#27](https://github.com/mcollina/ascoltatori/issues/27)).

## 0.3.0

* Introduced a JSONAscoltatore;
* `ascoltatori.build` now wraps all ascoltatori using a JSONAscoltatore,
  pass `{ json: false }` to disable;
* Upgraded MQTT.js to version 0.2.0.

## 0.2.4

* Published inside the package the 'behaveLikeAnAscoltatore' test.

## 0.2.3

* Correctly handling `false` (#30).

## 0.2.2

* Not converting everything as JSON inside
  MQTTAscoltatore.

## 0.2.1

* Changed debug key schema to not use '-'.
* Doc polishing.

## 0.2.0

* Added ascoltatori.build method.
* Added debug support.
* Added dox comments to all files.
* Published docs using dox.
* Upgraded MQTT.js to version 0.1.8.
* Added PrefixAscoltatore.

## 0.1.0

* Initial release
