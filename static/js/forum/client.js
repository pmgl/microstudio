this.Client = (function() {
  function Client(forum) {
    this.forum = forum;
    this.pending_requests = {};
    this.request_id = 0;
    this.sends = [];
  }

  Client.prototype.start = function() {
    this.token = localStorage.getItem("token");
    if (this.token != null) {
      return this.connect();
    }
  };

  Client.prototype.checkToken = function() {
    if (!this.token) {
      return;
    }
    return this.sendRequest({
      name: "token",
      token: this.token
    }, (function(_this) {
      return function(msg) {
        switch (msg.name) {
          case "error":
            return console.error(msg.error);
          case "token_valid":
            _this.forum.nick = msg.nick;
            _this.forum.user = {
              nick: msg.nick,
              email: msg.email,
              flags: msg.flags,
              settings: msg.settings,
              info: msg.info
            };
            return _this.forum.userConnected(msg.nick);
        }
      };
    })(this));
  };

  Client.prototype.connect = function() {
    this.socket = new WebSocket(window.location.origin.replace("http", "ws"));
    this.socket.onmessage = (function(_this) {
      return function(msg) {
        var err;
        msg = msg.data;
        console.info("received: " + msg);
        try {
          msg = JSON.parse(msg);
          if (msg.request_id != null) {
            if (_this.pending_requests[msg.request_id] != null) {
              _this.pending_requests[msg.request_id](msg);
              return delete _this.pending_requests[msg.request_id];
            }
          } else {
            return _this.forum.serverMessage(msg);
          }
        } catch (error) {
          err = error;
          return console.error(err);
        }
      };
    })(this);
    this.socket.onopen = (function(_this) {
      return function() {
        var s;
        _this.checkToken();
        while (_this.sends.length > 0) {
          s = _this.sends.splice(0, 1)[0];
          _this.send(s);
        }
      };
    })(this);
    return this.socket.onclose = (function(_this) {
      return function() {
        console.info("socket closed");
        return _this.socket = null;
      };
    })(this);
  };

  Client.prototype.send = function(data) {
    if ((this.socket != null) && this.socket.readyState === WebSocket.OPEN) {
      return this.socket.send(JSON.stringify(data));
    } else {
      this.sends.push(data);
      if ((this.socket == null) || this.socket.readyState !== WebSocket.CONNECTING) {
        return this.connect();
      }
    }
  };

  Client.prototype.sendRequest = function(msg, callback) {
    msg.request_id = this.request_id++;
    this.pending_requests[msg.request_id] = callback;
    return this.send(msg);
  };

  return Client;

})();
