this.Player = class Player {
  constructor(listener) {
    this.listener = listener;
    //src = document.getElementById("code").innerText
    this.source_count = 0;
    this.sources = {};
    this.resources = resources;
    this.request_id = 1;
    this.pending_requests = {};
    this.sources.main = server_code;
    // player = new Player() must return before the server is started
    // to ensure global.player is defined
    setTimeout((() => {
      return this.start();
    }), 1);
  }

  start() {
    this.runtime = new Runtime("", this.sources, resources, this);
    this.terminal = new Terminal(this);
    this.terminal.start();
    this.runtime.start();
    return setInterval((() => {
      return this.runtime.clock();
    }), 16);
  }

  runCommand(cmd) {}

  reportError(err) {
    return this.terminal.error(err);
  }

  log(text) {
    return this.terminal.echo(text);
  }

  exit() {}

  call(name, args) {
    if ((this.runtime != null) && (this.runtime.vm != null)) {
      return this.runtime.vm.call(name, args);
    }
  }

  setGlobal(name, value) {
    if ((this.runtime != null) && (this.runtime.vm != null)) {
      return this.runtime.vm.context.global[name] = value;
    }
  }

  exec(command, callback) {
    if (this.runtime != null) {
      return this.runtime.runCommand(command, callback);
    }
  }

  postMessage(message) {
    return console.info(JSON.stringify(message));
  }

};

this.Terminal = class Terminal {
  constructor(runwindow) {
    this.runwindow = runwindow;
  }

  start() {}

  validateLine(v) {}

  setTrailingCaret() {}

  echo(text, scroll = false, classname) {
    return console.info(text);
  }

  error(text, scroll = false) {
    return console.error(text);
  }

  clear() {}

};
