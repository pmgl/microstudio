var ForumSession, JSZip, ProjectManager, RegexLib, SHA256,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

SHA256 = require("crypto-js/sha256");

ProjectManager = require(__dirname + "/projectmanager.js");

RegexLib = require(__dirname + "/../../static/js/util/regexlib.js");

ForumSession = require(__dirname + "/../forum/forumsession.js");

JSZip = require("jszip");

this.Session = (function() {
  function Session(server, socket) {
    var j, len1, plugin, ref;
    this.server = server;
    this.socket = socket;
    this.bufferReceived = bind(this.bufferReceived, this);
    this.uploadRequest = bind(this.uploadRequest, this);
    this.content = this.server.content;
    if (this.content == null) {
      return this.socket.close();
    }
    this.translator = this.content.translator.getTranslator("en");
    this.user = null;
    this.token = null;
    this.checkCookie();
    this.last_active = Date.now();
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
        if (_this.user) {
          console.error("WS ERROR for user " + _this.user.id + " - " + _this.user.nick);
        } else {
          console.error("WS ERROR");
        }
        return console.error(err);
      };
    })(this));
    this.commands = {};
    this.register("ping", (function(_this) {
      return function(msg) {
        _this.send({
          name: "pong"
        });
        return _this.checkUpdates();
      };
    })(this));
    this.register("create_account", (function(_this) {
      return function(msg) {
        return _this.createAccount(msg);
      };
    })(this));
    this.register("create_guest", (function(_this) {
      return function(msg) {
        return _this.createGuestAccount(msg);
      };
    })(this));
    this.register("login", (function(_this) {
      return function(msg) {
        return _this.login(msg);
      };
    })(this));
    this.register("send_password_recovery", (function(_this) {
      return function(msg) {
        return _this.sendPasswordRecovery(msg);
      };
    })(this));
    this.register("token", (function(_this) {
      return function(msg) {
        return _this.checkToken(msg);
      };
    })(this));
    this.register("delete_guest", (function(_this) {
      return function(msg) {
        return _this.deleteGuest(msg);
      };
    })(this));
    this.register("send_validation_mail", (function(_this) {
      return function(msg) {
        return _this.sendValidationMail(msg);
      };
    })(this));
    this.register("change_email", (function(_this) {
      return function(msg) {
        return _this.changeEmail(msg);
      };
    })(this));
    this.register("change_nick", (function(_this) {
      return function(msg) {
        return _this.changeNick(msg);
      };
    })(this));
    this.register("change_password", (function(_this) {
      return function(msg) {
        return _this.changePassword(msg);
      };
    })(this));
    this.register("change_newsletter", (function(_this) {
      return function(msg) {
        return _this.changeNewsletter(msg);
      };
    })(this));
    this.register("change_experimental", (function(_this) {
      return function(msg) {
        return _this.changeExperimental(msg);
      };
    })(this));
    this.register("set_user_setting", (function(_this) {
      return function(msg) {
        return _this.setUserSetting(msg);
      };
    })(this));
    this.register("set_user_profile", (function(_this) {
      return function(msg) {
        return _this.setUserProfile(msg);
      };
    })(this));
    this.register("create_project", (function(_this) {
      return function(msg) {
        return _this.createProject(msg);
      };
    })(this));
    this.register("import_project", (function(_this) {
      return function(msg) {
        return _this.importProject(msg);
      };
    })(this));
    this.register("set_project_option", (function(_this) {
      return function(msg) {
        return _this.setProjectOption(msg);
      };
    })(this));
    this.register("set_project_public", (function(_this) {
      return function(msg) {
        return _this.setProjectPublic(msg);
      };
    })(this));
    this.register("set_project_tags", (function(_this) {
      return function(msg) {
        return _this.setProjectTags(msg);
      };
    })(this));
    this.register("delete_project", (function(_this) {
      return function(msg) {
        return _this.deleteProject(msg);
      };
    })(this));
    this.register("get_project_list", (function(_this) {
      return function(msg) {
        return _this.getProjectList(msg);
      };
    })(this));
    this.register("update_code", (function(_this) {
      return function(msg) {
        return _this.updateCode(msg);
      };
    })(this));
    this.register("lock_project_file", (function(_this) {
      return function(msg) {
        return _this.lockProjectFile(msg);
      };
    })(this));
    this.register("write_project_file", (function(_this) {
      return function(msg) {
        return _this.writeProjectFile(msg);
      };
    })(this));
    this.register("read_project_file", (function(_this) {
      return function(msg) {
        return _this.readProjectFile(msg);
      };
    })(this));
    this.register("rename_project_file", (function(_this) {
      return function(msg) {
        return _this.renameProjectFile(msg);
      };
    })(this));
    this.register("delete_project_file", (function(_this) {
      return function(msg) {
        return _this.deleteProjectFile(msg);
      };
    })(this));
    this.register("list_project_files", (function(_this) {
      return function(msg) {
        return _this.listProjectFiles(msg);
      };
    })(this));
    this.register("list_public_project_files", (function(_this) {
      return function(msg) {
        return _this.listPublicProjectFiles(msg);
      };
    })(this));
    this.register("read_public_project_file", (function(_this) {
      return function(msg) {
        return _this.readPublicProjectFile(msg);
      };
    })(this));
    this.register("listen_to_project", (function(_this) {
      return function(msg) {
        return _this.listenToProject(msg);
      };
    })(this));
    this.register("get_file_versions", (function(_this) {
      return function(msg) {
        return _this.getFileVersions(msg);
      };
    })(this));
    this.register("invite_to_project", (function(_this) {
      return function(msg) {
        return _this.inviteToProject(msg);
      };
    })(this));
    this.register("accept_invite", (function(_this) {
      return function(msg) {
        return _this.acceptInvite(msg);
      };
    })(this));
    this.register("remove_project_user", (function(_this) {
      return function(msg) {
        return _this.removeProjectUser(msg);
      };
    })(this));
    this.register("get_public_projects", (function(_this) {
      return function(msg) {
        return _this.getPublicProjects(msg);
      };
    })(this));
    this.register("get_public_project", (function(_this) {
      return function(msg) {
        return _this.getPublicProject(msg);
      };
    })(this));
    this.register("clone_project", (function(_this) {
      return function(msg) {
        return _this.cloneProject(msg);
      };
    })(this));
    this.register("clone_public_project", (function(_this) {
      return function(msg) {
        return _this.clonePublicProject(msg);
      };
    })(this));
    this.register("toggle_like", (function(_this) {
      return function(msg) {
        return _this.toggleLike(msg);
      };
    })(this));
    this.register("get_language", (function(_this) {
      return function(msg) {
        return _this.getLanguage(msg);
      };
    })(this));
    this.register("get_translation_list", (function(_this) {
      return function(msg) {
        return _this.getTranslationList(msg);
      };
    })(this));
    this.register("set_translation", (function(_this) {
      return function(msg) {
        return _this.setTranslation(msg);
      };
    })(this));
    this.register("add_translation", (function(_this) {
      return function(msg) {
        return _this.addTranslation(msg);
      };
    })(this));
    this.register("get_project_comments", (function(_this) {
      return function(msg) {
        return _this.getProjectComments(msg);
      };
    })(this));
    this.register("add_project_comment", (function(_this) {
      return function(msg) {
        return _this.addProjectComment(msg);
      };
    })(this));
    this.register("delete_project_comment", (function(_this) {
      return function(msg) {
        return _this.deleteProjectComment(msg);
      };
    })(this));
    this.register("edit_project_comment", (function(_this) {
      return function(msg) {
        return _this.editProjectComment(msg);
      };
    })(this));
    this.register("build_project", (function(_this) {
      return function(msg) {
        return _this.buildProject(msg);
      };
    })(this));
    this.register("get_build_status", (function(_this) {
      return function(msg) {
        return _this.getBuildStatus(msg);
      };
    })(this));
    this.register("start_builder", (function(_this) {
      return function(msg) {
        return _this.startBuilder(msg);
      };
    })(this));
    this.register("backup_complete", (function(_this) {
      return function(msg) {
        return _this.backupComplete(msg);
      };
    })(this));
    this.register("upload_request", (function(_this) {
      return function(msg) {
        return _this.uploadRequest(msg);
      };
    })(this));
    this.register("tutorial_completed", (function(_this) {
      return function(msg) {
        return _this.tutorialCompleted(msg);
      };
    })(this));
    ref = this.server.plugins;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      plugin = ref[j];
      if (plugin.registerSessionMessages != null) {
        plugin.registerSessionMessages(this);
      }
    }
    this.forum_session = new ForumSession(this);
    this.reserved_nicks = {
      "admin": true,
      "api": true,
      "static": true,
      "blog": true,
      "news": true,
      "about": true,
      "discord": true,
      "article": true,
      "forum": true,
      "community": true
    };
  }

  Session.prototype.checkCookie = function() {
    var cookie, error;
    try {
      cookie = this.socket.request.headers.cookie;
      if ((cookie != null) && cookie.indexOf("token") >= 0) {
        cookie = cookie.split("token")[1];
        cookie = cookie.split("=")[1];
        if (cookie != null) {
          cookie = cookie.split(";")[0];
          this.token = cookie.trim();
          this.token = this.content.findToken(this.token);
          if (this.token != null) {
            this.user = this.token.user;
            this.user.addListener(this);
            this.send({
              name: "token_valid",
              nick: this.user.nick,
              flags: !this.user.flags.censored ? this.user.flags : [],
              info: this.getUserInfo(),
              settings: this.user.settings
            });
            this.user.set("last_active", Date.now());
            return this.logActiveUser();
          }
        }
      }
    } catch (error1) {
      error = error1;
      return console.error(error);
    }
  };

  Session.prototype.logActiveUser = function() {
    if (this.user == null) {
      return;
    }
    if (this.user.flags.guest) {
      return this.server.stats.unique("active_guests", this.user.id);
    } else {
      return this.server.stats.unique("active_users", this.user.id);
    }
  };

  Session.prototype.register = function(name, callback) {
    return this.commands[name] = callback;
  };

  Session.prototype.disconnected = function() {
    if ((this.project != null) && (this.project.manager != null)) {
      this.project.manager.removeUser(this);
      this.project.manager.removeListener(this);
    }
    if (this.user != null) {
      return this.user.removeListener(this);
    }
  };

  Session.prototype.setCurrentProject = function(project) {
    if (project !== this.project || (this.project.manager == null)) {
      if ((this.project != null) && (this.project.manager != null)) {
        this.project.manager.removeUser(this);
      }
      this.project = project;
      if (this.project.manager == null) {
        new ProjectManager(this.project);
      }
      return this.project.manager.addUser(this);
    }
  };

  Session.prototype.messageReceived = function(msg) {
    var c, err;
    if (typeof msg !== "string") {
      return this.bufferReceived(msg);
    }
    try {
      msg = JSON.parse(msg);
      if (msg.name != null) {
        c = this.commands[msg.name];
        if (c != null) {
          c(msg);
        }
      }
    } catch (error1) {
      err = error1;
      console.info(err);
    }
    this.server.stats.inc("websocket_requests");
    if (this.user != null) {
      return this.logActiveUser();
    }
  };

  Session.prototype.sendCodeUpdated = function(file, code) {
    this.send({
      name: "code_updated",
      file: file,
      code: code
    });
  };

  Session.prototype.sendProjectFileUpdated = function(type, file, version, data, properties) {
    return this.send({
      name: "project_file_updated",
      type: type,
      file: file,
      version: version,
      data: data,
      properties: properties
    });
  };

  Session.prototype.sendProjectFileDeleted = function(type, file) {
    return this.send({
      name: "project_file_deleted",
      type: type,
      file: file
    });
  };

  Session.prototype.createGuestAccount = function(data) {
    var chars, i, j, nick;
    if (!this.server.rate_limiter.accept("create_account_ip", this.socket.remoteAddress)) {
      return;
    }
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    while (true) {
      nick = "";
      for (i = j = 0; j <= 9; i = j += 1) {
        nick += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (!this.content.findUserByNick(nick)) {
        break;
      }
    }
    this.user = this.content.createUser({
      nick: nick,
      flags: {
        guest: true
      },
      language: data.language,
      date_created: Date.now(),
      last_active: Date.now(),
      creation_ip: this.socket.remoteAddress
    });
    this.user.addListener(this);
    this.send({
      name: "guest_created",
      nick: nick,
      flags: this.user.flags,
      info: this.getUserInfo(),
      settings: this.user.settings,
      token: this.content.createToken(this.user).value,
      request_id: data.request_id
    });
    return this.logActiveUser();
  };

  Session.prototype.deleteGuest = function(data) {
    if ((this.user != null) && this.user.flags.guest) {
      this.user["delete"]();
      return this.send({
        name: "guest_deleted",
        request_id: data.request_id
      });
    }
  };

  Session.prototype.createAccount = function(data) {
    var chars, hash, i, j, salt;
    if (data.email == null) {
      return this.sendError(this.translator.get("email not specified"), data.request_id);
    }
    if (data.nick == null) {
      return this.sendError(this.translator.get("nickname not specified"), data.request_id);
    }
    if (data.password == null) {
      return this.sendError(this.translator.get("password not specified"), data.request_id);
    }
    if (this.content.findUserByEmail(data.email)) {
      return this.sendError(this.translator.get("email already exists"), data.request_id);
    }
    if (this.content.findUserByNick(data.nick)) {
      return this.sendError(this.translator.get("nickname already exists"), data.request_id);
    }
    if (this.reserved_nicks[data.nick]) {
      return this.sendError(this.translator.get("nickname already exists"), data.request_id);
    }
    if (!RegexLib.nick.test(data.nick)) {
      return this.sendError(this.translator.get("Incorrect nickname. Use 5 characters minimum, only letters, numbers or _"), data.request_id);
    }
    if (!RegexLib.email.test(data.email)) {
      return this.sendError(this.translator.get("Incorrect e-mail address"), data.request_id);
    }
    if (data.password.trim().length < 6) {
      return this.sendError(this.translator.get("Password too weak"), data.request_id);
    }
    if (!this.server.rate_limiter.accept("create_account_ip", this.socket.remoteAddress)) {
      return;
    }
    salt = "";
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (i = j = 0; j <= 15; i = j += 1) {
      salt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    hash = salt + "|" + SHA256(salt + data.password);
    if ((this.user != null) && this.user.flags.guest) {
      this.server.content.changeUserNick(this.user, data.nick);
      this.server.content.changeUserEmail(this.user, data.email);
      this.user.setFlag("guest", false);
      this.user.setFlag("newsletter", data.newsletter);
      this.user.set("hash", hash);
      this.user.resetValidationToken();
    } else {
      this.user = this.content.createUser({
        nick: data.nick,
        email: data.email,
        flags: {
          newsletter: data.newsletter
        },
        language: data.language,
        hash: hash,
        date_created: Date.now(),
        last_active: Date.now(),
        creation_ip: this.socket.remoteAddress
      });
      this.user.addListener(this);
    }
    this.send({
      name: "account_created",
      nick: data.nick,
      email: data.email,
      flags: this.user.flags,
      info: this.getUserInfo(),
      settings: this.user.settings,
      notifications: [this.server.content.translator.getTranslator(data.language).get("Account created successfully!")],
      token: this.content.createToken(this.user).value,
      request_id: data.request_id
    });
    this.sendValidationMail();
    return this.logActiveUser();
  };

  Session.prototype.login = function(data) {
    var h, hash, s, user;
    if (data.nick == null) {
      return;
    }
    if (!this.server.rate_limiter.accept("login_ip", this.socket.remoteAddress)) {
      return;
    }
    if (!this.server.rate_limiter.accept("login_user", data.nick)) {
      return;
    }
    user = this.content.findUserByNick(data.nick);
    if (user == null) {
      user = this.content.findUserByEmail(data.nick);
    }
    if ((user != null) && (user.hash != null)) {
      hash = user.hash;
      s = hash.split("|");
      h = SHA256(s[0] + data.password);
      if (h.toString() === s[1]) {
        this.user = user;
        this.user.addListener(this);
        this.send({
          name: "logged_in",
          token: this.content.createToken(this.user).value,
          nick: this.user.nick,
          email: this.user.email,
          flags: !this.user.flags.censored ? this.user.flags : {},
          info: this.getUserInfo(),
          settings: this.user.settings,
          notifications: this.user.notifications,
          request_id: data.request_id
        });
        this.user.notifications = [];
        return this.logActiveUser();
      } else {
        return this.sendError("wrong password", data.request_id);
      }
    } else {
      return this.sendError("unknown user", data.request_id);
    }
  };

  Session.prototype.getUserInfo = function() {
    return {
      size: this.user.getTotalSize(),
      early_access: this.user.early_access,
      max_storage: this.user.max_storage,
      description: this.user.description,
      stats: this.user.progress.exportStats(),
      achievements: this.user.progress.exportAchievements()
    };
  };

  Session.prototype.sendPasswordRecovery = function(data) {
    var user;
    if (data.email != null) {
      user = this.content.findUserByEmail(data.email);
      if (user != null) {
        if (this.server.rate_limiter.accept("send_mail_user", user.id)) {
          this.server.content.sendPasswordRecoveryMail(user);
        }
      }
    }
    return this.send({
      name: "send_password_recovery",
      request_id: data.request_id
    });
  };

  Session.prototype.checkToken = function(data) {
    var token;
    if (this.server.config.standalone && this.content.user_count === 1) {
      this.user = this.server.content.users[0];
      this.user.addListener(this);
      this.send({
        name: "token_valid",
        nick: this.user.nick,
        email: this.user.email,
        flags: !this.user.flags.censored ? this.user.flags : {},
        info: this.getUserInfo(),
        settings: this.user.settings,
        notifications: this.user.notifications,
        request_id: data.request_id
      });
      this.user.notifications = [];
      this.user.set("last_active", Date.now());
      this.logActiveUser();
    }
    token = this.content.findToken(data.token);
    if (token != null) {
      this.user = token.user;
      this.user.addListener(this);
      this.send({
        name: "token_valid",
        nick: this.user.nick,
        email: this.user.email,
        flags: !this.user.flags.censored ? this.user.flags : {},
        info: this.getUserInfo(),
        settings: this.user.settings,
        notifications: this.user.notifications,
        request_id: data.request_id
      });
      this.user.notifications = [];
      this.user.set("last_active", Date.now());
      return this.logActiveUser();
    } else {
      return this.sendError("invalid token", data.request_id);
    }
  };

  Session.prototype.send = function(data) {
    return this.socket.send(JSON.stringify(data));
  };

  Session.prototype.sendError = function(error, request_id) {
    return this.send({
      name: "error",
      error: error,
      request_id: request_id
    });
  };

  Session.prototype.importProject = function(data) {
    var buffer, projectFileName, zip;
    if (data.request_id == null) {
      return this.sendError("Bad request");
    }
    if (this.user == null) {
      return this.sendError("not connected", data.request_id);
    }
    if (this.server.PROD && !this.user.flags.validated) {
      return this.sendError("Email validation is required", data.request_id);
    }
    if (!this.server.rate_limiter.accept("import_project_user", this.user.id)) {
      return this.sendError("Rate limited", data.request_id);
    }
    buffer = data.data;
    if (buffer.byteLength > this.user.max_storage - this.user.getTotalSize()) {
      return this.sendError("storage space exceeded", data.request_id);
    }
    zip = new JSZip;
    projectFileName = "project.json";
    return zip.loadAsync(buffer).then(((function(_this) {
      return function(contents) {
        if (zip.file(projectFileName) == null) {
          _this.sendError("[ZIP] Missing " + projectFileName + "; import aborted", data.request_id);
          console.log("[ZIP] Missing " + projectFileName + "; import aborted");
          return;
        }
        return zip.file(projectFileName).async("string").then((function(text) {
          var err, projectInfo;
          try {
            projectInfo = JSON.parse(text);
          } catch (error1) {
            err = error1;
            _this.sendError("Incorrect JSON data", data.request_id);
            console.error(err);
            return;
          }
          return _this.content.createProject(_this.user, projectInfo, (function(project) {
            _this.setCurrentProject(project);
            return project.manager.importFiles(contents, function() {
              project.set("files", projectInfo.files || {});
              return _this.send({
                name: "project_imported",
                id: project.id,
                request_id: data.request_id
              });
            });
          }), true);
        }), function() {
          return _this.sendError("Malformed ZIP file", data.request_id);
        });
      };
    })(this)), (function(_this) {
      return function() {
        return _this.sendError("Malformed ZIP file", data.request_id);
      };
    })(this));
  };

  Session.prototype.createProject = function(data) {
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (!this.server.rate_limiter.accept("create_project_user", this.user.id)) {
      return;
    }
    return this.content.createProject(this.user, data, (function(_this) {
      return function(project) {
        return _this.send({
          name: "project_created",
          id: project.id,
          request_id: data.request_id
        });
      };
    })(this));
  };

  Session.prototype.clonePublicProject = function(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (!this.server.rate_limiter.accept("create_project_user", this.user.id)) {
      return;
    }
    if (data.project == null) {
      return this.sendError("");
    }
    project = this.server.content.projects[data.project];
    if ((project != null) && project["public"]) {
      return this.content.createProject(this.user, {
        title: project.title,
        slug: project.slug,
        "public": false
      }, ((function(_this) {
        return function(clone) {
          var files, folders, funk, man;
          clone.setType(project.type);
          clone.setOrientation(project.orientation);
          clone.setAspect(project.aspect);
          clone.set("language", project.language);
          clone.setGraphics(project.graphics);
          clone.set("libs", project.libs);
          clone.set("files", JSON.parse(JSON.stringify(project.files)));
          man = _this.getProjectManager(project);
          folders = ["ms", "sprites", "maps", "sounds", "sounds_th", "music", "music_th", "doc"];
          files = [];
          funk = function() {
            var dest, f, folder, src;
            if (folders.length > 0) {
              folder = folders.splice(0, 1)[0];
              return man.listFiles(folder, function(list) {
                var f, j, len1;
                for (j = 0, len1 = list.length; j < len1; j++) {
                  f = list[j];
                  files.push({
                    file: f.file,
                    folder: folder
                  });
                }
                return funk();
              });
            } else if (files.length > 0) {
              f = files.splice(0, 1)[0];
              src = project.owner.id + "/" + project.id + "/" + f.folder + "/" + f.file;
              dest = clone.owner.id + "/" + clone.id + "/" + f.folder + "/" + f.file;
              return _this.server.content.files.copy(src, dest, function() {
                return funk();
              });
            } else {
              return _this.send({
                name: "project_created",
                id: clone.id,
                request_id: data.request_id
              });
            }
          };
          return funk();
        };
      })(this)), true);
    }
  };

  Session.prototype.cloneProject = function(data) {
    var manager, project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (!this.server.rate_limiter.accept("create_project_user", this.user.id)) {
      return;
    }
    if (data.project == null) {
      return this.sendError("");
    }
    project = this.server.content.projects[data.project];
    if (project != null) {
      manager = this.getProjectManager(project);
      if (manager.canRead(this.user)) {
        return this.content.createProject(this.user, {
          title: data.title || project.title,
          slug: project.slug,
          "public": false
        }, ((function(_this) {
          return function(clone) {
            var files, folders, funk, man;
            clone.setType(project.type);
            clone.setOrientation(project.orientation);
            clone.setAspect(project.aspect);
            clone.set("language", project.language);
            clone.setGraphics(project.graphics);
            clone.set("libs", project.libs);
            clone.set("files", JSON.parse(JSON.stringify(project.files)));
            man = _this.getProjectManager(project);
            folders = ["ms", "sprites", "maps", "sounds", "sounds_th", "music", "music_th", "doc"];
            files = [];
            funk = function() {
              var dest, f, folder, src;
              if (folders.length > 0) {
                folder = folders.splice(0, 1)[0];
                return man.listFiles(folder, function(list) {
                  var f, j, len1;
                  for (j = 0, len1 = list.length; j < len1; j++) {
                    f = list[j];
                    files.push({
                      file: f.file,
                      folder: folder
                    });
                  }
                  return funk();
                });
              } else if (files.length > 0) {
                f = files.splice(0, 1)[0];
                src = project.owner.id + "/" + project.id + "/" + f.folder + "/" + f.file;
                dest = clone.owner.id + "/" + clone.id + "/" + f.folder + "/" + f.file;
                return _this.server.content.files.copy(src, dest, function() {
                  return funk();
                });
              } else {
                return _this.send({
                  name: "project_created",
                  id: clone.id,
                  request_id: data.request_id
                });
              }
            };
            return funk();
          };
        })(this)), true);
      }
    }
  };

  Session.prototype.getProjectManager = function(project) {
    if (project.manager == null) {
      new ProjectManager(project);
    }
    return project.manager;
  };

  Session.prototype.setProjectPublic = function(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (data["public"] && !this.user.flags["validated"]) {
      return;
    }
    if (data.project == null) {
      if (this.user.flags.admin && data.id) {
        project = this.content.projects[data.id];
        if (project != null) {
          this.content.setProjectPublic(project, data["public"]);
          return this.send({
            name: "set_project_public",
            id: project.id,
            "public": project["public"],
            request_id: data.request_id
          });
        }
      }
    } else {
      project = this.user.findProject(data.project);
      if (project != null) {
        this.content.setProjectPublic(project, data["public"]);
        return this.send({
          name: "set_project_public",
          id: project.id,
          "public": project["public"],
          request_id: data.request_id
        });
      }
    }
  };

  Session.prototype.setProjectTags = function(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (data["public"] && !this.user.flags["validated"]) {
      return;
    }
    if (data.project == null) {
      return;
    }
    project = this.user.findProject(data.project);
    if ((project == null) && this.user.flags.admin) {
      project = this.content.projects[data.project];
    }
    if ((project != null) && (data.tags != null)) {
      this.content.setProjectTags(project, data.tags);
      return this.send({
        name: "set_project_tags",
        id: project.id,
        tags: project.tags,
        request_id: data.request_id
      });
    }
  };

  Session.prototype.setProjectOption = function(data) {
    var j, len1, project, ref, v;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (data.value == null) {
      return this.sendError("no value");
    }
    project = this.user.findProject(data.project);
    if (project != null) {
      switch (data.option) {
        case "title":
          if (!project.setTitle(data.value)) {
            this.send({
              name: "error",
              value: project.title,
              request_id: data.request_id
            });
          }
          break;
        case "slug":
          if (!project.setSlug(data.value)) {
            this.send({
              name: "error",
              value: project.slug,
              request_id: data.request_id
            });
          }
          break;
        case "description":
          project.set("description", data.value);
          break;
        case "code":
          if (!project.setCode(data.value)) {
            this.send({
              name: "error",
              value: project.code,
              request_id: data.request_id
            });
          }
          break;
        case "platforms":
          if (Array.isArray(data.value)) {
            project.setPlatforms(data.value);
          }
          break;
        case "libs":
          if (Array.isArray(data.value)) {
            ref = data.value;
            for (j = 0, len1 = ref.length; j < len1; j++) {
              v = ref[j];
              if (typeof v !== "string" || v.length > 100 || data.value.length > 20) {
                return;
              }
            }
            project.set("libs", data.value);
          }
          break;
        case "type":
          if (typeof data.value === "string") {
            project.setType(data.value);
          }
          break;
        case "orientation":
          if (typeof data.value === "string") {
            project.setOrientation(data.value);
          }
          break;
        case "aspect":
          if (typeof data.value === "string") {
            project.setAspect(data.value);
          }
          break;
        case "graphics":
          if (typeof data.value === "string") {
            project.setGraphics(data.value);
          }
          break;
        case "unlisted":
          project.set("unlisted", data.value ? true : false);
          break;
        case "language":
          project.set("language", data.value);
      }
      if (project.manager != null) {
        project.manager.propagateOptions(this);
      }
      return project.touch();
    }
  };

  Session.prototype.deleteProject = function(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    project = this.user.findProject(data.project);
    if (project != null) {
      this.user.deleteProject(project);
      return this.send({
        name: "project_deleted",
        id: project.id,
        request_id: data.request_id
      });
    }
  };

  Session.prototype.getProjectList = function(data) {
    var j, k, len1, len2, link, list, p, source;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    source = this.user.listProjects();
    list = [];
    for (j = 0, len1 = source.length; j < len1; j++) {
      p = source[j];
      if (!p.deleted) {
        list.push({
          id: p.id,
          owner: {
            id: p.owner.id,
            nick: p.owner.nick
          },
          title: p.title,
          slug: p.slug,
          code: p.code,
          description: p.description,
          tags: p.tags,
          platforms: p.platforms,
          controls: p.controls,
          type: p.type,
          orientation: p.orientation,
          aspect: p.aspect,
          graphics: p.graphics,
          language: p.language,
          libs: p.libs,
          date_created: p.date_created,
          last_modified: p.last_modified,
          "public": p["public"],
          unlisted: p.unlisted,
          size: p.getSize(),
          users: p.listUsers()
        });
      }
    }
    source = this.user.listProjectLinks();
    for (k = 0, len2 = source.length; k < len2; k++) {
      link = source[k];
      if (!link.project.deleted) {
        p = link.project;
        list.push({
          id: p.id,
          owner: {
            id: p.owner.id,
            nick: p.owner.nick
          },
          accepted: link.accepted,
          title: p.title,
          slug: p.slug,
          code: p.code,
          description: p.description,
          tags: p.tags,
          platforms: p.platforms,
          controls: p.controls,
          type: p.type,
          orientation: p.orientation,
          aspect: p.aspect,
          graphics: p.graphics,
          language: p.language,
          libs: p.libs,
          date_created: p.date_created,
          last_modified: p.last_modified,
          "public": p["public"],
          unlisted: p.unlisted,
          users: p.listUsers()
        });
      }
    }
    return this.send({
      name: "project_list",
      list: list,
      request_id: data != null ? data.request_id : void 0
    });
  };

  Session.prototype.lockProjectFile = function(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if (project != null) {
      this.setCurrentProject(project);
      return project.manager.lockFile(this, data.file);
    }
  };

  Session.prototype.writeProjectFile = function(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if (project != null) {
      this.setCurrentProject(project);
      project.manager.writeProjectFile(this, data);
      if (typeof data.file === "string") {
        if (data.file.startsWith("ms/")) {
          this.user.progress.recordTime("time_coding");
          if (data.characters != null) {
            this.user.progress.incrementLimitedStat("characters_typed", data.characters);
          }
          if (data.lines != null) {
            this.user.progress.incrementLimitedStat("lines_of_code", data.lines);
          }
          return this.checkUpdates();
        } else if (data.file.startsWith("sprites/")) {
          this.user.progress.recordTime("time_drawing");
          if (data.pixels != null) {
            this.user.progress.incrementLimitedStat("pixels_drawn", data.pixels);
            return this.checkUpdates();
          }
        } else if (data.file.startsWith("maps/")) {
          this.user.progress.recordTime("time_mapping");
          if (data.cells != null) {
            this.user.progress.incrementLimitedStat("map_cells_drawn", data.cells);
            return this.checkUpdates();
          }
        }
      }
    }
  };

  Session.prototype.renameProjectFile = function(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if (project != null) {
      this.setCurrentProject(project);
      return project.manager.renameProjectFile(this, data);
    }
  };

  Session.prototype.deleteProjectFile = function(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if (project != null) {
      this.setCurrentProject(project);
      return project.manager.deleteProjectFile(this, data);
    }
  };

  Session.prototype.readProjectFile = function(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if (project != null) {
      this.setCurrentProject(project);
      return project.manager.readProjectFile(this, data);
    }
  };

  Session.prototype.listProjectFiles = function(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if (project != null) {
      this.setCurrentProject(project);
      return project.manager.listProjectFiles(this, data);
    }
  };

  Session.prototype.listPublicProjectFiles = function(data) {
    var manager, project;
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if (project != null) {
      manager = this.getProjectManager(project);
      return manager.listProjectFiles(this, data);
    }
  };

  Session.prototype.readPublicProjectFile = function(data) {
    var manager, project;
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if ((project != null) && project["public"]) {
      manager = this.getProjectManager(project);
      return project.manager.readProjectFile(this, data);
    }
  };

  Session.prototype.listenToProject = function(data) {
    var project, user;
    user = data.user;
    project = data.project;
    if ((user != null) && (project != null)) {
      user = this.content.findUserByNick(user);
      if (user != null) {
        project = user.findProjectBySlug(project);
        if (project != null) {
          if ((this.project != null) && (this.project.manager != null)) {
            this.project.manager.removeListener(this);
          }
          this.project = project;
          if (this.project.manager == null) {
            new ProjectManager(this.project);
          }
          return this.project.manager.addListener(this);
        }
      }
    }
  };

  Session.prototype.getFileVersions = function(data) {
    var project, user;
    user = data.user;
    project = data.project;
    if ((user != null) && (project != null)) {
      user = this.content.findUserByNick(user);
      if (user != null) {
        project = user.findProjectBySlug(project);
        if (project != null) {
          if (project.manager == null) {
            new ProjectManager(project);
          }
          return project.manager.getFileVersions((function(_this) {
            return function(res) {
              return _this.send({
                name: "project_file_versions",
                data: res,
                request_id: data.request_id
              });
            };
          })(this));
        }
      }
    }
  };

  Session.prototype.getPublicProjects = function(data) {
    var i, j, len1, list, p, source;
    switch (data.ranking) {
      case "new":
        source = this.content.new_projects;
        break;
      case "top":
        source = this.content.top_projects;
        break;
      default:
        source = this.content.hot_projects;
    }
    list = [];
    for (i = j = 0, len1 = source.length; j < len1; i = ++j) {
      p = source[i];
      if (list.length >= 300) {
        break;
      }
      if (p["public"] && !p.deleted && !p.owner.flags.censored) {
        list.push({
          id: p.id,
          title: p.title,
          description: p.description,
          type: p.type,
          tags: p.tags,
          slug: p.slug,
          owner: p.owner.nick,
          owner_info: {
            tier: p.owner.flags.tier,
            profile_image: p.owner.flags.profile_image
          },
          likes: p.likes,
          liked: (this.user != null) && this.user.isLiked(p.id),
          tags: p.tags,
          date_published: p.first_published,
          graphics: p.graphics,
          language: p.language,
          libs: p.libs
        });
      }
    }
    return this.send({
      name: "public_projects",
      list: list,
      request_id: data.request_id
    });
  };

  Session.prototype.getPublicProject = function(msg) {
    var owner, p, project, res;
    owner = msg.owner;
    project = msg.project;
    if ((owner != null) && (project != null)) {
      owner = this.content.findUserByNick(owner);
      if (owner != null) {
        p = owner.findProjectBySlug(project);
        if ((p != null) && p["public"]) {
          res = {
            id: p.id,
            title: p.title,
            description: p.description,
            type: p.type,
            tags: p.tags,
            slug: p.slug,
            owner: p.owner.nick,
            owner_info: {
              tier: p.owner.flags.tier,
              profile_image: p.owner.flags.profile_image
            },
            likes: p.likes,
            liked: (this.user != null) && this.user.isLiked(p.id),
            tags: p.tags,
            date_published: p.first_published,
            graphics: p.graphics,
            language: p.language,
            libs: p.libs
          };
          return this.send({
            name: "get_public_project",
            project: res,
            request_id: msg.request_id
          });
        }
      }
    }
  };

  Session.prototype.toggleLike = function(data) {
    var project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (!this.user.flags.validated) {
      return this.sendError("not validated");
    }
    project = this.content.projects[data.project];
    if (project != null) {
      if (this.user.isLiked(project.id)) {
        this.user.removeLike(project.id);
        project.likes--;
      } else {
        this.user.addLike(project.id);
        project.likes++;
        if (project.likes >= 5) {
          project.owner.progress.unlockAchievement("community/5_likes");
        }
      }
      return this.send({
        name: "project_likes",
        likes: project.likes,
        liked: this.user.isLiked(project.id),
        request_id: data.request_id
      });
    }
  };

  Session.prototype.inviteToProject = function(data) {
    var project, user;
    if (this.user == null) {
      return this.sendError("not connected", data.request_id);
    }
    user = this.content.findUserByNick(data.user);
    if (user == null) {
      return this.sendError("user not found", data.request_id);
    }
    project = this.user.findProject(data.project);
    if (project == null) {
      return this.sendError("project not found", data.request_id);
    }
    this.setCurrentProject(project);
    return project.manager.inviteUser(this, user);
  };

  Session.prototype.acceptInvite = function(data) {
    var j, k, len1, len2, li, link, ref, ref1;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    ref = this.user.project_links;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      link = ref[j];
      if (link.project.id === data.project) {
        link.accept();
        this.setCurrentProject(link.project);
        if (link.project.manager != null) {
          link.project.manager.propagateUserListChange();
        }
        ref1 = this.user.listeners;
        for (k = 0, len2 = ref1.length; k < len2; k++) {
          li = ref1[k];
          li.getProjectList();
        }
      }
    }
  };

  Session.prototype.removeProjectUser = function(data) {
    var j, k, len1, len2, li, link, project, ref, ref1, user;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if (project == null) {
      return this.sendError("project not found", data.request_id);
    }
    if (data.user != null) {
      user = this.content.findUserByNick(data.user);
    }
    if (user == null) {
      return this.sendError("user not found", data.request_id);
    }
    if (this.user !== project.owner && this.user !== user) {
      return;
    }
    ref = project.users;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      link = ref[j];
      if (link.user === user) {
        link.remove();
        if (this.user === project.owner) {
          this.setCurrentProject(project);
        } else {
          this.send({
            name: "project_link_deleted",
            request_id: data.request_id
          });
        }
        if (project.manager != null) {
          project.manager.propagateUserListChange();
        }
        ref1 = user.listeners;
        for (k = 0, len2 = ref1.length; k < len2; k++) {
          li = ref1[k];
          li.getProjectList();
        }
      }
    }
  };

  Session.prototype.sendValidationMail = function(data) {
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (this.server.rate_limiter.accept("send_mail_user", this.user.id)) {
      this.server.content.sendValidationMail(this.user);
      if (data != null) {
        this.send({
          name: "send_validation_mail",
          request_id: data.request_id
        });
      }
    }
  };

  Session.prototype.changeNick = function(data) {
    if (this.user == null) {
      return;
    }
    if (data.nick == null) {
      return;
    }
    if (!RegexLib.nick.test(data.nick)) {
      return this.send({
        name: "error",
        value: "Incorrect nickname",
        request_id: data.request_id
      });
    } else {
      if ((this.server.content.findUserByNick(data.nick) != null) || this.reserved_nicks[data.nick]) {
        return this.send({
          name: "error",
          value: "Nickname not available",
          request_id: data.request_id
        });
      } else {
        this.server.content.changeUserNick(this.user, data.nick);
        return this.send({
          name: "change_nick",
          nick: data.nick,
          request_id: data.request_id
        });
      }
    }
  };

  Session.prototype.changeEmail = function(data) {
    if (this.user == null) {
      return;
    }
    if (data.email == null) {
      return;
    }
    if (!RegexLib.email.test(data.email)) {
      return this.send({
        name: "error",
        value: "Incorrect email",
        request_id: data.request_id
      });
    } else {
      if (this.server.content.findUserByEmail(data.email) != null) {
        return this.send({
          name: "error",
          value: "E-mail is already used for another account",
          request_id: data.request_id
        });
      } else {
        this.user.setFlag("validated", false);
        this.user.resetValidationToken();
        this.server.content.changeUserEmail(this.user, data.email);
        this.sendValidationMail();
        return this.send({
          name: "change_email",
          email: data.email,
          request_id: data.request_id
        });
      }
    }
  };

  Session.prototype.changeNewsletter = function(data) {
    if (this.user == null) {
      return;
    }
    this.user.setFlag("newsletter", data.newsletter);
    return this.send({
      name: "change_newsletter",
      newsletter: data.newsletter,
      request_id: data.request_id
    });
  };

  Session.prototype.changeExperimental = function(data) {
    if ((this.user == null) || !this.user.flags.validated) {
      return;
    }
    this.user.setFlag("experimental", data.experimental);
    return this.send({
      name: "change_experimental",
      experimental: data.experimental,
      request_id: data.request_id
    });
  };

  Session.prototype.setUserSetting = function(data) {
    if (this.user == null) {
      return;
    }
    if ((data.setting == null) || (data.value == null)) {
      return;
    }
    return this.user.setSetting(data.setting, data.value);
  };

  Session.prototype.setUserProfile = function(data) {
    var content, file;
    if (this.user == null) {
      return;
    }
    if (data.image != null) {
      if (data.image === 0) {
        this.user.setFlag("profile_image", false);
      } else {
        file = this.user.id + "/profile_image.png";
        content = new Buffer(data.image, "base64");
        this.server.content.files.write(file, content, (function(_this) {
          return function() {
            _this.user.setFlag("profile_image", true);
            return _this.send({
              name: "set_user_profile",
              request_id: data.request_id
            });
          };
        })(this));
        return;
      }
    }
    if (data.description != null) {
      this.user.set("description", data.description);
    }
    return this.send({
      name: "set_user_profile",
      request_id: data.request_id
    });
  };

  Session.prototype.getLanguage = function(msg) {
    var lang;
    if (msg.language == null) {
      return;
    }
    lang = this.server.content.translator.languages[msg.language];
    lang = lang != null ? lang["export"]() : "{}";
    return this.send({
      name: "get_language",
      language: lang,
      request_id: msg.request_id
    });
  };

  Session.prototype.getTranslationList = function(msg) {
    return this.send({
      name: "get_translation_list",
      list: this.server.content.translator.list,
      request_id: msg.request_id
    });
  };

  Session.prototype.setTranslation = function(msg) {
    var lang, source, translation;
    if (this.user == null) {
      return;
    }
    lang = msg.language;
    if (!this.user.flags["translator_" + lang]) {
      return;
    }
    source = msg.source;
    translation = msg.translation;
    if (!this.server.content.translator.languages[lang]) {
      this.server.content.translator.createLanguage(lang);
    }
    return this.server.content.translator.languages[lang].set(this.user.id, source, translation);
  };

  Session.prototype.addTranslation = function(msg) {
    var source;
    if (this.user == null) {
      return;
    }
    source = msg.source;
    return this.server.content.translator.reference(source);
  };

  Session.prototype.getProjectComments = function(data) {
    var project;
    if (data.project == null) {
      return;
    }
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if ((project != null) && project["public"]) {
      return this.send({
        name: "project_comments",
        request_id: data.request_id,
        comments: project.comments.getAll()
      });
    }
  };

  Session.prototype.addProjectComment = function(data) {
    var project;
    if (data.project == null) {
      return;
    }
    if (data.text == null) {
      return;
    }
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if ((project != null) && project["public"]) {
      if ((this.user != null) && this.user.flags.validated && !this.user.flags.banned && !this.user.flags.censored) {
        if (!this.server.rate_limiter.accept("post_comment_user", this.user.id)) {
          return;
        }
        project.comments.add(this.user, data.text);
        return this.send({
          name: "add_project_comment",
          request_id: data.request_id
        });
      }
    }
  };

  Session.prototype.deleteProjectComment = function(data) {
    var c, project;
    if (data.project == null) {
      return;
    }
    if (data.id == null) {
      return;
    }
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if ((project != null) && project["public"]) {
      if (this.user != null) {
        c = project.comments.get(data.id);
        if ((c != null) && (c.user === this.user || this.user.flags.admin)) {
          c.remove();
          return this.send({
            name: "delete_project_comment",
            request_id: data.request_id
          });
        }
      }
    }
  };

  Session.prototype.editProjectComment = function(data) {
    var c, project;
    if (data.project == null) {
      return;
    }
    if (data.id == null) {
      return;
    }
    if (data.text == null) {
      return;
    }
    if (data.project != null) {
      project = this.content.projects[data.project];
    }
    if ((project != null) && project["public"]) {
      if (this.user != null) {
        c = project.comments.get(data.id);
        if ((c != null) && c.user === this.user) {
          c.edit(data.text);
          return this.send({
            name: "edit_project_comment",
            request_id: data.request_id
          });
        }
      }
    }
  };

  Session.prototype.tutorialCompleted = function(msg) {
    if (this.user == null) {
      return;
    }
    if ((msg.id == null) || typeof msg.id !== "string") {
      return;
    }
    if (!msg.id.startsWith("tutorials/")) {
      return;
    }
    this.user.progress.unlockAchievement(msg.id);
    return this.checkUpdates();
  };

  Session.prototype.checkUpdates = function() {
    if (this.user != null) {
      if (this.user.progress.achievements_update !== this.achievements_update) {
        this.achievements_update = this.user.progress.achievements_update;
        this.sendAchievements();
      }
      if (this.user.progress.stats_update !== this.stats_update) {
        this.stats_update = this.user.progress.stats_update;
        return this.sendUserStats();
      }
    }
  };

  Session.prototype.sendAchievements = function() {
    if (this.user == null) {
      return;
    }
    return this.send({
      name: "achievements",
      achievements: this.user.progress.exportAchievements()
    });
  };

  Session.prototype.sendUserStats = function() {
    if (this.user == null) {
      return;
    }
    return this.send({
      name: "user_stats",
      stats: this.user.progress.exportStats()
    });
  };

  Session.prototype.buildProject = function(msg) {
    var build, project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (msg.project != null) {
      project = this.content.projects[msg.project];
    }
    if (project != null) {
      this.setCurrentProject(project);
      if (!project.manager.canWrite(this.user)) {
        return;
      }
      if (msg.target == null) {
        return;
      }
      build = this.server.build_manager.startBuild(project, msg.target);
      return this.send({
        name: "build_project",
        request_id: msg.request_id,
        build: build != null ? build["export"]() : null
      });
    }
  };

  Session.prototype.getBuildStatus = function(msg) {
    var build, project;
    if (this.user == null) {
      return this.sendError("not connected");
    }
    if (msg.project != null) {
      project = this.content.projects[msg.project];
    }
    if (project != null) {
      this.setCurrentProject(project);
      if (!project.manager.canWrite(this.user)) {
        return;
      }
      if (msg.target == null) {
        return;
      }
      build = this.server.build_manager.getBuildInfo(project, msg.target);
      return this.send({
        name: "build_project",
        request_id: msg.request_id,
        build: build != null ? build["export"]() : null,
        active_target: this.server.build_manager.hasBuilder(msg.target)
      });
    }
  };

  Session.prototype.timeCheck = function() {
    if (Date.now() > this.last_active + 5 * 60000) {
      this.socket.close();
      this.server.sessionClosed(this);
      this.socket.terminate();
    }
    if ((this.upload_request_activity != null) && Date.now() > this.upload_request_activity + 60000) {
      this.upload_request_id = -1;
      return this.upload_request_buffers = [];
    }
  };

  Session.prototype.startBuilder = function(msg) {
    if (msg.target != null) {
      if (msg.key === this.server.config["builder-key"]) {
        this.server.sessionClosed(this);
        return this.server.build_manager.registerBuilder(this, msg.target);
      }
    }
  };

  Session.prototype.backupComplete = function(msg) {
    if (msg.key === this.server.config["backup-key"]) {
      this.server.sessionClosed(this);
      return this.server.last_backup_time = Date.now();
    }
  };

  Session.prototype.uploadRequest = function(msg) {
    if (this.user == null) {
      return;
    }
    if (msg.size == null) {
      return this.sendError("Bad request");
    }
    if (msg.request_id == null) {
      return this.sendError("Bad request");
    }
    if (msg.request == null) {
      return this.sendError("Bad request");
    }
    if (!this.server.rate_limiter.accept("file_upload_user", this.user.id)) {
      return this.sendError("Rate limited", msg.request_id);
    }
    if (msg.size > 100000000) {
      return this.sendError("File size limit exceeded");
    }
    this.upload_request_id = msg.request_id;
    this.upload_request_size = msg.size;
    this.upload_uploaded = 0;
    this.upload_request_buffers = [];
    this.upload_request_request = msg.request;
    this.upload_request_activity = Date.now();
    return this.send({
      name: "upload_request",
      request_id: msg.request_id
    });
  };

  Session.prototype.bufferReceived = function(buffer) {
    var b, buf, c, count, error, id, j, len, len1, msg, ref;
    if (buffer.byteLength >= 4) {
      id = buffer.readInt32LE(0);
      if (id === this.upload_request_id) {
        len = buffer.byteLength - 4;
        if (len > 0 && this.upload_uploaded < this.upload_request_size) {
          buf = Buffer.alloc(len);
          buffer.copy(buf, 0, 4, buffer.byteLength);
          this.upload_request_buffers.push(buf);
          this.upload_uploaded += len;
          this.upload_request_activity = Date.now();
        }
        if (this.upload_uploaded >= this.upload_request_size) {
          msg = this.upload_request_request;
          buf = Buffer.alloc(this.upload_request_size);
          count = 0;
          ref = this.upload_request_buffers;
          for (j = 0, len1 = ref.length; j < len1; j++) {
            b = ref[j];
            b.copy(buf, count, 0, b.byteLength);
            count += b.byteLength;
          }
          msg.data = buf;
          msg.request_id = id;
          try {
            if (msg.name != null) {
              c = this.commands[msg.name];
              if (c != null) {
                return c(msg);
              }
            }
          } catch (error1) {
            error = error1;
            return console.error(error);
          }
        } else {
          return this.send({
            name: "next_chunk",
            request_id: id
          });
        }
      }
    }
  };

  return Session;

})();

module.exports = this.Session;
