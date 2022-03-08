this.Watch = (function() {
  function Watch(app) {
    var fn, i, len, ref, t;
    this.app = app;
    this.runwindow = this.app.runwindow;
    this.runwindow.addMessageListener("watch_update", (function(_this) {
      return function(msg) {
        return _this.watchUpdate(msg);
      };
    })(this));
    this.types = ["number", "string", "function", "object", "list"];
    ref = this.types;
    fn = (function(_this) {
      return function(t) {
        _this["filtered_type_" + t] = false;
        return document.getElementById("debug-watch-type-" + t).addEventListener("click", function() {
          _this["filtered_type_" + t] = !_this["filtered_type_" + t];
          if (_this["filtered_type_" + t]) {
            document.getElementById("debug-watch-type-" + t).classList.add("filtered");
          } else {
            document.getElementById("debug-watch-type-" + t).classList.remove("filtered");
          }
          return _this.updateFilters();
        });
      };
    })(this);
    for (i = 0, len = ref.length; i < len; i++) {
      t = ref[i];
      fn(t);
    }
    document.getElementById("debug-watch-filter").addEventListener("input", (function(_this) {
      return function() {
        _this.text_filter = document.getElementById("debug-watch-filter").value;
        return _this.updateFilters();
      };
    })(this));
    this.reset();
    this.app.runwindow.addListener((function(_this) {
      return function(event) {
        return _this.runtimeEvent(event);
      };
    })(this));
  }

  Watch.prototype.reset = function() {
    this.watch_lines = {};
    this.watch_list = ["global"];
    this.text_filter = "";
    document.getElementById("debug-watch-filter").value = "";
    return document.getElementById("debug-watch-content").innerHTML = "";
  };

  Watch.prototype.start = function() {
    this.started = true;
    return this.runwindow.postMessage({
      name: "watch",
      list: this.watch_list
    });
  };

  Watch.prototype.stop = function() {
    this.started = false;
    return this.runwindow.postMessage({
      name: "stop_watching"
    });
  };

  Watch.prototype.addWatch = function(w) {
    console.info("adding watch: " + w);
    this.watch_list.push(w);
    this.watch_list_updated = true;
    return this.start();
  };

  Watch.prototype.removeWatch = function(w) {
    var index;
    console.info("removing watch: " + w);
    index = this.watch_list.indexOf(w);
    if (w.indexOf(".") > 0) {
      delete this.watch_lines[w];
    }
    if (index >= 0) {
      this.watch_list.splice(index, 1);
      return this.start();
    }
  };

  Watch.prototype.watchUpdate = function(msg) {
    var alive, data, e, key, ref, ref1, set_key, set_value, value;
    if (!this.started) {
      return;
    }
    data = msg.data;
    alive = {};
    for (set_key in data) {
      set_value = data[set_key];
      if (set_key !== "global") {
        if (this.watch_lines.hasOwnProperty(set_key)) {
          alive[set_key] = true;
          this.watch_lines[set_key].updateContents(set_value);
        }
      }
    }
    e = document.getElementById("debug-watch-content");
    ref = data.global;
    for (key in ref) {
      value = ref[key];
      if (this.watch_lines.hasOwnProperty(key)) {
        this.watch_lines[key].updateValue(value);
      } else {
        this.watch_lines[key] = new WatchLine(this, e, key, value);
      }
      alive[key] = true;
    }
    if (!this.watch_list_updated) {
      ref1 = this.watch_lines;
      for (key in ref1) {
        value = ref1[key];
        if (!alive[key]) {
          value.remove();
        }
      }
    }
    this.watch_list_updated = false;
  };

  Watch.prototype.isFiltered = function(w) {
    var v;
    v = w.value;
    if (this["filtered_type_" + v.type]) {
      return true;
    }
    if ((this.text_filter != null) && this.text_filter.length > 0 && w.prefixed.indexOf(this.text_filter) < 0) {
      return true;
    }
    return false;
  };

  Watch.prototype.updateFilters = function() {
    var key, ref, results, value;
    ref = this.watch_lines;
    results = [];
    for (key in ref) {
      value = ref[key];
      results.push(value.filterUpdate());
    }
    return results;
  };

  Watch.prototype.runtimeEvent = function(event) {
    switch (event) {
      case "play":
      case "reload":
        return this.reset();
      case "started":
        if (!this.app.appui.debug_splitbar.closed2) {
          this.reset();
          return this.start();
        }
        break;
      case "exit":
        this.started = false;
        return this.reset();
    }
  };

  return Watch;

})();

this.WatchLine = (function() {
  function WatchLine(watch, parent_element, variable, value1, prefix) {
    this.watch = watch;
    this.parent_element = parent_element;
    this.variable = variable;
    this.value = value1;
    this.prefix = prefix;
    this.prefixed = this.prefix != null ? this.prefix + "." + this.variable : this.variable;
    this.element = document.createElement("div");
    this.element.classList.add("watch-line");
    this.element.innerHTML = "<div class=\"watch-line-name\"><i class=\"fa\"></i> " + this.variable + "</div>\n<div class=\"watch-line-value\">" + (this.textValue()) + "</div>";
    this.element.classList.add(this.value.type);
    this.parent_element.appendChild(this.element);
    this.element.querySelector(".watch-line-value").addEventListener("click", (function(_this) {
      return function() {
        return _this.editValue();
      };
    })(this));
    this.element.querySelector("i").addEventListener("click", (function(_this) {
      return function() {
        var ref;
        if ((ref = _this.value.type) === "object" || ref === "list") {
          if (!_this.open) {
            _this.open = true;
            _this.watch.addWatch(_this.prefixed);
            _this.watch.watch_lines[_this.prefixed] = _this;
            _this.element.classList.add("open");
            if (_this.content != null) {
              return _this.content.style.display = "block";
            }
          } else {
            _this.open = false;
            _this.watch.removeWatch(_this.prefixed);
            _this.element.classList.remove("open");
            _this.watch_lines = {};
            if (_this.content != null) {
              _this.element.removeChild(_this.content);
              return _this.content = null;
            }
          }
        }
      };
    })(this));
    this.hidden = false;
    this.filterUpdate();
    this.watch_lines = {};
  }

  WatchLine.prototype.remove = function() {
    this.watch.removeWatch(this.prefixed);
    this.watch_lines = {};
    if (this.content != null) {
      this.element.removeChild(this.content);
      this.content = null;
    }
    this.element.classList.remove("open");
    return this.open = false;
  };

  WatchLine.prototype.textValue = function() {
    switch (this.value.type) {
      case "string":
        return '"' + this.value.value + '"';
      case "function":
        return "function()";
      case "list":
        return "[list:" + this.value.length + "]";
      case "object":
        return "object .. end";
      default:
        return this.value.value;
    }
  };

  WatchLine.prototype.updateValue = function(value) {
    var ref;
    if (value.type !== this.value.type) {
      this.element.classList.remove(this.value.type);
      this.element.classList.add(value.type);
      this.value.type = value.type;
      if ((this.content != null) && ((ref = this.value.type) !== "object" && ref !== "list")) {
        this.remove();
      }
    }
    if (value.value !== this.value.value || value.length !== this.value.length) {
      this.value.value = value.value;
      this.value.length = value.length;
      return this.element.querySelector(".watch-line-value").innerText = this.textValue();
    }
  };

  WatchLine.prototype.updateContents = function(data) {
    var key, results, value;
    if (!this.open) {
      return;
    }
    if (!this.content) {
      this.content = document.createElement("div");
      this.content.classList.add("watch-line-content");
      this.element.appendChild(this.content);
    }
    results = [];
    for (key in data) {
      value = data[key];
      if (this.watch_lines.hasOwnProperty(key)) {
        results.push(this.watch_lines[key].updateValue(value));
      } else {
        results.push(this.watch_lines[key] = new WatchLine(this.watch, this.content, key, value, this.prefixed));
      }
    }
    return results;
  };

  WatchLine.prototype.filterUpdate = function() {
    var key, ref, results, value;
    if (this.hidden !== this.watch.isFiltered(this)) {
      this.hidden = !this.hidden;
      this.element.style.display = this.hidden ? "none" : "block";
    }
    ref = this.watch_lines;
    results = [];
    for (key in ref) {
      value = ref[key];
      results.push(value.filterUpdate());
    }
    return results;
  };

  WatchLine.prototype.editValue = function() {
    var input;
    if (this.value.type === "number" || this.value.type === "string") {
      input = document.createElement("input");
      input.type = "text";
      input.value = this.value.value;
      this.element.appendChild(input);
      input.addEventListener("blur", (function(_this) {
        return function() {
          return _this.element.removeChild(input);
        };
      })(this));
      input.addEventListener("keydown", (function(_this) {
        return function(event) {
          var err;
          if (event.key === "Enter") {
            event.preventDefault();
            if (input.value !== _this.value.value) {
              try {
                if (_this.value.type === "number") {
                  if (isFinite(parseFloat(input.value))) {
                    _this.watch.app.runwindow.runCommand(_this.prefixed + " = " + input.value, function() {});
                  }
                } else if (_this.value.type === "string") {
                  _this.watch.app.runwindow.runCommand(_this.prefixed + " = \"" + input.value + "\" ", function() {});
                }
              } catch (error) {
                err = error;
                console.error(err);
              }
            }
            return input.blur();
          }
        };
      })(this));
      return input.focus();
    }
  };

  return WatchLine;

})();
