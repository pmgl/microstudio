this.Project = class Project {
  constructor(app, data) {
    var f, k, len1, ref;
    this.setSourceList = this.setSourceList.bind(this);
    this.setSpriteList = this.setSpriteList.bind(this);
    this.setMapList = this.setMapList.bind(this);
    this.setSoundList = this.setSoundList.bind(this);
    this.setMusicList = this.setMusicList.bind(this);
    this.setAssetList = this.setAssetList.bind(this);
    this.app = app;
    this.id = data.id;
    this.owner = data.owner;
    this.accepted = data.accepted;
    this.slug = data.slug;
    this.code = data.code;
    this.title = data.title;
    this.description = data.description;
    this.tags = data.tags;
    this.public = data.public;
    this.unlisted = data.unlisted;
    this.platforms = data.platforms;
    this.controls = data.controls;
    this.type = data.type;
    this.orientation = data.orientation;
    this.graphics = data.graphics || "M1";
    this.language = data.language || "microscript_v1_i";
    this.libs = data.libs || [];
    this.aspect = data.aspect;
    this.users = data.users;
    this.tabs = data.tabs;
    this.plugins = data.plugins;
    this.libraries = data.libraries;
    this.networking = data.networking;
    this.properties = data.properties || {};
    this.flags = data.flags || {};
    this.file_types = ["source", "sprite", "map", "asset", "sound", "music"];
    ref = this.file_types;
    for (k = 0, len1 = ref.length; k < len1; k++) {
      f = ref[k];
      this[`${f}_list`] = [];
      this[`${f}_table`] = {};
      this[`${f}_folder`] = new ProjectFolder(null, f);
    }
    this.locks = {};
    this.lock_time = {};
    this.friends = {};
    this.url = location.origin + `/${this.owner.nick}/${this.slug}/`;
    this.listeners = [];
    setInterval((() => {
      return this.checkLocks();
    }), 1000);
    this.pending_changes = [];
    this.onbeforeunload = null;
  }

  getFullURL() {
    if (this.public) {
      return this.url;
    } else {
      return location.origin + `/${this.owner.nick}/${this.slug}/${this.code}/`;
    }
  }

  addListener(lis) {
    return this.listeners.push(lis);
  }

  notifyListeners(change) {
    var k, len1, lis, ref;
    ref = this.listeners;
    for (k = 0, len1 = ref.length; k < len1; k++) {
      lis = ref[k];
      lis.projectUpdate(change);
    }
  }

  load() {
    this.updateSourceList();
    this.updateSpriteList();
    this.updateMapList();
    this.updateSoundList();
    this.updateMusicList();
    this.updateAssetList();
    return this.loadDoc();
  }

  loadDoc() {
    this.app.doc_editor.setDoc("");
    return this.app.readProjectFile(this.id, "doc/doc.md", (content) => {
      return this.app.doc_editor.setDoc(content);
    });
  }

  updateFileList(folder, callback) {
    return this.app.client.sendRequest({
      name: "list_project_files",
      project: this.app.project.id,
      folder: folder
    }, (msg) => {
      return this[callback](msg.files);
    });
  }

  updateSourceList() {
    return this.updateFileList("ms", "setSourceList");
  }

  updateSpriteList() {
    return this.updateFileList("sprites", "setSpriteList");
  }

  updateMapList() {
    return this.updateFileList("maps", "setMapList");
  }

  updateSoundList() {
    return this.updateFileList("sounds", "setSoundList");
  }

  updateMusicList() {
    return this.updateFileList("music", "setMusicList");
  }

  updateAssetList() {
    return this.updateFileList("assets", "setAssetList");
  }

  lockFile(file) {
    var lock;
    lock = this.lock_time[file];
    if ((lock != null) && Date.now() < lock) {
      return;
    }
    this.lock_time[file] = Date.now() + 2000;
    console.info(`locking file ${file}`);
    return this.app.client.sendRequest({
      name: "lock_project_file",
      project: this.id,
      file: file
    }, (msg) => {});
  }

  fileLocked(msg) {
    this.locks[msg.file] = {
      user: msg.user,
      time: Date.now() + 10000
    };
    this.friends[msg.user] = Date.now() + 120000;
    return this.notifyListeners("locks");
  }

  isLocked(file) {
    var lock;
    lock = this.locks[file];
    if ((lock != null) && Date.now() < lock.time) {
      return lock;
    } else {
      return false;
    }
  }

  checkLocks() {
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
  }

  changeSpriteName(old, name) {
    var changed, i, j, k, l, len1, map, n, ref, ref1, ref2, s;
    old = old.replace(/-/g, "/");
    ref = this.map_list;
    for (k = 0, len1 = ref.length; k < len1; k++) {
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
          file: `maps/${map.name}.json`,
          content: map.save()
        }, (msg) => {});
      }
    }
  }

  changeMapName(old, name) {
    this.map_table[name] = this.map_table[old];
    return delete this.map_table[old];
  }

  fileUpdated(msg) {
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
        if (msg.properties != null) {
          this.sprite_table[name].properties = msg.properties;
          if (msg.properties.fps != null) {
            this.sprite_table[name].fps = msg.properties.fps;
          }
        }
        return this.sprite_table[name].reload(() => {
          if (name === this.app.sprite_editor.selected_sprite) {
            return this.app.sprite_editor.currentSpriteUpdated();
          }
        });
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
    } else if (msg.file.indexOf("sounds/") === 0) {
      name = msg.file.substring("sounds/".length, msg.file.length).split(".")[0];
      if (this.sound_table[name] == null) {
        return this.updateSoundList();
      }
    } else if (msg.file.indexOf("music/") === 0) {
      name = msg.file.substring("music/".length, msg.file.length).split(".")[0];
      if (this.music_table[name] == null) {
        return this.updateMusicList();
      }
    } else if (msg.file.indexOf("assets/") === 0) {
      name = msg.file.substring("assets/".length, msg.file.length).split(".")[0];
      if (this.asset_table[name] == null) {
        return this.updateAssetList();
      }
    }
  }

  fileDeleted(msg) {
    if (msg.file.indexOf("ms/") === 0) {
      return this.updateSourceList();
    } else if (msg.file.indexOf("sprites/") === 0) {
      return this.updateSpriteList();
    } else if (msg.file.indexOf("maps/") === 0) {
      return this.updateMapList();
    } else if (msg.file.indexOf("sounds/") === 0) {
      return this.updateSoundList();
    } else if (msg.file.indexOf("music/") === 0) {
      return this.updateMusicList();
    }
  }

  optionsUpdated(data) {
    this.slug = data.slug;
    this.title = data.title;
    this.public = data.public;
    this.platforms = data.platforms;
    this.controls = data.controls;
    this.type = data.type;
    this.orientation = data.orientation;
    return this.aspect = data.aspect;
  }

  addSprite(sprite) {
    var s;
    s = new ProjectSprite(this, sprite.file, null, null, sprite.properties, sprite.size);
    this.sprite_table[s.name] = s;
    this.sprite_list.push(s);
    this.sprite_folder.push(s);
    return s;
  }

  getSprite(name) {
    return this.sprite_table[name];
  }

  createSprite(width, height, name = "sprite") {
    var count, filename, sprite;
    if (this.getSprite(name)) {
      count = 2;
      while (true) {
        filename = `${name}${count++}`;
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
    this.sprite_folder.push(sprite);
    this.notifyListeners("spritelist");
    return sprite;
  }

  addSource(file) {
    var s;
    s = new ProjectSource(this, file.file, file.size);
    this.source_table[s.name] = s;
    this.source_list.push(s);
    this.source_folder.push(s);
    return s;
  }

  getSource(name) {
    return this.source_table[name];
  }

  createSource(basename = "source") {
    var count, filename, source;
    count = 2;
    filename = basename;
    while (this.getSource(filename) != null) {
      filename = `${basename}${count++}`;
    }
    source = new ProjectSource(this, filename + ".ms");
    source.fetched = true;
    this.source_table[source.name] = source;
    this.source_list.push(source);
    this.source_folder.push(source);
    this.notifyListeners("sourcelist");
    return source;
  }

  getFullSource() {
    var k, len1, ref, res, s;
    res = "";
    ref = this.source_list;
    for (k = 0, len1 = ref.length; k < len1; k++) {
      s = ref[k];
      res += s + "\n";
    }
    return res;
  }

  setFileList(list, target_list, target_table, get, add, item_id) {
    var f, folder, i, k, l, len1, len2, li, n, notification, ref, s;
    notification = item_id + "list";
    li = [];
    for (k = 0, len1 = list.length; k < len1; k++) {
      f = list[k];
      li.push(f.file);
    }
    folder = this[item_id + "_folder"];
    folder.removeNoMatch(li);
//@[item_id+"_folder"] = new ProjectFolder(null,item_id)
    for (i = l = ref = target_list.length - 1; l >= 0; i = l += -1) {
      s = target_list[i];
      if (li.indexOf(s.filename) < 0) {
        target_list.splice(i, 1);
        delete target_table[s.name];
      }
    }
    for (n = 0, len2 = list.length; n < len2; n++) {
      s = list[n];
      if (!this[get](s.file.split(".")[0])) {
        this[add](s);
      }
    }
    folder.removeEmptyFolders();
    folder.sort();
    return this.notifyListeners(notification);
  }

  setSourceList(list) {
    return this.setFileList(list, this.source_list, this.source_table, "getSource", "addSource", "source");
  }

  setSpriteList(list) {
    return this.setFileList(list, this.sprite_list, this.sprite_table, "getSprite", "addSprite", "sprite");
  }

  setMapList(list) {
    return this.setFileList(list, this.map_list, this.map_table, "getMap", "addMap", "map");
  }

  setSoundList(list) {
    return this.setFileList(list, this.sound_list, this.sound_table, "getSound", "addSound", "sound");
  }

  setMusicList(list) {
    return this.setFileList(list, this.music_list, this.music_table, "getMusic", "addMusic", "music");
  }

  setAssetList(list) {
    return this.setFileList(list, this.asset_list, this.asset_table, "getAsset", "addAsset", "asset");
  }

  addMap(file) {
    var m;
    m = new ProjectMap(this, file.file, file.size);
    this.map_table[m.name] = m;
    this.map_list.push(m);
    this.map_folder.push(m);
    return m;
  }

  getMap(name) {
    return this.map_table[name];
  }

  addAsset(file) {
    var m;
    m = new ProjectAsset(this, file.file, file.size);
    this.asset_table[m.name] = m;
    this.asset_list.push(m);
    this.asset_folder.push(m);
    return m;
  }

  getAsset(name) {
    return this.asset_table[name];
  }

  createMap(basename = "map") {
    var count, m, name;
    name = basename;
    count = 2;
    while (this.getMap(name)) {
      name = `${basename}${count++}`;
    }
    m = this.addMap({
      file: name + ".json",
      size: 0
    });
    this.notifyListeners("maplist");
    return m;
  }

  createSound(name = "sound", thumbnail, size) {
    var count, filename, sound;
    if (this.getSound(name)) {
      count = 2;
      while (true) {
        filename = `${name}${count++}`;
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
    this.sound_folder.push(sound);
    this.notifyListeners("soundlist");
    return sound;
  }

  addSound(file) {
    var m;
    m = new ProjectSound(this, file.file, file.size);
    this.sound_table[m.name] = m;
    this.sound_list.push(m);
    this.sound_folder.push(m);
    return m;
  }

  getSound(name) {
    return this.sound_table[name];
  }

  createMusic(name = "music", thumbnail, size) {
    var count, filename, music;
    if (this.getMusic(name)) {
      count = 2;
      while (true) {
        filename = `${name}${count++}`;
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
    this.music_folder.push(music);
    this.notifyListeners("musiclist");
    return music;
  }

  addMusic(file) {
    var m;
    m = new ProjectMusic(this, file.file, file.size);
    this.music_table[m.name] = m;
    this.music_list.push(m);
    this.music_folder.push(m);
    return m;
  }

  getMusic(name) {
    return this.music_table[name];
  }

  createAsset(name = "asset", thumbnail, size, ext) {
    var asset, count, filename;
    if (this.getAsset(name)) {
      count = 2;
      while (true) {
        filename = `${name}${count++}`;
        if (this.getAsset(filename) == null) {
          break;
        }
      }
    } else {
      filename = name;
    }
    asset = new ProjectAsset(this, filename + `.${ext}`, size);
    if (thumbnail) {
      asset.thumbnail_url = thumbnail;
    }
    this.asset_table[asset.name] = asset;
    this.asset_list.push(asset);
    this.asset_folder.push(asset);
    this.notifyListeners("assetlist");
    return asset;
  }

  setTitle(title) {
    this.title = title;
    return this.notifyListeners("title");
  }

  setSlug(slug) {
    this.slug = slug;
    return this.notifyListeners("slug");
  }

  setCode(code) {
    this.code = code;
    return this.notifyListeners("code");
  }

  setType(type1) {
    this.type = type1;
  }

  setOrientation(orientation) {
    this.orientation = orientation;
  }

  //window.dispatchEvent(new Event('resize'))
  setAspect(aspect) {
    this.aspect = aspect;
  }

  //window.dispatchEvent(new Event('resize'))
  setGraphics(graphics) {
    this.graphics = graphics;
  }

  //window.dispatchEvent(new Event('resize'))
  setLanguage(language) {
    this.language = language;
  }

  //window.dispatchEvent(new Event('resize'))
  addPendingChange(item) {
    if (this.pending_changes.indexOf(item) < 0) {
      this.pending_changes.push(item);
    }
    if (this.onbeforeunload == null) {
      this.onbeforeunload = (event) => {
        event.preventDefault();
        event.returnValue = "You have pending unsaved changed.";
        this.savePendingChanges();
        return event.returnValue;
      };
      return window.addEventListener("beforeunload", this.onbeforeunload);
    }
  }

  removePendingChange(item) {
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
  }

  savePendingChanges(callback) {
    var save;
    if (this.pending_changes.length > 0) {
      save = this.pending_changes.splice(0, 1)[0];
      return save.forceSave(() => {
        return this.savePendingChanges(callback);
      });
    } else {
      if (callback != null) {
        return callback();
      }
    }
  }

  getSize() {
    var k, l, len1, len2, ref, s, size, t, type;
    size = 0;
    ref = this.file_types;
    for (k = 0, len1 = ref.length; k < len1; k++) {
      type = ref[k];
      t = this[`${type}_list`];
      for (l = 0, len2 = t.length; l < len2; l++) {
        s = t[l];
        size += s.size;
      }
    }
    return size;
  }

  writeFile(name, content, options) {
    var folder, i, k, ref;
    name = name.split("/");
    folder = name[0];
    for (i = k = 0, ref = name.length - 1; (0 <= ref ? k <= ref : k >= ref); i = 0 <= ref ? ++k : --k) {
      name[i] = RegexLib.fixFilename(name[i]);
    }
    name = name.slice(1).join("-");
    switch (folder) {
      case "ms":
        return this.writeSourceFile(name, content);
      case "sprites":
        return this.writeSpriteFile(name, content, options.frames, options.fps);
      case "maps":
        return this.writeMapFile(name, content);
      case "sounds":
        return this.writeSoundFile(name, content);
      case "music":
        return this.writeMusicFile(name, content);
      case "assets":
        return this.writeAssetFile(name, content, options.ext);
    }
  }

  writeSourceFile(name, content) {
    return this.app.client.sendRequest({
      name: "write_project_file",
      project: this.id,
      file: `ms/${name}.ms`,
      content: content
    }, (msg) => {
      return this.updateSourceList();
    });
  }

  writeSoundFile(name, content) {
    var audioContext, base64ToArrayBuffer;
    base64ToArrayBuffer = function(base64) {
      var binary_string, bytes, i, k, len, ref;
      binary_string = window.atob(base64);
      len = binary_string.length;
      bytes = new Uint8Array(len);
      for (i = k = 0, ref = len - 1; k <= ref; i = k += 1) {
        bytes[i] = binary_string.charCodeAt(i);
      }
      return bytes.buffer;
    };
    audioContext = new AudioContext();
    return audioContext.decodeAudioData(base64ToArrayBuffer(content), (decoded) => {
      var thumbnailer;
      console.info(decoded);
      thumbnailer = new SoundThumbnailer(decoded, 96, 64);
      return this.app.client.sendRequest({
        name: "write_project_file",
        project: this.id,
        file: `sounds/${name}.wav`,
        properties: {},
        content: content,
        thumbnail: thumbnailer.canvas.toDataURL().split(",")[1]
      }, (msg) => {
        console.info(msg);
        return this.updateSoundList();
      });
    });
  }

  writeMusicFile(name, content) {
    var audioContext, base64ToArrayBuffer;
    base64ToArrayBuffer = function(base64) {
      var binary_string, bytes, i, k, len, ref;
      binary_string = window.atob(base64);
      len = binary_string.length;
      bytes = new Uint8Array(len);
      for (i = k = 0, ref = len - 1; k <= ref; i = k += 1) {
        bytes[i] = binary_string.charCodeAt(i);
      }
      return bytes.buffer;
    };
    audioContext = new AudioContext();
    return audioContext.decodeAudioData(base64ToArrayBuffer(content), (decoded) => {
      var thumbnailer;
      console.info(decoded);
      thumbnailer = new SoundThumbnailer(decoded, 192, 64, "hsl(200,80%,60%)");
      return this.app.client.sendRequest({
        name: "write_project_file",
        project: this.id,
        file: `music/${name}.mp3`,
        properties: {},
        content: content,
        thumbnail: thumbnailer.canvas.toDataURL().split(",")[1]
      }, (msg) => {
        console.info(msg);
        return this.updateMusicList();
      });
    });
  }

  writeSpriteFile(name, content, frames, fps) {
    return this.app.client.sendRequest({
      name: "write_project_file",
      project: this.id,
      file: `sprites/${name}.png`,
      properties: {
        frames: frames,
        fps: fps
      },
      content: content
    }, (msg) => {
      return this.fileUpdated({
        file: `sprites/${name}.png`,
        properties: {
          frames: frames,
          fps: fps
        }
      });
    });
  }

  // @updateSpriteList()
  writeMapFile(name, content) {
    return this.app.client.sendRequest({
      name: "write_project_file",
      project: this.id,
      file: `maps/${name}.json`,
      content: content
    }, (msg) => {
      this.fileUpdated({
        file: `maps/${name}.json`
      });
      return this.updateMapList();
    });
  }

  writeAssetFile(name, content, ext) {
    var send, thumbnail;
    if (ext === "json") {
      content = JSON.stringify(content);
    }
    thumbnail = void 0;
    if (ext === "txt" || ext === "csv" || ext === "json" || ext === "obj") {
      thumbnail = this.app.assets_manager.text_viewer.createThumbnail(content, ext);
      thumbnail = thumbnail.toDataURL().split(",")[1];
    }
    if (ext === "obj") {
      content = btoa(content);
    }
    send = () => {
      return this.app.client.sendRequest({
        name: "write_project_file",
        project: this.id,
        file: `assets/${name}.${ext}`,
        content: content,
        thumbnail: thumbnail
      }, (msg) => {
        return this.updateAssetList();
      });
    };
    if (ext === "png" || ext === "jpg") {
      this.app.assets_manager.image_viewer.createThumbnail(content, (canvas) => {
        thumbnail = canvas.toDataURL().split(",")[1];
        content = content.split(",")[1];
        return send();
      });
      return;
    }
    return send();
  }

};
