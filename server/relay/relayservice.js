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
    return this.session.serverTokenCheck(msg.token, msg.server_id, () => {
      var instance;
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
    if (msg.server_id == null) {
      return;
    }
    server = RelayService.servers[msg.server_id];
    if (server != null) {
      return server.clientConnection(this.session);
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

};

this.RelayService.servers = {};

module.exports = this.RelayService;
