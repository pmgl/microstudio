this.Runner = (function() {
  function Runner(microvm) {
    this.microvm = microvm;
  }

  Runner.prototype.run = function(program) {
    var res;
    res = new JSTranspiler(program).exec(this.microvm.context);
    return res;
  };

  Runner.prototype.call = function(name, args) {
    var f;
    if (name instanceof Program.Function) {
      f = name;
    } else {
      f = this.microvm.context.global[name];
    }
    if ((f != null) && typeof f === "function") {
      return f.apply(null, args);
    } else {
      return 0;
    }
  };

  return Runner;

})();
