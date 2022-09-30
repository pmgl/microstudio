this.MPServer = class MPServer {
  constructor() {
    var impl;
    impl = new MPServerImpl(this);
    this.send = function(data) {
      return impl.sendMessage(data);
    };
    this.new_connections = [];
    this.active_connections = [];
    this.closed_connections = [];
    this.messages_received = [];
    player.runtime.addServer(impl);
  }

};

this.MPServerImpl = class MPServerImpl {
  constructor(_interface) {
    var err;
    this.interface = _interface;
    this.interface.status = "starting";
    this.reconnect_delay = 1000;
    this.clients = {};
    this.clients_connected = [];
    this.clients_disconnected = {};
    try {
      this.connect();
    } catch (error) {
      err = error;
      console.error(err);
    }
  }

  connect() {
    this.socket = new WebSocket("ws://localhost:8080");
    this.socket.onmessage = (msg) => {
      var err;
      try {
        msg = JSON.parse(msg.data);
        switch (msg.name) {
          case "mp_update":
            this.interface.status = "running";
            return player.runtime.timer();
          case "mp_client_connection":
            return this.clientConnected(msg);
          case "mp_client_message":
            return this.clientMessage(msg);
          case "mp_client_disconnected":
            return this.clientDisconnected(msg);
        }
      } catch (error) {
        err = error;
        return console.error(err);
      }
    };
    this.socket.onopen = () => {
      this.reconnect_delay = 1000;
      return this.send({
        name: "mp_start_server",
        server_id: "user/project"
      });
    };
    return this.socket.onclose = () => {
      setTimeout((() => {
        return this.connect();
      }), this.reconnect_delay);
      return this.reconnect_delay += 1000;
    };
  }

  clientConnected(msg) {
    var client;
    if (msg.client_id == null) {
      return;
    }
    client = new MPClient(this, msg.client_id);
    this.clients_connected.push(client);
    return this.clients[msg.client_id] = client;
  }

  clientMessage(msg) {
    var client;
    if (msg.client_id == null) {
      return;
    }
    client = this.clients[msg.client_id];
    if (client != null) {
      return client.message(msg.data);
    }
  }

  clientDisconnected(msg) {
    var client;
    if (msg.client_id == null) {
      return;
    }
    client = this.clients[msg.client_id];
    delete this.clients[msg.client_id];
    if (client != null) {
      return this.clients_disconnected[client.client_id] = true;
    }
  }

  sendMessage(data) {
    return this.send({
      name: "mp_server_message",
      data: data
    });
  }

  send(data) {
    return this.socket.send(JSON.stringify(data));
  }

  update() {
    var c, client, closed_connections, connection, i, id, j, k, l, len, len1, len2, m, messages, n, new_connections, ref, ref1, ref2, ref3, ref4;
    new_connections = [];
    closed_connections = [];
    for (i = j = ref = this.interface.active_connections.length - 1; j >= 0; i = j += -1) {
      c = this.interface.active_connections[i];
      if (this.clients_disconnected[c.id]) {
        this.interface.active_connections.splice(i, 1);
        closed_connections.push(c);
      }
    }
    ref1 = this.clients_connected;
    for (k = 0, len = ref1.length; k < len; k++) {
      c = ref1[k];
      new_connections.push(c.interface);
      this.interface.active_connections.push(c.interface);
    }
    this.interface.new_connections = new_connections;
    this.interface.closed_connections = closed_connections;
    this.clients_disconnected = {};
    this.clients_connected = [];
    ref2 = this.clients;
    for (id in ref2) {
      client = ref2[id];
      client.update();
    }
    messages = [];
    ref3 = this.interface.active_connections;
    for (l = 0, len1 = ref3.length; l < len1; l++) {
      connection = ref3[l];
      ref4 = connection.messages;
      for (n = 0, len2 = ref4.length; n < len2; n++) {
        m = ref4[n];
        messages.push(m);
      }
    }
    this.interface.messages = messages;
  }

};

this.MPClient = class MPClient {
  constructor(server, client_id) {
    this.server = server;
    this.client_id = client_id;
    this.interface = {
      id: this.client_id,
      status: "connected",
      messages_received: [],
      send: (data) => {
        return this.sendMessage(data);
      }
    };
    this.message_buffer = [];
  }

  sendMessage(data) {
    return this.server.send({
      name: "mp_server_message",
      client_id: this.client_id,
      data: data
    });
  }

  message(msg) {
    return this.message_buffer.push(msg);
  }

  disconnected() {
    return this.interface.status = "disconnected";
  }

  update() {
    var j, len, m, messages, ref;
    messages = [];
    ref = this.message_buffer;
    for (j = 0, len = ref.length; j < len; j++) {
      m = ref[j];
      messages.push({
        connection: this.interface,
        data: m
      });
    }
    this.interface.messages = messages;
    return this.message_buffer = [];
  }

};
