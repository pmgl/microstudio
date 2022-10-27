this.TutorialWindow = class TutorialWindow {
  constructor(app) {
    this.app = app;
    this.window = document.getElementById("tutorial-window");
    document.querySelector("#tutorial-window").addEventListener("mousedown", (event) => {
      return this.moveToFront();
    });
    document.querySelector("#tutorial-window .titlebar").addEventListener("click", (event) => {
      return this.uncollapse();
    });
    document.querySelector("#tutorial-window .titlebar").addEventListener("mousedown", (event) => {
      return this.startMove(event);
    });
    document.querySelector("#tutorial-window .navigation .resize").addEventListener("mousedown", (event) => {
      return this.startResize(event);
    });
    document.addEventListener("mousemove", (event) => {
      return this.mouseMove(event);
    });
    document.addEventListener("mouseup", (event) => {
      return this.mouseUp(event);
    });
    window.addEventListener("resize", () => {
      var b;
      b = this.window.getBoundingClientRect();
      return this.setPosition(b.x, b.y);
    });
    document.querySelector("#tutorial-window .navigation .previous").addEventListener("click", () => {
      return this.previousStep();
    });
    document.querySelector("#tutorial-window .navigation .next").addEventListener("click", () => {
      return this.nextStep();
    });
    document.querySelector("#tutorial-window .titlebar .minify").addEventListener("click", () => {
      return this.close();
    });
    this.highlighter = new Highlighter(this);
    this.max_ratio = .75;
  }

  moveToFront() {
    var e, i, len, list;
    list = document.getElementsByClassName("floating-window");
    for (i = 0, len = list.length; i < len; i++) {
      e = list[i];
      if (e.id === "tutorial-window") {
        e.style["z-index"] = 11;
      } else {
        e.style["z-index"] = 10;
      }
    }
  }

  start(tutorial) {
    var progress;
    this.tutorial = tutorial;
    this.shown = true;
    this.uncollapse();
    if ((this.tutorial.project_title != null) && (this.app.user == null)) {
      this.app.appui.accountRequired(() => {
        return this.start(this.tutorial);
      });
      return;
    }
    this.openProject();
    document.getElementById("tutorial-window").style.display = "block";
    document.querySelector("#tutorial-window .title").innerText = this.tutorial.title;
    progress = this.app.getTutorialProgress(this.tutorial.link);
    this.current_step = Math.round(progress / 100 * (this.tutorial.steps.length - 1));
    if (this.current_step === this.tutorial.steps.length - 1) {
      this.current_step = 0;
    }
    return this.setStep(this.current_step);
  }

  openProject() {
    var err, i, i1, i2, len, options, p, project, ref, slug;
    if (this.tutorial.project_title != null) {
      slug = RegexLib.slugify(this.tutorial.project_title.split("{")[0]);
      project = null;
      ref = this.app.projects;
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        if (p.slug === slug) {
          if ((this.app.project == null) || this.app.project.id !== p.id) {
            this.app.openProject(p);
          }
          project = p;
          break;
        }
      }
      if (project == null) {
        i1 = this.tutorial.project_title.indexOf("{");
        i2 = this.tutorial.project_title.lastIndexOf("}");
        if (i1 > 0 && i2 > i1) {
          options = {};
          try {
            options = JSON.parse(this.tutorial.project_title.substring(i1, i2 + 1));
          } catch (error) {
            err = error;
            console.error(err);
          }
          this.app.createProject(this.tutorial.project_title.substring(0, i1).trim(), slug, options, () => {
            return this.start(this.tutorial);
          });
          return;
        } else {
          this.app.createProject(this.tutorial.project_title, slug, () => {
            return this.start(this.tutorial);
          });
          return;
        }
      }
      this.app.setProjectTutorial(slug, this.tutorial.link);
      this.app.appui.setMainSection("projects");
      return this.app.appui.setSection("code");
    }
  }

  update() {
    if (this.tutorial != null) {
      return this.setStep(this.current_step);
    }
  }

  setStep(index) {
    var c, e, element, h, i, len, percent, progress, ref, s, step, w;
    if (this.tutorial != null) {
      index = Math.max(0, Math.min(this.tutorial.steps.length - 1, index));
      this.current_step = index;
      step = this.tutorial.steps[index];
      e = document.querySelector("#tutorial-window .content");
      e.innerHTML = "";
      ref = step.content;
      for (i = 0, len = ref.length; i < len; i++) {
        c = ref[i];
        e.appendChild(c);
      }
      e.scrollTo(0, 0);
      document.querySelector("#tutorial-window .navigation .step").innerText = (index + 1) + " / " + this.tutorial.steps.length;
      percent = Math.round(this.current_step / (this.tutorial.steps.length - 1) * 100);
      document.querySelector("#tutorial-window .navigation .step").style.background = `linear-gradient(90deg,hsl(200,50%,80%) 0%,hsl(200,50%,80%) ${percent}%,transparent ${percent}%)`;
      if (step.navigate != null) {
        s = step.navigate.split(".");
        this.app.appui.setMainSection(s[0]);
        if (s[1] != null) {
          this.app.appui.setSection(s[1]);
        }
        switch (s[2]) {
          case "console":
            this.app.appui.code_splitbar.setPosition(0);
            this.app.appui.runtime_splitbar.setPosition(0);
        }
      }
      if (step.position != null) {
        s = step.position.split(",");
        if (s.length === 4) {
          w = Math.floor(Math.max(200, Math.min(window.innerWidth * s[2] / 100)));
          h = Math.floor(Math.max(200, Math.min(window.innerHeight * s[3] / 100)));
          this.window.style.width = `${w}px`;
          this.window.style.height = `${h}px`;
          this.setPosition(s[0] * window.innerWidth / 100, s[1] * window.innerHeight / 100);
        }
      }
      if (step.highlight != null) {
        this.highlighter.highlight(step.highlight, step.auto === true);
      } else {
        this.highlighter.hide();
      }
      if ((step.auto != null) && step.auto !== true) {
        element = document.querySelector(step.auto);
        if (element != null) {
          this.highlighter.setAuto(element);
        }
      }
      if (step.overlay) {
        document.getElementById("tutorial-overlay").style.display = "block";
      } else {
        document.getElementById("tutorial-overlay").style.display = "none";
      }
    }
    //if @current_step>0
    progress = this.app.getTutorialProgress(this.tutorial.link);
    percent = Math.round(this.current_step / (this.tutorial.steps.length - 1) * 100);
    //if percent>progress
    this.app.setTutorialProgress(this.tutorial.link, percent);
    if (this.current_step === this.tutorial.steps.length - 1) {
      document.querySelector("#tutorial-window .navigation .next").classList.add("fa-check");
      document.querySelector("#tutorial-window .navigation .next").classList.remove("fa-arrow-right");
    } else {
      document.querySelector("#tutorial-window .navigation .next").classList.remove("fa-check");
      document.querySelector("#tutorial-window .navigation .next").classList.add("fa-arrow-right");
    }
  }

  nextStep() {
    if (this.current_step === this.tutorial.steps.length - 1) {
      return this.close();
    } else {
      return this.setStep(this.current_step + 1);
    }
  }

  previousStep() {
    return this.setStep(this.current_step - 1);
  }

  close() {
    var b, button;
    if (this.current_step === this.tutorial.steps.length - 1) {
      this.shown = false;
      if (this.tutorial.back_to_tutorials) {
        this.app.appui.setMainSection("tutorials");
      }
      document.getElementById("tutorial-window").style.display = "none";
      this.highlighter.hide();
      return document.getElementById("tutorial-overlay").style.display = "none";
    } else {
      this.highlighter.hide();
      document.getElementById("tutorial-overlay").style.display = "none";
      this.pos_top = this.window.style.top;
      this.pos_left = this.window.style.left;
      this.pos_width = this.window.style.width;
      this.pos_height = this.window.style.height;
      button = document.getElementById("menu-tutorials");
      b = button.getBoundingClientRect();
      this.window.classList.add("minimized");
      return setTimeout((() => {
        this.window.style.top = (b.y + b.height - 10) + "px";
        this.window.style.left = (b.x + b.width / 2 + 20) + "px";
        this.window.style.width = "30px";
        this.window.style.height = "30px";
        return this.collapsed = true;
      }), 100);
    }
  }

  uncollapse() {
    if (this.collapsed) {
      this.collapsed = false;
      this.openProject();
      this.window.style.top = this.pos_top;
      this.window.style.left = this.pos_left;
      this.window.style.width = this.pos_width;
      this.window.style.height = this.pos_height;
      return setTimeout((() => {
        this.window.classList.remove("minimized");
        return this.setStep(this.current_step);
      }), 100);
    }
  }

  startMove(event) {
    this.moving = true;
    this.drag_start_x = event.clientX;
    this.drag_start_y = event.clientY;
    this.drag_pos_x = this.window.getBoundingClientRect().x;
    return this.drag_pos_y = this.window.getBoundingClientRect().y;
  }

  startResize(event) {
    this.resizing = true;
    this.drag_start_x = event.clientX;
    this.drag_start_y = event.clientY;
    this.drag_size_w = this.window.getBoundingClientRect().width;
    return this.drag_size_h = this.window.getBoundingClientRect().height;
  }

  mouseMove(event) {
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
      this.window.style.width = `${w}px`;
      this.window.style.height = `${h}px`;
      b = this.window.getBoundingClientRect();
      if (w > window.innerWidth - b.x || h > window.innerHeight - b.y) {
        return this.setPosition(Math.min(b.x, window.innerWidth - w - 4), Math.min(b.y, window.innerHeight - h - 4));
      }
    }
  }

  mouseUp(event) {
    this.moving = false;
    return this.resizing = false;
  }

  setPosition(x, y) {
    var b;
    b = this.window.getBoundingClientRect();
    x = Math.max(4, Math.min(window.innerWidth - b.width - 4, x));
    y = Math.max(4, Math.min(window.innerHeight - b.height - 4, y));
    this.window.style.top = y + "px";
    return this.window.style.left = x + "px";
  }

};
