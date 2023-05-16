this.Highlighter = class Highlighter {
  constructor(tutorial) {
    this.tutorial = tutorial;
    this.shown = false;
    this.canvas = document.getElementById("highlighter");
    this.arrow = document.getElementById("highlighter-arrow");
  }

  highlight(ref, auto) {
    var element, h, rect, w, x, y;
    if (ref != null) {
      element = document.querySelector(ref);
    }
    if (element != null) {
      // open main menu when it is collapsed
      if (ref.indexOf(".titlemenu") >= 0 && (document.getElementById("main-menu-button").offsetParent != null)) {
        element = document.getElementById("main-menu-button");
      }
      this.highlighted = element;
      rect = element.getBoundingClientRect();
      if (rect.width === 0) {
        this.hide();
        return;
      }
      x = rect.x + rect.width * .5;
      y = rect.y + rect.height * .5;
      w = Math.floor(rect.width * 1) + 40;
      h = Math.floor(rect.height * 1) + 40;
      this.canvas.width = w;
      this.canvas.height = h;
      this.canvas.style.width = `${w}px`;
      this.canvas.style.height = `${h}px`;
      this.canvas.style.top = `${Math.round(y - h / 2)}px`;
      this.canvas.style.left = `${Math.round(x - w / 2)}px`;
      this.canvas.style.display = "block";
      this.shown = true;
      this.updateCanvas();
      if (this.timeout != null) {
        clearTimeout(this.timeout);
      }
      this.timeout = setTimeout((() => {
        return this.justHide();
      }), 6000);
      if (auto) {
        return this.setAuto(element);
      } else {
        if (this.remove_event_listener != null) {
          return this.remove_event_listener();
        }
      }
    } else {
      return this.hide();
    }
  }

  setAuto(element) {
    var f;
    if (element.tagName === "INPUT" && element.type === "text") {
      f = (event) => {
        if (event.key === "Enter") {
          this.tutorial.nextStep();
          return element.removeEventListener("keydown", f);
        }
      };
      element.addEventListener("keydown", f);
      if (this.remove_event_listener != null) {
        this.remove_event_listener();
      }
      return this.remove_event_listener = () => {
        return element.removeEventListener("keydown", f);
      };
    } else {
      f = () => {
        this.tutorial.nextStep();
        return element.removeEventListener("click", f);
      };
      element.addEventListener("click", f);
      if (this.remove_event_listener != null) {
        this.remove_event_listener();
      }
      return this.remove_event_listener = () => {
        return element.removeEventListener("click", f);
      };
    }
  }

  hide() {
    this.shown = false;
    this.canvas.style.display = "none";
    if (this.remove_event_listener != null) {
      return this.remove_event_listener();
    }
  }

  justHide() {
    this.shown = false;
    return this.canvas.style.display = "none";
  }

  updateCanvas() {
    var amount, context, grd, h, i, j, ref1, w, x, y;
    if (!this.shown) {
      return;
    }
    requestAnimationFrame(() => {
      return this.updateCanvas();
    });
    context = this.canvas.getContext("2d");
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.highlighted.getBoundingClientRect().width === 0) {
      return;
    }
    context.shadowOpacity = 1;
    context.shadowBlur = 5;
    context.shadowColor = "#000";
    grd = context.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    grd.addColorStop(0, "hsl(0,50%,60%)");
    grd.addColorStop(1, "hsl(60,50%,60%)");
    context.strokeStyle = "hsl(30,100%,70%)";
    context.lineWidth = 3;
    context.lineCap = "round";
    w = this.canvas.width / 2 - 5;
    h = this.canvas.height / 2 - 5;
    amount = (Date.now() % 1000) / 500;
    context.globalAlpha = Math.min(1, 2 - amount);
    amount = Math.min(1, amount);
    context.beginPath();
    context.moveTo(this.canvas.width / 2 + w, this.canvas.height / 2);
    for (i = j = 0, ref1 = amount; j <= ref1; i = j += .01) {
      x = Math.cos(i * 2 * Math.PI);
      y = Math.sin(i * 2 * Math.PI);
      x = x > 0 ? Math.sqrt(x) : -Math.sqrt(-x);
      y = y > 0 ? Math.sqrt(y) : -Math.sqrt(-y);
      context.lineTo(this.canvas.width / 2 + x * w, this.canvas.height / 2 + y * h);
    }
    //context.ellipse(@canvas.width/2,@canvas.height/2,w,h,Math.PI,Math.PI*2*Math.min(1,amount),0,true)
    return context.stroke();
  }

};
