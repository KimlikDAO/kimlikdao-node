include signerNode/signerNode.config

WORKER_NAME = $(subst $\",,$(CF_WORKER_NAME))

lib = node_modules/@kimlikdao/lib

include lib/util/Makefile
include edevlet/Makefile
include lightNode/Makefile
include signerNode/Makefile
include workers/Makefile
include mina/Makefile

build/BEARER_TOKEN:
	mkdir -p $(dir $@)
	xxd -u -l 16 -p /dev/urandom > $@

.PHONY: clean
clean:
	rm -rf build
