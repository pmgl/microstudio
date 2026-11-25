this.SpriteView = class SpriteView {
  constructor(editor) {
    this.editor = editor;
    this.canvas = document.querySelector("#spriteeditor canvas");
    this.sprite = new Sprite(32, 32);
    this.viewport = new CanvasViewport(document.getElementById("spriteeditor"), this.canvas, this);
    this.canvas.addEventListener("touchstart", (event) => {
      if ((event.touches != null) && (event.touches[0] != null)) {
        event.preventDefault(); // prevents a mousedown event from being triggered
        event.touches[0].stopPropagation = function() {
          return event.stopPropagation();
        };
        return this.mouseDown(event.touches[0]);
      }
    });
    document.addEventListener("touchmove", (event) => {
      if ((event.touches != null) && (event.touches[0] != null)) {
        return this.mouseMove(event.touches[0]);
      }
    });
    document.addEventListener("touchend", (event) => {
      return this.mouseUp();
    });
    this.canvas.addEventListener("touchcancel", (event) => {
      return this.mouseOut();
    });
    this.canvas.addEventListener("mousedown", (event) => {
      return this.mouseDown(event);
    });
    document.addEventListener("mousemove", (event) => {
      return this.mouseMove(event);
    });
    this.canvas.addEventListener("mouseout", (event) => {
      return this.mouseOut(event);
    });
    document.addEventListener("mouseup", (event) => {
      return this.mouseUp(event);
    });
    this.canvas.addEventListener("contextmenu", (event) => {
      return event.preventDefault();
    });
    this.canvas.addEventListener("mouseenter", (event) => {
      return this.mouseEnter(event);
    });
    this.brush_opacity = 1;
    this.brush_type = "paint";
    this.brush_size = 1;
    this.mouse_over = false;
    this.mouse_x = 0;
    this.mouse_y = 0;
    this.pixels_drawn = 0;
    window.addEventListener("resize", () => {
      return this.windowResized();
    });
    this.editable = false;
    this.tile = false;
    this.vsymmetry = false;
    this.hsymmetry = false;
    document.getElementById("spriteeditor").addEventListener("keydown", (e) => {
      if (e.keyCode === 18) { // Alt
        return document.getElementById("selection-hint-clone").classList.add("active");
      } else if (e.keyCode === 16) { // Shift
        return document.getElementById("selection-hint-move").classList.add("active");
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.keyCode === 18) { // Alt
        return document.getElementById("selection-hint-clone").classList.remove("active");
      } else if (e.keyCode === 16) { // Shift
        return document.getElementById("selection-hint-move").classList.remove("active");
      }
    });
    document.getElementById("sprite-zoom-plus").addEventListener("click", () => {
      return this.viewport.zoomBy(1.25);
    });
    document.getElementById("sprite-zoom-minus").addEventListener("click", () => {
      return this.viewport.zoomBy(1 / 1.25);
    });
    document.getElementById("sprite-zoom-fit").addEventListener("click", () => {
      this.viewport.fit();
      return this.viewChanged();
    });
  }

  setSprite(sprite) {
    if (sprite !== this.sprite) {
      if (this.sprite != null) {
        this.saveZoom();
        this.sprite.selection = this.selection;
      }
      this.sprite = sprite;
      this.restoreZoom();
      this.selection = this.sprite.selection || null;
      return this.floating_selection = null;
    }
  }

  setCurrentFrame(index) {
    if (index !== this.sprite.current_frame) {
      this.sprite.setCurrentFrame(index);
      return this.selection = null;
    }
  }

  getFrame() {
    return this.sprite.frames[this.sprite.current_frame];
  }

  saveZoom() {
    if ((this.sprite != null) && this.viewport.width > 0) {
      this.sprite.zoom = this.viewport.getState();
      return this.sprite.zoom.key = this.content_key;
    }
  }

  restoreZoom() {
    if (this.sprite.zoom != null) {
      this.viewport.setState(this.sprite.zoom);
      return this.content_key = this.sprite.zoom.key;
    } else {
      return this.content_key = null;
    }
  }

  getContentKey() {
    return `${this.sprite.width},${this.sprite.height},${this.tile}`;
  }

  updateContent() {
    var h, key, w;
    w = this.sprite.width;
    h = this.sprite.height;
    if (this.tile) {
      this.viewport.setContent(-w / 2, -h / 2, w * 2, h * 2);
    } else {
      this.viewport.setContent(0, 0, w, h);
    }
    key = this.getContentKey();
    if (key !== this.content_key) {
      this.content_key = key;
      return this.viewport.fit();
    }
  }

  viewChanged() {
    var pos;
    if ((this.last_mouse_event != null) && !this.mousepressed) {
      pos = this.getMousePosition(this.last_mouse_event);
      this.mouse_x = pos.x;
      this.mouse_y = pos.y;
      this.mouse_over = pos.inside;
    }
    return this.update();
  }

  updateGrabInfo() {
    if (this.viewport.isZoomedIn()) {
      return document.getElementById("sprite-grab-info").style.display = "inline-block";
    } else {
      return document.getElementById("sprite-grab-info").style.display = "none";
    }
  }

  updateCursor() {
    var cursor;
    if (this.viewport.space_pressed) {
      document.getElementById("sprite-grab-info").classList.add("active");
    } else {
      document.getElementById("sprite-grab-info").classList.remove("active");
    }
    cursor = this.viewport.getCursor();
    if (cursor != null) {
      return this.canvas.style.cursor = cursor;
    } else if (this.editor.tool.selectiontool && this.isInSelection(this.mouse_x, this.mouse_y)) {
      return this.canvas.style.cursor = "move";
    } else if (this.colorpicker && !this.editor.tool.selectiontool) {
      return this.canvas.style.cursor = "url( '/img/eyedropper.svg' ) 0 24, pointer";
    } else {
      return this.canvas.style.cursor = "crosshair";
    }
  }

  isInSelection(x, y) {
    return (this.selection != null) && x >= this.selection.x && y >= this.selection.y && x < this.selection.x + this.selection.w && y < this.selection.y + this.selection.h;
  }

  getPattern(context) {
    var c, ctx, data, i, k, l, line, ref, ref1, value;
    if (this.pattern == null) {
      c = document.createElement("canvas");
      c.width = 64;
      c.height = 64;
      ctx = c.getContext("2d");
      data = ctx.getImageData(0, 0, c.width, 1);
      for (line = k = 0, ref = c.height - 1; k <= ref; line = k += 1) {
        for (i = l = 0, ref1 = c.width - 1; l <= ref1; i = l += 1) {
          value = 128 + Math.random() * 64 - 32;
          data.data[i * 4] = value;
          data.data[i * 4 + 1] = value;
          data.data[i * 4 + 2] = value;
          data.data[i * 4 + 3] = 64;
        }
        ctx.putImageData(data, 0, line);
      }
      this.pattern = context.createPattern(c, "repeat");
    }
    return this.pattern;
  }

  getBackgroundColor() {
    if ((this.editor.background_color_picker != null) && typeof this.editor.background_color_picker.color === "string") {
      return this.editor.background_color_picker.color;
    } else {
      return "#000";
    }
  }

  updateBackgroundColor() {
    return this.update();
  }

  setColor(color) {
    this.color = color;
  }

  windowResized() {
    return this.update();
  }

  showBrushSize() {
    this.show_brush_size = Date.now() + 2000;
    return this.update();
  }

  drawFrame(context, frame) {
    var h, i, j, k, results, w;
    if (frame.canvas == null) {
      return;
    }
    w = this.sprite.width;
    h = this.sprite.height;
    if (this.tile) {
      results = [];
      for (i = k = -1; k <= 1; i = k += 1) {
        results.push((function() {
          var l, results1;
          results1 = [];
          for (j = l = -1; l <= 1; j = l += 1) {
            results1.push(context.drawImage(frame.canvas, i * w, j * h, w, h));
          }
          return results1;
        })());
      }
      return results;
    } else {
      return context.drawImage(frame.canvas, 0, 0, w, h);
    }
  }

  drawGrid(context, ax, ay, aw, ah) {
    var i, i0, i1, j, j0, j1, k, l, lw, modulo, ref, ref1, ref2, ref3, v, x, x0, x1, y, y0, y1;
    v = this.viewport;
    if (v.zoom < 4) {
      return;
    }
    modulo = this.sprite.width % 8 === 0 ? 8 : 10;
    x0 = v.screenX(ax);
    y0 = v.screenY(ay);
    x1 = v.screenX(ax + aw);
    y1 = v.screenY(ay + ah);
    i0 = Math.max(Math.ceil(ax), Math.floor(v.worldLeft()));
    i1 = Math.min(Math.floor(ax + aw), Math.ceil(v.worldRight()));
    j0 = Math.max(Math.ceil(ay), Math.floor(v.worldTop()));
    j1 = Math.min(Math.floor(ay + ah), Math.ceil(v.worldBottom()));
    for (i = k = ref = i0, ref1 = i1; k <= ref1; i = k += 1) {
      lw = (i % modulo + modulo) % modulo === 0 ? 2 : 1;
      x = Math.round(v.screenX(i));
      context.fillStyle = "rgba(0,0,0,.1)";
      context.fillRect(x, y0, lw, y1 - y0);
      context.fillStyle = "rgba(255,255,255,.1)";
      context.fillRect(x - lw, y0, lw, y1 - y0);
    }
    for (j = l = ref2 = j0, ref3 = j1; l <= ref3; j = l += 1) {
      lw = (j % modulo + modulo) % modulo === 0 ? 2 : 1;
      y = Math.round(v.screenY(j));
      context.fillStyle = "rgba(0,0,0,.1)";
      context.fillRect(x0, y, x1 - x0, lw);
      context.fillStyle = "rgba(255,255,255,.1)";
      context.fillRect(x0, y - lw, x1 - x0, lw);
    }
  }

  update() {
    var ah, aw, ax, ay, bs, context, d, f, grd, h, mx, my, sh, sw, sx, sy, tx, ty, v, w, x, x0, x1, y, y0, y1, z;
    if (!this.viewport.resize()) {
      return;
    }
    this.updateContent();
    this.updateGrabInfo();
    this.brush_size = this.editor.tool.getSize(this.sprite);
    v = this.viewport;
    z = v.zoom;
    context = this.canvas.getContext("2d");
    v.resetTransform(context);
    context.clearRect(0, 0, v.width, v.height);
    context.imageSmoothingEnabled = false;
    w = this.sprite.width;
    h = this.sprite.height;
    if (this.tile) {
      ax = -w / 2;
      ay = -h / 2;
      aw = w * 2;
      ah = h * 2;
    } else {
      ax = 0;
      ay = 0;
      aw = w;
      ah = h;
    }
    x0 = v.screenX(ax);
    y0 = v.screenY(ay);
    x1 = v.screenX(ax + aw);
    y1 = v.screenY(ay + ah);
    context.save();
    context.shadowBlur = 20;
    context.shadowColor = "#000";
    context.fillStyle = this.getBackgroundColor();
    context.fillRect(x0, y0, x1 - x0, y1 - y0);
    context.restore();
    context.save();
    context.translate(x0, y0);
    context.fillStyle = this.getPattern(context);
    context.fillRect(0, 0, x1 - x0, y1 - y0);
    context.restore();
    context.save();
    context.beginPath();
    context.rect(x0, y0, x1 - x0, y1 - y0);
    context.clip();
    v.setTransform(context);
    if (this.sprite.frames.length > 1) {
      f = this.sprite.frames[(this.sprite.current_frame + this.sprite.frames.length - 1) % this.sprite.frames.length];
      context.globalAlpha = .2;
      this.drawFrame(context, f);
      context.globalAlpha = 1;
    }
    this.drawFrame(context, this.getFrame());
    context.restore();
    this.drawGrid(context, ax, ay, aw, ah);
    if ((this.mouse_over || Date.now() < this.show_brush_size) && this.canvas.style.cursor !== "move" && (v.getCursor() == null)) {
      if (Date.now() < this.show_brush_size) {
        mx = Math.floor(this.sprite.width / 2 - 1);
        my = Math.floor(this.sprite.height / 2 - 1);
      } else {
        mx = this.mouse_x;
        my = this.mouse_y;
      }
      bs = Math.floor((this.brush_size - 1) / 2);
      context.strokeStyle = "#000";
      context.lineWidth = 4;
      context.beginPath();
      if (this.editor.tool.shape === "round") {
        d = this.brush_size % 2 ? 0 : .5;
        context.ellipse(v.screenX(mx + .5 + d), v.screenY(my + .5 + d), z * this.brush_size / 2, z * this.brush_size / 2, 0, 0, Math.PI * 2, true);
      } else {
        context.rect(v.screenX(mx - bs), v.screenY(my - bs), z * this.brush_size, z * this.brush_size);
      }
      context.stroke();
      context.strokeStyle = "#FFF";
      context.lineWidth = 3;
      context.stroke();
    }
    if (this.tile) {
      grd = context.createLinearGradient(x0, 0, x1, 0);
      grd.addColorStop(0, "rgba(0,0,0,1)");
      grd.addColorStop(.25, "rgba(0,0,0,0)");
      grd.addColorStop(.75, "rgba(0,0,0,0)");
      grd.addColorStop(1, "rgba(0,0,0,1)");
      context.fillStyle = grd;
      context.fillRect(x0, y0, x1 - x0, y1 - y0);
      grd = context.createLinearGradient(0, y0, 0, y1);
      grd.addColorStop(0, "rgba(0,0,0,1)");
      grd.addColorStop(.25, "rgba(0,0,0,0)");
      grd.addColorStop(.75, "rgba(0,0,0,0)");
      grd.addColorStop(1, "rgba(0,0,0,1)");
      context.fillStyle = grd;
      context.fillRect(x0, y0, x1 - x0, y1 - y0);
      tx = v.screenX(0);
      ty = v.screenY(0);
      context.lineWidth = 1;
      context.strokeStyle = "rgba(0,0,0,.5)";
      context.strokeRect(tx + .5, ty + .5, w * z, h * z);
      context.strokeStyle = "rgba(255,255,255,.5)";
      context.strokeRect(tx - .5, ty - .5, w * z, h * z);
    }
    if (this.hsymmetry) {
      y = v.screenY(h / 2);
      context.fillStyle = "rgba(0,0,0,.5)";
      context.fillRect(x0, y - 2, x1 - x0, 4);
      context.fillStyle = "rgba(255,255,255,.5)";
      context.fillRect(x0, y - 1.5, x1 - x0, 3);
    }
    if (this.vsymmetry) {
      x = v.screenX(w / 2);
      context.fillStyle = "rgba(0,0,0,.5)";
      context.fillRect(x - 2, y0, 4, y1 - y0);
      context.fillStyle = "rgba(255,255,255,.5)";
      context.fillRect(x - 1.5, y0, 3, y1 - y0);
    }
    if ((this.selection != null) && this.editor.tool.selectiontool) {
      sx = v.screenX(this.selection.x);
      sy = v.screenY(this.selection.y);
      sw = this.selection.w * z;
      sh = this.selection.h * z;
      context.save();
      context.strokeStyle = "rgba(0,0,0,.5)";
      context.lineWidth = 3;
      context.strokeRect(sx, sy, sw, sh);
      context.setLineDash([4, 4]);
      context.strokeStyle = this.floating_selection ? "#FA0" : "#FFF";
      context.lineWidth = 2;
      context.strokeRect(sx, sy, sw, sh);
      context.setLineDash([]);
      if (this.selection.w > 1 || this.selection.h > 1) {
        context.font = `${Math.max(12, Math.min(32, z))}pt Ubuntu Mono`;
        context.fillStyle = "#FFF";
        context.shadowBlur = 2;
        context.shadowColor = "#000";
        context.shadowOpacity = 1;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(`${this.selection.w} x ${this.selection.h}`, sx + sw / 2, sy + sh / 2);
        context.shadowBlur = 0;
      }
      return context.restore();
    }
  }

  getMousePosition(event) {
    var h, inside, p, w, x, y;
    p = this.viewport.toWorld(event.clientX, event.clientY);
    x = Math.floor(p[0]);
    y = Math.floor(p[1]);
    w = this.sprite.width;
    h = this.sprite.height;
    if (this.tile) {
      inside = p[0] >= -w / 2 && p[1] >= -h / 2 && p[0] < w * 1.5 && p[1] < h * 1.5;
    } else {
      inside = x >= 0 && y >= 0 && x < w && y < h;
    }
    return {
      x: x,
      y: y,
      inside: inside && this.viewport.contains(event.clientX, event.clientY)
    };
  }

  wrapX(x) {
    if (this.tile) {
      return (x % this.sprite.width + this.sprite.width) % this.sprite.width;
    } else {
      return x;
    }
  }

  wrapY(y) {
    if (this.tile) {
      return (y % this.sprite.height + this.sprite.height) % this.sprite.height;
    } else {
      return y;
    }
  }

  mouseDown(event) {
    var bg, c, context, fg, pos, x, y;
    event.stopPropagation();
    if (this.sprite == null) {
      return;
    }
    if (this.viewport.mouseDown(event)) {
      return;
    }
    if (!this.editable) {
      return;
    }
    pos = this.getMousePosition(event);
    x = pos.x;
    y = pos.y;
    if (this.editor.tool.selectiontool) {
      this.mousepressed = true;
      this.mouse_x = x;
      this.mouse_y = y;
      if (this.isInSelection(x, y)) {
        if ((this.floating_selection == null) && (event.shiftKey || event.altKey)) {
          bg = document.createElement("canvas");
          bg.width = this.getFrame().canvas.width;
          bg.height = this.getFrame().canvas.height;
          context = bg.getContext("2d");
          context.drawImage(this.getFrame().canvas, 0, 0);
          if (!event.altKey) {
            context.clearRect(this.selection.x, this.selection.y, this.selection.w, this.selection.h);
          }
          fg = document.createElement("canvas");
          fg.width = this.selection.w;
          fg.height = this.selection.h;
          context = fg.getContext("2d");
          context.drawImage(this.getFrame().canvas, -this.selection.x, -this.selection.y);
          this.floating_selection = {
            bg: bg,
            fg: fg
          };
        } else if (event.altKey && (this.floating_selection != null)) {
          this.floating_selection.bg.getContext("2d").drawImage(this.floating_selection.fg, this.selection.x, this.selection.y);
        }
        this.moving_selection = true;
        this.moved_once = false;
      } else {
        this.floating_selection = null;
        x = Math.max(0, Math.min(this.sprite.width - 1, x));
        y = Math.max(0, Math.min(this.sprite.height - 1, y));
        this.selection_start_x = x;
        this.selection_start_y = y;
        this.selection_moved = false;
        this.selection = {
          x: x,
          y: y,
          w: 1,
          h: 1
        };
      }
      this.update();
      return;
    }
    if (!pos.inside) {
      return;
    }
    x = this.wrapX(x);
    y = this.wrapY(y);
    if (this.colorpicker) {
      c = this.getFrame().getRGB(x, y);
      this.editor.colorpicker.colorPicked(c);
      if (!this.editor.alt_pressed) {
        this.editor.setColorPicker(false);
      }
      return;
    }
    this.mousepressed = true;
    if (this.sprite.undo == null) {
      this.sprite.undo = new Undo();
    }
    if (this.sprite.undo.empty()) {
      this.sprite.undo.pushState(this.sprite.clone());
    }
    if (this.editor.tool.parameters["Color"] != null) {
      this.editor.tool.parameters["Color"].value = this.color;
    }
    this.editor.tool.tile = this.tile;
    this.editor.tool.vsymmetry = this.vsymmetry;
    this.editor.tool.hsymmetry = this.hsymmetry;
    this.editor.tool.start(this.getFrame(), x, y, event.button, event.shiftKey);
    this.pixels_drawn += 1;
    this.mouse_x = pos.x;
    this.mouse_y = pos.y;
    this.update();
    this.editor.spriteChanged();
    return this.floating_selection = null;
  }

  mouseEnter(event) {
    return document.getElementById("spriteeditor").focus();
  }

  mouseMove(event) {
    var context, cx, cy, pos, was_over, x, y;
    if (this.viewport.mouseMove(event)) {
      return;
    }
    if (!this.editable || (this.sprite == null)) {
      return;
    }
    this.last_mouse_event = {
      clientX: event.clientX,
      clientY: event.clientY
    };
    pos = this.getMousePosition(event);
    x = pos.x;
    y = pos.y;
    if (pos.inside) {
      this.show_brush_size = 0;
    }
    if (!this.mousepressed && !pos.inside) {
      if (this.mouse_over) {
        this.mouse_over = false;
        this.editor.setCoordinates(-1, -1);
        this.update();
      }
      return;
    }
    if (this.mousepressed && this.moving_selection) {
      if (this.floating_selection != null) {
        if (x !== this.mouse_x || y !== this.mouse_y) {
          if (!this.moved_once) {
            this.moved_once = true;
            if (this.sprite.undo == null) {
              this.sprite.undo = new Undo();
            }
            if (this.sprite.undo.empty()) {
              this.sprite.undo.pushState(this.sprite.clone());
            }
          }
          this.selection.x += x - this.mouse_x;
          this.selection.y += y - this.mouse_y;
          this.mouse_x = x;
          this.mouse_y = y;
          this.editor.setCoordinates(x, y);
          context = this.getFrame().getContext();
          context.clearRect(0, 0, this.getFrame().canvas.width, this.getFrame().canvas.height);
          context.drawImage(this.floating_selection.bg, 0, 0);
          context.drawImage(this.floating_selection.fg, this.selection.x, this.selection.y);
          this.editor.spriteChanged();
          this.update();
        }
      } else {
        this.selection.x += x - this.mouse_x;
        this.selection.y += y - this.mouse_y;
        this.selection.x = Math.max(0, Math.min(this.sprite.width - this.selection.w, this.selection.x));
        this.selection.y = Math.max(0, Math.min(this.sprite.height - this.selection.h, this.selection.y));
        this.mouse_x = x;
        this.mouse_y = y;
        this.editor.setCoordinates(x, y);
        this.update();
      }
      return;
    }
    was_over = this.mouse_over;
    this.mouse_over = pos.inside;
    if (x !== this.mouse_x || y !== this.mouse_y || !was_over) {
      this.mouse_x = x;
      this.mouse_y = y;
      if (pos.inside) {
        this.editor.setCoordinates(this.wrapX(x), this.wrapY(y));
      }
      if (this.mousepressed) {
        if (this.editor.tool.selectiontool && this.selection) {
          this.selection_moved = true;
          cx = Math.max(0, Math.min(this.sprite.width - 1, x));
          cy = Math.max(0, Math.min(this.sprite.height - 1, y));
          this.selection.x = Math.min(this.selection_start_x, cx);
          this.selection.y = Math.min(this.selection_start_y, cy);
          this.selection.w = Math.abs(cx - this.selection_start_x) + 1;
          this.selection.h = Math.abs(cy - this.selection_start_y) + 1;
          this.update();
          return;
        }
        this.editor.tool.move(this.getFrame(), this.wrapX(x), this.wrapY(y), event.buttons);
        this.pixels_drawn += 1;
        this.update();
        this.editor.spriteChanged();
      } else {
        this.updateCursor();
        this.update();
      }
    }
    return false;
  }

  mouseUp(event) {
    if (this.viewport.mouseUp()) {
      return;
    }
    if (this.mousepressed && !this.editor.tool.selectiontool) {
      this.sprite.undo.pushState(this.sprite.clone());
    }
    if (this.mousepressed && this.editor.tool.selectiontool && !this.selection_moved && !this.moving_selection) {
      this.selection = null;
      this.update();
    }
    if (this.moving_selection) {
      this.moving_selection = false;
      if (this.moved_once && (this.floating_selection != null)) {
        this.sprite.undo.pushState(this.sprite.clone());
      }
      this.moved_once = false;
    }
    this.mousepressed = false;
    return this.editor.updateSelectionHints();
  }

  mouseOut(event) {
    this.mouse_over = false;
    this.update();
    return this.editor.setCoordinates(-1, -1);
  }

  flipSprite(direction) {
    var bg, context, fg;
    if (this.editor.tool.selectiontool) {
      if (this.selection != null) {
        if (this.sprite.undo == null) {
          this.sprite.undo = new Undo();
        }
        if (this.sprite.undo.empty()) {
          this.sprite.undo.pushState(this.sprite.clone());
        }
        fg = document.createElement("canvas");
        fg.width = this.selection.w;
        fg.height = this.selection.h;
        context = fg.getContext("2d");
        if (direction === "horizontal") {
          context.translate(this.selection.w, 0);
          context.scale(-1, 1);
        } else {
          context.translate(0, this.selection.h);
          context.scale(1, -1);
        }
        if (this.floating_selection == null) {
          context.drawImage(this.getFrame().canvas, -this.selection.x, -this.selection.y);
          context = this.getFrame().canvas.getContext("2d");
          context.clearRect(this.selection.x, this.selection.y, this.selection.w, this.selection.h);
          bg = document.createElement("canvas");
          bg.width = this.getFrame().canvas.width;
          bg.height = this.getFrame().canvas.height;
          bg.getContext("2d").drawImage(this.getFrame().canvas, 0, 0);
          context.drawImage(fg, this.selection.x, this.selection.y);
          this.floating_selection = {
            bg: bg,
            fg: fg
          };
        } else {
          context.drawImage(this.floating_selection.fg, 0, 0);
          this.floating_selection.fg = fg;
          context = this.getFrame().getContext();
          context.clearRect(0, 0, this.getFrame().canvas.width, this.getFrame().canvas.height);
          context.drawImage(this.floating_selection.bg, 0, 0);
          context.drawImage(this.floating_selection.fg, this.selection.x, this.selection.y);
        }
        this.sprite.undo.pushState(this.sprite.clone());
        this.update();
        return this.editor.spriteChanged();
      }
    }
  }

  rotateSprite(direction) {
    var bg, context, cx, cy, fg, nh, nw, nx, ny;
    if (this.editor.tool.selectiontool) {
      if (this.selection != null) {
        if (this.sprite.undo == null) {
          this.sprite.undo = new Undo();
        }
        if (this.sprite.undo.empty()) {
          this.sprite.undo.pushState(this.sprite.clone());
        }
        fg = document.createElement("canvas");
        fg.width = this.selection.h;
        fg.height = this.selection.w;
        context = fg.getContext("2d");
        context.translate(fg.width / 2, fg.height / 2);
        context.rotate(direction * Math.PI / 2);
        cx = this.selection.x + this.selection.w / 2;
        cy = this.selection.y + this.selection.h / 2;
        nw = this.selection.h;
        nh = this.selection.w;
        nx = Math.round(cx - nw / 2 + .01 * direction);
        ny = Math.round(cy - nh / 2 + .01 * direction);
        if (this.floating_selection == null) {
          context.drawImage(this.getFrame().canvas, -this.selection.x - this.selection.w / 2, -this.selection.y - this.selection.h / 2);
          context = this.getFrame().canvas.getContext("2d");
          context.clearRect(this.selection.x, this.selection.y, this.selection.w, this.selection.h);
          bg = document.createElement("canvas");
          bg.width = this.getFrame().canvas.width;
          bg.height = this.getFrame().canvas.height;
          bg.getContext("2d").drawImage(this.getFrame().canvas, 0, 0);
          context.drawImage(fg, nx, ny);
          this.selection.x = nx;
          this.selection.y = ny;
          this.selection.w = nw;
          this.selection.h = nh;
          this.floating_selection = {
            bg: bg,
            fg: fg
          };
        } else {
          context.drawImage(this.floating_selection.fg, -this.floating_selection.fg.width / 2, -this.floating_selection.fg.height / 2);
          this.floating_selection.fg = fg;
          this.selection.x = nx;
          this.selection.y = ny;
          this.selection.w = nw;
          this.selection.h = nh;
          context = this.getFrame().getContext();
          context.clearRect(0, 0, this.getFrame().canvas.width, this.getFrame().canvas.height);
          context.drawImage(this.floating_selection.bg, 0, 0);
          context.drawImage(this.floating_selection.fg, this.selection.x, this.selection.y);
        }
        this.sprite.undo.pushState(this.sprite.clone());
        this.update();
        return this.editor.spriteChanged();
      }
    }
  }

};
