
bench-clean:
	rm -rf ./results

bench-setup: bench-clean
	mkdir -p ./results

BENCH_ARGS="-r 100"
bench-1: bench-setup
	node ./multi_listeners.js -c TrieAscoltatore $(BENCH_ARGS) -l 1 -d >> ./results/multi_listeners
	node ./multi_listeners.js -c EventEmitter2Ascoltatore $(BENCH_ARGS) -l 1 >> ./results/multi_listeners
	node ./multi_listeners.js -c RedisAscoltatore $(BENCH_ARGS) -l 1 >> ./results/multi_listeners
	node ./multi_listeners.js -c ZeromqAscoltatore $(BENCH_ARGS) -l 1 >> ./results/multi_listeners
	node ./multi_listeners.js -c AMQPAscoltatore $(BENCH_ARGS) -l 1 >> ./results/multi_listeners
	node ./multi_listeners.js -c MQTTAscoltatore $(BENCH_ARGS) -l 1 >> ./results/multi_listeners

bench-10: bench-setup
	node ./multi_listeners.js -c TrieAscoltatore $(BENCH_ARGS) -l 10 >> ./results/multi_listeners
	node ./multi_listeners.js -c EventEmitter2Ascoltatore $(BENCH_ARGS) -l 10 >> ./results/multi_listeners
	node ./multi_listeners.js -c RedisAscoltatore $(BENCH_ARGS) -l 10 >> ./results/multi_listeners
	node ./multi_listeners.js -c ZeromqAscoltatore $(BENCH_ARGS) -l 10 >> ./results/multi_listeners
	node ./multi_listeners.js -c AMQPAscoltatore $(BENCH_ARGS) -l 10 >> ./results/multi_listeners
	node ./multi_listeners.js -c MQTTAscoltatore $(BENCH_ARGS) -l 10 >> ./results/multi_listeners

bench-100: bench-setup
	node ./multi_listeners.js -c TrieAscoltatore $(BENCH_ARGS) -l 100 >> ./results/multi_listeners
	node ./multi_listeners.js -c EventEmitter2Ascoltatore $(BENCH_ARGS) -l 100 >> ./results/multi_listeners
	node ./multi_listeners.js -c RedisAscoltatore $(BENCH_ARGS) -l 100 >> ./results/multi_listeners
	node ./multi_listeners.js -c ZeromqAscoltatore $(BENCH_ARGS) -l 100 >> ./results/multi_listeners
	node ./multi_listeners.js -c AMQPAscoltatore $(BENCH_ARGS) -l 100 >> ./results/multi_listeners
	node ./multi_listeners.js -c MQTTAscoltatore $(BENCH_ARGS) -l 100 >> ./results/multi_listeners

bench-1000: bench-setup
	node ./multi_listeners.js -c TrieAscoltatore $(BENCH_ARGS) -l 1000 >> ./results/multi_listeners
	node ./multi_listeners.js -c EventEmitter2Ascoltatore $(BENCH_ARGS) -l 1000 >> ./results/multi_listeners
	node ./multi_listeners.js -c RedisAscoltatore $(BENCH_ARGS) -l 1000 >> ./results/multi_listeners
	node ./multi_listeners.js -c ZeromqAscoltatore $(BENCH_ARGS) -l 1000 >> ./results/multi_listeners
	node ./multi_listeners.js -c AMQPAscoltatore $(BENCH_ARGS) -l 1000 >> ./results/multi_listeners
	node ./multi_listeners.js -c MQTTAscoltatore $(BENCH_ARGS) -l 1000 >> ./results/multi_listeners

bench: bench-clean bench-1 bench-10 bench-100 bench-1000

.PHONY: bench
