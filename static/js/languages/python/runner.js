this.Runner = (function() {
  function Runner(microvm) {
    this.microvm = microvm;
  }

  Runner.prototype.init = function() {
    var kd, key, src;
    this.initialized = true;
    window.ctx = this.microvm.context.global;
    src = "";
    for (key in this.microvm.context.global) {
      kd = key;
      src += kd + " =  window.ctx." + key + "\n";
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
          var i, len, line, t;
          if (Array.isArray(text)) {
            line = 1;
            for (i = 0, len = text.length; i < len; i++) {
              t = text[i];
              t = t.split(" line ");
              if (t[1] != null) {
                line = t[1].split("\n")[0].split(",")[0];
              }
            }
            _this.microvm.context.location = {
              token: {
                line: line,
                column: 0
              }
            };
            throw text[text.length - 1].replace("\n", "");
          } else {
            throw text;
          }
        };
      })(this)
    };
    src += "import sys\n\nsys.stdout = window.stdout\n\nsys.stderr = window.stderr\n\n\ndef __reportError(err):\n  window.reportError(err)";
    return this.run(src);
  };

  Runner.prototype.run = function(program, name) {
    var err, res;
    if (name == null) {
      name = "";
    }
    if (!this.initialized) {
      this.init();
    }
    window.__reportError = (function(_this) {
      return function(err) {
        return console.info("plop");
      };
    })(this);
    console.log = function(err, error) {
      console.info("ploum");
      console.info(err);
      return console.info(error);
    };
    try {
      res = python(program);
      program = "import traceback\nimport sys\n\ndef __draw():\n  try:\n    draw()\n  except BaseException as err:\n    sys.stderr.write(traceback.format_exception(err))\n\n  except Error as err:\n    sys.stderr.write(traceback.format_exception(err))\n\ndef __update():\n  try:\n    update()\n  except BaseException as err:\n    sys.stderr.write(traceback.format_exception(err))\n\n  except Error as err:\n    sys.stderr.write(traceback.format_exception(err))\n\ndef __init():\n  try:\n    init()\n  except BaseException as err:\n    sys.stderr.write(traceback.format_exception(err))\n\n  except Error as err:\n    sys.stderr.write(traceback.format_exception(err))\n\nif \"draw\" in globals():\n  window.draw = __draw\n\nif \"update\" in globals():\n  window.update = __update\n\nif \"init\" in globals():\n  window.init = __init";
      python(program);
      return res;
    } catch (error1) {
      err = error1;
      throw err.toString();
    }
  };

  Runner.prototype.call = function(name, args) {
    var err;
    if ((name === "draw" || name === "update" || name === "init") && typeof window[name] === "function") {
      try {
        return window[name]();
      } catch (error1) {
        err = error1;
        throw err.toString();
      }
    } else {

    }
  };

  Runner.prototype.toString = function(obj) {
    if (obj != null) {
      return obj.toString();
    } else {
      return "none";
    }
  };

  return Runner;

})();
