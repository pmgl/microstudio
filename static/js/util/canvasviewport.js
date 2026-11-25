this.CanvasViewport = class CanvasViewport {
  constructor(container, canvas, listener) {
    this.container = container;
    this.canvas = canvas;
    this.listener = listener;
    this.zoom = 1;
    this.offset_x = 0;
    this.offset_y = 0;
    this.content_x = 0;
    this.content_y = 0;
    this.content_width = 1;
    this.content_height = 1;
    this.width = 0;
    this.height = 0;
    this.ratio = 1;
    this.margin = 40;
    this.max_zoom = 64;
    this.container.addEventListener("wheel", ((e) => {
      return this.mouseWheel(e);
    }), {
      passive: false
    });
    this.container.addEventListener("gesturestart", (e) => {
      e.preventDefault();
      return this.gesture_scale = 1;
    });
    this.container.addEventListener("gesturechange", (e) => {
      var b;
      e.preventDefault();
      b = this.canvas.getBoundingClientRect();
      this.zoomAt(e.scale / this.gesture_scale, e.clientX - b.left, e.clientY - b.top);
      return this.gesture_scale = e.scale;
    });
    this.container.addEventListener("keydown", (e) => {
      if (e.keyCode === 32) {
        e.preventDefault();
        if (!this.space_pressed) {
          this.space_pressed = true;
          return this.listener.updateCursor();
        }
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.keyCode === 32 && this.space_pressed) {
        this.space_pressed = false;
        return this.listener.updateCursor();
      }
    });
  }

  resize() {
    var h, ratio, w;
    w = this.container.clientWidth;
    h = this.container.clientHeight;
    if (w <= 0 || h <= 0) {
      return false;
    }
    ratio = window.devicePixelRatio || 1;
    if (w !== this.width || h !== this.height || ratio !== this.ratio) {
      if (this.width > 0) {
        this.offset_x += (w - this.width) / 2;
        this.offset_y += (h - this.height) / 2;
      }
      this.width = w;
      this.height = h;
      this.ratio = ratio;
      this.canvas.width = Math.round(w * ratio);
      this.canvas.height = Math.round(h * ratio);
      this.canvas.style.width = `${w}px`;
      this.canvas.style.height = `${h}px`;
      this.clampOffset();
    }
    return true;
  }

  setContent(content_x, content_y, content_width, content_height) {
    this.content_x = content_x;
    this.content_y = content_y;
    this.content_width = content_width;
    this.content_height = content_height;
  }

  fitZoom() {
    var h, w;
    w = Math.max(1, this.width - this.margin * 2);
    h = Math.max(1, this.height - this.margin * 2);
    return Math.min(w / this.content_width, h / this.content_height);
  }

  minZoom() {
    return Math.min(1, this.fitZoom() / 4);
  }

  maxZoom() {
    return Math.max(this.max_zoom, this.fitZoom() * 2);
  }

  isZoomedIn() {
    return this.zoom > this.fitZoom() * 1.01;
  }

  fit() {
    this.zoom = this.fitZoom();
    this.offset_x = this.width / 2 - (this.content_x + this.content_width / 2) * this.zoom;
    return this.offset_y = this.height / 2 - (this.content_y + this.content_height / 2) * this.zoom;
  }

  zoomAt(factor, x, y) {
    var wx, wy, zoom;
    zoom = Math.max(this.minZoom(), Math.min(this.maxZoom(), this.zoom * factor));
    if (zoom === this.zoom) {
      return;
    }
    wx = (x - this.offset_x) / this.zoom;
    wy = (y - this.offset_y) / this.zoom;
    this.zoom = zoom;
    this.offset_x = x - wx * this.zoom;
    this.offset_y = y - wy * this.zoom;
    if (!this.containsWorld(wx, wy)) {
      this.clampOffset();
    }
    return this.changed();
  }

  zoomBy(factor) {
    return this.zoomAt(factor, this.width / 2, this.height / 2);
  }

  pan(dx, dy) {
    var ox, oy;
    ox = this.offset_x;
    oy = this.offset_y;
    this.offset_x += dx;
    this.offset_y += dy;
    this.clampOffset(ox, oy);
    return this.changed();
  }

  containsWorld(x, y) {
    return x >= this.content_x && y >= this.content_y && x <= this.content_x + this.content_width && y <= this.content_y + this.content_height;
  }

  clampOffset(ox, oy) {
    var max_x, max_y, min_x, min_y;
    if (this.width <= 0) {
      return;
    }
    min_x = this.margin - (this.content_x + this.content_width) * this.zoom;
    max_x = this.width - this.margin - this.content_x * this.zoom;
    min_y = this.margin - (this.content_y + this.content_height) * this.zoom;
    max_y = this.height - this.margin - this.content_y * this.zoom;
    if (ox != null) {
      min_x = Math.min(min_x, ox);
      max_x = Math.max(max_x, ox);
      min_y = Math.min(min_y, oy);
      max_y = Math.max(max_y, oy);
    }
    this.offset_x = Math.max(min_x, Math.min(max_x, this.offset_x));
    return this.offset_y = Math.max(min_y, Math.min(max_y, this.offset_y));
  }

  changed() {
    return this.listener.viewChanged();
  }

  getState() {
    return {
      zoom: this.zoom,
      offset_x: this.offset_x,
      offset_y: this.offset_y
    };
  }

  setState(state) {
    this.zoom = state.zoom;
    this.offset_x = state.offset_x;
    this.offset_y = state.offset_y;
    return this.clampOffset();
  }

  setTransform(context) {
    return context.setTransform(this.ratio * this.zoom, 0, 0, this.ratio * this.zoom, this.ratio * this.offset_x, this.ratio * this.offset_y);
  }

  resetTransform(context) {
    return context.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
  }

  screenX(x) {
    return this.offset_x + x * this.zoom;
  }

  screenY(y) {
    return this.offset_y + y * this.zoom;
  }

  worldLeft() {
    return -this.offset_x / this.zoom;
  }

  worldTop() {
    return -this.offset_y / this.zoom;
  }

  worldRight() {
    return (this.width - this.offset_x) / this.zoom;
  }

  worldBottom() {
    return (this.height - this.offset_y) / this.zoom;
  }

  toWorld(clientX, clientY) {
    var b;
    b = this.canvas.getBoundingClientRect();
    return [(clientX - b.left - this.offset_x) / this.zoom, (clientY - b.top - this.offset_y) / this.zoom];
  }

  contains(clientX, clientY) {
    var b;
    b = this.canvas.getBoundingClientRect();
    return clientX >= b.left && clientY >= b.top && clientX < b.right && clientY < b.bottom;
  }

  isTrackpad(e) {
    var time;
    time = Date.now();
    if ((this.wheel_time == null) || time - this.wheel_time > 200) {
      this.wheel_trackpad = this.detectTrackpad(e);
    }
    this.wheel_time = time;
    return this.wheel_trackpad;
  }

  detectTrackpad(e) {
    if (e.deltaMode !== 0) {
      return false;
    }
    if (e.deltaX !== 0) {
      return true;
    }
    if ((e.wheelDeltaY != null) && e.wheelDeltaY !== 0) {
      return e.wheelDeltaY % 120 !== 0;
    }
    return Math.abs(e.deltaY) < 50;
  }

  mouseWheel(e) {
    var b, dy, x, y;
    e.preventDefault();
    b = this.canvas.getBoundingClientRect();
    x = e.clientX - b.left;
    y = e.clientY - b.top;
    if (e.ctrlKey) {
      return this.zoomAt(Math.exp(-Math.max(-50, Math.min(50, e.deltaY)) * .01), x, y);
    } else if (this.isTrackpad(e)) {
      return this.pan(-e.deltaX, -e.deltaY);
    } else {
      dy = e.deltaY;
      if (e.deltaMode === 1) {
        dy *= 33;
      } else if (e.deltaMode === 2) {
        dy *= 400;
      }
      dy = Math.max(-200, Math.min(200, dy));
      return this.zoomAt(Math.pow(1.0015, -dy), x, y);
    }
  }

  mouseDown(event) {
    if (event.button === 1 || this.space_pressed) {
      if (event.preventDefault != null) {
        event.preventDefault();
      }
      this.grabbing = true;
      this.grab_x = event.clientX;
      this.grab_y = event.clientY;
      this.listener.updateCursor();
      return true;
    }
    return false;
  }

  mouseMove(event) {
    var dx, dy;
    if (!this.grabbing) {
      return false;
    }
    dx = event.clientX - this.grab_x;
    dy = event.clientY - this.grab_y;
    this.grab_x = event.clientX;
    this.grab_y = event.clientY;
    this.pan(dx, dy);
    return true;
  }

  mouseUp() {
    if (!this.grabbing) {
      return false;
    }
    this.grabbing = false;
    this.listener.updateCursor();
    return true;
  }

  getCursor() {
    if (this.grabbing) {
      return "grabbing";
    } else if (this.space_pressed) {
      return "grab";
    } else {
      return null;
    }
  }

};
