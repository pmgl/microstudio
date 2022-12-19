var API, Concatenator, ExportFeatures, Fonts, ForumApp, Jimp, ProjectManager, SHA256, allowedTags, fs, pug, sanitizeHTML,
  indexOf = [].indexOf;

SHA256 = require("crypto-js/sha256");

pug = require("pug");

fs = require("fs");

ProjectManager = require(__dirname + "/session/projectmanager.js");

Jimp = require("jimp");

Concatenator = require(__dirname + "/concatenator.js");

Fonts = require(__dirname + "/fonts.js");

ExportFeatures = require(__dirname + "/app/exportfeatures.js");

ForumApp = require(__dirname + "/forum/forumapp.js");

API = require(__dirname + "/api.js");

const { marked } = require("marked");

sanitizeHTML = require("sanitize-html");

allowedTags = sanitizeHTML.defaults.allowedTags.concat(["img"]);

this.WebApp = class WebApp {
  constructor(server, app) {
    var home_exp, i, j, k, len, len1, len2, m, n, plugin, r, ref, ref1, ref2, ref3;
    this.server = server;
    this.app = app;
    this.code = "";
    fs.readFile("../templates/play/manifest.json", (err, data) => {
      return this.manifest_template = data;
    });
    //@app.get /^\/[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*\/[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/,(req,res)=>
    //  redir = req.protocol+'://' + req.get('host') + req.url+"/"
    //  console.info "redirecting to: "+redir
    //  redir = res.redirect(redir)
    this.forum_app = new ForumApp(this.server, this);
    this.api = new API(this.server, this);
    this.concatenator = new Concatenator(this);
    this.fonts = new Fonts;
    this.export_features = new ExportFeatures(this);
    this.server.build_manager.createLinks(this.app);
    this.home_page = {};
    this.languages = ["en", "fr", "pl", "de", "it", "pt", "ru", "es"];
    home_exp = "^(\\/";
    for (i = j = 1, ref = this.languages.length - 1; j <= ref; i = j += 1) {
      home_exp += `|\\/${this.languages[i]}\\/?`;
      if (i === this.languages.length - 1) {
        home_exp += "|";
      }
    }
    this.reserved = ["explore", "documentation", "projects", "about", "login", "user"];
    this.reserved_exact = ["tutorials"];
    ref1 = this.reserved;
    for (k = 0, len = ref1.length; k < len; k++) {
      r = ref1[k];
      home_exp += `\\/${r}|\\/${r}\\/.*|`;
    }
    ref2 = this.reserved_exact;
    for (m = 0, len1 = ref2.length; m < len1; m++) {
      r = ref2[m];
      home_exp += `\\/${r}|\\/${r}\\/|`;
    }
    home_exp += "\\/tutorial\\/[^\\/\\|\\?\\&\\.]+\\/[^\\/\\|\\?\\&\\.]+(\\/([^\\/\\|\\?\\&\\.]+\\/?)?)|";
    home_exp += "(\\/i\\/.*))$";
    console.info(`home_exp = ${home_exp}`);
    this.app.get(new RegExp(home_exp), (req, res) => {
      var dev_domain, l, lang, len2, n, page, project, ref3, run_domain, s, translator, user;
      if (this.ensureDevArea(req, res)) {
        return;
      }
      dev_domain = this.server.config.dev_domain ? `'${this.server.config.dev_domain}'` : "location.origin";
      run_domain = this.server.config.run_domain ? `'${this.server.config.run_domain}'` : "location.origin.replace('.dev','.io')";
      lang = this.getLanguage(req);
      ref3 = this.languages;
      for (n = 0, len2 = ref3.length; n < len2; n++) {
        l = ref3[n];
        if (req.path === `/${l}` || req.path === `/${l}/`) {
          lang = l;
        }
      }
      //console.info "language=#{lang}"
      if ((this.home_funk == null) || !this.server.use_cache) {
        this.home_funk = pug.compileFile("../templates/home.pug");
      }
      if ((this.server.content.translator.languages[lang] != null) && this.server.content.translator.languages[lang].updated) {
        this.server.content.translator.languages[lang].updated = false;
        delete this.home_page[lang];
      }
      s = req.path.split("/");
      if (s[1] === "i") {
        user = s[2];
        project = s[3];
        user = this.server.content.findUserByNick(user);
        if (user == null) {
          this.return404(req, res);
          return null;
        }
        project = user.findProjectBySlug(project);
        if ((project == null) || !project.public) {
          this.return404(req, res);
          return null;
        }
        translator = this.server.content.translator.getTranslator(lang);
        page = this.home_funk({
          name: project.title,
          javascript_files: this.concatenator.getHomeJSFiles(),
          css_files: this.concatenator.getHomeCSSFiles(),
          translator: translator,
          language: lang,
          standalone: this.server.config.standalone === true,
          languages: this.languages,
          optional_libs: this.concatenator.optional_libs,
          language_engines: this.concatenator.language_engines,
          translation: this.server.content.translator.languages[lang] != null ? this.server.content.translator.languages[lang].export() : "{}",
          title: translator.get("%PROJECT% - by %USER%").replace("%PROJECT%", project.title).replace("%USER%", user.nick),
          description: project.description,
          long_description: project.description,
          poster: (project.files != null) && (project.files["sprites/poster.png"] != null) ? `https://microstudio.io/${user.nick}/${project.slug}/sprites/poster.png` : `https://microstudio.io/${user.nick}/${project.slug}/sprites/icon.png`,
          project_moderation: this.server.config.project_moderation === true,
          dev_domain: dev_domain,
          run_domain: run_domain,
          default_project_language: this.server.config.default_project_language,
          tutorials_root_url: this.server.config.tutorials_root_url
        });
        return res.send(page);
      } else if ((this.home_page[lang] == null) || !this.server.use_cache) {
        //console.info "generating home page #{lang}"
        translator = this.server.content.translator.getTranslator(lang);
        this.home_page[lang] = this.home_funk({
          name: "microStudio",
          javascript_files: this.concatenator.getHomeJSFiles(),
          css_files: this.concatenator.getHomeCSSFiles(),
          translator: translator,
          language: lang,
          standalone: this.server.config.standalone === true,
          languages: this.languages,
          optional_libs: this.concatenator.optional_libs,
          language_engines: this.concatenator.language_engines,
          translation: this.server.content.translator.languages[lang] != null ? this.server.content.translator.languages[lang].export() : "{}",
          title: "microStudio - " + translator.get("Learn programming, create games"),
          description: translator.get("Learn programming, create video games - microStudio is a free game engine online."),
          long_description: translator.get("microStudio is a free game engine online. Learn, create and share with the community. Use the built-in sprite editor, map editor and code editor to create anything."),
          poster: "https://microstudio.dev/img/microstudio.jpg",
          project_moderation: this.server.config.project_moderation === true,
          dev_domain: dev_domain,
          run_domain: run_domain,
          default_project_language: this.server.config.default_project_language,
          tutorials_root_url: this.server.config.tutorials_root_url
        });
      }
      return res.send(this.home_page[lang]);
    });
    ref3 = this.server.plugins;
    for (n = 0, len2 = ref3.length; n < len2; n++) {
      plugin = ref3[n];
      if (plugin.addWebHooks != null) {
        plugin.addWebHooks(this.app);
      }
    }
    this.app.get(/^\/discord\/?$/, (req, res) => {
      return res.redirect("https://discord.gg/nEMpBU7");
    });
    // email validation
    this.app.get(/^\/v\/\d+\/[a-z0-9A-Z]+\/?$/, (req, res, next) => {
      var redir, s, token, user, userid;
      //console.info "matched email validation"
      if (this.ensureDevArea(req, res)) {
        return;
      }
      s = req.path.split("/");
      userid = s[2];
      token = s[3];
      //console.info "userid = #{userid}"
      //console.info "token = #{token}"
      user = this.server.content.users[userid];
      if (user != null) {
        this.server.content.validateEMailAddress(user, token);
        redir = req.protocol + '://' + req.get("host");
        //console.info "redirecting to: "+redir
        return res.redirect(redir);
      }
      return this.return404(req, res);
    });
    // password recovery 1
    this.app.get(/^\/pw\/\d+\/[a-z0-9A-Z]+\/?$/, (req, res, next) => {
      var page, s, token, user, userid;
      //console.info "matched email validation"
      if (this.ensureDevArea(req, res)) {
        return;
      }
      s = req.path.split("/");
      userid = s[2];
      token = s[3];
      //console.info "userid = #{userid}"
      //console.info "token = #{token}"
      user = this.server.content.users[userid];
      if ((user != null) && user.getValidationToken() === token) {
        page = pug.compileFile("../templates/password/reset1.pug");
        return res.send(page({
          userid: userid,
          token: token
        }));
      } else {
        return this.return404(req, res);
      }
    });
    // password recovery 2
    this.app.get(/^\/pwd\/\d+\/[a-z0-9A-Z]+\/.*\/?$/, (req, res, next) => {
      var chars, hash, o, page, pass, s, salt, token, translator, user, userid;
      //console.info "matched email validation"
      if (this.ensureDevArea(req, res)) {
        return;
      }
      s = req.path.split("/");
      userid = s[2];
      token = s[3];
      pass = s[4];
      console.info(`userid = ${userid}`);
      console.info(`token = ${token}`);
      user = this.server.content.users[userid];
      if ((user != null) && user.getValidationToken() === token) {
        salt = "";
        chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (i = o = 0; o <= 15; i = o += 1) {
          salt += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        hash = salt + "|" + SHA256(salt + pass);
        user.set("hash", hash);
        user.resetValidationToken();
        translator = this.server.content.translator.getTranslator(user.language);
        user.notify(translator.get("Your password was successfully changed"));
        page = pug.compileFile("../templates/password/reset2.pug");
        return res.send(page({}));
      } else {
        return this.return404(req, res);
      }
    });
    this.app.get(/^\/lang\/list\/?$/, (req, res) => {
      if (this.ensureDevArea(req, res)) {
        return;
      }
      res.setHeader("Content-Type", "application/json");
      return res.send(JSON.stringify(this.server.content.translator.list));
    });
    this.app.get(/^\/lang\/[a-z]+\/?$/, (req, res) => {
      var lang;
      if (this.ensureDevArea(req, res)) {
        return;
      }
      lang = req.path.split("/")[2];
      lang = this.server.content.translator.languages[lang];
      res.setHeader("Content-Type", "application/json");
      if (lang != null) {
        return res.send(lang.export());
      } else {
        return res.send("{}");
      }
    });
    this.app.get(/^\/box\/?$/, (req, res) => {
      if (this.ensureIOArea(req, res)) {
        return;
      }
      //if not @console_funk? or not @server.use_cache
      this.console_funk = pug.compileFile("../templates/console/console.pug");
      return res.send(this.console_funk({
        gamelist: this.server.content.getConsoleGameList()
      }));
    });
    // /user/project[/code/]
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+\/?)?)?$/, (req, res) => {
      var access, encoding, file, jsfiles, len3, lib, manager, o, pathcode, poster, prog_lang, project, redir, ref4, user;
      if ((req.query != null) && (req.query.server != null)) {
        if (this.ensureDevArea(req, res)) {
          return;
        }
        return this.serverBox(req, res);
      }
      if (this.ensureIOArea(req, res)) {
        return;
      }
      if (req.path.charAt(req.path.length - 1) !== "/") {
        redir = req.protocol + '://' + req.get("host") + req.url + "/";
        console.info("redirecting to: " + redir);
        return res.redirect(redir);
      }
      access = this.getProjectAccess(req, res);
      if (access == null) {
        return;
      }
      user = access.user;
      project = access.project;
      file = `${user.id}/${project.id}/ms/main.ms`;
      encoding = "text";
      manager = this.getProjectManager(project);
      if ((req.query != null) && (req.query.srv != null)) {
        jsfiles = this.concatenator.getServerJSFiles();
      } else {
        jsfiles = this.concatenator.getPlayerJSFiles(project.graphics);
      }
      ref4 = project.libs;
      for (o = 0, len3 = ref4.length; o < len3; o++) {
        lib = ref4[o];
        if (this.concatenator.optional_libs[lib] != null) {
          jsfiles.push(this.concatenator.optional_libs[lib].lib);
        }
      }
      prog_lang = project.language;
      if (this.concatenator.language_engines[prog_lang] != null) {
        jsfiles = jsfiles.concat(this.concatenator.language_engines[prog_lang].scripts);
        jsfiles = jsfiles.concat(this.concatenator.language_engines[prog_lang].lib);
      }
      pathcode = project.public ? project.slug : `${project.slug}/${project.code}`;
      poster = (project.files != null) && (project.files["sprites/poster.png"] != null) ? `https://microstudio.io/${user.nick}/${pathcode}/sprites/poster.png` : `https://microstudio.io/${user.nick}/${pathcode}/icon512.png`;
      return manager.listFiles("ms", (sources) => {
        return manager.listFiles("sprites", (sprites) => {
          return manager.listFiles("maps", (maps) => {
            return manager.listFiles("sounds", (sounds) => {
              return manager.listFiles("music", (music) => {
                return manager.listFiles("assets", (assets) => {
                  var pf, resources;
                  resources = JSON.stringify({
                    sources: sources,
                    images: sprites,
                    maps: maps,
                    sounds: sounds,
                    music: music,
                    assets: assets
                  });
                  resources = `var resources = ${resources};\n`;
                  if ((req.query != null) && (req.query.srv != null)) {
                    if ((this.server_funk == null) || !this.server.use_cache) {
                      this.server_funk = pug.compileFile("../templates/play/server.pug");
                    }
                    pf = this.server_funk;
                  } else {
                    if ((this.play_funk == null) || !this.server.use_cache) {
                      this.play_funk = pug.compileFile("../templates/play/play.pug");
                    }
                    pf = this.play_funk;
                  }
                  return res.send(pf({
                    user: user,
                    javascript_files: jsfiles,
                    fonts: this.fonts.fonts,
                    debug: (req.query != null) && (req.query.debug != null),
                    server: (req.query != null) && (req.query.srv != null),
                    language: project.language,
                    translator: this.server.content.translator.getTranslator(this.getLanguage(req)),
                    game: {
                      name: project.slug,
                      pathcode: pathcode,
                      title: project.title,
                      author: user.nick,
                      resources: resources,
                      orientation: project.orientation,
                      aspect: project.aspect,
                      graphics: project.graphics,
                      networking: project.networking || false,
                      libs: JSON.stringify(project.libs),
                      description: project.description,
                      poster: poster
                    }
                  }));
                });
              });
            });
          });
        });
      });
    });
    this.app.get(/^\/[A-Za-z0-9_]+\/?$/, (req, res) => {
      if (this.ensureIOArea(req, res)) {
        return;
      }
      return this.getUserPublicPage(req, res);
    });
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/manifest.json$/, (req, res) => {
      var access, iconversion, manager, mani, path, project, s, user;
      if (this.ensureIOArea(req, res)) {
        return;
      }
      access = this.getProjectAccess(req, res);
      if (access == null) {
        return;
      }
      user = access.user;
      project = access.project;
      manager = this.getProjectManager(project);
      iconversion = manager.getFileVersion("sprites/icon.png");
      path = project.public ? `/${user.nick}/${project.slug}/` : `/${user.nick}/${project.slug}/${project.code}/`;
      res.setHeader("Content-Type", "application/json");
      s = req.path.split("/");
      mani = this.manifest_template.toString().replace(/SCOPE/g, path);
      mani = mani.toString().replace("APPNAME", project.title);
      mani = mani.toString().replace("APPSHORTNAME", project.title);
      mani = mani.toString().replace("ORIENTATION", project.orientation);
      mani = mani.toString().replace(/USER/g, user.nick);
      mani = mani.toString().replace(/PROJECT/g, project.slug);
      mani = mani.toString().replace(/ICONVERSION/g, iconversion);
      mani = mani.replace("START_URL", path);
      return res.send(mani);
    });
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/sw.js$/, (req, res) => {
      var access, project, user;
      if (this.ensureIOArea(req, res)) {
        return;
      }
      access = this.getProjectAccess(req, res);
      if (access == null) {
        return;
      }
      user = access.user;
      project = access.project;
      return fs.readFile("../static/sw.js", (err, data) => {
        res.setHeader("Content-Type", "application/javascript");
        return res.send(data);
      });
    });
    // User Profile Image
    this.app.get(/^\/[^\/\|\?\&\.]+.png$/, (req, res) => {
      var path, s, user;
      s = req.path.split("/");
      user = s[1].split(".")[0];
      user = this.server.content.findUserByNick(user);
      if ((user == null) || !user.flags.profile_image) {
        this.return404(req, res);
        return null;
      }
      path = `${user.id}/profile_image.png`;
      return this.server.content.files.read(path, "binary", (content) => {
        if (content != null) {
          res.setHeader("Content-Type", "image/png");
          return res.send(content);
        } else {
          this.return404(req, res);
          return null;
        }
      });
    });
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/icon[0-9]+.png$/, (req, res) => {
      var access, path, project, size, user;
      access = this.getProjectAccess(req, res);
      if (access == null) {
        return;
      }
      user = access.user;
      project = access.project;
      size = req.path.split("icon");
      size = size[size.length - 1];
      size = Math.min(1024, size.split(".")[0] | 0);
      path = `${user.id}/${project.id}/sprites/icon.png`;
      path = this.server.content.files.folder + "/" + this.server.content.files.sanitize(path);
      return Jimp.read(path, (err, img) => {
        if (err) {
          console.error(err);
          return;
        }
        return img.resize(size, size, Jimp.RESIZE_NEAREST_NEIGHBOR).getBuffer(Jimp.MIME_PNG, (err, buffer) => {
          if (err) {
            console.error(err);
            return;
          }
          res.setHeader("Content-Type", "image/png");
          return res.send(buffer);
        });
      });
    });
    // source files for player
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/ms\/[A-Za-z0-9_-]+.ms$/, (req, res) => {
      var access, ms, project, s, user;
      s = req.path.split("/");
      access = this.getProjectAccess(req, res);
      if (access == null) {
        return;
      }
      user = access.user;
      project = access.project;
      ms = s[s.length - 1];
      return this.server.content.files.read(`${user.id}/${project.id}/ms/${ms}`, "text", (content) => {
        if (content != null) {
          res.setHeader("Content-Type", "application/javascript");
          return res.send(content);
        } else {
          console.info(`couldn't read file: ${req.path}`);
          return res.status(404).send("Error 404");
        }
      });
    });
    // asset thumbnail
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/(assets_th|sounds_th|music_th)\/[A-Za-z0-9_-]+.png$/, (req, res) => {
      var access, asset, folder, project, s, user;
      s = req.path.split("/");
      access = this.getProjectAccess(req, res);
      if (access == null) {
        return;
      }
      user = access.user;
      project = access.project;
      folder = s[s.length - 2];
      asset = s[s.length - 1];
      //console.info "loading #{user.id}/#{project.id}/#{folder}/#{asset}"
      return this.server.content.files.read(`${user.id}/${project.id}/${folder}/${asset}`, "binary", (content) => {
        if (content != null) {
          res.setHeader("Content-Type", "image/png");
          return res.send(content);
        } else {
          console.info(`couldn't read file: ${req.path}`);
          return res.status(404).send("Error 404");
        }
      });
    });
    // image files for player ; should be deprecated in favor of /sprites/
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/[A-Za-z0-9_]+.png$/, (req, res) => {
      var access, image, project, s, user;
      s = req.path.split("/");
      access = this.getProjectAccess(req, res);
      if (access == null) {
        return;
      }
      user = access.user;
      project = access.project;
      image = s[s.length - 1];
      return this.server.content.files.read(`${user.id}/${project.id}/sprites/${image}`, "binary", (content) => {
        if (content != null) {
          res.setHeader("Content-Type", "image/png");
          return res.send(content);
        } else {
          console.info(`couldn't read file: ${req.path}`);
          return res.status(404).send("Error 404");
        }
      });
    });
    // image files for player and all
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/sprites\/[A-Za-z0-9_-]+.png$/, (req, res) => {
      var access, image, project, s, user;
      s = req.path.split("/");
      access = this.getProjectAccess(req, res);
      if (access == null) {
        return;
      }
      user = access.user;
      project = access.project;
      image = s[s.length - 1];
      return this.server.content.files.read(`${user.id}/${project.id}/sprites/${image}`, "binary", (content) => {
        if (content != null) {
          res.setHeader("Content-Type", "image/png");
          return res.send(content);
        } else {
          console.info(`couldn't read file: ${req.path}`);
          return res.status(404).send("Error 404");
        }
      });
    });
    // map files for player
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/maps\/[A-Za-z0-9_-]+.json$/, (req, res) => {
      var access, map, project, s, user;
      s = req.path.split("/");
      access = this.getProjectAccess(req, res);
      if (access == null) {
        return;
      }
      user = access.user;
      project = access.project;
      map = s[s.length - 1];
      return this.server.content.files.read(`${user.id}/${project.id}/maps/${map}`, "text", (content) => {
        if (content != null) {
          res.setHeader("Content-Type", "application/json");
          return res.send(content);
        } else {
          console.info(`couldn't read file: ${req.path}`);
          return res.status(404).send("Error 404");
        }
      });
    });
    // sound files for player and all
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/sounds\/[A-Za-z0-9_-]+.wav$/, (req, res) => {
      var access, project, s, sound, user;
      s = req.path.split("/");
      access = this.getProjectAccess(req, res);
      if (access == null) {
        return;
      }
      user = access.user;
      project = access.project;
      sound = s[s.length - 1];
      return this.server.content.files.read(`${user.id}/${project.id}/sounds/${sound}`, "binary", (content) => {
        if (content != null) {
          res.setHeader("Content-Type", "audio/wav");
          return res.send(content);
        } else {
          console.info(`couldn't read file: ${req.path}`);
          return res.status(404).send("Error 404");
        }
      });
    });
    // music files for player and all
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/music\/[A-Za-z0-9_-]+.mp3$/, (req, res) => {
      var access, music, project, s, user;
      s = req.path.split("/");
      access = this.getProjectAccess(req, res);
      if (access == null) {
        return;
      }
      user = access.user;
      project = access.project;
      music = s[s.length - 1];
      return this.server.content.files.read(`${user.id}/${project.id}/music/${music}`, "binary", (content) => {
        if (content != null) {
          res.setHeader("Content-Type", "audio/mp3");
          return res.send(content);
        } else {
          console.info(`couldn't read file: ${req.path}`);
          return res.status(404).send("Error 404");
        }
      });
    });
    // asset files
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/assets\/[A-Za-z0-9_-]+.(glb|obj|jpg|png|ttf|txt|csv|json)$/, (req, res) => {
      var access, asset, project, s, user;
      s = req.path.split("/");
      access = this.getProjectAccess(req, res);
      if (access == null) {
        return;
      }
      user = access.user;
      project = access.project;
      asset = s[s.length - 1];
      return this.server.content.files.read(`${user.id}/${project.id}/assets/${asset}`, "binary", (content) => {
        if (content != null) {
          switch (asset.split(".")[1]) {
            case "glb":
              res.setHeader("Content-Type", "model/gltf-binary");
              break;
            case "obj":
              res.setHeader("Content-Type", "model/gltf-binary");
              break;
            case "jpg":
              res.setHeader("Content-Type", "image/jpg");
              break;
            case "png":
              res.setHeader("Content-Type", "image/png");
              break;
            case "ttf":
              res.setHeader("Content-Type", "application/font-sfnt");
              break;
            case "txt":
              res.setHeader("Content-Type", "text/plain");
              break;
            case "csv":
              res.setHeader("Content-Type", "text/csv");
              break;
            case "json":
              res.setHeader("Content-Type", "application/json");
          }
          return res.send(content);
        } else {
          console.info(`couldn't read file: ${req.path}`);
          return res.status(404).send("Error 404");
        }
      });
    });
    // doc files
    this.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/doc\/[A-Za-z0-9_]+.md$/, (req, res) => {
      var access, doc, project, s, user;
      s = req.path.split("/");
      access = this.getProjectAccess(req, res);
      if (access == null) {
        return;
      }
      user = access.user;
      project = access.project;
      doc = s[s.length - 1];
      return this.server.content.files.read(`${user.id}/${project.id}/doc/${doc}`, "text", (content) => {
        if (content != null) {
          res.setHeader("Content-Type", "text/markdown");
          return res.send(content);
        } else {
          console.info(`couldn't read file: ${req.path}`);
          return res.status(404).send("Error 404");
        }
      });
    });
    this.app.use((req, res) => {
      return this.return404(req, res);
    });
  }

  return404(req, res) {
    if ((this.err404_funk == null) || !this.server.use_cache) {
      this.err404_funk = pug.compileFile("../templates/404.pug");
    }
    return res.status(404).send(this.err404_funk({}));
  }

  ensureDevArea(req, res) {
    var host, redir;
    //console.info req.get("host")
    if (req.get("host").indexOf(".io") > 0) {
      host = req.get("host").replace(".io", ".dev");
      redir = req.protocol + '://' + host + req.url;
      console.info("redirecting to: " + redir);
      redir = res.redirect(redir);
      return true;
    } else {
      return false;
    }
  }

  ensureIOArea(req, res) {
    var host, redir;
    //console.info req.get("host")
    if (req.get("host").indexOf(".dev") > 0) {
      host = req.get("host").replace(".dev", ".io");
      redir = req.protocol + '://' + host + req.url;
      console.info("redirecting to: " + redir);
      redir = res.redirect(redir);
      return true;
    } else {
      return false;
    }
  }

  serverBox(req, res) {
    var access, host, pathcode, project, server_url, user;
    access = this.getProjectAccess(req, res);
    if (access == null) {
      return;
    }
    user = access.user;
    project = access.project;
    pathcode = project.public ? project.slug : `${project.slug}/${project.code}`;
    if ((this.serverbox_funk == null) || !this.server.use_cache) {
      this.serverbox_funk = pug.compileFile("../templates/play/serverbox.pug");
    }
    host = req.get("host").replace(".dev", ".io");
    if (this.server.config.run_domain != null) {
      server_url = this.server.config.run_domain + req.path + "?srv";
    } else {
      server_url = req.protocol + '://' + host + req.url.replace("?server", "?srv");
    }
    return res.send(this.serverbox_funk({
      user: user,
      server_url: server_url,
      standalone: this.server.config.standalone === true,
      game: {
        name: project.slug,
        pathcode: pathcode,
        title: project.title,
        author: user.nick,
        description: project.description
      }
    }));
  }

  getUserPublicPage(req, res) {
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
  }

  getLanguage(request) {
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
  }

  getProjectAccess(req, res) {
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
    if (project.public || project.code === code) {
      return {
        user: user,
        project: project
      };
    }
    res.send("Project does not exist");
    return null;
  }

  getProjectManager(project) {
    if (project.manager == null) {
      new ProjectManager(project);
    }
    return project.manager;
  }

  roundRect(context, x, y, w, h, r) {
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
  }

  fillRoundRect(context, x, y, w, h, r) {
    this.roundRect(context, x, y, w, h, r);
    return context.fill();
  }

};

module.exports = this.WebApp;
