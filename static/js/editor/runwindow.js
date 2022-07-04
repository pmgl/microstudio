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
    this.app.appui.setAction("qrcode-button", (function(_this) {
      return function() {
        return _this.showQRCode();
      };
    })(this));
    this.app.appui.setAction("take-picture-button", (function(_this) {
      return function() {
        return _this.takePicture();
      };
    })(this));
    this.app.appui.setAction("step-forward-button", (function(_this) {
      return function() {
        return _this.stepForward();
      };
    })(this));
    this.app.appui.setAction("step-forward-button-win", (function(_this) {
      return function() {
        return _this.stepForward();
      };
    })(this));
    if (window.ms_standalone) {
      document.getElementById("qrcode-button").style.display = "none";
    }
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
    window.addEventListener("message", (function(_this) {
      return function(msg) {
        var iframe;
        iframe = document.getElementById("runiframe");
        if ((iframe != null) && msg.source === iframe.contentWindow) {
          return _this.messageReceived(msg.data);
        }
      };
    })(this));
    this.command_table = {};
    this.command_id = 0;
    this.floating_window = new FloatingWindow(this.app, "run-window", this);
    this.floating_window.max_ratio = 1;
    this.initWarnings();
    this.message_listeners = {};
    this.listeners = [];
    this.project_access = new ProjectAccess(this.app, null, this);
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
    var code, device, origin, src, url;
    src = this.app.editor.editor.getValue();
    device = document.getElementById("device");
    code = this.app.project["public"] ? "" : this.app.project.code + "/";
    url = (location.origin.replace(".dev", ".io")) + "/" + this.app.project.owner.nick + "/" + this.app.project.slug + "/" + code;
    origin = "" + (location.origin.replace(".dev", ".io"));
    return this.app.project.savePendingChanges((function(_this) {
      return function() {
        device.innerHTML = "<iframe id='runiframe' allow='autoplay " + origin + "; gamepad " + origin + "; midi " + origin + "' src='" + url + "?debug'></iframe>";
        _this.windowResized();
        return document.getElementById("take-picture-button").style.display = "inline-block";
      };
    })(this));
  };

  RunWindow.prototype.reload = function() {
    this.terminal.clear();
    this.run();
    document.getElementById("run-button").classList.add("selected");
    document.getElementById("pause-button").classList.remove("selected");
    document.getElementById("reload-button").classList.remove("selected");
    document.getElementById("run-button-win").classList.add("selected");
    document.getElementById("pause-button-win").classList.remove("selected");
    document.getElementById("reload-button-win").classList.remove("selected");
    document.getElementById("step-forward-button").style.display = "none";
    document.getElementById("step-forward-button-win").style.display = "none";
    return this.propagate("reload");
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
      document.getElementById("reload-button-win").classList.remove("selected");
      document.getElementById("step-forward-button").style.display = "none";
      document.getElementById("step-forward-button-win").style.display = "none";
      return this.propagate("play");
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
    document.getElementById("reload-button-win").classList.remove("selected");
    document.getElementById("step-forward-button").style.display = "inline-block";
    document.getElementById("step-forward-button-win").style.display = "inline-block";
    return this.propagate("pause");
  };

  RunWindow.prototype.isPaused = function() {
    return document.getElementById("pause-button").classList.contains("selected") || document.getElementById("pause-button-win").classList.contains("selected");
  };

  RunWindow.prototype.stepForward = function() {
    return this.postMessage({
      name: "step_forward"
    });
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
    document.getElementById("reload-button-win").classList.remove("selected");
    document.getElementById("step-forward-button").style.display = "none";
    document.getElementById("step-forward-button-win").style.display = "none";
    return this.propagate("resume");
  };

  RunWindow.prototype.resetButtons = function() {
    document.getElementById("run-button").classList.remove("selected");
    document.getElementById("pause-button").classList.add("selected");
    document.getElementById("reload-button").classList.add("selected");
    document.getElementById("run-button-win").classList.remove("selected");
    document.getElementById("pause-button-win").classList.add("selected");
    document.getElementById("reload-button-win").classList.add("selected");
    document.getElementById("step-forward-button").style.display = "none";
    return document.getElementById("step-forward-button-win").style.display = "none";
  };

  RunWindow.prototype.clear = function() {
    return this.terminal.clear();
  };

  RunWindow.prototype.toggleConsoleOptions = function() {
    var div;
    div = document.getElementById("console-options");
    if (div.getBoundingClientRect().height <= 41) {
      div.style.height = "115px";
      document.getElementById("terminal-view").style.top = "155px";
    } else {
      div.style.height = "0px";
      document.getElementById("terminal-view").style.top = "40px";
    }
    return setTimeout(((function(_this) {
      return function() {
        return _this.app.appui.runtime_splitbar.update();
      };
    })(this)), 600);
  };

  RunWindow.prototype.updateCode = function(file, src) {
    var iframe;
    if (this.error_check != null) {
      clearTimeout(this.error_check);
    }
    this.error_buffer = [];
    this.error_check = setTimeout(((function(_this) {
      return function() {
        var err, i, len, ref, results;
        _this.error_check = null;
        if (_this.terminal.error_lines > 0) {
          _this.terminal.clear();
        }
        ref = _this.error_buffer;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          err = ref[i];
          results.push(_this.logError(err));
        }
        return results;
      };
    })(this)), 3000);
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
    var c, ch, cw, h, r, ratio, w;
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
      c.style["margin-top"] = "0px";
      c.style.width = Math.round(cw) + "px";
      c.style.height = Math.round(ch) + "px";
    }
    return this.rulercanvas.resize(Math.round(w), Math.round(h), Math.round((ch - h) / 2));
  };

  RunWindow.prototype.logError = function(err) {
    var error, text;
    if (this.error_check != null) {
      this.error_buffer.push(err);
      return;
    }
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
        break;
      case "assigning_api_variable":
        error = this.app.translator.get("Warning: overwriting global API variable '%EXP%'").replace("%EXP%", err.expression);
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
    source = this.app.project.getSource(info.file);
    if (source != null) {
      if (source.annotations == null) {
        source.annotations = [];
      }
      source.annotations.push({
        row: info.line - 1,
        column: info.column - 1,
        type: "warning",
        text: warning
      });
      return this.app.project.notifyListeners("annotations");
    }
  };

  RunWindow.prototype.messageReceived = function(msg) {
    var c, e, err, iframe, source;
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
          break;
        case "picture_taken":
          return this.showPicture(msg.data);
        case "code_paused":
          return this.pause();
        case "exit":
          return this.exit();
        case "started":
          this.propagate("started");
          if (this.pending_command != null) {
            iframe = document.getElementById("runiframe");
            if (iframe != null) {
              if (this.pending_command.output_callback != null) {
                this.command_table[this.command_id] = this.pending_command.output_callback;
              }
              iframe.contentWindow.postMessage(JSON.stringify({
                name: "command",
                line: this.pending_command.command,
                id: this.pending_command.output_callback != null ? this.command_id++ : void 0
              }), "*");
            }
            return this.pending_command = null;
          }
          break;
        case "time_machine":
          return this.app.debug.time_machine.messageReceived(msg);
        default:
          if ((msg.name != null) && (this.message_listeners[msg.name] != null)) {
            return this.message_listeners[msg.name](msg);
          } else {
            return this.project_access.messageReceived(msg);
          }
      }
    } catch (error1) {
      err = error1;
    }
  };

  RunWindow.prototype.runCommand = function(command, output_callback) {
    var iframe, parser;
    this.nesting = 0;
    if (command.trim().length === 0) {
      return;
    }
    if ((this.app.project != null) && this.app.project.language.startsWith("microscript")) {
      if (this.multiline != null) {
        this.multiline += "\n" + command;
        command = this.multiline;
      }
      parser = new Parser(command);
      parser.parse();
      if (parser.error_info) {
        this.nesting = parser.nesting;
        if (parser.unexpected_eof) {
          this.multiline = command;
        } else {
          this.multiline = null;
          this.logError(parser.error_info);
        }
        return;
      } else {
        this.nesting = 0;
        this.multiline = null;
      }
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
      this.pending_command = {
        command: command,
        output_callback: output_callback
      };
      return this.play();
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
    var iframe;
    this.floating_window.close();
    iframe = document.getElementById("runiframe");
    if (iframe != null) {
      iframe.parentElement.removeChild(iframe);
    }
    document.getElementById("take-picture-button").style.display = "none";
    return this.hideAll();
  };

  RunWindow.prototype.hideQRCode = function() {
    if (this.qrcode != null) {
      document.body.removeChild(this.qrcode);
      return this.qrcode = null;
    }
  };

  RunWindow.prototype.showQRCode = function() {
    var qrcode, url;
    if (this.app.project != null) {
      if (this.qrcode != null) {
        return this.hideQRCode();
      } else {
        url = location.origin.replace(".dev", ".io") + "/";
        url += this.app.project.owner.nick + "/";
        url += this.app.project.slug + "/";
        if (!this.app.project["public"]) {
          url += this.app.project.code + "/";
        }
        return qrcode = QRCode.toDataURL(url, {
          margin: 2,
          scale: 8
        }, (function(_this) {
          return function(err, url) {
            var img;
            if ((err == null) && (url != null)) {
              img = new Image;
              img.src = url;
              return img.onload = function() {
                var b;
                b = document.getElementById("qrcode-button").getBoundingClientRect();
                img.style.position = "absolute";
                img.style.top = (b.y + b.height + 20) + "px";
                img.style.left = (Math.min(b.x + b.width / 2 - 132, window.innerWidth - img.width - 10)) + "px";
                _this.qrcode = img;
                _this.qrcode.addEventListener("click", function() {
                  return _this.showQRCode();
                });
                return document.body.appendChild(_this.qrcode);
              };
            }
          };
        })(this));
      }
    }
  };

  RunWindow.prototype.takePicture = function() {
    var iframe;
    iframe = document.getElementById("runiframe");
    if (iframe != null) {
      return iframe.contentWindow.postMessage(JSON.stringify({
        name: "take_picture"
      }), "*");
    }
  };

  RunWindow.prototype.hidePicture = function() {
    if (this.picture != null) {
      document.body.removeChild(this.picture);
      return this.picture = null;
    }
  };

  RunWindow.prototype.showPicture = function(data) {
    var b, button, div, img, save_button, set_button;
    this.hidePicture();
    this.picture = div = document.createElement("div");
    div.classList.add("show-picture");
    div.style.position = "absolute";
    b = document.getElementById("take-picture-button").getBoundingClientRect();
    div.style.top = (b.y + b.height + 20) + "px";
    div.style.left = (Math.min(b.x + b.width / 2 - 180, window.innerWidth - 360 - 10)) + "px";
    document.body.appendChild(div);
    img = new Image;
    img.src = data;
    img.style.width = "320px";
    div.appendChild(img);
    div.appendChild(document.createElement("br"));
    save_button = document.createElement("div");
    save_button.innerText = this.app.translator.get("Save");
    save_button.classList.add("save");
    save_button.addEventListener("click", (function(_this) {
      return function() {
        return _this.savePicture(data, save_button);
      };
    })(this));
    div.appendChild(save_button);
    div.appendChild(document.createElement("br"));
    set_button = document.createElement("div");
    set_button.innerText = this.app.translator.get("Set as project poster image");
    set_button.addEventListener("click", (function(_this) {
      return function() {
        return _this.setAsPoster(data, set_button);
      };
    })(this));
    div.appendChild(set_button);
    div.appendChild(document.createElement("br"));
    button = document.createElement("div");
    button.innerText = this.app.translator.get("Close");
    button.classList.add("close");
    button.addEventListener("click", (function(_this) {
      return function() {
        return _this.hidePicture();
      };
    })(this));
    return div.appendChild(button);
  };

  RunWindow.prototype.savePicture = function(data, button) {
    var link;
    link = document.createElement("a");
    link.setAttribute("href", data);
    link.setAttribute("download", this.app.project.slug + ".png");
    link.click();
    return button.style.display = "none";
  };

  RunWindow.prototype.setAsPoster = function(data, button) {
    var img;
    button.style.display = "none";
    img = new Image;
    img.src = data;
    return img.onload = (function(_this) {
      return function() {
        var canvas, h, ih, iw, poster, r, w;
        canvas = document.createElement("canvas");
        iw = img.width;
        ih = img.height;
        if (iw < ih) {
          h = Math.min(360, ih);
          r = h / ih * 1.2;
          canvas.width = w = h / 9 * 16;
          canvas.height = h;
          canvas.getContext("2d").fillStyle = "#000";
          canvas.getContext("2d").fillRect(0, 0, canvas.width, canvas.height);
          canvas.getContext("2d").drawImage(img, w / 2 - r * img.width / 2, h / 2 - r * img.height / 2, img.width * r, img.height * r);
        } else {
          w = Math.min(640, iw, ih / 9 * 16);
          h = w / 16 * 9;
          r = Math.max(w / img.width, h / img.height);
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d").drawImage(img, w / 2 - r * img.width / 2, h / 2 - r * img.height / 2, img.width * r, img.height * r);
        }
        data = canvas.toDataURL().split(",")[1];
        poster = _this.app.project.getSprite("poster");
        return _this.app.client.sendRequest({
          name: "write_project_file",
          project: _this.app.project.id,
          file: "sprites/poster.png",
          properties: {
            frames: 1,
            fps: 5
          },
          content: data
        }, function(msg) {
          _this.app.project.updateSpriteList();
          if (poster != null) {
            return poster.reload();
          }
        });
      };
    })(this);
  };

  RunWindow.prototype.hideAll = function() {
    this.hideQRCode();
    return this.hidePicture();
  };

  RunWindow.prototype.exit = function() {
    this.projectClosed();
    document.getElementById("run-button").classList.remove("selected");
    document.getElementById("pause-button").classList.remove("selected");
    document.getElementById("reload-button").classList.remove("selected");
    document.getElementById("run-button-win").classList.remove("selected");
    document.getElementById("pause-button-win").classList.remove("selected");
    document.getElementById("reload-button-win").classList.remove("selected");
    return this.propagate("exit");
  };

  RunWindow.prototype.postMessage = function(data) {
    var iframe;
    iframe = document.getElementById("runiframe");
    if (iframe != null) {
      return iframe.contentWindow.postMessage(JSON.stringify(data), "*");
    }
  };

  RunWindow.prototype.addMessageListener = function(name, callback) {
    return this.message_listeners[name] = callback;
  };

  RunWindow.prototype.addListener = function(callback) {
    return this.listeners.push(callback);
  };

  RunWindow.prototype.propagate = function(event) {
    var i, l, len, ref, results;
    ref = this.listeners;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      l = ref[i];
      results.push(l(event));
    }
    return results;
  };

  return RunWindow;

})();
