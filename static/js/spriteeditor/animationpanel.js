this.AnimationPanel = (function() {
  function AnimationPanel(sprite_editor) {
    this.sprite_editor = sprite_editor;
    this.panel_shown = false;
    this.animation_preview = new AnimationPreview(this.sprite_editor);
    document.querySelector("#sprite-animation-title").addEventListener("click", (function(_this) {
      return function() {
        return _this.togglePanel();
      };
    })(this));
    document.querySelector("#add-frame-button").addEventListener("click", (function(_this) {
      return function() {
        _this.addFrame();
        return document.querySelector("#add-frame-button").scrollIntoView();
      };
    })(this));
  }

  AnimationPanel.prototype.hidePanel = function() {
    this.panel_shown = false;
    document.querySelector("#sprite-animation-title").classList.add("collapsed");
    document.querySelector("#sprite-animation-panel").classList.add("collapsed");
    document.querySelector("#sprite-animation-title i").classList.add("fa-caret-right");
    document.querySelector("#sprite-animation-title i").classList.remove("fa-caret-down");
    document.querySelector("#spriteeditorcontainer").classList.add("expanded");
    return this.sprite_editor.spriteview.windowResized();
  };

  AnimationPanel.prototype.showPanel = function() {
    if (this.sprite_editor.selected_sprite === "icon") {
      return;
    }
    this.panel_shown = true;
    document.querySelector("#sprite-animation-title").classList.remove("collapsed");
    document.querySelector("#sprite-animation-panel").classList.remove("collapsed");
    document.querySelector("#sprite-animation-title i").classList.remove("fa-caret-right");
    document.querySelector("#sprite-animation-title i").classList.add("fa-caret-down");
    document.querySelector("#spriteeditorcontainer").classList.remove("expanded");
    return this.sprite_editor.spriteview.windowResized();
  };

  AnimationPanel.prototype.togglePanel = function() {
    if (this.panel_shown) {
      return this.hidePanel();
    } else {
      return this.showPanel();
    }
  };

  AnimationPanel.prototype.spriteChanged = function() {
    if (this.sprite_editor.selected_sprite === "icon" || (this.sprite_editor.selected_sprite == null)) {
      document.querySelector("#sprite-animation-title").style.display = "none";
      this.hidePanel();
    } else {
      document.querySelector("#sprite-animation-title").style.display = "block";
      if (this.sprite_editor.spriteview.sprite.frames.length > 1) {
        this.showPanel();
      } else {
        this.hidePanel();
      }
      this.animation_preview.fps = this.sprite_editor.spriteview.sprite.fps;
      this.animation_preview.setSlider();
    }
    return this.updateFrames();
  };

  AnimationPanel.prototype.addFrame = function() {
    var sprite;
    sprite = this.sprite_editor.spriteview.sprite;
    if (sprite.undo == null) {
      sprite.undo = new Undo();
    }
    if (sprite.undo.empty()) {
      sprite.undo.pushState(sprite.clone());
    }
    this.sprite_editor.spriteview.sprite.addFrame();
    this.updateFrames();
    this.sprite_editor.spriteview.setCurrentFrame(this.sprite_editor.spriteview.sprite.frames.length - 1);
    this.sprite_editor.spriteview.update();
    this.updateSelection();
    return sprite.undo.pushState(sprite.clone());
  };

  AnimationPanel.prototype.updateFrames = function() {
    var frame, i, j, len, list, ref, s;
    s = this.sprite_editor.spriteview.sprite;
    list = document.querySelector("#sprite-animation-list");
    list.innerHTML = "";
    this.frames = [];
    ref = s.frames;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      frame = ref[i];
      list.appendChild(this.createFrameView(frame, i));
    }
  };

  AnimationPanel.prototype.updateSelection = function() {
    var c, i, j, len, ref, results;
    ref = document.getElementById("sprite-animation-list").children;
    results = [];
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      c = ref[i];
      if (i === this.sprite_editor.spriteview.sprite.current_frame) {
        results.push(c.classList.add("selected"));
      } else {
        results.push(c.classList.remove("selected"));
      }
    }
    return results;
  };

  AnimationPanel.prototype.createFrameView = function(frame, index) {
    var canvas, context, div, h, r, span, w;
    div = document.createElement("div");
    div.classList.add("sprite-animation-frame");
    if (index === this.sprite_editor.spriteview.sprite.current_frame) {
      div.classList.add("selected");
    }
    canvas = document.createElement("canvas");
    canvas.width = 80;
    canvas.height = 80;
    context = canvas.getContext("2d");
    context.imageSmoothingEnabled = false;
    r = Math.min(80 / frame.width, 80 / frame.height);
    w = r * frame.width;
    h = r * frame.height;
    context.drawImage(frame.getCanvas(), 40 - w / 2, 40 - h / 2, w, h);
    div.appendChild(canvas);
    canvas.addEventListener("click", (function(_this) {
      return function() {
        return _this.doFrameOption(index, "select");
      };
    })(this));
    div.appendChild(this.createFrameOption("clone", "clone", "Duplicate Frame", index));
    if (this.sprite_editor.spriteview.sprite.frames.length > 1) {
      div.appendChild(this.createFrameOption("remove", "times", "Delete Frame", index));
    }
    div.appendChild(this.createFrameOption("moveleft", "arrow-left", "Move Left", index));
    div.appendChild(this.createFrameOption("moveright", "arrow-right", "Move Right", index));
    span = document.createElement("span");
    span.innerHTML = "" + index;
    div.appendChild(span);
    this.frames[index] = canvas;
    return div;
  };

  AnimationPanel.prototype.createFrameOption = function(option, icon, text, index) {
    var i;
    i = document.createElement("i");
    i.classList.add(option);
    i.classList.add("fa");
    i.classList.add("fa-" + icon);
    i.title = this.sprite_editor.app.translator.get(text);
    i.addEventListener("click", (function(_this) {
      return function() {
        return _this.doFrameOption(index, option);
      };
    })(this));
    return i;
  };

  AnimationPanel.prototype.doFrameOption = function(index, option) {
    var f, frame, sprite;
    switch (option) {
      case "select":
        this.sprite_editor.spriteview.setCurrentFrame(index);
        this.sprite_editor.spriteview.update();
        return this.updateSelection();
      case "clone":
        sprite = this.sprite_editor.spriteview.sprite;
        if (sprite.undo == null) {
          sprite.undo = new Undo();
        }
        if (sprite.undo.empty()) {
          sprite.undo.pushState(sprite.clone());
        }
        f = this.sprite_editor.spriteview.sprite.frames[index];
        frame = f.clone();
        this.sprite_editor.spriteview.sprite.frames.splice(index, 0, frame);
        this.updateFrames();
        this.doFrameOption(index + 1, "select");
        this.sprite_editor.spriteChanged();
        return sprite.undo.pushState(sprite.clone());
      case "remove":
        if (this.sprite_editor.spriteview.sprite.frames.length > 1) {
          sprite = this.sprite_editor.spriteview.sprite;
          if (sprite.undo == null) {
            sprite.undo = new Undo();
          }
          if (sprite.undo.empty()) {
            sprite.undo.pushState(sprite.clone());
          }
          this.sprite_editor.spriteview.sprite.frames.splice(index, 1);
          this.updateFrames();
          this.doFrameOption(Math.max(0, index - 1), "select");
          this.sprite_editor.spriteChanged();
          return sprite.undo.pushState(sprite.clone());
        }
        break;
      case "moveleft":
        if (index > 0) {
          sprite = this.sprite_editor.spriteview.sprite;
          if (sprite.undo == null) {
            sprite.undo = new Undo();
          }
          if (sprite.undo.empty()) {
            sprite.undo.pushState(sprite.clone());
          }
          frame = this.sprite_editor.spriteview.sprite.frames.splice(index, 1)[0];
          this.sprite_editor.spriteview.sprite.frames.splice(index - 1, 0, frame);
          this.updateFrames();
          this.doFrameOption(index - 1, "select");
          this.sprite_editor.spriteChanged();
          return sprite.undo.pushState(sprite.clone());
        }
        break;
      case "moveright":
        if (index < this.sprite_editor.spriteview.sprite.frames.length - 1) {
          sprite = this.sprite_editor.spriteview.sprite;
          if (sprite.undo == null) {
            sprite.undo = new Undo();
          }
          if (sprite.undo.empty()) {
            sprite.undo.pushState(sprite.clone());
          }
          frame = this.sprite_editor.spriteview.sprite.frames.splice(index, 1)[0];
          this.sprite_editor.spriteview.sprite.frames.splice(index + 1, 0, frame);
          this.updateFrames();
          this.doFrameOption(index + 1, "select");
          this.sprite_editor.spriteChanged();
          return sprite.undo.pushState(sprite.clone());
        }
    }
  };

  AnimationPanel.prototype.frameUpdated = function() {
    var context, frame, h, index, j, r, ref, results, w;
    results = [];
    for (index = j = 0, ref = this.frames.length - 1; j <= ref; index = j += 1) {
      context = this.frames[index].getContext("2d");
      context.clearRect(0, 0, 80, 80);
      frame = this.sprite_editor.spriteview.sprite.frames[index];
      if (frame != null) {
        r = Math.min(80 / frame.width, 80 / frame.height);
        w = r * frame.width;
        h = r * frame.height;
        results.push(context.drawImage(frame.getCanvas(), 40 - w / 2, 40 - h / 2, w, h));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  return AnimationPanel;

})();

this.AnimationPreview = (function() {
  function AnimationPreview(sprite_editor) {
    this.sprite_editor = sprite_editor;
    this.canvas = document.querySelector("#sprite-animation-preview canvas");
    this.context = this.canvas.getContext("2d");
    this.context.imageSmoothingEnabled = false;
    this.frame = 0;
    this.last = Date.now();
    this.fps = 5;
    this.timer();
    this.input = document.querySelector("#sprite-animation-preview input");
    this.input.addEventListener("input", (function(_this) {
      return function() {
        _this.fps = 1 + Math.round(Math.pow(_this.input.value / 100, 2) * 59);
        _this.sprite_editor.spriteview.sprite.fps = _this.fps;
        _this.sprite_editor.spriteChanged();
        return _this.last = 0;
      };
    })(this));
    this.input.addEventListener("mouseenter", (function(_this) {
      return function() {
        _this.fps_change = true;
        return _this.last = 0;
      };
    })(this));
    this.input.addEventListener("mouseout", (function(_this) {
      return function() {
        _this.fps_change = false;
        return _this.last = 0;
      };
    })(this));
    this.setSlider();
  }

  AnimationPreview.prototype.setSlider = function() {
    return this.input.value = Math.pow((this.fps - 1) / 59, 1 / 2) * 100;
  };

  AnimationPreview.prototype.timer = function() {
    requestAnimationFrame((function(_this) {
      return function() {
        return _this.timer();
      };
    })(this));
    return this.update();
  };

  AnimationPreview.prototype.update = function() {
    var frame, h, r, time, w;
    if (this.sprite_editor.spriteview.sprite != null) {
      time = Date.now();
      if (time > this.last + 1000 / this.fps) {
        this.last += 1000 / this.fps;
        if (this.last < time - 1000) {
          this.last = time;
        }
        this.frame = (this.frame + 1) % this.sprite_editor.spriteview.sprite.frames.length;
        frame = this.sprite_editor.spriteview.sprite.frames[this.frame];
        r = Math.min(80 / frame.width, 80 / frame.height);
        w = r * frame.width;
        h = r * frame.height;
        this.context.clearRect(0, 0, 80, 80);
        this.context.drawImage(frame.getCanvas(), 40 - w / 2, 40 - h / 2, w, h);
        if (this.fps_change) {
          this.context.font = "12pt Ubuntu Mono";
          this.context.shadowBlur = 2;
          this.context.shadowOpacity = 1;
          this.context.shadowColor = "#000";
          this.context.fillStyle = "#FFF";
          this.context.textAlign = "center";
          this.context.textBaseline = "middle";
          this.context.fillText(this.fps + " FPS", 40, 70);
          this.context.shadowBlur = 0;
          return this.context.shadowOpacity = 0;
        }
      }
    }
  };

  return AnimationPreview;

})();
