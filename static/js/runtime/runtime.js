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
    this.sprites = {};
    this.maps = {};
    this.sounds = {};
    this.music = {};
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
    var i, j, k, key, l, len, len1, len2, len3, m, n, name, ref, ref1, ref2, ref3, ref4, s, value;
    ref = this.resources.images;
    for (j = 0, len = ref.length; j < len; j++) {
      i = ref[j];
      s = new Sprite(this.url + "sprites/" + i.file + "?v=" + i.version, null, i.properties);
      name = i.file.split(".")[0];
      s.name = name;
      this.sprites[name] = s;
      s.loaded = (function(_this) {
        return function() {
          _this.updateMaps();
          return _this.checkStartReady();
        };
      })(this);
    }
    if (Array.isArray(this.resources.maps)) {
      ref1 = this.resources.maps;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
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
    for (l = 0, len2 = ref3.length; l < len2; l++) {
      s = ref3[l];
      name = s.file.split(".")[0];
      s = new Sound(this.audio, this.url + "sounds/" + s.file + "?v=" + s.version);
      s.name = name;
      this.sounds[name] = s;
    }
    ref4 = this.resources.music;
    for (n = 0, len3 = ref4.length; n < len3; n++) {
      m = ref4[n];
      name = m.file.split(".")[0];
      m = new Music(this.audio, this.url + "music/" + m.file + "?v=" + m.version);
      m.name = name;
      this.music[name] = m;
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
    var err, file, global, init, j, len, lib, meta, namespace, ref, ref1, src;
    meta = {
      print: (function(_this) {
        return function(text) {
          if (typeof text === "object") {
            text = Program.toString(text);
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
      maps: this.maps,
      touch: this.touch,
      mouse: this.mouse,
      fonts: window.fonts
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
    for (j = 0, len = ref.length; j < len; j++) {
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
    return this.screen.startControl();
  };

  Runtime.prototype.updateMaps = function() {
    var key, map, ref;
    ref = this.maps;
    for (key in ref) {
      map = ref[key];
      map.needs_update = true;
    }
  };

  Runtime.prototype.runCommand = function(command) {
    var err, res, warnings;
    try {
      warnings = this.vm.context.warnings;
      this.vm.clearWarnings();
      res = this.vm.run(command);
      this.reportWarnings();
      this.vm.context.warnings = warnings;
      if (this.vm.error_info != null) {
        err = this.vm.error_info;
        err.type = "exec";
        this.listener.reportError(err);
      }
      return res;
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
            _this.sprites[name].load(img, properties);
            return _this.updateMaps();
          };
        })(this);
      } else {
        this.sprites[name] = new Sprite(data, null, properties);
        this.sprites[name].name = name;
        return this.sprites[name].loaded = (function(_this) {
          return function() {
            return _this.updateMaps();
          };
        })(this);
      }
    } else {
      if (this.sprites[name] != null) {
        img = new Image;
        img.crossOrigin = "Anonymous";
        img.src = this.url + "sprites/" + name + (".png?v=" + version);
        return img.onload = (function(_this) {
          return function() {
            _this.sprites[name].load(img, properties);
            return _this.updateMaps();
          };
        })(this);
      } else {
        this.sprites[name] = new Sprite(this.url + "sprites/" + name + (".png?v=" + version), null, properties);
        this.sprites[name].name = name;
        return this.sprites[name].loaded = (function(_this) {
          return function() {
            return _this.updateMaps();
          };
        })(this);
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

  Runtime.prototype.resume = function() {
    this.stopped = false;
    return requestAnimationFrame((function(_this) {
      return function() {
        return _this.timer();
      };
    })(this));
  };

  Runtime.prototype.timer = function() {
    var ds, dt, i, j, ref, time;
    if (this.stopped) {
      return;
    }
    requestAnimationFrame((function(_this) {
      return function() {
        return _this.timer();
      };
    })(this));
    time = Date.now();
    if (Math.abs(time - this.last_time) > 1000) {
      this.last_time = time - 16;
    }
    dt = time - this.last_time;
    this.dt = this.dt * .99 + dt * .01;
    this.last_time = time;
    this.floating_frame += this.dt * 60 / 1000;
    ds = Math.min(30, Math.round(this.floating_frame - this.current_frame));
    for (i = j = 1, ref = ds; j <= ref; i = j += 1) {
      this.updateCall();
    }
    this.current_frame += ds;
    return this.drawCall();
  };

  Runtime.prototype.updateCall = function() {
    var err;
    this.updateControls();
    try {
      this.vm.call("update");
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
    var key, ref, ref1, ref2, results, value;
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
      results = [];
      for (key in ref2) {
        value = ref2[key];
        if (!value.reported) {
          value.reported = true;
          results.push(this.listener.reportError({
            error: "",
            type: "assigning_undefined",
            expression: value.expression,
            line: value.line,
            column: value.column,
            file: value.file
          }));
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };

  Runtime.prototype.updateControls = function() {
    var err, j, key, len, t, touches;
    touches = Object.keys(this.screen.touches);
    this.touch.touching = touches.length > 0;
    this.touch.touches = [];
    for (j = 0, len = touches.length; j < len; j++) {
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

  return Runtime;

})();
