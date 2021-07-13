this.SynthKeyboard = (function() {
  function SynthKeyboard(canvas, octaves, listener) {
    this.canvas = canvas;
    this.octaves = octaves;
    this.listener = listener;
    this.white = 7 * this.octaves + 1;
    this.white_width = this.canvas.width / this.white;
    this.black_pos = [0, 1, 3, 4, 5];
    this.update();
  }

  SynthKeyboard.prototype.update = function() {
    var context, grd, i, j, k, l, len, m, o, p, ref, ref1, ref2;
    context = this.canvas.getContext("2d");
    context.fillStyle = "#111";
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    context.fillStyle = "#FFF";
    for (i = j = 0, ref = this.white - 1; j <= ref; i = j += 1) {
      context.fillRect(this.white_width * i + .5, .5, this.white_width - 1, this.canvas.height - 1);
    }
    context.fillStyle = "#000";
    for (o = l = 0, ref1 = this.octaves - 1; l <= ref1; o = l += 1) {
      ref2 = this.black_pos;
      for (m = 0, len = ref2.length; m < len; m++) {
        k = ref2[m];
        p = o * 7 + k;
        context.fillRect(this.white_width * (p + .7) + .5, .5, this.white_width * .6, this.canvas.height * .6);
      }
    }
    grd = context.createLinearGradient(0, 0, 0, this.canvas.height / 8);
    grd.addColorStop(0, "rgba(0,0,0,1)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = grd;
    return context.fillRect(0, 0, this.canvas.width, this.canvas.height / 8);
  };

  return SynthKeyboard;

})();
