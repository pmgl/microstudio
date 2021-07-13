this.FloatingWindow = (function() {
  function FloatingWindow(app, elementid, listener, options) {
    this.app = app;
    this.elementid = elementid;
    this.listener = listener;
    this.options = options != null ? options : {};
    this.window = document.getElementById(this.elementid);
    document.querySelector("#" + this.elementid).addEventListener("mousedown", (function(_this) {
      return function(event) {
        return _this.moveToFront();
      };
    })(this));
    document.querySelector("#" + this.elementid + " .titlebar").addEventListener("mousedown", (function(_this) {
      return function(event) {
        return _this.startMove(event);
      };
    })(this));
    if (!this.options.fixed_size) {
      document.querySelector("#" + this.elementid + " .navigation .resize").addEventListener("mousedown", (function(_this) {
        return function(event) {
          return _this.startResize(event);
        };
      })(this));
    }
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
    window.addEventListener("resize", (function(_this) {
      return function() {
        var b;
        b = _this.window.getBoundingClientRect();
        return _this.setPosition(b.x, b.y);
      };
    })(this));
    document.querySelector("#" + this.elementid + " .titlebar .minify").addEventListener("click", (function(_this) {
      return function() {
        return _this.close();
      };
    })(this));
    this.max_ratio = .75;
  }

  FloatingWindow.prototype.moveToFront = function() {
    var e, i, len, list;
    list = document.getElementsByClassName("floating-window");
    for (i = 0, len = list.length; i < len; i++) {
      e = list[i];
      if (e.id === this.elementid) {
        e.style["z-index"] = 11;
      } else {
        e.style["z-index"] = 10;
      }
    }
  };

  FloatingWindow.prototype.close = function() {
    this.shown = false;
    document.getElementById("" + this.elementid).style.display = "none";
    if ((this.listener != null) && (this.listener.floatingWindowClosed != null)) {
      return this.listener.floatingWindowClosed();
    }
  };

  FloatingWindow.prototype.show = function() {
    this.shown = true;
    document.getElementById("" + this.elementid).style.display = "block";
    return this.moveToFront();
  };

  FloatingWindow.prototype.startMove = function(event) {
    this.moving = true;
    this.drag_start_x = event.clientX;
    this.drag_start_y = event.clientY;
    this.drag_pos_x = this.window.getBoundingClientRect().x;
    return this.drag_pos_y = this.window.getBoundingClientRect().y;
  };

  FloatingWindow.prototype.startResize = function(event) {
    this.resizing = true;
    this.drag_start_x = event.clientX;
    this.drag_start_y = event.clientY;
    this.drag_size_w = this.window.getBoundingClientRect().width;
    return this.drag_size_h = this.window.getBoundingClientRect().height;
  };

  FloatingWindow.prototype.mouseMove = function(event) {
    var b, dx, dy, h, w;
    if (this.moving) {
      dx = event.clientX - this.drag_start_x;
      dy = event.clientY - this.drag_start_y;
      this.setPosition(this.drag_pos_x + dx, this.drag_pos_y + dy);
    }
    if (this.resizing) {
      dx = event.clientX - this.drag_start_x;
      dy = event.clientY - this.drag_start_y;
      w = Math.floor(Math.max(200, Math.min(window.innerWidth * this.max_ratio, this.drag_size_w + dx)));
      h = Math.floor(Math.max(200, Math.min(window.innerHeight * this.max_ratio, this.drag_size_h + dy)));
      if (!this.options.fixed_size) {
        this.window.style.width = w + "px";
        this.window.style.height = h + "px";
      }
      b = this.window.getBoundingClientRect();
      if (w > window.innerWidth - b.x || h > window.innerHeight - b.y) {
        this.setPosition(Math.min(b.x, window.innerWidth - w - 4), Math.min(b.y, window.innerHeight - h - 4));
      }
      if ((this.listener != null) && (this.listener.floatingWindowResized != null)) {
        return this.listener.floatingWindowResized();
      }
    }
  };

  FloatingWindow.prototype.mouseUp = function(event) {
    this.moving = false;
    return this.resizing = false;
  };

  FloatingWindow.prototype.setPosition = function(x, y) {
    var b;
    b = this.window.getBoundingClientRect();
    x = Math.max(4 - b.width / 2, Math.min(window.innerWidth - b.width / 2 - 4, x));
    y = Math.max(4, Math.min(window.innerHeight - b.height / 2 - 4, y));
    this.window.style.top = y + "px";
    return this.window.style.left = x + "px";
  };

  FloatingWindow.prototype.resize = function(x, y, w, h) {
    if (!this.options.fixed_size) {
      this.window.style.width = w + "px";
      this.window.style.height = h + "px";
    }
    return this.setPosition(x, y);
  };

  return FloatingWindow;

})();
