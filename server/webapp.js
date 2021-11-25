var Concatenator, ExportFeatures, Fonts, ForumApp, Jimp, ProjectManager, SHA256, allowedTags, fs, marked, pug, sanitizeHTML,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

SHA256 = require("crypto-js/sha256");

pug = require("pug");

fs = require("fs");

ProjectManager = require(__dirname + "/session/projectmanager.js");

Jimp = require("jimp");

Concatenator = require(__dirname + "/concatenator.js");

Fonts = require(__dirname + "/fonts.js");

ExportFeatures = require(__dirname + "/app/exportfeatures.js");

ForumApp = require(__dirname + "/forum/forumapp.js");

marked = require("marked");

sanitizeHTML = require("sanitize-html");

allowedTags = sanitizeHTML.defaults.allowedTags.concat(["img"]);

this.WebApp = (function() {
  function WebApp(server, app) {
    var home_exp, i, j, k, len, len1, len2, m, n, plugin, r, ref, ref1, ref2, ref3;
    this.server = server;
    this.app = app;
    this.code = "";
    fs.readFile("../templates/play/manifest.json", (function(_this) {
      return function(err, data) {
        return _this.manifest_template = data;
      };
    })(this));
    this.forum_app = new ForumApp(this.server, this);
    this.concatenator = new Concatenator(this);
    this.fonts = new Fonts;
    this.export_features = new ExportFeatures(this);
    this.server.build_manager.createLinks(this.app);
    this.home_page = {};
    this.languages = ["en", "fr", "pl", "de", "it", "pt"];
    home_exp = "^(\\/";
    for (i = j = 1, ref = this.languages.length - 1; j <= ref; i = j += 1) {
      home_exp += "|\\/" + this.languages[i] + "\\/?";
      if (i === this.languages.length - 1) {
        home_exp += "|";
      }
    }
    this.reserved = ["explore", "documentation", "projects", "about", "login", "user"];
    this.reserved_exact = ["tutorials"];
    ref1 = this.reserved;
    for (k = 0, len = ref1.length; k < len; k++) {
      r = ref1[k];
      home_exp += "\\/" + r + "|\\/" + r + "\\/.*|";
    }
    ref2 = this.reserved_exact;
    for (m = 0, len1 = ref2.length; m < len1; m++) {
      r = ref2[m];
      home_exp += "\\/" + r + "|\\/" + r + "\\/|";
    }
    home_exp += "\\/tutorial\\/[^\\/\\|\\?\\&\\.]+\\/[^\\/\\|\\?\\&\\.]+(\\/([^\\/\\|\\?\\&\\.]+\\/?)?)|";
    home_exp += "(\\/i\\/.*))$";
    console.info("home_exp = " + home_exp);
    this.app.get(new RegExp(home_exp), (function(_this) {
      return function(req, res) {
        var l, lang, len2, n, ref3;
        if (_this.ensureDevArea(req, res)) {
          return;
        }
        lang = _this.getLanguage(req);
        ref3 = _this.languages;
        for (n = 0, len2 = ref3.length; n < len2; n++) {
          l = ref3[n];
          if (req.path === ("/" + l) || req.path === ("/" + l + "/")) {
            lang = l;
          }
        }
        if ((_this.home_funk == null) || !_this.server.use_cache) {
          _this.home_funk = pug.compileFile("../templates/home.pug");
        }
        if ((_this.server.content.translator.languages[lang] != null) && _this.server.content.translator.languages[lang].updated) {
          _this.server.content.translator.languages[lang].updated = false;
          delete _this.home_page[lang];
        }
        if ((_this.home_page[lang] == null) || !_this.server.use_cache) {
          _this.home_page[lang] = _this.home_funk({
            name: "microStudio",
            javascript_files: _this.concatenator.getHomeJSFiles(),
            css_files: _this.concatenator.getHomeCSSFiles(),
            translator: _this.server.content.translator.getTranslator(lang),
            language: lang,
            standalone: _this.server.config.standalone === true,
            languages: _this.languages,
            optional_libs: _this.concatenator.optional_libs,
            language_engines: _this.concatenator.language_engines,
            translation: _this.server.content.translator.languages[lang] != null ? _this.server.content.translator.languages[lang]["export"]() : "{}"
          });
        }
        return res.send(_this.home_page[lang]);
      };
    })(this));
    ref3 = this.server.plugins;
    for (n = 0, len2 = ref3.length; n < len2; n++) {
      plugin = ref3[n];
      if (plugin.addWebHooks != null) {
        plugin.addWebHooks(this.app);
      }
    }
    this.app.get(/^\/discord\/?$/, (function(_this) {
      return function(req, res) {
        return res.redirect("https://discord.gg/nEMpBU7");
      };
    })(this));
    this.app.get(/^\/v\/\d+\/[a-z0-9A-Z]+\/?$/, (function(_this) {
      return function(req, res, next) {
        var redir, s, token, user, userid;
        if (_this.ensureDevArea(req, res)) {
          return;
        }
        s = req.path.split("/");
        userid = s[2];
        token = s[3];
        user = _this.server.content.users[userid];
        if (user != null) {
          _this.server.content.validateEMailAddress(user, token);
          redir = req.protocol + '://' + req.get("host");
          return res.redirect(redir);
        }
        return _this.return404(req, res);
      };
    })(this));
    this.app.get(/^\/pw\/\d+\/[a-z0-9A-Z]+\/?$/, (function(_this) {
      return function(req, res, next) {
        var page, s, token, user, userid;
        if (_this.ensureDevArea(req, res)) {
          return;
        }
        s = req.path.split("/");
        userid = s[2];
        token = s[3];
        user = _this.server.content.users[userid];
        if ((user != null) && user.getValidationToken() === token) {
          page = pug.compileFile("../templates/password/reset1.pug");
          return res.send(page({
            userid: userid,
            token: token
          }));
        } else {
          return _this.return404(req, res);
        }
      };
    })(this));
    this.app.get(/^\/pwd\/\d+\/[a-z0-9A-Z]+\/.*\/?$/, (function(_this) {
      return function(req, res, next) {
        var chars, hash, o, page, pass, s, salt, token, translator, user, userid;
        if (_this.ensureDevArea(req, res)) {
          return;
        }
        s = req.path.split("/");
        userid = s[2];
        token = s[3];
        pass = s[4];
        console.info("userid = " + userid);
        console.info("token = " + token);
        user = _this.server.content.users[userid];
        if ((user != null) && user.getValidationToken() === token) {
          salt = "";
          chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          for (i = o = 0; o <= 15; i = o += 1) {
            salt += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          hash = salt + "|" + SHA256(salt + pass);
          user.set("hash", hash);
          user.resetValidationToken();
          translator = _this.server.content.translator.getTranslator(user.language);
          user.notify(translator.get("Your password was successfully changed"));
          page = pug.compileFile("../templates/password/reset2.pug");
          return res.send(page({}));
        } else {
          return _this.return404(req, res);
        }
      };
    })(this));
    this.app.get(/^\/lang\/list\/?$/, (function(_this) {
      return function(req, res) {
        if (_this.ensureDevArea(req, res)) {
          return;
        }
        res.setHeader("Content-Type", "application/json");
        return res.send(JSON.stringify(_this.server.content.translator.list));
      };
    })(this));
    this.app.get(/^\/lang\/[a-z]+\/?$/, (function(_this) {
      return function(req, res) {
        var lang;
        if (_this.ensureDevArea(req, res)) {
          return;
        }
        lang = req.path.split("/")[2];
        lang = _this.server.content.translator.languages[lang];
        res.setHeader("Content-Type", "application/json");
        if (lang != null) {
          return res.send(lang["export"]());
        } else {
          return res.send("{}");
        }
      };
    })(this));
    this.app.get(/^\/box\/?$/, (function(_this) {
      return function(req, res) {
        if (_this.ensureIOArea(req, res)) {
          return;
        }
        _this.console_funk = pug.compileFile("../templates/console/console.pug");
        return res.send(_this.console_funk({
          gamelist: _this.server.content.getConsoleGameList()
        }));
      };
    })(this));
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+\/?)?)?$/, (function(_this) {
      return function(req, res) {
        var access, encoding, file, jsfiles, len3, lib, manager, o, prog_lang, project, redir, ref4, user;
        if (_this.ensureIOArea(req, res)) {
          return;
        }
        if (req.path.charAt(req.path.length - 1) !== "/") {
          redir = req.protocol + '://' + req.get("host") + req.url + "/";
          console.info("redirecting to: " + redir);
          return res.redirect(redir);
        }
        access = _this.getProjectAccess(req, res);
        if (access == null) {
          return;
        }
        user = access.user;
        project = access.project;
        file = user.id + "/" + project.id + "/ms/main.ms";
        encoding = "text";
        manager = _this.getProjectManager(project);
        jsfiles = _this.concatenator.getPlayerJSFiles(project.graphics);
        ref4 = project.libs;
        for (o = 0, len3 = ref4.length; o < len3; o++) {
          lib = ref4[o];
          if (_this.concatenator.optional_libs[lib] != null) {
            jsfiles.push(_this.concatenator.optional_libs[lib].lib);
          }
        }
        prog_lang = project.language;
        if (_this.concatenator.language_engines[prog_lang] != null) {
          jsfiles = jsfiles.concat(_this.concatenator.language_engines[prog_lang].scripts);
        }
        return manager.listFiles("ms", function(sources) {
          return manager.listFiles("sprites", function(sprites) {
            return manager.listFiles("maps", function(maps) {
              return manager.listFiles("sounds", function(sounds) {
                return manager.listFiles("music", function(music) {
                  var resources;
                  resources = JSON.stringify({
                    sources: sources,
                    images: sprites,
                    maps: maps,
                    sounds: sounds,
                    music: music
                  });
                  resources = "var resources = " + resources + ";\n";
                  if ((_this.play_funk == null) || !_this.server.use_cache) {
                    _this.play_funk = pug.compileFile("../templates/play/play.pug");
                  }
                  return res.send(_this.play_funk({
                    user: user,
                    javascript_files: jsfiles,
                    fonts: _this.fonts.fonts,
                    debug: (req.query != null) && (req.query.debug != null),
                    game: {
                      name: project.slug,
                      title: project.title,
                      author: user.nick,
                      resources: resources,
                      orientation: project.orientation,
                      aspect: project.aspect,
                      graphics: project.graphics,
                      libs: JSON.stringify(project.libs)
                    }
                  }));
                });
              });
            });
          });
        });
      };
    })(this));
    this.app.get(/^\/[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*\/?$/, (function(_this) {
      return function(req, res) {
        if (_this.ensureIOArea(req, res)) {
          return;
        }
        return _this.getUserPublicPage(req, res);
      };
    })(this));
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/manifest.json$/, (function(_this) {
      return function(req, res) {
        var access, iconversion, manager, mani, path, project, s, user;
        if (_this.ensureIOArea(req, res)) {
          return;
        }
        access = _this.getProjectAccess(req, res);
        if (access == null) {
          return;
        }
        user = access.user;
        project = access.project;
        manager = _this.getProjectManager(project);
        iconversion = manager.getFileVersion("sprites/icon.png");
        path = project["public"] ? "/" + user.nick + "/" + project.slug + "/" : "/" + user.nick + "/" + project.slug + "/" + project.code + "/";
        res.setHeader("Content-Type", "application/json");
        s = req.path.split("/");
        mani = _this.manifest_template.toString().replace(/SCOPE/g, path);
        mani = mani.toString().replace("APPNAME", project.title);
        mani = mani.toString().replace("APPSHORTNAME", project.title);
        mani = mani.toString().replace("ORIENTATION", project.orientation);
        mani = mani.toString().replace(/USER/g, user.nick);
        mani = mani.toString().replace(/PROJECT/g, project.slug);
        mani = mani.toString().replace(/ICONVERSION/g, iconversion);
        mani = mani.replace("START_URL", path);
        return res.send(mani);
      };
    })(this));
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/sw.js$/, (function(_this) {
      return function(req, res) {
        var access, project, user;
        if (_this.ensureIOArea(req, res)) {
          return;
        }
        access = _this.getProjectAccess(req, res);
        if (access == null) {
          return;
        }
        user = access.user;
        project = access.project;
        return fs.readFile("../static/sw.js", function(err, data) {
          res.setHeader("Content-Type", "application/javascript");
          return res.send(data);
        });
      };
    })(this));
    this.app.get(/^\/[^\/\|\?\&\.]+.png$/, (function(_this) {
      return function(req, res) {
        var path, s, user;
        s = req.path.split("/");
        user = s[1].split(".")[0];
        user = _this.server.content.findUserByNick(user);
        if ((user == null) || !user.flags.profile_image) {
          _this.return404(req, res);
          return null;
        }
        path = user.id + "/profile_image.png";
        return _this.server.content.files.read(path, "binary", function(content) {
          if (content != null) {
            res.setHeader("Content-Type", "image/png");
            return res.send(content);
          } else {
            _this.return404(req, res);
            return null;
          }
        });
      };
    })(this));
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/icon[0-9]+.png$/, (function(_this) {
      return function(req, res) {
        var access, path, project, size, user;
        access = _this.getProjectAccess(req, res);
        if (access == null) {
          return;
        }
        user = access.user;
        project = access.project;
        size = req.path.split("icon");
        size = size[size.length - 1];
        size = Math.min(1024, size.split(".")[0] | 0);
        path = user.id + "/" + project.id + "/sprites/icon.png";
        path = _this.server.content.files.folder + "/" + _this.server.content.files.sanitize(path);
        return Jimp.read(path, function(err, img) {
          if (err) {
            console.error(err);
            return;
          }
          return img.resize(size, size, Jimp.RESIZE_NEAREST_NEIGHBOR).getBuffer(Jimp.MIME_PNG, function(err, buffer) {
            if (err) {
              console.error(err);
              return;
            }
            res.setHeader("Content-Type", "image/png");
            return res.send(buffer);
          });
        });
      };
    })(this));
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/ms\/[A-Za-z0-9_]+.ms$/, (function(_this) {
      return function(req, res) {
        var access, ms, project, s, user;
        s = req.path.split("/");
        access = _this.getProjectAccess(req, res);
        if (access == null) {
          return;
        }
        user = access.user;
        project = access.project;
        ms = s[s.length - 1];
        return _this.server.content.files.read(user.id + "/" + project.id + "/ms/" + ms, "text", function(content) {
          if (content != null) {
            res.setHeader("Content-Type", "application/javascript");
            return res.send(content);
          } else {
            console.info("couldn't read file: " + req.path);
            return res.status(404).send("Error 404");
          }
        });
      };
    })(this));
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/(assets_th|sounds_th|music_th)\/[A-Za-z0-9_]+.png$/, (function(_this) {
      return function(req, res) {
        var access, asset, folder, project, s, user;
        s = req.path.split("/");
        access = _this.getProjectAccess(req, res);
        if (access == null) {
          return;
        }
        user = access.user;
        project = access.project;
        folder = s[s.length - 2];
        asset = s[s.length - 1];
        return _this.server.content.files.read(user.id + "/" + project.id + "/" + folder + "/" + asset, "binary", function(content) {
          if (content != null) {
            res.setHeader("Content-Type", "image/png");
            return res.send(content);
          } else {
            console.info("couldn't read file: " + req.path);
            return res.status(404).send("Error 404");
          }
        });
      };
    })(this));
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/[A-Za-z0-9_]+.png$/, (function(_this) {
      return function(req, res) {
        var access, image, project, s, user;
        s = req.path.split("/");
        access = _this.getProjectAccess(req, res);
        if (access == null) {
          return;
        }
        user = access.user;
        project = access.project;
        image = s[s.length - 1];
        return _this.server.content.files.read(user.id + "/" + project.id + "/sprites/" + image, "binary", function(content) {
          if (content != null) {
            res.setHeader("Content-Type", "image/png");
            return res.send(content);
          } else {
            console.info("couldn't read file: " + req.path);
            return res.status(404).send("Error 404");
          }
        });
      };
    })(this));
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/sprites\/[A-Za-z0-9_]+.png$/, (function(_this) {
      return function(req, res) {
        var access, image, project, s, user;
        s = req.path.split("/");
        access = _this.getProjectAccess(req, res);
        if (access == null) {
          return;
        }
        user = access.user;
        project = access.project;
        image = s[s.length - 1];
        return _this.server.content.files.read(user.id + "/" + project.id + "/sprites/" + image, "binary", function(content) {
          if (content != null) {
            res.setHeader("Content-Type", "image/png");
            return res.send(content);
          } else {
            console.info("couldn't read file: " + req.path);
            return res.status(404).send("Error 404");
          }
        });
      };
    })(this));
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/maps\/[A-Za-z0-9_]+.json$/, (function(_this) {
      return function(req, res) {
        var access, map, project, s, user;
        s = req.path.split("/");
        access = _this.getProjectAccess(req, res);
        if (access == null) {
          return;
        }
        user = access.user;
        project = access.project;
        map = s[s.length - 1];
        return _this.server.content.files.read(user.id + "/" + project.id + "/maps/" + map, "text", function(content) {
          if (content != null) {
            res.setHeader("Content-Type", "application/json");
            return res.send(content);
          } else {
            console.info("couldn't read file: " + req.path);
            return res.status(404).send("Error 404");
          }
        });
      };
    })(this));
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/sounds\/[A-Za-z0-9_]+.wav$/, (function(_this) {
      return function(req, res) {
        var access, project, s, sound, user;
        s = req.path.split("/");
        access = _this.getProjectAccess(req, res);
        if (access == null) {
          return;
        }
        user = access.user;
        project = access.project;
        sound = s[s.length - 1];
        return _this.server.content.files.read(user.id + "/" + project.id + "/sounds/" + sound, "binary", function(content) {
          if (content != null) {
            res.setHeader("Content-Type", "audio/wav");
            return res.send(content);
          } else {
            console.info("couldn't read file: " + req.path);
            return res.status(404).send("Error 404");
          }
        });
      };
    })(this));
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/music\/[A-Za-z0-9_]+.mp3$/, (function(_this) {
      return function(req, res) {
        var access, music, project, s, user;
        s = req.path.split("/");
        access = _this.getProjectAccess(req, res);
        if (access == null) {
          return;
        }
        user = access.user;
        project = access.project;
        music = s[s.length - 1];
        return _this.server.content.files.read(user.id + "/" + project.id + "/music/" + music, "binary", function(content) {
          if (content != null) {
            res.setHeader("Content-Type", "audio/mp3");
            return res.send(content);
          } else {
            console.info("couldn't read file: " + req.path);
            return res.status(404).send("Error 404");
          }
        });
      };
    })(this));
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/assets\/[A-Za-z0-9_]+.(glb|jpg|png)$/, (function(_this) {
      return function(req, res) {
        var access, asset, project, s, user;
        s = req.path.split("/");
        access = _this.getProjectAccess(req, res);
        if (access == null) {
          return;
        }
        user = access.user;
        project = access.project;
        asset = s[s.length - 1];
        return _this.server.content.files.read(user.id + "/" + project.id + "/assets/" + asset, "binary", function(content) {
          if (content != null) {
            switch (asset.split(".")[1]) {
              case "png":
                res.setHeader("Content-Type", "image/png");
                break;
              case "jpg":
                res.setHeader("Content-Type", "image/jpg");
                break;
              case "glb":
                res.setHeader("Content-Type", "model/gltf-binary");
            }
            return res.send(content);
          } else {
            console.info("couldn't read file: " + req.path);
            return res.status(404).send("Error 404");
          }
        });
      };
    })(this));
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/doc\/[A-Za-z0-9_]+.md$/, (function(_this) {
      return function(req, res) {
        var access, doc, project, s, user;
        s = req.path.split("/");
        access = _this.getProjectAccess(req, res);
        if (access == null) {
          return;
        }
        user = access.user;
        project = access.project;
        doc = s[s.length - 1];
        return _this.server.content.files.read(user.id + "/" + project.id + "/doc/" + doc, "text", function(content) {
          if (content != null) {
            res.setHeader("Content-Type", "text/markdown");
            return res.send(content);
          } else {
            console.info("couldn't read file: " + req.path);
            return res.status(404).send("Error 404");
          }
        });
      };
    })(this));
    this.app.use((function(_this) {
      return function(req, res) {
        return _this.return404(req, res);
      };
    })(this));
  }

  WebApp.prototype.return404 = function(req, res) {
    if ((this.err404_funk == null) || !this.server.use_cache) {
      this.err404_funk = pug.compileFile("../templates/404.pug");
    }
    return res.status(404).send(this.err404_funk({}));
  };

  WebApp.prototype.ensureDevArea = function(req, res) {
    var host, redir;
    if (req.get("host").indexOf(".io") > 0) {
      host = req.get("host").replace(".io", ".dev");
      redir = req.protocol + '://' + host + req.url;
      console.info("redirecting to: " + redir);
      redir = res.redirect(redir);
      return true;
    } else {
      return false;
    }
  };

  WebApp.prototype.ensureIOArea = function(req, res) {
    var host, redir;
    if (req.get("host").indexOf(".dev") > 0) {
      host = req.get("host").replace(".dev", ".io");
      redir = req.protocol + '://' + host + req.url;
      console.info("redirecting to: " + redir);
      redir = res.redirect(redir);
      return true;
    } else {
      return false;
    }
  };

  WebApp.prototype.getUserPublicPage = function(req, res) {
    var achievements, displayNumber, dxp, funk, j, key, lang, len, level, list, map, percent, projects, s, stat_list, stats, translator, unit, user, value, xp, xp1, xp2;
    s = req.path.split("/");
    user = s[1];
    user = this.server.content.findUserByNick(user);
    if (user == null) {
      return this.return404(req, res);
    }
    projects = user.listPublicProjects();
    projects.sort(function(a, b) {
      return b.last_modified - a.last_modified;
    });
    lang = this.getLanguage(req);
    translator = this.server.content.translator.getTranslator(lang);
    funk = pug.compileFile("../templates/play/userpage.pug");
    stats = user.progress.exportStats();
    map = {
      pixels_drawn: "Pixels Drawn",
      map_cells_drawn: "Map Cells Painted",
      characters_typed: "Characters Typed",
      lines_of_code: "Lines of Code",
      time_coding: "Coding Time",
      time_drawing: "Drawing Time",
      time_mapping: "Map Editor Time",
      xp: "XP",
      level: "Level"
    };
    list = ["level", "xp", "characters_typed", "lines_of_code", "pixels_drawn", "map_cells_drawn", "cells_drawn", "time_coding", "time_drawing", "time_mapping"];
    level = stats["level"] || 0;
    xp = stats["xp"] || 0;
    stat_list = [];
    displayNumber = function(x) {
      var li;
      x = "" + x;
      li = [];
      while (x.length > 3) {
        li.splice(0, 0, x.substring(x.length - 3, x.length));
        x = x.substring(0, x.length - 3);
      }
      li.splice(0, 0, x);
      return li.join(" ");
    };
    for (j = 0, len = list.length; j < len; j++) {
      key = list[j];
      value = stats[key];
      if ((value == null) || key === "xp" || key === "level") {
        continue;
      }
      unit = "";
      if (key.startsWith("time")) {
        if (value >= 60) {
          unit = translator.get("hours");
          value = Math.floor(value / 60);
        } else {
          unit = translator.get("minutes");
        }
      }
      stat_list.push({
        name: map[key] ? translator.get(map[key]) : key,
        value: displayNumber(value),
        unit: unit
      });
    }
    xp1 = level > 0 ? user.progress.levels.total_cost[level - 1] : 0;
    xp2 = user.progress.levels.total_cost[level];
    dxp = xp2 - xp1;
    percent = Math.max(0, Math.min(99, Math.floor((xp - xp1) / dxp * 100)));
    achievements = user.progress.exportAchievements();
    achievements.sort(function(a, b) {
      return b.date - a.date;
    });
    return res.send(funk({
      user: user.nick,
      profile_image: user.flags.profile_image === true,
      description: sanitizeHTML(marked(user.description), {
        allowedTags: allowedTags
      }),
      projects: projects,
      stats: stat_list,
      level: level,
      xp: xp,
      percent: percent,
      achievements: achievements,
      translator: this.server.content.translator.getTranslator(lang),
      language: lang
    }));
  };

  WebApp.prototype.getLanguage = function(request) {
    var lang;
    if (request.cookies.language != null) {
      lang = request.cookies.language;
    } else {
      lang = request.headers["accept-language"];
    }
    if ((lang != null) && lang.length >= 2) {
      lang = lang.substring(0, 2);
    } else {
      lang = "en";
    }
    if (indexOf.call(this.languages, lang) < 0) {
      lang = "en";
    }
    return lang;
  };

  WebApp.prototype.getProjectAccess = function(req, res) {
    var code, project, s, user;
    s = req.path.split("/");
    user = s[1];
    project = s[2];
    code = s[3];
    user = this.server.content.findUserByNick(user);
    if (user == null) {
      this.return404(req, res);
      return null;
    }
    project = user.findProjectBySlug(project);
    if (project == null) {
      this.return404(req, res);
      return null;
    }
    if (project["public"] || project.code === code) {
      return {
        user: user,
        project: project
      };
    }
    res.send("Project does not exist");
    return null;
  };

  WebApp.prototype.getProjectManager = function(project) {
    if (project.manager == null) {
      new ProjectManager(project);
    }
    return project.manager;
  };

  WebApp.prototype.roundRect = function(context, x, y, w, h, r) {
    if (w < 2 * r) {
      r = w / 2;
    }
    if (h < 2 * r) {
      r = h / 2;
    }
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + w, y, x + w, y + h, r);
    context.arcTo(x + w, y + h, x, y + h, r);
    context.arcTo(x, y + h, x, y, r);
    context.arcTo(x, y, x + w, y, r);
    return context.closePath();
  };

  WebApp.prototype.fillRoundRect = function(context, x, y, w, h, r) {
    this.roundRect(context, x, y, w, h, r);
    return context.fill();
  };

  return WebApp;

})();

module.exports = this.WebApp;
