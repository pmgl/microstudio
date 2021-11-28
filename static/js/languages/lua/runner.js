this.Runner = (function() {
  function Runner(microvm) {
    this.microvm = microvm;
  }

  Runner.prototype.init = function() {
    var key, src;
    this.initialized = true;
    window.ctx = this.microvm.context.global;
    window.ctx.print = this.microvm.context.meta.print;
    src = "js = require 'js'";
    for (key in this.microvm.context.global) {
      src += key + " =  js.global.ctx." + key + "\n";
    }
    return this.run(src);
  };

  Runner.prototype.run = function(program) {
    var res;
    if (!this.initialized) {
      this.init();
    }
    res = fengari.load(program)();
    return res;
  };

  Runner.prototype.call = function(name, args) {
    var res;
    res = fengari.load("if " + name + " then " + name + "() end")();
    return res;
  };

  return Runner;

})();
