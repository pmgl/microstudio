this.ColorPicker = (function() {
  function ColorPicker(editor) {
    this.editor = editor;
    this.canvas = document.createElement("canvas");
    this.canvas.width = 146;
    this.num_blocks = 9;
    this.block = this.canvas.width / this.num_blocks;
    this.canvas.height = this.block * (2 + 1 + 1 + 1 + 1 + 1 + this.num_blocks);
    this.hue = 0;
    this.type = "color";
    this.saturation = this.num_blocks - 1;
    this.lightness = this.num_blocks - 1;
    this.updateColor();
    this.update();
    this.canvas.addEventListener("mousedown", (function(_this) {
      return function(event) {
        return _this.mouseDown(event);
      };
    })(this));
    this.canvas.addEventListener("mousemove", (function(_this) {
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

  ColorPicker.prototype.colorPicked = function(c) {
    var col, i, j, match;
    if (typeof c === "string") {
      match = /rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/.exec(c.replace(/ /g, ""));
      if ((match != null) && match.length >= 4) {
        c = [match[1] | 0, match[2] | 0, match[3] | 0];
      } else {
        return;
      }
    }
    for (i = j = 0; j <= 2; i = ++j) {
      c[i] = Math.max(0, Math.min(255, c[i]));
    }
    this.color = "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
    this.editor.setColor(this.color);
    col = this.RGBtoHSV(c[0], c[1], c[2]);
    this.hue = Math.round(col.h * this.num_blocks * 2) % (this.num_blocks * 2);
    this.saturation = Math.round(col.s * this.num_blocks);
    this.lightness = Math.round(col.v * this.num_blocks);
    if (this.saturation === 0 || this.lightness === 0) {
      this.type = "gray";
      this.lightness = Math.round(col.v * (2 * this.num_blocks - 1)) / 2;
    } else {
      this.type = "color";
      this.saturation -= 1;
      this.lightness -= 1;
    }
    return this.update();
  };

  ColorPicker.prototype.updateColor = function() {
    var col, h, s, v;
    if (this.type === "gray") {
      v = Math.floor(255 * this.lightness * 2 / (this.num_blocks * 2 - 1));
      this.color = "rgb(" + v + "," + v + "," + v + ")";
    } else {
      h = this.hue / (this.num_blocks * 2);
      s = (this.saturation + 1) / this.num_blocks;
      v = (this.lightness + 1) / this.num_blocks;
      col = this.HSVtoRGB(h, s, v);
      this.color = "rgb(" + col.r + "," + col.g + "," + col.b + ")";
    }
    return this.editor.setColor(this.color);
  };

  ColorPicker.prototype.update = function() {
    var ay, col, context, grd, h, hue, j, k, l, light, m, n, ref, ref1, ref2, ref3, s, v, x, y;
    context = this.canvas.getContext("2d");
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.fillStyle = "#888";
    context.fillRoundRect(0, 0, this.canvas.width, this.block * 2, 5);
    context.fillStyle = this.color;
    context.fillRoundRect(1, 1, this.canvas.width - 2, this.block * 2 - 2, 5);
    grd = context.createLinearGradient(0, this.canvas.height - this.block * 2, 0, this.canvas.height, 0);
    grd.addColorStop(0, 'rgba(255,255,255,0)');
    grd.addColorStop(1, "rgba(255,255,255,.5)");
    context.fillStyle = grd;
    for (light = j = 0, ref = this.num_blocks * 2 - 1; j <= ref; light = j += 1) {
      if (this.type === "gray" && this.lightness * 2 === light) {
        context.fillStyle = "#FFF";
        context.fillRoundRect(light * this.block * .5 - 1, 3 * this.block - 1, this.block * .5 + 2, this.block + 2, 1);
      }
      context.fillStyle = "hsl(0,0%," + (light / (this.num_blocks * 2 - 1) * 100) + "%)";
      context.fillRoundRect(light * this.block * .5 + 1, 3 * this.block + 1, this.block * .5 - 2, this.block - 2, 1);
    }
    for (hue = k = 0, ref1 = this.num_blocks * 2 - 1; k <= ref1; hue = k += 1) {
      if (this.type === "color" && hue === this.hue) {
        context.fillStyle = "#FFF";
        context.fillRoundRect(hue * this.block * .5 - 1, 5 * this.block - 1, this.block * .5 + 2, this.block + 2, 1);
      }
      context.fillStyle = "hsl(" + (hue / this.num_blocks * 180) + ",100%,50%)";
      context.fillRoundRect(hue * this.block * .5 + 1, 5 * this.block + 1, this.block * .5 - 2, this.block - 2, 1);
    }
    for (y = m = 0, ref2 = this.num_blocks - 1; m <= ref2; y = m += 1) {
      for (x = n = 0, ref3 = this.num_blocks - 1; n <= ref3; x = n += 1) {
        ay = this.num_blocks - 1 - y;
        if (this.type === "color" && ay === this.lightness && x === this.saturation && this.hue >= 0) {
          context.fillStyle = "#FFF";
          context.fillRoundRect(x * this.block - 1, (y + 7) * this.block - 1, this.block + 2, this.block + 2, 2);
        }
        h = this.hue / (this.num_blocks * 2);
        s = (x + 1) / this.num_blocks;
        v = (ay + 1) / this.num_blocks;
        col = this.HSVtoRGB(h, s, v);
        context.fillStyle = "rgb(" + col.r + "," + col.g + "," + col.b + ")";
        l = this.num_blocks - 1 - light;
        context.fillRoundRect(x * this.block + 1, (y + 7) * this.block + 1, this.block - 2, this.block - 2, 2);
      }
    }
  };

  ColorPicker.prototype.mouseDown = function(event) {
    this.mousepressed = true;
    return this.mouseMove(event);
  };

  ColorPicker.prototype.mouseMove = function(event) {
    var b, hue, lightness, min, saturation, x, y;
    if (this.mousepressed) {
      b = this.canvas.getBoundingClientRect();
      min = Math.min(this.canvas.clientWidth, this.canvas.clientHeight);
      x = (event.clientX - b.left) / b.width * this.canvas.width;
      y = (event.clientY - b.top) / b.height * this.canvas.height;
      y = Math.floor(y / this.block);
      if (y === 3) {
        lightness = Math.floor(x / this.canvas.width * this.num_blocks * 2) / 2;
        if (lightness !== this.lightness || this.type !== "gray") {
          this.type = "gray";
          this.lightness = lightness;
          this.updateColor();
          this.update();
        }
      } else if (y === 5) {
        hue = Math.max(0, Math.floor(x / this.canvas.width * this.num_blocks * 2));
        if (hue !== this.hue || this.type !== this.color) {
          this.type = "color";
          this.lightness = Math.floor(this.lightness);
          this.hue = hue;
          this.updateColor();
          this.update();
        }
      } else if (y >= 7) {
        x = Math.floor(x / this.canvas.width * this.num_blocks);
        saturation = x;
        lightness = this.num_blocks - 1 - (y - 7);
        if (lightness !== this.lightness || saturation !== this.saturation || this.type !== "color") {
          this.type = "color";
          this.lightness = lightness;
          this.saturation = saturation;
          this.updateColor();
          this.update();
        }
      }
    }
    return false;
  };

  ColorPicker.prototype.mouseUp = function(event) {
    return this.mousepressed = false;
  };

  ColorPicker.prototype.rgbToHsl = function(r, g, b) {
    var d, h, l, max, min, s;
    r /= 255;
    g /= 255;
    b /= 255;
    max = Math.max(r, g, b);
    min = Math.min(r, g, b);
    h = void 0;
    s = void 0;
    l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return [h, s, l];
  };

  ColorPicker.prototype.HSVtoRGB = function(h, s, v) {
    var b, f, g, i, p, q, r, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - (f * s));
    t = v * (1 - ((1 - f) * s));
    switch (i % 6) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;
      case 1:
        r = q;
        g = v;
        b = p;
        break;
      case 2:
        r = p;
        g = v;
        b = t;
        break;
      case 3:
        r = p;
        g = q;
        b = v;
        break;
      case 4:
        r = t;
        g = p;
        b = v;
        break;
      case 5:
        r = v;
        g = p;
        b = q;
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  ColorPicker.prototype.RGBtoHSV = function(r, g, b) {
    var d, h, max, min, s, v;
    max = Math.max(r, g, b);
    min = Math.min(r, g, b);
    d = max - min;
    h = void 0;
    s = max === 0 ? 0 : d / max;
    v = max / 255;
    switch (max) {
      case min:
        h = 0;
        break;
      case r:
        h = g - b + d * (g < b ? 6 : 0);
        h /= 6 * d;
        break;
      case g:
        h = b - r + d * 2;
        h /= 6 * d;
        break;
      case b:
        h = r - g + d * 4;
        h /= 6 * d;
    }
    return {
      h: h,
      s: s,
      v: v
    };
  };

  return ColorPicker;

})();
