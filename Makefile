build/libopus.js:
	./compileOpus.sh
	
libopus: build/libopus.js
		
browser: src/*.js libopus
	mkdir -p build/
	./node_modules/.bin/browserify \
		--global-transform browserify-shim \
		--bare \
		--no-detect-globals \
		. \
		> build/opus.js
		
clean:
	cd libopus && make clean
	rm -f libopus/configure
	rm -rf build

.PHONY: libopus clean browser
