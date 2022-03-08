this.SplitBar = (function() {
  function SplitBar(id, type) {
    this.type = type != null ? type : "horizontal";
    this.element = document.getElementById(id);
    this.side1 = this.element.childNodes[0];
    this.splitbar = this.element.childNodes[1];
    this.side2 = this.element.childNodes[2];
    this.position = 50;
    this.closed1 = false;
    this.closed2 = false;
    this.splitbar_size = 10;
    this.splitbar.addEventListener("touchstart", (function(_this) {
      return function(event) {
        if ((event.touches != null) && (event.touches[0] != null)) {
          return _this.startDrag(event.touches[0]);
        }
      };
    })(this));
    document.addEventListener("touchmove", (function(_this) {
      return function(event) {
        if ((event.touches != null) && (event.touches[0] != null)) {
          return _this.drag(event.touches[0]);
        }
      };
    })(this));
    document.addEventListener("touchend", (function(_this) {
      return function(event) {
        return _this.stopDrag();
      };
    })(this));
    document.addEventListener("touchcancel", (function(_this) {
      return function(event) {
        return _this.stopDrag();
      };
    })(this));
    this.splitbar.addEventListener("mousedown", (function(_this) {
      return function(event) {
        return _this.startDrag(event);
      };
    })(this));
    document.addEventListener("mousemove", (function(_this) {
      return function(event) {
        return _this.drag(event);
      };
    })(this));
    document.addEventListener("mouseup", (function(_this) {
      return function(event) {
        return _this.stopDrag(event);
      };
    })(this));
    window.addEventListener("resize", (function(_this) {
      return function(event) {
        return _this.update();
      };
    })(this));
    this.update();
  }

  SplitBar.prototype.startDrag = function(event) {
    var e, i, len, list;
    this.dragging = true;
    this.drag_start_x = event.clientX;
    this.drag_start_y = event.clientY;
    this.drag_position = this.position;
    list = document.getElementsByTagName("iframe");
    for (i = 0, len = list.length; i < len; i++) {
      e = list[i];
      e.classList.add("ignoreMouseEvents");
    }
  };

  SplitBar.prototype.drag = function(event) {
    var dx, dy, ns;
    if (this.dragging) {
      switch (this.type) {
        case "horizontal":
          dx = (event.clientX - this.drag_start_x) / (this.element.clientWidth - this.splitbar.clientWidth) * 100;
          ns = Math.round(Math.max(0, Math.min(100, this.drag_position + dx)));
          if (ns !== this.position) {
            this.position = ns;
            return window.dispatchEvent(new Event('resize'));
          }
          break;
        default:
          dy = (event.clientY - this.drag_start_y) / (this.element.clientHeight - this.splitbar.clientHeight) * 100;
          ns = Math.round(Math.max(0, Math.min(100, this.drag_position + dy)));
          if (ns !== this.position) {
            this.position = ns;
            return window.dispatchEvent(new Event('resize'));
          }
      }
    }
  };

  SplitBar.prototype.stopDrag = function() {
    var e, i, len, list;
    this.dragging = false;
    list = document.getElementsByTagName("iframe");
    for (i = 0, len = list.length; i < len; i++) {
      e = list[i];
      e.classList.remove("ignoreMouseEvents");
    }
  };

  SplitBar.prototype.setPosition = function(position) {
    this.position = position;
    return this.update();
  };

  SplitBar.prototype.update = function() {
    var h, h1, h2, h3, w, w1, w2, w3;
    if (this.element.clientWidth === 0 || this.element.clientHeight === 0) {
      return;
    }
    switch (this.type) {
      case "horizontal":
        this.total_width = w = this.element.clientWidth - this.splitbar.clientWidth;
        if (!this.closed2) {
          w1 = Math.round(this.position / 100 * w);
          w2 = w1 + Math.max(this.splitbar.clientWidth, this.splitbar_size);
          w3 = this.element.clientWidth - w2;
          this.side1.style.width = w1 + "px";
          this.splitbar.style.left = w1 + "px";
          this.side2.style.width = w3 + "px";
          this.splitbar.style.display = "block";
          return this.side2.style.display = "block";
        } else {
          this.side1.style.width = this.element.clientWidth + "px";
          this.splitbar.style.display = "none";
          return this.side2.style.display = "none";
        }
        break;
      default:
        this.total_height = h = this.element.clientHeight - this.splitbar.clientHeight;
        h1 = Math.round(this.position / 100 * h);
        h2 = h1 + this.splitbar.clientHeight;
        h3 = this.element.clientHeight - h2;
        this.side1.style.height = h1 + "px";
        this.splitbar.style.top = h1 + "px";
        return this.side2.style.height = h3 + "px";
    }
  };

  return SplitBar;

})();
