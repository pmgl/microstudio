this.SynthWheel = (function() {
  function SynthWheel(canvas, listener) {
    this.canvas = canvas;
    this.listener = listener;
    this.update();
  }

  SynthWheel.prototype.update = function() {
    var a, context, h, i, j, k, p, ref, ref1, ref2, results, w, y;
    h = this.canvas.height - 20;
    w = this.canvas.width - 20;
    context = this.canvas.getContext("2d");
    context.globalAlpha = 1;
    context.shadowBlur = 10;
    context.shadowOpacity = 1;
    context.shadowColor = "#000";
    context.fillStyle = "#000";
    context.fillRect(9, 9, w + 2, h + 2);
    context.beginPath();
    context.ellipse(this.canvas.width / 2, this.canvas.height / 2, w / 2 + 5, h / 2, 0, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
    context.shadowOpacity = 0;
    context.fillStyle = "#FFF";
    for (i = j = 0, ref = h; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      y = (i - h / 2) / h * Math.PI / 2;
      a = Math.asin(y);
      p = Math.cos(a) * Math.cos(-Math.PI / 8) + Math.sin(a) * Math.sin(-Math.PI / 8);
      context.globalAlpha = p;
      context.fillRect(11, 10 + i, w - 2, 1);
    }
    results = [];
    for (i = k = ref1 = -Math.PI / 4, ref2 = Math.PI / 4; k <= ref2; i = k += .05) {
      y = this.canvas.height / 2 + Math.sin(i) * h / 2 / Math.sin(Math.PI / 4);
      context.fillStyle = "rgba(0,0,0,.3)";
      context.globalAlpha = 1;
      results.push(context.fillRect(11, y, w - 2, Math.abs(Math.cos(i))));
    }
    return results;
  };

  return SynthWheel;

})();
