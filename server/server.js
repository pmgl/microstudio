var BuildManager, Content, DB, FileStorage, RateLimiter, Session, WebApp, WebSocket, compression, cookieParser, express, fs, path, process,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

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

this.Server = (function() {
  function Server(config, callback1) {
    this.config = config != null ? config : {};
    this.callback = callback1;
    this.exit = bind(this.exit, this);
    process.chdir(__dirname);
    this.app_data = this.config.app_data || "..";
    this.mailer = {
      sendMail: function(recipient, subject, text) {
        return console.info("send mail to:" + recipient + " subject:" + subject + " text:" + text);
      }
    };
    this.stats = {
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
    this.loadPlugins((function(_this) {
      return function() {
        return _this.create();
      };
    })(this));
  }

  Server.prototype.create = function() {
    var app, folder, i, len, plugin, ref, static_files;
    app = express();
    static_files = "../static";
    this.date_started = Date.now();
    this.rate_limiter = new RateLimiter(this);
    app.use((function(_this) {
      return function(req, res, next) {
        var referrer;
        if (_this.rate_limiter.accept("request", "general") && _this.rate_limiter.accept("request_ip", req.connection.remoteAddress)) {
          next();
        } else {
          res.status(500).send("");
        }
        _this.stats.inc("http_requests");
        _this.stats.unique("ip_addresses", req.connection.remoteAddress);
        referrer = req.get("Referrer");
        if ((referrer != null) && !referrer.startsWith("http://localhost") && !referrer.startsWith("https://microstudio.io") && !referrer.startsWith("https://microstudio.dev")) {
          return _this.stats.unique("referrer|" + referrer, req.connection.remoteAddress);
        }
      };
    })(this));
    app.use(compression());
    app.use(cookieParser());
    ref = this.plugins;
    for (i = 0, len = ref.length; i < len; i++) {
      plugin = ref[i];
      if (plugin.getStaticFolder != null) {
        folder = plugin.getStaticFolder();
        app.use(express["static"](folder));
      }
    }
    app.use(express["static"](static_files));
    app.use("/microstudio.wiki", express["static"]("../microstudio.wiki", {
      dotfiles: "ignore"
    }));
    app.use("/lib/fontlib/ubuntu", express["static"]("node_modules/@fontsource/ubuntu"));
    app.use("/lib/fontlib/ubuntu-mono", express["static"]("node_modules/@fontsource/ubuntu-mono"));
    app.use("/lib/fontlib/source-sans-pro", express["static"]("node_modules/@fontsource/source-sans-pro"));
    app.use("/lib/fontlib/fontawesome", express["static"]("node_modules/@fortawesome/fontawesome-free"));
    app.use("/lib/ace", express["static"]("node_modules/ace-builds/src-min"));
    app.use("/lib/marked/marked.js", express["static"]("node_modules/marked/marked.min.js"));
    app.use("/lib/dompurify/purify.js", express["static"]("node_modules/dompurify/dist/purify.min.js"));
    app.use("/lib/jquery/jquery.js", express["static"]("node_modules/jquery/dist/jquery.min.js"));
    app.use("/lib/jquery-ui", express["static"]("node_modules/jquery-ui-dist"));
    app.use("/lib/pixijs", express["static"]("node_modules/pixi.js/dist/browser"));
    app.use("/lib/babylonjs", express["static"]("node_modules/babylonjs"));
    app.use("/lib/babylonjs", express["static"]("node_modules/babylonjs-loaders"));
    app.use("/lib/matterjs", express["static"]("node_modules/matter-js/build"));
    app.use("/lib/cannonjs", express["static"]("node_modules/cannon/build"));
    app.use("/lib/brython", express["static"]("node_modules/brython"));
    app.use("/lib/fengari", express["static"]("node_modules/fengari-web/dist"));
    app.use("/lib/qrcode", express["static"]("node_modules/qrcode/build"));
    app.use("/lib/wavefile", express["static"]("node_modules/wavefile/dist"));
    return this.db = new DB(this.app_data + "/data", (function(_this) {
      return function(db) {
        var j, len1, ref1;
        ref1 = _this.plugins;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          plugin = ref1[j];
          if (plugin.dbLoaded != null) {
            plugin.dbLoaded(db);
          }
        }
        if (_this.PROD) {
          return require('greenlock-express').init({
            packageRoot: __dirname,
            configDir: "./greenlock.d",
            maintainerEmail: "contact@microstudio.dev",
            cluster: false
          }).ready(function(glx) {
            _this.httpserver = glx.httpsServer();
            _this.use_cache = true;
            glx.serveApp(app);
            return _this.start(app, db);
          });
        } else if (_this.config.standalone) {
          _this.use_cache = false;
          return _this.httpserver = require("http").createServer(app).listen(_this.PORT, "127.0.0.1", function() {
            _this.PORT = _this.httpserver.address().port;
            _this.start(app, db);
            console.info("standalone running on port " + _this.PORT);
            if (_this.callback != null) {
              return _this.callback();
            }
          });
        } else {
          _this.httpserver = require("http").createServer(app).listen(_this.PORT);
          _this.use_cache = false;
          return _this.start(app, db);
        }
      };
    })(this));
  };

  Server.prototype.start = function(app, db) {
    var i, l, len, ref;
    this.active_users = 0;
    this.io = new WebSocket.Server({
      server: this.httpserver,
      maxPayload: 40000000
    });
    this.sessions = [];
    this.io.on("connection", (function(_this) {
      return function(socket, request) {
        socket.request = request;
        socket.remoteAddress = request.connection.remoteAddress;
        return _this.sessions.push(new Session(_this, socket));
      };
    })(this));
    console.info("MAX PAYLOAD = " + this.io.options.maxPayload);
    this.session_check = setInterval(((function(_this) {
      return function() {
        return _this.sessionCheck();
      };
    })(this)), 10000);
    this.content = new Content(this, db, new FileStorage(this.app_data + "/files"));
    this.build_manager = new BuildManager(this);
    this.webapp = new WebApp(this, app);
    ref = this.webapp.languages;
    for (i = 0, len = ref.length; i < len; i++) {
      l = ref[i];
      this.content.translator.createLanguage(l);
    }
    process.on('SIGINT', (function(_this) {
      return function() {
        console.log("caught INT signal");
        return _this.exit();
      };
    })(this));
    process.on('SIGTERM', (function(_this) {
      return function() {
        console.log("caught TERM signal");
        return _this.exit();
      };
    })(this));
    return this.exitcheck = setInterval(((function(_this) {
      return function() {
        if (fs.existsSync("exit")) {
          _this.exit();
          fs.unlinkSync("exit");
        }
        if (fs.existsSync("update")) {
          _this.webapp.concatenator.refresh();
          return fs.unlinkSync("update");
        }
      };
    })(this)), 2000);
  };

  Server.prototype.exit = function() {
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
    return setTimeout(((function(_this) {
      return function() {
        return _this.exit();
      };
    })(this)), 5000);
  };

  Server.prototype.sessionCheck = function() {
    var i, len, ref, s;
    ref = this.sessions;
    for (i = 0, len = ref.length; i < len; i++) {
      s = ref[i];
      if (s != null) {
        s.timeCheck();
      }
    }
  };

  Server.prototype.sessionClosed = function(session) {
    var index;
    index = this.sessions.indexOf(session);
    if (index >= 0) {
      return this.sessions.splice(index, 1);
    }
  };

  Server.prototype.loadPlugins = function(callback) {
    this.plugins = [];
    return fs.readdir("../plugins", (function(_this) {
      return function(err, files) {
        var funk;
        if (files == null) {
          files = [];
        }
        funk = function() {
          var f;
          if (files.length === 0) {
            return callback();
          } else {
            f = files.splice(0, 1)[0];
            return _this.loadPlugin("../plugins/" + f, funk);
          }
        };
        return funk();
      };
    })(this));
  };

  Server.prototype.loadPlugin = function(folder, callback) {
    var Plugin, err, p;
    if (fs.existsSync(folder + "/index.js")) {
      try {
        Plugin = require(folder + "/index.js");
        p = new Plugin(this);
        this.plugins.push(p);
        console.info("loaded plugin " + folder);
      } catch (error) {
        err = error;
        console.error(err);
      }
      return callback();
    } else {
      console.info("plugin " + folder + " has no index.js");
      return callback();
    }
  };

  return Server;

})();

module.exports = this.Server;
