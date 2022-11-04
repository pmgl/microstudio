var WebSocket;

WebSocket = require("ws");

this.MPServer = class MPServer {
  constructor() {
    var impl;
    impl = new MPServerImpl(this);
    this.send = function(data) {
      var err;
      try {
        impl.sendMessage(data);
        return "sent";
      } catch (error) {
        err = error;
        console.error(err);
        return err.toString();
      }
    };
    this.close = function() {
      var err;
      try {
        return impl.close();
      } catch (error) {
        err = error;
        return console.error(err);
      }
    };
    this.new_connections = [];
    this.active_connections = [];
    this.closed_connections = [];
    this.messages = [];
    player.runtime.addServer(impl);
  }

};

this.MPServerImpl = class MPServerImpl {
  constructor(_interface) {
    this.interface = _interface;
    this.interface.status = "starting";
    this.reconnect_delay = 1000;
    this.clients = {};
    this.clients_connected = [];
    this.clients_disconnected = {};
    this.client_id = 1;
    this.start();
  }

  start() {
    var err;
    try {
      this.server = new WebSocket.Server({
        port: server_port
      });
      return this.server.on("connection", (socket, request) => {
        return this.clientConnected(socket);
      });
    } catch (error) {
      err = error;
      return console.error(err);
    }
  }

  clientConnected(socket) {
    var client;
    client = new MPClient(this, socket, this.client_id);
    this.clients_connected.push(client);
    this.clients[this.client_id] = client;
    return this.client_id++;
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

  clientDisconnected(client) {
    delete this.clients[client.client_id];
    return this.clients_disconnected[client.client_id] = true;
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

  close() {
    return this.socket.close();
  }

};

this.MPClient = class MPClient {
  constructor(server, socket1, client_id) {
    this.server = server;
    this.socket = socket1;
    this.client_id = client_id;
    this.interface = {
      id: this.client_id,
      status: "connected",
      messages: [],
      send: (data) => {
        return this.sendMessage(data);
      },
      disconnect: () => {
        return this.disconnect();
      }
    };
    this.message_buffer = [];
    this.socket.onmessage = (msg) => {
      var err;
      try {
        // console.info msg.data
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
            return this.disconnected();
        }
      } catch (error) {
        err = error;
        return console.error(err);
      }
    };
    this.socket.onclose = () => {
      return this.server.clientDisconnected(this);
    };
  }

  clientConnected(msg) {}

  clientMessage(msg) {
    return this.message_buffer.push(msg.data);
  }

  sendMessage(data) {
    var err;
    try {
      return this.socket.send(JSON.stringify({
        name: "mp_server_message",
        data: data
      }));
    } catch (error) {
      err = error;
      return console.error(err);
    }
  }

  disconnect() {
    var err;
    try {
      return this.socket.close();
    } catch (error) {
      err = error;
      return console.error(err);
    }
  }

  message(msg) {
    return this.message_buffer.push(msg.data);
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
