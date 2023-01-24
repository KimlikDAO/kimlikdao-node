build/edevlet/test/nkoParser.compiled-test.js: edevlet/test/nkoParser.compiled-test.js \
    edevlet/nkoParser.js \
    edevlet/pdfjs.d.js \
    lib/did/*.d.js \
    lib/ethereum/*.d.js \
    lib/node/error.js lib/node/error.d.js lib/node/nvi.d.js \
    lib/testing/fsPromises.d.js lib/testing/fsPromises.js \
    build/edevlet/pdfjs.js
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --jscomp_error=unusedLocalVariables \
                             --jscomp_error=strictCheckTypes \
                             --emit_use_strict \
                             --module_resolution NODE \
                             --dependency_mode PRUNE \
                             --assume_function_wrapper \
                             --entry_point $< \
                             --js $(filter-out build/edevlet/pdfjs.js, $^) \
                             --js_output_file $@.tmp
	yarn uglifyjs lib/testing/fsPromises.js $@.tmp -m -c toplevel,unsafe -o $@.tmp
	cat build/edevlet/pdfjs.js $@.tmp > $@
	node $@
