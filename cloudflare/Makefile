build/cloudflare/fullnode.js: cloudflare/fullnode.js \
    index.js index.d.js \
    edevlet/oauth2.js edevlet/validation.js \
    edevlet/nko.js edevlet/nkoParser.js edevlet/pdfjs.d.js \
    meetgreet/yo.d.js meetgreet/yo.js \
    ipfs.js \
    lib/api/oauth2.d.js \
    lib/cloudflare/types.d.js lib/cloudflare/moduleWorker.d.js \
    lib/crypto/sha3.js lib/crypto/wesolowski.js \
    lib/crypto/modular.js lib/crypto/secp256k1.js \
    lib/did/*.d.js \
    lib/did/section.js lib/did/verifiableID.js \
    lib/ethereum/*.js \
    lib/node/error.d.js lib/node/error.js \
    lib/node/nvi.d.js \
    lib/node/ipfs.d.js lib/node/ipfs.js \
    lib/util/çevir.js \
    build/edevlet/pdfjs.js
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --jscomp_error=unusedLocalVariables \
                             --jscomp_error=strictCheckTypes \
                             --language_in ECMASCRIPT_NEXT \
                             --module_resolution NODE \
                             --dependency_mode PRUNE \
                             --assume_function_wrapper \
                             --entry_point $< \
                             --js $(filter-out build/edevlet/pdfjs.js, $^) \
                             --js_output_file $@.tmp
	yarn uglifyjs $@.tmp -m -o $@.tmp
	sed -i.bak 's/globalThis.Worker=/export default/g' $@.tmp
	cat build/edevlet/pdfjs.js $@.tmp > $@

build/cloudflare/lightnode.js: cloudflare/lightnode.js \
    index.d.js \
    ipfs.js \
    lib/cloudflare/types.d.js lib/cloudflare/moduleWorker.d.js \
    lib/node/error.d.js lib/node/error.js \
    lib/node/ipfs.d.js lib/node/ipfs.js \
    lib/util/çevir.js
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
	sed -i.bak 's/globalThis.Worker=/export default/g' $@
