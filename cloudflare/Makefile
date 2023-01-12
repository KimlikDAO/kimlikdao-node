build/cloudflare/fullnode.js: cloudflare/fullnode.js \
    index.js index.d.js \
    edevlet/oauth2.js edevlet/validation.js \
    edevlet/nko.js edevlet/nkoParser.js edevlet/pdf.d.js \
    meetgreet/yo.d.js meetgreet/yo.js \
    ipfs/ipfs.d.js ipfs/ipfs.js \
    lib/api/oauth2.d.js \
    lib/cloudflare/types.js lib/cloudflare/moduleWorker.js \
    lib/crypto/sha3.js \
    lib/crypto/modular.js lib/crypto/secp256k1.js \
    lib/did/exposureReport.d.js lib/did/exposureReport.js \
    lib/did/humanID.d.js lib/did/humanID.js \
    lib/did/section.d.js lib/did/section.js \
    lib/did/TCKTVerisi.d.js \
    lib/ethereum/jsonrpc.js lib/ethereum/provider.js \
    lib/ethereum/evm.js lib/ethereum/unlockables.js \
    lib/ethereum/ERC721Unlockable.js \
    lib/node/error.d.js lib/node/error.js \
    lib/node/nvi.d.js \
    lib/node/ipfs.js \
    lib/util/çevir.js \
    build/edevlet/pdfCompiled.js
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --emit_use_strict \
                             --language_in ECMASCRIPT_NEXT \
                             --module_resolution NODE \
                             --dependency_mode PRUNE \
                             --assume_function_wrapper \
                             --entry_point $< \
                             --js $(filter-out build/edevlet/pdfCompiled.js, $^) \
                             --js_output_file $@.tmp
	yarn uglifyjs $@.tmp -m -o $@.tmp
	sed -i.bak 's/globalThis.Worker=/export default/g' $@.tmp
	cat build/edevlet/pdfCompiled.js $@.tmp > $@

build/cloudflare/lightnode.js: cloudflare/lightnode.js \
    index.d.js \
    ipfs/ipfs.d.js ipfs/ipfs.js \
    lib/cloudflare/types.js lib/cloudflare/moduleWorker.js \
    lib/node/error.d.js lib/node/error.js \
    lib/node/ipfs.js \
    lib/util/çevir.js
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
	sed -i.bak 's/globalThis.Worker=/export default/g' $@
