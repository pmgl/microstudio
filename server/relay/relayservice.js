var ServerInstance;

ServerInstance = require(__dirname + "/serverinstance.js");

this.RelayService = class RelayService {
  constructor(session) {
    this.session = session;
    this.session.register("mp_start_server", (msg) => {
      return this.startServer(msg);
    });
    this.session.register("mp_client_connection", (msg) => {
      return this.clientConnection(msg);
    });
    this.session.register("mp_server_status", (msg) => {
      return this.serverStatus(msg);
    });
  }

  startServer(msg) {
    if (msg.server_id == null) {
      return;
    }
    if (msg.token == null) {
      return;
    }
    return this.session.serverTokenCheck(msg.token, msg.server_id, (valid) => {
      var instance;
      if (!valid) {
        return this.session.socket.close();
      }
      instance = new ServerInstance(this, msg.server_id, this.session);
      return RelayService.servers[msg.server_id] = instance;
    });
  }

  serverDisconnected(server) {
    if (server === RelayService.servers[server.id]) {
      return delete RelayService.servers[server.id];
    }
  }

  clientConnection(msg) {
    var server;
    if (!this.canTryClientConnection()) {
      return this.session.socket.close();
    }
    if ((msg.server_id == null) || (msg.token == null)) {
      this.clientConnectionFailed();
      return this.session.socket.close();
    }
    server = RelayService.servers[msg.server_id];
    if (server != null) {
      return this.session.serverTokenCheck(msg.token, msg.server_id, (valid) => {
        if (!valid) {
          this.clientConnectionFailed();
          return this.session.socket.close();
        }
        return server.clientConnection(this.session);
      });
    } else {
      return this.session.socket.close();
    }
  }

  serverStatus(msg) {
    var server;
    if (msg.server_id == null) {
      return;
    }
    server = RelayService.servers[msg.server_id];
    return this.session.send({
      name: "mp_server_status",
      server_id: msg.server_id,
      running: server != null
    });
  }

  canTryClientConnection() {
    var entry, now;
    now = Date.now();
    entry = RelayService.client_failures[this.session.socket.remoteAddress];
    if (entry == null) {
      return true;
    }
    if (now - entry.time > 60000) {
      delete RelayService.client_failures[this.session.socket.remoteAddress];
      return true;
    }
    return entry.count < 5;
  }

  clientConnectionFailed() {
    var entry, now;
    now = Date.now();
    entry = RelayService.client_failures[this.session.socket.remoteAddress];
    if ((entry == null) || (now - entry.time > 60000)) {
      return RelayService.client_failures[this.session.socket.remoteAddress] = {
        count: 1,
        time: now
      };
    } else {
      entry.count += 1;
      return entry.time = now;
    }
  }

};

this.RelayService.servers = {};

this.RelayService.client_failures = {};

module.exports = this.RelayService;
