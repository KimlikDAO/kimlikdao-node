.PHONY: build/edevlet/nkoParser.test.js
build/edevlet/nkoParser.test.js: edevlet/test/nkoParser.test.js \
    edevlet/test/mockNkoParser.js \
    edevlet/nkoParser.d.js
	mkdir -p $(dir $@)
	cat edevlet/nkoParser.d.js edevlet/test/mockNkoParser.js $< > $@
	node $@
