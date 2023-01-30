include edevlet/Makefile
include lightNode/Makefile
include signerNode/Makefile
include workers/Makefile

.PHONY: clean
clean:
	rm -rf build
