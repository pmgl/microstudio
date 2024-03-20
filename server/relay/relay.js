var Relay, RelaySession, WebSocket, fs;

WebSocket = require("ws");

RelaySession = require(__dirname + "/relaysession.js");

Relay = (function() {
  function Relay(config) {
    this.config = config != null ? config : {};
    this.sessions = [];
    this.create();
    this.token_requests = {};
  }

  Relay.prototype.create = function() {
    this.io = new WebSocket.Server({
      port: this.config.relay_port
    });
    this.sessions = [];
    this.io.on("connection", (function(_this) {
      return function(socket, request) {
        socket.request = request;
        socket.remoteAddress = request.connection.remoteAddress;
        return _this.sessions.push(new RelaySession(_this, socket));
      };
    })(this));
    return this.startClient();
  };

  Relay.prototype.startClient = function() {
    var err, interval, msg;
    try {
      console.info("connecting to main server...");
      this.client = new WebSocket(this.config.microstudio_server_address);
      msg = JSON.stringify({
        name: "relay_server_available",
        key: this.config.key,
        address: this.config.relay_address
      });
      this.client.on("open", (function(_this) {
        return function() {
          console.info("connected to main server");
          return _this.client.send(msg);
        };
      })(this));
      this.client.on("message", (function(_this) {
        return function(msg) {
          var data;
          try {
            data = JSON.parse(msg.data);
            if (data.name === "check_server_token") {
              if (data.valid && (_this.token_requests[data.token] != null)) {
                _this.token_requests[data.token]();
                return delete _this.token_requests[data.token];
              }
            }
          } catch (error) {}
        };
      })(this));
      interval = setInterval(((function(_this) {
        return function() {
          var err;
          try {
            return _this.client.send(msg);
          } catch (error) {
            err = error;
          }
        };
      })(this)), 60000);
      this.client.on("error", (function(_this) {
        return function(err) {
          console.info(err);
          clearInterval(interval);
          setTimeout((function() {
            return _this.startClient();
          }), 5000);
          return _this.client.close();
        };
      })(this));
      return this.client.on("close", (function(_this) {
        return function(msg) {
          clearInterval(interval);
          return setTimeout((function() {
            return _this.startClient();
          }), 5000);
        };
      })(this));
    } catch (error) {
      err = error;
      console.error(err);
      if (interval != null) {
        clearInterval(interval);
      }
      return setTimeout(((function(_this) {
        return function() {
          return _this.startClient();
        };
      })(this)), 5000);
    }
  };

  Relay.prototype.sessionClosed = function(session) {
    var index;
    index = this.sessions.indexOf(session);
    if (index >= 0) {
      return this.sessions.splice(index, 1);
    }
  };

  Relay.prototype.serverTokenCheck = function(token, server_id, callback) {
    this.token_requests[token] = callback();
    return this.client.send(JSON.stringify({
      name: "check_server_token",
      server_id: server_id,
      token: token
    }));
  };

  return Relay;

})();

fs = require("fs");

fs.readFile(__dirname + "/config.json", (function(_this) {
  return function(err, data) {
    if (!err) {
      _this.config = JSON.parse(data);
      console.info("config.json loaded");
    } else {
      console.info("No config.json file found, running with default settings");
    }
    return _this.relay = new Relay(_this.config);
  };
})(this));
