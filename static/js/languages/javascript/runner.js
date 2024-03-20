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
    src = "";
    for (key in this.microvm.context.global) {
      kd = key;
      if (key === "Image") {
        kd = "msImage";
      }
      if (key === "Map") {
        kd = "msMap";
      }
      src += kd + " =  window.ctx." + key + ";\n";
    }
    return this.run(src);
  };

  Runner.prototype.run = function(program, name) {
    var err, file, line;
    if (name == null) {
      name = "";
    }
    if (!this.initialized) {
      this.init();
    }
    program += "\n//# sourceURL=" + name + ".js";
    try {
      return window["eval"](program);
    } catch (error) {
      err = error;
      if (err.stack != null) {
        line = err.stack.split(".js:");
        file = line[0];
        line = line[1];
        if ((file != null) && (line != null)) {
          line = line.split(":")[0];
          if (file.lastIndexOf("(") >= 0) {
            file = file.substring(file.lastIndexOf("(") + 1);
          }
          if (file.lastIndexOf("@") >= 0) {
            file = file.substring(file.lastIndexOf("@") + 1);
          }
          this.microvm.context.location = {
            token: {
              line: line,
              column: 0
            }
          };
        }
      }
      throw err.message;
    }
  };

  Runner.prototype.call = function(name, args) {
    var err, file, line;
    try {
      if (window[name] != null) {
        return window[name].apply(this.microvm.context.global, args);
      }
    } catch (error) {
      err = error;
      if (err.stack != null) {
        line = err.stack.split(".js:");
        file = line[0];
        line = line[1];
        if ((file != null) && (line != null)) {
          line = line.split(":")[0];
          if (file.lastIndexOf("(") >= 0) {
            file = file.substring(file.lastIndexOf("(") + 1);
          }
          if (file.lastIndexOf("@") >= 0) {
            file = file.substring(file.lastIndexOf("@") + 1);
          }
          this.microvm.context.location = {
            token: {
              line: line,
              file: file,
              column: 0
            }
          };
        }
      }
      throw err.message;
    }
  };

  Runner.prototype.toString = function(obj) {
    if (obj != null) {
      return obj.toString();
    } else {
      return "null";
    }
  };

  return Runner;

})();
