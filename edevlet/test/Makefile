build/edevlet/test/nkoParser.compiled-test.js: edevlet/test/nkoParser.compiled-test.js \
    edevlet/nkoParser.js \
    edevlet/pdfjs.d.js \
    $(lib)/crosschain/*.js \
    $(lib)/did/*.d.js \
    $(lib)/ethereum/*.d.js \
    $(lib)/node/error.js $(lib)/node/error.d.js $(lib)/node/nvi.d.js \
    $(lib)/testing/fsPromises.d.js $(lib)/testing/fsPromises.js \
    build/edevlet/pdfjs.js
	mkdir -p $(dir $@)
	bun google-closure-compiler $(call gccModule, $(filter-out build/edevlet/pdfjs.js, $^), $@.tmp) \
                             --jscomp_error=unusedLocalVariables \
                             --jscomp_error=strictCheckTypes
	bun uglifyjs $(lib)/testing/fsPromises.js $@.tmp -m -c toplevel,unsafe -o $@.tmp
	cat build/edevlet/pdfjs.js $@.tmp > $@
	bun $@
	wc $@
