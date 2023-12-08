include edevlet/test/Makefile

build/edevlet/nkoParser.js: edevlet/nkoParser.js edevlet/pdfjs.d.js \
    lib/crosschain/*.d.js \
    lib/did/*.d.js \
    lib/ethereum/*.d.js \
    lib/node/error.d.js lib/node/error.js \
    lib/node/nvi.d.js
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --jscomp_error=unusedLocalVariables \
                             --jscomp_error=strictCheckTypes \
                             --jscomp_warning=reportUnknownTypes \
                             --emit_use_strict \
                             --language_in ECMASCRIPT_NEXT \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $^ \
                             --js_output_file $@
	yarn uglifyjs $@ -m -c toplevel,unsafe,drop_console -o $@
	wc $@

build/edevlet/pdfjs.js: edevlet/pdfjs.js \
    edevlet/pdf.js/src/pdf.js \
    edevlet/pdf.js/src/shared/*.js edevlet/pdf.js/src/display/*.js \
    edevlet/pdf.js/src/core/*.js edevlet/pdf.js/src/core/xfa/*.js
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O SIMPLE \
                             --language_in ECMASCRIPT_NEXT \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $^ \
                             --js_output_file $@.tmp
	yarn uglifyjs $@.tmp -m -c toplevel,unsafe,drop_console -o $@.tmp
	printf "'use strict';(()=>{" | cat - $@.tmp > $@
	printf "})();" >> $@
	wc $@

build/oauth2Worker.js: edevlet/oauth2Worker.js edevlet/oauth2Worker.d.js \
    edevlet/validation.js \
    lib/api/oauth2.d.js \
    lib/cloudflare/types.d.js lib/cloudflare/moduleWorker.d.js \
    lib/crosschain/*.js \
    lib/crypto/sha3.js \
    lib/crypto/modular.js lib/crypto/secp256k1.js \
    lib/did/*.d.js lib/did/section.js lib/did/decryptedSections.js \
    lib/ethereum/*.d.js lib/ethereum/evm.js \
    lib/node/error.d.js lib/node/error.js lib/node/nvi.d.js \
    lib/util/çevir.js \
    build/BEARER_TOKEN
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --define "BEARER_TOKEN\$$\$$module\$$edevlet\$$oauth2Worker=$(shell cat build/BEARER_TOKEN)" \
                             --define "CF_ACCOUNT_NAME\$$\$$module\$$edevlet\$$oauth2Worker=$(CF_ACCOUNT_NAME)" \
                             --define "WORKER_NAME\$$\$$module\$$edevlet\$$oauth2Worker=$(WORKER_NAME)" \
                             --jscomp_error=unusedLocalVariables \
                             --jscomp_error=strictCheckTypes \
                             --language_in ECMASCRIPT_NEXT \
                             --module_resolution NODE \
                             --dependency_mode PRUNE \
                             --assume_function_wrapper \
                             --entry_point $< \
                             --js $(filter %.js, $^) \
                             --js_output_file $@
	yarn uglifyjs $@ -m -c toplevel,unsafe,drop_console -o $@
	sed -i.bak 's/globalThis.OAuth2Worker=/export default/g' $@
	wc $@

build/nkoWorker.js: edevlet/nkoWorker.js \
    edevlet/nko.d.js edevlet/nko.js edevlet/validation.js \
    edevlet/nkoParser.js edevlet/pdfjs.d.js \
    lib/cloudflare/types.d.js lib/cloudflare/moduleWorker.d.js \
    lib/crosschain/*.js \
    lib/crypto/sha3.js \
    lib/crypto/modular.js lib/crypto/secp256k1.js \
    lib/did/*.d.js lib/did/section.js lib/did/decryptedSections.js \
    lib/ethereum/*.d.js lib/ethereum/evm.js \
    lib/node/error.d.js lib/node/error.js lib/node/nvi.d.js \
    lib/util/çevir.js \
    build/edevlet/pdfjs.js \
    build/BEARER_TOKEN
	mkdir -p $(dir $@)
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --define "BEARER_TOKEN\$$\$$module\$$edevlet\$$nkoWorker=$(shell cat build/BEARER_TOKEN)" \
                             --define "CF_ACCOUNT_NAME\$$\$$module\$$edevlet\$$nkoWorker=$(CF_ACCOUNT_NAME)" \
                             --define "WORKER_NAME\$$\$$module\$$edevlet\$$nkoWorker=$(WORKER_NAME)" \
                             --jscomp_error=unusedLocalVariables \
                             --jscomp_error=strictCheckTypes \
                             --language_in ECMASCRIPT_NEXT \
                             --module_resolution NODE \
                             --dependency_mode PRUNE \
                             --assume_function_wrapper \
                             --entry_point $< \
                             --js $(filter-out build/edevlet/pdfjs.js, $(filter %.js, $^)) \
                             --js_output_file $@.tmp
	yarn uglifyjs $@.tmp -m -c toplevel,unsafe,drop_console -o $@.tmp
	sed -i.bak 's/globalThis.NkoWorker=/export default/g' $@.tmp
	cat build/edevlet/pdfjs.js $@.tmp > $@
	wc $@

build/nkoWorker.deployment: build/nkoWorker.js edevlet/nkoWorker.toml \
    signerNode/signerNode.config \
    build/exposureReportWorker.deployment \
    build/humanIDWorker.deployment
	yarn wrangler deploy $< --name $(WORKER_NAME)-nko-worker \
        --compatibility-date $(shell date -v -1d +%Y-%m-%d) \
        --config edevlet/nkoWorker.toml
	touch $@

build/oauth2Worker.deployment: build/oauth2Worker.js edevlet/nkoWorker.toml \
    signerNode/signerNode.config \
    build/exposureReportWorker.deployment \
    build/humanIDWorker.deployment
	yarn wrangler deploy $< --name $(WORKER_NAME)-oauth2-worker \
        --compatibility-date $(shell date -v -1d +%Y-%m-%d) \
        --config edevlet/oauth2Worker.toml
	touch $@
