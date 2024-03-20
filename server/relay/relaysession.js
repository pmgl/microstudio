var RelayService;

RelayService = require(__dirname + "/relayservice.js");

this.RelaySession = (function() {
  function RelaySession(server, socket) {
    this.server = server;
    this.socket = socket;
    this.socket.on("message", (function(_this) {
      return function(msg) {
        _this.messageReceived(msg);
        return _this.last_active = Date.now();
      };
    })(this));
    this.socket.on("close", (function(_this) {
      return function() {
        _this.server.sessionClosed(_this);
        return _this.disconnected();
      };
    })(this));
    this.socket.on("error", (function(_this) {
      return function(err) {
        console.error("WS ERROR");
        return console.error(err);
      };
    })(this));
    this.commands = {};
    this.relay_service = new RelayService(this);
  }

  RelaySession.prototype.register = function(name, callback) {
    return this.commands[name] = callback;
  };

  RelaySession.prototype.disconnected = function() {};

  RelaySession.prototype.messageReceived = function(msg) {
    var c, err;
    if (typeof msg !== "string") {
      return this.bufferReceived(msg);
    }
    try {
      msg = JSON.parse(msg);
      if (msg.name != null) {
        c = this.commands[msg.name];
        if (c != null) {
          return c(msg);
        }
      }
    } catch (error) {
      err = error;
      return console.info(err);
    }
  };

  RelaySession.prototype.send = function(data) {
    return this.socket.send(JSON.stringify(data));
  };

  RelaySession.prototype.serverTokenCheck = function(token, server_id, callback) {
    return this.server.serverTokenCheck(token, server_id, callback);
  };

  return RelaySession;

})();

module.exports = this.RelaySession;
