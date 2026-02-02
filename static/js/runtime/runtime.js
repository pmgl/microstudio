var arrayBufferToBase64, loadFile, loadLameJSLib, loadWaveFileLib, saveFile, writeProjectFile;

this.Runtime = class Runtime {
  constructor(url1, sources, resources, listener) {
    this.url = url1;
    this.sources = sources;
    this.resources = resources;
    this.listener = listener;
    this.screen = new Screen(this);
    this.audio = new AudioCore(this);
    this.keyboard = new Keyboard();
    this.gamepad = new Gamepad();
    this.asset_manager = new AssetManager(this);
    this.sprites = {};
    this.maps = {};
    this.sounds = {};
    this.music = {};
    this.assets = {};
    this.touch = {};
    this.mouse = this.screen.mouse;
    this.previous_init = null;
    this.random = new Random(0);
    this.orientation = window.orientation;
    this.aspect = window.aspect;
    this.report_errors = true;
    this.log = (text) => {
      return this.listener.log(text);
    };
    this.update_memory = {};
    this.time_machine = new TimeMachine(this);
    this.createDropFeature();
    window.ms_async_load = false;
    this.connections = [];
  }

  addConnection(connection) {
    return this.connections.push(connection);
  }

  updateSource(file, src, reinit = false) {
    var err, init;
    if (this.vm == null) {
      return false;
    }
    if (src === this.update_memory[file]) {
      return false;
    }
    this.update_memory[file] = src;
    this.audio.cancelBeeps();
    this.screen.clear();
    try {
      this.vm.run(src, 3000, file);
      this.listener.postMessage({
        name: "compile_success",
        file: file
      });
      this.reportWarnings();
      if (this.vm.error_info != null) {
        err = this.vm.error_info;
        err.type = "init";
        err.file = file;
        this.listener.reportError(err);
        return false;
      }
      if (this.vm.runner.getFunctionSource != null) {
        init = this.vm.runner.getFunctionSource("init");
        if ((init != null) && init !== this.previous_init && reinit) {
          this.previous_init = init;
          this.vm.call("init");
          if (this.vm.error_info != null) {
            err = this.vm.error_info;
            err.type = "init";
            this.listener.reportError(err);
          }
        }
      }
      return true;
    } catch (error) {
      err = error;
      if (this.report_errors) {
        console.error(err);
        err.file = file;
        this.listener.reportError(err);
        return false;
      }
    }
  }

  start() {
    var a, i, j, k, key, l, len1, len2, len3, len4, len5, m, n, name, o, ref, ref1, ref2, ref3, ref4, ref5, s, value;
    if (window.ms_async_load) {
      this.startReady();
    }
    ref = this.resources.images;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      i = ref[j];
      s = LoadSprite(this.url + "sprites/" + i.file + "?v=" + i.version, i.properties, () => {
        this.updateMaps();
        return this.checkStartReady();
      });
      name = i.file.split(".")[0].replace(/-/g, "/");
      s.name = name;
      this.sprites[name] = s;
    }
    if (Array.isArray(this.resources.maps)) {
      ref1 = this.resources.maps;
      for (k = 0, len2 = ref1.length; k < len2; k++) {
        m = ref1[k];
        name = m.file.split(".")[0].replace(/-/g, "/");
        this.maps[name] = LoadMap(this.url + `maps/${m.file}?v=${m.version}`, () => {
          return this.checkStartReady();
        });
        this.maps[name].name = name;
      }
    } else if (this.resources.maps != null) {
      if (window.player == null) {
        window.player = this.listener;
      }
      ref2 = this.resources.maps;
      for (key in ref2) {
        value = ref2[key];
        this.updateMap(key, 0, value);
      }
    }
    ref3 = this.resources.sounds;
    for (l = 0, len3 = ref3.length; l < len3; l++) {
      s = ref3[l];
      name = s.file.split(".")[0];
      s = new Sound(this.audio, this.url + "sounds/" + s.file + "?v=" + s.version);
      s.name = name;
      this.sounds[name] = s;
    }
    ref4 = this.resources.music;
    for (n = 0, len4 = ref4.length; n < len4; n++) {
      m = ref4[n];
      name = m.file.split(".")[0];
      m = new Music(this.audio, this.url + "music/" + m.file + "?v=" + m.version);
      m.name = name;
      this.music[name] = m;
    }
    ref5 = this.resources.assets;
    for (o = 0, len5 = ref5.length; o < len5; o++) {
      a = ref5[o];
      name = a.file.split(".")[0];
      name = name.replace(/-/g, "/");
      a.name = name;
      this.assets[name] = a;
    }
  }

  checkStartReady() {
    var count, key, progress, ready, ref, ref1, value;
    count = 0;
    ready = 0;
    ref = this.sprites;
    for (key in ref) {
      value = ref[key];
      count += 1;
      if (value.ready) {
        ready += 1;
      }
    }
    ref1 = this.maps;
    for (key in ref1) {
      value = ref1[key];
      count += 1;
      if (value.ready) {
        ready += 1;
      }
    }
    if (ready < count) {
      if ((this.loading_bar_time == null) || Date.now() > this.loading_bar_time + 16) {
        this.loading_bar_time = Date.now();
        if (this.screen.fillRect != null) {
          this.screen.clear();
          this.screen.drawRect(0, 0, 100, 10, "#DDD");
          progress = ready / count;
          this.screen.fillRect(-(1 - progress) * 48, 0, progress * 96, 6, "#DDD");
        }
        if (window.ms_async_load && (this.vm != null)) {
          this.vm.context.global.system.loading = Math.floor(ready / count * 100);
        }
      }
      if (!window.ms_async_load) {
        return;
      }
    } else {
      if (window.ms_async_load && (this.vm != null)) {
        this.vm.context.global.system.loading = 100;
      }
    }
    if (!this.started) {
      return this.startReady();
    }
  }

  startReady() {
    var err, file, global, init, j, len1, lib, meta, namespace, ref, ref1, src;
    this.started = true;
    meta = {
      print: (text) => {
        if ((typeof text === "object" || typeof text === "function") && (this.vm != null)) {
          text = this.vm.runner.toString(text);
        }
        return this.listener.log(text);
      }
    };
    global = {
      screen: this.screen.getInterface(),
      audio: this.audio.getInterface(),
      keyboard: this.keyboard.keyboard,
      gamepad: this.gamepad.status,
      sprites: this.sprites,
      sounds: this.sounds,
      music: this.music,
      assets: this.assets,
      asset_manager: this.asset_manager.getInterface(),
      maps: this.maps,
      touch: this.touch,
      mouse: this.mouse,
      fonts: window.fonts,
      Sound: Sound.createSoundClass(this.audio),
      Image: msImage,
      Sprite: Sprite,
      Map: MicroMap
    };
    if (window.graphics === "M3D") {
      global.M3D = M3D;
      M3D.runtime = this;
    } else if (window.graphics === "M2D") {
      global.M2D = M2D;
      M2D.runtime = this;
    } else if (window.graphics.toLowerCase().startsWith("pixi")) {
      global.PIXI = PIXI;
      PIXI.runtime = this;
    } else if (window.graphics.toLowerCase().startsWith("babylon")) {
      global.BABYLON = BABYLON;
      BABYLON.runtime = this;
    }
    ref = window.ms_libs;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      lib = ref[j];
      lib = lib.split("_")[0];
      switch (lib) {
        case "matterjs":
          global.Matter = Matter;
          break;
        case "cannonjs":
          global.CANNON = CANNON;
      }
    }
    namespace = location.pathname;
    this.vm = new MicroVM(meta, global, namespace, location.hash === "#transpiler");
    if (window.ms_use_server) {
      this.vm.context.global.ServerConnection = MPServerConnection;
    }
    this.vm.context.global.system.pause = () => {
      return this.listener.codePaused();
    };
    this.vm.context.global.system.exit = () => {
      return this.exit();
    };
    if (!window.ms_async_load) {
      this.vm.context.global.system.loading = 100;
    }
    this.vm.context.global.system.disable_autofullscreen = 0;
    this.vm.context.global.system.file = System.file;
    this.vm.context.global.system.javascript = System.javascript;
    if (window.ms_in_editor) {
      this.vm.context.global.system.project = new ProjectInterface(this).interface;
    }
    System.runtime = this;
    ref1 = this.sources;
    for (file in ref1) {
      src = ref1[file];
      this.updateSource(file, src, false);
    }
    if (this.vm.runner.getFunctionSource != null) {
      init = this.vm.runner.getFunctionSource("init");
      if (init != null) {
        this.previous_init = init;
        this.vm.call("init");
        if (this.vm.error_info != null) {
          err = this.vm.error_info;
          err.type = "draw";
          this.listener.reportError(err);
        }
      }
    } else {
      this.vm.call("init");
      if (this.vm.error_info != null) {
        err = this.vm.error_info;
        err.type = "draw";
        this.listener.reportError(err);
      }
    }
    this.dt = 1000 / 60;
    this.last_time = Date.now();
    this.current_frame = 0;
    this.floating_frame = 0;
    requestAnimationFrame(() => {
      return this.timer();
    });
    this.screen.startControl();
    return this.listener.postMessage({
      name: "started"
    });
  }

  updateMaps() {
    var key, map, ref;
    ref = this.maps;
    for (key in ref) {
      map = ref[key];
      map.needs_update = true;
    }
  }

  runCommand(command, callback) {
    var err, res, warnings;
    try {
      warnings = this.vm.context.warnings;
      this.vm.clearWarnings();
      res = this.vm.run(command, void 0, void 0, callback);
      this.reportWarnings();
      this.vm.context.warnings = warnings;
      if (this.vm.error_info != null) {
        err = this.vm.error_info;
        err.type = "exec";
        this.listener.reportError(err);
      }
      this.watchStep();
      if (callback == null) {
        return res;
      } else if (res != null) {
        callback(res);
      }
      return null;
    } catch (error) {
      err = error;
      return this.listener.reportError(err);
    }
  }

  projectFileUpdated(type, file, version, data, properties) {
    switch (type) {
      case "sprites":
        return this.updateSprite(file, version, data, properties);
      case "maps":
        return this.updateMap(file, version, data);
      case "ms":
        return this.updateCode(file, version, data);
    }
  }

  projectFileDeleted(type, file) {
    switch (type) {
      case "sprites":
        return delete this.sprites[file.substring(0, file.length - 4).replace(/-/g, "/")];
      case "maps":
        return delete this.maps[file.substring(0, file.length - 5).replace(/-/g, "/")];
    }
  }

  projectOptionsUpdated(msg) {
    this.orientation = msg.orientation;
    this.aspect = msg.aspect;
    return this.screen.resize();
  }

  updateSprite(name, version, data, properties) {
    var img, slug;
    slug = name;
    name = name.replace(/-/g, "/");
    if (data != null) {
      data = "data:image/png;base64," + data;
      if (this.sprites[name] != null) {
        img = new Image;
        img.crossOrigin = "Anonymous";
        img.src = data;
        return img.onload = () => {
          UpdateSprite(this.sprites[name], img, properties);
          return this.updateMaps();
        };
      } else {
        this.sprites[name] = LoadSprite(data, properties, () => {
          return this.updateMaps();
        });
        return this.sprites[name].name = name;
      }
    } else {
      if (this.sprites[name] != null) {
        img = new Image;
        img.crossOrigin = "Anonymous";
        img.src = this.url + "sprites/" + slug + `.png?v=${version}`;
        return img.onload = () => {
          UpdateSprite(this.sprites[name], img, properties);
          return this.updateMaps();
        };
      } else {
        this.sprites[name] = LoadSprite(this.url + "sprites/" + slug + `.png?v=${version}`, properties, () => {
          return this.updateMaps();
        });
        return this.sprites[name].name = name;
      }
    }
  }

  updateMap(name, version, data) {
    var m, url;
    name = name.replace(/-/g, "/");
    if (data != null) {
      m = this.maps[name];
      if (m != null) {
        UpdateMap(m, data);
        return m.needs_update = true;
      } else {
        m = new MicroMap(1, 1, 1, 1);
        UpdateMap(m, data);
        this.maps[name] = m;
        return this.maps[name].name = name;
      }
    } else {
      url = this.url + `maps/${name}.json?v=${version}`;
      m = this.maps[name];
      if (m != null) {
        return m.loadFile(url);
      } else {
        this.maps[name] = LoadMap(url);
        return this.maps[name].name = name;
      }
    }
  }

  updateCode(name, version, data) {
    var req, url;
    if (data != null) {
      this.sources[name] = data;
      if ((this.vm != null) && data !== this.update_memory[name]) {
        this.vm.clearWarnings();
      }
      return this.updateSource(name, data, true);
    } else {
      url = this.url + `ms/${name}.ms?v=${version}`;
      req = new XMLHttpRequest();
      req.onreadystatechange = (event) => {
        if (req.readyState === XMLHttpRequest.DONE) {
          if (req.status === 200) {
            this.sources[name] = req.responseText;
            return this.updateSource(name, this.sources[name], true);
          }
        }
      };
      req.open("GET", url);
      return req.send();
    }
  }

  stop() {
    this.stopped = true;
    return this.audio.cancelBeeps();
  }

  stepForward() {
    if (this.stopped) {
      this.updateCall();
      this.drawCall();
      if (this.vm.runner.tick != null) {
        this.vm.runner.tick();
      }
      return this.watchStep();
    }
  }

  resume() {
    if (this.stopped) {
      this.stopped = false;
      return requestAnimationFrame(() => {
        return this.timer();
      });
    }
  }

  timer() {
    var ds, dt, fps, i, j, ref, sync_update, time, update_rate;
    if (this.stopped) {
      return;
    }
    requestAnimationFrame(() => {
      return this.timer();
    });
    time = Date.now();
    if (Math.abs(time - this.last_time) > 160) {
      this.last_time = time - 16;
    }
    dt = time - this.last_time;
    this.dt = this.dt * .9 + dt * .1;
    this.last_time = time;
    this.vm.context.global.system.fps = Math.round(fps = 1000 / this.dt);
    update_rate = this.vm.context.global.system.update_rate;
    if ((update_rate == null) || !(update_rate > 0) || !isFinite(update_rate)) {
      update_rate = 60;
    }
    this.floating_frame += this.dt * update_rate / 1000;
    ds = Math.min(10, Math.round(this.floating_frame - this.current_frame));
    if ((ds === 0 || ds === 2) && update_rate === 60 && Math.abs(fps - 60) < 2) {
      //console.info "INCORRECT DS: "+ds+ " floating = "+@floating_frame+" current = "+@current_frame
      ds = 1;
      this.floating_frame = this.current_frame + 1;
    }
    sync_update = this.vm.context.global.system.sync_update;
    if (sync_update) {
      this.updateCall();
    } else {
      for (i = j = 1, ref = ds; j <= ref; i = j += 1) {
        this.updateCall();
        if (i < ds) {
          if (this.vm.runner.tick != null) {
            this.vm.runner.tick();
          }
        }
      }
    }
    this.current_frame += ds;
    this.drawCall();
    if (this.vm.runner.tick != null) {
      this.vm.runner.tick();
    }
    if (ds > 0) {
      return this.watchStep();
    }
  }

  //if ds != 1
  //  console.info "frame missed"
  //if @current_frame%60 == 0
  //  console.info("fps: #{Math.round(1000/@dt)}")
  updateCall() {
    var err;
    if (this.vm.runner.triggers_controls_update) {
      if (this.vm.runner.updateControls == null) {
        this.vm.runner.updateControls = () => {
          return this.updateControls();
        };
      }
    } else {
      this.updateControls();
    }
    try {
      //time = Date.now()
      this.vm.call("update");
      this.time_machine.step();
      this.reportWarnings();
      //console.info "update time: "+(Date.now()-time)
      if (this.vm.error_info != null) {
        err = this.vm.error_info;
        err.type = "update";
        return this.listener.reportError(err);
      }
    } catch (error) {
      err = error;
      if (this.report_errors) {
        return this.listener.reportError(err);
      }
    }
  }

  drawCall() {
    var err;
    try {
      this.screen.initDraw();
      this.screen.updateInterface();
      this.vm.call("draw");
      this.reportWarnings();
      if (this.vm.error_info != null) {
        err = this.vm.error_info;
        err.type = "draw";
        return this.listener.reportError(err);
      }
    } catch (error) {
      err = error;
      if (this.report_errors) {
        return this.listener.reportError(err);
      }
    }
  }

  reportWarnings() {
    var key, ref, ref1, ref2, ref3, ref4, value;
    if (this.vm != null) {
      ref = this.vm.context.warnings.invoking_non_function;
      for (key in ref) {
        value = ref[key];
        if (!value.reported) {
          value.reported = true;
          this.listener.reportError({
            error: "",
            type: "non_function",
            expression: value.expression,
            line: value.line,
            column: value.column,
            file: value.file
          });
        }
      }
      ref1 = this.vm.context.warnings.using_undefined_variable;
      for (key in ref1) {
        value = ref1[key];
        if (!value.reported) {
          value.reported = true;
          this.listener.reportError({
            error: "",
            type: "undefined_variable",
            expression: value.expression,
            line: value.line,
            column: value.column,
            file: value.file
          });
        }
      }
      ref2 = this.vm.context.warnings.assigning_field_to_undefined;
      for (key in ref2) {
        value = ref2[key];
        if (!value.reported) {
          value.reported = true;
          this.listener.reportError({
            error: "",
            type: "assigning_undefined",
            expression: value.expression,
            line: value.line,
            column: value.column,
            file: value.file
          });
        }
      }
      ref3 = this.vm.context.warnings.assigning_api_variable;
      for (key in ref3) {
        value = ref3[key];
        if (!value.reported) {
          value.reported = true;
          this.listener.reportError({
            error: "",
            type: "assigning_api_variable",
            expression: value.expression,
            line: value.line,
            column: value.column,
            file: value.file
          });
        }
      }
      ref4 = this.vm.context.warnings.assignment_as_condition;
      for (key in ref4) {
        value = ref4[key];
        if (!value.reported) {
          value.reported = true;
          this.listener.reportError({
            error: "",
            type: "assignment_as_condition",
            line: value.line,
            column: value.column,
            file: value.file
          });
        }
      }
    }
  }

  updateControls() {
    var c, err, j, k, key, len1, len2, ref, t, touches;
    ref = this.connections;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      c = ref[j];
      c.update();
    }
    touches = Object.keys(this.screen.touches);
    this.touch.touching = touches.length > 0 ? 1 : 0;
    this.touch.touches = [];
    for (k = 0, len2 = touches.length; k < len2; k++) {
      key = touches[k];
      t = this.screen.touches[key];
      this.touch.x = t.x;
      this.touch.y = t.y;
      this.touch.touches.push({
        x: t.x,
        y: t.y,
        id: key
      });
    }
    if (this.mouse.pressed && !this.previous_mouse_pressed) {
      this.previous_mouse_pressed = true;
      this.mouse.press = 1;
    } else {
      this.mouse.press = 0;
    }
    if (!this.mouse.pressed && this.previous_mouse_pressed) {
      this.previous_mouse_pressed = false;
      this.mouse.release = 1;
    } else {
      this.mouse.release = 0;
    }
    this.mouse.wheel = this.screen.wheel || 0;
    this.screen.wheel = 0;
    if (this.touch.touching && !this.previous_touch) {
      this.previous_touch = true;
      this.touch.press = 1;
    } else {
      this.touch.press = 0;
    }
    if (!this.touch.touching && this.previous_touch) {
      this.previous_touch = false;
      this.touch.release = 1;
    } else {
      this.touch.release = 0;
    }
    this.vm.context.global.system.file.dropped = 0;
    if (this.files_dropped != null) {
      this.vm.context.global.system.file.dropped = this.files_dropped;
      delete this.files_dropped;
    }
    this.vm.context.global.system.file.loaded = 0;
    if (this.files_loaded != null) {
      this.vm.context.global.system.file.loaded = this.files_loaded;
      delete this.files_loaded;
    }
    this.gamepad.update();
    this.keyboard.update();
    try {
      this.vm.context.global.system.inputs.gamepad = this.gamepad.count > 0 ? 1 : 0;
    } catch (error) {
      err = error;
    }
  }

  getAssetURL(asset) {
    return this.url + "assets/" + asset + ".glb";
  }

  getWatcher() {
    return this.watcher || (this.watcher = new Watcher(this));
  }

  watch(variables) {
    return this.getWatcher().watch(variables);
  }

  watchStep() {
    return this.getWatcher().step();
  }

  stopWatching() {
    return this.getWatcher().stop();
  }

  exit() {
    var err;
    this.stop();
    if (this.screen.clear != null) {
      setTimeout((() => {
        return this.screen.clear();
      }), 1);
    }
    try {
      // microStudio embedded exit
      this.listener.exit();
    } catch (error) {
      err = error;
    }
    try {
      // TODO: Cordova exit, this might work
      if ((navigator.app != null) && (navigator.app.exitApp != null)) {
        navigator.app.exitApp();
      }
    } catch (error) {
      err = error;
    }
    try {
      // TODO: Electron exit, may already be covered by window.close()

      // Windowed mode exit
      return window.close();
    } catch (error) {
      err = error;
    }
  }

  createDropFeature() {
    document.addEventListener("dragenter", (event) => {
      return event.stopPropagation();
    });
    document.addEventListener("dragleave", (event) => {
      return event.stopPropagation();
    });
    document.addEventListener("dragover", (event) => {
      event.preventDefault();
      if (player.runtime.screen.mouseMove != null) {
        return player.runtime.screen.mouseMove(event);
      }
    });
    return document.addEventListener("drop", (event) => {
      var err, file, files, i, index, j, len1, list, processFile, ref, result;
      event.preventDefault();
      event.stopPropagation();
      try {
        list = [];
        files = [];
        ref = event.dataTransfer.items;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          i = ref[j];
          if (i.kind === "file") {
            file = i.getAsFile();
            files.push(file);
          }
        }
        result = [];
        index = 0;
        processFile = function() {
          var f;
          if (index < files.length) {
            f = files[index++];
            return loadFile(f, function(data) {
              result.push({
                name: f.name,
                size: f.size,
                content: data,
                file_type: f.type
              });
              return processFile();
            });
          } else {
            player.runtime.files_dropped = result;
            if (typeof window.dropHandler === "function") {
              return window.dropHandler(result);
            }
          }
        };
        return processFile();
      } catch (error) {
        err = error;
        return console.error(err);
      }
    });
  }

};

saveFile = function(data, name, type) {
  var a, blob, url;
  a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  blob = new Blob([data], {
    type: type
  });
  url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = name;
  a.click();
  return window.URL.revokeObjectURL(url);
};

loadWaveFileLib = function(callback) {
  var s;
  if (typeof wavefile !== "undefined" && wavefile !== null) {
    return callback();
  } else {
    s = document.createElement("script");
    s.src = location.origin + "/lib/wavefile/wavefile.js";
    document.head.appendChild(s);
    return s.onload = function() {
      return callback();
    };
  }
};

loadLameJSLib = function(callback) {
  var s;
  if (typeof lamejs !== "undefined" && lamejs !== null) {
    return callback();
  } else {
    s = document.createElement("script");
    s.src = location.origin + "/lib/lamejs/lame.min.js";
    document.head.appendChild(s);
    return s.onload = function() {
      return callback();
    };
  }
};

writeProjectFile = function(name, data, thumb) {
  return window.player.postMessage({
    name: "write_project_file",
    filename: name,
    content: data,
    thumbnail: thumb
  });
};

arrayBufferToBase64 = function(buffer) {
  var binary, bytes, i, j, len, ref;
  binary = '';
  bytes = new Uint8Array(buffer);
  len = bytes.byteLength;
  for (i = j = 0, ref = len - 1; j <= ref; i = j += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

loadFile = function(file, callback) {
  var fr;
  switch (file.type) {
    case "image/png":
    case "image/jpeg":
      fr = new FileReader;
      fr.onload = function() {
        var img;
        img = new Image;
        img.onload = function() {
          var image;
          image = new msImage(img);
          return callback(image);
        };
        return img.src = fr.result;
      };
      return fr.readAsDataURL(file);
    case "audio/wav":
    case "audio/x-wav":
    case "audio/mp3":
      fr = new FileReader;
      fr.onload = function() {
        return player.runtime.audio.getContext().decodeAudioData(fr.result, function(buffer) {
          return callback(new Sound(player.runtime.audio, buffer));
        });
      };
      return fr.readAsArrayBuffer(file);
    case "application/json":
      fr = new FileReader;
      fr.onload = function() {
        var err, object;
        object = fr.result;
        try {
          object = JSON.parse(fr.result);
        } catch (error) {
          err = error;
        }
        return callback(object);
      };
      return fr.readAsText(file);
    default:
      fr = new FileReader;
      fr.onload = function() {
        return callback(fr.result);
      };
      return fr.readAsText(file);
  }
};

this.System = {
  javascript: function(s) {
    var err, f, res;
    try {
      f = eval(`res = function(global) { ${s} }`);
      res = f.call(player.runtime.vm.context.global, player.runtime.vm.context.global);
    } catch (error) {
      err = error;
      console.error(err);
    }
    if (res != null) {
      return res;
    } else {
      return 0;
    }
  },
  file: {
    save: function(obj, name, format, options) {
      var a, c;
      if (obj instanceof MicroSound) {
        return loadWaveFileLib(function() {
          var buffer, ch, ch1, ch2, i, j, k, ref, ref1, wav;
          wav = new wavefile.WaveFile;
          ch1 = [];
          for (i = j = 0, ref = obj.length - 1; j <= ref; i = j += 1) {
            ch1[i] = Math.round(Math.min(1, Math.max(-1, obj.read(0, i))) * 32767);
          }
          if (obj.channels === 2) {
            ch2 = [];
            for (i = k = 0, ref1 = obj.length - 1; k <= ref1; i = k += 1) {
              ch2[i] = Math.round(Math.min(1, Math.max(-1, obj.read(1, i))) * 32767);
            }
            ch = [ch1, ch2];
          } else {
            ch = [ch1];
          }
          wav.fromScratch(ch.length, obj.sampleRate, '16', ch);
          buffer = wav.toBuffer();
          if (typeof name !== "string") {
            name = "sound.wav";
          } else if (!name.endsWith(".wav")) {
            name += ".wav";
          }
          return saveFile(buffer, name, "octet/stream");
        });
      } else if (obj instanceof msImage) {
        c = obj.canvas;
        if (typeof name !== "string") {
          name = "image";
        }
        format = typeof format === "string" && format.toLowerCase() === "jpg" ? "jpg" : "png";
        if (!name.endsWith(`.${format}`)) {
          name += `.${format}`;
        }
        a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        return c.toBlob(((blob) => {
          var url;
          url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = name;
          a.click();
          return window.URL.revokeObjectURL(url);
        }), (format === "png" ? "image/png" : "image/jpeg"), options);
      } else if (typeof obj === "object") {
        obj = System.runtime.vm.storableObject(obj);
        obj = JSON.stringify(obj, null, 2);
        if (typeof name !== "string") {
          name = "data";
        }
        if (!name.endsWith(".json")) {
          name += ".json";
        }
        return saveFile(obj, name, "text/json");
      } else if (typeof obj === "string") {
        if (typeof name !== "string") {
          name = "text";
        }
        if (!name.endsWith(".txt")) {
          name += ".txt";
        }
        return saveFile(obj, name, "text/plain");
      }
    },
    load: function(options, callback) {
      var extensions, i, input, j, ref;
      if (typeof options === "string" || Array.isArray(options)) {
        extensions = options;
      } else {
        extensions = options.extensions || null;
      }
      input = document.createElement("input");
      if (options.multiple) {
        input.multiple = true;
      }
      input.type = "file";
      if (typeof extensions === "string") {
        input.accept = `.${extensions}`;
      } else if (Array.isArray(extensions)) {
        for (i = j = 0, ref = extensions.length - 1; (0 <= ref ? j <= ref : j >= ref); i = 0 <= ref ? ++j : --j) {
          extensions[i] = `.${extensions[i]}`;
        }
        input.accept = extensions.join(",");
      }
      input.addEventListener("change", (event) => {
        var files, index, processFile, result;
        files = event.target.files;
        result = [];
        index = 0;
        processFile = function() {
          var f;
          if (index < files.length) {
            f = files[index++];
            return loadFile(f, function(data) {
              result.push({
                name: f.name,
                size: f.size,
                content: data,
                file_type: f.type
              });
              return processFile();
            });
          } else {
            player.runtime.files_loaded = result;
            if (typeof callback === "function") {
              return callback(result);
            }
          }
        };
        return processFile();
      });
      return input.click();
    },
    setDropHandler: function(handler) {
      return window.dropHandler = handler;
    }
  }
};
