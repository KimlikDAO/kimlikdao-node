build/signerNode.js: signerNode/signerNode.js signerNode/signerNode.d.js \
    edevlet/nko.d.js edevlet/nko.js edevlet/validation.js \
    ipfs/ipfs.d.js ipfs/ipfs.js \
    meetgreet/yo.d.js meetgreet/yo.js \
    lib/cloudflare/types.d.js lib/cloudflare/moduleWorker.d.js \
    lib/crypto/sha3.js \
    lib/node/error.d.js lib/node/error.js \
    lib/node/ipfs.d.js lib/node/ipfs.js \
    lib/util/çevir.js
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --jscomp_error=unusedLocalVariables \
                             --jscomp_error=strictCheckTypes \
                             --language_in ECMASCRIPT_NEXT \
                             --module_resolution NODE \
                             --dependency_mode PRUNE \
                             --assume_function_wrapper \
                             --emit_use_strict \
                             --entry_point $< \
                             --js $^ \
                             --js_output_file $@
	yarn uglifyjs $@ -m -c toplevel,unsafe -o $@
	sed -i.bak 's/globalThis.SignerNodeWorker=/export default /g' $@
	wc $@
