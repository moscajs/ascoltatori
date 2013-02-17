test:
	./node_modules/.bin/mocha --recursive test

ci:
	./node_modules/.bin/mocha --recursive --watch test

bench-clean:
	rm -rf ./benchmarks/results

bench-setup: bench-clean
	mkdir -p ./benchmarks/results

RUNS=1000
bench-1: bench-setup
	node ./benchmarks/multi_listeners.js -c MemoryAscoltatore -r $(RUNS) -l 1 -d >> ./benchmarks/results/multi_listeners
	node ./benchmarks/multi_listeners.js -c RedisAscoltatore -r $(RUNS) -l 1 >> ./benchmarks/results/multi_listeners
	node ./benchmarks/multi_listeners.js -c ZeromqAscoltatore -r $(RUNS) -l 1 >> ./benchmarks/results/multi_listeners
	node ./benchmarks/multi_listeners.js -c RabbitAscoltatore -r $(RUNS) -l 1 >> ./benchmarks/results/multi_listeners
	node ./benchmarks/multi_listeners.js -c MQTTAscoltatore -r $(RUNS) -l 1 >> ./benchmarks/results/multi_listeners

bench-10: bench-setup
	node ./benchmarks/multi_listeners.js -c MemoryAscoltatore -r $(RUNS) -l 10 >> ./benchmarks/results/multi_listeners
	node ./benchmarks/multi_listeners.js -c RedisAscoltatore -r $(RUNS) -l 10 >> ./benchmarks/results/multi_listeners
	node ./benchmarks/multi_listeners.js -c ZeromqAscoltatore -r $(RUNS) -l 10 >> ./benchmarks/results/multi_listeners
	node ./benchmarks/multi_listeners.js -c RabbitAscoltatore -r $(RUNS) -l 10 >> ./benchmarks/results/multi_listeners
	node ./benchmarks/multi_listeners.js -c MQTTAscoltatore -r $(RUNS) -l 10 >> ./benchmarks/results/multi_listeners

bench-100: bench-setup
	node ./benchmarks/multi_listeners.js -c MemoryAscoltatore -r $(RUNS) -l 100 >> ./benchmarks/results/multi_listeners
	node ./benchmarks/multi_listeners.js -c RedisAscoltatore -r $(RUNS) -l 100 >> ./benchmarks/results/multi_listeners
	node ./benchmarks/multi_listeners.js -c ZeromqAscoltatore -r $(RUNS) -l 100 >> ./benchmarks/results/multi_listeners
	node ./benchmarks/multi_listeners.js -c RabbitAscoltatore -r $(RUNS) -l 100 >> ./benchmarks/results/multi_listeners
	node ./benchmarks/multi_listeners.js -c MQTTAscoltatore -r $(RUNS) -l 100 >> ./benchmarks/results/multi_listeners

bench-$(RUNS): bench-setup
	node ./benchmarks/multi_listeners.js -c MemoryAscoltatore -r $(RUNS) -l 1000 >> ./benchmarks/results/multi_listeners
	node ./benchmarks/multi_listeners.js -c RedisAscoltatore -r $(RUNS) -l 1000 >> ./benchmarks/results/multi_listeners
	node ./benchmarks/multi_listeners.js -c ZeromqAscoltatore -r $(RUNS) -l 1000 >> ./benchmarks/results/multi_listeners
	node ./benchmarks/multi_listeners.js -c RabbitAscoltatore -r $(RUNS) -l 1000 >> ./benchmarks/results/multi_listeners
	node ./benchmarks/multi_listeners.js -c MQTTAscoltatore -r $(RUNS) -l 1000 >> ./benchmarks/results/multi_listeners

bench: bench-clean bench-1 bench-10 bench-100 bench-1000

docs-clean:
	rm -rf docs

docs: docs-clean
	./node_modules/.bin/dox-foundation --source lib --target docs --title Ascoltatori

publish-docs: docs
	git stash	
	cp -R docs /tmp/ascolatori-docs
	git checkout gh-pages
	git pull origin gh-pages
	cp -R /tmp/ascolatori-docs docs
	git add docs
	git commit -m "Updated docs"
	git push origin
	git checkout master
	git stash apply

.PHONY: test
