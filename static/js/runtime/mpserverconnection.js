this.MPServerConnection = (function() {
  function MPServerConnection(address) {
    var impl;
    this.status = "connecting";
    impl = new MPServerConnectionImpl(this, address);
    this.send = (function(_this) {
      return function(data) {
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
    })(this);
    this.close = (function(_this) {
      return function() {
        var err;
        try {
          return impl.close();
        } catch (error) {
          err = error;
          return console.error(err);
        }
      };
    })(this);
    this.messages = [];
  }

  return MPServerConnection;

})();

this.MPServerConnectionImpl = (function() {
  function MPServerConnectionImpl(_interface, address1) {
    var err;
    this["interface"] = _interface;
    this.address = address1;
    this.status = "connecting";
    this.buffer = [];
    if (this.address) {
      this.connect(this.address);
    } else {
      try {
        this.getRelay((function(_this) {
          return function(address) {
            return _this.connect(address);
          };
        })(this));
      } catch (error) {
        err = error;
        console.error(err);
      }
    }
    this.messages = [];
    player.runtime.addConnection(this);
  }

  MPServerConnectionImpl.prototype.getRelay = function(callback) {
    return player.client.sendRequest({
      name: "get_relay_server"
    }, (function(_this) {
      return function(msg) {
        var address;
        if (msg.name === "error") {
          _this["interface"].status = "error";
          return _this["interface"].error = msg.error;
        } else {
          address = msg.address;
          if (address === "self") {
            address = location.origin.replace("http", "ws");
          }
          return callback(address);
        }
      };
    })(this));
  };

  MPServerConnectionImpl.prototype.connect = function(address) {
    this.socket = new WebSocket(address);
    this.socket.onmessage = (function(_this) {
      return function(msg) {
        var err;
        try {
          msg = JSON.parse(msg.data);
          switch (msg.name) {
            case "mp_server_message":
              return _this.messages.push(msg.data);
          }
        } catch (error) {
          err = error;
          return console.error(err);
        }
      };
    })(this);
    this.socket.onopen = (function(_this) {
      return function() {
        var i, len, m, ref;
        _this["interface"].status = "connected";
        _this.send({
          name: "mp_client_connection",
          server_id: ms_project_id
        });
        ref = _this.buffer;
        for (i = 0, len = ref.length; i < len; i++) {
          m = ref[i];
          _this.sendMessage(m);
        }
        return _this.buffer = [];
      };
    })(this);
    return this.socket.onclose = (function(_this) {
      return function() {
        return _this["interface"].status = "disconnected";
      };
    })(this);
  };

  MPServerConnectionImpl.prototype.update = function() {
    if (this.messages.length > 0 || this["interface"].messages.length > 0) {
      this["interface"].messages = this.messages;
      return this.messages = [];
    }
  };

  MPServerConnectionImpl.prototype.sendMessage = function(data) {
    if ((this.socket != null) && this.socket.readyState === 1) {
      return this.send({
        name: "mp_client_message",
        data: data
      });
    } else {
      return this.buffer.push(data);
    }
  };

  MPServerConnectionImpl.prototype.send = function(data) {
    return this.socket.send(JSON.stringify(data));
  };

  MPServerConnectionImpl.prototype.close = function() {
    return this.socket.close();
  };

  return MPServerConnectionImpl;

})();
