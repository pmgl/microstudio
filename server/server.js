var BuildManager, Content, DB, FileStorage, RateLimiter, Session, WebApp, WebSocket, compression, cookieParser, express, fs, morgan, path, process;

compression = require("compression");

express = require("express");

cookieParser = require('cookie-parser');

fs = require("fs");

path = require("path");

DB = require(__dirname + "/db/db.js");

FileStorage = require(__dirname + "/filestorage/filestorage.js");

Content = require(__dirname + "/content/content.js");

WebApp = require(__dirname + "/webapp.js");

Session = require(__dirname + "/session/session.js");

RateLimiter = require(__dirname + "/ratelimiter.js");

BuildManager = require(__dirname + "/build/buildmanager.js");

WebSocket = require("ws");

process = require("process");

morgan = require("morgan");

this.Server = class Server {
  constructor(config = {}, callback1) {
    this.exit = this.exit.bind(this);
    this.config = config;
    this.callback = callback1;
    process.chdir(__dirname);
    this.app_data = this.config.app_data || "..";
    this.mailer = { // STUB
      sendMail: function(recipient, subject, text) {
        return console.info(`send mail to:${recipient} subject:${subject} text:${text}`);
      }
    };
    this.stats = { // STUB
      set: function(name, value) {},
      max: function(name, value) {},
      unique: function(name, id) {},
      inc: function(name) {},
      stop: function() {}
    };
    this.last_backup_time = 0;
    if (this.config.realm === "production") {
      this.PORT = 443;
      this.PROD = true;
    } else if (this.config.standalone) {
      this.PORT = this.config.port || 0;
    } else {
      this.PORT = this.config.port || 8080;
      this.PROD = false;
    }
    this.loadPlugins(() => {
      return this.create();
    });
  }

  create() {
    var accessLogStream, app, folder, i, len, plugin, ref, static_files;
    app = express();
    if (fs.existsSync(path.join(__dirname, "../logs"))) {
      accessLogStream = fs.createWriteStream(path.join(__dirname, "../logs/access.log"), {
        flags: 'a'
      });
      // setup the logger
      app.use(morgan('combined', {
        stream: accessLogStream
      }));
    }
    static_files = "../static";
    this.date_started = Date.now();
    this.rate_limiter = new RateLimiter(this);
    app.use((req, res, next) => {
      var referrer;
      if (this.rate_limiter.accept("request", "general") && this.rate_limiter.accept("request_ip", req.connection.remoteAddress)) {
        next();
      } else {
        res.status(500).send("");
      }
      this.stats.inc("http_requests");
      this.stats.unique("ip_addresses", req.connection.remoteAddress);
      referrer = req.get("Referrer");
      if ((referrer != null) && !referrer.startsWith("http://localhost") && !referrer.startsWith("https://microstudio.io") && !referrer.startsWith("https://microstudio.dev")) {
        if (referrer.includes("=")) {
          referrer = referrer.substring(0, referrer.indexOf("="));
        }
        if (referrer.length > 120) {
          referrer = referrer.substring(0, 120);
        }
        return this.stats.unique("referrer|" + referrer, req.connection.remoteAddress);
      }
    });
    app.use(compression());
    app.use(cookieParser());
    ref = this.plugins;
    for (i = 0, len = ref.length; i < len; i++) {
      plugin = ref[i];
      if (plugin.getStaticFolder != null) {
        folder = plugin.getStaticFolder();
        app.use(express.static(folder));
      }
    }
    app.use(express.static(static_files));
    app.use("/microstudio.wiki", express.static("../microstudio.wiki", {
      dotfiles: "ignore"
    }));
    app.use("/lib/fontlib/ubuntu", express.static("node_modules/@fontsource/ubuntu"));
    app.use("/lib/fontlib/ubuntu-mono", express.static("node_modules/@fontsource/ubuntu-mono"));
    app.use("/lib/fontlib/source-sans-pro", express.static("node_modules/@fontsource/source-sans-pro"));
    app.use("/lib/fontlib/fontawesome", express.static("node_modules/@fortawesome/fontawesome-free"));
    app.use("/lib/ace", express.static("node_modules/ace-builds/src-min"));
    app.use("/lib/marked/marked.js", express.static("node_modules/marked/marked.min.js"));
    app.use("/lib/dompurify/purify.js", express.static("node_modules/dompurify/dist/purify.min.js"));
    app.use("/lib/jquery/jquery.js", express.static("node_modules/jquery/dist/jquery.min.js"));
    app.use("/lib/jquery-ui", express.static("node_modules/jquery-ui-dist"));
    if (this.config.brython_path) {
      app.use("/lib/brython", express.static(this.config.brython_path));
    } else {
      app.use("/lib/brython", express.static("node_modules/brython"));
    }
    app.use("/lib/fengari", express.static("node_modules/fengari-web/dist"));
    app.use("/lib/qrcode", express.static("node_modules/qrcode/build"));
    app.use("/lib/wavefile", express.static("node_modules/wavefile/dist"));
    app.use("/lib/lamejs/lame.min.js", express.static("node_modules/lamejs/lame.min.js"));
    return this.db = new DB(`${this.app_data}/data`, (db) => {
      var j, len1, ref1;
      ref1 = this.plugins;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        plugin = ref1[j];
        if (plugin.dbLoaded != null) {
          plugin.dbLoaded(db);
        }
      }
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
          return this.start(app, db);
        });
      } else if (this.config.standalone) {
        this.use_cache = false;
        return this.httpserver = require("http").createServer(app).listen(this.PORT, "127.0.0.1", () => {
          this.PORT = this.httpserver.address().port;
          this.start(app, db);
          console.info(`standalone running on port ${this.PORT}`);
          if (this.callback != null) {
            return this.callback();
          }
        });
      } else {
        this.httpserver = require("http").createServer(app).listen(this.PORT);
        this.use_cache = false;
        return this.start(app, db);
      }
    });
  }

  start(app, db) {
    var i, l, len, ref;
    this.active_users = 0;
    this.io = new WebSocket.Server({
      server: this.httpserver,
      maxPayload: this.config.standalone ? 1000000000 : 40000000
    });
    this.sessions = [];
    this.io.on("connection", (socket, request) => {
      socket.request = request;
      socket.remoteAddress = request.connection.remoteAddress;
      return this.sessions.push(new Session(this, socket));
    });
    console.info("MAX PAYLOAD = " + this.io.options.maxPayload);
    this.session_check = setInterval((() => {
      return this.sessionCheck();
    }), 10000);
    this.content = new Content(this, db, new FileStorage(`${this.app_data}/files`));
    this.build_manager = new BuildManager(this);
    this.webapp = new WebApp(this, app);
    ref = this.webapp.languages;
    for (i = 0, len = ref.length; i < len; i++) {
      l = ref[i];
      this.content.translator.createLanguage(l);
    }
    process.on('SIGINT', () => {
      console.log("caught INT signal");
      return this.exit();
    });
    process.on('SIGTERM', () => {
      console.log("caught TERM signal");
      return this.exit();
    });
    //process.on 'SIGKILL', ()=>
    //  console.log "caught KILL signal"
    //  @exit()
    return this.exitcheck = setInterval((() => {
      if (fs.existsSync("exit")) {
        this.exit();
        fs.unlinkSync("exit");
      }
      if (fs.existsSync("update")) {
        this.webapp.concatenator.refresh();
        return fs.unlinkSync("update");
      }
    }), 2000);
  }

  exit() {
    if (this.exited) {
      process.exit(0);
    }
    this.httpserver.close();
    this.stats.stop();
    this.rate_limiter.close();
    this.io.close();
    this.db.close();
    this.content.close();
    clearInterval(this.exitcheck);
    clearInterval(this.session_check);
    this.exited = true;
    return setTimeout((() => {
      return this.exit();
    }), 5000);
  }

  sessionCheck() {
    var i, len, ref, s;
    ref = this.sessions;
    for (i = 0, len = ref.length; i < len; i++) {
      s = ref[i];
      if (s != null) {
        s.timeCheck();
      }
    }
  }

  sessionClosed(session) {
    var index;
    index = this.sessions.indexOf(session);
    if (index >= 0) {
      return this.sessions.splice(index, 1);
    }
  }

  loadPlugins(callback) {
    this.plugins = [];
    return fs.readdir("../plugins", (err, files) => {
      var funk;
      if (files == null) {
        files = [];
      }
      funk = () => {
        var f;
        if (files.length === 0) {
          return callback();
        } else {
          f = files.splice(0, 1)[0];
          return this.loadPlugin(`../plugins/${f}`, funk);
        }
      };
      return funk();
    });
  }

  loadPlugin(folder, callback) {
    var Plugin, err, p;
    if (fs.existsSync(`${folder}/index.js`)) {
      try {
        Plugin = require(`${folder}/index.js`);
        p = new Plugin(this);
        this.plugins.push(p);
        console.info(`loaded plugin ${folder}`);
      } catch (error) {
        err = error;
        console.error(err);
      }
      return callback();
    } else {
      console.info(`plugin ${folder} has no index.js`);
      return callback();
    }
  }

};

module.exports = this.Server;
