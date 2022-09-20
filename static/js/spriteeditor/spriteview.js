this.SpriteView = class SpriteView {
  constructor(editor) {
    this.editor = editor;
    this.canvas = document.querySelector("#spriteeditor canvas");
    this.canvas.width = 400;
    this.canvas.height = 400;
    this.sprite = new Sprite(32, 32);
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
    this.zoom = 1;
    document.getElementById("spriteeditor").addEventListener("mousewheel", ((e) => {
      return this.mouseWheel(e);
    }), false);
    document.getElementById("spriteeditor").addEventListener("DOMMouseScroll", ((e) => {
      return this.mouseWheel(e);
    }), false);
    document.getElementById("spriteeditor").addEventListener("mousedown", () => {
      if (this.selection != null) {
        this.selection = null;
        return this.update();
      }
    });
    document.getElementById("spriteeditor").addEventListener("keydown", (e) => {
      if (e.keyCode === 32) {
        this.space_pressed = true;
        this.canvas.style.cursor = "grab";
        e.preventDefault();
        return document.getElementById("sprite-grab-info").classList.add("active");
      } else if (e.keyCode === 18) { // Alt
        return document.getElementById("selection-hint-clone").classList.add("active");
      } else if (e.keyCode === 16) { // Shift
        return document.getElementById("selection-hint-move").classList.add("active");
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.keyCode === 32) {
        this.space_pressed = false;
        this.canvas.style.cursor = "crosshair";
        return document.getElementById("sprite-grab-info").classList.remove("active");
      } else if (e.keyCode === 18) { // Alt
        return document.getElementById("selection-hint-clone").classList.remove("active");
      } else if (e.keyCode === 16) { // Shift
        return document.getElementById("selection-hint-move").classList.remove("active");
      }
    });
    document.getElementById("sprite-zoom-plus").addEventListener("click", () => {
      return this.scaleZoom(1.1);
    });
    document.getElementById("sprite-zoom-minus").addEventListener("click", () => {
      return this.scaleZoom(1 / 1.100001);
    });
  }

  setSprite(sprite) {
    if (sprite !== this.sprite) {
      if (this.sprite != null) {
        this.saveZoom();
        this.sprite.selection = this.selection;
      }
      this.sprite = sprite;
      if (this.sprite.zoom != null) {
        this.restoreZoom();
      } else {
        this.scaleZoom(.5 / this.zoom);
      }
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

  mouseWheel(e) {
    e.preventDefault();
    if (this.next_wheel_action == null) {
      this.next_wheel_action = Date.now();
    }
    if (Date.now() < this.next_wheel_action) {
      return;
    }
    this.next_wheel_action = Date.now() + 50;
    if (e.wheelDelta < 0 || e.detail > 0) {
      return this.scaleZoom(1 / 1.100001, e);
    } else {
      return this.scaleZoom(1.1, e);
    }
  }

  scaleZoom(scale, e) {
    var b, max_zoom, scroll_x, scroll_y, view, x, y;
    view = document.getElementById("spriteeditor").getBoundingClientRect();
    max_zoom = 4096 / Math.max(view.width, view.height);
    this.zoom = Math.max(1, Math.min(max_zoom, this.zoom * scale));
    if (e != null) {
      b = this.canvas.getBoundingClientRect();
      x = (e.clientX - b.left) / this.canvas.width;
      y = (e.clientY - b.top) / this.canvas.height;
    }
    this.windowResized();
    if (e != null) {
      view = document.getElementById("spriteeditor").getBoundingClientRect();
      scroll_x = view.x + this.canvas.width * x - e.clientX + 40;
      scroll_y = view.y + this.canvas.height * y - e.clientY + 40;
      document.getElementById("spriteeditor").scrollTo(scroll_x, scroll_y);
    }
    if (e != null) {
      this.mouseMove(e);
    }
    if (this.zoom > 1) {
      return document.getElementById("sprite-grab-info").style.display = "inline-block";
    } else {
      return document.getElementById("sprite-grab-info").style.display = "none";
    }
  }

  saveZoom() {
    var view;
    if (this.sprite != null) {
      view = document.getElementById("spriteeditor");
      return this.sprite.zoom = {
        zoom: this.zoom,
        left: view.scrollLeft,
        top: view.scrollTop
      };
    }
  }

  restoreZoom() {
    var view;
    if (this.sprite.zoom != null) {
      view = document.getElementById("spriteeditor");
      this.scaleZoom(this.sprite.zoom.zoom / this.zoom);
      return view.scrollTo(this.sprite.zoom.left, this.sprite.zoom.top);
    }
  }

  addPattern() {
    var c, context, data, i, k, l, line, ref, ref1, value;
    if (this.pattern != null) {
      return;
    }
    c = document.createElement("canvas");
    c.width = 64;
    c.height = 64;
    context = c.getContext("2d");
    data = context.getImageData(0, 0, c.width, 1);
    for (line = k = 0, ref = c.height - 1; k <= ref; line = k += 1) {
      for (i = l = 0, ref1 = c.width - 1; l <= ref1; i = l += 1) {
        value = 128 + Math.random() * 64 - 32;
        data.data[i * 4] = value;
        data.data[i * 4 + 1] = value;
        data.data[i * 4 + 2] = value;
        data.data[i * 4 + 3] = 64;
      }
      context.putImageData(data, 0, line);
    }
    this.pattern = c.toDataURL();
    document.querySelector(".spriteeditor canvas").style["background-image"] = `url(${this.pattern})`;
    document.querySelector(".spriteeditor canvas").style["background-repeat"] = "repeat";
    return this.updateBackgroundColor();
  }

  updateBackgroundColor() {
    var c;
    if (this.editor.background_color_picker != null) {
      c = this.editor.background_color_picker.color;
      return document.querySelector(".spriteeditor canvas").style["background-color"] = c;
    } else {
      return document.querySelector(".spriteeditor canvas").style["background-color"] = "#000";
    }
  }

  setColor(color) {
    this.color = color;
  }

  windowResized() {
    var c, h, ratio, w;
    c = this.canvas.parentElement;
    if (c == null) {
      return;
    }
    if (c.clientWidth <= 0) {
      return;
    }
    w = c.clientWidth - 80;
    h = c.clientHeight - 80;
    ratio = Math.min(w / this.sprite.width, h / this.sprite.height);
    w = Math.floor(ratio * this.sprite.width * this.zoom);
    h = Math.floor(ratio * this.sprite.height * this.zoom);
    if (w !== this.canvas.width || h !== this.canvas.height) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.update();
    }
    h = Math.max(40, (c.clientHeight - h) / 2);
    return this.canvas.style["margin-top"] = h + "px";
  }

  showBrushSize() {
    this.show_brush_size = Date.now() + 2000;
    return this.update();
  }

  drawGrid(ctx) {
    var context, hblock, hoffset, i, k, l, lw, m, modulo, n, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, wblock, woffset;
    if ((this.grid_buffer == null) || this.grid_buffer.width !== this.canvas.width || this.grid_buffer.height !== this.canvas.height || this.tile !== this.grid_tile || this.grid_sw !== this.sprite.width || this.grid_sh !== this.sprite.height) {
      if (this.grid_buffer == null) {
        this.grid_buffer = document.createElement("canvas");
      }
      this.grid_buffer.width = this.canvas.width;
      this.grid_buffer.height = this.canvas.height;
      this.grid_tile = this.tile;
      this.grid_sw = this.sprite.width;
      this.grid_sh = this.sprite.height;
      console.info("updating grid");
      wblock = this.canvas.width / this.sprite.width;
      hblock = this.canvas.height / this.sprite.height;
      if (this.tile) {
        wblock /= 2;
        hblock /= 2;
      }
      context = this.grid_buffer.getContext("2d");
      context.lineWidth = 1;
      context.strokeStyle = "rgba(0,0,0,.1)";
      woffset = this.tile && this.sprite.width % 2 > 0 ? wblock * .5 : 0;
      hoffset = this.tile && this.sprite.height % 2 > 0 ? hblock * .5 : 0;
      modulo = this.sprite.width % 8 === 0 ? 8 : 10;
      if (wblock < 3) {
        return;
      }
      for (i = k = 0, ref = this.canvas.width, ref1 = wblock; ref1 !== 0 && (ref1 > 0 ? k <= ref : k >= ref); i = k += ref1) {
        lw = Math.round(i / hblock) % modulo === 0 ? 2 : 1;
        context.lineWidth = lw;
        context.beginPath();
        context.moveTo(i + .25 * lw + woffset, 0);
        context.lineTo(i + .25 * lw + woffset, this.canvas.height);
        context.stroke();
      }
      for (i = l = 0, ref2 = this.canvas.height, ref3 = hblock; ref3 !== 0 && (ref3 > 0 ? l <= ref2 : l >= ref2); i = l += ref3) {
        lw = Math.round(i / hblock) % modulo === 0 ? 2 : 1;
        context.lineWidth = lw;
        context.beginPath();
        context.moveTo(0, i + .25 * lw + hoffset);
        context.lineTo(this.canvas.width, i + .25 * lw + hoffset);
        context.stroke();
      }
      context.strokeStyle = "rgba(255,255,255,.1)";
      for (i = m = 0, ref4 = this.canvas.width, ref5 = wblock; ref5 !== 0 && (ref5 > 0 ? m <= ref4 : m >= ref4); i = m += ref5) {
        lw = Math.round(i / hblock) % modulo === 0 ? 2 : 1;
        context.lineWidth = lw;
        context.beginPath();
        context.moveTo(i - .25 * lw + woffset, 0);
        context.lineTo(i - .25 * lw + woffset, this.canvas.height);
        context.stroke();
      }
      for (i = n = 0, ref6 = this.canvas.height, ref7 = hblock; ref7 !== 0 && (ref7 > 0 ? n <= ref6 : n >= ref6); i = n += ref7) {
        lw = Math.round(i / hblock) % modulo === 0 ? 2 : 1;
        context.lineWidth = lw;
        context.beginPath();
        context.moveTo(0, i - .25 * lw + hoffset);
        context.lineTo(this.canvas.width, i - .25 * lw + hoffset);
        context.stroke();
      }
    }
    return ctx.drawImage(this.grid_buffer, 0, 0);
  }

  update() {
    var bs, context, f, grd, h, hblock, hoffset, i, j, k, l, m, mx, my, n, w, wblock, woffset;
    this.brush_size = this.editor.tool.getSize(this.sprite);
    context = this.canvas.getContext("2d");
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.imageSmoothingEnabled = false;
    this.addPattern();
    if (this.sprite.frames.length > 1) {
      f = this.sprite.frames[(this.sprite.current_frame + this.sprite.frames.length - 1) % this.sprite.frames.length];
      context.globalAlpha = .2;
      if (this.tile) {
        w = this.canvas.width;
        h = this.canvas.height;
        for (i = k = 0; k <= 2; i = k += 1) {
          for (j = l = 0; l <= 2; j = l += 1) {
            if (f.canvas != null) {
              context.drawImage(f.canvas, w * (-.25 + i * .5), h * (-.25 + j * .5), w * .5, h * .5);
            }
          }
        }
      } else {
        if (f.canvas != null) {
          context.drawImage(f.canvas, 0, 0, this.canvas.width, this.canvas.height);
        }
      }
      context.globalAlpha = 1;
    }
    if (this.tile) {
      w = this.canvas.width;
      h = this.canvas.height;
      for (i = m = 0; m <= 2; i = m += 1) {
        for (j = n = 0; n <= 2; j = n += 1) {
          if (this.getFrame().canvas != null) {
            context.drawImage(this.getFrame().canvas, w * (-.25 + i * .5), h * (-.25 + j * .5), w * .5, h * .5);
          }
        }
      }
    } else {
      if (this.getFrame().canvas != null) {
        context.drawImage(this.getFrame().canvas, 0, 0, this.canvas.width, this.canvas.height);
      }
    }
    wblock = this.canvas.width / this.sprite.width;
    hblock = this.canvas.height / this.sprite.height;
    if (this.tile) {
      wblock /= 2;
      hblock /= 2;
    }
    context.lineWidth = 1;
    context.strokeStyle = "rgba(0,0,0,.1)";
    woffset = this.tile && this.sprite.width % 2 > 0 ? wblock * .5 : 0;
    hoffset = this.tile && this.sprite.height % 2 > 0 ? hblock * .5 : 0;
    this.drawGrid(context);
    if ((this.mouse_over || Date.now() < this.show_brush_size) && this.canvas.style.cursor !== "move") {
      if (Date.now() < this.show_brush_size) {
        mx = Math.floor(this.sprite.width / 2) * (this.tile ? 2 : 1);
        my = Math.floor(this.sprite.height / 2) * (this.tile ? 2 : 1);
      } else {
        mx = this.mouse_x;
        my = this.mouse_y;
      }
      bs = (this.brush_size - 1) / 2;
      context.strokeStyle = "#000";
      context.lineWidth = 4;
      context.beginPath();
      context.rect((mx - bs) * wblock - woffset, (my - bs) * hblock - hoffset, wblock * this.brush_size, hblock * this.brush_size);
      context.stroke();
      context.strokeStyle = "#FFF";
      context.lineWidth = 3;
      context.stroke();
    }
    if (this.tile) {
      grd = context.createLinearGradient(0, 0, this.canvas.width, 0);
      grd.addColorStop(0, "rgba(0,0,0,1)");
      grd.addColorStop(.25, "rgba(0,0,0,0)");
      grd.addColorStop(.75, "rgba(0,0,0,0)");
      grd.addColorStop(1, "rgba(0,0,0,1)");
      context.fillStyle = grd;
      context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      grd = context.createLinearGradient(0, 0, 0, this.canvas.height);
      grd.addColorStop(0, "rgba(0,0,0,1)");
      grd.addColorStop(.25, "rgba(0,0,0,0)");
      grd.addColorStop(.75, "rgba(0,0,0,0)");
      grd.addColorStop(1, "rgba(0,0,0,1)");
      context.fillStyle = grd;
      context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      w = this.canvas.width;
      h = this.canvas.height;
      context.strokeStyle = "rgba(0,0,0,.5)";
      context.strokeRect(w * .25 + .5, h * .25 + .5, w * .5, h * .5);
      context.strokeStyle = "rgba(255,255,255,.5)";
      context.strokeRect(w * .25 - .5, h * .25 - .5, w * .5, h * .5);
    }
    if (this.hsymmetry) {
      w = this.canvas.width;
      h = this.canvas.height;
      context.fillStyle = "rgba(0,0,0,.5)";
      context.fillRect(0, h / 2 - 2, w, 4);
      context.fillStyle = "rgba(255,255,255,.5)";
      context.fillRect(0, h / 2 - 1.5, w, 3);
    }
    if (this.vsymmetry) {
      w = this.canvas.width;
      h = this.canvas.height;
      context.fillStyle = "rgba(0,0,0,.5)";
      context.fillRect(w / 2 - 2, 0, 4, h);
      context.fillStyle = "rgba(255,255,255,.5)";
      context.fillRect(w / 2 - 1.5, 0, 3, h);
    }
    if ((this.selection != null) && this.editor.tool.selectiontool) {
      context.save();
      if (this.tile) {
        context.translate(this.canvas.width * .25, this.canvas.width * .25);
      }
      context.strokeStyle = "rgba(0,0,0,.5)";
      context.lineWidth = 3;
      context.strokeRect(this.selection.x * wblock, this.selection.y * hblock, this.selection.w * wblock, this.selection.h * hblock);
      context.setLineDash([4, 4]);
      context.strokeStyle = this.floating_selection ? "#FA0" : "#FFF";
      context.lineWidth = 2;
      context.strokeRect(this.selection.x * wblock, this.selection.y * hblock, this.selection.w * wblock, this.selection.h * hblock);
      context.setLineDash([]);
      if (this.selection.w > 1 || this.selection.h > 1) {
        context.font = `${Math.max(12, wblock)}pt Ubuntu Mono`;
        context.fillStyle = "#FFF";
        context.shadowBlur = 2;
        context.shadowColor = "#000";
        context.shadowOpacity = 1;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(`${this.selection.w} x ${this.selection.h}`, (this.selection.x + this.selection.w / 2) * wblock, (this.selection.y + this.selection.h / 2) * hblock);
        context.shadowBlur = 0;
      }
      return context.restore();
    }
  }

  mouseDown(event) {
    var b, bg, c, context, fg, min, x, y;
    event.stopPropagation();
    if (!this.editable || (this.sprite == null)) {
      return;
    }
    this.mousepressed = true;
    b = this.canvas.getBoundingClientRect();
    min = Math.min(this.canvas.clientWidth, this.canvas.clientHeight);
    x = event.clientX - b.left;
    y = event.clientY - b.top;
    if (this.tile) {
      x = Math.floor(x / this.canvas.width * this.sprite.width * 2);
      y = Math.floor(y / this.canvas.height * this.sprite.height * 2);
      x = Math.floor((x + this.sprite.width / 2) % this.sprite.width);
      y = Math.floor((y + this.sprite.height / 2) % this.sprite.height);
    } else {
      x = Math.floor(x / this.canvas.width * this.sprite.width);
      y = Math.floor(y / this.canvas.height * this.sprite.height);
    }
    if (this.space_pressed) {
      this.grab_x = event.clientX;
      this.grab_y = event.clientY;
      this.grabbing = true;
      return;
    }
    if (this.colorpicker && !this.editor.tool.selectiontool) {
      c = this.getFrame().getRGB(x, y);
      this.editor.colorpicker.colorPicked(c);
      this.mousepressed = false;
      if (!this.editor.alt_pressed) {
        this.editor.setColorPicker(false);
      }
      return;
    }
    if (this.editor.tool.selectiontool) {
      if ((this.selection != null) && x >= this.selection.x && y >= this.selection.y && x < this.selection.x + this.selection.w && y < this.selection.y + this.selection.h) {
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
        } else if (event.altKey) {
          this.floating_selection.bg.getContext("2d").drawImage(this.floating_selection.fg, this.selection.x, this.selection.y);
        }
        this.moving_selection = true;
        this.moved_once = false;
        this.moving_start_x = x;
        this.moving_start_y = y;
        this.update();
        return;
      } else {
        this.floating_selection = null;
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
    this.mouse_x = x;
    this.mouse_y = y;
    this.update();
    this.editor.spriteChanged();
    return this.floating_selection = null;
  }

  mouseEnter(event) {
    return document.getElementById("spriteeditor").focus();
  }

  mouseMove(event) {
    var b, context, dx, dy, min, view, x, y;
    if (this.grabbing) {
      dx = event.clientX - this.grab_x;
      dy = event.clientY - this.grab_y;
      this.grab_x = event.clientX;
      this.grab_y = event.clientY;
      view = document.getElementById("spriteeditor");
      view.scrollTo(view.scrollLeft - dx, view.scrollTop - dy);
      return;
    }
    if (!this.editable) {
      return;
    }
    b = this.canvas.getBoundingClientRect();
    min = Math.min(this.canvas.clientWidth, this.canvas.clientHeight);
    x = event.clientX - b.left;
    y = event.clientY - b.top;
    if (x >= 0 && y >= 0 && x < b.right - b.left && y < b.bottom - b.top) {
      this.show_brush_size = 0;
    }
    if (this.tile) {
      x = Math.floor(x / this.canvas.width * this.sprite.width * 2);
      y = Math.floor(y / this.canvas.height * this.sprite.height * 2);
      if (!this.mousepressed && (x < 0 || y < 0 || x >= this.sprite.width * 2 || y >= this.sprite.height * 2)) {
        return;
      }
    } else {
      x = Math.floor(x / this.canvas.width * this.sprite.width);
      y = Math.floor(y / this.canvas.height * this.sprite.height);
      if (!this.mousepressed && (x < 0 || y < 0 || x >= this.sprite.width || y >= this.sprite.height)) {
        return;
      }
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
    this.mouse_over = true;
    if (this.mousepressed && this.editor.tool.selectiontool) {
      this.selection_moved = true;
    }
    if (x !== this.mouse_x || y !== this.mouse_y) {
      this.mouse_x = x;
      this.mouse_y = y;
      this.editor.setCoordinates(x, y);
      if (this.mousepressed) {
        if (this.tile) {
          x = Math.floor((x + this.sprite.width / 2) % this.sprite.width);
          y = Math.floor((y + this.sprite.height / 2) % this.sprite.height);
        }
        if (this.editor.tool.selectiontool && this.selection) {
          this.selection.x = Math.max(0, Math.min(this.selection_start_x, x));
          this.selection.y = Math.max(0, Math.min(this.selection_start_y, y));
          this.selection.w = Math.min(this.sprite.width - this.selection.x, Math.max(this.selection_start_x, x) - Math.min(this.selection_start_x, Math.max(0, x)) + 1);
          this.selection.h = Math.min(this.sprite.height - this.selection.y, Math.max(this.selection_start_y, y) - Math.min(this.selection_start_y, Math.max(0, y)) + 1);
          this.update();
          return;
        }
        this.editor.tool.move(this.getFrame(), x, y, event.buttons);
        this.pixels_drawn += 1;
        this.update();
        this.editor.spriteChanged();
      } else {
        if ((this.selection != null) && this.editor.tool.selectiontool && x >= this.selection.x && y >= this.selection.y && x < this.selection.x + this.selection.w && y < this.selection.y + this.selection.h) {
          this.canvas.style.cursor = "move";
        } else if (this.colorpicker && !this.editor.tool.selectiontool) {
          this.canvas.style.cursor = "url( '/img/eyedropper.svg' ) 0 24, pointer";
        } else {
          this.canvas.style.cursor = "crosshair";
        }
        this.update();
      }
    }
    return false;
  }

  mouseUp(event) {
    if (this.grabbing) {
      this.grabbing = false;
    } else if (this.mousepressed && !this.editor.tool.selectiontool) {
      this.sprite.undo.pushState(this.sprite.clone());
    }
    if (this.editor.tool.selectiontool && !this.selection_moved) {
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
