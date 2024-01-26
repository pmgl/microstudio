var FILE_TYPES;

FILE_TYPES = require(__dirname + "/../file_types.js");

this.ProjectManager = class ProjectManager {
  constructor(project1) {
    this.importFiles = this.importFiles.bind(this);
    this.project = project1;
    this.users = [];
    this.listeners = [];
    this.files = {};
    this.locks = {};
    this.project.manager = this;
  }

  canRead(user) {
    var i, len, link, ref;
    if (user === this.project.owner || this.project.public) {
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
  }

  canReadProject(user, project) {
    var i, len, link, ref;
    if (user === project.owner || project.public) {
      return true;
    }
    ref = project.users;
    for (i = 0, len = ref.length; i < len; i++) {
      link = ref[i];
      if (link.accepted && (link.user === user)) {
        return true;
      }
    }
    return false;
  }

  canWrite(user) {
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
  }

  canWriteOptions(user) {
    return this.project.owner === user;
  }

  addUser(user) {
    if (this.users.indexOf(user) < 0) {
      this.users.push(user);
    }
    return this.sendCurrentLocks(user);
  }

  addListener(listener) {
    if (this.listeners.indexOf(listener) < 0) {
      return this.listeners.push(listener);
    }
  }

  removeSession(session) {
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
  }

  removeListener(listener) {
    var index;
    index = this.listeners.indexOf(listener);
    if (index >= 0) {
      return this.listeners.splice(index, 1);
    }
  }

  lockFile(user, file) {
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
  }

  sendCurrentLocks(user) {
    var file, lock, ref;
    ref = this.locks;
    for (file in ref) {
      lock = ref[file];
      if (Date.now() < lock.time) { //and lock.user.user != user.user
        user.send({
          name: "project_file_locked",
          project: this.project.id,
          file: file,
          user: lock.user.user.nick
        });
      }
    }
  }

  canWrite(user, file) {
    var lock;
    lock = this.locks[file];
    if (lock != null) {
      return lock.user === user || Date.now() > lock.time;
    } else {
      return true;
    }
  }

  getFileVersion(file) {
    var info;
    info = this.project.getFileInfo(file);
    if (info.version != null) {
      return info.version;
    } else {
      return 0;
    }
  }

  setFileVersion(file, version) {
    return this.project.setFileInfo(file, "version", version);
  }

  getFileSize(file) {
    var info;
    info = this.project.getFileInfo(file);
    if (info.size != null) {
      return info.size;
    } else {
      return 0;
    }
  }

  setFileSize(file, size) {
    return this.project.setFileInfo(file, "size", size);
  }

  getFileProperties(file) {
    var info;
    info = this.project.getFileInfo(file);
    if (info.properties != null) {
      return info.properties;
    } else {
      return {};
    }
  }

  setFileProperties(file, properties) {
    return this.project.setFileInfo(file, "properties", properties);
  }

  propagateUserListChange() {
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
  }

  propagateLock(user, file) {
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
  }

  propagateFileChange(author, file, version, content, properties) {
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
  }

  propagateFileDeleted(author, file) {
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
  }

  propagateOptions(author) {
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
          public: this.project.public
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
          public: this.project.public
        });
      }
    }
  }

  inviteUser(source, user) {
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
  }

  acceptInvite(user) {
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
  }

  removeUser(source, user) {
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
  }

  listFiles(folder, callback) {
    var file;
    file = `${this.project.owner.id}/${this.project.id}/${folder}`;
    return this.project.content.files.list(file, (files) => {
      var f, i, len, res;
      res = [];
      files = files || [];
      for (i = 0, len = files.length; i < len; i++) {
        f = files[i];
        if (!f.startsWith(".")) {
          res.push({
            file: f,
            version: this.getFileVersion(folder + "/" + f),
            size: this.getFileSize(folder + "/" + f),
            properties: this.getFileProperties(folder + "/" + f)
          });
        }
      }
      return callback(res);
    });
  }

  getFileVersions(callback) {
    var folder, funk, jobs, res, t;
    res = {};
    jobs = [];
    for (folder in FILE_TYPES) {
      t = FILE_TYPES[folder];
      res[t.property] = {};
      jobs.push(t);
    }
    funk = () => {
      var job;
      if (jobs.length > 0) {
        job = jobs.splice(0, 1)[0];
        return this.listFiles(job.folder, (files) => {
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
    return funk();
  }

  listProjectFiles(session, data) {
    var file;
    if (!this.canRead(session.user)) {
      return console.log("unauthorized user");
    }
    file = `${this.project.owner.id}/${this.project.id}/${data.folder}`;
    return this.project.content.files.list(file, (files) => {
      var f, i, len, res;
      res = [];
      files = files || [];
      for (i = 0, len = files.length; i < len; i++) {
        f = files[i];
        if (!f.startsWith(".")) {
          res.push({
            file: f,
            version: this.getFileVersion(data.folder + "/" + f),
            size: this.getFileSize(data.folder + "/" + f),
            properties: this.getFileProperties(data.folder + "/" + f)
          });
        }
      }
      return session.send({
        name: "list_project_files",
        files: res,
        request_id: data.request_id
      });
    });
  }

  readProjectFile(session, data) {
    var encoding, file;
    //console.info "projectmanager.readProjectFile"
    if (!this.canRead(session.user)) {
      return;
    }
    file = `${this.project.owner.id}/${this.project.id}/${data.file}`;
    encoding = data.file.endsWith(".ms") || data.file.endsWith(".json") || data.file.endsWith(".md") ? "text" : "base64";
    return this.project.content.files.read(file, encoding, (content) => {
      var out;
      out = data.file.endsWith(".ms") || data.file.endsWith(".json") || data.file.endsWith(".md") ? "utf8" : "base64";
      if (content != null) {
        return session.send({
          name: "read_project_file",
          content: content.toString(out),
          request_id: data.request_id
        });
      }
    });
  }

  writeProjectFile(session, data) {
    var content, f, file, ref, remaining, th, version;
    if (!this.canWrite(session.user)) {
      return;
    }
    if (this.project.deleted) {
      return;
    }
    if (data.file == null) {
      return;
    }
    if (data.content == null) {
      return;
    }
    if (data.content.length > 40000000) { // absolute max file size 30 megabytes
      session.showError("File too large.");
      return;
    }
    if (data.content.length > 1000000) { // large file, check allowed storage
      remaining = session.user.max_storage - session.user.getTotalSize();
      if (data.content.length / 4 * 3 >= remaining) {
        if (session.user.flags.guest) {
          session.showError("File too large. Create an account for more storage space.");
        } else {
          session.showError("File too large. You account is out of storage space.");
        }
        if (data.request_id != null) {
          session.send({
            name: "write_project_file",
            size: data.content.length,
            request_id: data.request_id
          }); // response to trigger the asset list update
        }
        return;
      }
    }
    if (!/^(ms|sprites|maps|sounds|music|doc|assets)\/[a-z0-9_]{1,40}(-[a-z0-9_]{1,40}){0,10}.(ms|png|json|wav|mp3|ogg|flac|md|glb|obj|jpg|ttf|txt|csv)$/.test(data.file)) {
      console.info(`wrong file name: ${data.file}`);
      return;
    }
    version = this.getFileVersion(data.file);
    if (version === 0) { // new file
      if (!session.server.rate_limiter.accept("create_file_user", session.user.id)) {
        return;
      }
    }
    file = `${this.project.owner.id}/${this.project.id}/${data.file}`;
    if (data.content != null) {
      if ((ref = data.file.split(".")[1]) === "ms" || ref === "json" || ref === "md" || ref === "txt" || ref === "csv") {
        content = data.content;
      } else {
        content = new Buffer(data.content, "base64");
      }
      this.project.content.files.write(file, content, () => {
        version += 1;
        this.setFileVersion(data.file, version);
        this.setFileSize(data.file, content.length);
        if (data.properties != null) {
          this.setFileProperties(data.file, data.properties);
        }
        if (data.request_id != null) {
          session.send({
            name: "write_project_file",
            version: version,
            size: content.length,
            request_id: data.request_id
          });
        }
        this.propagateFileChange(session, data.file, version, data.content, data.properties);
        return this.project.touch();
      });
    }
    if (data.thumbnail != null) {
      th = new Buffer(data.thumbnail, "base64");
      f = file.split("/");
      f[2] += "_th";
      f[3] = f[3].split(".")[0] + ".png";
      f = f.join("/");
      return this.project.content.files.write(f, th, () => {
        return console.info("thumbnail saved");
      });
    }
  }

  renameProjectFile(session, data) {
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
    if (!/^(ms|sprites|maps|sounds|music|doc|assets)\/[a-z0-9_]{1,40}(-[a-z0-9_]{1,40}){0,10}.(ms|png|json|wav|mp3|ogg|flac|md|glb|obj|jpg|ttf|txt|csv)$/.test(data.source)) {
      console.info(`wrong source name: ${data.source}`);
      return;
    }
    if (!/^(ms|sprites|maps|sounds|music|doc|assets)\/[a-z0-9_]{1,40}(-[a-z0-9_]{1,40}){0,10}.(ms|png|json|wav|mp3|ogg|flac|md|glb|obj|jpg|ttf|txt|csv)$/.test(data.dest)) {
      console.info(`wrong dest name: ${data.dest}`);
      return;
    }
    source = `${this.project.owner.id}/${this.project.id}/${data.source}`;
    dest = `${this.project.owner.id}/${this.project.id}/${data.dest}`;
    return this.project.content.files.read(source, "binary", (content) => {
      if (content != null) {
        return this.project.content.files.write(dest, content, () => {
          this.setFileProperties(data.dest, this.getFileProperties(data.source));
          this.setFileVersion(data.dest, this.getFileVersion(data.source));
          this.project.deleteFileInfo(data.source);
          this.setFileSize(data.dest, content.length);
          this.project.touch();
          return this.project.content.files.delete(source, () => {
            if (data.thumbnail) {
              source = source.split("/");
              source[2] += "_th";
              source[3] = source[3].split(".")[0] + ".png";
              source = source.join("/");
              dest = dest.split("/");
              dest[2] += "_th";
              dest[3] = dest[3].split(".")[0] + ".png";
              dest = dest.join("/");
              return this.project.content.files.read(source, "binary", (thumbnail) => {
                if (thumbnail != null) {
                  return this.project.content.files.write(dest, thumbnail, () => {
                    return this.project.content.files.delete(source, () => {
                      session.send({
                        name: "rename_project_file",
                        request_id: data.request_id
                      });
                      this.propagateFileDeleted(session, data.source);
                      return this.propagateFileChange(session, data.dest, 0, null, {});
                    });
                  });
                }
              });
            } else {
              session.send({
                name: "rename_project_file",
                request_id: data.request_id
              });
              this.propagateFileDeleted(session, data.source);
              return this.propagateFileChange(session, data.dest, 0, null, {});
            }
          });
        });
      }
    });
  }

  deleteProjectFile(session, data) {
    var f, file;
    if (!this.canWrite(session.user)) {
      return;
    }
    if (data.file == null) {
      return;
    }
    file = `${this.project.owner.id}/${this.project.id}/${data.file}`;
    this.project.content.files.delete(file, () => {
      this.project.deleteFileInfo(data.file);
      if (data.request_id != null) {
        session.send({
          name: "delete_project_file",
          request_id: data.request_id
        });
      }
      this.propagateFileDeleted(session, data.file);
      return this.project.touch();
    });
    if (data.thumbnail) {
      f = file.split("/");
      f[2] += "_th";
      f[3] = f[3].split(".")[0] + ".png";
      f = f.join("/");
      return this.project.content.files.delete(f, () => {});
    }
  }

  importFiles(contents, callback) {
    var filename, files, funk;
    files = [];
    for (filename in contents.files) {
      files.push(filename);
    }
    funk = () => {
      var d, dest, end, err, ref, type, value;
      if (files.length > 0) {
        filename = files.splice(0, 1)[0];
        value = contents.files[filename];
        if (/^(ms|sprites|maps|sounds|music|doc|assets|sounds_th|music_th|assets_th)\/[a-z0-9_]{1,40}([-\/][a-z0-9_]{1,40}){0,10}.(ms|py|js|lua|png|json|wav|mp3|ogg|flac|md|glb|obj|jpg|ttf|txt|csv)$/.test(filename)) {
          dest = filename;
          d = dest.split("/");
          while (d.length > 2) {
            end = d.splice(d.length - 1, 1)[0];
            d[d.length - 1] += `-${end}`;
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
            return contents.file(filename).async(type).then(((fileContent) => {
              if (fileContent != null) {
                return this.project.content.files.write(`${this.project.owner.id}/${this.project.id}/${dest}`, fileContent, funk);
              } else {
                return funk();
              }
            }), () => {
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
    return funk();
  }

  syncFiles(session, data, source) {
    var funk, ops, syncFile;
    ops = data.ops;
    if (!this.canWrite(session.user)) {
      return;
    }
    if (!Array.isArray(ops)) {
      return;
    }
    syncFile = (f, callback) => {
      var file;
      file = `${source.owner.id}/${source.id}/${f}`;
      return source.content.files.read(file, "binary", (content) => {
        var th;
        if (content != null) {
          file = `${this.project.owner.id}/${this.project.id}/${f}`;
          this.project.content.files.write(file, content, () => {
            if (callback != null) {
              return callback();
            }
          });
          if (f.startsWith("assets/") || f.startsWith("sounds/") || f.startsWith("music/")) {
            th = f.split("/");
            th[0] += "_th";
            th[1] = th[1].split(".")[0] + ".png";
            f = th.join("/");
            file = `${source.owner.id}/${source.id}/${f}`;
            return source.content.files.read(file, "binary", (content) => {
              if (content != null) {
                file = `${this.project.owner.id}/${this.project.id}/${f}`;
                return this.project.content.files.write(file, content, () => {});
              }
            });
          }
        } else {
          if (callback != null) {
            return callback();
          }
        }
      });
    };
    funk = () => {
      var f, file, op;
      if (ops.length > 0) {
        op = ops.splice(0, 1)[0];
        if (!((op.file != null) && (op.file.path != null) && (op.file.version != null) && (op.file.size != null))) {
          return;
        }
        if (op.op === "sync") {
          f = op.file;
          return syncFile(f.path, () => {
            this.setFileVersion(f.path, f.version);
            this.setFileSize(f.path, f.size);
            if (f.properties != null) {
              this.setFileProperties(f.path, f.properties);
            }
            funk();
            return this.propagateFileChange(null, f.path, f.version, void 0, f.properties || {});
          });
        } else if (op.op === "delete") {
          f = op.file;
          file = `${this.project.owner.id}/${this.project.id}/${f.path}`;
          return this.project.content.files.delete(file, () => {
            this.project.deleteFileInfo(f.path);
            funk();
            return this.propagateFileDeleted(null, f.path);
          });
        }
      } else {
        session.send({
          name: "sync_project_files",
          status: "done",
          request_id: data.request_id
        });
        return this.project.touch();
      }
    };
    return funk();
  }

};

module.exports = this.ProjectManager;
