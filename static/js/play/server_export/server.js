this.Player = (function() {
  function Player(listener) {
    this.listener = listener;
    this.source_count = 0;
    this.sources = {};
    this.resources = resources;
    this.request_id = 1;
    this.pending_requests = {};
    this.sources.main = server_code;
    setTimeout(((function(_this) {
      return function() {
        return _this.start();
      };
    })(this)), 1);
  }

  Player.prototype.start = function() {
    this.runtime = new Runtime("", this.sources, resources, this);
    this.terminal = new Terminal(this);
    this.terminal.start();
    this.runtime.start();
    return setInterval(((function(_this) {
      return function() {
        return _this.runtime.clock();
      };
    })(this)), 16);
  };

  Player.prototype.runCommand = function(cmd) {};

  Player.prototype.reportError = function(err) {
    return this.terminal.error(err);
  };

  Player.prototype.log = function(text) {
    return this.terminal.echo(text);
  };

  Player.prototype.exit = function() {};

  Player.prototype.call = function(name, args) {
    if ((this.runtime != null) && (this.runtime.vm != null)) {
      return this.runtime.vm.call(name, args);
    }
  };

  Player.prototype.setGlobal = function(name, value) {
    if ((this.runtime != null) && (this.runtime.vm != null)) {
      return this.runtime.vm.context.global[name] = value;
    }
  };

  Player.prototype.exec = function(command, callback) {
    if (this.runtime != null) {
      return this.runtime.runCommand(command, callback);
    }
  };

  Player.prototype.postMessage = function(message) {
    return console.info(JSON.stringify(message));
  };

  return Player;

})();

this.Terminal = (function() {
  function Terminal(runwindow) {
    this.runwindow = runwindow;
  }

  Terminal.prototype.start = function() {};

  Terminal.prototype.validateLine = function(v) {};

  Terminal.prototype.setTrailingCaret = function() {};

  Terminal.prototype.echo = function(text, scroll, classname) {
    if (scroll == null) {
      scroll = false;
    }
    return console.info(text);
  };

  Terminal.prototype.error = function(text, scroll) {
    if (scroll == null) {
      scroll = false;
    }
    return console.error(text);
  };

  Terminal.prototype.clear = function() {};

  return Terminal;

})();
