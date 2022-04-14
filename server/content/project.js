var Comments, ProjectLink, fs;

Comments = require(__dirname + "/comments.js");

fs = require("fs");

ProjectLink = (function() {
  function ProjectLink(project, data) {
    this.project = project;
    this.user = this.project.content.users[data.user];
    this.accepted = data.accepted;
    if (this.user != null) {
      this.user.addProjectLink(this);
    }
  }

  ProjectLink.prototype.accept = function() {
    if (!this.accepted) {
      this.accepted = true;
      return this.project.saveUsers();
    }
  };

  ProjectLink.prototype.remove = function() {
    this.project.removeUser(this);
    return this.user.removeLink(this.project.id);
  };

  return ProjectLink;

})();

this.Project = (function() {
  function Project(content, record) {
    var data, j, len, link, ref, u;
    this.content = content;
    this.record = record;
    data = this.record.get();
    this.id = data.id;
    this.title = data.title;
    this.slug = data.slug;
    this.code = data.code || this.createCode();
    this.tags = data.tags || [];
    this.description = data.description || "";
    this.likes = 0;
    this["public"] = data["public"];
    this.unlisted = data.unlisted;
    this.date_created = data.date_created;
    this.last_modified = data.last_modified;
    this.first_published = data.first_published || 0;
    this.orientation = data.orientation || "any";
    this.aspect = data.aspect || "free";
    this.graphics = data.graphics || "M1";
    this.language = data.language || "microscript_v2";
    this.platforms = data.platforms || ["computer", "phone", "tablet"];
    this.controls = data.controls || ["touch", "mouse"];
    this.libs = data.libs || [];
    this.tabs = data.tabs;
    this.type = data.type || "app";
    this.deleted = data.deleted;
    this.users = [];
    this.comments = new Comments(this, data.comments);
    if (!this.deleted) {
      this.owner = this.content.users[data.owner];
      if (this.owner != null) {
        this.owner.addProject(this);
      }
      if (data.users != null) {
        ref = data.users;
        for (j = 0, len = ref.length; j < len; j++) {
          u = ref[j];
          link = new ProjectLink(this, u);
          if (link.user != null) {
            this.users.push(link);
          }
        }
      }
    }
    if ((data.files != null) && !this.deleted) {
      this.files = data.files;
    } else {
      this.files = {};
    }
    this.update_project_size = true;
  }

  Project.prototype.createCode = function() {
    var code, i, j, letters;
    letters = "ABCDEFGHJKMNPRSTUVWXYZ23456789";
    code = "";
    for (i = j = 0; j <= 7; i = j += 1) {
      code += "" + letters.charAt(Math.floor(Math.random() * letters.length));
    }
    this.set("code", code);
    return code;
  };

  Project.prototype.touch = function() {
    var data;
    this.last_modified = Date.now();
    data = this.record.get();
    data.last_modified = this.last_modified;
    return this.record.set(data);
  };

  Project.prototype.set = function(prop, value, update_local) {
    var data;
    if (update_local == null) {
      update_local = true;
    }
    data = this.record.get();
    data[prop] = value;
    this.record.set(data);
    if (update_local) {
      return this[prop] = value;
    }
  };

  Project.prototype.setTitle = function(title) {
    if ((title != null) && title.trim().length > 0 && title.length < 50) {
      this.set("title", title);
      return true;
    } else {
      return false;
    }
  };

  Project.prototype.setSlug = function(slug) {
    if ((slug != null) && /^([a-z0-9_][a-z0-9_-]{0,29})$/.test(slug)) {
      if (this.owner.findProjectBySlug(slug) != null) {
        return false;
      }
      this.set("slug", slug);
      return true;
    } else {
      return false;
    }
  };

  Project.prototype.setCode = function(code) {
    if ((code != null) && /^([a-zA-Z0-9_][a-zA-Z0-9_-]{0,29})$/.test(code)) {
      this.set("code", code);
      return true;
    } else {
      return false;
    }
  };

  Project.prototype.setType = function(type) {
    return this.set("type", type);
  };

  Project.prototype.setOrientation = function(orientation) {
    return this.set("orientation", orientation);
  };

  Project.prototype.setAspect = function(aspect) {
    return this.set("aspect", aspect);
  };

  Project.prototype.setGraphics = function(graphics) {
    return this.set("graphics", graphics);
  };

  Project.prototype.saveUsers = function() {
    var data, j, len, link, ref;
    data = [];
    ref = this.users;
    for (j = 0, len = ref.length; j < len; j++) {
      link = ref[j];
      data.push({
        user: link.user.id,
        accepted: link.accepted
      });
    }
    return this.set("users", data, false);
  };

  Project.prototype.inviteUser = function(user) {
    var j, len, link, ref;
    if (user === this.owner) {
      return;
    }
    ref = this.users;
    for (j = 0, len = ref.length; j < len; j++) {
      link = ref[j];
      if (user === link.user) {
        return;
      }
    }
    link = new ProjectLink(this, {
      user: user.id,
      accepted: false
    });
    if (link.user != null) {
      this.users.push(link);
      return this.saveUsers();
    }
  };

  Project.prototype.removeUser = function(link) {
    var index;
    index = this.users.indexOf(link);
    if (index >= 0) {
      this.users.splice(index, 1);
      return this.saveUsers();
    }
  };

  Project.prototype.listUsers = function() {
    var j, len, link, list, ref;
    list = [];
    ref = this.users;
    for (j = 0, len = ref.length; j < len; j++) {
      link = ref[j];
      list.push({
        id: link.user.id,
        nick: link.user.nick,
        accepted: link.accepted
      });
    }
    return list;
  };

  Project.prototype["delete"] = function() {
    var data, folder, i, j, link, ref;
    this.deleted = true;
    data = this.record.get();
    data.deleted = this.deleted;
    this.record.set(data);
    this.content.projectDeleted(this);
    for (i = j = ref = this.users.length - 1; j >= 0; i = j += -1) {
      link = this.users[i];
      link.remove();
    }
    delete this.manager;
    folder = this.owner.id + "/" + this.id;
    this.content.files.deleteFolder(folder);
  };

  Project.prototype.getFileInfo = function(file) {
    return this.files[file] || {};
  };

  Project.prototype.setFileInfo = function(file, key, value) {
    var info;
    info = this.getFileInfo(file);
    info[key] = value;
    this.files[file] = info;
    this.set("files", this.files);
    return this.update_project_size = true;
  };

  Project.prototype.deleteFileInfo = function(file) {
    delete this.files[file];
    this.set("files", this.files);
    return this.update_project_size = true;
  };

  Project.prototype.getSize = function() {
    if (this.update_project_size) {
      this.updateProjectSize();
    }
    return this.byte_size;
  };

  Project.prototype.updateProjectSize = function() {
    var file, key, ref;
    this.byte_size = 0;
    this.update_project_size = false;
    ref = this.files;
    for (key in ref) {
      file = ref[key];
      if (file.size != null) {
        this.byte_size += file.size;
      }
    }
  };

  Project.prototype.filenameChanged = function(previous, next) {
    if (this.files[previous] != null) {
      this.files[next] = this.files[previous];
      delete this.files[previous];
      return this.set("files", this.files);
    }
  };

  Project.prototype.fileDeleted = function(file) {
    if (this.files[file]) {
      delete this.files[file];
      return this.set("files", this.files);
    }
  };

  Project.prototype.updateFileSizes = function(callback) {
    var list, maps, process, source, sprites;
    source = "../files/" + this.content.files.sanitize(this.owner.id + "/" + this.id + "/ms");
    sprites = "../files/" + this.content.files.sanitize(this.owner.id + "/" + this.id + "/sprites");
    maps = "../files/" + this.content.files.sanitize(this.owner.id + "/" + this.id + "/maps");
    list = [];
    process = (function(_this) {
      return function() {
        var f, file;
        if (list.length > 0) {
          f = list.splice(0, 1)[0];
          file = "../files/" + _this.content.files.sanitize(_this.owner.id + "/" + _this.id + "/" + f);
          return fs.lstat(file, function(err, stat) {
            if ((stat != null) && (stat.size != null)) {
              _this.setFileInfo(f, "size", stat.size);
            }
            return setTimeout((function() {
              return process();
            }), 0);
          });
        } else {
          if (callback != null) {
            return callback();
          }
        }
      };
    })(this);
    return fs.readdir(source, (function(_this) {
      return function(err, files) {
        var f, j, len;
        if (files) {
          for (j = 0, len = files.length; j < len; j++) {
            f = files[j];
            list.push("ms/" + f);
          }
        }
        return fs.readdir(sprites, function(err, files) {
          var k, len1;
          if (files) {
            for (k = 0, len1 = files.length; k < len1; k++) {
              f = files[k];
              list.push("sprites/" + f);
            }
          }
          return fs.readdir(maps, function(err, files) {
            var l, len2;
            if (files) {
              for (l = 0, len2 = files.length; l < len2; l++) {
                f = files[l];
                list.push("maps/" + f);
              }
            }
            return process();
          });
        });
      };
    })(this));
  };

  return Project;

})();

module.exports = this.Project;
