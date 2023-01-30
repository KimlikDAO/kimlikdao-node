build/exposureReportWorker.js: workers/exposureReportWorker.js \
    workers/exposureReportWorker.d.js \
    lib/cloudflare/types.d.js lib/cloudflare/moduleWorker.d.js \
    lib/crypto/modular.js lib/crypto/primes.js lib/crypto/wesolowski.js \
    lib/crypto/sha3.js \
    lib/did/verifiableID.d.js lib/did/verifiableID.js lib/did/section.d.js \
    lib/util/çevir.js
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --jscomp_error=unusedLocalVariables \
                             --jscomp_error=strictCheckTypes \
                             --jscomp_error=checkTypes \
                             --emit_use_strict \
                             --language_in ECMASCRIPT_NEXT \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $^ \
                             --js_output_file $@
	yarn uglifyjs $@ -m -c toplevel,unsafe -o $@
	sed -i.bak 's/globalThis.ExposureReportWorker=/export default/g' $@
	wc $@

build/humanIDWorker.js: workers/humanIDWorker.js \
    workers/humanIDWorker.d.js \
    lib/cloudflare/types.d.js lib/cloudflare/moduleWorker.d.js \
    lib/crypto/modular.js lib/crypto/primes.js lib/crypto/wesolowski.js \
    lib/crypto/sha3.js \
    lib/did/verifiableID.d.js lib/did/verifiableID.js lib/did/section.d.js \
    lib/util/çevir.js
	yarn google-closure-compiler -W VERBOSE -O ADVANCED --charset UTF-8 \
                             --jscomp_error=unusedLocalVariables \
                             --jscomp_error=strictCheckTypes \
                             --jscomp_error=checkTypes \
                             --emit_use_strict \
                             --language_in ECMASCRIPT_NEXT \
                             --module_resolution NODE \
                             --assume_function_wrapper \
                             --dependency_mode PRUNE \
                             --entry_point $< \
                             --js $^ \
                             --js_output_file $@
	yarn uglifyjs $@ -m -c toplevel,unsafe -o $@
	sed -i.bak 's/globalThis.HumanIDWorker=/export default/g' $@
	wc $@
