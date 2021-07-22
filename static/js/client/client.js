this.Client = (function() {
  function Client(app) {
    this.app = app;
    this.pending_requests = {};
    this.request_id = 0;
    this.sends = [];
    setInterval(((function(_this) {
      return function() {
        return _this.check();
      };
    })(this)), 1000);
    this.listeners = {};
    this.listen("error", (function(_this) {
      return function(msg) {
        if (msg.error != null) {
          return _this.app.appui.showNotification(_this.app.translator.get(msg.error));
        }
      };
    })(this));
  }

  Client.prototype.start = function() {
    this.token = localStorage.getItem("token");
    if (this.token != null) {
      setTimeout(((function(_this) {
        return function() {
          return _this.app.appui.popMenu();
        };
      })(this)), 500);
      return this.connect();
    } else {
      this.app.appui.showLoginButton();
      setTimeout(((function(_this) {
        return function() {
          return _this.app.appui.popMenu();
        };
      })(this)), 500);
      return this.app.app_state.initState();
    }
  };

  Client.prototype.setToken = function(token) {
    var date;
    this.token = token;
    if (this.token != null) {
      localStorage.setItem("token", this.token);
      date = new Date();
      date.setTime;
      return document.cookie = "token=" + this.token + ";expires=" + (new Date(Date.now() + 3600000 * 24 * 14).toUTCString()) + ";path=/";
    } else {
      localStorage.removeItem("token");
      return document.cookie = "token=" + this.token + ";expires=" + (new Date(Date.now() - 3600000 * 24 * 14).toUTCString()) + ";path=/";
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
        var i, len1, n, ref;
        switch (msg.name) {
          case "error":
            console.error(msg.error);
            _this.app.setToken(null);
            _this.app.appui.showLoginButton();
            return _this.app.app_state.initState();
          case "token_valid":
            _this.app.nick = msg.nick;
            _this.app.user = {
              nick: msg.nick,
              email: msg.email,
              flags: msg.flags,
              settings: msg.settings,
              info: msg.info
            };
            if ((msg.notifications != null) && msg.notifications.length > 0) {
              ref = msg.notifications;
              for (i = 0, len1 = ref.length; i < len1; i++) {
                n = ref[i];
                _this.app.appui.showNotification(n);
              }
            }
            _this.app.connected = true;
            _this.app.userConnected(msg.nick);
            return _this.app.app_state.initState();
        }
      };
    })(this));
  };

  Client.prototype.connect = function() {
    this.socket = new WebSocket(window.location.origin.replace("http", "ws"));
    this.extend();
    this.socket.onmessage = (function(_this) {
      return function(msg) {
        var c, err;
        msg = msg.data;
        console.info("received: " + msg);
        try {
          msg = JSON.parse(msg);
          if (msg.request_id != null) {
            if (_this.pending_requests[msg.request_id] != null) {
              c = _this.pending_requests[msg.request_id];
              delete _this.pending_requests[msg.request_id];
              return c(msg);
            }
          } else {
            if ((msg.name != null) && (_this.listeners[msg.name] != null)) {
              _this.listeners[msg.name](msg);
            }
            return _this.app.serverMessage(msg);
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
        if (_this.app.translator != null) {
          _this.app.translator.load();
        }
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

  Client.prototype.extend = function() {
    return this.timeout = Date.now() + 10000;
  };

  Client.prototype.send = function(data) {
    if ((this.socket != null) && this.socket.readyState === WebSocket.OPEN) {
      this.extend();
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

  Client.prototype.sendUpload = function(msg, data, callback, progress_callback) {
    var request_id;
    request_id = this.request_id;
    return this.sendRequest({
      name: "upload_request",
      size: data.byteLength,
      request: msg
    }, (function(_this) {
      return function(response) {
        var count, funk;
        count = 0;
        if (response.name === "error") {
          return callback(response);
        }
        funk = function(res) {
          var buffer, len;
          if ((res != null) && res.name === "error") {
            return callback(res);
          }
          if (progress_callback != null) {
            progress_callback(count / data.byteLength * 100);
          }
          _this.pending_requests[request_id] = funk;
          len = Math.min(100000, data.byteLength - count);
          if (len > 0) {
            buffer = new ArrayBuffer(len + 4);
            new Uint8Array(buffer, 4, len).set(new Uint8Array(data, count, len));
            count += len;
            new DataView(buffer).setUint32(0, request_id, true);
            console.info("sending " + len + " bytes");
            return _this.socket.send(buffer);
          } else {
            console.info(res);
            return callback(res);
          }
        };
        return funk();
      };
    })(this));
  };

  Client.prototype.check = function() {};

  Client.prototype.listen = function(name, callback) {
    return this.listeners[name] = callback;
  };

  return Client;

})();
