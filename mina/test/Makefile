build/mina/test/MerkleTree.compiled-test.js: mina/test/MerkleTree.compiled-test.js \
    mina/MerkleTree.js \
    $(lib)/mina/mina.d.js \
    $(lib)/crypto/poseidon.js \
    $(lib)/crypto/modular.js \
    $(lib)/cloudflare/durableObject.d.js \
    $(lib)/cloudflare/mock/durableObject.js \
    $(lib)/cloudflare/types.d.js \
    $(lib)/mina/merkleTree.js $(lib)/mina/mina.d.js \
    $(lib)/testing/assert.js $(lib)/testing/nodejs.d.js \
    $(lib)/util/hex.js $(lib)/util/merkleTree.js
	mkdir -p $(dir $@) build/input/mina build/input/node_modules/@kimlikdao
	cp -rf mina/* build/input/mina
	ln -sfn ../../../../$(lib) build/input/node_modules/@kimlikdao/lib
	sed -i.bak 's#cloudflare:workers#@kimlikdao/lib/cloudflare/mock/durableObject#' build/input/mina/MerkleTree.js
	cd build/input; bun google-closure-compiler $(call gccModule, $^, ../../$@) \
	                         --jscomp_error=checkTypes \
	                         --jscomp_error=strictCheckTypes \
	                         --jscomp_error=unusedLocalVariables
	bun uglifyjs $@ -m -c toplevel,unsafe -o $@
	bun $(lib)/birimler/bigintCompressor.js $@
	wc $@

mina.test.bun: build/mina/test/MerkleTree.compiled-test.js
	bun $<

mina.test: mina.test.bun
