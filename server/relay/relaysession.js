var RelayService;

RelayService = require(__dirname + "/relayservice.js");

this.RelaySession = class RelaySession {
  constructor(server, socket) {
    this.server = server;
    this.socket = socket;
    this.socket.on("message", (msg) => {
      this.messageReceived(msg);
      return this.last_active = Date.now();
    });
    this.socket.on("close", () => {
      this.server.sessionClosed(this);
      return this.disconnected();
    });
    this.socket.on("error", (err) => {
      console.error("WS ERROR");
      return console.error(err);
    });
    this.commands = {};
    this.relay_service = new RelayService(this);
  }

  register(name, callback) {
    return this.commands[name] = callback;
  }

  disconnected() {}

  messageReceived(msg) {
    var c, err;
    if (typeof msg !== "string") {
      return this.bufferReceived(msg);
    }
    try {
      //console.info msg
      msg = JSON.parse(msg);
      if (msg.name != null) {
        c = this.commands[msg.name];
        if (c != null) {
          return c(msg);
        }
      }
    } catch (error) {
      err = error;
      return console.info(err);
    }
  }

  send(data) {
    return this.socket.send(JSON.stringify(data));
  }

  serverTokenCheck(token, server_id, callback) {
    return this.server.serverTokenCheck(token, server_id, callback);
  }

};

module.exports = this.RelaySession;
