include edevlet/test/Makefile

build/edevlet/nkoParser.js: edevlet/nkoParser.js edevlet/pdfjs.d.js \
    lib/did/*.d.js \
    lib/ethereum/*.d.js \
    lib/node/error.d.js lib/node/error.js \
    lib/node/nvi.d.js
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --jscomp_error=unusedLocalVariables \
                             --jscomp_error=strictCheckTypes \
                             --jscomp_warning=reportUnknownTypes \
                             --emit_use_strict \
                             --language_in ECMASCRIPT_NEXT \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $^ \
                             --js_output_file $@
	yarn uglifyjs $@ -m -o $@

build/edevlet/pdfjs.js: edevlet/pdfjs.js \
    edevlet/pdf.js/src/pdf.js \
    edevlet/pdf.js/src/shared/*.js edevlet/pdf.js/src/display/*.js \
    edevlet/pdf.js/src/core/*.js edevlet/pdf.js/src/core/xfa/*.js
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O SIMPLE \
                             --language_in ECMASCRIPT_NEXT \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $^ \
                             --js_output_file $@.tmp
	yarn uglifyjs $@.tmp -m -o $@.tmp
	printf "'use strict';(()=>{" | cat - $@.tmp > $@
	printf "})();" >> $@
