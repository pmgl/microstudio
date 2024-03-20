this.Player = (function() {
  function Player(listener) {
    var i, len, ref, source;
    this.listener = listener;
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

  Player.prototype.loadSource = function(source) {
    var req;
    req = new XMLHttpRequest();
    req.onreadystatechange = (function(_this) {
      return function(event) {
        var name;
        if (req.readyState === XMLHttpRequest.DONE) {
          if (req.status === 200) {
            name = source.file.split(".")[0];
            _this.sources[name] = req.responseText;
            _this.source_count++;
            if (_this.source_count >= resources.sources.length && (_this.runtime == null)) {
              return _this.start();
            }
          }
        }
      };
    })(this);
    req.open("GET", location.origin + location.pathname + ("ms/" + source.file + "?v=" + source.version));
    return req.send();
  };

  Player.prototype.start = function() {
    window.addEventListener("message", (function(_this) {
      return function(msg) {
        return _this.messageReceived(msg);
      };
    })(this));
    return this.postMessage({
      name: "get_token"
    });
  };

  Player.prototype.serverStart = function() {
    this.runtime = new Runtime((window.exported_project ? "" : location.origin + location.pathname), this.sources, resources, this);
    this.client = new PlayerClient(this);
    this.terminal = new Terminal(this);
    this.terminal.start();
    this.runtime.start();
    return this.postMessage({
      name: "focus"
    });
  };

  Player.prototype.runCommand = function(cmd) {
    if (cmd.trim().length === 0) {
      return;
    }
    return this.runtime.runCommand(cmd, (function(_this) {
      return function(res) {
        if (!cmd.trim().startsWith("print")) {
          return _this.terminal.echo(res);
        }
      };
    })(this));
  };

  Player.prototype.reportError = function(err) {
    return this.postMessage({
      name: "error",
      data: err
    });
  };

  Player.prototype.log = function(text) {
    return this.terminal.echo(text);
  };

  Player.prototype.codePaused = function() {
    return this.postMessage({
      name: "code_paused"
    });
  };

  Player.prototype.exit = function() {
    return this.postMessage({
      name: "exit"
    });
  };

  Player.prototype.messageReceived = function(msg) {
    var code, data, err, file;
    data = msg.data;
    try {
      data = JSON.parse(data);
      switch (data.name) {
        case "set_token":
          window.ms_server_token = data.token;
          return this.serverStart();
        case "command":
          return this.runtime.runCommand(data.line, (function(_this) {
            return function(res) {
              if (!data.line.trim().startsWith("print")) {
                return _this.postMessage({
                  name: "output",
                  data: res,
                  id: data.id
                });
              }
            };
          })(this));
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
  };

  Player.prototype.call = function(name, args) {
    if ((this.runtime != null) && (this.runtime.vm != null)) {
      return this.runtime.vm.call(name, args);
    }
  };

  Player.prototype.setGlobal = function(name, value) {
    if ((this.runtime != null) && (this.runtime.vm != null)) {
      return this.runtime.vm.context.global[name] = value;
    }
  };

  Player.prototype.exec = function(command, callback) {
    if (this.runtime != null) {
      return this.runtime.runCommand(command, callback);
    }
  };

  Player.prototype.postMessage = function(data) {
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
  };

  Player.prototype.postRequest = function(data, callback) {
    data.request_id = this.request_id;
    this.pending_requests[this.request_id++] = callback;
    return this.postMessage(data);
  };

  return Player;

})();
