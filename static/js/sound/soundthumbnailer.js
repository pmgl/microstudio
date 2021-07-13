this.SoundThumbnailer = (function() {
  function SoundThumbnailer(buffer, width, height, color) {
    this.buffer = buffer;
    this.width = width != null ? width : 128;
    this.height = height != null ? height : 64;
    this.color = color != null ? color : "hsl(20,80%,60%)";
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.channels = Math.min(2, this.buffer.numberOfChannels);
    this.context = this.canvas.getContext("2d");
    this.context.fillStyle = "#222";
    this.context.fillRect(0, 0, this.width, this.height);
    this.context.fillStyle = this.color;
    switch (this.channels) {
      case 1:
        this.context.translate(0, this.height / 2);
        this.drawChannel(this.buffer.getChannelData(0));
        break;
      case 2:
        this.context.translate(0, this.height / 4);
        this.context.scale(1, .5);
        this.drawChannel(this.buffer.getChannelData(0));
        this.context.translate(0, this.height);
        this.drawChannel(this.buffer.getChannelData(1));
    }
  }

  SoundThumbnailer.prototype.drawChannel = function(data) {
    var d, i, j, max, ref;
    max = 0;
    for (i = j = 0, ref = this.width - 1; j <= ref; i = j += .5) {
      d = Math.abs(data[Math.floor(data.length * i / this.width)]);
      max = Math.max(d, max);
      this.context.fillRect(i, -this.height / 2 * d, 1, this.height * d);
    }
    return console.info("max signal: " + max);
  };

  return SoundThumbnailer;

})();
