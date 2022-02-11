var FILE_TYPES,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

FILE_TYPES = require(__dirname + "/../file_types.js");

this.ProjectManager = (function() {
  function ProjectManager(project) {
    this.project = project;
    this.importFiles = bind(this.importFiles, this);
    this.users = [];
    this.listeners = [];
    this.files = {};
    this.locks = {};
    this.project.manager = this;
  }

  ProjectManager.prototype.canRead = function(user) {
    var i, len, link, ref;
    if (user === this.project.owner || this.project["public"]) {
      return true;
    }
    ref = this.project.users;
    for (i = 0, len = ref.length; i < len; i++) {
      link = ref[i];
      if (link.accepted && (link.user === user)) {
        return true;
      }
    }
    return false;
  };

  ProjectManager.prototype.canWrite = function(user) {
    var i, len, link, ref;
    if (user === this.project.owner) {
      return true;
    }
    ref = this.project.users;
    for (i = 0, len = ref.length; i < len; i++) {
      link = ref[i];
      if (link.accepted && (link.user === user)) {
        return true;
      }
    }
    return false;
  };

  ProjectManager.prototype.canWriteOptions = function(user) {
    return this.project.owner === user;
  };

  ProjectManager.prototype.addUser = function(user) {
    if (this.users.indexOf(user) < 0) {
      this.users.push(user);
    }
    return this.sendCurrentLocks(user);
  };

  ProjectManager.prototype.addListener = function(listener) {
    if (this.listeners.indexOf(listener) < 0) {
      return this.listeners.push(listener);
    }
  };

  ProjectManager.prototype.removeSession = function(session) {
    var file, index, lock, ref;
    index = this.users.indexOf(session);
    if (index >= 0) {
      this.users.splice(index, 1);
    }
    ref = this.locks;
    for (file in ref) {
      lock = ref[file];
      if (lock.user === session) {
        lock.time = 0;
      }
    }
  };

  ProjectManager.prototype.removeListener = function(listener) {
    var index;
    index = this.listeners.indexOf(listener);
    if (index >= 0) {
      return this.listeners.splice(index, 1);
    }
  };

  ProjectManager.prototype.lockFile = function(user, file) {
    var lock;
    lock = this.locks[file];
    if (lock != null) {
      if (lock.user === user || Date.now() > lock.time) {
        lock.user = user;
        lock.time = Date.now() + 10000;
        this.propagateLock(user, file);
        return true;
      } else {
        return false;
      }
    } else {
      lock = {
        user: user,
        time: Date.now() + 10000
      };
      this.locks[file] = lock;
      this.propagateLock(user, file);
      return true;
    }
  };

  ProjectManager.prototype.sendCurrentLocks = function(user) {
    var file, lock, ref;
    ref = this.locks;
    for (file in ref) {
      lock = ref[file];
      if (Date.now() < lock.time) {
        user.send({
          name: "project_file_locked",
          project: this.project.id,
          file: file,
          user: lock.user.user.nick
        });
      }
    }
  };

  ProjectManager.prototype.canWrite = function(user, file) {
    var lock;
    lock = this.locks[file];
    if (lock != null) {
      return lock.user === user || Date.now() > lock.time;
    } else {
      return true;
    }
  };

  ProjectManager.prototype.getFileVersion = function(file) {
    var info;
    info = this.project.getFileInfo(file);
    if (info.version != null) {
      return info.version;
    } else {
      return 0;
    }
  };

  ProjectManager.prototype.setFileVersion = function(file, version) {
    return this.project.setFileInfo(file, "version", version);
  };

  ProjectManager.prototype.getFileSize = function(file) {
    var info;
    info = this.project.getFileInfo(file);
    if (info.size != null) {
      return info.size;
    } else {
      return 0;
    }
  };

  ProjectManager.prototype.setFileSize = function(file, size) {
    return this.project.setFileInfo(file, "size", size);
  };

  ProjectManager.prototype.getFileProperties = function(file) {
    var info;
    info = this.project.getFileInfo(file);
    if (info.properties != null) {
      return info.properties;
    } else {
      return {};
    }
  };

  ProjectManager.prototype.setFileProperties = function(file, properties) {
    return this.project.setFileInfo(file, "properties", properties);
  };

  ProjectManager.prototype.propagateUserListChange = function() {
    var i, len, ref, user;
    ref = this.users;
    for (i = 0, len = ref.length; i < len; i++) {
      user = ref[i];
      if (user != null) {
        user.send({
          name: "project_user_list",
          project: this.project.id,
          users: this.project.listUsers()
        });
      }
    }
  };

  ProjectManager.prototype.propagateLock = function(user, file) {
    var i, len, ref, u;
    ref = this.users;
    for (i = 0, len = ref.length; i < len; i++) {
      u = ref[i];
      if ((u != null) && u !== user) {
        u.send({
          name: "project_file_locked",
          project: this.project.id,
          file: file,
          user: user.user.nick
        });
      }
    }
  };

  ProjectManager.prototype.propagateFileChange = function(author, file, version, content, properties) {
    var i, j, len, len1, listener, ref, ref1, user;
    ref = this.users;
    for (i = 0, len = ref.length; i < len; i++) {
      user = ref[i];
      if ((user != null) && user !== author) {
        user.send({
          name: "project_file_update",
          project: this.project.id,
          file: file,
          version: version,
          content: content,
          properties: properties
        });
      }
    }
    ref1 = this.listeners;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      listener = ref1[j];
      if (listener != null) {
        listener.sendProjectFileUpdated(file.split("/")[0], file.split("/")[1].split(".")[0], version, content, properties);
      }
    }
  };

  ProjectManager.prototype.propagateFileDeleted = function(author, file) {
    var i, j, len, len1, listener, ref, ref1, user;
    ref = this.users;
    for (i = 0, len = ref.length; i < len; i++) {
      user = ref[i];
      if ((user != null) && user !== author) {
        user.send({
          name: "project_file_deleted",
          project: this.project.id,
          file: file
        });
      }
    }
    ref1 = this.listeners;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      listener = ref1[j];
      if (listener != null) {
        listener.sendProjectFileDeleted(file.split("/")[0], file.split("/")[1]);
      }
    }
  };

  ProjectManager.prototype.propagateOptions = function(author) {
    var i, j, len, len1, listener, ref, ref1, user;
    ref = this.users;
    for (i = 0, len = ref.length; i < len; i++) {
      user = ref[i];
      if ((user != null) && user !== author) {
        user.send({
          name: "project_options_updated",
          project: this.project.id,
          title: this.project.title,
          slug: this.project.slug,
          platforms: this.project.platforms,
          controls: this.project.controls,
          orientation: this.project.orientation,
          aspect: this.project.aspect,
          "public": this.project["public"]
        });
      }
    }
    ref1 = this.listeners;
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      listener = ref1[j];
      if (listener != null) {
        listener.send({
          name: "project_options_updated",
          title: this.project.title,
          slug: this.project.slug,
          platforms: this.project.platforms,
          controls: this.project.controls,
          orientation: this.project.orientation,
          aspect: this.project.aspect,
          "public": this.project["public"]
        });
      }
    }
  };

  ProjectManager.prototype.inviteUser = function(source, user) {
    var i, len, li, ref;
    if (source.user === this.project.owner) {
      this.project.inviteUser(user);
      this.propagateUserListChange();
      ref = user.listeners;
      for (i = 0, len = ref.length; i < len; i++) {
        li = ref[i];
        li.getProjectList();
      }
    }
  };

  ProjectManager.prototype.acceptInvite = function(user) {
    var i, j, len, len1, li, link, ref, ref1;
    ref = this.project.users;
    for (i = 0, len = ref.length; i < len; i++) {
      link = ref[i];
      if (user === link.user && !link.accepted) {
        link.accepted = true;
        return this.propagateUserListChange();
        ref1 = user.listeners;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          li = ref1[j];
          li.getProjectList();
        }
      }
    }
  };

  ProjectManager.prototype.removeUser = function(source, user) {
    var i, j, len, len1, li, link, ref, ref1;
    if (source.user === this.project.owner || source.user === user) {
      ref = this.project.users;
      for (i = 0, len = ref.length; i < len; i++) {
        link = ref[i];
        if (user === link.user) {
          link.remove();
          return this.propagateUserListChange();
          ref1 = user.listeners;
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            li = ref1[j];
            li.getProjectList();
          }
        }
      }
    }
  };

  ProjectManager.prototype.listFiles = function(folder, callback) {
    var file;
    file = this.project.owner.id + "/" + this.project.id + "/" + folder;
    return this.project.content.files.list(file, (function(_this) {
      return function(files) {
        var f, i, len, res;
        res = [];
        files = files || [];
        for (i = 0, len = files.length; i < len; i++) {
          f = files[i];
          if (!f.startsWith(".")) {
            res.push({
              file: f,
              version: _this.getFileVersion(folder + "/" + f),
              size: _this.getFileSize(folder + "/" + f),
              properties: _this.getFileProperties(folder + "/" + f)
            });
          }
        }
        return callback(res);
      };
    })(this));
  };

  ProjectManager.prototype.getFileVersions = function(callback) {
    var folder, funk, jobs, res, t;
    res = {};
    jobs = [];
    for (folder in FILE_TYPES) {
      t = FILE_TYPES[folder];
      res[t.property] = {};
      jobs.push(t);
    }
    funk = (function(_this) {
      return function() {
        var job;
        if (jobs.length > 0) {
          job = jobs.splice(0, 1)[0];
          return _this.listFiles(job.folder, function(files) {
            var ext, f, i, len, name;
            for (i = 0, len = files.length; i < len; i++) {
              f = files[i];
              name = f.file.split(".")[0];
              ext = f.file.split(".")[1];
              res[job.property][name] = {
                version: f.version,
                properties: f.properties,
                ext: ext
              };
            }
            return funk();
          });
        } else {
          return callback(res);
        }
      };
    })(this);
    return funk();
  };

  ProjectManager.prototype.listProjectFiles = function(session, data) {
    var file;
    if (!this.canRead(session.user)) {
      return console.log("unauthorized user");
    }
    file = this.project.owner.id + "/" + this.project.id + "/" + data.folder;
    return this.project.content.files.list(file, (function(_this) {
      return function(files) {
        var f, i, len, res;
        res = [];
        files = files || [];
        for (i = 0, len = files.length; i < len; i++) {
          f = files[i];
          if (!f.startsWith(".")) {
            res.push({
              file: f,
              version: _this.getFileVersion(data.folder + "/" + f),
              size: _this.getFileSize(data.folder + "/" + f),
              properties: _this.getFileProperties(data.folder + "/" + f)
            });
          }
        }
        return session.send({
          name: "list_project_files",
          files: res,
          request_id: data.request_id
        });
      };
    })(this));
  };

  ProjectManager.prototype.readProjectFile = function(session, data) {
    var encoding, file;
    if (!this.canRead(session.user)) {
      return;
    }
    file = this.project.owner.id + "/" + this.project.id + "/" + data.file;
    encoding = data.file.endsWith(".ms") || data.file.endsWith(".json") || data.file.endsWith(".md") ? "text" : "base64";
    return this.project.content.files.read(file, encoding, (function(_this) {
      return function(content) {
        var out;
        out = data.file.endsWith(".ms") || data.file.endsWith(".json") || data.file.endsWith(".md") ? "utf8" : "base64";
        if (content != null) {
          return session.send({
            name: "read_project_file",
            content: content.toString(out),
            request_id: data.request_id
          });
        }
      };
    })(this));
  };

  ProjectManager.prototype.writeProjectFile = function(session, data) {
    var content, f, file, ref, th, version;
    if (!this.canWrite(session.user)) {
      return;
    }
    if (this.project.deleted) {
      return;
    }
    if (data.file == null) {
      return;
    }
    if ((data.content != null) && data.content.length > 10000000) {
      return;
    }
    if (!/^(ms|sprites|maps|sounds|music|doc|assets)\/[a-z0-9_]{1,40}(-[a-z0-9_]{1,40}){0,10}.(ms|png|json|wav|mp3|md|glb|obj|jpg|ttf|txt|csv)$/.test(data.file)) {
      console.info("wrong file name: " + data.file);
      return;
    }
    version = this.getFileVersion(data.file);
    if (version === 0) {
      if (!session.server.rate_limiter.accept("create_file_user", session.user.id)) {
        return;
      }
    }
    file = this.project.owner.id + "/" + this.project.id + "/" + data.file;
    if (data.content != null) {
      if ((ref = data.file.split(".")[1]) === "ms" || ref === "json" || ref === "md" || ref === "txt" || ref === "csv") {
        content = data.content;
      } else {
        content = new Buffer(data.content, "base64");
      }
      this.project.content.files.write(file, content, (function(_this) {
        return function() {
          version += 1;
          _this.setFileVersion(data.file, version);
          _this.setFileSize(data.file, content.length);
          if (data.properties != null) {
            _this.setFileProperties(data.file, data.properties);
          }
          if (data.request_id != null) {
            session.send({
              name: "write_project_file",
              version: version,
              size: content.length,
              request_id: data.request_id
            });
          }
          _this.propagateFileChange(session, data.file, version, data.content, data.properties);
          return _this.project.touch();
        };
      })(this));
    }
    if (data.thumbnail != null) {
      th = new Buffer(data.thumbnail, "base64");
      f = file.split("/");
      f[2] += "_th";
      f[3] = f[3].split(".")[0] + ".png";
      f = f.join("/");
      return this.project.content.files.write(f, th, (function(_this) {
        return function() {
          return console.info("thumbnail saved");
        };
      })(this));
    }
  };

  ProjectManager.prototype.renameProjectFile = function(session, data) {
    var dest, source;
    if (!this.canWrite(session.user)) {
      return;
    }
    if (typeof data.source !== "string") {
      return;
    }
    if (typeof data.dest !== "string") {
      return;
    }
    if (data.dest.length > 250) {
      return;
    }
    if (!/^(ms|sprites|maps|sounds|music|doc|assets)\/[a-z0-9_]{1,40}(-[a-z0-9_]{1,40}){0,10}.(ms|png|json|wav|mp3|md|glb|obj|jpg|ttf|txt|csv)$/.test(data.source)) {
      console.info("wrong source name: " + data.source);
      return;
    }
    if (!/^(ms|sprites|maps|sounds|music|doc|assets)\/[a-z0-9_]{1,40}(-[a-z0-9_]{1,40}){0,10}.(ms|png|json|wav|mp3|md|glb|obj|jpg|ttf|txt|csv)$/.test(data.dest)) {
      console.info("wrong dest name: " + data.dest);
      return;
    }
    source = this.project.owner.id + "/" + this.project.id + "/" + data.source;
    dest = this.project.owner.id + "/" + this.project.id + "/" + data.dest;
    return this.project.content.files.read(source, "binary", (function(_this) {
      return function(content) {
        if (content != null) {
          return _this.project.content.files.write(dest, content, function() {
            _this.project.deleteFileInfo(data.source);
            _this.setFileSize(data.dest, content.length);
            _this.project.touch();
            return _this.project.content.files["delete"](source, function() {
              if (data.thumbnail) {
                source = source.split("/");
                source[2] += "_th";
                source[3] = source[3].split(".")[0] + ".png";
                source = source.join("/");
                dest = dest.split("/");
                dest[2] += "_th";
                dest[3] = dest[3].split(".")[0] + ".png";
                dest = dest.join("/");
                return _this.project.content.files.read(source, "binary", function(thumbnail) {
                  if (thumbnail != null) {
                    return _this.project.content.files.write(dest, thumbnail, function() {
                      return _this.project.content.files["delete"](source, function() {
                        session.send({
                          name: "rename_project_file",
                          request_id: data.request_id
                        });
                        _this.propagateFileDeleted(session, data.source);
                        return _this.propagateFileChange(session, data.dest, 0, null, {});
                      });
                    });
                  }
                });
              } else {
                session.send({
                  name: "rename_project_file",
                  request_id: data.request_id
                });
                _this.propagateFileDeleted(session, data.source);
                return _this.propagateFileChange(session, data.dest, 0, null, {});
              }
            });
          });
        }
      };
    })(this));
  };

  ProjectManager.prototype.deleteProjectFile = function(session, data) {
    var f, file;
    if (!this.canWrite(session.user)) {
      return;
    }
    if (data.file == null) {
      return;
    }
    file = this.project.owner.id + "/" + this.project.id + "/" + data.file;
    this.project.content.files["delete"](file, (function(_this) {
      return function() {
        _this.project.deleteFileInfo(data.file);
        if (data.request_id != null) {
          session.send({
            name: "delete_project_file",
            request_id: data.request_id
          });
        }
        _this.propagateFileDeleted(session, data.file);
        return _this.project.touch();
      };
    })(this));
    if (data.thumbnail) {
      f = file.split("/");
      f[2] += "_th";
      f[3] = f[3].split(".")[0] + ".png";
      f = f.join("/");
      return this.project.content.files["delete"](f, (function(_this) {
        return function() {};
      })(this));
    }
  };

  ProjectManager.prototype.importFiles = function(contents, callback) {
    var filename, files, funk;
    files = [];
    for (filename in contents.files) {
      files.push(filename);
    }
    funk = (function(_this) {
      return function() {
        var d, dest, end, err, ref, type, value;
        if (files.length > 0) {
          filename = files.splice(0, 1)[0];
          value = contents.files[filename];
          if (/^(ms|sprites|maps|sounds|music|doc|assets|sounds_th|music_th|assets_th)\/[a-z0-9_]{1,40}([-\/][a-z0-9_]{1,40}){0,10}.(ms|py|js|lua|png|json|wav|mp3|md|glb|obj|jpg|ttf|txt|csv)$/.test(filename)) {
            dest = filename;
            d = dest.split("/");
            while (d.length > 2) {
              end = d.splice(d.length - 1, 1)[0];
              d[d.length - 1] += "-" + end;
              dest = d.join("/");
            }
            if (dest.endsWith(".js")) {
              dest = dest.replace(".js", ".ms");
            }
            if (dest.endsWith(".py")) {
              dest = dest.replace(".py", ".ms");
            }
            if (dest.endsWith(".lua")) {
              dest = dest.replace(".lua", ".ms");
            }
            type = (ref = dest.split(".")[1]) === "ms" || ref === "json" || ref === "md" || ref === "txt" || ref === "csv" ? "string" : "nodebuffer";
            try {
              return contents.file(filename).async(type).then((function(fileContent) {
                if (fileContent != null) {
                  return _this.project.content.files.write(_this.project.owner.id + "/" + _this.project.id + "/" + dest, fileContent, funk);
                } else {
                  return funk();
                }
              }), function() {
                return funk();
              });
            } catch (error) {
              err = error;
              console.error(err);
              console.log(filename);
              return funk();
            }
          } else {
            return funk();
          }
        } else {
          return callback();
        }
      };
    })(this);
    return funk();
  };

  return ProjectManager;

})();

module.exports = this.ProjectManager;
