this.MapView = (function() {
  function MapView(editor) {
    this.editor = editor;
    this.canvas = document.createElement("canvas");
    this.canvas.width = 400;
    this.canvas.height = 400;
    this.map = new MicroMap(24, 16, 16, 16, {});
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
    this.canvas.addEventListener("contextmenu", (function(_this) {
      return function(event) {
        return event.preventDefault();
      };
    })(this));
    window.addEventListener("resize", (function(_this) {
      return function() {
        return _this.windowResized();
      };
    })(this));
    this.editable = false;
    this.sprite = "icon";
  }

  MapView.prototype.setSprite = function(sprite) {
    this.sprite = sprite;
  };

  MapView.prototype.windowResized = function() {
    var c, h, height, ratio, w, width;
    c = this.canvas.parentElement;
    if (c == null) {
      return;
    }
    if (c.clientWidth <= 0) {
      return;
    }
    w = c.clientWidth - 40;
    h = c.clientHeight - 40;
    width = this.map.width * this.map.block_width;
    height = this.map.height * this.map.block_height;
    ratio = Math.min(w / width, h / height);
    w = Math.floor(ratio * width);
    h = Math.floor(ratio * height);
    if (w !== this.canvas.width || h !== this.canvas.height) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.update();
    }
    h = (c.clientHeight - h) / 2;
    return this.canvas.style["margin-top"] = h + "px";
  };

  MapView.prototype.update = function() {
    var c, context, hblock, i, k, l, m, n, ref, ref1, ref2, ref3, th, tw, underlay, wblock;
    context = this.canvas.getContext("2d");
    if (this.editor.background_color_picker != null) {
      c = this.editor.background_color_picker.color;
      context.fillStyle = c;
    } else {
      context.fillStyle = "#000";
    }
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    context.imageSmoothingEnabled = false;
    if (this.editor.map_underlay != null) {
      underlay = this.editor.app.project.getMap(this.editor.map_underlay);
      if (underlay != null) {
        underlay.update();
        context.globalAlpha = .3;
        context.drawImage(underlay.getCanvas(), 0, 0, this.canvas.width, this.canvas.height);
        context.globalAlpha = 1;
      }
    }
    wblock = this.canvas.width / this.map.width;
    hblock = this.canvas.height / this.map.height;
    context.lineWidth = 1;
    context.strokeStyle = "rgba(0,0,0,.1)";
    for (i = k = 0, ref = this.map.width; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
      context.beginPath();
      context.moveTo(i * wblock + .25, 0);
      context.lineTo(i * wblock + .5, this.canvas.height);
      context.stroke();
    }
    for (i = l = 0, ref1 = this.map.height; 0 <= ref1 ? l <= ref1 : l >= ref1; i = 0 <= ref1 ? ++l : --l) {
      context.beginPath();
      context.moveTo(0, i * hblock + .25);
      context.lineTo(this.canvas.width, i * hblock + .5);
      context.stroke();
    }
    context.strokeStyle = "rgba(255,255,255,.1)";
    for (i = m = 0, ref2 = this.map.width; 0 <= ref2 ? m <= ref2 : m >= ref2; i = 0 <= ref2 ? ++m : --m) {
      context.beginPath();
      context.moveTo(i * wblock - .25, 0);
      context.lineTo(i * wblock - .25, this.canvas.height);
      context.stroke();
    }
    for (i = n = 0, ref3 = this.map.height; 0 <= ref3 ? n <= ref3 : n >= ref3; i = 0 <= ref3 ? ++n : --n) {
      context.beginPath();
      context.moveTo(0, i * hblock - .25);
      context.lineTo(this.canvas.width, i * hblock - .25);
      context.stroke();
    }
    this.map.update();
    context.drawImage(this.map.getCanvas(), 0, 0, this.canvas.width, this.canvas.height);
    if (this.mouse_over) {
      tw = 1;
      th = 1;
      if (this.editor.tilepicker.selection != null) {
        tw = this.editor.tilepicker.selection.w;
        th = this.editor.tilepicker.selection.h;
      }
      context.strokeStyle = "#000";
      context.lineWidth = 4;
      context.beginPath();
      context.rect(this.mouse_x * wblock, this.mouse_y * hblock, wblock * tw, hblock * th);
      context.stroke();
      context.strokeStyle = "#FFF";
      context.lineWidth = 3;
      return context.stroke();
    }
  };

  MapView.prototype.mouseDown = function(event) {
    if (!this.editable) {
      return;
    }
    this.mousepressed = true;
    this.mode = event.button === 2 ? "erase" : "draw";
    if (this.map.undo == null) {
      this.map.undo = new Undo();
    }
    if (this.map.undo.empty()) {
      this.map.undo.pushState(this.map.clone());
    }
    return this.mouseMove(event);
  };

  MapView.prototype.mouseMove = function(event) {
    var b, i, j, k, l, min, ref, ref1, s, sel, x, y;
    if (!this.editable) {
      return;
    }
    b = this.canvas.getBoundingClientRect();
    min = Math.min(this.canvas.clientWidth, this.canvas.clientHeight);
    x = event.clientX - b.left;
    y = event.clientY - b.top;
    x = Math.floor(x / this.canvas.width * this.map.width);
    y = Math.floor(y / this.canvas.height * this.map.height);
    this.mouse_over = true;
    if (x !== this.mouse_x || y !== this.mouse_y) {
      this.mouse_x = x;
      this.mouse_y = y;
      this.update();
      this.editor.setCoordinates(x, this.map.height - 1 - y);
    }
    if (this.mousepressed) {
      if ((this.editor.tilepicker.selection != null) && this.mode === "draw") {
        sel = this.editor.tilepicker.selection;
        for (i = k = 0, ref = sel.w - 1; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
          for (j = l = 0, ref1 = sel.h - 1; 0 <= ref1 ? l <= ref1 : l >= ref1; j = 0 <= ref1 ? ++l : --l) {
            s = this.sprite + ":" + (sel.x + i) + "," + (sel.y + j);
            this.map.set(x + i, this.map.height - 1 - y - j, s);
          }
        }
      } else {
        this.map.set(x, this.map.height - 1 - y, this.mode === "draw" ? this.sprite : null);
      }
      this.update();
      this.editor.mapChanged();
    }
    return false;
  };

  MapView.prototype.mouseUp = function(event) {
    if (this.mousepressed) {
      this.map.undo.pushState(this.map.clone());
    }
    return this.mousepressed = false;
  };

  MapView.prototype.mouseOut = function(event) {
    this.mouse_over = false;
    this.update();
    return this.editor.setCoordinates(-1, -1);
  };

  MapView.prototype.setMap = function(map) {
    this.map = map;
    this.windowResized();
    return this.update();
  };

  return MapView;

})();
