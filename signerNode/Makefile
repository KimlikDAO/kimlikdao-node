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

build/monolithicSignerNode.js: signerNode/monolithicSignerNode.js \
    edevlet/nko.d.js edevlet/nko.js edevlet/pdfjs.d.js edevlet/nkoParser.js \
    edevlet/nkoWorker.js edevlet/validation.js \
    edevlet/oauth2Worker.d.js edevlet/oauth2Worker.js \
    ipfs/ipfs.d.js ipfs/ipfs.js \
    meetgreet/yo.d.js meetgreet/yo.js \
    lib/api/oauth2.d.js \
    lib/cloudflare/types.d.js lib/cloudflare/moduleWorker.d.js \
    lib/crypto/sha3.js \
    lib/crypto/modular.js lib/crypto/secp256k1.js \
    lib/crypto/primes.js lib/crypto/wesolowski.js \
    lib/did/*.d.js lib/did/section.js lib/did/decryptedSections.js \
    lib/did/verifiableID.js \
    lib/ethereum/*.d.js lib/ethereum/evm.js lib/ethereum/unlockable.js \
    lib/node/error.d.js lib/node/error.js \
    lib/node/ipfs.d.js lib/node/ipfs.js lib/node/nvi.d.js \
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
                             --emit_use_strict \
                             --entry_point $< \
                             --js $(filter-out build/edevlet/pdfjs.js, $^) \
                             --js_output_file $@.tmp
	yarn uglifyjs $@.tmp -m -c toplevel,unsafe -o $@.tmp
	sed -i.bak 's/globalThis.MonolithicSignerNode=/export default/g' $@.tmp
	cat build/edevlet/pdfjs.js $@.tmp > $@
	wc $@
