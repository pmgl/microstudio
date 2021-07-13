this.AutoPalette = (function() {
  function AutoPalette(spriteeditor) {
    this.spriteeditor = spriteeditor;
    this.locked = false;
    this.lock = document.getElementById("auto-palette-lock");
    this.list = document.getElementById("auto-palette-list");
    setInterval(((function(_this) {
      return function() {
        return _this.process();
      };
    })(this)), 16);
    this.palette = {};
    this.lock.addEventListener("click", (function(_this) {
      return function() {
        if (_this.locked) {
          _this.locked = false;
          _this.lock.classList.remove("locked");
          _this.lock.classList.remove("fa-lock");
          _this.lock.classList.add("fa-lock-open");
          return _this.lock.title = _this.spriteeditor.app.translator.get("Lock palette");
        } else {
          _this.locked = true;
          _this.lock.classList.add("locked");
          _this.lock.classList.add("fa-lock");
          _this.lock.classList.remove("fa-lock-open");
          return _this.lock.title = _this.spriteeditor.app.translator.get("Unlock palette");
        }
      };
    })(this));
  }

  AutoPalette.prototype.update = function() {
    this.current_sprite = this.spriteeditor.spriteview.sprite;
    this.current_frame = 0;
    this.current_line = 0;
    return this.colors = {};
  };

  AutoPalette.prototype.setColor = function(col) {
    var c;
    c = [col.color >> 16, (col.color >> 8) & 0xFF, col.color & 0xFF];
    return this.spriteeditor.colorpicker.colorPicked(c);
  };

  AutoPalette.prototype.colorPicked = function(color) {
    var c, j, len, ref;
    ref = this.list.childNodes;
    for (j = 0, len = ref.length; j < len; j++) {
      c = ref[j];
      if (c === this.palette[color]) {
        c.classList.add("selected");
      } else {
        c.classList.remove("selected");
      }
    }
  };

  AutoPalette.prototype.process = function() {
    var c, col, data, fn, frame, i, j, k, key, len, ref, ref1, score, time, value;
    if (this.locked) {
      return;
    }
    if (!this.current_sprite) {
      return;
    }
    if (this.current_frame >= this.current_sprite.frames.length) {
      c = [];
      ref = this.colors;
      for (key in ref) {
        value = ref[key];
        c.push({
          color: value.color,
          count: value.count,
          hsl: this.rgbToHsl(value.color)
        });
      }
      if (c.length > 32) {
        c.sort(function(a, b) {
          return b.count - a.count;
        });
        c.splice(32, c.length - 31);
      }
      this.current_sprite = null;
      score = function(col) {
        return Math.round(col.hsl[0] * 16) / 16 * 100 + col.hsl[2] + (col.hsl[1] < .1 || col.hsl[2] > .9 ? -1000 : 0);
      };
      c.sort(function(a, b) {
        return score(a) - score(b);
      });
      this.list.innerHTML = "";
      this.palette = {};
      fn = (function(_this) {
        return function(col) {
          var div, rgb;
          div = document.createElement("div");
          rgb = "rgb(" + (col.color >> 16) + "," + ((col.color >> 8) & 0xFF) + "," + (col.color & 0xFF) + ")";
          div.style.background = rgb;
          div.addEventListener("click", function() {
            return _this.setColor(col);
          });
          _this.list.appendChild(div);
          return _this.palette[rgb] = div;
        };
      })(this);
      for (j = 0, len = c.length; j < len; j++) {
        col = c[j];
        fn(col);
      }
    } else {
      time = Date.now();
      while (Date.now() < time + 2 && this.current_frame < this.current_sprite.frames.length) {
        frame = this.current_sprite.frames[this.current_frame];
        if (frame == null) {
          return;
        }
        if (this.current_line < frame.getCanvas().height) {
          data = frame.getContext().getImageData(0, this.current_line, frame.width, 1);
          for (i = k = 0, ref1 = frame.width - 1; k <= ref1; i = k += 1) {
            if (data.data[i * 4 + 3] < 128) {
              continue;
            }
            col = (Math.floor(data.data[i * 4] / 16) << 8) + (Math.floor(data.data[i * 4 + 1] / 16) << 4) + Math.floor(data.data[i * 4 + 2] / 16);
            if (this.colors[col] == null) {
              this.colors[col] = {
                color: (data.data[i * 4] << 16) + (data.data[i * 4 + 1] << 8) + data.data[i * 4 + 2],
                count: 1
              };
            } else {
              this.colors[col].count += 1;
            }
          }
          this.current_line += 1;
        } else {
          this.current_line = 0;
          this.current_frame += 1;
        }
      }
    }
  };

  AutoPalette.prototype.rgbToHsl = function(c) {
    var b, d, g, h, l, max, min, r, s;
    r = (c >> 16) / 255;
    g = ((c >> 8) & 0xFF) / 255;
    b = (c & 0xFF) / 255;
    max = Math.max(r, g, b);
    min = Math.min(r, g, b);
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

  return AutoPalette;

})();
