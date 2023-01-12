build/edevlet/test/nkoParser.compiled-test.js: edevlet/test/nkoParser.compiled-test.js \
    edevlet/nkoParser.js \
    edevlet/pdf.d.js \
    lib/did/exposureReport.d.js \
    lib/did/section.d.js lib/did/TCKTVerisi.d.js \
    lib/ethereum/jsonrpc.js lib/ethereum/provider.js \
    lib/ethereum/ERC721Unlockable.js \
    lib/node/error.js lib/node/error.d.js lib/node/nvi.d.js \
    lib/testing/fsPromises.d.js lib/testing/fsPromises.js \
    build/edevlet/pdfCompiled.js
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --emit_use_strict \
                             --module_resolution NODE \
                             --dependency_mode PRUNE \
                             --assume_function_wrapper \
                             --entry_point $< \
                             --js $(filter-out build/edevlet/pdfCompiled.js, $^) \
                             --js_output_file $@.tmp
	yarn uglifyjs lib/testing/fsPromises.js $@.tmp -m -o $@.tmp
	cat build/edevlet/pdfCompiled.js $@.tmp > $@
	node $@
