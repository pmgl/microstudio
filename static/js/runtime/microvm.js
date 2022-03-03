this.MicroVM = (function() {
  function MicroVM(meta, global, namespace1, preserve_ls) {
    var ctx, err;
    if (meta == null) {
      meta = {};
    }
    if (global == null) {
      global = {};
    }
    this.namespace = namespace1 != null ? namespace1 : "/microstudio";
    this.preserve_ls = preserve_ls != null ? preserve_ls : false;
    if (meta.print == null) {
      meta.print = function(text) {
        if (typeof text === "object") {
          text = Program.toString(text);
        }
        return console.info(text);
      };
    }
    Array.prototype.insert = function(e) {
      this.splice(0, 0, e);
      return e;
    };
    Array.prototype.insertAt = function(e, i) {
      if (i >= 0 && i < this.length) {
        this.splice(i, 0, e);
      } else {
        this.push(e);
      }
      return e;
    };
    Array.prototype.remove = function(i) {
      if (i >= 0 && i < this.length) {
        return this.splice(i, 1)[0];
      } else {
        return 0;
      }
    };
    Array.prototype.removeAt = function(i) {
      if (i >= 0 && i < this.length) {
        return this.splice(i, 1)[0];
      } else {
        return 0;
      }
    };
    Array.prototype.removeElement = function(e) {
      var index;
      index = this.indexOf(e);
      if (index >= 0) {
        return this.splice(index, 1)[0];
      } else {
        return 0;
      }
    };
    Array.prototype.contains = function(e) {
      if (this.indexOf(e) >= 0) {
        return 1;
      } else {
        return 0;
      }
    };
    meta.round = function(x) {
      return Math.round(x);
    };
    meta.floor = function(x) {
      return Math.floor(x);
    };
    meta.ceil = function(x) {
      return Math.ceil(x);
    };
    meta.abs = function(x) {
      return Math.abs(x);
    };
    meta.min = function(x, y) {
      return Math.min(x, y);
    };
    meta.max = function(x, y) {
      return Math.max(x, y);
    };
    meta.sqrt = function(x) {
      return Math.sqrt(x);
    };
    meta.pow = function(x, y) {
      return Math.pow(x, y);
    };
    meta.sin = function(x) {
      return Math.sin(x);
    };
    meta.cos = function(x) {
      return Math.cos(x);
    };
    meta.tan = function(x) {
      return Math.tan(x);
    };
    meta.acos = function(x) {
      return Math.acos(x);
    };
    meta.asin = function(x) {
      return Math.asin(x);
    };
    meta.atan = function(x) {
      return Math.atan(x);
    };
    meta.atan2 = function(y, x) {
      return Math.atan2(y, x);
    };
    meta.sind = function(x) {
      return Math.sin(x / 180 * Math.PI);
    };
    meta.cosd = function(x) {
      return Math.cos(x / 180 * Math.PI);
    };
    meta.tand = function(x) {
      return Math.tan(x / 180 * Math.PI);
    };
    meta.acosd = function(x) {
      return Math.acos(x) * 180 / Math.PI;
    };
    meta.asind = function(x) {
      return Math.asin(x) * 180 / Math.PI;
    };
    meta.atand = function(x) {
      return Math.atan(x) * 180 / Math.PI;
    };
    meta.atan2d = function(y, x) {
      return Math.atan2(y, x) * 180 / Math.PI;
    };
    meta.log = function(x) {
      return Math.log(x);
    };
    meta.exp = function(x) {
      return Math.exp(x);
    };
    meta.random = new Random(0);
    meta.PI = Math.PI;
    meta["true"] = 1;
    meta["false"] = 0;
    global.system = {
      time: Date.now,
      language: navigator.language,
      inputs: {
        keyboard: 1,
        mouse: 1,
        touch: "ontouchstart" in window ? 1 : 0,
        gamepad: 0
      },
      prompt: (function(_this) {
        return function(text, callback) {
          return setTimeout((function() {
            var args, result;
            global.mouse.pressed = 0;
            global.touch.touching = 0;
            result = window.prompt(text);
            if ((callback != null) && typeof callback === "function") {
              args = [(result != null ? 1 : 0), result];
              _this.context.timeout = Date.now() + 1000;
              return callback.apply(null, args);
            }
          }), 0);
        };
      })(this),
      say: (function(_this) {
        return function(text) {
          return setTimeout((function() {
            return window.alert(text);
          }), 0);
        };
      })(this)
    };
    try {
      global.system.inputs.keyboard = window.matchMedia("(pointer:fine)").matches ? 1 : 0;
      global.system.inputs.mouse = window.matchMedia("(any-hover:none)").matches ? 0 : 1;
    } catch (error1) {
      err = error1;
    }
    this.storage_service = this.createStorageService();
    global.storage = this.storage_service.api;
    meta.global = global;
    this.context = {
      meta: meta,
      global: global,
      local: global,
      object: global,
      breakable: 0,
      continuable: 0,
      returnable: 0,
      stack_size: 0
    };
    ctx = this.context;
    Array.prototype.sortList = function(f) {
      var funk;
      if ((f != null) && f instanceof Program.Function) {
        funk = function(a, b) {
          return f.call(ctx, [a, b], true);
        };
      } else if ((f != null) && typeof f === "function") {
        funk = f;
      }
      return this.sort(funk);
    };
    this.clearWarnings();
    this.runner = new Runner(this);
  }

  MicroVM.prototype.clearWarnings = function() {
    return this.context.warnings = {
      using_undefined_variable: {},
      assigning_field_to_undefined: {},
      invoking_non_function: {}
    };
  };

  MicroVM.prototype.setMeta = function(key, value) {
    return this.context.meta[key] = value;
  };

  MicroVM.prototype.setGlobal = function(key, value) {
    return this.context.global[key] = value;
  };

  MicroVM.prototype.run = function(program, timeout, filename) {
    var err, res;
    this.program = program;
    if (timeout == null) {
      timeout = 3000;
    }
    if (filename == null) {
      filename = "";
    }
    this.error_info = null;
    this.context.timeout = Date.now() + timeout;
    this.context.stack_size = 0;
    try {
      res = this.runner.run(this.program, filename);
      this.storage_service.check();
      return Program.toString(res);
    } catch (error1) {
      err = error1;
      if ((err.type != null) && (err.line != null) && (err.error != null)) {
        this.error_info = err;
      } else if ((this.context.location != null) && (this.context.location.token != null)) {
        this.error_info = {
          error: err,
          file: filename,
          line: this.context.location.token.line,
          column: this.context.location.token.column
        };
        console.info("Error at line: " + this.context.location.token.line + " column: " + this.context.location.token.column);
      } else {
        this.error_info = {
          error: err,
          file: filename
        };
      }
      console.error(err);
      return this.storage_service.check();
    }
  };

  MicroVM.prototype.call = function(name, args, timeout) {
    var err, res;
    if (args == null) {
      args = [];
    }
    if (timeout == null) {
      timeout = 3000;
    }
    this.error_info = null;
    this.context.timeout = Date.now() + timeout;
    this.context.stack_size = 0;
    try {
      res = this.runner.call(name, args);
      this.storage_service.check();
      return res;
    } catch (error1) {
      err = error1;
      console.error(err);
      if ((this.context.location != null) && (this.context.location.token != null)) {
        this.error_info = {
          error: err,
          line: this.context.location.token.line,
          column: this.context.location.token.column,
          file: this.context.location.token.file
        };
      } else {
        this.error_info = {
          error: err
        };
      }
      if ((this.context.location != null) && (this.context.location.token != null)) {
        console.info("Error at line: " + this.context.location.token.line + " column: " + this.context.location.token.column);
      }
      return this.storage_service.check();
    }
  };

  MicroVM.prototype.createStorageService = function() {
    var err, error, ls, namespace, s, service, storage, write_storage;
    try {
      ls = window.localStorage;
    } catch (error1) {
      error = error1;
      console.info("localStorage not available");
      return service = {
        api: {
          set: function() {},
          get: function() {
            return 0;
          }
        },
        check: function() {}
      };
    }
    if (!this.preserve_ls) {
      try {
        delete window.localStorage;
      } catch (error1) {
        err = error1;
      }
    }
    storage = {};
    write_storage = false;
    namespace = this.namespace;
    try {
      s = ls.getItem("ms" + namespace);
      if (s) {
        storage = JSON.parse(s);
      }
    } catch (error1) {
      err = error1;
    }
    return service = {
      api: {
        set: (function(_this) {
          return function(name, value) {
            value = _this.storableObject(value);
            if ((name != null) && (value != null)) {
              storage[name] = value;
              write_storage = true;
            }
            return value;
          };
        })(this),
        get: (function(_this) {
          return function(name) {
            if (name != null) {
              return storage[name];
            } else {
              return 0;
            }
          };
        })(this)
      },
      check: (function(_this) {
        return function() {
          if (write_storage) {
            write_storage = false;
            try {
              return ls.setItem("ms" + namespace, JSON.stringify(storage));
            } catch (error1) {
              err = error1;
            }
          }
        };
      })(this)
    };
  };

  MicroVM.prototype.storableObject = function(value) {
    var referenced;
    referenced = [this.context.global.screen, this.context.global.system, this.context.global.keyboard, this.context.global.audio, this.context.global.gamepad, this.context.global.touch, this.context.global.mouse, this.context.global.sprites, this.context.global.maps];
    return this.makeStorableObject(value, referenced);
  };

  MicroVM.prototype.makeStorableObject = function(value, referenced) {
    var i, j, key, len, res, v;
    if (value == null) {
      return value;
    }
    if (typeof value === "function" || value instanceof Program.Function) {
      return void 0;
    } else if (typeof value === "object") {
      if (referenced.indexOf(value) >= 0) {
        return void 0;
      }
      referenced = referenced.slice();
      referenced.push(value);
      if (Array.isArray(value)) {
        res = [];
        for (i = j = 0, len = value.length; j < len; i = ++j) {
          v = value[i];
          v = this.makeStorableObject(v, referenced);
          if (v != null) {
            res[i] = v;
          }
        }
        return res;
      } else {
        res = {};
        for (key in value) {
          v = value[key];
          v = this.makeStorableObject(v, referenced);
          if (v != null) {
            res[key] = v;
          }
        }
        return res;
      }
    } else {
      return value;
    }
  };

  return MicroVM;

})();
