this.Player = class Player {
  constructor(listener) {
    var i, len, ref, source;
    this.listener = listener;
    //src = document.getElementById("code").innerText
    this.source_count = 0;
    this.sources = {};
    this.resources = resources;
    this.request_id = 1;
    this.pending_requests = {};
    if (resources.sources != null) {
      ref = resources.sources;
      for (i = 0, len = ref.length; i < len; i++) {
        source = ref[i];
        this.loadSource(source);
      }
    } else {
      this.sources.main = document.getElementById("code").innerText;
      this.start();
    }
  }

  loadSource(source) {
    var req;
    req = new XMLHttpRequest();
    req.onreadystatechange = (event) => {
      var name;
      if (req.readyState === XMLHttpRequest.DONE) {
        if (req.status === 200) {
          name = source.file.split(".")[0];
          this.sources[name] = req.responseText;
          this.source_count++;
          if (this.source_count >= resources.sources.length && (this.runtime == null)) {
            return this.start();
          }
        }
      }
    };
    req.open("GET", location.origin + location.pathname + `ms/${source.file}?v=${source.version}`);
    return req.send();
  }

  start() {
    var touchListener, touchStartListener, wrapper;
    this.runtime = new Runtime((window.exported_project ? "" : location.origin + location.pathname), this.sources, resources, this);
    this.client = new PlayerClient(this);
    wrapper = document.getElementById("canvaswrapper");
    wrapper.appendChild(this.runtime.screen.canvas);
    window.addEventListener("resize", () => {
      return this.resize();
    });
    this.resize();
    //@runtime.start()
    touchStartListener = (event) => {
      event.preventDefault();
      //event.stopPropagation()
      //event.stopImmediatePropagation()
      this.runtime.screen.canvas.removeEventListener("touchstart", touchStartListener);
      return true;
    };
    touchListener = (event) => {
      //event.preventDefault()
      //event.stopPropagation()
      //event.stopImmediatePropagation()
      //@runtime.screen.canvas.removeEventListener "touchend",touchListener
      if ((this.runtime != null) && (this.runtime.vm != null) && this.runtime.vm.context.global.system.disable_autofullscreen) {
        return true;
      } else {
        this.setFullScreen();
      }
      return true;
    };
    this.runtime.screen.canvas.addEventListener("touchstart", touchStartListener);
    this.runtime.screen.canvas.addEventListener("touchend", touchListener);
    this.runtime.start();
    window.addEventListener("message", (msg) => {
      return this.messageReceived(msg);
    });
    return this.postMessage({
      name: "focus"
    });
  }

  resize() {
    var file, ref, results, src;
    this.runtime.screen.resize();
    if (this.runtime.vm != null) {
      if (this.runtime.vm.context.global.draw == null) {
        this.runtime.update_memory = {};
        ref = this.runtime.sources;
        results = [];
        for (file in ref) {
          src = ref[file];
          results.push(this.runtime.updateSource(file, src, false));
        }
        return results;
      } else if (this.runtime.stopped) {
        return this.runtime.drawCall();
      }
    }
  }

  setFullScreen() {
    var ref;
    if ((document.documentElement.webkitRequestFullScreen != null) && !document.webkitIsFullScreen) {
      document.documentElement.webkitRequestFullScreen();
    } else if ((document.documentElement.requestFullScreen != null) && !document.fullScreen) {
      document.documentElement.requestFullScreen();
    } else if ((document.documentElement.mozRequestFullScreen != null) && !document.mozFullScreen) {
      document.documentElement.mozRequestFullScreen();
    }
    if ((window.screen != null) && (window.screen.orientation != null) && ((ref = window.orientation) === "portrait" || ref === "landscape")) {
      return window.screen.orientation.lock(window.orientation).then(null, function(error) {});
    }
  }

  //console.error error
  reportError(err) {
    return this.postMessage({
      name: "error",
      data: err
    });
  }

  log(text) {
    return this.postMessage({
      name: "log",
      data: text
    });
  }

  codePaused() {
    return this.postMessage({
      name: "code_paused"
    });
  }

  exit() {
    return this.postMessage({
      name: "exit"
    });
  }

  messageReceived(msg) {
    var code, data, err, file;
    data = msg.data;
    try {
      data = JSON.parse(data);
      switch (data.name) {
        case "command":
          return this.runtime.runCommand(data.line, (res) => {
            if (!data.line.trim().startsWith("print")) {
              return this.postMessage({
                name: "output",
                data: res,
                id: data.id
              });
            }
          });
        case "pause":
          return this.runtime.stop();
        case "step_forward":
          return this.runtime.stepForward();
        case "resume":
          return this.runtime.resume();
        case "code_updated":
          code = data.code;
          file = data.file.split(".")[0];
          if (this.runtime.vm != null) {
            this.runtime.vm.clearWarnings();
          }
          return this.runtime.updateSource(file, code, true);
        case "sprite_updated":
          file = data.file;
          return this.runtime.updateSprite(file, 0, data.data, data.properties);
        case "map_updated":
          file = data.file;
          return this.runtime.updateMap(file, 0, data.data);
        case "take_picture":
          this.runtime.screen.takePicture((pic) => {
            return this.postMessage({
              name: "picture_taken",
              data: pic
            });
          });
          if (this.runtime.stopped) {
            return this.runtime.drawCall();
          }
          break;
        case "time_machine":
          return this.runtime.time_machine.messageReceived(data);
        case "watch":
          return this.runtime.watch(data.list);
        case "stop_watching":
          return this.runtime.stopWatching();
        default:
          if (data.request_id != null) {
            if (this.pending_requests[data.request_id] != null) {
              this.pending_requests[data.request_id](data);
              return delete this.pending_requests[data.request_id];
            }
          }
      }
    } catch (error1) {
      err = error1;
      return console.error(err);
    }
  }

  call(name, args) {
    if ((this.runtime != null) && (this.runtime.vm != null)) {
      return this.runtime.vm.call(name, args);
    }
  }

  setGlobal(name, value) {
    if ((this.runtime != null) && (this.runtime.vm != null)) {
      return this.runtime.vm.context.global[name] = value;
    }
  }

  exec(command, callback) {
    if (this.runtime != null) {
      return this.runtime.runCommand(command, callback);
    }
  }

  postMessage(data) {
    var err;
    if (window !== window.parent) {
      window.parent.postMessage(JSON.stringify(data), "*");
    }
    if (this.listener != null) {
      try {
        return this.listener(data);
      } catch (error1) {
        err = error1;
        return console.error(err);
      }
    }
  }

  postRequest(data, callback) {
    data.request_id = this.request_id;
    this.pending_requests[this.request_id++] = callback;
    return this.postMessage(data);
  }

};

if ((navigator.serviceWorker != null) && !window.skip_service_worker) {
  navigator.serviceWorker.register('sw.js', {
    scope: location.pathname
  }).then(function(reg) {
    return console.log('Registration succeeded. Scope is' + reg.scope);
  }).catch(function(error) {
    return console.log('Registration failed with' + error);
  });
}
