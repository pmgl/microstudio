this.SplitBar = (function() {
  function SplitBar(id, type) {
    this.type = type != null ? type : "horizontal";
    this.element = document.getElementById(id);
    this.side1 = this.element.childNodes[0];
    this.splitbar = this.element.childNodes[1];
    this.side2 = this.element.childNodes[2];
    this.position = 50;
    this.splitbar.addEventListener("mousedown", (function(_this) {
      return function(event) {
        var e, i, len, list;
        _this.dragging = true;
        _this.drag_start_x = event.clientX;
        _this.drag_start_y = event.clientY;
        _this.drag_position = _this.position;
        list = document.getElementsByTagName("iframe");
        for (i = 0, len = list.length; i < len; i++) {
          e = list[i];
          e.classList.add("ignoreMouseEvents");
        }
      };
    })(this));
    document.addEventListener("mousemove", (function(_this) {
      return function(event) {
        var dx, dy, ns;
        if (_this.dragging) {
          switch (_this.type) {
            case "horizontal":
              dx = (event.clientX - _this.drag_start_x) / (_this.element.clientWidth - _this.splitbar.clientWidth) * 100;
              ns = Math.round(Math.max(0, Math.min(100, _this.drag_position + dx)));
              if (ns !== _this.position) {
                _this.position = ns;
                return window.dispatchEvent(new Event('resize'));
              }
              break;
            default:
              dy = (event.clientY - _this.drag_start_y) / (_this.element.clientHeight - _this.splitbar.clientHeight) * 100;
              ns = Math.round(Math.max(0, Math.min(100, _this.drag_position + dy)));
              if (ns !== _this.position) {
                _this.position = ns;
                return window.dispatchEvent(new Event('resize'));
              }
          }
        }
      };
    })(this));
    document.addEventListener("mouseup", (function(_this) {
      return function(event) {
        var e, i, len, list;
        _this.dragging = false;
        list = document.getElementsByTagName("iframe");
        for (i = 0, len = list.length; i < len; i++) {
          e = list[i];
          e.classList.remove("ignoreMouseEvents");
        }
      };
    })(this));
    window.addEventListener("resize", (function(_this) {
      return function(event) {
        return _this.update();
      };
    })(this));
    this.update();
  }

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
        w1 = Math.round(this.position / 100 * w);
        w2 = w1 + this.splitbar.clientWidth;
        w3 = this.element.clientWidth - w2;
        this.side1.style.width = w1 + "px";
        this.splitbar.style.left = w1 + "px";
        return this.side2.style.width = w3 + "px";
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
