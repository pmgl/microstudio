this.MapView = class MapView {
  constructor(editor) {
    this.editor = editor;
    this.canvas = document.createElement("canvas");
    this.map = new MicroMap(24, 16, 16, 16, {});
    this.viewport = new CanvasViewport(document.getElementById("mapeditor-wrapper"), this.canvas, this);
    this.viewport.max_zoom = 16;
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
    this.canvas.addEventListener("mouseenter", (event) => {
      return this.mouseEnter(event);
    });
    this.canvas.addEventListener("contextmenu", (event) => {
      return event.preventDefault();
    });
    window.addEventListener("resize", () => {
      return this.windowResized();
    });
    document.getElementById("mapeditor-wrapper").addEventListener("keydown", (e) => {
      if (e.keyCode === 18) {
        return document.getElementById("map-selection-hint-clone").classList.add("active");
      } else if (e.keyCode === 16) {
        return document.getElementById("map-selection-hint-move").classList.add("active");
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.keyCode === 18) {
        return document.getElementById("map-selection-hint-clone").classList.remove("active");
      } else if (e.keyCode === 16) {
        return document.getElementById("map-selection-hint-move").classList.remove("active");
      }
    });
    document.getElementById("map-zoom-plus").addEventListener("click", () => {
      return this.viewport.zoomBy(1.25);
    });
    document.getElementById("map-zoom-minus").addEventListener("click", () => {
      return this.viewport.zoomBy(1 / 1.25);
    });
    document.getElementById("map-zoom-fit").addEventListener("click", () => {
      this.viewport.fit();
      return this.viewChanged();
    });
    this.editable = false;
    this.tool = "draw";
    this.sprite = "icon";
    this.cells_drawn = 0;
    this.mouse_x = -1;
    this.mouse_y = -1;
    this.updateLoop();
  }

  setSprite(sprite) {
    this.sprite = sprite;
  }

  setTool(tool) {
    this.tool = tool;
    if (this.tool !== "select") {
      this.floating_selection = null;
    }
    this.updateCursor();
    return this.update();
  }

  getCell(x, y) {
    if (x < 0 || y < 0 || x >= this.map.width || y >= this.map.height) {
      return null;
    }
    return this.map.map[x + (this.map.height - 1 - y) * this.map.width] || null;
  }

  setCell(x, y, value) {
    return this.map.set(x, this.map.height - 1 - y, value);
  }

  getFillRegion(x, y) {
    var d, k, len, list, nx, ny, p, ref, ref1, region, visited;
    if (x < 0 || y < 0 || x >= this.map.width || y >= this.map.height) {
      return [];
    }
    ref = this.getCell(x, y);
    visited = new Uint8Array(this.map.width * this.map.height);
    visited[x + y * this.map.width] = 1;
    list = [[x, y]];
    region = [];
    while (list.length > 0) {
      p = list.pop();
      region.push(p);
      ref1 = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (k = 0, len = ref1.length; k < len; k++) {
        d = ref1[k];
        nx = p[0] + d[0];
        ny = p[1] + d[1];
        if (nx >= 0 && ny >= 0 && nx < this.map.width && ny < this.map.height && !visited[nx + ny * this.map.width] && this.getCell(nx, ny) === ref) {
          visited[nx + ny * this.map.width] = 1;
          list.push([nx, ny]);
        }
      }
    }
    return region;
  }

  getFillValue(x, y, origin_x, origin_y, erase) {
    var sel, tx, ty;
    if (erase || !this.sprite) {
      return null;
    }
    sel = this.editor.tilepicker.selection;
    if (sel != null) {
      tx = sel.x + ((x - origin_x) % sel.w + sel.w) % sel.w;
      ty = sel.y + ((y - origin_y) % sel.h + sel.h) % sel.h;
      return `${this.sprite}:${tx},${ty}`;
    } else {
      return this.sprite;
    }
  }

  floodFill(x, y, erase) {
    var k, len, p, ref1;
    ref1 = this.getFillRegion(x, y);
    for (k = 0, len = ref1.length; k < len; k++) {
      p = ref1[k];
      this.setCell(p[0], p[1], this.getFillValue(p[0], p[1], x, y, erase));
    }
  }

  drawAt(x, y) {
    var i, j, k, l, ref1, ref2, sel;
    sel = this.editor.tilepicker.selection;
    if (this.mode === "erase") {
      this.setCell(x, y, null);
    } else if (sel != null) {
      for (i = k = 0, ref1 = sel.w - 1; k <= ref1; i = k += 1) {
        for (j = l = 0, ref2 = sel.h - 1; l <= ref2; j = l += 1) {
          this.setCell(x + i, y + j, `${this.sprite}:${sel.x + i},${sel.y + j}`);
        }
      }
    } else {
      this.setCell(x, y, this.sprite);
    }
  }

  drawLine(x, y) {
    var d, i, k, ref1;
    d = Math.max(Math.abs(x - this.last_x), Math.abs(y - this.last_y));
    for (i = k = 1, ref1 = d; k <= ref1; i = k += 1) {
      this.drawAt(Math.round(this.last_x + (x - this.last_x) * i / d), Math.round(this.last_y + (y - this.last_y) * i / d));
    }
    this.last_x = x;
    return this.last_y = y;
  }

  isInSelection(x, y) {
    return (this.selection != null) && x >= this.selection.x && y >= this.selection.y && x < this.selection.x + this.selection.w && y < this.selection.y + this.selection.h;
  }

  getCells(x, y, w, h) {
    var data, i, j, k, l, ref1, ref2;
    data = [];
    for (j = k = 0, ref1 = h - 1; k <= ref1; j = k += 1) {
      for (i = l = 0, ref2 = w - 1; l <= ref2; i = l += 1) {
        data.push(this.getCell(x + i, y + j));
      }
    }
    return {
      w: w,
      h: h,
      data: data
    };
  }

  clearCells(x, y, w, h) {
    var i, j, k, l, ref1, ref2;
    for (j = k = 0, ref1 = h - 1; k <= ref1; j = k += 1) {
      for (i = l = 0, ref2 = w - 1; l <= ref2; i = l += 1) {
        this.setCell(x + i, y + j, null);
      }
    }
  }

  stampCells(cells, x, y) {
    var i, j, k, l, ref1, ref2, v;
    for (j = k = 0, ref1 = cells.h - 1; k <= ref1; j = k += 1) {
      for (i = l = 0, ref2 = cells.w - 1; l <= ref2; i = l += 1) {
        v = cells.data[i + j * cells.w];
        if (v != null) {
          this.setCell(x + i, y + j, v);
        }
      }
    }
  }

  drawFloatingSelection() {
    this.map.map = this.floating_selection.bg.slice();
    this.stampCells(this.floating_selection.fg, this.selection.x, this.selection.y);
    return this.map.needs_update = true;
  }

  startFloatingSelection(fg, clear) {
    if (clear) {
      this.clearCells(this.selection.x, this.selection.y, this.selection.w, this.selection.h);
    }
    this.floating_selection = {
      bg: this.map.map.slice(),
      fg: fg
    };
    return this.drawFloatingSelection();
  }

  pushUndo() {
    if (this.map.undo == null) {
      this.map.undo = new Undo();
    }
    if (this.map.undo.empty()) {
      return this.map.undo.pushState(this.map.clone());
    }
  }

  deleteSelection() {
    if ((this.selection == null) || this.tool !== "select") {
      return;
    }
    this.pushUndo();
    if (this.floating_selection != null) {
      this.map.map = this.floating_selection.bg.slice();
      this.map.needs_update = true;
      this.floating_selection = null;
    } else {
      this.clearCells(this.selection.x, this.selection.y, this.selection.w, this.selection.h);
    }
    this.map.undo.pushState(this.map.clone());
    this.update();
    return this.editor.mapChanged();
  }

  clearSelection() {
    this.selection = null;
    this.floating_selection = null;
    return this.update();
  }

  pasteCells(cells) {
    var x, y;
    this.tool = "select";
    x = Math.max(0, Math.min(this.map.width - cells.w, this.mouse_x));
    y = Math.max(0, Math.min(this.map.height - cells.h, this.mouse_y));
    this.selection = {
      x: x,
      y: y,
      w: cells.w,
      h: cells.h
    };
    return this.startFloatingSelection(cells, false);
  }

  getContentKey() {
    return `${this.map.width * this.map.block_width},${this.map.height * this.map.block_height}`;
  }

  updateContent() {
    var key;
    this.viewport.setContent(0, 0, this.map.width * this.map.block_width, this.map.height * this.map.block_height);
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

  updateCursor() {
    var cursor;
    cursor = this.viewport.getCursor();
    if (cursor != null) {
      return this.canvas.style.cursor = cursor;
    } else if (this.tool === "select" && this.isInSelection(this.mouse_x, this.mouse_y)) {
      return this.canvas.style.cursor = "move";
    } else {
      return this.canvas.style.cursor = "crosshair";
    }
  }

  windowResized() {
    return this.update();
  }

  updateLoop() {
    requestAnimationFrame(() => {
      return this.updateLoop();
    });
    if (this.needs_update) {
      this.needs_update = false;
      return this.update();
    }
  }

  update() {
    var bh, bw, ch, context, cw, height, i, i0, i1, j, j0, j1, k, l, len, m, p, ref1, ref2, ref3, ref4, region, sh, sw, sx, sy, th, tw, underlay, v, width, x, x0, x1, y, y0, y1, z;
    if (!this.viewport.resize()) {
      return;
    }
    this.updateContent();
    v = this.viewport;
    z = v.zoom;
    bw = this.map.block_width;
    bh = this.map.block_height;
    width = this.map.width * bw;
    height = this.map.height * bh;
    context = this.canvas.getContext("2d");
    v.resetTransform(context);
    context.clearRect(0, 0, v.width, v.height);
    context.imageSmoothingEnabled = false;
    x0 = v.screenX(0);
    y0 = v.screenY(0);
    x1 = v.screenX(width);
    y1 = v.screenY(height);
    context.save();
    context.shadowBlur = 30;
    context.shadowColor = "#000";
    if ((this.editor.background_color_picker != null) && typeof this.editor.background_color_picker.color === "string") {
      context.fillStyle = this.editor.background_color_picker.color;
    } else {
      context.fillStyle = "#000";
    }
    context.fillRect(x0, y0, x1 - x0, y1 - y0);
    context.restore();
    context.save();
    context.beginPath();
    context.rect(x0, y0, x1 - x0, y1 - y0);
    context.clip();
    v.setTransform(context);
    if (this.editor.map_underlay != null) {
      underlay = this.editor.app.project.getMap(this.editor.map_underlay);
      if (underlay != null) {
        underlay.update();
        context.globalAlpha = .3;
        underlay.draw(context, 0, 0, underlay.width * underlay.block_width, underlay.height * underlay.block_height);
        context.globalAlpha = 1;
      }
    }
    context.restore();
    if (bw * z >= 4 && bh * z >= 4) {
      i0 = Math.max(0, Math.floor(v.worldLeft() / bw));
      i1 = Math.min(this.map.width, Math.ceil(v.worldRight() / bw));
      j0 = Math.max(0, Math.floor(v.worldTop() / bh));
      j1 = Math.min(this.map.height, Math.ceil(v.worldBottom() / bh));
      for (i = k = ref1 = i0, ref2 = i1; k <= ref2; i = k += 1) {
        x = Math.round(v.screenX(i * bw));
        context.fillStyle = "rgba(0,0,0,.1)";
        context.fillRect(x, y0, 1, y1 - y0);
        context.fillStyle = "rgba(255,255,255,.1)";
        context.fillRect(x - 1, y0, 1, y1 - y0);
      }
      for (j = l = ref3 = j0, ref4 = j1; l <= ref4; j = l += 1) {
        y = Math.round(v.screenY(j * bh));
        context.fillStyle = "rgba(0,0,0,.1)";
        context.fillRect(x0, y, x1 - x0, 1);
        context.fillStyle = "rgba(255,255,255,.1)";
        context.fillRect(x0, y - 1, x1 - x0, 1);
      }
    }
    context.save();
    v.setTransform(context);
    this.map.update();
    this.map.draw(context, 0, 0, width, height);
    context.restore();
    if ((this.map.animated != null) && this.map.animated.length > 0) {
      this.needs_update = true;
    }
    context.strokeStyle = "rgba(255,255,255,.2)";
    context.lineWidth = 1;
    context.strokeRect(Math.round(x0) - .5, Math.round(y0) - .5, Math.round(x1 - x0) + 1, Math.round(y1 - y0) + 1);
    if (this.mouse_over && (v.getCursor() == null)) {
      cw = bw * z;
      ch = bh * z;
      if (this.tool === "fill" && !this.mousepressed) {
        region = this.getFillRegion(this.mouse_x, this.mouse_y);
        context.fillStyle = "rgba(255,255,255,.25)";
        context.beginPath();
        for (m = 0, len = region.length; m < len; m++) {
          p = region[m];
          context.rect(v.screenX(p[0] * bw), v.screenY(p[1] * bh), cw, ch);
        }
        context.fill();
      }
      tw = 1;
      th = 1;
      if (this.tool === "draw" && (this.editor.tilepicker.selection != null)) {
        tw = this.editor.tilepicker.selection.w;
        th = this.editor.tilepicker.selection.h;
      }
      if (this.tool !== "select" || !this.isInSelection(this.mouse_x, this.mouse_y)) {
        context.strokeStyle = "#000";
        context.lineWidth = 4;
        context.beginPath();
        context.rect(v.screenX(this.mouse_x * bw), v.screenY(this.mouse_y * bh), cw * tw, ch * th);
        context.stroke();
        context.strokeStyle = "#FFF";
        context.lineWidth = 3;
        context.stroke();
      }
    }
    if ((this.selection != null) && this.tool === "select") {
      sx = v.screenX(this.selection.x * bw);
      sy = v.screenY(this.selection.y * bh);
      sw = this.selection.w * bw * z;
      sh = this.selection.h * bh * z;
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
        context.font = `${Math.max(12, Math.min(24, bw * z / 2))}pt Ubuntu Mono`;
        context.fillStyle = "#FFF";
        context.shadowBlur = 2;
        context.shadowColor = "#000";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(`${this.selection.w} x ${this.selection.h}`, sx + sw / 2, sy + sh / 2);
      }
      context.restore();
    }
  }

  getMousePosition(event) {
    var inside, p, x, y;
    p = this.viewport.toWorld(event.clientX, event.clientY);
    x = Math.floor(p[0] / this.map.block_width);
    y = Math.floor(p[1] / this.map.block_height);
    inside = x >= 0 && y >= 0 && x < this.map.width && y < this.map.height;
    return {
      x: x,
      y: y,
      inside: inside && this.viewport.contains(event.clientX, event.clientY)
    };
  }

  mouseEnter(event) {
    return document.getElementById("mapeditor-wrapper").focus();
  }

  mouseDown(event) {
    var pos, x, y;
    event.stopPropagation();
    if (this.viewport.mouseDown(event)) {
      return;
    }
    if (!this.editable) {
      return;
    }
    pos = this.getMousePosition(event);
    x = pos.x;
    y = pos.y;
    if (this.tool === "select") {
      this.mousepressed = true;
      this.mouse_x = x;
      this.mouse_y = y;
      if (this.isInSelection(x, y)) {
        if ((this.floating_selection == null) && (event.shiftKey || event.altKey)) {
          this.pushUndo();
          this.startFloatingSelection(this.getCells(this.selection.x, this.selection.y, this.selection.w, this.selection.h), !event.altKey);
        } else if (event.altKey && (this.floating_selection != null)) {
          this.floating_selection.bg = this.map.map.slice();
        }
        this.moving_selection = true;
        this.moved_once = false;
      } else {
        this.floating_selection = null;
        x = Math.max(0, Math.min(this.map.width - 1, x));
        y = Math.max(0, Math.min(this.map.height - 1, y));
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
    this.mousepressed = true;
    this.mode = event.button === 2 ? "erase" : "draw";
    this.pushUndo();
    this.floating_selection = null;
    if (this.tool === "fill" || event.shiftKey) {
      this.filling = true;
      this.floodFill(x, y, this.mode === "erase");
    } else {
      this.filling = false;
      this.drawAt(x, y);
    }
    this.last_x = x;
    this.last_y = y;
    this.mouse_x = x;
    this.mouse_y = y;
    this.cells_drawn += 1;
    this.update();
    return this.editor.mapChanged();
  }

  mouseMove(event) {
    var cx, cy, pos, was_over, x, y;
    if (this.viewport.mouseMove(event)) {
      return;
    }
    if (!this.editable) {
      return;
    }
    this.last_mouse_event = {
      clientX: event.clientX,
      clientY: event.clientY
    };
    pos = this.getMousePosition(event);
    x = pos.x;
    y = pos.y;
    if (!this.mousepressed && !pos.inside) {
      if (this.mouse_over) {
        this.mouse_over = false;
        this.editor.setCoordinates(-1, -1);
        this.update();
      }
      return;
    }
    if (this.mousepressed && this.moving_selection) {
      if (x !== this.mouse_x || y !== this.mouse_y) {
        if (this.floating_selection != null) {
          this.moved_once = true;
          this.selection.x += x - this.mouse_x;
          this.selection.y += y - this.mouse_y;
          this.drawFloatingSelection();
          this.editor.mapChanged();
        } else {
          this.selection.x = Math.max(0, Math.min(this.map.width - this.selection.w, this.selection.x + x - this.mouse_x));
          this.selection.y = Math.max(0, Math.min(this.map.height - this.selection.h, this.selection.y + y - this.mouse_y));
        }
        this.mouse_x = x;
        this.mouse_y = y;
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
        this.editor.setCoordinates(x, this.map.height - 1 - y);
      }
      if (this.mousepressed) {
        if (this.tool === "select" && (this.selection != null)) {
          this.selection_moved = true;
          cx = Math.max(0, Math.min(this.map.width - 1, x));
          cy = Math.max(0, Math.min(this.map.height - 1, y));
          this.selection.x = Math.min(this.selection_start_x, cx);
          this.selection.y = Math.min(this.selection_start_y, cy);
          this.selection.w = Math.abs(cx - this.selection_start_x) + 1;
          this.selection.h = Math.abs(cy - this.selection_start_y) + 1;
        } else if (!this.filling) {
          this.drawLine(x, y);
          this.cells_drawn += 1;
          this.editor.mapChanged();
        }
      } else {
        this.updateCursor();
      }
      this.update();
    }
    return false;
  }

  mouseUp(event) {
    if (this.viewport.mouseUp()) {
      return;
    }
    if (this.mousepressed && this.tool !== "select") {
      this.map.undo.pushState(this.map.clone());
    }
    if (this.mousepressed && this.tool === "select" && !this.selection_moved && !this.moving_selection) {
      this.selection = null;
      this.update();
    }
    if (this.moving_selection) {
      this.moving_selection = false;
      if (this.moved_once && (this.floating_selection != null)) {
        this.map.undo.pushState(this.map.clone());
      }
      this.moved_once = false;
    }
    this.mousepressed = false;
    return this.filling = false;
  }

  mouseOut(event) {
    this.mouse_over = false;
    this.update();
    return this.editor.setCoordinates(-1, -1);
  }

  setMap(map) {
    if (map !== this.map) {
      if ((this.map != null) && this.viewport.width > 0) {
        this.map.view_state = this.viewport.getState();
        this.map.view_state.key = this.content_key;
      }
      this.map = map;
      if (this.map.view_state != null) {
        this.viewport.setState(this.map.view_state);
        this.content_key = this.map.view_state.key;
      } else {
        this.content_key = null;
      }
      this.selection = null;
      this.floating_selection = null;
    }
    this.windowResized();
    return this.update();
  }

};
