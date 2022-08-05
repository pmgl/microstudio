this.TutorialWindow = (function() {
  function TutorialWindow(app) {
    this.app = app;
    this.window = document.getElementById("tutorial-window");
    document.querySelector("#tutorial-window").addEventListener("mousedown", (function(_this) {
      return function(event) {
        return _this.moveToFront();
      };
    })(this));
    document.querySelector("#tutorial-window .titlebar").addEventListener("click", (function(_this) {
      return function(event) {
        return _this.uncollapse();
      };
    })(this));
    document.querySelector("#tutorial-window .titlebar").addEventListener("mousedown", (function(_this) {
      return function(event) {
        return _this.startMove(event);
      };
    })(this));
    document.querySelector("#tutorial-window .navigation .resize").addEventListener("mousedown", (function(_this) {
      return function(event) {
        return _this.startResize(event);
      };
    })(this));
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
    document.querySelector("#tutorial-window .navigation .previous").addEventListener("click", (function(_this) {
      return function() {
        return _this.previousStep();
      };
    })(this));
    document.querySelector("#tutorial-window .navigation .next").addEventListener("click", (function(_this) {
      return function() {
        return _this.nextStep();
      };
    })(this));
    document.querySelector("#tutorial-window .titlebar .minify").addEventListener("click", (function(_this) {
      return function() {
        return _this.close();
      };
    })(this));
    this.highlighter = new Highlighter(this);
    this.max_ratio = .75;
  }

  TutorialWindow.prototype.moveToFront = function() {
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
  };

  TutorialWindow.prototype.start = function(tutorial) {
    var progress;
    this.tutorial = tutorial;
    this.shown = true;
    this.uncollapse();
    if ((this.tutorial.project_title != null) && (this.app.user == null)) {
      this.app.appui.accountRequired((function(_this) {
        return function() {
          return _this.start(_this.tutorial);
        };
      })(this));
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
  };

  TutorialWindow.prototype.openProject = function() {
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
          this.app.createProject(this.tutorial.project_title.substring(0, i1).trim(), slug, options, (function(_this) {
            return function() {
              return _this.start(_this.tutorial);
            };
          })(this));
          return;
        } else {
          this.app.createProject(this.tutorial.project_title, slug, (function(_this) {
            return function() {
              return _this.start(_this.tutorial);
            };
          })(this));
          return;
        }
      }
      this.app.setProjectTutorial(slug, this.tutorial.link);
      return this.app.appui.setMainSection("projects");
    }
  };

  TutorialWindow.prototype.update = function() {
    if (this.tutorial != null) {
      return this.setStep(this.current_step);
    }
  };

  TutorialWindow.prototype.setStep = function(index) {
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
      document.querySelector("#tutorial-window .navigation .step").style.background = "linear-gradient(90deg,hsl(200,50%,80%) 0%,hsl(200,50%,80%) " + percent + "%,transparent " + percent + "%)";
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
          this.window.style.width = w + "px";
          this.window.style.height = h + "px";
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
    progress = this.app.getTutorialProgress(this.tutorial.link);
    percent = Math.round(this.current_step / (this.tutorial.steps.length - 1) * 100);
    this.app.setTutorialProgress(this.tutorial.link, percent);
    if (this.current_step === this.tutorial.steps.length - 1) {
      document.querySelector("#tutorial-window .navigation .next").classList.add("fa-check");
      document.querySelector("#tutorial-window .navigation .next").classList.remove("fa-arrow-right");
    } else {
      document.querySelector("#tutorial-window .navigation .next").classList.remove("fa-check");
      document.querySelector("#tutorial-window .navigation .next").classList.add("fa-arrow-right");
    }
  };

  TutorialWindow.prototype.nextStep = function() {
    if (this.current_step === this.tutorial.steps.length - 1) {
      return this.close();
    } else {
      return this.setStep(this.current_step + 1);
    }
  };

  TutorialWindow.prototype.previousStep = function() {
    return this.setStep(this.current_step - 1);
  };

  TutorialWindow.prototype.close = function() {
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
      return setTimeout(((function(_this) {
        return function() {
          _this.window.style.top = (b.y + b.height - 10) + "px";
          _this.window.style.left = (b.x + b.width / 2 + 20) + "px";
          _this.window.style.width = "30px";
          _this.window.style.height = "30px";
          return _this.collapsed = true;
        };
      })(this)), 100);
    }
  };

  TutorialWindow.prototype.uncollapse = function() {
    if (this.collapsed) {
      this.collapsed = false;
      this.openProject();
      this.window.style.top = this.pos_top;
      this.window.style.left = this.pos_left;
      this.window.style.width = this.pos_width;
      this.window.style.height = this.pos_height;
      return setTimeout(((function(_this) {
        return function() {
          _this.window.classList.remove("minimized");
          return _this.setStep(_this.current_step);
        };
      })(this)), 100);
    }
  };

  TutorialWindow.prototype.startMove = function(event) {
    this.moving = true;
    this.drag_start_x = event.clientX;
    this.drag_start_y = event.clientY;
    this.drag_pos_x = this.window.getBoundingClientRect().x;
    return this.drag_pos_y = this.window.getBoundingClientRect().y;
  };

  TutorialWindow.prototype.startResize = function(event) {
    this.resizing = true;
    this.drag_start_x = event.clientX;
    this.drag_start_y = event.clientY;
    this.drag_size_w = this.window.getBoundingClientRect().width;
    return this.drag_size_h = this.window.getBoundingClientRect().height;
  };

  TutorialWindow.prototype.mouseMove = function(event) {
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
      this.window.style.width = w + "px";
      this.window.style.height = h + "px";
      b = this.window.getBoundingClientRect();
      if (w > window.innerWidth - b.x || h > window.innerHeight - b.y) {
        return this.setPosition(Math.min(b.x, window.innerWidth - w - 4), Math.min(b.y, window.innerHeight - h - 4));
      }
    }
  };

  TutorialWindow.prototype.mouseUp = function(event) {
    this.moving = false;
    return this.resizing = false;
  };

  TutorialWindow.prototype.setPosition = function(x, y) {
    var b;
    b = this.window.getBoundingClientRect();
    x = Math.max(4, Math.min(window.innerWidth - b.width - 4, x));
    y = Math.max(4, Math.min(window.innerHeight - b.height - 4, y));
    this.window.style.top = y + "px";
    return this.window.style.left = x + "px";
  };

  return TutorialWindow;

})();
