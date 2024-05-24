include mina/test/Makefile

build/mina/mina.js: mina/mina.js mina/mina.d.js \
    mina/MerkleTree.js \
    $(lib)/cloudflare/moduleWorker.d.js \
    $(lib)/cloudflare/durableObject.d.js \
    $(lib)/cloudflare/types.d.js \
    $(lib)/crypto/poseidon.js \
    $(lib)/crypto/modular.js \
    $(lib)/mina/mina.d.js \
    $(lib)/util/hex.js
	mkdir -p $(dir $@)
	mkdir -p build/input/mina && cp -rf mina/* build/input/mina/
	mkdir -p build/input/node_modules/@kimlikdao
	ln -sfn ../../../../$(lib) build/input/node_modules/@kimlikdao/lib
	sed -i.bak '/cloudflare:workers/d' build/input/mina/MerkleTree.js
	echo 'globalThis["MinaWorker"] = MinaWorker;\nglobalThis["MerkleTree"] = MerkleTree;' >> build/input/mina/mina.js
	cd build/input; bun google-closure-compiler $(GCC_MODULE) \
	                        --jscomp_error=checkTypes \
	                        --jscomp_error=strictCheckTypes \
	                        --jscomp_error=unusedLocalVariables \
	                        --jscomp_error=reportUnknownTypes \
	                        --entry_point $< \
	                        --js $^ \
	                        --js_output_file ../../$@
	rm -rf build/input/
	bun uglifyjs $@ -m -c toplevel,unsafe,drop_console -o $@
	bun $(lib)/birimler/bigintCompressor.js $@
	wc $@

build/mina.deployment: build/mina/mina.js mina/prod.toml
	bun wrangler deploy $< --compatibility-date $(shell date -v -1d +%Y-%m-%d) \
	    --config mina/prod.toml
