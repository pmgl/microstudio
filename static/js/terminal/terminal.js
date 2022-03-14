this.Terminal = (function() {
  function Terminal(runwindow) {
    this.runwindow = runwindow;
    this.commands = {
      clear: (function(_this) {
        return function() {
          return _this.clear();
        };
      })(this)
    };
    this.loadHistory();
  }

  Terminal.prototype.loadHistory = function() {
    var err;
    this.history = [];
    try {
      if (localStorage.getItem("console_history") != null) {
        return this.history = JSON.parse(localStorage.getItem("console_history"));
      }
    } catch (error) {
      err = error;
    }
  };

  Terminal.prototype.saveHistory = function() {
    return localStorage.setItem("console_history", JSON.stringify(this.history));
  };

  Terminal.prototype.start = function() {
    if (this.started) {
      return;
    }
    this.started = true;
    document.getElementById("terminal").addEventListener("mousedown", (function(_this) {
      return function(event) {
        _this.pressed = true;
        _this.moved = false;
        return true;
      };
    })(this));
    document.getElementById("terminal").addEventListener("mousemove", (function(_this) {
      return function(event) {
        if (_this.pressed) {
          _this.moved = true;
        }
        return true;
      };
    })(this));
    document.getElementById("terminal").addEventListener("mouseup", (function(_this) {
      return function(event) {
        if (!_this.moved) {
          document.getElementById("terminal-input").focus();
        }
        _this.moved = false;
        _this.pressed = false;
        return true;
      };
    })(this));
    document.getElementById("terminal-input").addEventListener("paste", (function(_this) {
      return function(event) {
        var j, len, line, s, text;
        text = event.clipboardData.getData("text/plain");
        s = text.split("\n");
        if (s.length > 1) {
          event.preventDefault();
          for (j = 0, len = s.length; j < len; j++) {
            line = s[j];
            document.getElementById("terminal-input").value = "";
            _this.validateLine(line);
          }
        } else {
          return false;
        }
      };
    })(this));
    return document.getElementById("terminal-input").addEventListener("keydown", (function(_this) {
      return function(event) {
        var v;
        if (event.key === "Enter") {
          v = document.getElementById("terminal-input").value;
          document.getElementById("terminal-input").value = "";
          return _this.validateLine(v);
        } else if (event.key === "ArrowUp") {
          if (_this.history_index == null) {
            _this.history_index = _this.history.length - 1;
            _this.current_input = document.getElementById("terminal-input").value;
          } else {
            _this.history_index = Math.max(0, _this.history_index - 1);
          }
          if (_this.history_index === _this.history.length - 1) {
            _this.current_input = document.getElementById("terminal-input").value;
          }
          if (_this.history_index >= 0 && _this.history_index < _this.history.length) {
            document.getElementById("terminal-input").value = _this.history[_this.history_index];
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
            document.getElementById("terminal-input").value = _this.history[_this.history_index];
            return _this.setTrailingCaret();
          } else if (_this.history_index === _this.history.length) {
            document.getElementById("terminal-input").value = _this.current_input;
            return _this.setTrailingCaret();
          }
        }
      };
    })(this));
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
        document.querySelector("#terminal-input-gt i").classList.add("fa-ellipsis-v");
        for (i = j = 0, ref = this.runwindow.nesting * 2 - 1; j <= ref; i = j += 1) {
          document.getElementById("terminal-input").value += " ";
        }
        return this.setTrailingCaret();
      } else {
        return document.querySelector("#terminal-input-gt i").classList.remove("fa-ellipsis-v");
      }
    }
  };

  Terminal.prototype.setTrailingCaret = function() {
    return setTimeout(((function(_this) {
      return function() {
        var val;
        val = document.getElementById("terminal-input").value;
        return document.getElementById("terminal-input").setSelectionRange(val.length, val.length);
      };
    })(this)), 0);
  };

  Terminal.prototype.echo = function(text, scroll, classname) {
    var d, div, e, i;
    if (scroll == null) {
      scroll = false;
    }
    if (!scroll) {
      e = document.getElementById("terminal-view");
      if (Math.abs(e.getBoundingClientRect().height + e.scrollTop - e.scrollHeight) < 10) {
        scroll = true;
      }
    }
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
    document.getElementById("terminal-lines").appendChild(div);
    if (scroll) {
      div.scrollIntoView();
    }
    return this.truncate();
  };

  Terminal.prototype.error = function(text, scroll) {
    if (scroll == null) {
      scroll = false;
    }
    return this.echo(text, scroll, "error");
  };

  Terminal.prototype.truncate = function() {
    var e;
    e = document.getElementById("terminal-lines");
    while (e.childElementCount > 1000) {
      e.removeChild(e.firstChild);
    }
  };

  Terminal.prototype.clear = function() {
    document.getElementById("terminal-lines").innerHTML = "";
    return delete this.runwindow.multiline;
  };

  return Terminal;

})();
