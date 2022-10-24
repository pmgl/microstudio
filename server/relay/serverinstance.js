this.ServerInstance = class ServerInstance {
  constructor(relay, id, session) {
    this.relay = relay;
    this.id = id;
    this.session = session;
    this.connected_clients = {};
    this.interval = setInterval((() => {
      return this.timer();
    }), 8);
    this.start_time = Date.now();
    this.time = 0;
    this.client_id = 1;
    this.session.register("mp_server_message", (msg) => {
      return this.message(msg);
    });
    this.session.disconnected = () => {
      var client, key, ref, results;
      this.relay.serverDisconnected(this);
      this.stop();
      ref = this.connected_clients;
      results = [];
      for (key in ref) {
        client = ref[key];
        results.push(client.socket.close());
      }
      return results;
    };
  }

  message(msg) {
    var client;
    client = this.connected_clients[msg.client_id];
    if (client != null) {
      return client.send({
        name: "mp_server_message",
        data: msg.data
      });
    }
  }

  stop() {
    return clearInterval(this.interval);
  }

  timer() {
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
  }

  clientConnection(clientsession) {
    clientsession.disconnected = () => {
      if (clientsession.client_id != null) {
        return delete this.connected_clients[clientsession.client_id];
      }
    };
    clientsession.client_id = this.client_id++;
    this.connected_clients[clientsession.client_id] = clientsession;
    clientsession.register("mp_client_message", (msg) => {
      return this.session.send({
        name: "mp_client_message",
        client_id: clientsession.client_id,
        data: msg.data
      });
    });
    clientsession.disconnected = () => {
      return this.session.send({
        name: "mp_client_disconnected",
        client_id: clientsession.client_id
      });
    };
    return this.session.send({
      name: "mp_client_connection",
      client_id: clientsession.client_id
    });
  }

};

module.exports = this.ServerInstance;
