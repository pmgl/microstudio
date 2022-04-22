var arrayBufferToBase64, loadWaveFileLib, saveFile, writeProjectFile;

this.Runtime = (function() {
  function Runtime(url1, sources, resources, listener) {
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
    this.log = (function(_this) {
      return function(text) {
        return _this.listener.log(text);
      };
    })(this);
    this.update_memory = {};
    this.time_machine = new TimeMachine(this);
  }

  Runtime.prototype.updateSource = function(file, src, reinit) {
    var err, init;
    if (reinit == null) {
      reinit = false;
    }
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
  };

  Runtime.prototype.start = function() {
    var a, i, j, k, key, l, len1, len2, len3, len4, len5, m, n, name, o, ref, ref1, ref2, ref3, ref4, ref5, s, value;
    ref = this.resources.images;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      i = ref[j];
      s = LoadSprite(this.url + "sprites/" + i.file + "?v=" + i.version, i.properties, (function(_this) {
        return function() {
          _this.updateMaps();
          return _this.checkStartReady();
        };
      })(this));
      name = i.file.split(".")[0];
      s.name = name;
      this.sprites[name] = s;
    }
    if (Array.isArray(this.resources.maps)) {
      ref1 = this.resources.maps;
      for (k = 0, len2 = ref1.length; k < len2; k++) {
        m = ref1[k];
        name = m.file.split(".")[0];
        this.maps[name] = new MicroMap(this.url + ("maps/" + m.file + "?v=" + m.version), 0, 0, 0, this.sprites);
        this.maps[name].name = name;
        this.maps[name].loaded = (function(_this) {
          return function() {
            return _this.checkStartReady();
          };
        })(this);
      }
    } else if (this.resources.maps != null) {
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
  };

  Runtime.prototype.checkStartReady = function() {
    var key, ref, ref1, value;
    if (!this.start_ready) {
      ref = this.sprites;
      for (key in ref) {
        value = ref[key];
        if (!value.ready) {
          return;
        }
      }
      ref1 = this.maps;
      for (key in ref1) {
        value = ref1[key];
        if (!value.ready) {
          return;
        }
      }
      this.start_ready = true;
      return this.startReady();
    }
  };

  Runtime.prototype.startReady = function() {
    var err, file, global, init, j, len1, lib, meta, namespace, ref, ref1, src;
    meta = {
      print: (function(_this) {
        return function(text) {
          if ((typeof text === "object" || typeof text === "function") && (_this.vm != null)) {
            text = _this.vm.runner.toString(text);
          }
          return _this.listener.log(text);
        };
      })(this)
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
      Sprite: Sprite
    };
    if (window.graphics === "M3D") {
      global.M3D = M3D;
      M3D.runtime = this;
    } else if (window.graphics === "M2D") {
      global.M2D = M2D;
      M2D.runtime = this;
    } else if (window.graphics === "PIXI") {
      global.PIXI = PIXI;
      PIXI.runtime = this;
    } else if (window.graphics === "BABYLON") {
      global.BABYLON = BABYLON;
      BABYLON.runtime = this;
    }
    ref = window.ms_libs;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      lib = ref[j];
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
    this.vm.context.global.system.pause = (function(_this) {
      return function() {
        return _this.listener.codePaused();
      };
    })(this);
    this.vm.context.global.system.exit = (function(_this) {
      return function() {
        return _this.exit();
      };
    })(this);
    this.vm.context.global.system.file = System.file;
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
    requestAnimationFrame((function(_this) {
      return function() {
        return _this.timer();
      };
    })(this));
    this.screen.startControl();
    return this.listener.postMessage({
      name: "started"
    });
  };

  Runtime.prototype.updateMaps = function() {
    var key, map, ref;
    ref = this.maps;
    for (key in ref) {
      map = ref[key];
      map.needs_update = true;
    }
  };

  Runtime.prototype.runCommand = function(command, callback) {
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
      if (this.watching_variables) {
        this.watchStep();
      }
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
  };

  Runtime.prototype.projectFileUpdated = function(type, file, version, data, properties) {
    switch (type) {
      case "sprites":
        return this.updateSprite(file, version, data, properties);
      case "maps":
        return this.updateMap(file, version, data);
      case "ms":
        return this.updateCode(file, version, data);
    }
  };

  Runtime.prototype.projectFileDeleted = function(type, file) {
    switch (type) {
      case "sprites":
        return delete this.sprites[file.substring(0, file.length - 4)];
      case "maps":
        return delete this.maps[file.substring(0, file.length - 5)];
    }
  };

  Runtime.prototype.projectOptionsUpdated = function(msg) {
    this.orientation = msg.orientation;
    this.aspect = msg.aspect;
    return this.screen.resize();
  };

  Runtime.prototype.updateSprite = function(name, version, data, properties) {
    var img;
    if (data != null) {
      data = "data:image/png;base64," + data;
      if (this.sprites[name] != null) {
        img = new Image;
        img.crossOrigin = "Anonymous";
        img.src = data;
        return img.onload = (function(_this) {
          return function() {
            UpdateSprite(_this.sprites[name], img, properties);
            return _this.updateMaps();
          };
        })(this);
      } else {
        this.sprites[name] = LoadSprite(data, properties, (function(_this) {
          return function() {
            return _this.updateMaps();
          };
        })(this));
        return this.sprites[name].name = name;
      }
    } else {
      if (this.sprites[name] != null) {
        img = new Image;
        img.crossOrigin = "Anonymous";
        img.src = this.url + "sprites/" + name + (".png?v=" + version);
        return img.onload = (function(_this) {
          return function() {
            UpdateSprite(_this.sprites[name], img, properties);
            return _this.updateMaps();
          };
        })(this);
      } else {
        this.sprites[name] = LoadSprite(this.url + "sprites/" + name + (".png?v=" + version), properties, (function(_this) {
          return function() {
            return _this.updateMaps();
          };
        })(this));
        return this.sprites[name].name = name;
      }
    }
  };

  Runtime.prototype.updateMap = function(name, version, data) {
    var m, url;
    if (data != null) {
      m = this.maps[name];
      if (m != null) {
        m.load(data, this.sprites);
        return m.needs_update = true;
      } else {
        m = new MicroMap(1, 1, 1, 1, this.sprites);
        m.load(data, this.sprites);
        this.maps[name] = m;
        return this.maps[name].name = name;
      }
    } else {
      url = this.url + ("maps/" + name + ".json?v=" + version);
      m = this.maps[name];
      if (m != null) {
        return m.loadFile(url);
      } else {
        this.maps[name] = new MicroMap(url, 0, 0, 0, this.sprites);
        return this.maps[name].name = name;
      }
    }
  };

  Runtime.prototype.updateCode = function(name, version, data) {
    var req, url;
    if (data != null) {
      this.sources[name] = data;
      if (this.vm != null) {
        this.vm.clearWarnings();
      }
      return this.updateSource(name, data, true);
    } else {
      url = this.url + ("ms/" + name + ".ms?v=" + version);
      req = new XMLHttpRequest();
      req.onreadystatechange = (function(_this) {
        return function(event) {
          if (req.readyState === XMLHttpRequest.DONE) {
            if (req.status === 200) {
              _this.sources[name] = req.responseText;
              return _this.updateSource(name, _this.sources[name], true);
            }
          }
        };
      })(this);
      req.open("GET", url);
      return req.send();
    }
  };

  Runtime.prototype.stop = function() {
    this.stopped = true;
    return this.audio.cancelBeeps();
  };

  Runtime.prototype.stepForward = function() {
    if (this.stopped) {
      this.updateCall();
      this.drawCall();
      if (this.watching_variables) {
        return this.watchStep();
      }
    }
  };

  Runtime.prototype.resume = function() {
    if (this.stopped) {
      this.stopped = false;
      return requestAnimationFrame((function(_this) {
        return function() {
          return _this.timer();
        };
      })(this));
    }
  };

  Runtime.prototype.timer = function() {
    var ds, dt, fps, i, j, ref, time;
    if (this.stopped) {
      return;
    }
    requestAnimationFrame((function(_this) {
      return function() {
        return _this.timer();
      };
    })(this));
    time = Date.now();
    if (Math.abs(time - this.last_time) > 160) {
      this.last_time = time - 16;
    }
    dt = time - this.last_time;
    this.dt = this.dt * .9 + dt * .1;
    this.last_time = time;
    this.vm.context.global.system.fps = Math.round(fps = 1000 / this.dt);
    this.floating_frame += this.dt * 60 / 1000;
    ds = Math.min(10, Math.round(this.floating_frame - this.current_frame));
    if ((ds === 0 || ds === 2) && Math.abs(fps - 60) < 2) {
      ds = 1;
      this.floating_frame = this.current_frame + 1;
    }
    for (i = j = 1, ref = ds; j <= ref; i = j += 1) {
      this.updateCall();
    }
    this.current_frame += ds;
    this.drawCall();
    if (ds > 0 && this.watching_variables) {
      return this.watchStep();
    }
  };

  Runtime.prototype.updateCall = function() {
    var err;
    this.updateControls();
    try {
      this.vm.call("update");
      this.time_machine.step();
      this.reportWarnings();
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
  };

  Runtime.prototype.drawCall = function() {
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
  };

  Runtime.prototype.reportWarnings = function() {
    var key, ref, ref1, ref2, ref3, value;
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
    }
  };

  Runtime.prototype.updateControls = function() {
    var err, j, key, len1, t, touches;
    touches = Object.keys(this.screen.touches);
    this.touch.touching = touches.length > 0 ? 1 : 0;
    this.touch.touches = [];
    for (j = 0, len1 = touches.length; j < len1; j++) {
      key = touches[j];
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
    this.gamepad.update();
    this.keyboard.update();
    try {
      this.vm.context.global.system.inputs.gamepad = this.gamepad.count > 0 ? 1 : 0;
    } catch (error) {
      err = error;
    }
  };

  Runtime.prototype.getAssetURL = function(asset) {
    return this.url + "assets/" + asset + ".glb";
  };

  Runtime.prototype.watch = function(variables) {
    this.watching = true;
    this.watching_variables = variables;
    this.exclusion_list = [this.vm.context.global.screen, this.vm.context.global.system, this.vm.context.global.keyboard, this.vm.context.global.audio, this.vm.context.global.gamepad, this.vm.context.global.touch, this.vm.context.global.mouse, this.vm.context.global.sprites, this.vm.context.global.maps, this.vm.context.global.sounds, this.vm.context.global.music, this.vm.context.global.assets, this.vm.context.global.asset_manager, this.vm.context.global.fonts, this.vm.context.global.storage];
    if (this.vm.context.global.Function != null) {
      this.exclusion_list.push(this.vm.context.global.Function);
    }
    if (this.vm.context.global.String != null) {
      this.exclusion_list.push(this.vm.context.global.String);
    }
    if (this.vm.context.global.List != null) {
      this.exclusion_list.push(this.vm.context.global.List);
    }
    if (this.vm.context.global.Number != null) {
      this.exclusion_list.push(this.vm.context.global.Number);
    }
    if (this.vm.context.global.Object != null) {
      this.exclusion_list.push(this.vm.context.global.Object);
    }
    if (this.vm.context.global.Image != null) {
      this.exclusion_list.push(this.vm.context.global.Image);
    }
    if (this.vm.context.global.Sound != null) {
      this.exclusion_list.push(this.vm.context.global.Sound);
    }
    if (this.vm.context.global.Sprite != null) {
      this.exclusion_list.push(this.vm.context.global.Sprite);
    }
    if (this.vm.context.global.random != null) {
      this.exclusion_list.push(this.vm.context.global.random);
    }
    if (this.vm.context.global.print != null) {
      this.exclusion_list.push(this.vm.context.global.print);
    }
    return this.watchStep();
  };

  Runtime.prototype.stopWatching = function() {
    return this.watching = false;
  };

  Runtime.prototype.watchStep = function(variables) {
    var index, j, len1, res, v, value, vs;
    if (variables == null) {
      variables = this.watching_variables;
    }
    res = {};
    for (j = 0, len1 = variables.length; j < len1; j++) {
      v = variables[j];
      if (v === "global") {
        value = this.vm.context.global;
      } else {
        vs = v.split(".");
        value = this.vm.context.global;
        index = 0;
        while (index < vs.length && (value != null)) {
          value = value[vs[index++]];
        }
      }
      if ((value != null) && this.exclusion_list.indexOf(value) < 0) {
        res[v] = this.exploreValue(value, 1, 10);
      }
    }
    return this.listener.postMessage({
      name: "watch_update",
      data: res
    });
  };

  Runtime.prototype.exploreValue = function(value, depth, array_max) {
    var i, j, key, len1, res, v;
    if (depth == null) {
      depth = 1;
    }
    if (array_max == null) {
      array_max = 10;
    }
    if (value == null) {
      return {
        type: "number",
        value: 0
      };
    }
    if (typeof value === "function" || value instanceof Program.Function || (typeof Routine !== "undefined" && Routine !== null) && value instanceof Routine) {
      return {
        type: "function",
        value: ""
      };
    } else if (typeof value === "object") {
      if (Array.isArray(value)) {
        if (depth === 0) {
          return {
            type: "list",
            value: "",
            length: value.length
          };
        }
        res = [];
        for (i = j = 0, len1 = value.length; j < len1; i = ++j) {
          v = value[i];
          if (i >= 100) {
            break;
          }
          if (this.exclusion_list.indexOf(v) < 0) {
            res[i] = this.exploreValue(v, depth - 1, array_max);
          }
        }
        return res;
      } else {
        if (depth === 0) {
          v = "";
          if (value.classname) {
            v = "class " + value.classname;
          }
          if ((value["class"] != null) && (value["class"].classname != null)) {
            v = value["class"].classname;
          }
          return {
            type: "object",
            value: v
          };
        }
        res = {};
        for (key in value) {
          v = value[key];
          if (this.exclusion_list.indexOf(v) < 0) {
            res[key] = this.exploreValue(v, depth - 1, array_max);
          }
        }
        return res;
      }
    } else if (typeof value === "string") {
      return {
        type: "string",
        value: value.length < 43 ? value : value.substring(0, 40) + "..."
      };
    } else if (typeof value === "number") {
      return {
        type: "number",
        value: isFinite(value) ? value : 0
      };
    } else if (typeof value === "boolean") {
      return {
        type: "number",
        value: value ? 1 : 0
      };
    } else {
      return {
        type: "unknown",
        value: value
      };
    }
  };

  Runtime.prototype.exit = function() {
    var err;
    this.stop();
    if (this.screen.clear != null) {
      setTimeout(((function(_this) {
        return function() {
          return _this.screen.clear();
        };
      })(this)), 1);
    }
    try {
      this.listener.exit();
    } catch (error) {
      err = error;
    }
    try {
      if ((navigator.app != null) && (navigator.app.exitApp != null)) {
        navigator.app.exitApp();
      }
    } catch (error) {
      err = error;
    }
    try {
      return window.close();
    } catch (error) {
      err = error;
    }
  };

  return Runtime;

})();

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

this.System = {
  project: {
    writeFile: function(obj, name, thumbnail, format, options) {
      if (obj instanceof MicroSound) {
        return loadWaveFileLib(function() {
          var buffer, ch, ch1, ch2, encoded, i, j, k, ref, ref1, wav;
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
          encoded = arrayBufferToBase64(buffer);
          if (typeof name !== "string") {
            name = "sounds/sound";
          }
          if (!name.startsWith("sounds/")) {
            name = "sounds/" + name;
          }
          if (thumbnail instanceof msImage) {
            return writeProjectFile(name, encoded, thumbnail.canvas.toDataURL().split(",")[1]);
          } else {
            return writeProjectFile(name, encoded);
          }
        });
      } else if (obj instanceof msImage) {
        if (typeof name !== "string") {
          name = "sprites/sprite";
        }
        if (!name.startsWith("sprites/")) {
          name = "sprites/" + name;
        }
        return writeProjectFile(name, obj.canvas.toDataURL().split(",")[1]);
      }
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
        if (!name.endsWith("." + format)) {
          name += "." + format;
        }
        a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        return c.toBlob(((function(_this) {
          return function(blob) {
            var url;
            url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = name;
            a.click();
            return window.URL.revokeObjectURL(url);
          };
        })(this)), (format === "png" ? "image/png" : "image/jpeg"), options);
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
      }
    }
  }
};
