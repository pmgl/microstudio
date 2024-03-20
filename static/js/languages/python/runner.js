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
          var f, file, i, len, line, t;
          if (Array.isArray(text)) {
            line = 1;
            file = "";
            for (i = 0, len = text.length; i < len; i++) {
              t = text[i];
              f = t.split("File");
              if (f[1] != null) {
                f = f[1].split('"');
                if ((f[1] != null) && f[1].length > 0) {
                  file = f[1];
                }
              }
              t = t.split(" line ");
              if (t[1] != null) {
                line = t[1].split("\n")[0].split(",")[0];
              }
            }
            _this.microvm.context.location = {
              token: {
                file: file,
                line: line,
                column: 0,
                error_text: text[text.length - 1].replace("\n", "")
              }
            };
            throw text[text.length - 1].replace("\n", "");
          } else {
            throw text;
          }
        };
      })(this)
    };
    src += "import sys\n\nsys.stdout = window.stdout\n\nsys.stderr = window.stderr\n\n";
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
    try {
      res = python(program, name);
      program = "import traceback\nimport sys\n\ndef __draw():\n  try:\n    draw()\n  except BaseException as err:\n    sys.stderr.write(traceback.format_exception(err))\n\n  except Error as err:\n    sys.stderr.write(traceback.format_exception(err))\n\ndef __update():\n  try:\n    update()\n  except BaseException as err:\n    sys.stderr.write(traceback.format_exception(err))\n\n  except Error as err:\n    sys.stderr.write(traceback.format_exception(err))\n\ndef __init():\n  try:\n    init()\n  except BaseException as err:\n    sys.stderr.write(traceback.format_exception(err))\n\n  except Error as err:\n    sys.stderr.write(traceback.format_exception(err))\n\ndef __serverInit():\n  try:\n    serverInit()\n  except BaseException as err:\n    sys.stderr.write(traceback.format_exception(err))\n\n  except Error as err:\n    sys.stderr.write(traceback.format_exception(err))\n\ndef __serverUpdate():\n  try:\n    serverUpdate()\n  except BaseException as err:\n    sys.stderr.write(traceback.format_exception(err))\n\n  except Error as err:\n    sys.stderr.write(traceback.format_exception(err))\n\nif \"draw\" in globals():\n  window.draw = __draw\n\nif \"update\" in globals():\n  window.update = __update\n\nif \"init\" in globals():\n  window.init = __init\n\nif \"serverInit\" in globals():\n  window.serverInit = __serverInit\n\nif \"serverUpdate\" in globals():\n  window.serverUpdate = __serverUpdate\n";
      python(program, "__init__");
      return res;
    } catch (error) {
      err = error;
      throw err.toString();
    }
  };

  Runner.prototype.call = function(name, args) {
    var err;
    if ((name === "draw" || name === "update" || name === "init" || name === "serverInit" || name === "serverUpdate") && typeof window[name] === "function") {
      try {
        return window[name]();
      } catch (error) {
        err = error;
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
