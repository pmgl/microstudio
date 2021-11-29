this.RunWindow = (function() {
  function RunWindow(app) {
    this.app = app;
    this.app.appui.setAction("run-button", (function(_this) {
      return function() {
        return _this.play();
      };
    })(this));
    this.app.appui.setAction("pause-button", (function(_this) {
      return function() {
        return _this.pause();
      };
    })(this));
    this.app.appui.setAction("reload-button", (function(_this) {
      return function() {
        return _this.reload();
      };
    })(this));
    this.app.appui.setAction("run-button-win", (function(_this) {
      return function() {
        return _this.play();
      };
    })(this));
    this.app.appui.setAction("pause-button-win", (function(_this) {
      return function() {
        return _this.pause();
      };
    })(this));
    this.app.appui.setAction("reload-button-win", (function(_this) {
      return function() {
        return _this.reload();
      };
    })(this));
    this.app.appui.setAction("detach-button", (function(_this) {
      return function() {
        return _this.detach();
      };
    })(this));
    this.app.appui.setAction("clear-button", (function(_this) {
      return function() {
        return _this.clear();
      };
    })(this));
    this.app.appui.setAction("console-options-button", (function(_this) {
      return function() {
        return _this.toggleConsoleOptions();
      };
    })(this));
    this.rulercanvas = new RulerCanvas(this.app);
    window.addEventListener("resize", (function(_this) {
      return function() {
        return _this.windowResized();
      };
    })(this));
    this.terminal = new Terminal(this);
    window.onmessage = (function(_this) {
      return function(msg) {
        return _this.messageReceived(msg.data);
      };
    })(this);
    this.command_table = {};
    this.command_id = 0;
    this.floating_window = new FloatingWindow(this.app, "run-window", this);
    this.floating_window.max_ratio = 1;
    this.initWarnings();
  }

  RunWindow.prototype.initWarnings = function() {
    document.getElementById("console-options-warning-undefined").addEventListener("change", (function(_this) {
      return function() {
        _this.warning_undefined = document.getElementById("console-options-warning-undefined").checked;
        return localStorage.setItem("console_warning_undefined", _this.warning_undefined);
      };
    })(this));
    document.getElementById("console-options-warning-nonfunction").addEventListener("change", (function(_this) {
      return function() {
        _this.warning_nonfunction = document.getElementById("console-options-warning-nonfunction").checked;
        return localStorage.setItem("console_warning_nonfunction", _this.warning_nonfunction);
      };
    })(this));
    document.getElementById("console-options-warning-assign").addEventListener("change", (function(_this) {
      return function() {
        _this.warning_assign = document.getElementById("console-options-warning-assign").checked;
        return localStorage.setItem("console_warning_assign", _this.warning_assign);
      };
    })(this));
    this.warning_undefined = localStorage.getItem("console_warning_undefined") === "true" || false;
    this.warning_nonfunction = localStorage.getItem("console_warning_nonfunction") !== "false";
    this.warning_assign = localStorage.getItem("console_warning_assign") !== "false";
    document.getElementById("console-options-warning-undefined").checked = this.warning_undefined;
    document.getElementById("console-options-warning-nonfunction").checked = this.warning_nonfunction;
    return document.getElementById("console-options-warning-assign").checked = this.warning_assign;
  };

  RunWindow.prototype.detach = function() {
    var b, device, wincontent;
    if (this.detached) {
      return this.floating_window.close();
    } else {
      device = document.getElementById("device");
      if (device != null) {
        this.detached = true;
        document.querySelector("#detach-button i").classList.remove("fa-expand");
        document.querySelector("#detach-button i").classList.add("fa-compress");
        wincontent = document.querySelector("#run-window .content");
        wincontent.innerHTML = "";
        wincontent.appendChild(device);
        wincontent.appendChild(document.getElementById("ruler"));
        b = document.querySelector(".devicecontainer").getBoundingClientRect();
        this.floating_window.resize(b.x - 5, b.y - 45, b.width + 10, b.height + 90);
        this.floating_window.show();
        this.floatingWindowResized();
        return document.getElementById("runtime").style.display = "none";
      }
    }
  };

  RunWindow.prototype.floatingWindowResized = function() {
    return this.windowResized();
  };

  RunWindow.prototype.floatingWindowClosed = function() {
    var container, device;
    if (!this.detached) {
      return;
    }
    this.detached = false;
    device = document.getElementById("device");
    if (device != null) {
      container = document.querySelector(".devicecontainer");
      container.innerHTML = "";
      container.appendChild(device);
      container.appendChild(document.getElementById("ruler"));
      document.querySelector("#detach-button i").classList.add("fa-expand");
      document.querySelector("#detach-button i").classList.remove("fa-compress");
      document.getElementById("runtime").style.display = "block";
      return this.windowResized();
    }
  };

  RunWindow.prototype.run = function() {
    var code, device, i, image, len, ref, resource, src, url;
    src = this.app.editor.editor.getValue();
    resource = {
      images: []
    };
    ref = this.app.project.sprite_list;
    for (i = 0, len = ref.length; i < len; i++) {
      image = ref[i];
      resource.images.push(image.file);
    }
    device = document.getElementById("device");
    code = this.app.project["public"] ? "" : this.app.project.code + "/";
    url = (location.origin.replace(".dev", ".io")) + "/" + this.app.project.owner.nick + "/" + this.app.project.slug + "/" + code;
    return this.app.project.savePendingChanges((function(_this) {
      return function() {
        device.innerHTML = "<iframe id='runiframe' allow='autoplay;gamepad' src='" + url + "?debug'></iframe>";
        return _this.windowResized();
      };
    })(this));
  };

  RunWindow.prototype.reload = function() {
    this.run();
    document.getElementById("run-button").classList.add("selected");
    document.getElementById("pause-button").classList.remove("selected");
    document.getElementById("reload-button").classList.remove("selected");
    document.getElementById("run-button-win").classList.add("selected");
    document.getElementById("pause-button-win").classList.remove("selected");
    return document.getElementById("reload-button-win").classList.remove("selected");
  };

  RunWindow.prototype.play = function() {
    if (document.getElementById("runiframe") != null) {
      return this.resume();
    } else {
      this.run();
      document.getElementById("run-button").classList.add("selected");
      document.getElementById("pause-button").classList.remove("selected");
      document.getElementById("reload-button").classList.remove("selected");
      document.getElementById("run-button-win").classList.add("selected");
      document.getElementById("pause-button-win").classList.remove("selected");
      return document.getElementById("reload-button-win").classList.remove("selected");
    }
  };

  RunWindow.prototype.pause = function() {
    var e;
    e = document.getElementById("runiframe");
    if (e != null) {
      e.contentWindow.postMessage(JSON.stringify({
        name: "pause"
      }), "*");
    }
    document.getElementById("run-button").classList.remove("selected");
    document.getElementById("pause-button").classList.add("selected");
    document.getElementById("reload-button").classList.remove("selected");
    document.getElementById("run-button-win").classList.remove("selected");
    document.getElementById("pause-button-win").classList.add("selected");
    return document.getElementById("reload-button-win").classList.remove("selected");
  };

  RunWindow.prototype.resume = function() {
    var e;
    e = document.getElementById("runiframe");
    if (e != null) {
      e.contentWindow.postMessage(JSON.stringify({
        name: "resume"
      }), "*");
      e.contentWindow.focus();
    }
    document.getElementById("run-button").classList.add("selected");
    document.getElementById("pause-button").classList.remove("selected");
    document.getElementById("reload-button").classList.remove("selected");
    document.getElementById("run-button-win").classList.add("selected");
    document.getElementById("pause-button-win").classList.remove("selected");
    return document.getElementById("reload-button-win").classList.remove("selected");
  };

  RunWindow.prototype.resetButtons = function() {
    document.getElementById("run-button").classList.remove("selected");
    document.getElementById("pause-button").classList.add("selected");
    document.getElementById("reload-button").classList.add("selected");
    document.getElementById("run-button-win").classList.remove("selected");
    document.getElementById("pause-button-win").classList.add("selected");
    return document.getElementById("reload-button-win").classList.add("selected");
  };

  RunWindow.prototype.clear = function() {
    return this.terminal.clear();
  };

  RunWindow.prototype.toggleConsoleOptions = function() {
    var div;
    div = document.getElementById("runtime-splitbar");
    if (div.getBoundingClientRect().height <= 41) {
      div.style.height = "180px";
    } else {
      div.style.height = "40px";
    }
    return setTimeout(((function(_this) {
      return function() {
        return _this.app.appui.runtime_splitbar.update();
      };
    })(this)), 600);
  };

  RunWindow.prototype.updateCode = function(file, src) {
    var iframe;
    src = this.app.editor.editor.getValue();
    iframe = document.getElementById("runiframe");
    if (iframe != null) {
      return iframe.contentWindow.postMessage(JSON.stringify({
        name: "code_updated",
        file: file,
        code: src
      }), "*");
    }
  };

  RunWindow.prototype.updateSprite = function(name) {
    var data, iframe, properties, sprite;
    iframe = document.getElementById("runiframe");
    if (iframe != null) {
      sprite = this.app.project.getSprite(name);
      if (sprite != null) {
        data = sprite.saveData().split(",")[1];
        properties = {
          frames: sprite.frames.length,
          fps: sprite.fps
        };
        return iframe.contentWindow.postMessage(JSON.stringify({
          name: "sprite_updated",
          file: name,
          data: data,
          properties: properties
        }), "*");
      }
    }
  };

  RunWindow.prototype.updateMap = function(name) {
    var data, iframe, map;
    iframe = document.getElementById("runiframe");
    if (iframe != null) {
      map = this.app.project.getMap(name);
      if (map != null) {
        data = map.save();
        return iframe.contentWindow.postMessage(JSON.stringify({
          name: "map_updated",
          file: name,
          data: data
        }), "*");
      }
    }
  };

  RunWindow.prototype.windowResized = function() {
    var c, ch, cw, h, r, ratio, ref, w;
    r = document.getElementById("device");
    c = document.getElementById("device").firstChild;
    if (this.app.project == null) {
      return;
    }
    cw = r.clientWidth;
    ch = r.clientHeight;
    ratio = {
      "4x3": 4 / 3,
      "16x9": 16 / 9,
      "2x1": 2 / 1,
      "1x1": 1 / 1
    }[this.app.project.aspect];
    if ((ratio == null) && ((ref = this.app.project.orientation) === "portrait" || ref === "landscape")) {
      ratio = 16 / 9;
    }
    if (ratio != null) {
      switch (this.app.project.orientation) {
        case "portrait":
          r = Math.min(cw, ch / ratio) / cw;
          w = cw * r;
          h = cw * r * ratio;
          break;
        case "landscape":
          r = Math.min(cw / ratio, ch) / ch;
          w = ch * r * ratio;
          h = ch * r;
          break;
        default:
          if (cw > ch) {
            r = Math.min(cw / ratio, ch) / ch;
            w = ch * r * ratio;
            h = ch * r;
          } else {
            r = Math.min(cw, ch / ratio) / cw;
            w = cw * r;
            h = cw * r * ratio;
          }
      }
    } else {
      w = cw;
      h = ch;
    }
    if (c != null) {
      c.style["margin-top"] = Math.round((ch - h) / 2) + "px";
      c.style.width = Math.round(w) + "px";
      c.style.height = Math.round(h) + "px";
    }
    return this.rulercanvas.resize(Math.round(w), Math.round(h), Math.round((ch - h) / 2));
  };

  RunWindow.prototype.logError = function(err) {
    var error, text;
    error = err.error;
    switch (err.type) {
      case "non_function":
        if (!this.warning_nonfunction) {
          return;
        }
        error = this.app.translator.get("Warning: %EXP% is not a function").replace("%EXP%", err.expression);
        this.annotateWarning(error, err);
        break;
      case "undefined_variable":
        if (!this.warning_undefined) {
          return;
        }
        error = this.app.translator.get("Warning: %EXP% is not defined, defaulting to zero").replace("%EXP%", err.expression);
        this.annotateWarning(error, err);
        break;
      case "assigning_undefined":
        if (!this.warning_assign) {
          return;
        }
        error = this.app.translator.get("Warning: %EXP% is not defined, will be initialized to an empty object").replace("%EXP%", err.expression);
        this.annotateWarning(error, err);
    }
    if (err.line != null) {
      if (err.file) {
        text = this.app.translator.get("%ERROR%, in file \"%FILE%\" at line %LINE%");
        if (err.column) {
          text += ", column %COLUMN%";
        }
        return this.terminal.error(text.replace("%ERROR%", error).replace("%FILE%", err.file).replace("%LINE%", err.line).replace("%COLUMN%", err.column));
      } else {
        return this.terminal.error(error);
      }
    } else {
      return this.terminal.error("" + error);
    }
  };

  RunWindow.prototype.annotateWarning = function(warning, info) {
    var source;
    if (this.app.editor.selected_source === info.file) {
      source = this.app.project.getSource(info.file);
      if (source != null) {
        source.annotations = [
          {
            row: info.line - 1,
            column: info.column - 1,
            type: "warning",
            text: warning
          }
        ];
        return this.app.project.notifyListeners("annotations");
      }
    }
  };

  RunWindow.prototype.messageReceived = function(msg) {
    var c, e, err, source;
    try {
      msg = JSON.parse(msg);
      switch (msg.name) {
        case "error":
          if (msg.data) {
            this.logError(msg.data);
            if (this.app.editor.selected_source === msg.data.file) {
              source = this.app.project.getSource(msg.data.file);
              if ((source != null) && msg.data.error) {
                source.annotations = [
                  {
                    row: msg.data.line - 1,
                    column: msg.data.column - 1,
                    type: "error",
                    text: msg.data.error
                  }
                ];
                this.app.project.notifyListeners("annotations");
              }
            }
          }
          return console.info(msg.data);
        case "compile_success":
          source = this.app.project.getSource(msg.file);
          if (source != null) {
            if ((source.annotations != null) && source.annotations.length > 0) {
              this.terminal.clear();
              source.annotations = [];
              return this.app.project.notifyListeners("annotations");
            }
          }
          break;
        case "log":
          return this.terminal.echo(msg.data);
        case "output":
          if (msg.data != null) {
            if (msg.id && (this.command_table[msg.id] != null)) {
              c = this.command_table[msg.id];
              this.command_table[msg.id] = null;
              return c(msg.data);
            } else {
              return this.terminal.echo(msg.data);
            }
          }
          break;
        case "focus":
          e = document.getElementById("runiframe");
          if (e != null) {
            return e.contentWindow.focus();
          }
      }
    } catch (error1) {
      err = error1;
    }
  };

  RunWindow.prototype.runCommand = function(command, output_callback) {
    var global, iframe, meta, parser, res;
    this.nesting = 0;
    if (command.trim().length === 0) {
      return;
    }
    iframe = document.getElementById("runiframe");
    if (iframe != null) {
      if (output_callback != null) {
        this.command_table[this.command_id] = output_callback;
      }
      return iframe.contentWindow.postMessage(JSON.stringify({
        name: "command",
        line: command,
        id: output_callback != null ? this.command_id++ : void 0
      }), "*");
    } else {
      if (this.local_vm == null) {
        meta = {
          print: (function(_this) {
            return function(text) {
              if (typeof text === "object") {
                text = Program.toString(text);
              }
              _this.terminal.echo(text);
            };
          })(this)
        };
        global = {};
        this.local_vm = new MicroVM(meta, global, null);
      }
      if (this.multiline != null) {
        this.multiline += "\n" + command;
        command = this.multiline;
      }
      parser = new Parser(command);
      parser.parse();
      if (parser.error_info) {
        this.nesting = parser.nesting;
        if (parser.unexpected_eof) {
          return this.multiline = command;
        } else {
          this.multiline = null;
          return this.logError(parser.error_info);
        }
      } else {
        this.nesting = 0;
        this.multiline = null;
        this.local_vm.clearWarnings();
        res = this.local_vm.run(parser.program);
        this.reportWarnings();
        if (output_callback != null) {
          return output_callback(res);
        } else if (this.local_vm.error_info) {
          return this.logError(this.local_vm.error_info);
        } else {
          if (!command.trim().startsWith("print") && !parser.program.isAssignment()) {
            return this.local_vm.context.meta.print(res);
          }
        }
      }
    }
  };

  RunWindow.prototype.reportWarnings = function() {
    var key, ref, ref1, ref2, results, value;
    if (this.local_vm != null) {
      ref = this.local_vm.context.warnings.invoking_non_function;
      for (key in ref) {
        value = ref[key];
        if (!value.reported) {
          value.reported = true;
          this.logError({
            error: "",
            type: "non_function",
            expression: value.expression,
            line: value.line,
            column: value.column,
            file: value.file
          });
        }
      }
      ref1 = this.local_vm.context.warnings.using_undefined_variable;
      for (key in ref1) {
        value = ref1[key];
        if (!value.reported) {
          value.reported = true;
          this.logError({
            error: "",
            type: "undefined_variable",
            expression: value.expression,
            line: value.line,
            column: value.column,
            file: value.file
          });
        }
      }
      ref2 = this.local_vm.context.warnings.assigning_field_to_undefined;
      results = [];
      for (key in ref2) {
        value = ref2[key];
        if (!value.reported) {
          value.reported = true;
          results.push(this.logError({
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

  RunWindow.prototype.projectOpened = function() {
    var iframe;
    iframe = document.getElementById("runiframe");
    if (iframe != null) {
      iframe.parentElement.removeChild(iframe);
    }
    return this.terminal.clear();
  };

  RunWindow.prototype.projectClosed = function() {
    return this.floating_window.close();
  };

  return RunWindow;

})();
