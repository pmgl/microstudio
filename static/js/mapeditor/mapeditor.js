var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

this.MapEditor = (function(superClass) {
  extend(MapEditor, superClass);

  function MapEditor(app) {
    this.app = app;
    this.folder = "maps";
    this.item = "map";
    this.list_change_event = "maplist";
    this.get_item = "getMap";
    this.use_thumbnails = false;
    this.extensions = ["json"];
    this.update_list = "updateMapList";
    this.init();
    this.mapeditor_splitbar = new SplitBar("mapeditor-container", "horizontal");
    this.mapeditor_splitbar.setPosition(80);
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
    document.addEventListener("keydown", (function(_this) {
      return function(event) {
        if (document.getElementById("mapeditor").offsetParent == null) {
          return;
        }
        if ((document.activeElement != null) && document.activeElement.tagName.toLowerCase() === "input") {
          return;
        }
        if (event.metaKey || event.ctrlKey) {
          switch (event.key) {
            case "z":
              _this.undo();
              break;
            case "Z":
              _this.redo();
              break;
            default:
              return;
          }
          event.preventDefault();
          return event.stopPropagation();
        }
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
        var name;
        console.info(_this.map_underlay_select.value);
        name = _this.map_underlay_select.value.replace(/\//g, "-");
        _this.map_underlay = name;
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
    this.map_code_tip = new CodeSnippetField(this.app, "#map-code-tip");
    this.map_code_tip.set("Example");
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

  MapEditor.prototype.update = function() {
    MapEditor.__super__.update.call(this);
    if (this.mapeditor_splitbar.position > 90) {
      this.mapeditor_splitbar.setPosition(80);
    }
    return this.mapeditor_splitbar.update();
  };

  MapEditor.prototype.projectUpdate = function(change) {
    var c, name;
    MapEditor.__super__.projectUpdate.call(this, change);
    switch (change) {
      case "spritelist":
        this.rebuildSpriteList();
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

  MapEditor.prototype.createAsset = function(folder, name, content) {
    var map;
    if (name == null) {
      name = "map";
    }
    if (content == null) {
      content = "";
    }
    this.checkSave(true);
    if (folder != null) {
      name = folder.getFullDashPath() + ("-" + name);
      folder.setOpen(true);
    }
    map = this.app.project.createMap(name);
    map.resize(this.mapview.map.width, this.mapview.map.height, this.mapview.map.block_width, this.mapview.map.block_height);
    name = map.name;
    return this.app.client.sendRequest({
      name: "write_project_file",
      project: this.app.project.id,
      file: "maps/" + name + ".json",
      properties: {},
      content: map.save()
    }, (function(_this) {
      return function(msg) {
        _this.app.project.updateMapList();
        return _this.setSelectedItem(name);
      };
    })(this));
  };

  MapEditor.prototype.setSelectedItem = function(name) {
    this.setSelectedMap(name);
    return MapEditor.__super__.setSelectedItem.call(this, name);
  };

  MapEditor.prototype.setSelectedMap = function(map) {
    var e, m;
    this.selected_map = map;
    if (this.selected_map != null) {
      m = this.app.project.getMap(map);
      this.mapview.setMap(m);
      this.mapview.editable = true;
      document.getElementById("map-width").value = m.width;
      document.getElementById("map-height").value = m.height;
      document.getElementById("map-block-width").value = m.block_width;
      document.getElementById("map-block-height").value = m.block_height;
      this.map_size_validator.update();
      this.map_blocksize_validator.update();
      e = document.getElementById("mapeditor-wrapper");
      if (e.firstChild != null) {
        e.firstChild.style.display = "inline-block";
      }
    } else {
      e = document.getElementById("mapeditor-wrapper");
      if (e.firstChild != null) {
        e.firstChild.style.display = "none";
      }
    }
    this.updateCurrentFileLock();
    this.tilepicker.update();
    this.setCoordinates(-1, -1);
    return this.updateCodeTip();
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

  MapEditor.prototype.rebuildList = function() {
    var i, len, m, option, ref, select;
    MapEditor.__super__.rebuildList.call(this);
    if ((this.selected_map != null) && (this.app.project.getMap(this.selected_map) == null)) {
      this.setSelectedItem(null);
    }
    select = document.getElementById("map-underlay-select");
    select.innerHTML = "";
    option = document.createElement("option");
    option.name = " ";
    option.value = " ";
    option.innerText = " ";
    select.appendChild(option);
    ref = this.app.project.map_list;
    for (i = 0, len = ref.length; i < len; i++) {
      m = ref[i];
      option = document.createElement("option");
      option.name = m.name;
      option.value = m.name;
      option.innerText = m.name.replace(/-/g, "/");
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

  MapEditor.prototype.updateCodeTip = function() {
    var code, h, map, w;
    if ((this.selected_map != null) && (this.app.project.getMap(this.selected_map) != null)) {
      map = this.app.project.getMap(this.selected_map);
      if (map.width > map.height) {
        h = 200;
        w = Math.round(map.width / map.height * 200);
      } else {
        w = 200;
        h = Math.round(map.height / map.width * 200);
      }
      code = "screen.drawMap( \"" + (this.selected_map.replace(/-/g, "/")) + "\", 0, 0, " + w + ", " + h + " )";
    } else {
      code = "";
    }
    return this.map_code_tip.set(code);
  };

  return MapEditor;

})(Manager);

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
