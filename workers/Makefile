build/exposureReportWorker.js: workers/exposureReportWorker.js \
    workers/exposureReportWorker.d.js \
    lib/cloudflare/types.d.js lib/cloudflare/moduleWorker.d.js \
    lib/crypto/modular.js lib/crypto/primes.js lib/crypto/wesolowski.js \
    lib/crypto/sha3.js \
    lib/did/verifiableID.d.js lib/did/verifiableID.js lib/did/section.d.js \
    lib/util/çevir.js \
    build/BEARER_TOKEN
	bun google-closure-compiler $(call gccModule, $(filter %.js, $^), $@) \
                             --define "BEARER_TOKEN\$$\$$module\$$workers\$$exposureReportWorker=$(shell cat build/BEARER_TOKEN)" \
                             --jscomp_error=unusedLocalVariables \
                             --jscomp_error=strictCheckTypes \
                             --jscomp_error=checkTypes
	bun uglifyjs $@ -m -c toplevel,unsafe,drop_console -o $@
	sed -i.bak 's/globalThis.ExposureReportWorker=/export default/g' $@
	wc $@

build/humanIDWorker.js: workers/humanIDWorker.js \
    workers/humanIDWorker.d.js \
    lib/cloudflare/types.d.js lib/cloudflare/moduleWorker.d.js \
    lib/crypto/modular.js lib/crypto/primes.js lib/crypto/wesolowski.js \
    lib/crypto/sha3.js \
    lib/did/verifiableID.d.js lib/did/verifiableID.js lib/did/section.d.js \
    lib/util/çevir.js \
    build/BEARER_TOKEN
	bun google-closure-compiler $(call gccModule, $(filter %.js, $^), $@) \
                             --define "BEARER_TOKEN\$$\$$module\$$workers\$$humanIDWorker=$(shell cat build/BEARER_TOKEN)" \
                             --jscomp_error=unusedLocalVariables \
                             --jscomp_error=strictCheckTypes \
                             --jscomp_error=checkTypes
	bun uglifyjs $@ -m -c toplevel,unsafe,drop_console -o $@
	sed -i.bak 's/globalThis.HumanIDWorker=/export default/g' $@
	wc $@

build/exposureReportWorker.deployment: build/exposureReportWorker.js \
    workers/wrangler.toml \
    signerNode/signerNode.config
	bun wrangler deploy $< --name $(WORKER_NAME)-exposurereport-worker \
        --compatibility-date $(shell date -v -1d +%Y-%m-%d) \
        --config workers/wrangler.toml
	touch $@

build/humanIDWorker.deployment: build/humanIDWorker.js \
    workers/wrangler.toml \
    signerNode/signerNode.config
	bun wrangler deploy $< --name $(WORKER_NAME)-humanid-worker \
        --compatibility-date $(shell date -v -1d +%Y-%m-%d) \
        --config workers/wrangler.toml
	touch $@
