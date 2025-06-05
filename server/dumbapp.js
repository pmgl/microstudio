var BanIP, Session, WebSocket, compression, cookieParser, express, fs, morgan, path, process;

compression = require("compression");

express = require("express");

cookieParser = require('cookie-parser');

fs = require("fs");

path = require("path");

WebSocket = require("ws");

process = require("process");

morgan = require("morgan");

BanIP = require(__dirname + "/banip.js");

Session = class Session {
  constructor(server, socket1) {
    this.server = server;
    this.socket = socket1;
    this.socket.on("message", (msg) => {
      if (msg.length) {
        return console.info("received ws message from " + this.socket.remoteAddress + ", length = " + msg.length);
      }
    });
    this.socket.on("close", () => {});
    this.socket.on("error", (err) => {
      return console.error(err);
    });
  }

};

this.DumbApp = class DumbApp {
  constructor(config = {}, callback) {
    this.config = config;
    this.callback = callback;
    process.chdir(__dirname);
    this.config = {
      realm: "local"
    };
    if (this.config.realm === "production") {
      this.PORT = 443;
      this.PROD = true;
    } else if (this.config.standalone) {
      this.PORT = this.config.port || 0;
    } else {
      this.PORT = this.config.port || 8080;
      this.PROD = false;
    }
    this.ban_ip = new BanIP(this);
    this.create();
  }

  create() {
    var accessLogStream, app;
    app = express();
    app.set('trust proxy', true);
    if (fs.existsSync(path.join(__dirname, "../logs"))) {
      accessLogStream = fs.createWriteStream(path.join(__dirname, "../logs/access.log"), {
        flags: 'a'
      });
      // setup the logger
      app.use(morgan('combined', {
        stream: accessLogStream
      }));
    }
    app.use((req, res, next) => {
      // if @ban_ip.isBanned( req.connection.remoteAddress )
      //   if req.socket
      //     req.socket.destroy()
      //     return

      //  return res.status(429).send "Too many requests"

      // if req.path == "/"
      //   @ban_ip.request( req.connection.remoteAddress )
      console.info(req.get("host") + " : " + req.ip + " : " + req.path);
      // console.info('IP réelle :', req.ip)
      // console.info('X-Forwarded-For:', req.headers['x-forwarded-for'])
      return res.status(200).send(req.path);
    });
    if (this.PROD) {
      return require('greenlock-express').init({
        packageRoot: __dirname,
        configDir: "./greenlock.d",
        maintainerEmail: "contact@microstudio.dev",
        cluster: false
      }).ready((glx) => {
        this.httpserver = glx.httpsServer();
        this.use_cache = true;
        glx.serveApp(app);
        return this.start(app);
      });
    } else {
      this.httpserver = require("http").createServer(app).listen(this.PORT);
      this.use_cache = false;
      return this.start(app);
    }
  }

  start(app) {
    this.io = new WebSocket.Server({
      server: this.httpserver,
      maxPayload: 40000000
    });
    this.io.on("connection", (socket, request) => {
      // if @ban_ip.isBanned(request.connection.remoteAddress)
      //   try
      //     socket.close()
      //   catch err
      //   return
      socket.request = request;
      socket.remoteAddress = request.headers['x-forwarded-for'];
      return new Session(this, socket);
    });
    return console.info("MAX PAYLOAD = " + this.io.options.maxPayload);
  }

};

module.exports = new this.DumbApp();
