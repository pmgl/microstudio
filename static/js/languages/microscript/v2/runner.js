this.Runner = (function() {
  function Runner(microvm) {
    this.microvm = microvm;
  }

  Runner.prototype.init = function() {
    this.initialized = true;
    this.system = this.microvm.context.global.system;
    this.system.preemptive = 1;
    this.main_thread = new Thread;
    this.threads = [this.main_thread];
    return this.microvm.context.global.print = this.microvm.context.meta.print;
  };

  Runner.prototype.run = function(src, filename) {
    var compiler, err, parser, program, res, time;
    if (!this.initialized) {
      this.init();
    }
    parser = new Parser(src, filename);
    parser.parse();
    if (parser.error_info != null) {
      err = parser.error_info;
      err.type = "compile";
      throw err;
    }
    program = parser.program;
    compiler = new Compiler(program);
    time = Date.now();
    res = compiler.exec(this.microvm.context);
    time = Date.now() - time;
    console.info("exec time: " + time + " ms");
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

this.Thread = (function() {
  function Thread() {
    this.status = 0;
    this.loop = false;
    this.processor = new Processor();
  }

  Thread.prototype.start = function() {
    return this.status = "started";
  };

  Thread.prototype.pause = function() {
    if (this.status === "started") {
      return this.status = "paused";
    }
  };

  Thread.prototype.resume = function() {
    if (this.status === "paused") {
      return this.status = "resume";
    }
  };

  Thread.prototype.stop = function() {
    return this.status = "stopped";
  };

  return Thread;

})();
