var Relay, RelaySession, WebSocket, fs;

WebSocket = require("ws");

RelaySession = require(__dirname + "/relaysession.js");

Relay = class Relay {
  constructor(config = {}) {
    this.config = config;
    this.sessions = [];
    this.create();
    this.token_requests = {};
  }

  create() {
    this.io = new WebSocket.Server({
      port: this.config.relay_port
    });
    this.sessions = [];
    this.io.on("connection", (socket, request) => {
      socket.request = request;
      socket.remoteAddress = request.connection.remoteAddress;
      return this.sessions.push(new RelaySession(this, socket));
    });
    return this.startClient();
  }

  startClient() {
    var err, interval, msg;
    try {
      console.info("connecting to main server...");
      this.client = new WebSocket(this.config.microstudio_server_address);
      msg = JSON.stringify({
        name: "relay_server_available",
        key: this.config.key,
        address: this.config.relay_address
      });
      this.client.on("open", () => {
        console.info("connected to main server");
        return this.client.send(msg);
      });
      this.client.on("message", (msg) => {
        var data;
        try {
          data = JSON.parse(msg.data);
          if (data.name === "check_server_token") {
            if (data.valid && (this.token_requests[data.token] != null)) {
              this.token_requests[data.token]();
              return delete this.token_requests[data.token];
            }
          }
        } catch (error) {}
      });
      interval = setInterval((() => {
        var err;
        try {
          return this.client.send(msg);
        } catch (error) {
          err = error;
        }
      }), 60000);
      this.client.on("error", (err) => {
        console.info(err);
        clearInterval(interval);
        setTimeout((() => {
          return this.startClient();
        }), 5000);
        return this.client.close();
      });
      return this.client.on("close", (msg) => {
        clearInterval(interval);
        return setTimeout((() => {
          return this.startClient();
        }), 5000);
      });
    } catch (error) {
      err = error;
      console.error(err);
      if (interval != null) {
        clearInterval(interval);
      }
      return setTimeout((() => {
        return this.startClient();
      }), 5000);
    }
  }

  sessionClosed(session) {
    var index;
    index = this.sessions.indexOf(session);
    if (index >= 0) {
      return this.sessions.splice(index, 1);
    }
  }

  serverTokenCheck(token, server_id, callback) {
    this.token_requests[token] = callback();
    return this.client.send(JSON.stringify({
      name: "check_server_token",
      server_id: server_id,
      token: token
    }));
  }

};

fs = require("fs");

fs.readFile(__dirname + "/config.json", (err, data) => {
  if (!err) {
    this.config = JSON.parse(data);
    console.info("config.json loaded");
  } else {
    console.info("No config.json file found, running with default settings");
  }
  return this.relay = new Relay(this.config);
});
