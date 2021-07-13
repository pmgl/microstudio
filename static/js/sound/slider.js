this.Slider = (function() {
  function Slider(canvas, value, listener) {
    this.canvas = canvas;
    this.value = value != null ? value : 0.5;
    this.listener = listener;
    this.canvas.width = 40;
    this.canvas.height = 110;
    this.margin = 8;
    this.id = this.canvas.id;
    this.type = this.canvas.dataset.type;
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

  Slider.prototype.update = function() {
    var context, h, i, j, op;
    context = this.canvas.getContext("2d");
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.strokeStyle = "rgba(0,0,0,.5)";
    context.lineWidth = 6;
    for (i = j = 0; j <= 16; i = j += 1) {
      if (i % 2 === 1) {
        op = .25;
      } else if ((i / 2) % 2 === 1) {
        op = .25;
      } else if ((i / 4) % 2 === 1) {
        op = .5;
      } else {
        op = 1;
      }
      context.lineWidth = op * 3;
      context.strokeStyle = "rgba(255,255,255,.5)";
      context.beginPath();
      context.moveTo(this.canvas.width * .15, this.margin + i * (this.canvas.height - 2 * this.margin) / 16);
      context.lineTo(this.canvas.width * .85, this.margin + i * (this.canvas.height - 2 * this.margin) / 16);
      context.stroke();
    }
    h = this.canvas.height - 2 * this.margin;
    context.clearRect(this.canvas.width / 2 - 7, this.margin - 4, 14, h + 8);
    context.fillStyle = "hsl(200,50%,10%)";
    context.fillRoundRect(this.canvas.width / 2 - 3, this.margin - 4, 6, h + 8, 3);
    context.shadowBlur = 4;
    context.shadowColor = "hsl(200,100%,70%)";
    context.shadowOpacity = 1;
    context.strokeStyle = "hsl(200,100%,70%)";
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(this.canvas.width / 2, this.canvas.height - this.margin);
    context.lineTo(this.canvas.width / 2, this.canvas.height - this.margin - this.value * h);
    context.stroke();
    context.shadowBlur = context.shadowOpacity = 0;
    context.fillStyle = "#FFF";
    context.shadowBlur = 4;
    context.shadowColor = "#000";
    context.shadowOpacity = 1;
    context.fillRoundRect(this.canvas.width * .25, this.canvas.height - this.margin - h * this.value - 8, this.canvas.width * .5, 16, 3);
    context.shadowBlur = context.shadowOpacity = 0;
    context.fillStyle = "#AAA";
    context.fillRoundRect(this.canvas.width * .25 + 1, this.canvas.height - this.margin - h * this.value + 1, this.canvas.width * .5 - 2, 7, 2);
    return context.fillStyle = "#000";
  };

  Slider.prototype.mouseDown = function(event) {
    this.mousepressed = true;
    this.start_y = event.clientY;
    return this.start_value = this.value;
  };

  Slider.prototype.mouseMove = function(event) {
    var dy, v;
    if (!this.mousepressed) {
      return;
    }
    dy = event.clientY - this.start_y;
    v = Math.max(0, Math.min(1, this.start_value - dy * .005));
    if (v !== this.value) {
      this.value = v;
      this.update();
      return this.listener.knobChange(this.id, this.value);
    }
  };

  Slider.prototype.mouseUp = function(event) {
    return this.mousepressed = false;
  };

  return Slider;

})();
