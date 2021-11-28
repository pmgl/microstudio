this.Runner = (function() {
  function Runner(microvm) {
    this.microvm = microvm;
  }

  Runner.prototype.init = function() {
    var key, src;
    this.initialized = true;
    window.ctx = this.microvm.context.global;
    src = "";
    for (key in this.microvm.context.global) {
      src += key + " =  window.ctx." + key + "\n";
    }
    window.stdout = {
      write: (function(_this) {
        return function(text) {
          return _this.microvm.context.meta.print(text);
        };
      })(this)
    };
    window.stderr = {
      write: (function(_this) {
        return function(text) {
          return console.error(text);
        };
      })(this)
    };
    src += "import sys\n\nsys.stdout = window.stdout\n\nsys.stderr = window.stderr\n";
    return this.run(src);
  };

  Runner.prototype.run = function(program) {
    var res;
    if (!this.initialized) {
      this.init();
    }
    res = python(program);
    program = "if \"draw\" in globals():\n  window.draw = draw\n\nif \"update\" in globals():\n  window.update = update\n\nif \"init\" in globals():\n  window.init = init";
    python(program);
    return res;
  };

  Runner.prototype.call = function(name, args) {
    var prg, res, time;
    if ((name === "draw" || name === "update" || name === "init") && typeof window[name] === "function") {
      return window[name]();
    } else {
      return;
    }
    time = Date.now();
    prg = "try:\n  " + name + "(" + (args.join(",")) + ")\nexcept NameError:\n  0";
    res = python(prg);
    console.info("calling " + name + " took: " + (Date.now() - time) + " ms");
    return res;
  };

  return Runner;

})();
