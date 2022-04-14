this.Runner = (function() {
  function Runner(microvm) {
    this.microvm = microvm;
  }

  Runner.prototype.init = function() {
    var kd, key, src;
    this.initialized = true;
    window.ctx = this.microvm.context.global;
    window.ctx.print = (function(_this) {
      return function(text) {
        return _this.microvm.context.meta.print(text);
      };
    })(this);
    src = "js = require 'js'";
    for (key in this.microvm.context.global) {
      kd = key;
      src += kd + " =  js.global.ctx." + key + "\n";
    }
    src += "print = function(text) js.global.ctx:print(text) end\n";
    src += "new = js.new\n";
    return this.run(src);
  };

  Runner.prototype.run = function(program, name) {
    var err, line, res;
    if (name == null) {
      name = "";
    }
    if (!this.initialized) {
      this.init();
    }
    try {
      res = fengari.load(program, name)();
    } catch (error) {
      err = error;
      line = err.toString().split("]:")[1];
      if (line != null) {
        line = line.split(":")[0] || 1;
      } else {
        line = 0;
      }
      this.microvm.context.location = {
        token: {
          line: line,
          column: 0
        }
      };
      throw err.toString();
    }
    return res;
  };

  Runner.prototype.call = function(name, args) {
    var err, file, line, res;
    try {
      res = fengari.load("if " + name + " then " + name + "() end")();
      return res;
    } catch (error) {
      err = error;
      line = err.toString().split("]:")[1];
      if (line != null) {
        line = line.split(":")[0] || 1;
      } else {
        line = 0;
      }
      file = err.toString().split('"')[1] || "";
      this.microvm.context.location = {
        token: {
          line: line,
          column: 0,
          file: file
        }
      };
      throw err.toString();
    }
  };

  Runner.prototype.toString = function(obj) {
    if (obj != null) {
      return obj.toString();
    } else {
      return "nil";
    }
  };

  return Runner;

})();
