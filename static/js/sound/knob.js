this.Knob = (function() {
  function Knob(canvas, value, listener) {
    this.canvas = canvas;
    this.value = value != null ? value : 0.5;
    this.listener = listener;
    this.canvas.width = 40;
    this.canvas.height = 40;
    this.id = this.canvas.id;
    this.type = this.canvas.dataset.type;
    this.quantize = this.canvas.dataset.quantize;
    this.value = .5;
    this.update();
    this.canvas.addEventListener("mousedown", (function(_this) {
      return function(event) {
        return _this.mouseDown(event);
      };
    })(this));
    document.addEventListener("mousemove", (function(_this) {
      return function(event) {
        return _this.mouseMove(event);
      };
    })(this));
    document.addEventListener("mouseup", (function(_this) {
      return function(event) {
        return _this.mouseUp(event);
      };
    })(this));
  }

  Knob.prototype.update = function() {
    var alpha, context, x1, x2, y1, y2;
    context = this.canvas.getContext("2d");
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.strokeStyle = "rgba(255,255,255,.1)";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2 - 1, .7 * Math.PI, 2.3 * Math.PI, false);
    context.stroke();
    context.beginPath();
    context.fillStyle = "rgba(0,0,0,.5)";
    context.arc(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2 - 2, 0, Math.PI * 2, false);
    context.fill();
    context.beginPath();
    context.fillStyle = "rgba(255,255,255,.1)";
    context.arc(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2 - 6, 0, Math.PI * 2, false);
    context.fill();
    context.beginPath();
    context.lineWidth = 2;
    context.strokeStyle = "hsl(200,100%,70%)";
    alpha = (.7 + (2.3 - .7) * this.value) * Math.PI;
    x1 = this.canvas.width / 2 + (this.canvas.width / 2 - 14) * Math.cos(alpha);
    y1 = this.canvas.height / 2 + (this.canvas.width / 2 - 14) * Math.sin(alpha);
    x2 = this.canvas.width / 2 + (this.canvas.width / 2 - 8) * Math.cos(alpha);
    y2 = this.canvas.height / 2 + (this.canvas.width / 2 - 8) * Math.sin(alpha);
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.strokeStyle = "hsl(200,100%,70%)";
    context.lineWidth = 2;
    if (this.type === "centered") {
      if (this.value > .5) {
        context.beginPath();
        context.arc(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2 - 1, 1.5 * Math.PI, (.7 + (2.3 - .7) * this.value) * Math.PI, false);
        context.stroke();
      } else if (this.value < .5) {
        context.shadowColor = "hsl(20,100%,70%)";
        context.strokeStyle = "hsl(20,100%,70%)";
        context.beginPath();
        context.arc(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2 - 1, (.7 + (2.3 - .7) * this.value) * Math.PI, 1.5 * Math.PI, false);
        context.stroke();
      }
    } else {
      context.beginPath();
      context.arc(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2 - 1, .7 * Math.PI, (.7 + (2.3 - .7) * this.value) * Math.PI, false);
      context.stroke();
    }
    return context.shadowBlur = context.shadowOpacity = 0;
  };

  Knob.prototype.mouseDown = function(event) {
    this.mousepressed = true;
    this.start_y = event.clientY;
    return this.start_value = this.value;
  };

  Knob.prototype.mouseMove = function(event) {
    var dy, v;
    if (!this.mousepressed) {
      return;
    }
    dy = event.clientY - this.start_y;
    v = Math.max(0, Math.min(1, this.start_value - dy * .005));
    if (this.quantize && this.quantize > 0) {
      v = Math.round(v * this.quantize) / this.quantize;
    }
    if (v !== this.value) {
      this.value = v;
      this.update();
      return this.listener.knobChange(this.id, this.value);
    }
  };

  Knob.prototype.mouseUp = function(event) {
    return this.mousepressed = false;
  };

  return Knob;

})();
