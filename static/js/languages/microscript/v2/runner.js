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
    this.thread_index = 0;
    this.microvm.context.global.print = this.microvm.context.meta.print;
    return this.microvm.context.global.random = new Random(0);
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
    var compiler, parser, program, res, src;
    if (this.microvm.context.global[name] != null) {
      src = name + "()";
      parser = new Parser(src, "");
      parser.parse();
      program = parser.program;
      compiler = new Compiler(program);
      return res = compiler.exec(this.microvm.context);
    } else {
      return 0;
    }
  };

  Runner.prototype.tick = function() {
    var time;
    return time = Date.now();
  };

  return Runner;

})();

this.Thread = (function() {
  function Thread() {
    this.status = 0;
    this.loop = false;
    this.processor = new Processor();
    this.terminated = false;
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

  Thread.prototype.getInterface = function() {
    return {
      stop: (function(_this) {
        return function() {
          return _this.stop();
        };
      })(this),
      resume: (function(_this) {
        return function() {
          return _this.resume();
        };
      })(this)
    };
  };

  return Thread;

})();
