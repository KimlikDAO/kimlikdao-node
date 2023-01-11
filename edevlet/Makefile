include edevlet/test/Makefile

build/edevlet/nkoParser.js: edevlet/nkoParser.js edevlet/pdf.d.js \
    lib/did/section.d.js lib/did/TCKTVerisi.d.js \
    lib/ethereum/jsonrpc.js lib/ethereum/provider.js \
    lib/ethereum/ERC721Unlockable.js \
    lib/node/error.d.js lib/node/error.js \
    lib/node/nvi.d.js
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --emit_use_strict \
                             --language_in ECMASCRIPT_NEXT \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $^ \
                             --js_output_file $@
	yarn uglifyjs $@ -m -o $@

build/edevlet/pdfCompiled.js: edevlet/pdfCompiled.js \
    edevlet/pdf.js/src/pdf.js \
    edevlet/pdf.js/src/shared/*.js edevlet/pdf.js/src/display/*.js \
    edevlet/pdf.js/src/core/*.js edevlet/pdf.js/src/core/xfa/*.js
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O SIMPLE --charset UTF-8 \
                             --emit_use_strict \
                             --language_in ECMASCRIPT_NEXT \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $^ \
                             --js_output_file $@
