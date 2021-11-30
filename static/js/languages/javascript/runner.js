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
      src += key + " =  window.ctx." + key + ";\n";
    }
    return this.run(src);
  };

  Runner.prototype.run = function(program) {
    var err, f, res;
    if (!this.initialized) {
      this.init();
    }
    console.info(program);
    try {
      f = function() {
        return eval(program);
      };
      return res = f.call(this.microvm.context.global);
    } catch (error) {
      err = error;
      throw err.toString();
    }
  };

  Runner.prototype.call = function(name, args) {
    var err;
    try {
      if (window[name] != null) {
        return window[name].apply(this.microvm.context.global, args);
      }
    } catch (error) {
      err = error;
      throw err.toString();
    }
  };

  return Runner;

})();
