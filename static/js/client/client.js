this.Client = class Client {
  constructor(app) {
    this.app = app;
    this.pending_requests = {};
    this.request_id = 0;
    this.sends = [];
    setInterval((() => {
      return this.check();
    }), 1000);
    this.listeners = {};
    this.listen("error", (msg) => {
      if (msg.error != null) {
        return this.app.appui.showNotification(this.app.translator.get(msg.error));
      }
    });
  }

  start() {
    this.token = localStorage.getItem("token");
    if (window.ms_standalone) {
      this.token = "---";
    }
    if (this.token != null) {
      setTimeout((() => {
        return this.app.appui.popMenu();
      }), 500);
      return this.connect();
    } else {
      this.app.appui.showLoginButton();
      setTimeout((() => {
        return this.app.appui.popMenu();
      }), 500);
      return this.app.app_state.initState();
    }
  }

  setToken(token) {
    var date;
    this.token = token;
    if (this.token != null) {
      localStorage.setItem("token", this.token);
      date = new Date();
      date.setTime;
      return document.cookie = `token=${this.token};expires=${new Date(Date.now() + 3600000 * 24 * 14).toUTCString()};path=/`;
    } else {
      localStorage.removeItem("token");
      return document.cookie = `token=${this.token};expires=${new Date(Date.now() - 3600000 * 24 * 14).toUTCString()};path=/`;
    }
  }

  checkToken() {
    if (!this.token) {
      return;
    }
    return this.sendRequest({
      name: "token",
      token: this.token
    }, (msg) => {
      var i, len1, n, ref;
      switch (msg.name) {
        case "error":
          console.error(msg.error);
          this.app.setToken(null);
          this.app.appui.showLoginButton();
          return this.app.app_state.initState();
        case "token_valid":
          this.app.nick = msg.nick;
          this.setToken(this.token); // refresh cookie
          this.app.user = {
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
              this.app.appui.showNotification(n);
            }
          }
          this.app.connected = true;
          this.app.userConnected(msg.nick);
          return this.app.app_state.initState();
      }
    });
  }

  connect() {
    this.socket = new WebSocket(window.location.origin.replace("http", "ws"));
    this.extend();
    this.socket.onmessage = (msg) => {
      var c, err;
      msg = msg.data;
      try {
        // console.info "received: "+msg
        msg = JSON.parse(msg);
        if (msg.request_id != null) {
          if (this.pending_requests[msg.request_id] != null) {
            c = this.pending_requests[msg.request_id];
            delete this.pending_requests[msg.request_id];
            return c(msg);
          }
        } else {
          if ((msg.name != null) && (this.listeners[msg.name] != null)) {
            this.listeners[msg.name](msg);
          }
          return this.app.serverMessage(msg);
        }
      } catch (error) {
        err = error;
        return console.error(err);
      }
    };
    this.socket.onopen = () => {
      var s;
      this.checkToken();
      while (this.sends.length > 0) {
        s = this.sends.splice(0, 1)[0];
        this.send(s);
      }
    };
    return this.socket.onclose = () => {
      console.info("socket closed");
      return this.socket = null;
    };
  }

  extend() {
    return this.timeout = Date.now() + 10000;
  }

  send(data) {
    if ((this.socket != null) && this.socket.readyState === WebSocket.OPEN) {
      this.extend();
      return this.socket.send(JSON.stringify(data));
    } else {
      this.sends.push(data);
      if ((this.socket == null) || this.socket.readyState !== WebSocket.CONNECTING) {
        return this.connect();
      }
    }
  }

  sendRequest(msg, callback) {
    // r = Math.random()
    // if @socket? and msg.name == "write_project_file" and r<.5
    //   console.info("BAD CONNECTION SIMULATED "+r)
    //   @socket.close()
    //   return
    msg.request_id = this.request_id++;
    this.pending_requests[msg.request_id] = callback;
    return this.send(msg);
  }

  sendUpload(msg, data, callback, progress_callback) {
    var request_id;
    request_id = this.request_id;
    return this.sendRequest({
      name: "upload_request",
      size: data.byteLength,
      request: msg
    }, (response) => {
      var count, funk;
      count = 0;
      if (response.name === "error") {
        return callback(response);
      }
      funk = (res) => {
        var buffer, len;
        if ((res != null) && res.name === "error") {
          return callback(res);
        }
        if (progress_callback != null) {
          progress_callback(count / data.byteLength * 100);
        }
        this.pending_requests[request_id] = funk; //(res)=> setTimeout((()=>funk(res)),200)
        len = Math.min(100000, data.byteLength - count);
        if (len > 0) {
          buffer = new ArrayBuffer(len + 4);
          new Uint8Array(buffer, 4, len).set(new Uint8Array(data, count, len));
          count += len;
          new DataView(buffer).setUint32(0, request_id, true);
          console.info(`sending ${len} bytes`);
          return this.socket.send(buffer);
        } else {
          console.info(res);
          return callback(res);
        }
      };
      return funk();
    });
  }

  check() {}

  //if @socket and @socket.readyState == "open" and Date.now()>@timeout
  //  @socket.close()
  listen(name, callback) {
    return this.listeners[name] = callback;
  }

};
