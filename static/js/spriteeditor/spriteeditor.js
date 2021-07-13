this.SpriteEditor = (function() {
  function SpriteEditor(app) {
    var i, l, len, ref, tool;
    this.app = app;
    this.spriteview = new SpriteView(this);
    this.auto_palette = new AutoPalette(this);
    this.colorpicker = new ColorPicker(this);
    document.getElementById("colorpicker").appendChild(this.colorpicker.canvas);
    this.animation_panel = new AnimationPanel(this);
    this.save_delay = 1000;
    this.save_time = 0;
    setInterval(((function(_this) {
      return function() {
        return _this.checkSave();
      };
    })(this)), this.save_delay / 2);
    this.app.appui.setAction("create-sprite-button", (function(_this) {
      return function() {
        return _this.createSprite();
      };
    })(this));
    this.sprite_name_validator = new InputValidator(document.getElementById("sprite-name"), document.getElementById("sprite-name-button"), null, (function(_this) {
      return function(value) {
        var name, old;
        if (_this.app.project.isLocked("sprites/" + _this.selected_sprite + ".png")) {
          return;
        }
        _this.app.project.lockFile("sprites/" + _this.selected_sprite + ".png");
        name = value[0].toLowerCase();
        name = RegexLib.fixFilename(name);
        document.getElementById("sprite-name").value = name;
        _this.sprite_name_validator.update();
        if (_this.selected_sprite !== "icon" && name !== _this.selected_sprite && RegexLib.filename.test(name) && (_this.app.project.getSprite(name) == null)) {
          old = _this.selected_sprite;
          _this.selected_sprite = name;
          _this.spriteview.sprite.rename(name);
          _this.app.project.changeSpriteName(old, name);
          _this.app.project.lockFile("sprites/" + _this.selected_sprite + ".png");
          return _this.saveSprite(function() {
            return _this.app.client.sendRequest({
              name: "delete_project_file",
              project: _this.app.project.id,
              file: "sprites/" + old + ".png"
            }, function(msg) {
              return _this.app.project.updateSpriteList();
            });
          });
        }
      };
    })(this));
    this.sprite_name_validator.regex = RegexLib.filename;
    document.getElementById("sprite-width").addEventListener("input", (function(_this) {
      return function(event) {
        return _this.spriteDimensionChanged("width");
      };
    })(this));
    document.getElementById("sprite-height").addEventListener("input", (function(_this) {
      return function(event) {
        return _this.spriteDimensionChanged("height");
      };
    })(this));
    this.sprite_size_validator = new InputValidator([document.getElementById("sprite-width"), document.getElementById("sprite-height")], document.getElementById("sprite-size-button"), null, (function(_this) {
      return function(value) {
        return _this.saveDimensionChange(value);
      };
    })(this));
    this.selected_sprite = null;
    this.app.appui.setAction("undo-sprite", (function(_this) {
      return function() {
        return _this.undo();
      };
    })(this));
    this.app.appui.setAction("redo-sprite", (function(_this) {
      return function() {
        return _this.redo();
      };
    })(this));
    this.app.appui.setAction("copy-sprite", (function(_this) {
      return function() {
        return _this.copy();
      };
    })(this));
    this.app.appui.setAction("cut-sprite", (function(_this) {
      return function() {
        return _this.cut();
      };
    })(this));
    this.app.appui.setAction("paste-sprite", (function(_this) {
      return function() {
        return _this.paste();
      };
    })(this));
    this.app.appui.setAction("delete-sprite", (function(_this) {
      return function() {
        return _this.deleteSprite();
      };
    })(this));
    this.app.appui.setAction("sprite-helper-tile", (function(_this) {
      return function() {
        return _this.toggleTile();
      };
    })(this));
    this.app.appui.setAction("sprite-helper-vsymmetry", (function(_this) {
      return function() {
        return _this.toggleVSymmetry();
      };
    })(this));
    this.app.appui.setAction("sprite-helper-hsymmetry", (function(_this) {
      return function() {
        return _this.toggleHSymmetry();
      };
    })(this));
    this.app.appui.setAction("selection-operation-film", (function(_this) {
      return function() {
        return _this.stripToAnimation();
      };
    })(this));
    document.addEventListener("keydown", (function(_this) {
      return function(event) {
        if (document.getElementById("spriteeditor").offsetParent == null) {
          return;
        }
        if (event.key === "Alt" && !_this.tool.selectiontool) {
          _this.setColorPicker(true);
          _this.alt_pressed = true;
        }
        if (event.metaKey || event.ctrlKey) {
          switch (event.key) {
            case "z":
              return _this.undo();
            case "Z":
              return _this.redo();
            case "c":
              return _this.copy();
            case "x":
              return _this.cut();
            case "v":
              return _this.paste();
          }
        }
      };
    })(this));
    document.addEventListener("keyup", (function(_this) {
      return function(event) {
        if (event.key === "Alt" && !_this.tool.selectiontool) {
          _this.setColorPicker(false);
          return _this.alt_pressed = false;
        }
      };
    })(this));
    document.getElementById("eyedropper").addEventListener("click", (function(_this) {
      return function() {
        return _this.setColorPicker(!_this.spriteview.colorpicker);
      };
    })(this));
    ref = DrawTool.tools;
    for (i = l = 0, len = ref.length; l < len; i = ++l) {
      tool = ref[i];
      this.createToolButton(tool);
      this.createToolOptions(tool);
    }
    this.setSelectedTool(DrawTool.tools[0].icon);
    document.getElementById("spritelist").addEventListener("dragover", (function(_this) {
      return function(event) {
        return event.preventDefault();
      };
    })(this));
    document.getElementById("spritelist").addEventListener("drop", (function(_this) {
      return function(event) {
        var err, funk, len1, list, o, ref1;
        event.preventDefault();
        try {
          list = [];
          ref1 = event.dataTransfer.items;
          for (o = 0, len1 = ref1.length; o < len1; o++) {
            i = ref1[o];
            list.push(i.getAsFile());
          }
          funk = function() {
            var file, img, reader;
            if (list.length > 0) {
              file = list.splice(0, 1)[0];
              console.info("processing " + file.name);
              img = new Image;
              reader = new FileReader();
              reader.addEventListener("load", function() {
                return img.src = reader.result;
              });
              reader.readAsDataURL(file);
              return img.onload = function() {
                if (img.complete && img.width > 0 && img.height > 0 && img.width <= 2048 && img.height <= 2048) {
                  return _this.createSprite(RegexLib.fixFilename(file.name.split(".")[0]), img, function() {
                    return funk();
                  });
                }
              };
            }
          };
          return funk();
        } catch (error) {
          err = error;
          return console.error(err);
        }
      };
    })(this));
  }

  SpriteEditor.prototype.createToolButton = function(tool) {
    var div, parent;
    parent = document.getElementById("spritetools");
    div = document.createElement("div");
    div.classList.add("spritetoolbutton");
    div.title = tool.name;
    div.innerHTML = "<i class='fa " + tool.icon + "'></i><br />" + (this.app.translator.get(tool.name));
    div.addEventListener("click", (function(_this) {
      return function() {
        return _this.setSelectedTool(tool.icon);
      };
    })(this));
    div.id = "spritetoolbutton-" + tool.icon;
    return parent.appendChild(div);
  };

  SpriteEditor.prototype.createToolOptions = function(tool) {
    var button, div, fn, i, k, key, l, len, p, parent, ref, ref1, t, toolbox;
    parent = document.getElementById("spritetooloptionslist");
    div = document.createElement("div");
    ref = tool.parameters;
    for (key in ref) {
      p = ref[key];
      if (p.type === "range") {
        (function(_this) {
          return (function(p, key) {
            var input, label;
            label = document.createElement("label");
            label.innerText = key;
            div.appendChild(label);
            input = document.createElement("input");
            input.type = "range";
            input.min = "0";
            input.max = "100";
            input.value = p.value;
            input.addEventListener("input", function(event) {
              p.value = input.value;
              if (key === "Size") {
                return _this.spriteview.showBrushSize();
              }
            });
            return div.appendChild(input);
          });
        })(this)(p, key);
      } else if (p.type === "tool") {
        toolbox = document.createElement("div");
        toolbox.classList.add("toolbox");
        div.appendChild(toolbox);
        ref1 = p.set;
        fn = (function(_this) {
          return function(p, k) {
            return button.addEventListener("click", function() {
              var i, len1, o, ref2, results;
              p.value = k;
              ref2 = p.set;
              results = [];
              for (i = o = 0, len1 = ref2.length; o < len1; i = ++o) {
                t = ref2[i];
                if (i === k) {
                  results.push(t.button.classList.add("selected"));
                } else {
                  results.push(t.button.classList.remove("selected"));
                }
              }
              return results;
            });
          };
        })(this);
        for (k = l = 0, len = ref1.length; l < len; k = ++l) {
          t = ref1[k];
          button = document.createElement("div");
          button.classList.add("spritetoolbutton");
          if (k === 0) {
            button.classList.add("selected");
          }
          button.title = t.name;
          button.id = "spritetoolbutton-" + t.icon;
          i = document.createElement("i");
          i.classList.add("fa");
          i.classList.add(t.icon);
          button.appendChild(i);
          button.appendChild(document.createElement("br"));
          button.appendChild(document.createTextNode(t.name));
          toolbox.appendChild(button);
          t.button = button;
          fn(p, k);
        }
      }
    }
    div.id = "spritetooloptions-" + tool.icon;
    return parent.appendChild(div);
  };

  SpriteEditor.prototype.setSelectedTool = function(id) {
    var e, l, len, ref, tool;
    ref = DrawTool.tools;
    for (l = 0, len = ref.length; l < len; l++) {
      tool = ref[l];
      e = document.getElementById("spritetoolbutton-" + tool.icon);
      if (tool.icon === id) {
        this.tool = tool;
        e.classList.add("selected");
      } else {
        e.classList.remove("selected");
      }
      e = document.getElementById("spritetooloptions-" + tool.icon);
      if (tool.icon === id) {
        e.style.display = "block";
      } else {
        e.style.display = "none";
      }
    }
    document.getElementById("colorpicker-group").style.display = this.tool.parameters["Color"] != null ? "block" : "none";
    this.spriteview.update();
    return this.updateSelectionHints();
  };

  SpriteEditor.prototype.toggleTile = function() {
    this.spriteview.tile = !this.spriteview.tile;
    this.spriteview.update();
    if (this.spriteview.tile) {
      return document.getElementById("sprite-helper-tile").classList.add("selected");
    } else {
      return document.getElementById("sprite-helper-tile").classList.remove("selected");
    }
  };

  SpriteEditor.prototype.toggleVSymmetry = function() {
    this.spriteview.vsymmetry = !this.spriteview.vsymmetry;
    this.spriteview.update();
    if (this.spriteview.vsymmetry) {
      return document.getElementById("sprite-helper-vsymmetry").classList.add("selected");
    } else {
      return document.getElementById("sprite-helper-vsymmetry").classList.remove("selected");
    }
  };

  SpriteEditor.prototype.toggleHSymmetry = function() {
    this.spriteview.hsymmetry = !this.spriteview.hsymmetry;
    this.spriteview.update();
    if (this.spriteview.hsymmetry) {
      return document.getElementById("sprite-helper-hsymmetry").classList.add("selected");
    } else {
      return document.getElementById("sprite-helper-hsymmetry").classList.remove("selected");
    }
  };

  SpriteEditor.prototype.spriteChanged = function() {
    var s;
    if (this.ignore_changes) {
      return;
    }
    this.app.project.lockFile("sprites/" + this.selected_sprite + ".png");
    this.save_time = Date.now();
    s = this.app.project.getSprite(this.selected_sprite);
    if (s != null) {
      s.updated(this.spriteview.sprite.saveData());
    }
    this.app.project.addPendingChange(this);
    this.animation_panel.frameUpdated();
    this.auto_palette.update();
    this.app.project.notifyListeners(s);
    return this.app.runwindow.updateSprite(this.selected_sprite);
  };

  SpriteEditor.prototype.checkSave = function(immediate, callback) {
    if (immediate == null) {
      immediate = false;
    }
    if (this.save_time > 0 && (immediate || Date.now() > this.save_time + this.save_delay)) {
      this.saveSprite(callback);
      return this.save_time = 0;
    } else {
      if (callback != null) {
        return callback();
      }
    }
  };

  SpriteEditor.prototype.forceSave = function(callback) {
    return this.checkSave(true, callback);
  };

  SpriteEditor.prototype.projectOpened = function() {
    this.app.project.addListener(this);
    return this.setSelectedSprite(null);
  };

  SpriteEditor.prototype.projectUpdate = function(change) {
    var c, name, sprite;
    if (change === "spritelist") {
      return this.rebuildSpriteList();
    } else if (change === "locks") {
      this.updateCurrentFileLock();
      return this.updateActiveUsers();
    } else if (change instanceof ProjectSprite) {
      name = change.name;
      c = document.querySelector("#sprite-image-" + name);
      sprite = change;
      if ((c != null) && (c.updateSprite != null)) {
        return c.updateSprite();
      }
    }
  };

  SpriteEditor.prototype.updateCurrentFileLock = function() {
    var lock, user;
    if (this.selected_sprite != null) {
      this.spriteview.editable = !this.app.project.isLocked("sprites/" + this.selected_sprite + ".png");
    }
    lock = document.getElementById("sprite-editor-locked");
    if ((this.selected_sprite != null) && this.app.project.isLocked("sprites/" + this.selected_sprite + ".png")) {
      user = this.app.project.isLocked("sprites/" + this.selected_sprite + ".png").user;
      lock.style = "display: block; background: " + (this.app.appui.createFriendColor(user));
      return lock.innerHTML = "<i class='fa fa-user'></i> Locked by " + user;
    } else {
      return lock.style = "display: none";
    }
  };

  SpriteEditor.prototype.saveSprite = function(callback) {
    var data, saved, sprite;
    if ((this.selected_sprite == null) || !this.spriteview.sprite) {
      return;
    }
    data = this.spriteview.sprite.saveData().split(",")[1];
    sprite = this.spriteview.sprite;
    saved = false;
    this.app.client.sendRequest({
      name: "write_project_file",
      project: this.app.project.id,
      file: "sprites/" + this.selected_sprite + ".png",
      properties: {
        frames: this.spriteview.sprite.frames.length,
        fps: this.spriteview.sprite.fps
      },
      content: data
    }, (function(_this) {
      return function(msg) {
        saved = true;
        if (_this.save_time === 0) {
          _this.app.project.removePendingChange(_this);
        }
        sprite.size = msg.size;
        if (callback != null) {
          return callback();
        }
      };
    })(this));
    return setTimeout(((function(_this) {
      return function() {
        if (!saved) {
          _this.save_time = Date.now();
          return console.info("retrying sprite save...");
        }
      };
    })(this)), 10000);
  };

  SpriteEditor.prototype.createSprite = function(name, img, callback) {
    return this.checkSave(true, (function(_this) {
      return function() {
        var height, sprite, width;
        if (img != null) {
          width = img.width;
          height = img.height;
        } else if (_this.spriteview.selection != null) {
          width = Math.max(8, _this.spriteview.selection.w);
          height = Math.max(8, _this.spriteview.selection.h);
        } else {
          width = Math.max(8, _this.spriteview.sprite.width);
          height = Math.max(8, _this.spriteview.sprite.height);
        }
        sprite = _this.app.project.createSprite(width, height, name);
        _this.spriteview.setSprite(sprite);
        _this.animation_panel.spriteChanged();
        if (img != null) {
          _this.spriteview.getFrame().getContext().drawImage(img, 0, 0);
        }
        _this.spriteview.update();
        _this.setSelectedSprite(sprite.name);
        _this.spriteview.editable = true;
        return _this.saveSprite(function() {
          _this.rebuildSpriteList();
          if (callback != null) {
            return callback();
          }
        });
      };
    })(this));
  };

  SpriteEditor.prototype.setSelectedSprite = function(sprite) {
    var e, l, len, len1, list, o;
    this.selected_sprite = sprite;
    this.animation_panel.spriteChanged();
    list = document.getElementById("sprite-list").childNodes;
    if (this.selected_sprite != null) {
      for (l = 0, len = list.length; l < len; l++) {
        e = list[l];
        if (e.getAttribute("id") === ("project-sprite-" + sprite)) {
          e.classList.add("selected");
        } else {
          e.classList.remove("selected");
        }
      }
      document.getElementById("sprite-name").value = sprite;
      this.sprite_name_validator.update();
      document.getElementById("sprite-name").disabled = this.selected_sprite === "icon";
      if (this.spriteview.sprite != null) {
        document.getElementById("sprite-width").value = this.spriteview.sprite.width;
        document.getElementById("sprite-height").value = this.spriteview.sprite.height;
        this.sprite_size_validator.update();
      }
      document.getElementById("sprite-width").disabled = false;
      document.getElementById("sprite-height").disabled = false;
      e = document.getElementById("spriteeditor");
      if (e.firstChild != null) {
        e.firstChild.style.display = "inline-block";
      }
      this.spriteview.windowResized();
    } else {
      for (o = 0, len1 = list.length; o < len1; o++) {
        e = list[o];
        e.classList.remove("selected");
      }
      document.getElementById("sprite-name").value = "";
      document.getElementById("sprite-name").disabled = true;
      document.getElementById("sprite-width").disabled = true;
      document.getElementById("sprite-height").disabled = true;
      e = document.getElementById("spriteeditor");
      if (e.firstChild != null) {
        e.firstChild.style.display = "none";
      }
    }
    this.updateCurrentFileLock();
    this.updateSelectionHints();
    return this.auto_palette.update();
  };

  SpriteEditor.prototype.setSprite = function(data) {
    var img;
    data = "data:image/png;base64," + data;
    this.ignore_changes = true;
    img = new Image;
    img.src = data;
    img.crossOrigin = "Anonymous";
    return img.onload = (function(_this) {
      return function() {
        _this.spriteview.sprite.load(img);
        _this.spriteview.windowResized();
        _this.spriteview.update();
        _this.spriteview.editable = true;
        _this.ignore_changes = false;
        _this.spriteview.windowResized();
        document.getElementById("sprite-width").value = _this.spriteview.sprite.width;
        document.getElementById("sprite-height").value = _this.spriteview.sprite.height;
        return _this.sprite_size_validator.update();
      };
    })(this);
  };

  SpriteEditor.prototype.setColor = function(color) {
    this.color = color;
    this.spriteview.setColor(this.color);
    return this.auto_palette.colorPicked(this.color);
  };

  SpriteEditor.prototype.rebuildSpriteList = function() {
    var element, l, len, list, ref, s;
    list = document.getElementById("sprite-list");
    list.innerHTML = "";
    ref = this.app.project.sprite_list;
    for (l = 0, len = ref.length; l < len; l++) {
      s = ref[l];
      element = this.createSpriteBox(s);
      list.appendChild(element);
    }
    this.updateActiveUsers();
    if ((this.selected_sprite != null) && (this.app.project.getSprite(this.selected_sprite) == null)) {
      this.setSelectedSprite(null);
    }
  };

  SpriteEditor.prototype.openSprite = function(s) {
    this.checkSave(true);
    this.spriteview.setSprite(this.app.project.getSprite(s));
    this.spriteview.windowResized();
    this.spriteview.update();
    this.spriteview.editable = true;
    return this.setSelectedSprite(s);
  };

  SpriteEditor.prototype.updateActiveUsers = function() {
    var e, file, l, len, list, lock;
    list = document.getElementById("sprite-list").childNodes;
    for (l = 0, len = list.length; l < len; l++) {
      e = list[l];
      file = e.id.split("-")[2];
      lock = this.app.project.isLocked("sprites/" + file + ".png");
      if ((lock != null) && Date.now() < lock.time) {
        e.querySelector(".active-user").style = "display: block; background: " + (this.app.appui.createFriendColor(lock.user)) + ";";
      } else {
        e.querySelector(".active-user").style = "display: none;";
      }
    }
  };

  SpriteEditor.prototype.createSpriteBox = function(sprite) {
    var activeuser, element, icon, iconbox, text;
    element = document.createElement("div");
    element.classList.add("sprite-box");
    element.setAttribute("id", "project-sprite-" + sprite.name);
    element.setAttribute("title", sprite.name);
    if (sprite.name === this.selected_sprite) {
      element.classList.add("selected");
    }
    iconbox = document.createElement("div");
    iconbox.classList.add("icon-box");
    icon = this.createSpriteThumb(sprite);
    icon.setAttribute("id", "sprite-image-" + sprite.name);
    iconbox.appendChild(icon);
    element.appendChild(iconbox);
    sprite.addImage(icon, 64);
    element.appendChild(document.createElement("br"));
    text = document.createElement("span");
    text.innerHTML = sprite.name;
    element.appendChild(text);
    element.addEventListener("click", (function(_this) {
      return function() {
        return _this.openSprite(sprite.name);
      };
    })(this));
    activeuser = document.createElement("i");
    activeuser.classList.add("active-user");
    activeuser.classList.add("fa");
    activeuser.classList.add("fa-user");
    element.appendChild(activeuser);
    return element;
  };

  SpriteEditor.prototype.createSpriteThumb = function(sprite) {
    var canvas, mouseover, update;
    canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    sprite.addLoadListener((function(_this) {
      return function() {
        var context, frame, h, r, w;
        context = canvas.getContext("2d");
        frame = sprite.frames[0].getCanvas();
        r = Math.min(64 / frame.width, 64 / frame.height);
        context.imageSmoothingEnabled = false;
        w = r * frame.width;
        h = r * frame.height;
        return context.drawImage(frame, 32 - w / 2, 32 - h / 2, w, h);
      };
    })(this));
    mouseover = false;
    update = (function(_this) {
      return function() {
        var context, dt, frame, h, r, t, w;
        if (mouseover && sprite.frames.length > 1) {
          requestAnimationFrame(function() {
            return update();
          });
        }
        dt = 1000 / sprite.fps;
        t = Date.now();
        frame = mouseover ? Math.floor(t / dt) % sprite.frames.length : 0;
        context = canvas.getContext("2d");
        context.imageSmoothingEnabled = false;
        context.clearRect(0, 0, 64, 64);
        frame = sprite.frames[frame].getCanvas();
        r = Math.min(64 / frame.width, 64 / frame.height);
        w = r * frame.width;
        h = r * frame.height;
        return context.drawImage(frame, 32 - w / 2, 32 - h / 2, w, h);
      };
    })(this);
    canvas.addEventListener("mouseenter", (function(_this) {
      return function() {
        mouseover = true;
        return update();
      };
    })(this));
    canvas.addEventListener("mouseout", (function(_this) {
      return function() {
        return mouseover = false;
      };
    })(this));
    canvas.updateSprite = update;
    return canvas;
  };

  SpriteEditor.prototype.spriteDimensionChanged = function(dim) {
    if (this.selected_sprite === "icon") {
      if (dim === "width") {
        return document.getElementById("sprite-height").value = document.getElementById("sprite-width").value;
      } else {
        return document.getElementById("sprite-width").value = document.getElementById("sprite-height").value;
      }
    }
  };

  SpriteEditor.prototype.saveDimensionChange = function(value) {
    var err, h, w;
    if (this.app.project.isLocked("sprites/" + this.selected_sprite + ".png")) {
      return;
    }
    this.app.project.lockFile("sprites/" + this.selected_sprite + ".png");
    w = value[0];
    h = value[1];
    try {
      w = Number.parseFloat(w);
      h = Number.parseFloat(h);
    } catch (error) {
      err = error;
    }
    if ((this.selected_sprite !== "icon" || w === h) && Number.isInteger(w) && Number.isInteger(h) && w > 0 && h > 0 && w < 257 && h < 257 && (this.selected_sprite != null) && (w !== this.spriteview.sprite.width || h !== this.spriteview.sprite.height)) {
      if (this.spriteview.sprite.undo == null) {
        this.spriteview.sprite.undo = new Undo();
      }
      if (this.spriteview.sprite.undo.empty()) {
        this.spriteview.sprite.undo.pushState(this.spriteview.sprite.clone());
      }
      this.spriteview.sprite.resize(w, h);
      this.spriteview.sprite.undo.pushState(this.spriteview.sprite.clone());
      this.spriteview.windowResized();
      this.spriteview.update();
      this.spriteChanged();
      this.checkSave(true);
      document.getElementById("sprite-width").value = this.spriteview.sprite.width;
      document.getElementById("sprite-height").value = this.spriteview.sprite.height;
      return this.sprite_size_validator.update();
    } else {
      document.getElementById("sprite-width").value = this.spriteview.sprite.width;
      document.getElementById("sprite-height").value = this.spriteview.sprite.height;
      return this.sprite_size_validator.update();
    }
  };

  SpriteEditor.prototype.deleteSprite = function() {
    if (this.app.project.isLocked("sprites/" + this.selected_sprite + ".png")) {
      return;
    }
    this.app.project.lockFile("sprites/" + this.selected_sprite + ".png");
    if ((this.selected_sprite != null) && this.selected_sprite !== "icon") {
      if (confirm("Really delete " + this.selected_sprite + "?")) {
        return this.app.client.sendRequest({
          name: "delete_project_file",
          project: this.app.project.id,
          file: "sprites/" + this.selected_sprite + ".png"
        }, (function(_this) {
          return function(msg) {
            _this.app.project.updateSpriteList();
            _this.spriteview.sprite = new Sprite(16, 16);
            _this.spriteview.update();
            _this.spriteview.editable = false;
            return _this.setSelectedSprite(null);
          };
        })(this));
      }
    }
  };

  SpriteEditor.prototype.undo = function() {
    var s;
    if (this.app.project.isLocked("sprites/" + this.selected_sprite + ".png")) {
      return;
    }
    this.app.project.lockFile("sprites/" + this.selected_sprite + ".png");
    if (this.spriteview.sprite && (this.spriteview.sprite.undo != null)) {
      s = this.spriteview.sprite.undo.undo((function(_this) {
        return function() {
          return _this.spriteview.sprite.clone();
        };
      })(this));
      this.spriteview.selection = null;
      if (s != null) {
        this.spriteview.sprite.copyFrom(s);
        this.spriteview.update();
        document.getElementById("sprite-width").value = this.spriteview.sprite.width;
        document.getElementById("sprite-height").value = this.spriteview.sprite.height;
        this.sprite_size_validator.update();
        this.spriteview.windowResized();
        this.spriteChanged();
        return this.animation_panel.updateFrames();
      }
    }
  };

  SpriteEditor.prototype.redo = function() {
    var s;
    if (this.app.project.isLocked("sprites/" + this.selected_sprite + ".png")) {
      return;
    }
    this.app.project.lockFile("sprites/" + this.selected_sprite + ".png");
    if (this.spriteview.sprite && (this.spriteview.sprite.undo != null)) {
      s = this.spriteview.sprite.undo.redo();
      this.spriteview.selection = null;
      if (s != null) {
        this.spriteview.sprite.copyFrom(s);
        this.spriteview.update();
        document.getElementById("sprite-width").value = this.spriteview.sprite.width;
        document.getElementById("sprite-height").value = this.spriteview.sprite.height;
        this.sprite_size_validator.update();
        this.spriteview.windowResized();
        this.spriteChanged();
        return this.animation_panel.updateFrames();
      }
    }
  };

  SpriteEditor.prototype.copy = function() {
    if (this.tool.selectiontool && (this.spriteview.selection != null)) {
      this.clipboard = new Sprite(this.spriteview.selection.w, this.spriteview.selection.h);
      this.clipboard.frames[0].getContext().drawImage(this.spriteview.getFrame().canvas, -this.spriteview.selection.x, -this.spriteview.selection.y);
      return this.clipboard.partial = true;
    } else {
      return this.clipboard = this.spriteview.sprite.clone();
    }
  };

  SpriteEditor.prototype.cut = function() {
    var sel;
    if (this.app.project.isLocked("sprites/" + this.selected_sprite + ".png")) {
      return;
    }
    this.app.project.lockFile("sprites/" + this.selected_sprite + ".png");
    if (this.spriteview.sprite.undo == null) {
      this.spriteview.sprite.undo = new Undo();
    }
    if (this.spriteview.sprite.undo.empty()) {
      this.spriteview.sprite.undo.pushState(this.spriteview.sprite.clone());
    }
    if (this.tool.selectiontool && (this.spriteview.selection != null)) {
      this.clipboard = new Sprite(this.spriteview.selection.w, this.spriteview.selection.h);
      this.clipboard.frames[0].getContext().drawImage(this.spriteview.getFrame().canvas, -this.spriteview.selection.x, -this.spriteview.selection.y);
      this.clipboard.partial = true;
      sel = this.spriteview.selection;
      this.spriteview.getFrame().getContext().clearRect(sel.x, sel.y, sel.w, sel.h);
    } else {
      this.clipboard = this.spriteview.sprite.clone();
      this.spriteview.sprite.clear();
    }
    this.spriteview.sprite.undo.pushState(this.spriteview.sprite.clone());
    this.currentSpriteUpdated();
    return this.spriteChanged();
  };

  SpriteEditor.prototype.paste = function() {
    var x, y;
    if (this.app.project.isLocked("sprites/" + this.selected_sprite + ".png")) {
      return;
    }
    this.app.project.lockFile("sprites/" + this.selected_sprite + ".png");
    if (this.clipboard != null) {
      if (this.spriteview.sprite.undo == null) {
        this.spriteview.sprite.undo = new Undo();
      }
      if (this.spriteview.sprite.undo.empty()) {
        this.spriteview.sprite.undo.pushState(this.spriteview.sprite.clone());
      }
      if (this.clipboard.partial) {
        x = 0;
        y = 0;
        x = Math.max(0, Math.min(this.spriteview.sprite.width - this.clipboard.width, this.spriteview.mouse_x));
        y = Math.max(0, Math.min(this.spriteview.sprite.height - this.clipboard.height, this.spriteview.mouse_y));
        this.spriteview.floating_selection = {
          bg: this.spriteview.getFrame().clone().getCanvas(),
          fg: this.clipboard.frames[0].getCanvas()
        };
        this.spriteview.selection = {
          x: x,
          y: y,
          w: this.clipboard.frames[0].canvas.width,
          h: this.clipboard.frames[0].canvas.height
        };
        this.spriteview.getFrame().getContext().drawImage(this.clipboard.frames[0].getCanvas(), x, y);
        this.setSelectedTool("fa-vector-square");
      } else {
        this.spriteview.sprite.copyFrom(this.clipboard);
      }
      this.spriteview.sprite.undo.pushState(this.spriteview.sprite.clone());
      this.currentSpriteUpdated();
      return this.spriteChanged();
    }
  };

  SpriteEditor.prototype.currentSpriteUpdated = function() {
    this.spriteview.update();
    document.getElementById("sprite-width").value = this.spriteview.sprite.width;
    document.getElementById("sprite-height").value = this.spriteview.sprite.height;
    this.sprite_size_validator.update();
    return this.spriteview.windowResized();
  };

  SpriteEditor.prototype.setColorPicker = function(picker) {
    this.spriteview.colorpicker = picker;
    if (picker) {
      this.spriteview.canvas.style.cursor = "url( '/img/eyedropper.svg' ) 0 24, pointer";
      return document.getElementById("eyedropper").classList.add("selected");
    } else {
      this.spriteview.canvas.style.cursor = "crosshair";
      return document.getElementById("eyedropper").classList.remove("selected");
    }
  };

  SpriteEditor.prototype.updateSelectionHints = function() {
    var h, w;
    if ((this.spriteview.selection != null) && this.tool.selectiontool) {
      document.getElementById("selection-group").style.display = "block";
      w = this.spriteview.selection.w;
      h = this.spriteview.selection.h;
      if (this.spriteview.sprite.frames.length === 1 && (this.spriteview.sprite.width / w) % 1 === 0 && (this.spriteview.sprite.height / h) % 1 === 0 && (this.spriteview.sprite.width / w >= 2 || this.spriteview.sprite.height / h >= 2)) {
        return document.getElementById("selection-operation-film").style.display = "block";
      } else {
        return document.getElementById("selection-operation-film").style.display = "none";
      }
    } else {
      return document.getElementById("selection-group").style.display = "none";
    }
  };

  SpriteEditor.prototype.stripToAnimation = function() {
    var h, i, index, j, l, m, n, o, ref, ref1, sprite, w;
    w = this.spriteview.selection.w;
    h = this.spriteview.selection.h;
    if (this.spriteview.sprite.frames.length === 1 && (this.spriteview.sprite.width / w) % 1 === 0 && (this.spriteview.sprite.height / h) % 1 === 0 && (this.spriteview.sprite.width / w >= 2 || this.spriteview.sprite.height / h >= 2)) {
      if (this.spriteview.sprite.undo == null) {
        this.spriteview.sprite.undo = new Undo();
      }
      if (this.spriteview.sprite.undo.empty()) {
        this.spriteview.sprite.undo.pushState(this.spriteview.sprite.clone());
      }
      n = this.spriteview.sprite.width / w;
      m = this.spriteview.sprite.height / h;
      sprite = new Sprite(w, h);
      index = 0;
      for (j = l = 0, ref = m - 1; l <= ref; j = l += 1) {
        for (i = o = 0, ref1 = n - 1; o <= ref1; i = o += 1) {
          sprite.frames[index] = new SpriteFrame(sprite, w, h);
          sprite.frames[index].getContext().drawImage(this.spriteview.sprite.frames[0].getCanvas(), -i * w, -j * h);
          index++;
        }
      }
      this.spriteview.sprite.copyFrom(sprite);
      this.spriteview.sprite.undo.pushState(this.spriteview.sprite.clone());
      this.currentSpriteUpdated();
      this.spriteChanged();
      return this.animation_panel.spriteChanged();
    }
  };

  return SpriteEditor;

})();
