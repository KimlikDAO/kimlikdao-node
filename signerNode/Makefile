build/signerNode.js: signerNode/signerNode.js signerNode/signerNode.d.js \
    edevlet/nko.d.js edevlet/nko.js edevlet/validation.js \
    ipfs/ipfs.d.js ipfs/ipfs.js \
    meetgreet/yo.d.js meetgreet/yo.js \
    $(lib)/cloudflare/types.d.js $(lib)/cloudflare/moduleWorker.d.js \
    $(lib)/crypto/sha3.js \
    $(lib)/node/error.d.js $(lib)/node/error.js \
    $(lib)/node/ipfs.d.js $(lib)/node/ipfs.js \
    $(lib)/util/çevir.js $(lib)/util/base58.js
	mkdir -p $(dir $@)
	bun google-closure-compiler $(call gccModule, $^, $@) \
                            --define "NODE_URL\$$\$$module\$$signerNode\$$signerNode=$(NODE_URL)" \
                            --jscomp_error=unusedLocalVariables \
                            --jscomp_error=strictCheckTypes
	bun uglifyjs $@ -m -c toplevel,unsafe,drop_console -o $@
	sed -i.bak 's/globalThis.SignerNodeWorker=/export default/g' $@
	wc $@

build/signerNode.toml: signerNode/signerNode.toml signerNode/signerNode.config
	mkdir -p $(dir $@)
	sed -e "s/kimlikdao-node/$(WORKER_NAME)/g" \
        -e "s/node.kimlikdao.org/$(NODE_URL)/g" \
        -e 's/"52b51a1db0ce4508a144633d407dab93"/$(CF_KV_NAMESPACE_ID)/g' \
        $< > $@
	cat $@

build/signerNode.deployment: build/signerNode.js build/signerNode.toml \
    build/nkoWorker.deployment \
    build/oauth2Worker.deployment
	bun wrangler deploy $< --name $(WORKER_NAME) \
        --compatibility-date $(shell date -v -1d +%Y-%m-%d) \
        --config build/signerNode.toml
	touch $@
