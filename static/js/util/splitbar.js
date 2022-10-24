this.SplitBar = class SplitBar {
  constructor(id, type = "horizontal") {
    this.id = id;
    this.type = type;
    this.element = document.getElementById(this.id);
    this.side1 = this.element.childNodes[0];
    this.splitbar = this.element.childNodes[1];
    this.side2 = this.element.childNodes[2];
    this.position = 50;
    this.closed1 = false;
    this.closed2 = false;
    this.splitbar_size = 10;
    this.splitbar.addEventListener("touchstart", (event) => {
      if ((event.touches != null) && (event.touches[0] != null)) {
        return this.startDrag(event.touches[0]);
      }
    });
    document.addEventListener("touchmove", (event) => {
      if ((event.touches != null) && (event.touches[0] != null)) {
        return this.drag(event.touches[0]);
      }
    });
    document.addEventListener("touchend", (event) => {
      return this.stopDrag();
    });
    document.addEventListener("touchcancel", (event) => {
      return this.stopDrag();
    });
    this.splitbar.addEventListener("mousedown", (event) => {
      return this.startDrag(event);
    });
    document.addEventListener("mousemove", (event) => {
      return this.drag(event);
    });
    document.addEventListener("mouseup", (event) => {
      return this.stopDrag(event);
    });
    window.addEventListener("resize", (event) => {
      return this.update();
    });
    this.update();
  }

  startDrag(event) {
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
  }

  drag(event) {
    var dx, dy, ns;
    if (this.dragging) {
      switch (this.type) {
        case "horizontal":
          dx = (event.clientX - this.drag_start_x) / (this.element.clientWidth - this.splitbar.clientWidth) * 100;
          ns = Math.round(Math.max(0, Math.min(100, this.drag_position + dx)));
          if (ns !== this.position) {
            this.position = ns;
            window.dispatchEvent(new Event('resize'));
            return this.savePosition();
          }
          break;
        default:
          dy = (event.clientY - this.drag_start_y) / (this.element.clientHeight - this.splitbar.clientHeight) * 100;
          ns = Math.round(Math.max(0, Math.min(100, this.drag_position + dy)));
          if (ns !== this.position) {
            this.position = ns;
            window.dispatchEvent(new Event('resize'));
            return this.savePosition();
          }
      }
    }
  }

  stopDrag() {
    var e, i, len, list;
    this.dragging = false;
    list = document.getElementsByTagName("iframe");
    for (i = 0, len = list.length; i < len; i++) {
      e = list[i];
      e.classList.remove("ignoreMouseEvents");
    }
  }

  initPosition(default_position = 50) {
    var load;
    load = localStorage.getItem(`splitbar-${this.id}`);
    if ((load != null) && load >= 0 && load <= 100) {
      if (load >= 98 || load <= 2) {
        load = default_position;
      }
      return this.setPosition(load * 1, false);
    } else {
      return this.setPosition(default_position, false);
    }
  }

  setPosition(position, save = true) {
    this.position = position;
    this.update();
    if (save) {
      return this.savePosition();
    }
  }

  savePosition() {
    return localStorage.setItem(`splitbar-${this.id}`, this.position);
  }

  update() {
    var h, h1, h2, h3, w, w1, w2, w3;
    if (this.element.clientWidth === 0 || this.element.clientHeight === 0) {
      return;
    }
    switch (this.type) {
      case "horizontal":
        this.total_width = w = this.element.clientWidth - this.splitbar.clientWidth;
        if (this.closed2) {
          this.side1.style.width = this.element.clientWidth + "px";
          this.splitbar.style.display = "none";
          return this.side2.style.display = "none";
        } else if (this.closed1) {
          this.side2.style.width = this.element.clientWidth + "px";
          this.splitbar.style.display = "none";
          return this.side1.style.display = "none";
        } else {
          this.side1.style.display = "block";
          this.side2.style.display = "block";
          w1 = Math.min(Math.max(1, Math.round(this.position / 100 * w)), Math.round(w - 1));
          w2 = w1 + Math.max(this.splitbar.clientWidth, this.splitbar_size);
          w3 = this.element.clientWidth - w2;
          this.side1.style.width = w1 + "px";
          this.splitbar.style.left = w1 + "px";
          this.side2.style.width = w3 + "px";
          return this.splitbar.style.display = "block";
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
  }

};
