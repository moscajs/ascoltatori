
History
=======

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
