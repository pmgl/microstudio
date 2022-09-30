this.MPServerConnection = class MPServerConnection {
  constructor() {
    var impl;
    this.status = "connecting";
    impl = new MPServerConnectionImpl(this);
    this.send = (data) => {
      return impl.sendMessage(data);
    };
    this.messages = [];
  }

};

this.MPServerConnectionImpl = class MPServerConnectionImpl {
  constructor(_interface) {
    var err, reconnect_delay;
    this.interface = _interface;
    this.status = "connecting";
    reconnect_delay = 1000;
    try {
      this.connect();
    } catch (error) {
      err = error;
      console.error(err);
    }
    this.messages = [];
    player.runtime.addConnection(this);
  }

  connect() {
    this.socket = new WebSocket("ws://localhost:8080");
    this.socket.onmessage = (msg) => {
      var err;
      console.info("received: " + msg.data);
      try {
        msg = JSON.parse(msg.data);
        switch (msg.name) {
          case "mp_server_message":
            return this.messages.push(msg.data);
        }
      } catch (error) {
        err = error;
        return console.error(err);
      }
    };
    this.socket.onopen = () => {
      this.interface.status = "connected";
      this.reconnect_delay = 1000;
      return this.send({
        name: "mp_client_connection",
        server_id: "user/project"
      });
    };
    return this.socket.onclose = () => {
      this.interface.status = "connecting";
      setTimeout((() => {
        return this.connect();
      }), this.reconnect_delay);
      return this.reconnect_delay += 1000;
    };
  }

  update() {
    this.interface.messages = this.messages;
    return this.messages = [];
  }

  sendMessage(data) {
    return this.send({
      name: "mp_client_message",
      data: data
    });
  }

  send(data) {
    return this.socket.send(JSON.stringify(data));
  }

};
