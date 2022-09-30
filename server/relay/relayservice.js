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
  }

  startServer(msg) {
    var instance;
    if (msg.server_id == null) {
      return;
    }
    instance = new ServerInstance(this.session);
    return RelayService.servers[msg.server_id] = instance;
  }

  clientConnection(msg) {
    var server;
    console.info(JSON.stringify(msg));
    if (msg.server_id == null) {
      return;
    }
    server = RelayService.servers[msg.server_id];
    if (server != null) {
      console.info("server found");
      return server.clientConnection(this.session);
    }
  }

};

this.RelayService.servers = {};

module.exports = this.RelayService;
