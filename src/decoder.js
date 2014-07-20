var AV = require('av');
var opus = require('../build/libopus');

var OpusDecoder = AV.Decoder.extend(function() {
  AV.Decoder.register('opus', this);
  
  this.prototype.init = function() {
    this.buflen = 4096;
    this.buf = opus._malloc(this.buflen);
    
    this.outlen = 4096;
    this.outbuf = opus._malloc(this.outlen * this.format.channelsPerFrame * 4);
    this.f32 = this.outbuf >> 2;
    
    this.opus = opus._opus_decoder_create(this.format.sampleRate, this.format.channelsPerFrame, this.buf);
  };
  
  this.prototype.readChunk = function() {
    if (!this.stream.available(1))
      throw new AV.UnderflowError();
    
    var list = this.stream.list;
    var packet = list.first;
    list.advance();
    
    if (this.buflen < packet.length) {
      this.buf = opus._realloc(this.buf, packet.length);
      this.buflen = packet.length;
    }
    
    opus.HEAPU8.set(packet.data, this.buf);
    
    var len = opus._opus_decode_float(this.opus, this.buf, packet.length, this.outbuf, this.outlen, 0);
    if (len < 0)
      throw new Error("Opus decoding error: " + len);
      
    var samples = opus.HEAPF32.subarray(this.f32, this.f32 + len * this.format.channelsPerFrame);
    return new Float32Array(samples);
  };
  
  this.prototype.destroy = function() {
    this._super();
    opus._free(this.buf);
    opus._free(this.outbuf);
    opus._opus_decoder_destroy(this.opus);
    
    this.buf = null;
    this.outbuf = null;
    this.opus = null;
  };
});

module.exports = OpusDecoder;
