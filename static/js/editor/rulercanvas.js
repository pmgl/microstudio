this.RulerCanvas = (function() {
  function RulerCanvas(app) {
    this.app = app;
    this.canvas = document.getElementById("ruler-canvas");
    this.update();
  }

  RulerCanvas.prototype.resize = function(width, height, top) {
    this.canvas.style["margin-top"] = top + "px";
    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";
    this.canvas.width = width;
    return this.canvas.height = height;
  };

  RulerCanvas.prototype.hide = function() {
    return this.canvas.style.display = "none";
  };

  RulerCanvas.prototype.show = function() {
    return this.canvas.style.display = "block";
  };

  RulerCanvas.prototype.showX = function(x, y, w, h) {
    this.show();
    return this.current = (function(_this) {
      return function() {
        var context, h1, h2, ratio, w1, w2;
        context = _this.canvas.getContext("2d");
        context.save();
        context.translate(_this.canvas.width / 2, _this.canvas.height / 2);
        ratio = Math.min(_this.canvas.width, _this.canvas.height) / 200;
        context.scale(ratio, ratio);
        w1 = _this.canvas.width * ratio;
        h1 = _this.canvas.height * ratio;
        w2 = Math.round(w1 / 2);
        h2 = Math.round(h1 / 2);
        context.clearRect(-w2, -h2, w1, h1);
        _this.drawXAxis(context);
        _this.drawDottedLine(context, x, 0, x, -y);
        _this.drawLine(context, x - 3, -y - 3, x + 3, -y + 3);
        _this.drawLine(context, x + 3, -y - 3, x - 3, -y + 3);
        context.strokeStyle = "rgba(0,0,0,.3)";
        context.strokeRect(x - w / 2 + .5, -y - h / 2 + .5, w, h);
        context.strokeStyle = "rgba(255,255,255,.3)";
        context.strokeRect(x - w / 2, -y - h / 2, w, h);
        return context.restore();
      };
    })(this);
  };

  RulerCanvas.prototype.showY = function(x, y, w, h) {
    this.show();
    return this.current = (function(_this) {
      return function() {
        var context, h1, h2, ratio, w1, w2;
        context = _this.canvas.getContext("2d");
        context.save();
        context.translate(_this.canvas.width / 2, _this.canvas.height / 2);
        ratio = Math.min(_this.canvas.width, _this.canvas.height) / 200;
        context.scale(ratio, ratio);
        w1 = _this.canvas.width * ratio;
        h1 = _this.canvas.height * ratio;
        w2 = Math.round(w1 / 2);
        h2 = Math.round(h1 / 2);
        context.clearRect(-w2, -h2, w1, h1);
        _this.drawYAxis(context);
        _this.drawDottedLine(context, 0, -y, x, -y);
        _this.drawLine(context, x - 3, -y - 3, x + 3, -y + 3);
        _this.drawLine(context, x + 3, -y - 3, x - 3, -y + 3);
        context.strokeStyle = "rgba(0,0,0,.3)";
        context.strokeRect(x - w / 2 + .5, -y - h / 2 + .5, w, h);
        context.strokeStyle = "rgba(255,255,255,.3)";
        context.strokeRect(x - w / 2, -y - h / 2, w, h);
        return context.restore();
      };
    })(this);
  };

  RulerCanvas.prototype.showW = function(x, y, w, h) {
    this.show();
    return this.current = (function(_this) {
      return function() {
        var context, h1, h2, ratio, w1, w2;
        context = _this.canvas.getContext("2d");
        context.save();
        context.translate(_this.canvas.width / 2, _this.canvas.height / 2);
        ratio = Math.min(_this.canvas.width, _this.canvas.height) / 200;
        context.scale(ratio, ratio);
        w1 = _this.canvas.width * ratio;
        h1 = _this.canvas.height * ratio;
        w2 = Math.round(w1 / 2);
        h2 = Math.round(h1 / 2);
        context.clearRect(-w2, -h2, w1, h1);
        _this.drawLine(context, x - 3, -y - 3, x + 3, -y + 3);
        _this.drawLine(context, x + 3, -y - 3, x - 3, -y + 3);
        context.strokeStyle = "rgba(0,0,0,.3)";
        context.strokeRect(x - w / 2 + .5, -y - h / 2 + .5, w, h);
        context.strokeStyle = "rgba(255,255,255,.3)";
        context.strokeRect(x - w / 2, -y - h / 2, w, h);
        if (y > 0) {
          _this.drawHorizontalArrow(context, x, -y + h / 2 + 10, w);
        } else {
          _this.drawHorizontalArrow(context, x, -y - h / 2 - 10, w);
        }
        return context.restore();
      };
    })(this);
  };

  RulerCanvas.prototype.showH = function(x, y, w, h) {
    this.show();
    return this.current = (function(_this) {
      return function() {
        var context, h1, h2, ratio, w1, w2;
        context = _this.canvas.getContext("2d");
        context.save();
        context.translate(_this.canvas.width / 2, _this.canvas.height / 2);
        ratio = Math.min(_this.canvas.width, _this.canvas.height) / 200;
        context.scale(ratio, ratio);
        w1 = _this.canvas.width * ratio;
        h1 = _this.canvas.height * ratio;
        w2 = Math.round(w1 / 2);
        h2 = Math.round(h1 / 2);
        context.clearRect(-w2, -h2, w1, h1);
        _this.drawLine(context, x - 3, -y - 3, x + 3, -y + 3);
        _this.drawLine(context, x + 3, -y - 3, x - 3, -y + 3);
        context.strokeStyle = "rgba(0,0,0,.3)";
        context.strokeRect(x - w / 2 + .5, -y - h / 2 + .5, w, h);
        context.strokeStyle = "rgba(255,255,255,.3)";
        context.strokeRect(x - w / 2, -y - h / 2, w, h);
        if (x > 0) {
          _this.drawVerticalArrow(context, x - w / 2 - 10, -y, h);
        } else {
          _this.drawVerticalArrow(context, x + w / 2 + 10, -y, h);
        }
        return context.restore();
      };
    })(this);
  };

  RulerCanvas.prototype.showBox = function(x, y, w, h) {
    this.show();
    return this.current = (function(_this) {
      return function() {
        var context, h1, h2, ratio, w1, w2;
        context = _this.canvas.getContext("2d");
        context.save();
        context.translate(_this.canvas.width / 2, _this.canvas.height / 2);
        ratio = Math.min(_this.canvas.width, _this.canvas.height) / 200;
        context.scale(ratio, ratio);
        w1 = _this.canvas.width * ratio;
        h1 = _this.canvas.height * ratio;
        w2 = Math.round(w1 / 2);
        h2 = Math.round(h1 / 2);
        context.clearRect(-w2, -h2, w1, h1);
        _this.drawLine(context, x - 3, -y - 3, x + 3, -y + 3);
        _this.drawLine(context, x + 3, -y - 3, x - 3, -y + 3);
        context.strokeStyle = "rgba(0,0,0,.3)";
        context.strokeRect(x - w / 2 + .5, -y - h / 2 + .5, w, h);
        context.strokeStyle = "rgba(255,255,255,.3)";
        context.strokeRect(x - w / 2, -y - h / 2, w, h);
        return context.restore();
      };
    })(this);
  };

  RulerCanvas.prototype.drawHorizontalArrow = function(context, x, y, w) {
    this.drawLine(context, x - w / 2 + 2, y, x + w / 2 - 2, y);
    this.drawLine(context, x - w / 2, y - 5, x - w / 2, y + 5);
    this.drawLine(context, x + w / 2, y - 5, x + w / 2, y + 5);
    this.drawLine(context, x - w / 2 + 1, y, x - w / 2 + 6, y + 5);
    this.drawLine(context, x - w / 2 + 1, y, x - w / 2 + 6, y - 5);
    this.drawLine(context, x + w / 2 - 1, y, x + w / 2 - 6, y + 5);
    return this.drawLine(context, x + w / 2 - 1, y, x + w / 2 - 6, y - 5);
  };

  RulerCanvas.prototype.drawVerticalArrow = function(context, x, y, h) {
    this.drawLine(context, x, y - h / 2 + 2, x, y + h / 2 - 2);
    this.drawLine(context, x - 5, y - h / 2, x + 5, y - h / 2);
    this.drawLine(context, x - 5, y + h / 2, x + 5, y + h / 2);
    this.drawLine(context, x, y - h / 2 + 1, x + 5, y - h / 2 + 6, this.drawLine(context, x, y - h / 2 + 1, x - 5, y - h / 2 + 6));
    this.drawLine(context, x, y + h / 2 - 1, x + 5, y + h / 2 - 6);
    return this.drawLine(context, x, y + h / 2 - 1, x - 5, y + h / 2 - 6);
  };

  RulerCanvas.prototype.update = function() {
    requestAnimationFrame((function(_this) {
      return function() {
        return _this.update();
      };
    })(this));
    if (!(this.canvas.width > 0 && this.canvas.height > 0)) {
      return;
    }
    if (this.current != null) {
      this.current();
      return this.current = null;
    }
  };

  RulerCanvas.prototype.drawLine = function(context, x1, y1, x2, y2) {
    context.strokeStyle = "rgba(0,0,0,.8)";
    context.beginPath();
    context.moveTo(x1 + .5, y1 + .5);
    context.lineTo(x2 + .5, y2 + .5);
    context.stroke();
    context.strokeStyle = "rgba(255,255,255,.8)";
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    return context.stroke();
  };

  RulerCanvas.prototype.drawDottedLine = function(context, x1, y1, x2, y2) {
    context.setLineDash([2, 2]);
    this.drawLine(context, x1, y1, x2, y2);
    return context.setLineDash([]);
  };

  RulerCanvas.prototype.drawText = function(context, text, x, y) {
    context.font = "6pt Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "rgba(0,0,0,.8)";
    context.fillText(text, x + .5, y + .5);
    context.fillStyle = "rgba(255,255,255,.8)";
    return context.fillText(text, x, y);
  };

  RulerCanvas.prototype.drawXAxis = function(context) {
    var h, h2, i, j, ratio, ref, w, w2;
    this.drawLine(context, 0, -5, 0, 5);
    ratio = 200 / Math.min(this.canvas.width, this.canvas.height);
    w = this.canvas.width * ratio;
    h = this.canvas.height * ratio;
    w2 = Math.round(w / 2);
    h2 = Math.round(h / 2);
    for (i = j = 50, ref = w2 - 50; j <= ref; i = j += 50) {
      this.drawLine(context, i, -2, i, 2);
      this.drawLine(context, -i, -2, -i, 2);
      this.drawText(context, "+" + i, i, 12);
      this.drawText(context, "-" + i, -i, 12);
    }
    this.drawText(context, "0", 0, 12);
    this.drawLine(context, -w2 + 2, 0, w2 - 2, 0);
    this.drawText(context, "+" + w2, w2 - 12, 12);
    this.drawText(context, "-" + w2, -w2 + 12, 12);
    this.drawLine(context, -w2 + 1, 0, -w2 + 6, 5);
    this.drawLine(context, -w2 + 1, 0, -w2 + 6, -5);
    this.drawLine(context, -w2 + 1, -5, -w2 + 1, 5);
    this.drawLine(context, w2 - 1, 0, w2 - 6, 5);
    this.drawLine(context, w2 - 1, 0, w2 - 6, -5);
    return this.drawLine(context, w2 - 1, -5, w2 - 1, 5);
  };

  RulerCanvas.prototype.drawYAxis = function(context) {
    var h, h2, i, j, ratio, ref, w, w2;
    this.drawLine(context, -5, 0, 5, 0);
    ratio = 200 / Math.min(this.canvas.width, this.canvas.height);
    w = this.canvas.width * ratio;
    h = this.canvas.height * ratio;
    w2 = Math.round(w / 2);
    h2 = Math.round(h / 2);
    for (i = j = 50, ref = h2 - 50; j <= ref; i = j += 50) {
      this.drawLine(context, -2, i, 2, i);
      this.drawLine(context, -2, -i, 2, -i);
      this.drawText(context, "+" + i, -12, -i);
      this.drawText(context, "-" + i, -12, i);
    }
    this.drawText(context, "0", -12, 0);
    this.drawLine(context, 0, -h2 + 2, 0, h2 - 2);
    this.drawText(context, "+" + h2, -12, -h2 + 12);
    this.drawText(context, "-" + h2, -12, h2 - 12);
    this.drawLine(context, 0, -h2 + 1, 5, -h2 + 6);
    this.drawLine(context, 0, -h2 + 1, -5, -h2 + 6);
    this.drawLine(context, -5, -h2 + 1, 5, -h2 + 1);
    this.drawLine(context, 0, h2 - 1, 5, h2 - 6);
    this.drawLine(context, 0, h2 - 1, -5, h2 - 6);
    return this.drawLine(context, -5, h2 - 1, 5, h2 - 1);
  };

  RulerCanvas.prototype.drawBounds = function(context) {
    var h, h2, i, j, k, l, m, ratio, ref, ref1, ref2, ref3, w, w2;
    context.lineWidth = 1;
    this.drawLine(context, -5, 0, 5, 0);
    this.drawLine(context, 0, -5, 0, 5);
    ratio = 200 / Math.min(this.canvas.width, this.canvas.height);
    w = this.canvas.width * ratio;
    h = this.canvas.height * ratio;
    w2 = Math.round(w / 2);
    h2 = Math.round(h / 2);
    this.drawLine(context, w / 2 - 1, -5, w / 2 - 1, 5);
    for (i = j = 50, ref = w2 - 1; j <= ref; i = j += 50) {
      this.drawLine(context, i, -2, i, 2);
    }
    this.drawLine(context, -w / 2 + 1, -5, -w / 2 + 1, 5);
    for (i = k = 50, ref1 = w2 - 1; k <= ref1; i = k += 50) {
      this.drawLine(context, -i, -2, -i, 2);
    }
    this.drawLine(context, -5, -h / 2 + 1, 5, -h / 2 + 1);
    for (i = l = 50, ref2 = h2 - 1; l <= ref2; i = l += 50) {
      this.drawLine(context, -2, -i, 2, -i);
    }
    this.drawLine(context, -5, h / 2 - 1, 5, h / 2 - 1);
    for (i = m = 50, ref3 = h2 - 1; m <= ref3; i = m += 50) {
      this.drawLine(context, -2, i, 2, i);
    }
    this.drawText(context, "0,0", 0, 12);
    this.drawText(context, "+" + w2, w2 - 12, 12);
    this.drawText(context, "-" + w2, -w2 + 12, 12);
    this.drawText(context, "+" + h2, 20, -h2 + 5);
    return this.drawText(context, "-" + h2, 20, h2 - 5);
  };

  RulerCanvas.prototype.showPolygon = function(args, index) {
    this.show();
    return this.current = (function(_this) {
      return function() {
        var context, h1, h2, i, j, num, px, py, ratio, ref, w1, w2, x, y;
        context = _this.canvas.getContext("2d");
        context.save();
        context.translate(_this.canvas.width / 2, _this.canvas.height / 2);
        ratio = Math.min(_this.canvas.width, _this.canvas.height) / 200;
        context.scale(ratio, ratio);
        w1 = _this.canvas.width * ratio;
        h1 = _this.canvas.height * ratio;
        w2 = Math.round(w1 / 2);
        h2 = Math.round(h1 / 2);
        context.clearRect(-w2, -h2, w1, h1);
        if (index % 2 === 0) {
          _this.drawXAxis(context);
        } else {
          _this.drawYAxis(context);
        }
        num = Math.floor((args.length + 1) / 2);
        for (i = j = 0, ref = num - 1; j <= ref; i = j += 1) {
          x = args[i * 2];
          y = args[i * 2 + 1];
          if ((y == null) || typeof y !== "number") {
            y = 0;
          }
          if (num > 0) {
            _this.drawLine(context, px, -py, x, -y);
          }
          px = x;
          py = y;
          if (i * 2 === index) {
            _this.drawDottedLine(context, x, 0, x, -y);
          } else if (i * 2 + 1 === index) {
            _this.drawDottedLine(context, 0, -y, x, -y);
          }
          _this.drawLine(context, x - 3, -y - 3, x + 3, -y + 3);
          _this.drawLine(context, x + 3, -y - 3, x - 3, -y + 3);
        }
        return context.restore();
      };
    })(this);
  };

  return RulerCanvas;

})();
