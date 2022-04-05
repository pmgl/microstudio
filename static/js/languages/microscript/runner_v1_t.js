this.Runner = (function() {
  function Runner(microvm) {
    this.microvm = microvm;
  }

  Runner.prototype.run = function(src) {
    var err, parser, program, res;
    parser = new Parser(src);
    parser.parse();
    if (parser.error_info != null) {
      err = parser.error_info;
      err.type = "compile";
      throw err;
    }
    program = parser.program;
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

  Runner.prototype.toString = function(obj) {
    return Program.toString(obj);
  };

  return Runner;

})();
