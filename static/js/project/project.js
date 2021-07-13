var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

this.Project = (function() {
  function Project(app, data) {
    var f, k, len, ref;
    this.app = app;
    this.setAssetList = bind(this.setAssetList, this);
    this.setMapList = bind(this.setMapList, this);
    this.setMusicList = bind(this.setMusicList, this);
    this.setSoundList = bind(this.setSoundList, this);
    this.setMapList = bind(this.setMapList, this);
    this.setSpriteList = bind(this.setSpriteList, this);
    this.setSourceList = bind(this.setSourceList, this);
    this.id = data.id;
    this.owner = data.owner;
    this.accepted = data.accepted;
    this.slug = data.slug;
    this.code = data.code;
    this.title = data.title;
    this.description = data.description;
    this.tags = data.tags;
    this["public"] = data["public"];
    this.platforms = data.platforms;
    this.controls = data.controls;
    this.type = data.type;
    this.orientation = data.orientation;
    this.graphics = data.graphics || "M1";
    this.aspect = data.aspect;
    this.users = data.users;
    this.file_types = ["source", "sprite", "map", "asset", "sound", "music"];
    ref = this.file_types;
    for (k = 0, len = ref.length; k < len; k++) {
      f = ref[k];
      this[f + "_list"] = [];
      this[f + "_table"] = {};
    }
    this.locks = {};
    this.lock_time = {};
    this.friends = {};
    this.url = location.origin + ("/" + this.owner.nick + "/" + this.slug + "/");
    this.listeners = [];
    setInterval(((function(_this) {
      return function() {
        return _this.checkLocks();
      };
    })(this)), 1000);
    this.pending_changes = [];
    this.onbeforeunload = null;
  }

  Project.prototype.getFullURL = function() {
    if (this["public"]) {
      return this.url;
    } else {
      return location.origin + ("/" + this.owner.nick + "/" + this.slug + "/" + this.code + "/");
    }
  };

  Project.prototype.addListener = function(lis) {
    return this.listeners.push(lis);
  };

  Project.prototype.notifyListeners = function(change) {
    var k, len, lis, ref;
    ref = this.listeners;
    for (k = 0, len = ref.length; k < len; k++) {
      lis = ref[k];
      lis.projectUpdate(change);
    }
  };

  Project.prototype.load = function() {
    this.updateSourceList();
    this.updateSpriteList();
    this.updateMapList();
    this.updateSoundList();
    this.updateMusicList();
    if (this.graphics === "M3D") {
      this.updateAssetList();
    }
    return this.loadDoc();
  };

  Project.prototype.loadDoc = function() {
    this.app.doc_editor.setDoc("");
    return this.app.readProjectFile(this.id, "doc/doc.md", (function(_this) {
      return function(content) {
        return _this.app.doc_editor.setDoc(content);
      };
    })(this));
  };

  Project.prototype.updateFileList = function(folder, callback) {
    return this.app.client.sendRequest({
      name: "list_project_files",
      project: this.app.project.id,
      folder: folder
    }, (function(_this) {
      return function(msg) {
        return _this[callback](msg.files);
      };
    })(this));
  };

  Project.prototype.updateSourceList = function() {
    return this.updateFileList("ms", "setSourceList");
  };

  Project.prototype.updateSpriteList = function() {
    return this.updateFileList("sprites", "setSpriteList");
  };

  Project.prototype.updateMapList = function() {
    return this.updateFileList("maps", "setMapList");
  };

  Project.prototype.updateSoundList = function() {
    return this.updateFileList("sounds", "setSoundList");
  };

  Project.prototype.updateMusicList = function() {
    return this.updateFileList("music", "setMusicList");
  };

  Project.prototype.updateAssetList = function() {
    return this.updateFileList("assets", "setAssetList");
  };

  Project.prototype.lockFile = function(file) {
    var lock;
    lock = this.lock_time[file];
    if ((lock != null) && Date.now() < lock) {
      return;
    }
    this.lock_time[file] = Date.now() + 2000;
    console.info("locking file " + file);
    return this.app.client.sendRequest({
      name: "lock_project_file",
      project: this.id,
      file: file
    }, (function(_this) {
      return function(msg) {};
    })(this));
  };

  Project.prototype.fileLocked = function(msg) {
    this.locks[msg.file] = {
      user: msg.user,
      time: Date.now() + 10000
    };
    this.friends[msg.user] = Date.now() + 120000;
    return this.notifyListeners("locks");
  };

  Project.prototype.isLocked = function(file) {
    var lock;
    lock = this.locks[file];
    if ((lock != null) && Date.now() < lock.time) {
      return lock;
    } else {
      return false;
    }
  };

  Project.prototype.checkLocks = function() {
    var change, file, lock, ref, ref1, time, user;
    change = false;
    ref = this.locks;
    for (file in ref) {
      lock = ref[file];
      if (Date.now() > lock.time) {
        delete this.locks[file];
        change = true;
      }
    }
    ref1 = this.friends;
    for (user in ref1) {
      time = ref1[user];
      if (Date.now() > time) {
        delete this.friends[user];
        change = true;
      }
    }
    if (change) {
      return this.notifyListeners("locks");
    }
  };

  Project.prototype.changeSpriteName = function(old, name) {
    var changed, i, j, k, l, len, map, n, ref, ref1, ref2, s;
    this.sprite_table[name] = this.sprite_table[old];
    delete this.sprite_table[old];
    ref = this.map_list;
    for (k = 0, len = ref.length; k < len; k++) {
      map = ref[k];
      changed = false;
      for (i = l = 0, ref1 = map.width - 1; l <= ref1; i = l += 1) {
        for (j = n = 0, ref2 = map.height - 1; n <= ref2; j = n += 1) {
          s = map.get(i, j);
          if ((s != null) && s.length > 0) {
            s = s.split(":");
            if (s[0] === old) {
              changed = true;
              if (s[1] != null) {
                map.set(i, j, name + ":" + s[1]);
              } else {
                map.set(i, j, name);
              }
            }
          }
        }
      }
      if (changed) {
        this.app.client.sendRequest({
          name: "write_project_file",
          project: this.app.project.id,
          file: "maps/" + map.name + ".json",
          content: map.save()
        }, (function(_this) {
          return function(msg) {};
        })(this));
      }
    }
  };

  Project.prototype.changeMapName = function(old, name) {
    this.map_table[name] = this.map_table[old];
    return delete this.map_table[old];
  };

  Project.prototype.fileUpdated = function(msg) {
    var name;
    if (msg.file.indexOf("ms/") === 0) {
      name = msg.file.substring("ms/".length, msg.file.indexOf(".ms"));
      if (this.source_table[name] != null) {
        return this.source_table[name].reload();
      } else {
        return this.updateSourceList();
      }
    } else if (msg.file === "doc/doc.md") {
      return this.app.doc_editor.setDoc(msg.content);
    } else if (msg.file.indexOf("sprites/") === 0) {
      name = msg.file.substring("sprites/".length, msg.file.indexOf(".png"));
      if (this.sprite_table[name] != null) {
        return this.sprite_table[name].reload((function(_this) {
          return function() {
            if (name === _this.app.sprite_editor.selected_sprite) {
              return _this.app.sprite_editor.currentSpriteUpdated();
            }
          };
        })(this));
      } else {
        return this.updateSpriteList();
      }
    } else if (msg.file.indexOf("maps/") === 0) {
      name = msg.file.substring("maps/".length, msg.file.indexOf(".json"));
      if (this.map_table[name] != null) {
        return this.map_table[name].loadFile();
      } else {
        return this.updateMapList();
      }
    }
  };

  Project.prototype.fileDeleted = function(msg) {
    if (msg.file.indexOf("ms/") === 0) {
      return this.updateSourceList();
    } else if (msg.file.indexOf("sprites/") === 0) {
      return this.updateSpriteList();
    } else if (msg.file.indexOf("maps/") === 0) {
      return this.updateMapList();
    }
  };

  Project.prototype.optionsUpdated = function(data) {
    this.slug = data.slug;
    this.title = data.title;
    this["public"] = data["public"];
    this.platforms = data.platforms;
    this.controls = data.controls;
    this.type = data.type;
    this.orientation = data.orientation;
    return this.aspect = data.aspect;
  };

  Project.prototype.addSprite = function(sprite) {
    var s;
    s = new ProjectSprite(this, sprite.file, null, null, sprite.properties, sprite.size);
    this.sprite_table[s.name] = s;
    this.sprite_list.push(s);
    return s;
  };

  Project.prototype.getSprite = function(name) {
    return this.sprite_table[name];
  };

  Project.prototype.createSprite = function(width, height, name) {
    var count, filename, sprite;
    if (name == null) {
      name = "sprite";
    }
    if (this.getSprite(name)) {
      count = 2;
      while (true) {
        filename = "" + name + (count++);
        if (this.getSprite(filename) == null) {
          break;
        }
      }
    } else {
      filename = name;
    }
    sprite = new ProjectSprite(this, filename + ".png", width, height);
    this.sprite_table[sprite.name] = sprite;
    this.sprite_list.push(sprite);
    this.notifyListeners("spritelist");
    return sprite;
  };

  Project.prototype.addSource = function(file) {
    var s;
    s = new ProjectSource(this, file.file, file.size);
    this.source_table[s.name] = s;
    this.source_list.push(s);
    return s;
  };

  Project.prototype.getSource = function(name) {
    return this.source_table[name];
  };

  Project.prototype.createSource = function() {
    var count, filename, source;
    count = 1;
    while (true) {
      filename = "source" + (count++);
      if (this.getSource(filename) == null) {
        break;
      }
    }
    source = new ProjectSource(this, filename + ".ms");
    this.source_table[source.name] = source;
    this.source_list.push(source);
    this.notifyListeners("sourcelist");
    return source;
  };

  Project.prototype.getFullSource = function() {
    var k, len, ref, res, s;
    res = "";
    ref = this.source_list;
    for (k = 0, len = ref.length; k < len; k++) {
      s = ref[k];
      res += s + "\n";
    }
    return res;
  };

  Project.prototype.setFileList = function(list, target_list, target_table, get, add, notification) {
    var f, i, k, l, len, len1, li, n, ref, s;
    li = [];
    for (k = 0, len = list.length; k < len; k++) {
      f = list[k];
      li.push(f.file);
    }
    for (i = l = ref = target_list.length - 1; l >= 0; i = l += -1) {
      s = target_list[i];
      if (li.indexOf(s.filename) < 0) {
        target_list.splice(i, 1);
        delete target_table[s.name];
      }
    }
    for (n = 0, len1 = list.length; n < len1; n++) {
      s = list[n];
      if (!this[get](s.file.split(".")[0])) {
        this[add](s);
      }
    }
    return this.notifyListeners(notification);
  };

  Project.prototype.setSourceList = function(list) {
    return this.setFileList(list, this.source_list, this.source_table, "getSource", "addSource", "sourcelist");
  };

  Project.prototype.setSpriteList = function(list) {
    return this.setFileList(list, this.sprite_list, this.sprite_table, "getSprite", "addSprite", "spritelist");
  };

  Project.prototype.setMapList = function(list) {
    return this.setFileList(list, this.map_list, this.map_table, "getMap", "addMap", "maplist");
  };

  Project.prototype.setSoundList = function(list) {
    return this.setFileList(list, this.sound_list, this.sound_table, "getSound", "addSound", "soundlist");
  };

  Project.prototype.setMusicList = function(list) {
    return this.setFileList(list, this.music_list, this.music_table, "getMusic", "addMusic", "musiclist");
  };

  Project.prototype.setMapList = function(list) {
    return this.setFileList(list, this.map_list, this.map_table, "getMap", "addMap", "maplist");
  };

  Project.prototype.setAssetList = function(list) {
    return this.setFileList(list, this.asset_list, this.asset_table, "getAsset", "addAsset", "assetlist");
  };

  Project.prototype.addMap = function(file) {
    var m;
    m = new ProjectMap(this, file.file, file.size);
    this.map_table[m.name] = m;
    this.map_list.push(m);
    return m;
  };

  Project.prototype.getMap = function(name) {
    return this.map_table[name];
  };

  Project.prototype.addAsset = function(file) {
    var m;
    m = new ProjectAsset(this, file.file, file.size);
    this.asset_table[m.name] = m;
    this.asset_list.push(m);
    return m;
  };

  Project.prototype.getAsset = function(name) {
    return this.asset_table[name];
  };

  Project.prototype.createMap = function() {
    var count, filename, m;
    count = 1;
    while (true) {
      filename = "map" + (count++);
      if (this.getMap(filename) == null) {
        break;
      }
    }
    m = this.addMap({
      file: filename + ".json",
      size: 0
    });
    this.notifyListeners("maplist");
    return m;
  };

  Project.prototype.createSound = function(name, thumbnail, size) {
    var count, filename, sound;
    if (name == null) {
      name = "sound";
    }
    if (this.getSound(name)) {
      count = 2;
      while (true) {
        filename = "" + name + (count++);
        if (this.getSound(filename) == null) {
          break;
        }
      }
    } else {
      filename = name;
    }
    sound = new ProjectSound(this, filename + ".wav", size);
    if (thumbnail) {
      sound.thumbnail_url = thumbnail;
    }
    this.sound_table[sound.name] = sound;
    this.sound_list.push(sound);
    this.notifyListeners("soundlist");
    return sound;
  };

  Project.prototype.addSound = function(file) {
    var m;
    m = new ProjectSound(this, file.file, file.size);
    this.sound_table[m.name] = m;
    this.sound_list.push(m);
    return m;
  };

  Project.prototype.getSound = function(name) {
    return this.sound_table[name];
  };

  Project.prototype.createMusic = function(name, thumbnail, size) {
    var count, filename, music;
    if (name == null) {
      name = "music";
    }
    if (this.getMusic(name)) {
      count = 2;
      while (true) {
        filename = "" + name + (count++);
        if (this.getMusic(filename) == null) {
          break;
        }
      }
    } else {
      filename = name;
    }
    music = new ProjectMusic(this, filename + ".mp3", size);
    if (thumbnail) {
      music.thumbnail_url = thumbnail;
    }
    this.music_table[music.name] = music;
    this.music_list.push(music);
    this.notifyListeners("musiclist");
    return music;
  };

  Project.prototype.addMusic = function(file) {
    var m;
    m = new ProjectMusic(this, file.file, file.size);
    this.music_table[m.name] = m;
    this.music_list.push(m);
    return m;
  };

  Project.prototype.getMusic = function(name) {
    return this.music_table[name];
  };

  Project.prototype.setTitle = function(title) {
    this.title = title;
    return this.notifyListeners("title");
  };

  Project.prototype.setSlug = function(slug) {
    this.slug = slug;
    return this.notifyListeners("slug");
  };

  Project.prototype.setCode = function(code) {
    this.code = code;
    return this.notifyListeners("code");
  };

  Project.prototype.setType = function(type1) {
    this.type = type1;
  };

  Project.prototype.setOrientation = function(orientation) {
    this.orientation = orientation;
  };

  Project.prototype.setAspect = function(aspect) {
    this.aspect = aspect;
  };

  Project.prototype.setGraphics = function(graphics) {
    this.graphics = graphics;
  };

  Project.prototype.addPendingChange = function(item) {
    if (this.pending_changes.indexOf(item) < 0) {
      this.pending_changes.push(item);
    }
    if (this.onbeforeunload == null) {
      this.onbeforeunload = (function(_this) {
        return function(event) {
          event.preventDefault();
          event.returnValue = "You have pending unsaved changed.";
          _this.savePendingChanges();
          return event.returnValue;
        };
      })(this);
      return window.addEventListener("beforeunload", this.onbeforeunload);
    }
  };

  Project.prototype.removePendingChange = function(item) {
    var index;
    index = this.pending_changes.indexOf(item);
    if (index >= 0) {
      this.pending_changes.splice(index, 1);
    }
    if (this.pending_changes.length === 0) {
      if (this.onbeforeunload != null) {
        window.removeEventListener("beforeunload", this.onbeforeunload);
        return this.onbeforeunload = null;
      }
    }
  };

  Project.prototype.savePendingChanges = function(callback) {
    var save;
    if (this.pending_changes.length > 0) {
      save = this.pending_changes.splice(0, 1)[0];
      return save.forceSave((function(_this) {
        return function() {
          return _this.savePendingChanges(callback);
        };
      })(this));
    } else {
      if (callback != null) {
        return callback();
      }
    }
  };

  Project.prototype.getSize = function() {
    var k, l, len, len1, ref, s, size, t, type;
    size = 0;
    ref = this.file_types;
    for (k = 0, len = ref.length; k < len; k++) {
      type = ref[k];
      t = this[type + "_list"];
      for (l = 0, len1 = t.length; l < len1; l++) {
        s = t[l];
        size += s.size;
      }
    }
    return size;
  };

  return Project;

})();
