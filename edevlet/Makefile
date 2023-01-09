build/edevlet/pdfParser.js: edevlet/pdfParser.js edevlet/pdfParser.d.js \
    pdf.js/src/pdf.js \
    pdf.js/src/shared/*.js pdf.js/src/display/*.js \
    pdf.js/src/core/*.js pdf.js/src/core/xfa/*.js
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
