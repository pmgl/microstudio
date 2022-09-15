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
    this.runtime = new Runtime((window.exported_project ? "" : location.origin + location.pathname), this.sources, resources, this);
    this.client = new PlayerClient(this);
    this.terminal = new Terminal(this);
    this.terminal.start();
    this.runtime.start();
    window.addEventListener("message", (msg) => {
      return this.messageReceived(msg);
    });
    return this.postMessage({
      name: "focus"
    });
  }

  runCommand(cmd) {
    if (cmd.trim().length === 0) {
      return;
    }
    return this.runtime.runCommand(cmd, (res) => {
      if (!cmd.trim().startsWith("print")) {
        return this.terminal.echo(res);
      }
    });
  }

  reportError(err) {
    return this.postMessage({
      name: "error",
      data: err
    });
  }

  log(text) {
    return this.terminal.echo(text);
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
    } catch (error) {
      err = error;
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
      } catch (error) {
        err = error;
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
