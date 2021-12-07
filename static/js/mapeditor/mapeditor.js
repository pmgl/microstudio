this.MapEditor = (function() {
  function MapEditor(app) {
    this.app = app;
    this.mapview = new MapView(this);
    this.tilepicker = new TilePicker(this);
    document.getElementById("mapeditor-wrapper").appendChild(this.mapview.canvas);
    this.save_delay = 1000;
    this.save_time = 0;
    setInterval(((function(_this) {
      return function() {
        return _this.checkSave();
      };
    })(this)), this.save_delay / 2);
    this.app.appui.setAction("create-map-button", (function(_this) {
      return function() {
        return _this.createMap();
      };
    })(this));
    this.selected_map = null;
    this.app.appui.setAction("undo-map", (function(_this) {
      return function() {
        return _this.undo();
      };
    })(this));
    this.app.appui.setAction("redo-map", (function(_this) {
      return function() {
        return _this.redo();
      };
    })(this));
    this.app.appui.setAction("copy-map", (function(_this) {
      return function() {
        return _this.copy();
      };
    })(this));
    this.app.appui.setAction("cut-map", (function(_this) {
      return function() {
        return _this.cut();
      };
    })(this));
    this.app.appui.setAction("paste-map", (function(_this) {
      return function() {
        return _this.paste();
      };
    })(this));
    this.app.appui.setAction("delete-map", (function(_this) {
      return function() {
        return _this.deleteMap();
      };
    })(this));
    this.background_color_picker = new BackgroundColorPicker(this, (function(_this) {
      return function(color) {
        _this.mapview.update();
        return document.getElementById("map-background-color").style.background = color;
      };
    })(this));
    this.map_underlay_select = document.getElementById("map-underlay-select");
    this.map_underlay_select.addEventListener("change", (function(_this) {
      return function() {
        console.info(_this.map_underlay_select.value);
        _this.map_underlay = _this.map_underlay_select.value;
        return _this.mapview.update();
      };
    })(this));
    document.getElementById("map-background-color").addEventListener("mousedown", (function(_this) {
      return function(event) {
        if (_this.background_color_picker.shown) {
          return _this.background_color_picker.hide();
        } else {
          _this.background_color_picker.show();
          return event.stopPropagation();
        }
      };
    })(this));
    this.map_name_validator = new InputValidator(document.getElementById("map-name"), document.getElementById("map-name-button"), null, (function(_this) {
      return function(value) {
        if (_this.app.project.isLocked("maps/" + _this.selected_map + ".json")) {
          return;
        }
        _this.app.project.lockFile("maps/" + _this.selected_map + ".json");
        return _this.saveNameChange(value[0]);
      };
    })(this));
    this.map_name_validator.regex = RegexLib.filename;
    this.map_size_validator = new InputValidator([document.getElementById("map-width"), document.getElementById("map-height")], document.getElementById("map-size-button"), null, (function(_this) {
      return function(value) {
        if (_this.app.project.isLocked("maps/" + _this.selected_map + ".json")) {
          return;
        }
        _this.app.project.lockFile("maps/" + _this.selected_map + ".json");
        return _this.saveDimensionChange();
      };
    })(this));
    this.map_blocksize_validator = new InputValidator([document.getElementById("map-block-width"), document.getElementById("map-block-height")], document.getElementById("map-blocksize-button"), null, (function(_this) {
      return function(value) {
        if (_this.app.project.isLocked("maps/" + _this.selected_map + ".json")) {
          return;
        }
        _this.app.project.lockFile("maps/" + _this.selected_map + ".json");
        return _this.saveDimensionChange();
      };
    })(this));
  }

  MapEditor.prototype.mapChanged = function() {
    var map;
    if (this.ignore_changes) {
      return;
    }
    this.app.project.lockFile("maps/" + this.selected_map + ".json");
    this.save_time = Date.now();
    this.app.project.addPendingChange(this);
    map = this.app.project.getMap(this.selected_map);
    if (map != null) {
      map.update();
      map.updateCanvases();
      return this.app.runwindow.updateMap(this.selected_map);
    }
  };

  MapEditor.prototype.checkSave = function(immediate, callback) {
    if (immediate == null) {
      immediate = false;
    }
    if (this.save_time > 0 && (immediate || Date.now() > this.save_time + this.save_delay)) {
      this.saveMap(callback);
      return this.save_time = 0;
    }
  };

  MapEditor.prototype.forceSave = function(callback) {
    return this.checkSave(true, callback);
  };

  MapEditor.prototype.projectOpened = function() {
    this.app.project.addListener(this);
    return this.setSelectedMap(null);
  };

  MapEditor.prototype.projectUpdate = function(change) {
    var c, name;
    switch (change) {
      case "spritelist":
        this.rebuildSpriteList();
        break;
      case "maplist":
        this.rebuildMapList();
        break;
      case "locks":
        this.updateCurrentFileLock();
        this.updateActiveUsers();
    }
    if (change instanceof ProjectSprite) {
      name = change.name;
      c = document.querySelector("#map-sprite-image-" + name);
      if ((c != null) && (c.updateSprite != null)) {
        return c.updateSprite();
      }
    }
  };

  MapEditor.prototype.updateCurrentFileLock = function() {
    var lock, user;
    if (this.selected_map != null) {
      this.mapview.editable = !this.app.project.isLocked("maps/" + this.selected_map + ".json");
    }
    lock = document.getElementById("map-editor-locked");
    if ((this.selected_map != null) && this.app.project.isLocked("maps/" + this.selected_map + ".json")) {
      user = this.app.project.isLocked("maps/" + this.selected_map + ".json").user;
      lock.style = "display: block; background: " + (this.app.appui.createFriendColor(user));
      return lock.innerHTML = "<i class='fa fa-user'></i> Locked by " + user;
    } else {
      return lock.style = "display: none";
    }
  };

  MapEditor.prototype.saveMap = function(callback) {
    var cells, data, map, saved;
    if ((this.selected_map == null) || !this.mapview.map) {
      return;
    }
    data = this.mapview.map.save();
    map = this.mapview.map;
    saved = false;
    cells = this.mapview.cells_drawn;
    this.mapview.cells_drawn = 0;
    this.app.client.sendRequest({
      name: "write_project_file",
      project: this.app.project.id,
      file: "maps/" + this.selected_map + ".json",
      content: data,
      cells: cells
    }, (function(_this) {
      return function(msg) {
        saved = true;
        if (_this.save_time === 0) {
          _this.app.project.removePendingChange(_this);
        }
        map.size = msg.size;
        if (callback != null) {
          return callback();
        }
      };
    })(this));
    return setTimeout(((function(_this) {
      return function() {
        if (!saved) {
          _this.save_time = Date.now();
          return console.info("retrying map save...");
        }
      };
    })(this)), 10000);
  };

  MapEditor.prototype.createMap = function() {
    var map;
    this.checkSave(true);
    map = this.app.project.createMap();
    this.setSelectedMap(map.name);
    map.resize(this.mapview.map.width, this.mapview.map.height, this.mapview.map.block_width, this.mapview.map.block_height);
    this.mapview.setMap(map);
    this.setSelectedMap(map.name);
    this.mapview.editable = true;
    this.saveMap((function(_this) {
      return function() {};
    })(this));
    return this.tilepicker.update();
  };

  MapEditor.prototype.setSelectedMap = function(map) {
    var e, i, j, len, len1, list, m;
    this.selected_map = map;
    list = document.getElementById("map-list").childNodes;
    if (this.selected_map != null) {
      for (i = 0, len = list.length; i < len; i++) {
        e = list[i];
        if (e.getAttribute("id") === ("project-map-" + map)) {
          e.classList.add("selected");
        } else {
          e.classList.remove("selected");
        }
      }
      m = this.app.project.getMap(map);
      this.mapview.setMap(m);
      this.mapview.editable = true;
      document.getElementById("map-width").value = m.width;
      document.getElementById("map-height").value = m.height;
      document.getElementById("map-block-width").value = m.block_width;
      document.getElementById("map-block-height").value = m.block_height;
      document.getElementById("map-name").value = m.name;
      this.map_name_validator.update();
      this.map_size_validator.update();
      this.map_blocksize_validator.update();
      e = document.getElementById("mapeditor-wrapper");
      if (e.firstChild != null) {
        e.firstChild.style.display = "inline-block";
      }
    } else {
      for (j = 0, len1 = list.length; j < len1; j++) {
        e = list[j];
        e.classList.remove("selected");
      }
      document.getElementById("map-name").value = "";
      e = document.getElementById("mapeditor-wrapper");
      if (e.firstChild != null) {
        e.firstChild.style.display = "none";
      }
    }
    this.updateCurrentFileLock();
    this.tilepicker.update();
    return this.setCoordinates(-1, -1);
  };

  MapEditor.prototype.setMap = function(data) {
    var map;
    map = MicroMap.loadMap(data, this.app.project.sprite_table);
    this.mapview.setMap(map);
    this.mapview.editable = true;
    document.getElementById("map-width").value = map.width;
    document.getElementById("map-height").value = map.height;
    this.map_size_validator.update();
    this.map_blocksize_validator.update();
    return this.tilepicker.update();
  };

  MapEditor.prototype.rebuildMapList = function() {
    var i, j, len, len1, list, m, option, ref, ref1, select;
    list = document.getElementById("map-list");
    list.innerHTML = "";
    ref = this.app.project.map_list;
    for (i = 0, len = ref.length; i < len; i++) {
      m = ref[i];
      list.appendChild(this.createMapBox(m));
    }
    this.updateActiveUsers();
    if ((this.selected_map != null) && (this.app.project.getMap(this.selected_map) == null)) {
      this.setSelectedMap(null);
    }
    select = document.getElementById("map-underlay-select");
    select.innerHTML = "";
    option = document.createElement("option");
    option.name = " ";
    option.value = " ";
    option.innerText = " ";
    select.appendChild(option);
    ref1 = this.app.project.map_list;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      m = ref1[j];
      option = document.createElement("option");
      option.name = m.name;
      option.value = m.name;
      option.innerText = m.name;
      select.appendChild(option);
    }
    if (this.map_underlay != null) {
      select.value = this.map_underlay;
    }
  };

  MapEditor.prototype.setCoordinates = function(x, y) {
    var e;
    e = document.getElementById("map-coordinates");
    if (x < 0 || y < 0) {
      return e.innerText = "";
    } else {
      return e.innerText = x + " , " + y;
    }
  };

  MapEditor.prototype.openMap = function(s) {
    if (this.map_name_change != null) {
      return this.saveNameChange((function(_this) {
        return function() {
          return _this.openMap(s);
        };
      })(this));
    }
    this.checkSave(true);
    return this.setSelectedMap(s);
  };

  MapEditor.prototype.updateActiveUsers = function() {
    var e, file, i, len, list, lock;
    list = document.getElementById("map-list").childNodes;
    for (i = 0, len = list.length; i < len; i++) {
      e = list[i];
      file = e.id.split("-")[2];
      lock = this.app.project.isLocked("maps/" + file + ".json");
      if ((lock != null) && Date.now() < lock.time) {
        e.querySelector(".active-user").style = "display: block; background: " + (this.app.appui.createFriendColor(lock.user)) + ";";
      } else {
        e.querySelector(".active-user").style = "display: none;";
      }
    }
  };

  MapEditor.prototype.createMapBox = function(map) {
    var activeuser, element, icon, iconbox, text;
    element = document.createElement("div");
    element.classList.add("map-box");
    element.setAttribute("id", "project-map-" + map.name);
    element.setAttribute("title", map.name);
    if (map.name === this.selected_map) {
      element.classList.add("selected");
    }
    iconbox = document.createElement("div");
    iconbox.classList.add("icon-box");
    icon = document.createElement("canvas");
    icon.setAttribute("id", "map-image-" + map.name);
    iconbox.appendChild(icon);
    map.addCanvas(icon);
    element.appendChild(iconbox);
    element.appendChild(document.createElement("br"));
    text = document.createElement("span");
    text.innerHTML = map.name;
    element.appendChild(text);
    element.addEventListener("click", (function(_this) {
      return function() {
        return _this.openMap(map.name);
      };
    })(this));
    activeuser = document.createElement("i");
    activeuser.classList.add("active-user");
    activeuser.classList.add("fa");
    activeuser.classList.add("fa-user");
    element.appendChild(activeuser);
    return element;
  };

  MapEditor.prototype.saveNameChange = function(name) {
    var old;
    this.map_name_change = null;
    name = name.toLowerCase();
    name = RegexLib.fixFilename(name);
    document.getElementById("map-name").value = name;
    if (name !== this.selected_map && RegexLib.filename.test(name) && (this.app.project.getMap(name) == null)) {
      old = this.selected_map;
      this.selected_map = name;
      this.mapview.map.rename(name);
      this.app.project.changeMapName(old, name);
      return this.saveMap((function(_this) {
        return function() {
          return _this.app.client.sendRequest({
            name: "delete_project_file",
            project: _this.app.project.id,
            file: "maps/" + old + ".json"
          }, function(msg) {
            _this.app.project.updateMapList();
            if (typeof callback !== "undefined" && callback !== null) {
              return callback();
            }
          });
        };
      })(this));
    } else {
      document.getElementById("map-name").value = this.selected_map;
      if (typeof callback !== "undefined" && callback !== null) {
        return callback();
      }
    }
  };

  MapEditor.prototype.saveDimensionChange = function() {
    var bh, bw, err, h, w;
    this.map_dimension_change = null;
    w = document.getElementById("map-width").value;
    h = document.getElementById("map-height").value;
    bw = document.getElementById("map-block-width").value;
    bh = document.getElementById("map-block-height").value;
    try {
      w = Number.parseFloat(w);
      h = Number.parseFloat(h);
      bw = Number.parseFloat(bw);
      bh = Number.parseFloat(bh);
    } catch (error) {
      err = error;
    }
    if (Number.isInteger(w) && Number.isInteger(h) && w > 0 && h > 0 && w < 129 && h < 129 && (this.selected_map != null) && (w !== this.mapview.map.width || h !== this.mapview.map.height || bw !== this.mapview.map.block_width || bh !== this.mapview.map.block_height) && Number.isInteger(bw) && Number.isInteger(bh) && bw > 0 && bh > 0 && bw < 65 && bh < 65) {
      this.mapview.map.resize(w, h, bw, bh);
      this.mapview.windowResized();
      this.mapview.update();
      this.mapChanged();
      this.checkSave(true);
      document.getElementById("map-width").value = this.mapview.map.width;
      document.getElementById("map-height").value = this.mapview.map.height;
      document.getElementById("map-block-width").value = this.mapview.map.block_width;
      document.getElementById("map-block-height").value = this.mapview.map.block_height;
      this.map_size_validator.update();
      return this.map_blocksize_validator.update();
    } else {
      document.getElementById("map-width").value = this.mapview.map.width;
      document.getElementById("map-height").value = this.mapview.map.height;
      document.getElementById("map-block-width").value = this.mapview.map.block_width;
      document.getElementById("map-block-height").value = this.mapview.map.block_height;
      this.map_size_validator.update();
      return this.map_blocksize_validator.update();
    }
  };

  MapEditor.prototype.deleteMap = function() {
    var msg;
    if (this.app.project.isLocked("maps/" + this.selected_map + ".json")) {
      return;
    }
    this.app.project.lockFile("maps/" + this.selected_map + ".json");
    if (this.selected_map != null) {
      msg = this.app.translator.get("Really delete %ITEM%?").replace("%ITEM%", this.selected_map);
      return ConfirmDialog.confirm(msg, this.app.translator.get("Delete"), this.app.translator.get("Cancel"), (function(_this) {
        return function() {
          return _this.app.client.sendRequest({
            name: "delete_project_file",
            project: _this.app.project.id,
            file: "maps/" + _this.selected_map + ".json"
          }, function(msg) {
            _this.app.project.updateMapList();
            _this.mapview.map.clear();
            _this.mapview.update();
            _this.mapview.editable = false;
            return _this.setSelectedMap(null);
          });
        };
      })(this));
    }
  };

  MapEditor.prototype.rebuildSpriteList = function() {
    var i, len, ref, results, root, s;
    root = document.getElementById("map-sprite-list");
    root.innerHTML = "";
    ref = this.app.project.sprite_list;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      s = ref[i];
      results.push(root.appendChild(this.createSpriteBox(s)));
    }
    return results;
  };

  MapEditor.prototype.updateSpriteSelection = function() {
    var c, i, len, ref, root;
    root = document.getElementById("map-sprite-list");
    ref = root.children;
    for (i = 0, len = ref.length; i < len; i++) {
      c = ref[i];
      if (c.id === ("map-sprite-" + this.mapview.sprite)) {
        c.classList.add("selected");
      } else {
        c.classList.remove("selected");
      }
    }
  };

  MapEditor.prototype.createSpriteBox = function(sprite) {
    var element, icon;
    element = document.createElement("div");
    element.classList.add("map-sprite-box");
    element.setAttribute("id", "map-sprite-" + sprite.name);
    element.setAttribute("title", sprite.name);
    if (sprite.name === this.mapview.sprite) {
      element.classList.add("selected");
    }
    icon = this.app.sprite_editor.createSpriteThumb(sprite);
    icon.setAttribute("id", "map-sprite-image-" + sprite.name);
    element.appendChild(icon);
    sprite.addImage(icon, 64);
    element.addEventListener("click", (function(_this) {
      return function() {
        _this.mapview.sprite = sprite.name;
        _this.updateSpriteSelection();
        return _this.tilepicker.update();
      };
    })(this));
    return element;
  };

  MapEditor.prototype.currentMapUpdated = function() {
    this.mapview.update();
    this.mapview.windowResized();
    return this.updateSizeFields();
  };

  MapEditor.prototype.updateSizeFields = function() {
    if (this.mapview.map != null) {
      document.getElementById("map-width").value = this.mapview.map.width;
      document.getElementById("map-height").value = this.mapview.map.height;
      document.getElementById("map-block-width").value = this.mapview.map.block_width;
      document.getElementById("map-block-height").value = this.mapview.map.block_height;
      this.map_size_validator.update();
      return this.map_blocksize_validator.update();
    }
  };

  MapEditor.prototype.undo = function() {
    var s;
    if (this.app.project.isLocked("maps/" + this.selected_map + ".json")) {
      return;
    }
    this.app.project.lockFile("maps/" + this.selected_map + ".json");
    if (this.mapview.map && (this.mapview.map.undo != null)) {
      s = this.mapview.map.undo.undo((function(_this) {
        return function() {
          return _this.mapview.map.clone();
        };
      })(this));
      if (s != null) {
        this.mapview.map.copyFrom(s);
        this.currentMapUpdated();
        return this.mapChanged();
      }
    }
  };

  MapEditor.prototype.redo = function() {
    var s;
    if (this.app.project.isLocked("maps/" + this.selected_map + ".json")) {
      return;
    }
    this.app.project.lockFile("maps/" + this.selected_map + ".json");
    if (this.mapview.map && (this.mapview.map.undo != null)) {
      s = this.mapview.map.undo.redo();
      if (s != null) {
        this.mapview.map.copyFrom(s);
        this.currentMapUpdated();
        return this.mapChanged();
      }
    }
  };

  MapEditor.prototype.copy = function() {
    return this.clipboard = this.mapview.map.clone();
  };

  MapEditor.prototype.cut = function() {
    if (this.app.project.isLocked("maps/" + this.selected_map + ".json")) {
      return;
    }
    this.app.project.lockFile("maps/" + this.selected_map + ".json");
    this.clipboard = this.mapview.map.clone();
    if (this.mapview.map.undo == null) {
      this.mapview.map.undo = new Undo();
    }
    if (this.mapview.map.undo.empty()) {
      this.mapview.map.undo.pushState(this.mapview.map.clone());
    }
    this.mapview.map.clear();
    this.mapview.map.undo.pushState(this.mapview.map.clone());
    this.currentMapUpdated();
    return this.mapChanged();
  };

  MapEditor.prototype.paste = function() {
    if (this.app.project.isLocked("maps/" + this.selected_map + ".json")) {
      return;
    }
    this.app.project.lockFile("maps/" + this.selected_map + ".json");
    if (this.clipboard != null) {
      if (this.mapview.map.undo == null) {
        this.mapview.map.undo = new Undo();
      }
      if (this.mapview.map.undo.empty()) {
        this.mapview.map.undo.pushState(this.mapview.map.clone());
      }
      this.mapview.map.copyFrom(this.clipboard);
      this.mapview.map.undo.pushState(this.mapview.map.clone());
      this.currentMapUpdated();
      return this.mapChanged();
    }
  };

  return MapEditor;

})();

this.BackgroundColorPicker = (function() {
  function BackgroundColorPicker(editor, callback1) {
    this.editor = editor;
    this.callback = callback1;
    this.tool = document.createElement("div");
    this.tool.classList.add("value-tool");
    this.color = [0, 0, 0];
    this.picker = new ColorPicker(this);
    this.tool.appendChild(this.picker.canvas);
    this.picker.colorPicked([0, 0, 0]);
    document.getElementById("maps-section").appendChild(this.tool);
    this.started = true;
    this.tool.addEventListener("mousedown", function(event) {
      return event.stopPropagation();
    });
    document.addEventListener("mousedown", (function(_this) {
      return function(event) {
        return _this.hide();
      };
    })(this));
    this.hide();
  }

  BackgroundColorPicker.prototype.setColor = function(color1) {
    this.color = color1;
    return this.callback(this.color);
  };

  BackgroundColorPicker.prototype.hide = function() {
    this.tool.style.display = "none";
    return this.shown = false;
  };

  BackgroundColorPicker.prototype.show = function() {
    var e;
    e = document.getElementById("map-background-color");
    this.y = e.getBoundingClientRect().y;
    this.x = e.getBoundingClientRect().x + e.getBoundingClientRect().width / 2;
    this.y = Math.max(0, this.y - 100) + document.querySelector("#editor-view .ace_content").getBoundingClientRect().y;
    this.x = Math.max(0, this.x + 25) + document.querySelector("#editor-view .ace_content").getBoundingClientRect().x;
    this.tool.style = "z-index: 20;top:" + (this.y - 200) + "px;left:" + (this.x - 75) + "px;";
    this.tool.style.display = "block";
    return this.shown = true;
  };

  return BackgroundColorPicker;

})();
