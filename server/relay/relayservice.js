var ServerInstance;

ServerInstance = require(__dirname + "/serverinstance.js");

this.RelayService = (function() {
  function RelayService(session) {
    this.session = session;
    this.session.register("mp_start_server", (function(_this) {
      return function(msg) {
        return _this.startServer(msg);
      };
    })(this));
    this.session.register("mp_client_connection", (function(_this) {
      return function(msg) {
        return _this.clientConnection(msg);
      };
    })(this));
    this.session.register("mp_server_status", (function(_this) {
      return function(msg) {
        return _this.serverStatus(msg);
      };
    })(this));
  }

  RelayService.prototype.startServer = function(msg) {
    if (msg.server_id == null) {
      return;
    }
    if (msg.token == null) {
      return;
    }
    return this.session.serverTokenCheck(msg.token, msg.server_id, (function(_this) {
      return function() {
        var instance;
        instance = new ServerInstance(_this, msg.server_id, _this.session);
        return RelayService.servers[msg.server_id] = instance;
      };
    })(this));
  };

  RelayService.prototype.serverDisconnected = function(server) {
    if (server === RelayService.servers[server.id]) {
      return delete RelayService.servers[server.id];
    }
  };

  RelayService.prototype.clientConnection = function(msg) {
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
  };

  RelayService.prototype.serverStatus = function(msg) {
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
  };

  return RelayService;

})();

this.RelayService.servers = {};

module.exports = this.RelayService;
