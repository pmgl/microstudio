this.Terminal = (function() {
  function Terminal(runwindow, tid) {
    this.runwindow = runwindow;
    this.tid = tid != null ? tid : "terminal";
    this.localStorage = localStorage;
    this.commands = {
      clear: (function(_this) {
        return function() {
          return _this.clear();
        };
      })(this)
    };
    this.loadHistory();
    this.buffer = [];
    this.length = 0;
    this.error_lines = 0;
  }

  Terminal.prototype.loadHistory = function() {
    var err;
    this.history = [];
    try {
      if (this.localStorage.getItem("console_history") != null) {
        return this.history = JSON.parse(this.localStorage.getItem("console_history"));
      }
    } catch (error) {
      err = error;
    }
  };

  Terminal.prototype.saveHistory = function() {
    return this.localStorage.setItem("console_history", JSON.stringify(this.history));
  };

  Terminal.prototype.start = function() {
    if (this.started) {
      return;
    }
    this.started = true;
    document.getElementById("" + this.tid).addEventListener("mousedown", (function(_this) {
      return function(event) {
        _this.pressed = true;
        _this.moved = false;
        return true;
      };
    })(this));
    document.getElementById("" + this.tid).addEventListener("mousemove", (function(_this) {
      return function(event) {
        if (_this.pressed) {
          _this.moved = true;
        }
        return true;
      };
    })(this));
    document.getElementById("" + this.tid).addEventListener("mouseup", (function(_this) {
      return function(event) {
        if (!_this.moved) {
          document.getElementById(_this.tid + "-input").focus();
        }
        _this.moved = false;
        _this.pressed = false;
        return true;
      };
    })(this));
    document.getElementById(this.tid + "-input").addEventListener("paste", (function(_this) {
      return function(event) {
        var j, len, line, s, text;
        text = event.clipboardData.getData("text/plain");
        s = text.split("\n");
        if (s.length > 1) {
          event.preventDefault();
          for (j = 0, len = s.length; j < len; j++) {
            line = s[j];
            document.getElementById(_this.tid + "-input").value = "";
            _this.validateLine(line);
          }
        } else {
          return false;
        }
      };
    })(this));
    document.getElementById(this.tid + "-input").addEventListener("keydown", (function(_this) {
      return function(event) {
        var v;
        if (event.key === "Enter") {
          v = document.getElementById(_this.tid + "-input").value;
          document.getElementById(_this.tid + "-input").value = "";
          _this.validateLine(v);
          return _this.force_scroll = true;
        } else if (event.key === "ArrowUp") {
          if (_this.history_index == null) {
            _this.history_index = _this.history.length - 1;
            _this.current_input = document.getElementById(_this.tid + "-input").value;
          } else {
            _this.history_index = Math.max(0, _this.history_index - 1);
          }
          if (_this.history_index === _this.history.length - 1) {
            _this.current_input = document.getElementById(_this.tid + "-input").value;
          }
          if (_this.history_index >= 0 && _this.history_index < _this.history.length) {
            document.getElementById(_this.tid + "-input").value = _this.history[_this.history_index];
            return _this.setTrailingCaret();
          }
        } else if (event.key === "ArrowDown") {
          if (_this.history_index === _this.history.length) {
            return;
          }
          if (_this.history_index != null) {
            _this.history_index = Math.min(_this.history.length, _this.history_index + 1);
          } else {
            return;
          }
          if (_this.history_index >= 0 && _this.history_index < _this.history.length) {
            document.getElementById(_this.tid + "-input").value = _this.history[_this.history_index];
            return _this.setTrailingCaret();
          } else if (_this.history_index === _this.history.length) {
            document.getElementById(_this.tid + "-input").value = _this.current_input;
            return _this.setTrailingCaret();
          }
        }
      };
    })(this));
    return setInterval(((function(_this) {
      return function() {
        return _this.update();
      };
    })(this)), 16);
  };

  Terminal.prototype.validateLine = function(v) {
    var i, j, ref;
    this.history_index = null;
    if (v.trim().length > 0 && v !== this.history[this.history.length - 1]) {
      this.history.push(v);
      if (this.history.length > 1000) {
        this.history.splice(0, 1);
      }
      this.saveHistory();
    }
    this.echo("" + v, true, "input");
    if (this.commands[v.trim()] != null) {
      return this.commands[v.trim()]();
    } else {
      this.runwindow.runCommand(v);
      if (this.runwindow.multiline) {
        document.querySelector("#" + this.tid + "-input-gt i").classList.add("fa-ellipsis-v");
        for (i = j = 0, ref = this.runwindow.nesting * 2 - 1; j <= ref; i = j += 1) {
          document.getElementById(this.tid + "-input").value += " ";
        }
        return this.setTrailingCaret();
      } else {
        return document.querySelector("#" + this.tid + "-input-gt i").classList.remove("fa-ellipsis-v");
      }
    }
  };

  Terminal.prototype.setTrailingCaret = function() {
    return setTimeout(((function(_this) {
      return function() {
        var val;
        val = document.getElementById(_this.tid + "-input").value;
        return document.getElementById(_this.tid + "-input").setSelectionRange(val.length, val.length);
      };
    })(this)), 0);
  };

  Terminal.prototype.update = function() {
    var container, div, e, element, j, len, ref, t;
    if (this.buffer.length > 0) {
      if (this.force_scroll) {
        this.scroll = true;
        this.force_scroll = false;
      } else {
        e = document.getElementById(this.tid + "-view");
        this.scroll = Math.abs(e.getBoundingClientRect().height + e.scrollTop - e.scrollHeight) < 10;
      }
      div = document.createDocumentFragment();
      container = document.createElement("div");
      div.appendChild(container);
      ref = this.buffer;
      for (j = 0, len = ref.length; j < len; j++) {
        t = ref[j];
        container.appendChild(element = this.echoReal(t.text, t.classname));
      }
      document.getElementById(this.tid + "-lines").appendChild(div);
      if (this.scroll) {
        element.scrollIntoView();
      }
      this.length += this.buffer.length;
      return this.buffer = [];
    }
  };

  Terminal.prototype.echo = function(text, scroll, classname) {
    if (scroll == null) {
      scroll = false;
    }
    this.buffer.push({
      text: text,
      classname: classname
    });
  };

  Terminal.prototype.echoReal = function(text, classname) {
    var d, div, i;
    div = document.createElement("div");
    if (classname === "input") {
      d = document.createTextNode(" " + text);
      i = document.createElement("i");
      i.classList.add("fa");
      i.classList.add("fa-angle-right");
      div.appendChild(i);
      div.appendChild(d);
    } else {
      div.innerText = text;
    }
    if (classname != null) {
      div.classList.add(classname);
    }
    this.truncate();
    return div;
  };

  Terminal.prototype.error = function(text, scroll) {
    if (scroll == null) {
      scroll = false;
    }
    this.echo(text, scroll, "error");
    return this.error_lines += 1;
  };

  Terminal.prototype.truncate = function() {
    var c, e;
    e = document.getElementById(this.tid + "-lines");
    while (this.length > 10000 && (e.firstChild != null)) {
      c = e.firstChild.children.length;
      e.removeChild(e.firstChild);
      this.length -= c;
    }
  };

  Terminal.prototype.clear = function() {
    document.getElementById(this.tid + "-lines").innerHTML = "";
    this.buffer = [];
    this.length = 0;
    this.error_lines = 0;
    document.querySelector("#" + this.tid + "-input-gt i").classList.remove("fa-ellipsis-v");
    return delete this.runwindow.multiline;
  };

  return Terminal;

})();
