this.Screen = (function() {
  function Screen(runtime) {
    this.runtime = runtime;
    this.canvas = document.createElement("canvas");
    this.canvas.width = 1080;
    this.canvas.height = 1920;
    this.touches = {};
    this.mouse = {
      x: -10000,
      y: -10000,
      pressed: 0,
      left: 0,
      middle: 0,
      right: 0
    };
    this.translation_x = 0;
    this.translation_y = 0;
    this.rotation = 0;
    this.scale_x = 1;
    this.scale_y = 1;
    this.screen_transform = false;
    this.anchor_x = 0;
    this.anchor_y = 0;
    this.supersampling = this.previous_supersampling = 1;
    this.font = "BitCell";
    this.font_load_requested = {};
    this.font_loaded = {};
    this.loadFont(this.font);
    this.initContext();
    this.cursor = "default";
    this.canvas.addEventListener("mousemove", (function(_this) {
      return function() {
        _this.last_mouse_move = Date.now();
        if (_this.cursor !== "default" && _this.cursor_visibility === "auto") {
          _this.cursor = "default";
          return _this.canvas.style.cursor = "default";
        }
      };
    })(this));
    setInterval(((function(_this) {
      return function() {
        return _this.checkMouseCursor();
      };
    })(this)), 1000);
    this.cursor_visibility = "auto";
  }

  Screen.prototype.checkMouseCursor = function() {
    if (Date.now() > this.last_mouse_move + 4000 && this.cursor_visibility === "auto") {
      if (this.cursor !== "none") {
        this.cursor = "none";
        return this.canvas.style.cursor = "none";
      }
    }
  };

  Screen.prototype.setCursorVisible = function(visible) {
    this.cursor_visibility = visible;
    if (visible) {
      this.cursor = "default";
      return this.canvas.style.cursor = "default";
    } else {
      this.cursor = "none";
      return this.canvas.style.cursor = "none";
    }
  };

  Screen.prototype.initContext = function() {
    var b, c, j, len1, ratio, ref;
    c = this.canvas.getContext("2d", {
      alpha: false
    });
    if (c !== this.context) {
      this.context = c;
    } else {
      this.context.restore();
    }
    this.context.save();
    this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
    ratio = Math.min(this.canvas.width / 200, this.canvas.height / 200);
    this.context.scale(ratio, ratio);
    this.width = this.canvas.width / ratio;
    this.height = this.canvas.height / ratio;
    this.alpha = 1;
    this.line_width = 1;
    this.object_rotation = 0;
    this.object_scale_x = 1;
    this.object_scale_y = 1;
    this.context.lineCap = "round";
    this.blending = {
      normal: "source-over",
      additive: "lighter"
    };
    ref = ["source-over", "source-in", "source-out", "source-atop", "destination-over", "destination-in", "destination-out", "destination-atop", "lighter", "copy", "xor", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];
    for (j = 0, len1 = ref.length; j < len1; j++) {
      b = ref[j];
      this.blending[b] = b;
    }
  };

  Screen.prototype.getInterface = function() {
    var screen;
    if (this["interface"] != null) {
      return this["interface"];
    }
    screen = this;
    return this["interface"] = {
      width: this.width,
      height: this.height,
      clear: function(color) {
        return screen.clear(color);
      },
      setColor: function(color) {
        return screen.setColor(color);
      },
      setAlpha: function(alpha) {
        return screen.setAlpha(alpha);
      },
      setBlending: function(blending) {
        return screen.setBlending(blending);
      },
      setLinearGradient: function(x1, y1, x2, y2, c1, c2) {
        return screen.setLinearGradient(x1, y1, x2, y2, c1, c2);
      },
      setRadialGradient: function(x, y, radius, c1, c2) {
        return screen.setRadialGradient(x, y, radius, c1, c2);
      },
      setFont: function(font) {
        return screen.setFont(font);
      },
      setTranslation: function(tx, ty) {
        return screen.setTranslation(tx, ty);
      },
      setScale: function(x, y) {
        return screen.setScale(x, y);
      },
      setRotation: function(rotation) {
        return screen.setRotation(rotation);
      },
      setDrawAnchor: function(ax, ay) {
        return screen.setDrawAnchor(ax, ay);
      },
      setDrawRotation: function(rotation) {
        return screen.setDrawRotation(rotation);
      },
      setDrawScale: function(x, y) {
        return screen.setDrawScale(x, y);
      },
      fillRect: function(x, y, w, h, c) {
        return screen.fillRect(x, y, w, h, c);
      },
      fillRoundRect: function(x, y, w, h, r, c) {
        return screen.fillRoundRect(x, y, w, h, r, c);
      },
      fillRound: function(x, y, w, h, c) {
        return screen.fillRound(x, y, w, h, c);
      },
      drawRect: function(x, y, w, h, c) {
        return screen.drawRect(x, y, w, h, c);
      },
      drawRoundRect: function(x, y, w, h, r, c) {
        return screen.drawRoundRect(x, y, w, h, r, c);
      },
      drawRound: function(x, y, w, h, c) {
        return screen.drawRound(x, y, w, h, c);
      },
      drawSprite: function(sprite, x, y, w, h) {
        return screen.drawSprite(sprite, x, y, w, h);
      },
      drawSpritePart: function(sprite, sx, sy, sw, sh, x, y, w, h) {
        return screen.drawSpritePart(sprite, sx, sy, sw, sh, x, y, w, h);
      },
      drawMap: function(map, x, y, w, h) {
        return screen.drawMap(map, x, y, w, h);
      },
      drawText: function(text, x, y, size, color) {
        return screen.drawText(text, x, y, size, color);
      },
      drawTextOutline: function(text, x, y, size, color) {
        return screen.drawTextOutline(text, x, y, size, color);
      },
      textWidth: function(text, size) {
        return screen.textWidth(text, size);
      },
      setLineWidth: function(width) {
        return screen.setLineWidth(width);
      },
      setLineDash: function(dash) {
        return screen.setLineDash(dash);
      },
      drawLine: function(x1, y1, x2, y2, color) {
        return screen.drawLine(x1, y1, x2, y2, color);
      },
      drawPolygon: function() {
        return screen.drawPolygon(arguments);
      },
      drawPolyline: function() {
        return screen.drawPolyline(arguments);
      },
      fillPolygon: function() {
        return screen.fillPolygon(arguments);
      },
      setCursorVisible: function(visible) {
        return screen.setCursorVisible(visible);
      },
      loadFont: function(font) {
        return screen.loadFont(font);
      },
      isFontReady: function(font) {
        return screen.isFontReady(font);
      }
    };
  };

  Screen.prototype.updateInterface = function() {
    this["interface"].width = this.width;
    return this["interface"].height = this.height;
  };

  Screen.prototype.clear = function(color) {
    var blending_save, c, s;
    c = this.context.fillStyle;
    s = this.context.strokeStyle;
    blending_save = this.context.globalCompositeOperation;
    this.context.globalAlpha = 1;
    this.context.globalCompositeOperation = "source-over";
    if (color != null) {
      this.setColor(color);
    } else {
      this.context.fillStyle = "#000";
    }
    this.context.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    this.context.fillStyle = c;
    this.context.strokeStyle = s;
    return this.context.globalCompositeOperation = blending_save;
  };

  Screen.prototype.initDraw = function() {
    this.alpha = 1;
    this.line_width = 1;
    if (this.supersampling !== this.previous_supersampling) {
      this.resize();
      return this.previous_supersampling = this.supersampling;
    }
  };

  Screen.prototype.setColor = function(color) {
    var b, c, g, r;
    if (color == null) {
      return;
    }
    if (!Number.isNaN(Number.parseInt(color))) {
      r = (Math.floor(color / 100) % 10) / 9 * 255;
      g = (Math.floor(color / 10) % 10) / 9 * 255;
      b = (Math.floor(color) % 10) / 9 * 255;
      c = 0xFF000000;
      c += r << 16;
      c += g << 8;
      c += b;
      c = "#" + c.toString(16).substring(2, 8);
      this.context.fillStyle = c;
      return this.context.strokeStyle = c;
    } else if (typeof color === "string") {
      this.context.fillStyle = color;
      return this.context.strokeStyle = color;
    }
  };

  Screen.prototype.setAlpha = function(alpha1) {
    this.alpha = alpha1;
  };

  Screen.prototype.setBlending = function(blending) {
    blending = this.blending[blending || "normal"] || "source-over";
    return this.context.globalCompositeOperation = blending;
  };

  Screen.prototype.setLineWidth = function(line_width) {
    this.line_width = line_width;
  };

  Screen.prototype.setLineDash = function(dash) {
    if (!Array.isArray(dash)) {
      return this.context.setLineDash([]);
    } else {
      return this.context.setLineDash(dash);
    }
  };

  Screen.prototype.setLinearGradient = function(x1, y1, x2, y2, c1, c2) {
    var grd;
    grd = this.context.createLinearGradient(x1, -y1, x2, -y2);
    grd.addColorStop(0, c1);
    grd.addColorStop(1, c2);
    this.context.fillStyle = grd;
    return this.context.strokeStyle = grd;
  };

  Screen.prototype.setRadialGradient = function(x, y, radius, c1, c2) {
    var grd;
    grd = this.context.createRadialGradient(x, -y, 0, x, -y, radius);
    grd.addColorStop(0, c1);
    grd.addColorStop(1, c2);
    this.context.fillStyle = grd;
    return this.context.strokeStyle = grd;
  };

  Screen.prototype.setFont = function(font) {
    this.font = font || "Verdana";
    return this.loadFont(this.font);
  };

  Screen.prototype.loadFont = function(font) {
    var err;
    if (font == null) {
      font = "BitCell";
    }
    if (!this.font_load_requested[font]) {
      this.font_load_requested[font] = true;
      try {
        if ((document.fonts != null) && (document.fonts.load != null)) {
          document.fonts.load("16pt " + font);
        }
      } catch (error) {
        err = error;
      }
    }
    return 1;
  };

  Screen.prototype.isFontReady = function(font) {
    var err, res;
    if (font == null) {
      font = this.font;
    }
    if (this.font_loaded[font]) {
      return 1;
    }
    try {
      if ((document.fonts != null) && (document.fonts.check != null)) {
        res = document.fonts.check("16pt " + font);
        if (res) {
          this.font_loaded[font] = res;
        }
        if (res) {
          return 1;
        } else {
          return 0;
        }
      }
    } catch (error) {
      err = error;
    }
    return 1;
  };

  Screen.prototype.setTranslation = function(translation_x, translation_y) {
    this.translation_x = translation_x;
    this.translation_y = translation_y;
    if (!isFinite(this.translation_x)) {
      this.translation_x = 0;
    }
    if (!isFinite(this.translation_y)) {
      this.translation_y = 0;
    }
    return this.updateScreenTransform();
  };

  Screen.prototype.setScale = function(scale_x, scale_y) {
    this.scale_x = scale_x;
    this.scale_y = scale_y;
    if (!isFinite(this.scale_x) || this.scale_x === 0) {
      this.scale_x = 1;
    }
    if (!isFinite(this.scale_y) || this.scale_y === 0) {
      this.scale_y = 1;
    }
    return this.updateScreenTransform();
  };

  Screen.prototype.setRotation = function(rotation1) {
    this.rotation = rotation1;
    if (!isFinite(this.rotation)) {
      this.rotation = 0;
    }
    return this.updateScreenTransform();
  };

  Screen.prototype.updateScreenTransform = function() {
    return this.screen_transform = this.translation_x !== 0 || this.translation_y !== 0 || this.scale_x !== 1 || this.scale_y !== 1 || this.rotation !== 0;
  };

  Screen.prototype.setDrawAnchor = function(anchor_x, anchor_y) {
    this.anchor_x = anchor_x;
    this.anchor_y = anchor_y;
    if (typeof this.anchor_x !== "number") {
      this.anchor_x = 0;
    }
    if (typeof this.anchor_y !== "number") {
      return this.anchor_y = 0;
    }
  };

  Screen.prototype.setDrawRotation = function(object_rotation) {
    this.object_rotation = object_rotation;
  };

  Screen.prototype.setDrawScale = function(object_scale_x, object_scale_y) {
    this.object_scale_x = object_scale_x;
    this.object_scale_y = object_scale_y != null ? object_scale_y : this.object_scale_x;
  };

  Screen.prototype.initDrawOp = function(x, y) {
    var res;
    res = false;
    if (this.screen_transform) {
      this.context.save();
      res = true;
      this.context.translate(this.translation_x, -this.translation_y);
      this.context.scale(this.scale_x, this.scale_y);
      this.context.rotate(-this.rotation / 180 * Math.PI);
      this.context.translate(x, y);
    }
    if (this.object_rotation !== 0 || this.object_scale_x !== 1 || this.object_scale_y !== 1) {
      if (!res) {
        this.context.save();
        res = true;
        this.context.translate(x, y);
      }
      if (this.object_rotation !== 0) {
        this.context.rotate(-this.object_rotation / 180 * Math.PI);
      }
      if (this.object_scale_x !== 1 || this.object_scale_y !== 1) {
        this.context.scale(this.object_scale_x, this.object_scale_y);
      }
    }
    return res;
  };

  Screen.prototype.closeDrawOp = function(x, y) {
    return this.context.restore();
  };

  Screen.prototype.fillRect = function(x, y, w, h, color) {
    this.setColor(color);
    this.context.globalAlpha = this.alpha;
    if (this.initDrawOp(x, -y)) {
      this.context.fillRect(-w / 2 - this.anchor_x * w / 2, -h / 2 + this.anchor_y * h / 2, w, h);
      return this.closeDrawOp(x, -y);
    } else {
      return this.context.fillRect(x - w / 2 - this.anchor_x * w / 2, -y - h / 2 + this.anchor_y * h / 2, w, h);
    }
  };

  Screen.prototype.fillRoundRect = function(x, y, w, h, round, color) {
    if (round == null) {
      round = 10;
    }
    this.setColor(color);
    this.context.globalAlpha = this.alpha;
    if (this.initDrawOp(x, -y)) {
      this.context.fillRoundRect(-w / 2 - this.anchor_x * w / 2, -h / 2 + this.anchor_y * h / 2, w, h, round);
      return this.closeDrawOp(x, -y);
    } else {
      return this.context.fillRoundRect(x - w / 2 - this.anchor_x * w / 2, -y - h / 2 + this.anchor_y * h / 2, w, h, round);
    }
  };

  Screen.prototype.fillRound = function(x, y, w, h, color) {
    this.setColor(color);
    this.context.globalAlpha = this.alpha;
    w = Math.abs(w);
    h = Math.abs(h);
    if (this.initDrawOp(x, -y)) {
      this.context.beginPath();
      this.context.ellipse(-this.anchor_x * w / 2, 0 + this.anchor_y * h / 2, w / 2, h / 2, 0, 0, Math.PI * 2, false);
      this.context.fill();
      return this.closeDrawOp(x, -y);
    } else {
      this.context.beginPath();
      this.context.ellipse(x - this.anchor_x * w / 2, -y + this.anchor_y * h / 2, w / 2, h / 2, 0, 0, Math.PI * 2, false);
      return this.context.fill();
    }
  };

  Screen.prototype.drawRect = function(x, y, w, h, color) {
    this.setColor(color);
    this.context.globalAlpha = this.alpha;
    this.context.lineWidth = this.line_width;
    if (this.initDrawOp(x, -y)) {
      this.context.strokeRect(-w / 2 - this.anchor_x * w / 2, -h / 2 + this.anchor_y * h / 2, w, h);
      return this.closeDrawOp(x, -y);
    } else {
      return this.context.strokeRect(x - w / 2 - this.anchor_x * w / 2, -y - h / 2 + this.anchor_y * h / 2, w, h);
    }
  };

  Screen.prototype.drawRoundRect = function(x, y, w, h, round, color) {
    if (round == null) {
      round = 10;
    }
    this.setColor(color);
    this.context.globalAlpha = this.alpha;
    this.context.lineWidth = this.line_width;
    if (this.initDrawOp(x, -y)) {
      this.context.strokeRoundRect(-w / 2 - this.anchor_x * w / 2, -h / 2 + this.anchor_y * h / 2, w, h, round);
      return this.closeDrawOp(x, -y);
    } else {
      return this.context.strokeRoundRect(x - w / 2 - this.anchor_x * w / 2, -y - h / 2 + this.anchor_y * h / 2, w, h, round);
    }
  };

  Screen.prototype.drawRound = function(x, y, w, h, color) {
    this.setColor(color);
    this.context.globalAlpha = this.alpha;
    this.context.lineWidth = this.line_width;
    w = Math.abs(w);
    h = Math.abs(h);
    if (this.initDrawOp(x, -y)) {
      this.context.beginPath();
      this.context.ellipse(0 - this.anchor_x * w / 2, 0 + this.anchor_y * h / 2, w / 2, h / 2, 0, 0, Math.PI * 2, false);
      this.context.stroke();
      return this.closeDrawOp(x, -y);
    } else {
      this.context.beginPath();
      this.context.ellipse(x - this.anchor_x * w / 2, -y + this.anchor_y * h / 2, w / 2, h / 2, 0, 0, Math.PI * 2, false);
      return this.context.stroke();
    }
  };

  Screen.prototype.drawLine = function(x1, y1, x2, y2, color) {
    var transform;
    this.setColor(color);
    this.context.globalAlpha = this.alpha;
    this.context.lineWidth = this.line_width;
    transform = this.initDrawOp(0, 0);
    this.context.beginPath();
    this.context.moveTo(x1, -y1);
    this.context.lineTo(x2, -y2);
    this.context.stroke();
    if (transform) {
      return this.closeDrawOp();
    }
  };

  Screen.prototype.drawPolyline = function(args) {
    var i, j, len, ref, transform;
    if (args.length > 0 && args.length % 2 === 1 && typeof args[args.length - 1] === "string") {
      this.setColor(args[args.length - 1]);
    }
    if (Array.isArray(args[0])) {
      if ((args[1] != null) && typeof args[1] === "string") {
        this.setColor(args[1]);
      }
      args = args[0];
    }
    this.context.globalAlpha = this.alpha;
    this.context.lineWidth = this.line_width;
    if (args.length < 4) {
      return;
    }
    len = Math.floor(args.length / 2);
    transform = this.initDrawOp(0, 0);
    this.context.beginPath();
    this.context.moveTo(args[0], -args[1]);
    for (i = j = 1, ref = len - 1; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
      this.context.lineTo(args[i * 2], -args[i * 2 + 1]);
    }
    this.context.stroke();
    if (transform) {
      return this.closeDrawOp();
    }
  };

  Screen.prototype.drawPolygon = function(args) {
    var i, j, len, ref, transform;
    if (args.length > 0 && args.length % 2 === 1 && typeof args[args.length - 1] === "string") {
      this.setColor(args[args.length - 1]);
    }
    if (Array.isArray(args[0])) {
      if ((args[1] != null) && typeof args[1] === "string") {
        this.setColor(args[1]);
      }
      args = args[0];
    }
    this.context.globalAlpha = this.alpha;
    this.context.lineWidth = this.line_width;
    if (args.length < 4) {
      return;
    }
    len = Math.floor(args.length / 2);
    transform = this.initDrawOp(0, 0);
    this.context.beginPath();
    this.context.moveTo(args[0], -args[1]);
    for (i = j = 1, ref = len - 1; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
      this.context.lineTo(args[i * 2], -args[i * 2 + 1]);
    }
    this.context.closePath();
    this.context.stroke();
    if (transform) {
      return this.closeDrawOp();
    }
  };

  Screen.prototype.fillPolygon = function(args) {
    var i, j, len, ref, transform;
    if (args.length > 0 && args.length % 2 === 1 && typeof args[args.length - 1] === "string") {
      this.setColor(args[args.length - 1]);
    }
    if (Array.isArray(args[0])) {
      if ((args[1] != null) && typeof args[1] === "string") {
        this.setColor(args[1]);
      }
      args = args[0];
    }
    this.context.globalAlpha = this.alpha;
    this.context.lineWidth = this.line_width;
    if (args.length < 4) {
      return;
    }
    len = Math.floor(args.length / 2);
    transform = this.initDrawOp(0, 0);
    this.context.beginPath();
    this.context.moveTo(args[0], -args[1]);
    for (i = j = 1, ref = len - 1; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
      this.context.lineTo(args[i * 2], -args[i * 2 + 1]);
    }
    this.context.fill();
    if (transform) {
      return this.closeDrawOp();
    }
  };

  Screen.prototype.textWidth = function(text, size) {
    this.context.font = size + "pt " + this.font;
    return this.context.measureText(text).width;
  };

  Screen.prototype.drawText = function(text, x, y, size, color) {
    var h, w;
    this.setColor(color);
    this.context.globalAlpha = this.alpha;
    this.context.font = size + "pt " + this.font;
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    w = this.context.measureText(text).width;
    h = size;
    if (this.initDrawOp(x, -y)) {
      this.context.fillText(text, 0 - this.anchor_x * w / 2, 0 + this.anchor_y * h / 2);
      return this.closeDrawOp(x, -y);
    } else {
      return this.context.fillText(text, x - this.anchor_x * w / 2, -y + this.anchor_y * h / 2);
    }
  };

  Screen.prototype.drawTextOutline = function(text, x, y, size, color) {
    var h, w;
    this.setColor(color);
    this.context.globalAlpha = this.alpha;
    this.context.font = size + "pt " + this.font;
    this.context.lineWidth = this.line_width;
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    w = this.context.measureText(text).width;
    h = size;
    if (this.initDrawOp(x, -y)) {
      this.context.strokeText(text, 0 - this.anchor_x * w / 2, 0 + this.anchor_y * h / 2);
      return this.closeDrawOp(x, -y);
    } else {
      return this.context.strokeText(text, x - this.anchor_x * w / 2, -y + this.anchor_y * h / 2);
    }
  };

  Screen.prototype.getSpriteFrame = function(sprite) {
    var dt, frame, s;
    frame = null;
    if (typeof sprite === "string") {
      s = this.runtime.sprites[sprite];
      if (s != null) {
        sprite = s;
      } else {
        s = sprite.split(".");
        if (s.length > 1) {
          sprite = this.runtime.sprites[s[0]];
          frame = s[1] | 0;
        }
      }
    }
    if ((sprite == null) || !sprite.ready) {
      return null;
    }
    if (sprite.frames.length > 1) {
      if (frame == null) {
        dt = 1000 / sprite.fps;
        frame = Math.floor((Date.now() - sprite.animation_start) / dt) % sprite.frames.length;
      }
      if (frame >= 0 && frame < sprite.frames.length) {
        return sprite.frames[frame].canvas;
      } else {
        return sprite.frames[0].canvas;
      }
    } else if (sprite.frames[0] != null) {
      return sprite.frames[0].canvas;
    } else {
      return null;
    }
  };

  Screen.prototype.drawSprite = function(sprite, x, y, w, h) {
    var canvas;
    canvas = this.getSpriteFrame(sprite);
    if (canvas == null) {
      return;
    }
    if (!h) {
      h = w / canvas.width * canvas.height;
    }
    this.context.globalAlpha = this.alpha;
    this.context.imageSmoothingEnabled = false;
    if (this.initDrawOp(x, -y)) {
      this.context.drawImage(canvas, -w / 2 - this.anchor_x * w / 2, -h / 2 + this.anchor_y * h / 2, w, h);
      return this.closeDrawOp(x, -y);
    } else {
      return this.context.drawImage(canvas, x - w / 2 - this.anchor_x * w / 2, -y - h / 2 + this.anchor_y * h / 2, w, h);
    }
  };

  Screen.prototype.drawSpritePart = function(sprite, sx, sy, sw, sh, x, y, w, h) {
    var canvas;
    canvas = this.getSpriteFrame(sprite);
    if (canvas == null) {
      return;
    }
    if (!h) {
      h = w / sw * sh;
    }
    this.context.globalAlpha = this.alpha;
    this.context.imageSmoothingEnabled = false;
    if (this.initDrawOp(x, -y)) {
      this.context.drawImage(canvas, sx, sy, sw, sh, -w / 2 - this.anchor_x * w / 2, -h / 2 + this.anchor_y * h / 2, w, h);
      return this.closeDrawOp(x, -y);
    } else {
      return this.context.drawImage(canvas, sx, sy, sw, sh, x - w / 2 - this.anchor_x * w / 2, -y - h / 2 + this.anchor_y * h / 2, w, h);
    }
  };

  Screen.prototype.drawMap = function(map, x, y, w, h) {
    if (typeof map === "string") {
      map = this.runtime.maps[map];
    }
    if ((map == null) || !map.ready || (map.canvas == null)) {
      return;
    }
    this.context.globalAlpha = this.alpha;
    this.context.imageSmoothingEnabled = false;
    if (this.initDrawOp(x, -y)) {
      this.context.drawImage(map.getCanvas(), -w / 2 - this.anchor_x * w / 2, -h / 2 + this.anchor_y * h / 2, w, h);
      return this.closeDrawOp(x, -y);
    } else {
      return this.context.drawImage(map.getCanvas(), x - w / 2 - this.anchor_x * w / 2, -y - h / 2 + this.anchor_y * h / 2, w, h);
    }
  };

  Screen.prototype.resize = function() {
    var backingStoreRatio, ch, cw, devicePixelRatio, h, min, r, ratio, w;
    cw = window.innerWidth;
    ch = window.innerHeight;
    ratio = {
      "4x3": 4 / 3,
      "16x9": 16 / 9,
      "2x1": 2 / 1,
      "1x1": 1 / 1,
      ">4x3": 4 / 3,
      ">16x9": 16 / 9,
      ">2x1": 2 / 1,
      ">1x1": 1 / 1
    }[this.runtime.aspect];
    min = this.runtime.aspect.startsWith(">");
    if (ratio != null) {
      if (min) {
        switch (this.runtime.orientation) {
          case "portrait":
            ratio = Math.max(ratio, ch / cw);
            break;
          case "landscape":
            ratio = Math.max(ratio, cw / ch);
            break;
          default:
            if (ch > cw) {
              ratio = Math.max(ratio, ch / cw);
            } else {
              ratio = Math.max(ratio, cw / ch);
            }
        }
      }
      switch (this.runtime.orientation) {
        case "portrait":
          r = Math.min(cw, ch / ratio) / cw;
          w = cw * r;
          h = cw * r * ratio;
          break;
        case "landscape":
          r = Math.min(cw / ratio, ch) / ch;
          w = ch * r * ratio;
          h = ch * r;
          break;
        default:
          if (cw > ch) {
            r = Math.min(cw / ratio, ch) / ch;
            w = ch * r * ratio;
            h = ch * r;
          } else {
            r = Math.min(cw, ch / ratio) / cw;
            w = cw * r;
            h = cw * r * ratio;
          }
      }
    } else {
      w = cw;
      h = ch;
    }
    this.canvas.style["margin-top"] = Math.round((ch - h) / 2) + "px";
    this.canvas.style.width = Math.round(w) + "px";
    this.canvas.style.height = Math.round(h) + "px";
    devicePixelRatio = window.devicePixelRatio || 1;
    backingStoreRatio = this.context.webkitBackingStorePixelRatio || this.context.mozBackingStorePixelRatio || this.context.msBackingStorePixelRatio || this.context.oBackingStorePixelRatio || this.context.backingStorePixelRatio || 1;
    this.ratio = devicePixelRatio / backingStoreRatio * Math.max(1, Math.min(2, this.supersampling));
    this.width = w * this.ratio;
    this.height = h * this.ratio;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    return this.initContext();
  };

  Screen.prototype.startControl = function(element) {
    var backingStoreRatio, devicePixelRatio;
    this.element = element;
    document.addEventListener("touchstart", (function(_this) {
      return function(event) {
        return _this.touchStart(event);
      };
    })(this));
    document.addEventListener("touchmove", (function(_this) {
      return function(event) {
        return _this.touchMove(event);
      };
    })(this));
    document.addEventListener("touchend", (function(_this) {
      return function(event) {
        return _this.touchRelease(event);
      };
    })(this));
    document.addEventListener("touchcancel", (function(_this) {
      return function(event) {
        return _this.touchRelease(event);
      };
    })(this));
    document.addEventListener("mousedown", (function(_this) {
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
    devicePixelRatio = window.devicePixelRatio || 1;
    backingStoreRatio = this.context.webkitBackingStorePixelRatio || this.context.mozBackingStorePixelRatio || this.context.msBackingStorePixelRatio || this.context.oBackingStorePixelRatio || this.context.backingStorePixelRatio || 1;
    return this.ratio = devicePixelRatio / backingStoreRatio;
  };

  Screen.prototype.touchStart = function(event) {
    var b, i, j, min, ref, t, x, y;
    event.preventDefault();
    event.stopPropagation();
    b = this.canvas.getBoundingClientRect();
    for (i = j = 0, ref = event.changedTouches.length - 1; j <= ref; i = j += 1) {
      t = event.changedTouches[i];
      min = Math.min(this.canvas.clientWidth, this.canvas.clientHeight);
      x = (t.clientX - b.left - this.canvas.clientWidth / 2) / min * 200;
      y = (this.canvas.clientHeight / 2 - (t.clientY - b.top)) / min * 200;
      this.touches[t.identifier] = {
        x: x,
        y: y
      };
      this.mouse.x = x;
      this.mouse.y = y;
      this.mouse.pressed = 1;
      this.mouse.left = 1;
    }
    return false;
  };

  Screen.prototype.touchMove = function(event) {
    var b, i, j, min, ref, t, x, y;
    event.preventDefault();
    event.stopPropagation();
    b = this.canvas.getBoundingClientRect();
    for (i = j = 0, ref = event.changedTouches.length - 1; j <= ref; i = j += 1) {
      t = event.changedTouches[i];
      if (this.touches[t.identifier] != null) {
        min = Math.min(this.canvas.clientWidth, this.canvas.clientHeight);
        x = (t.clientX - b.left - this.canvas.clientWidth / 2) / min * 200;
        y = (this.canvas.clientHeight / 2 - (t.clientY - b.top)) / min * 200;
        this.touches[t.identifier].x = x;
        this.touches[t.identifier].y = y;
        this.mouse.x = x;
        this.mouse.y = y;
      }
    }
    return false;
  };

  Screen.prototype.touchRelease = function(event) {
    var i, j, ref, t, x, y;
    for (i = j = 0, ref = event.changedTouches.length - 1; j <= ref; i = j += 1) {
      t = event.changedTouches[i];
      x = (t.clientX - this.canvas.offsetLeft) * this.ratio;
      y = (t.clientY - this.canvas.offsetTop) * this.ratio;
      delete this.touches[t.identifier];
      this.mouse.pressed = 0;
      this.mouse.left = 0;
      this.mouse.right = 0;
      this.mouse.middle = 0;
    }
    return false;
  };

  Screen.prototype.mouseDown = function(event) {
    var b, min, x, y;
    this.mousepressed = true;
    b = this.canvas.getBoundingClientRect();
    min = Math.min(this.canvas.clientWidth, this.canvas.clientHeight);
    x = (event.clientX - b.left - this.canvas.clientWidth / 2) / min * 200;
    y = (this.canvas.clientHeight / 2 - (event.clientY - b.top)) / min * 200;
    this.touches["mouse"] = {
      x: x,
      y: y
    };
    this.mouse.x = x;
    this.mouse.y = y;
    switch (event.button) {
      case 0:
        this.mouse.left = 1;
        break;
      case 1:
        this.mouse.middle = 1;
        break;
      case 2:
        this.mouse.right = 1;
    }
    this.mouse.pressed = Math.min(1, this.mouse.left + this.mouse.right + this.mouse.middle);
    return false;
  };

  Screen.prototype.mouseMove = function(event) {
    var b, min, x, y;
    event.preventDefault();
    b = this.canvas.getBoundingClientRect();
    min = Math.min(this.canvas.clientWidth, this.canvas.clientHeight);
    x = (event.clientX - b.left - this.canvas.clientWidth / 2) / min * 200;
    y = (this.canvas.clientHeight / 2 - (event.clientY - b.top)) / min * 200;
    if (this.touches["mouse"] != null) {
      this.touches["mouse"].x = x;
      this.touches["mouse"].y = y;
    }
    this.mouse.x = x;
    this.mouse.y = y;
    return false;
  };

  Screen.prototype.mouseUp = function(event) {
    var b, min, x, y;
    delete this.touches["mouse"];
    b = this.canvas.getBoundingClientRect();
    min = Math.min(this.canvas.clientWidth, this.canvas.clientHeight);
    x = (event.clientX - b.left - this.canvas.clientWidth / 2) / min * 200;
    y = (this.canvas.clientHeight / 2 - (event.clientY - b.top)) / min * 200;
    this.mouse.x = x;
    this.mouse.y = y;
    switch (event.button) {
      case 0:
        this.mouse.left = 0;
        break;
      case 1:
        this.mouse.middle = 0;
        break;
      case 2:
        this.mouse.right = 0;
    }
    this.mouse.pressed = Math.min(1, this.mouse.left + this.mouse.right + this.mouse.middle);
    return false;
  };

  Screen.prototype.takePicture = function(callback) {
    return callback(this.canvas.toDataURL());
  };

  return Screen;

})();
