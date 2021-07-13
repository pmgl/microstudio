this.TilePicker = (function() {
  function TilePicker(mapeditor) {
    this.mapeditor = mapeditor;
    this.element = document.getElementById("map-tilepicker");
    window.addEventListener("resize", (function(_this) {
      return function(event) {
        return _this.update();
      };
    })(this));
    this.zoom = 1;
    this.offset_x = 0;
    this.offset_y = 0;
    document.getElementById("mapbar").addEventListener("keydown", (function(_this) {
      return function(e) {
        if (e.keyCode === 32) {
          _this.space_pressed = true;
          if (_this.canvas != null) {
            _this.canvas.style.cursor = "grab";
          }
          return e.preventDefault();
        }
      };
    })(this));
    document.addEventListener("keyup", (function(_this) {
      return function(e) {
        if (e.keyCode === 32) {
          _this.space_pressed = false;
          if (_this.canvas != null) {
            return _this.canvas.style.cursor = "crosshair";
          }
        }
      };
    })(this));
  }

  TilePicker.prototype.update = function() {
    var bh, bw, context, h, i, j, k, l, m, r, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, sprite, w, ww;
    this.map = this.mapeditor.mapview.map;
    sprite = this.mapeditor.mapview.sprite;
    if ((this.map != null) && (sprite != null) && (this.mapeditor.app.project != null)) {
      this.sprite = this.mapeditor.app.project.getSprite(sprite);
      if ((this.sprite != null) && (this.sprite.width > this.map.block_width || this.sprite.height > this.map.block_height)) {
        if (this.sprite.tile_selection != null) {
          this.selection = this.sprite.tile_selection;
        } else {
          this.selection = {
            x: 0,
            y: 0,
            w: 1,
            h: 1
          };
        }
        this.zoom = this.sprite.tile_zoom != null ? this.sprite.tile_zoom : 1;
        this.offset_x = this.sprite.tile_offset_x != null ? this.sprite.tile_offset_x : 0;
        this.offset_y = this.sprite.tile_offset_y != null ? this.sprite.tile_offset_y : 0;
        ww = Math.max(1, this.element.getBoundingClientRect().width - 20);
        r = ww / Math.max(this.sprite.width, this.sprite.height);
        this.ratio = r;
        w = r * this.sprite.width;
        h = r * this.sprite.height;
        if (this.canvas == null) {
          this.canvas = document.createElement("canvas");
          this.element.appendChild(this.canvas);
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
          this.canvas.addEventListener("mouseenter", (function(_this) {
            return function(event) {
              return _this.mouseEnter(event);
            };
          })(this));
          this.canvas.addEventListener("mouseout", (function(_this) {
            return function(event) {
              return _this.mouseOut(event);
            };
          })(this));
          document.addEventListener("mouseup", (function(_this) {
            return function(event) {
              return _this.mouseUp(event);
            };
          })(this));
          this.canvas.addEventListener("mousewheel", ((function(_this) {
            return function(e) {
              return _this.mouseWheel(e);
            };
          })(this)), false);
          this.canvas.addEventListener("DOMMouseScroll", ((function(_this) {
            return function(e) {
              return _this.mouseWheel(e);
            };
          })(this)), false);
        }
        this.canvas.width = w;
        this.canvas.height = h;
        context = this.canvas.getContext("2d");
        context.save();
        if (this.zoom) {
          context.translate(-this.offset_x, -this.offset_y);
          context.scale(this.zoom, this.zoom);
        }
        context.imageSmoothingEnabled = false;
        context.drawImage(this.sprite.frames[0].getCanvas(), 0, 0, w, h);
        bw = this.map.block_width * r;
        bh = this.map.block_height * r;
        context.lineWidth = .5;
        context.strokeStyle = "rgba(0,0,0,.5)";
        for (i = j = 0, ref = w, ref1 = bw * 2; ref1 > 0 ? j <= ref : j >= ref; i = j += ref1) {
          context.strokeRect(i + .25, -2, bw, h + 4);
        }
        for (i = k = 0, ref2 = h, ref3 = bh * 2; ref3 > 0 ? k <= ref2 : k >= ref2; i = k += ref3) {
          context.strokeRect(-2, i + .25, w + 4, bh);
        }
        context.strokeStyle = "rgba(255,255,255,.5)";
        for (i = l = 0, ref4 = w, ref5 = bw * 2; ref5 > 0 ? l <= ref4 : l >= ref4; i = l += ref5) {
          context.strokeRect(i - .25, -2, bw, h + 4);
        }
        for (i = m = 0, ref6 = h, ref7 = bh * 2; ref7 > 0 ? m <= ref6 : m >= ref6; i = m += ref7) {
          context.strokeRect(-2, i - .25, w + 4, bh);
        }
        if (this.hover != null) {
          context.save();
          context.lineWidth = 2;
          context.strokeStyle = "#CCC";
          context.shadowOpacity = 1;
          context.shadowBlur = 4;
          context.shadowColor = "#000";
          context.strokeRect(this.hover.x * bw - 1, this.hover.y * bh - 1, bw + 2, bh + 2);
          context.restore();
        }
        if (this.selection != null) {
          context.save();
          context.lineWidth = 3;
          context.strokeStyle = "#FFF";
          context.shadowOpacity = 1;
          context.shadowBlur = 4;
          context.shadowColor = "#000";
          context.strokeRect(this.selection.x * bw, this.selection.y * bh, this.selection.w * bw, this.selection.h * bh);
          context.restore();
        }
        context.restore();
        this.canvas.style.display = "inline-block";
        document.querySelector(".mapbar").scrollTo(0, 0);
        return;
      }
    }
    if (this.canvas != null) {
      this.selection = null;
      return this.canvas.style.display = "none";
    }
  };

  TilePicker.prototype.mouseDown = function(event) {
    var b, bh, bw, x, y;
    this.mousedown = true;
    b = this.canvas.getBoundingClientRect();
    x = event.clientX - b.left;
    y = event.clientY - b.top;
    if (this.space_pressed) {
      this.drag_start_x = x;
      this.drag_start_y = y;
      this.offset_start_x = this.offset_x;
      this.offset_start_y = this.offset_y;
      return this.drag_view = true;
    } else {
      this.drag_view = false;
      bw = this.ratio * this.map.block_width * this.zoom;
      bh = this.ratio * this.map.block_height * this.zoom;
      x = Math.floor((x + this.offset_x) / bw);
      y = Math.floor((y + this.offset_y) / bh);
      this.selection = {
        x: x,
        y: y,
        w: 1,
        h: 1
      };
      this.sprite.tile_selection = this.selection;
      this.selection_start_x = x;
      this.selection_start_y = y;
      this.update();
      return this.mouseMove(event);
    }
  };

  TilePicker.prototype.mouseUp = function(event) {
    return this.mousedown = false;
  };

  TilePicker.prototype.mouseMove = function(event) {
    var b, bh, bw, sh, sw, sx, sy, th, tw, x, y;
    b = this.canvas.getBoundingClientRect();
    x = event.clientX - b.left;
    y = event.clientY - b.top;
    if (this.drag_view && this.mousedown) {
      this.offset_x = this.offset_start_x - (x - this.drag_start_x);
      this.offset_y = this.offset_start_y - (y - this.drag_start_y);
      this.fixOffset();
      return this.update();
    } else {
      bw = this.ratio * this.map.block_width * this.zoom;
      bh = this.ratio * this.map.block_height * this.zoom;
      x = Math.floor((x + this.offset_x) / bw);
      y = Math.floor((y + this.offset_y) / bh);
      if (this.mousedown) {
        sx = x < this.selection_start_x ? x : this.selection_start_x;
        sy = y < this.selection_start_y ? y : this.selection_start_y;
        sw = Math.max(x + 1 - this.selection_start_x, this.selection_start_x - x + 1);
        sh = Math.max(y + 1 - this.selection_start_y, this.selection_start_y - y + 1);
        tw = Math.floor(this.sprite.width / this.map.block_width);
        th = Math.floor(this.sprite.height / this.map.block_height);
        sx = Math.max(0, Math.min(tw - sw, sx));
        sy = Math.max(0, Math.min(th - sh, sy));
        sw = Math.max(1, Math.min(tw - sx, sw));
        sh = Math.max(1, Math.min(th - sy, sh));
        if (sx !== this.selection.x || sy !== this.selection.y || sw !== this.selection.w || sh !== this.selection.h) {
          this.selection.x = sx;
          this.selection.y = sy;
          this.selection.w = sw;
          this.selection.h = sh;
          return this.update();
        }
      } else if ((this.hover == null) || x !== this.hover.x || y !== this.hover.y) {
        if (this.hover == null) {
          this.hover = {};
        }
        this.hover.x = x;
        this.hover.y = y;
        return this.update();
      }
    }
  };

  TilePicker.prototype.mouseEnter = function(event) {
    return document.getElementById("mapbar").focus();
  };

  TilePicker.prototype.mouseOut = function(event) {
    if (this.hover != null) {
      this.hover = null;
      return this.update();
    }
  };

  TilePicker.prototype.mouseWheel = function(e) {
    var b, fx, fy, x, y;
    e.preventDefault();
    if (this.next_wheel_action == null) {
      this.next_wheel_action = Date.now();
    }
    if (Date.now() < this.next_wheel_action) {
      return;
    }
    this.next_wheel_action = Date.now() + 50;
    b = this.canvas.getBoundingClientRect();
    x = event.clientX - b.left;
    y = event.clientY - b.top;
    fx = (this.offset_x + x) / (this.canvas.width * this.zoom);
    fy = (this.offset_y + y) / (this.canvas.height * this.zoom);
    if (e.wheelDelta < 0 || e.detail > 0) {
      this.zoom = Math.max(1, this.zoom / 1.1);
    } else {
      this.zoom = Math.min(4, this.zoom * 1.1);
    }
    this.offset_x = fx * this.canvas.width * this.zoom - x;
    this.offset_y = fy * this.canvas.height * this.zoom - y;
    this.fixOffset();
    return this.update();
  };

  TilePicker.prototype.fixOffset = function() {
    var h, w;
    if (this.canvas == null) {
      return;
    }
    w = this.canvas.width;
    h = this.canvas.height;
    this.offset_x = Math.max(0, Math.min(w * (this.zoom - 1), this.offset_x));
    this.offset_y = Math.max(0, Math.min(h * (this.zoom - 1), this.offset_y));
    if (this.sprite != null) {
      this.sprite.tile_zoom = this.zoom;
      this.sprite.tile_offset_x = this.offset_x;
      return this.sprite.tile_offset_y = this.offset_y;
    }
  };

  return TilePicker;

})();
