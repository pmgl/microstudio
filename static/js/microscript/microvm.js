this.MicroVM = (function() {
  function MicroVM(meta, global, namespace, transpiler) {
    var ctx, err;
    if (meta == null) {
      meta = {};
    }
    if (global == null) {
      global = {};
    }
    this.namespace = namespace != null ? namespace : "/microstudio";
    this.transpiler = transpiler != null ? transpiler : false;
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
            result = window.prompt(text);
            if ((callback != null) && callback instanceof Program.Function) {
              args = [(result != null ? 1 : 0), result];
              return _this.call(callback, args);
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
    } catch (error) {
      err = error;
    }
    global.storage = this.createStorageService();
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

  MicroVM.prototype.run = function(program, timeout, compile) {
    var err, i, j, len, ref, res, s;
    this.program = program;
    if (timeout == null) {
      timeout = 3000;
    }
    if (compile == null) {
      compile = this.transpiler;
    }
    this.error_info = null;
    this.context.timeout = Date.now() + timeout;
    this.context.stack_size = 0;
    if (compile) {
      try {
        res = new JSTranspiler(this.program).exec(this.context);
        this.checkStorage();
        return Program.toString(res);
      } catch (error) {
        err = error;
        console.error(err);
        this.error_info = {
          error: err,
          line: this.context.location.token.line,
          column: this.context.location.token.column
        };
        return this.checkStorage();
      }
    } else {
      try {
        ref = this.program.statements;
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          s = ref[i];
          res = s.evaluate(this.context, i === this.program.statements.length - 1);
        }
        this.checkStorage();
        return Program.toString(res);
      } catch (error) {
        err = error;
        if (this.context.location != null) {
          this.error_info = {
            error: err,
            line: this.context.location.token.line,
            column: this.context.location.token.column
          };
        }
        console.info("Error at line: " + this.context.location.token.line + " column: " + this.context.location.token.column);
        console.error(err);
        return this.checkStorage();
      }
    }
  };

  MicroVM.prototype.call = function(name, args, timeout) {
    var a, err, f, i, j, ref, res;
    if (args == null) {
      args = [];
    }
    if (timeout == null) {
      timeout = 3000;
    }
    this.error_info = null;
    this.context.timeout = Date.now() + timeout;
    this.context.stack_size = 0;
    for (i = j = 0, ref = args.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      a = args[i];
      if (typeof a === "number") {
        args[i] = new Program.Value(null, Program.Value.TYPE_NUMBER, a);
      } else if (typeof a === "string") {
        args[i] = new Program.Value(null, Program.Value.TYPE_STRING, a);
      } else {
        args[i] = new Program.Value(null, Program.Value.TYPE_OBJECT, a);
      }
    }
    if (name instanceof Program.Function) {
      f = name;
    } else {
      f = this.context.global[name];
    }
    if (f != null) {
      if (f instanceof Program.Function) {
        try {
          res = new Program.FunctionCall(f.token, f, args).evaluate(this.context, true);
          this.checkStorage();
          return res;
        } catch (error) {
          err = error;
          console.error(err);
          if (this.context.location != null) {
            this.error_info = {
              error: err,
              line: this.context.location.token.line,
              column: this.context.location.token.column
            };
          }
          console.info("Error at line: " + this.context.location.token.line + " column: " + this.context.location.token.column);
          return this.checkStorage();
        }
      } else if (typeof f === "function") {
        try {
          res = f.apply(null, args);
          this.checkStorage();
          return res;
        } catch (error) {
          err = error;
          console.error(err);
          if (this.context.location != null) {
            this.error_info = {
              error: err,
              line: this.context.location.token.line,
              column: this.context.location.token.column
            };
          }
          console.info("Error at line: " + this.context.location.token.line + " column: " + this.context.location.token.column);
          return this.checkStorage();
        }
      }
    }
  };

  MicroVM.prototype.createStorageService = function() {
    var err, s;
    this.storage = {};
    try {
      s = localStorage.getItem("ms" + this.namespace);
      if (s) {
        this.storage = JSON.parse(s);
      }
    } catch (error) {
      err = error;
    }
    return {
      set: (function(_this) {
        return function(name, value) {
          value = _this.storableObject(value);
          if ((name != null) && (value != null)) {
            _this.storage[name] = value;
            _this.write_storage = true;
          }
          return value;
        };
      })(this),
      get: (function(_this) {
        return function(name) {
          if (name != null) {
            return _this.storage[name];
          } else {
            return 0;
          }
        };
      })(this)
    };
  };

  MicroVM.prototype.checkStorage = function() {
    var err;
    if (this.write_storage) {
      this.write_storage = false;
      try {
        return localStorage.setItem("ms" + this.namespace, JSON.stringify(this.storage));
      } catch (error) {
        err = error;
      }
    }
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
