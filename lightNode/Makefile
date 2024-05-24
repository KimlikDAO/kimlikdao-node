build/lightNode.js: lightNode/lightNode.js lightNode/lightNode.d.js \
    ipfs/ipfs.d.js ipfs/ipfs.js \
    $(lib)/cloudflare/types.d.js $(lib)/cloudflare/moduleWorker.d.js \
    $(lib)/node/error.d.js $(lib)/node/error.js \
    $(lib)/node/ipfs.d.js $(lib)/node/ipfs.js \
    $(lib)/util/çevir.js $(lib)/util/base58.js
	mkdir -p $(dir $@)
	bun google-closure-compiler $(call gccModule, $^, $@) \
                             --jscomp_error=unusedLocalVariables \
                             --jscomp_error=strictCheckTypes \
                             --jscomp_error=checkTypes \
                             --jscomp_warning=reportUnknownTypes
	bun uglifyjs $@ -m -c toplevel,unsafe -o $@
	sed -i.bak 's/globalThis.LightNodeWorker=/export default/g' $@
	wc $@

build/lightNode.deployment: build/lightNode.js
	bun wrangler deploy $< \
        --compatibility-date $(shell date -v -1d +%Y-%m-%d) \
        --config lightNode/lightNode.toml
	touch $@
