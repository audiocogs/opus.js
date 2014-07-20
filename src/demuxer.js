var AV = require('av');
var OggDemuxer = require('ogg.js');

OggDemuxer.plugins.push({
  magic: "OpusHead",
  
  readHeaders: function(packet) {
    if (packet[8] !== 1)
      throw new Error("Unknown opus version");
    
    this.emit('format', {
      formatID: 'opus',
      sampleRate: 48000,
      channelsPerFrame: packet[9],
      floatingPoint: true
    });
    
    return true;
  },
  
  readPacket: function(packet) {
    var tag = packet.subarray(0, 8);
    if (String.fromCharCode.apply(String, tag) === "OpusTags") {
      var stream = AV.Stream.fromBuffer(new AV.Buffer(packet));
      stream.advance(8);
      
      var metadata = {};
      var len = stream.readUInt32(true);
      metadata.vendor = stream.readString(len);
      
      var length = stream.readUInt32(true);
      
      for (var i = 0; i < length; i++) {
        len = stream.readUInt32(true);
        var str = stream.readString(len, 'utf8'),
          idx = str.indexOf('=');
          
        metadata[str.slice(0, idx).toLowerCase()] = str.slice(idx + 1);
      }
      
      this.emit('metadata', metadata);
    } else {
      this.emit('data', new AV.Buffer(packet));
    }
  }
});

module.exports = OggDemuxer;
