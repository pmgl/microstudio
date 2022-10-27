this.MPServerConnection = class MPServerConnection {
  constructor() {
    var impl;
    this.status = "connecting";
    impl = new MPServerConnectionImpl(this);
    this.send = (data) => {
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
    this.close = () => {
      var err;
      try {
        return impl.close();
      } catch (error) {
        err = error;
        return console.error(err);
      }
    };
    this.messages = [];
  }

};

this.MPServerConnectionImpl = class MPServerConnectionImpl {
  constructor(_interface) {
    var err;
    this.interface = _interface;
    this.status = "connecting";
    this.buffer = [];
    try {
      this.getRelay((address) => {
        return this.connect(address);
      });
    } catch (error) {
      err = error;
      console.error(err);
    }
    this.messages = [];
    player.runtime.addConnection(this);
  }

  getRelay(callback) {
    return player.client.sendRequest({
      name: "get_relay_server"
    }, (msg) => {
      var address;
      if (msg.name === "error") {
        this.interface.status = "error";
        return this.interface.error = msg.error;
      } else {
        address = msg.address;
        if (address === "self") {
          address = location.origin.replace("http", "ws");
        }
        return callback(address);
      }
    });
  }

  connect(address) {
    this.socket = new WebSocket(address);
    this.socket.onmessage = (msg) => {
      var err;
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
      var i, len, m, ref;
      this.interface.status = "connected";
      this.send({
        name: "mp_client_connection",
        server_id: ms_project_id
      });
      ref = this.buffer;
      for (i = 0, len = ref.length; i < len; i++) {
        m = ref[i];
        this.sendMessage(m);
      }
      return this.buffer = [];
    };
    return this.socket.onclose = () => {
      return this.interface.status = "disconnected";
    };
  }

  update() {
    if (this.messages.length > 0 || this.interface.messages.length > 0) {
      this.interface.messages = this.messages;
      return this.messages = [];
    }
  }

  sendMessage(data) {
    if ((this.socket != null) && this.socket.readyState === 1) {
      return this.send({
        name: "mp_client_message",
        data: data
      });
    } else {
      return this.buffer.push(data);
    }
  }

  send(data) {
    return this.socket.send(JSON.stringify(data));
  }

  close() {
    return this.socket.close();
  }

};
