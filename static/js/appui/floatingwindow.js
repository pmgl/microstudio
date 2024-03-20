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
        return _this.setPosition(b.x - _this.getParentX(), b.y - _this.getParentY());
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
    var e, i, len, list;
    this.moving = true;
    this.drag_start_x = event.clientX;
    this.drag_start_y = event.clientY;
    this.drag_pos_x = this.window.getBoundingClientRect().x - this.getParentX();
    this.drag_pos_y = this.window.getBoundingClientRect().y - this.getParentY();
    list = document.querySelectorAll("iframe");
    for (i = 0, len = list.length; i < len; i++) {
      e = list[i];
      e.classList.add("ignoreMouseEvents");
    }
  };

  FloatingWindow.prototype.startResize = function(event) {
    var e, i, len, list;
    this.resizing = true;
    this.drag_start_x = event.clientX;
    this.drag_start_y = event.clientY;
    this.drag_size_w = this.window.getBoundingClientRect().width;
    this.drag_size_h = this.window.getBoundingClientRect().height;
    list = document.querySelectorAll("iframe");
    for (i = 0, len = list.length; i < len; i++) {
      e = list[i];
      e.classList.add("ignoreMouseEvents");
    }
  };

  FloatingWindow.prototype.getParentX = function() {
    if (this.window.parentNode != null) {
      return this.window.parentNode.getBoundingClientRect().x;
    } else {
      return 0;
    }
  };

  FloatingWindow.prototype.getParentY = function() {
    if (this.window.parentNode != null) {
      return this.window.parentNode.getBoundingClientRect().y;
    } else {
      return 0;
    }
  };

  FloatingWindow.prototype.getParentWidth = function() {
    if ((this.window.parentNode != null) && this.window.parentNode !== document.body) {
      return this.window.parentNode.clientWidth;
    } else {
      return window.innerWidth;
    }
  };

  FloatingWindow.prototype.getParentHeight = function() {
    if ((this.window.parentNode != null) && this.window.parentNode !== document.body) {
      return this.window.parentNode.clientHeight;
    } else {
      return window.innerHeight;
    }
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
      w = Math.floor(Math.max(200, Math.min(this.getParentWidth() * this.max_ratio, this.drag_size_w + dx)));
      h = Math.floor(Math.max(200, Math.min(this.getParentHeight() * this.max_ratio, this.drag_size_h + dy)));
      if (!this.options.fixed_size) {
        this.window.style.width = w + "px";
        this.window.style.height = h + "px";
      }
      b = this.window.getBoundingClientRect();
      if (w > this.getParentWidth() - b.x || h > this.getParentHeight() - b.y) {
        this.setPosition(Math.min(b.x - this.getParentX(), this.getParentWidth() - w - 4), Math.min(b.y - this.getParentY(), this.getParentHeight() - h - 4));
      }
      if ((this.listener != null) && (this.listener.floatingWindowResized != null)) {
        return this.listener.floatingWindowResized();
      }
    }
  };

  FloatingWindow.prototype.mouseUp = function(event) {
    var e, i, len, list;
    this.moving = false;
    this.resizing = false;
    list = document.querySelectorAll("iframe");
    for (i = 0, len = list.length; i < len; i++) {
      e = list[i];
      e.classList.remove("ignoreMouseEvents");
    }
  };

  FloatingWindow.prototype.setPosition = function(x, y) {
    var b;
    b = this.window.getBoundingClientRect();
    x = Math.max(4 - b.width / 2, Math.min(this.getParentWidth() - b.width / 2 - 4, x));
    y = Math.max(4, Math.min(this.getParentHeight() - b.height / 2 - 4, y));
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
