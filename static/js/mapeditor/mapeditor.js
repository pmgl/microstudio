this.MapEditor = class MapEditor extends Manager {
  constructor(app) {
    super(app);
    this.folder = "maps";
    this.item = "map";
    this.list_change_event = "maplist";
    this.get_item = "getMap";
    this.use_thumbnails = false;
    this.extensions = ["json"];
    this.update_list = "updateMapList";
    this.init();
    this.splitbar.auto = 1;
    this.mapeditor_splitbar = new SplitBar("mapeditor-container", "horizontal");
    this.mapeditor_splitbar.initPosition(80);
    this.mapview = new MapView(this);
    this.tilepicker = new TilePicker(this);
    document.getElementById("mapeditor-wrapper").appendChild(this.mapview.canvas);
    this.save_delay = 1000;
    this.save_time = 0;
    setInterval((() => {
      return this.checkSave();
    }), this.save_delay / 2);
    this.app.appui.setAction("create-map-button", () => {
      return this.createMap();
    });
    this.selected_map = null;
    this.app.appui.setAction("undo-map", () => {
      return this.undo();
    });
    this.app.appui.setAction("redo-map", () => {
      return this.redo();
    });
    this.app.appui.setAction("copy-map", () => {
      return this.copy();
    });
    this.app.appui.setAction("cut-map", () => {
      return this.cut();
    });
    this.app.appui.setAction("paste-map", () => {
      return this.paste();
    });
    document.addEventListener("keydown", (event) => {
      if (document.getElementById("mapeditor").offsetParent == null) {
        return;
      }
      //console.info event
      if ((document.activeElement != null) && document.activeElement.tagName.toLowerCase() === "input") {
        return;
      }
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case "z":
            this.undo();
            break;
          case "Z":
            this.redo();
            break;
          default:
            return;
        }
        event.preventDefault();
        return event.stopPropagation();
      }
    });
    this.background_color_picker = new BackgroundColorPicker(this, (color) => {
      this.mapview.update();
      return document.getElementById("map-background-color").style.background = color;
    });
    this.map_underlay_select = document.getElementById("map-underlay-select");
    this.map_underlay_select.addEventListener("change", () => {
      var name;
      console.info(this.map_underlay_select.value);
      name = this.map_underlay_select.value.replace(/\//g, "-");
      this.map_underlay = name;
      return this.mapview.update();
    });
    document.getElementById("map-background-color").addEventListener("mousedown", (event) => {
      if (this.background_color_picker.shown) {
        return this.background_color_picker.hide();
      } else {
        this.background_color_picker.show();
        return event.stopPropagation();
      }
    });
    // @map_name_validator = new InputValidator document.getElementById("map-name"),
    //   document.getElementById("map-name-button"),
    //   null,
    //   (value)=>
    //     return if @app.project.isLocked("maps/#{@selected_map}.json")
    //     @app.project.lockFile("maps/#{@selected_map}.json")
    //     @saveNameChange(value[0])

    // @map_name_validator.regex = RegexLib.filename
    this.map_size_validator = new InputValidator([document.getElementById("map-width"), document.getElementById("map-height")], document.getElementById("map-size-button"), null, (value) => {
      if (this.app.project.isLocked(`maps/${this.selected_map}.json`)) {
        return;
      }
      this.app.project.lockFile(`maps/${this.selected_map}.json`);
      return this.saveDimensionChange();
    });
    this.map_blocksize_validator = new InputValidator([document.getElementById("map-block-width"), document.getElementById("map-block-height")], document.getElementById("map-blocksize-button"), null, (value) => {
      if (this.app.project.isLocked(`maps/${this.selected_map}.json`)) {
        return;
      }
      this.app.project.lockFile(`maps/${this.selected_map}.json`);
      return this.saveDimensionChange();
    });
    this.map_code_tip = new CodeSnippetField(this.app, "#map-code-tip");
  }

  mapChanged() {
    var map;
    if (this.ignore_changes) {
      return;
    }
    this.app.project.lockFile(`maps/${this.selected_map}.json`);
    this.save_time = Date.now();
    this.app.project.addPendingChange(this);
    map = this.app.project.getMap(this.selected_map);
    if (map != null) {
      map.update();
      map.updateCanvases();
      return this.app.runwindow.updateMap(this.selected_map);
    }
  }

  checkSave(immediate = false, callback) {
    if (this.save_time > 0 && (immediate || Date.now() > this.save_time + this.save_delay)) {
      this.saveMap(callback);
      return this.save_time = 0;
    }
  }

  forceSave(callback) {
    return this.checkSave(true, callback);
  }

  projectOpened() {
    super.projectOpened();
    this.app.project.addListener(this);
    return this.setSelectedMap(null);
  }

  update() {
    super.update();
    if (this.mapeditor_splitbar.position > 90) {
      this.mapeditor_splitbar.setPosition(80);
    }
    this.mapeditor_splitbar.update();
    return this.mapview.windowResized();
  }

  projectUpdate(change) {
    var c, name;
    super.projectUpdate(change);
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
      c = document.querySelector(`#map-sprite-image-${name}`);
      if ((c != null) && (c.updateSprite != null)) {
        return c.updateSprite();
      }
    }
  }

  updateCurrentFileLock() {
    var lock, user;
    if (this.selected_map != null) {
      this.mapview.editable = !this.app.project.isLocked(`maps/${this.selected_map}.json`);
    }
    lock = document.getElementById("map-editor-locked");
    if ((this.selected_map != null) && this.app.project.isLocked(`maps/${this.selected_map}.json`)) {
      user = this.app.project.isLocked(`maps/${this.selected_map}.json`).user;
      lock.style = `display: block; background: ${this.app.appui.createFriendColor(user)}`;
      return lock.innerHTML = `<i class='fa fa-user'></i> Locked by ${user}`;
    } else {
      return lock.style = "display: none";
    }
  }

  saveMap(callback) {
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
      file: `maps/${this.selected_map}.json`,
      content: data,
      cells: cells
    }, (msg) => {
      saved = true;
      if (this.save_time === 0) {
        this.app.project.removePendingChange(this);
      }
      map.size = msg.size;
      if (callback != null) {
        return callback();
      }
    });
    return setTimeout((() => {
      if (!saved) {
        this.save_time = Date.now();
        return console.info("retrying map save...");
      }
    }), 10000);
  }

  fileDropped(file, folder) {}

  // required to enable moving maps to the root folder
  createAsset(folder, name = "map", content = "") {
    var map;
    this.checkSave(true);
    if (folder != null) {
      name = folder.getFullDashPath() + `-${name}`;
      folder.setOpen(true);
    }
    map = this.app.project.createMap(name);
    map.resize(this.mapview.map.width, this.mapview.map.height, this.mapview.map.block_width, this.mapview.map.block_height);
    name = map.name;
    return this.app.client.sendRequest({
      name: "write_project_file",
      project: this.app.project.id,
      file: `maps/${name}.json`,
      properties: {},
      content: map.save()
    }, (msg) => {
      this.app.project.updateMapList();
      return this.setSelectedItem(name);
    });
  }

  setSelectedItem(name) {
    this.setSelectedMap(name);
    return super.setSelectedItem(name);
  }

  setSelectedMap(map) {
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
  }

  setMap(data) {
    var map;
    map = MicroMap.loadMap(data, this.app.project.sprite_table);
    this.mapview.setMap(map);
    this.mapview.editable = true;
    document.getElementById("map-width").value = map.width;
    document.getElementById("map-height").value = map.height;
    this.map_size_validator.update();
    this.map_blocksize_validator.update();
    return this.tilepicker.update();
  }

  rebuildList() {
    var i, len, m, option, ref, select;
    super.rebuildList();
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
  }

  setCoordinates(x, y) {
    var e;
    e = document.getElementById("map-coordinates");
    if (x < 0 || y < 0) {
      return e.innerText = "";
    } else {
      return e.innerText = `${x} , ${y}`;
    }
  }

  openMap(s) {
    if (this.map_name_change != null) {
      return this.saveNameChange(() => {
        return this.openMap(s);
      });
    }
    this.checkSave(true);
    return this.setSelectedMap(s);
  }

  saveDimensionChange() {
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
      if (this.mapview.map.undo == null) {
        this.mapview.map.undo = new Undo();
      }
      if (this.mapview.map.undo.empty()) {
        this.mapview.map.undo.pushState(this.mapview.map.clone());
      }
      this.mapview.map.resize(w, h, bw, bh);
      this.mapview.map.undo.pushState(this.mapview.map.clone());
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
  }

  rebuildSpriteList() {
    var ProjectSpriteClone, folder, i, len, manager, ref, s;
    if (this.sprite_folder_view == null) {
      manager = {
        folder: "sprites",
        item: "sprite",
        openItem: (item) => {
          this.mapview.sprite = item;
          this.sprite_folder_view.setSelectedItem(item);
          return this.tilepicker.update();
        }
      };
      this.sprite_folder_view = new FolderView(manager, document.querySelector("#map-sprite-list"));
      this.sprite_folder_view.editable = false;
    }
    folder = new ProjectFolder(null, "sprites");
    ProjectSpriteClone = class ProjectSpriteClone {
      constructor(project_sprite) {
        this.project_sprite = project_sprite;
        this.name = this.project_sprite.name;
        this.shortname = this.project_sprite.shortname;
      }

      getThumbnailElement() {
        return this.project_sprite.getThumbnailElement();
      }

      canBeRenamed() {
        return false;
      }

    };
    ref = this.app.project.sprite_list;
    for (i = 0, len = ref.length; i < len; i++) {
      s = ref[i];
      folder.push(new ProjectSpriteClone(s), s.name);
    }
    this.sprite_folder_view.rebuildList(folder);
  }

  currentMapUpdated() {
    this.mapview.update();
    this.mapview.windowResized();
    return this.updateSizeFields();
  }

  updateSizeFields() {
    if (this.mapview.map != null) {
      document.getElementById("map-width").value = this.mapview.map.width;
      document.getElementById("map-height").value = this.mapview.map.height;
      document.getElementById("map-block-width").value = this.mapview.map.block_width;
      document.getElementById("map-block-height").value = this.mapview.map.block_height;
      this.map_size_validator.update();
      return this.map_blocksize_validator.update();
    }
  }

  undo() {
    var s;
    if (this.app.project.isLocked(`maps/${this.selected_map}.json`)) {
      return;
    }
    this.app.project.lockFile(`maps/${this.selected_map}.json`);
    if (this.mapview.map && (this.mapview.map.undo != null)) {
      s = this.mapview.map.undo.undo(() => {
        return this.mapview.map.clone();
      });
      if (s != null) {
        this.mapview.map.copyFrom(s);
        this.currentMapUpdated();
        return this.mapChanged();
      }
    }
  }

  redo() {
    var s;
    if (this.app.project.isLocked(`maps/${this.selected_map}.json`)) {
      return;
    }
    this.app.project.lockFile(`maps/${this.selected_map}.json`);
    if (this.mapview.map && (this.mapview.map.undo != null)) {
      s = this.mapview.map.undo.redo();
      if (s != null) {
        this.mapview.map.copyFrom(s);
        this.currentMapUpdated();
        return this.mapChanged();
      }
    }
  }

  copy() {
    return this.clipboard = this.mapview.map.clone();
  }

  cut() {
    if (this.app.project.isLocked(`maps/${this.selected_map}.json`)) {
      return;
    }
    this.app.project.lockFile(`maps/${this.selected_map}.json`);
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
  }

  paste() {
    if (this.app.project.isLocked(`maps/${this.selected_map}.json`)) {
      return;
    }
    this.app.project.lockFile(`maps/${this.selected_map}.json`);
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
  }

  updateCodeTip() {
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
      code = `screen.drawMap( "${this.selected_map.replace(/-/g, "/")}", 0, 0, ${w}, ${h} )`;
    } else {
      code = "";
    }
    return this.map_code_tip.set(code);
  }

};

this.BackgroundColorPicker = class BackgroundColorPicker {
  constructor(editor, callback1, editorid = "map") {
    this.editor = editor;
    this.callback = callback1;
    this.editorid = editorid;
    this.tool = document.createElement("div");
    this.tool.classList.add("value-tool");
    this.color = [0, 0, 0];
    this.picker = new ColorPicker(this);
    this.tool.appendChild(this.picker.canvas);
    this.picker.colorPicked([0, 0, 0]);
    document.getElementById(`${this.editorid}s-section`).appendChild(this.tool);
    this.started = true;
    this.tool.addEventListener("mousedown", function(event) {
      return event.stopPropagation();
    });
    document.addEventListener("mousedown", (event) => {
      return this.hide();
    });
    this.hide();
  }

  setColor(color1) {
    this.color = color1;
    return this.callback(this.color);
  }

  hide() {
    this.tool.style.display = "none";
    return this.shown = false;
  }

  show() {
    var e;
    e = document.getElementById(this.editorid + "-background-color");
    this.y = e.getBoundingClientRect().y;
    this.x = e.getBoundingClientRect().x + e.getBoundingClientRect().width / 2;
    this.y = Math.max(0, this.y - 100) + document.querySelector("#editor-view .ace_content").getBoundingClientRect().y;
    this.x = Math.max(0, this.x + 25) + document.querySelector("#editor-view .ace_content").getBoundingClientRect().x;
    this.tool.style = `z-index: 20;top:${this.y - 200}px;left:${this.x - 75}px;`;
    this.tool.style.display = "block";
    return this.shown = true;
  }

};
