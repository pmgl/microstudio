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
    var f;
    if (!this.initialized) {
      this.init();
    }
    console.info(program);
    f = function() {
      return eval(program);
    };
    return f.call(this.microvm.context.global);
  };

  Runner.prototype.call = function(name, args) {
    var f;
    f = function() {
      return eval("if (typeof " + name + " != \"undefined\") " + name + "() ;");
    };
    return f.call(this.microvm.context.global);
  };

  return Runner;

})();
