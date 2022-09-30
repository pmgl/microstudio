this.Runtime = class Runtime {
  constructor(url1, sources, resources, listener) {
    this.url = url1;
    this.sources = sources;
    this.resources = resources;
    this.listener = listener;
    this.sprites = {};
    this.maps = {};
    this.sounds = {};
    this.music = {};
    this.assets = {};
    this.asset_manager = new AssetManager(this);
    this.previous_init = null;
    this.report_errors = true;
    this.log = (text) => {
      return this.listener.log(text);
    };
    this.update_memory = {};
    this.servers = [];
  }

  addServer(server) {
    return this.servers.push(server);
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
        init = this.vm.runner.getFunctionSource("serverInit");
        if ((init != null) && init !== this.previous_init && reinit) {
          this.previous_init = init;
          this.vm.call("serverInit");
          if (this.vm.error_info != null) {
            err = this.vm.error_info;
            err.type = "serverInit";
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
    var j, key, len, m, name, ref, ref1, value;
    if (window.ms_async_load) {
      this.startReady();
    }
    if (Array.isArray(this.resources.maps)) {
      ref = this.resources.maps;
      for (j = 0, len = ref.length; j < len; j++) {
        m = ref[j];
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
      ref1 = this.resources.maps;
      for (key in ref1) {
        value = ref1[key];
        this.updateMap(key, 0, value);
      }
    }
    this.checkStartReady();
  }

  checkStartReady() {
    var count, key, ready, ref, value;
    count = 0;
    ready = 0;
    ref = this.maps;
    for (key in ref) {
      value = ref[key];
      count += 1;
      if (value.ready) {
        ready += 1;
      }
    }
    if (ready < count) {
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
    var err, file, global, init, j, len, lib, meta, namespace, ref, ref1, src;
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
      sprites: this.sprites,
      sounds: this.sounds,
      music: this.music,
      assets: this.assets,
      asset_manager: this.asset_manager.getInterface(),
      maps: this.maps,
      Map: MicroMap
    };
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
    this.vm.context.global.Server = MPServer;
    this.vm.context.global.system.pause = () => {
      return this.listener.codePaused();
    };
    this.vm.context.global.system.exit = () => {
      return this.exit();
    };
    if (!window.ms_async_load) {
      this.vm.context.global.system.loading = 100;
    }
    this.vm.context.global.system.javascript = System.javascript;
    System.runtime = this;
    ref1 = this.sources;
    for (file in ref1) {
      src = ref1[file];
      this.updateSource(file, src, false);
    }
    if (this.vm.runner.getFunctionSource != null) {
      init = this.vm.runner.getFunctionSource("serverInit");
      if (init != null) {
        this.previous_init = init;
        this.vm.call("serverInit");
        if (this.vm.error_info != null) {
          err = this.vm.error_info;
          err.type = "serverInit";
          this.listener.reportError(err);
        }
      }
    } else {
      this.vm.call("serverInit");
      if (this.vm.error_info != null) {
        err = this.vm.error_info;
        err.type = "serverInit";
        this.listener.reportError(err);
      }
    }
    this.dt = 1000 / 60;
    this.last_time = Date.now();
    this.current_frame = 0;
    this.floating_frame = 0;
    this.clock_interval = setInterval((() => {
      return this.clock();
    }), 16);
    this.watcher = new Watcher(this);
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
      this.watcher.update();
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
      case "maps":
        return this.updateMap(file, version, data);
      case "ms":
        return this.updateCode(file, version, data);
    }
  }

  projectFileDeleted(type, file) {
    switch (type) {
      case "maps":
        return delete this.maps[file.substring(0, file.length - 5).replace(/-/g, "/")];
    }
  }

  projectOptionsUpdated(msg) {}

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
    clearInterval(this.clock_interval);
    return this.audio.cancelBeeps();
  }

  stepForward() {
    if (this.stopped) {
      this.updateCall();
      return this.watcher.update();
    }
  }

  resume() {
    if (this.stopped) {
      this.stopped = false;
      return this.clock_interval = setInterval((() => {
        return this.clock();
      }), 16);
    }
  }

  clock() {
    if (Date.now() - this.last_time > 17) {
      return this.timer();
    }
  }

  timer() {
    var ds, dt, fps, i, j, ref, time;
    if (this.stopped) {
      return;
    }
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
      //console.info "INCORRECT DS: "+ds+ " floating = "+@floating_frame+" current = "+@current_frame
      ds = 1;
      this.floating_frame = this.current_frame + 1;
    }
    for (i = j = 1, ref = ds; j <= ref; i = j += 1) {
      this.updateCall();
    }
    this.current_frame += ds;
    if (ds > 0) {
      return this.watcher.update();
    }
  }

  //if ds != 1
  //  console.info "frame missed"
  //if @current_frame%60 == 0
  //  console.info("fps: #{Math.round(1000/@dt)}")
  updateControls() {
    var j, len, ref, results, s;
    ref = this.servers;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      results.push(s.update());
    }
    return results;
  }

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
      this.vm.call("serverUpdate");
      this.reportWarnings();
      if (this.vm.error_info != null) {
        err = this.vm.error_info;
        err.type = "serverUpdate";
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
  }

  exit() {
    var err;
    this.stop();
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
  }
};
