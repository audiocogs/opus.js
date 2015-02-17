#!/bin/sh

# configure libopus
cd libopus
if [ ! -f configure ]; then
  # generate and run configuration script
  ./autogen.sh
  emconfigure ./configure --prefix="`pwd`" --enable-fixed-point
fi

# compile libopus
emmake make
emmake make install

# generate JS
cd ..
mkdir -p build
emcc -O3 -s EXPORTED_FUNCTIONS="['_opus_decoder_create', '_opus_decode_float', '_opus_decoder_destroy']" -Llibopus/lib -lopus -o build/libopus.js
# emcc does not exit with error status if the above fails, so test for output file instead
if [ -f "build/libopus.js" ]; then
	echo "module.exports = Module" >> build/libopus.js
fi
