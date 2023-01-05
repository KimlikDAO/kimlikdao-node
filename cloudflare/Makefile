build/cloudflare/index.js: cloudflare/index.js \
    index.js index.d.js \
    meetgreet/yo.js meetgreet/yo.d.js \
    ipfs/ipfs.js ipfs/ipfs.d.js \
    lib/cloudflare/types.js lib/cloudflare/moduleWorker.js \
    lib/node/ipfs.js \
    lib/util/çevir.js
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --emit_use_strict \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $^ \
                             --js_output_file $@
	yarn uglifyjs $@ -m -o $@
