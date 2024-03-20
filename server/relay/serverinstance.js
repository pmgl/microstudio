this.ServerInstance = (function() {
  function ServerInstance(relay, id, session) {
    this.relay = relay;
    this.id = id;
    this.session = session;
    this.connected_clients = {};
    this.interval = setInterval(((function(_this) {
      return function() {
        return _this.timer();
      };
    })(this)), 8);
    this.start_time = Date.now();
    this.time = 0;
    this.client_id = 1;
    this.session.register("mp_server_message", (function(_this) {
      return function(msg) {
        return _this.message(msg);
      };
    })(this));
    this.session.register("mp_disconnect_client", (function(_this) {
      return function(msg) {
        return _this.disconnectClient(msg);
      };
    })(this));
    this.session.disconnected = (function(_this) {
      return function() {
        var client, key, ref, results;
        _this.relay.serverDisconnected(_this);
        _this.stop();
        ref = _this.connected_clients;
        results = [];
        for (key in ref) {
          client = ref[key];
          results.push(client.socket.close());
        }
        return results;
      };
    })(this);
  }

  ServerInstance.prototype.message = function(msg) {
    var client;
    client = this.connected_clients[msg.client_id];
    if (client != null) {
      return client.send({
        name: "mp_server_message",
        data: msg.data
      });
    }
  };

  ServerInstance.prototype.disconnectClient = function(msg) {
    var client, err;
    client = this.connected_clients[msg.client_id];
    if (client != null) {
      try {
        return client.socket.close();
      } catch (error) {
        err = error;
        return console.error(err);
      }
    }
  };

  ServerInstance.prototype.stop = function() {
    return clearInterval(this.interval);
  };

  ServerInstance.prototype.timer = function() {
    var t;
    t = Date.now() - this.start_time;
    if (t > this.time + 100) {
      this.time = t - 1001 / 60;
    }
    if (t > this.time + 1000 / 60) {
      this.time += 1000 / 60;
      return this.session.send({
        name: "mp_update"
      });
    }
  };

  ServerInstance.prototype.clientConnection = function(clientsession) {
    clientsession.disconnected = (function(_this) {
      return function() {
        if (clientsession.client_id != null) {
          return delete _this.connected_clients[clientsession.client_id];
        }
      };
    })(this);
    clientsession.client_id = this.client_id++;
    this.connected_clients[clientsession.client_id] = clientsession;
    clientsession.register("mp_client_message", (function(_this) {
      return function(msg) {
        return _this.session.send({
          name: "mp_client_message",
          client_id: clientsession.client_id,
          data: msg.data
        });
      };
    })(this));
    clientsession.disconnected = (function(_this) {
      return function() {
        return _this.session.send({
          name: "mp_client_disconnected",
          client_id: clientsession.client_id
        });
      };
    })(this);
    return this.session.send({
      name: "mp_client_connection",
      client_id: clientsession.client_id
    });
  };

  return ServerInstance;

})();

module.exports = this.ServerInstance;
