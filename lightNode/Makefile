build/lightNode.js: lightNode/lightNode.js lightNode/lightNode.d.js \
    ipfs/ipfs.d.js ipfs/ipfs.js \
    lib/cloudflare/types.d.js lib/cloudflare/moduleWorker.d.js \
    lib/node/error.d.js lib/node/error.js \
    lib/node/ipfs.d.js lib/node/ipfs.js \
    lib/util/çevir.js
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --jscomp_error=unusedLocalVariables \
                             --jscomp_error=strictCheckTypes \
                             --jscomp_error=checkTypes \
                             --jscomp_warning=reportUnknownTypes \
                             --emit_use_strict \
                             --language_in ECMASCRIPT_NEXT \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $^ \
                             --js_output_file $@
	yarn uglifyjs $@ -m -c toplevel,unsafe -o $@
	sed -i.bak 's/globalThis.LightNodeWorker=/export default/g' $@
	wc $@
