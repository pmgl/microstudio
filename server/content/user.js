var UserProgress;

UserProgress = require(__dirname + "/../gamify/userprogress.js");

this.User = (function() {
  function User(content, record) {
    var data;
    this.content = content;
    this.record = record;
    data = this.record.get();
    this.id = data.id;
    this.nick = data.nick;
    this.email = data.email;
    this.language = data.language || "en";
    this.flags = data.flags || {};
    this.settings = data.settings || {};
    this.hash = data.hash;
    this.patches = [];
    this.likes = data.likes || [];
    this.projects = {};
    this.project_links = [];
    this.listeners = [];
    this.notifications = [];
    this.description = data.description || "";
    this.updateTier();
    this.progress = new UserProgress(this, data);
  }

  User.prototype.updateTier = function() {
    switch (this.flags.tier) {
      case "pixel_master":
        this.max_storage = 200000000;
        return this.early_access = false;
      case "code_ninja":
        this.max_storage = 400000000;
        return this.early_access = false;
      case "gamedev_lord":
        this.max_storage = 1000000000;
        return this.early_access = true;
      case "founder":
        this.max_storage = 2000000000;
        return this.early_access = true;
      case "sponsor":
        this.max_storage = 2000000000;
        return this.early_access = true;
      default:
        if (this.flags.guest) {
          this.max_storage = 2000000;
          return this.early_access = false;
        } else {
          this.max_storage = 50000000;
          return this.early_access = false;
        }
    }
  };

  User.prototype.addListener = function(listener) {
    if (this.listeners.indexOf(listener) < 0) {
      return this.listeners.push(listener);
    }
  };

  User.prototype.removeListener = function(listener) {
    var index;
    index = this.listeners.indexOf(listener);
    if (index >= 0) {
      return this.listeners.splice(index, 1);
    }
  };

  User.prototype.addProject = function(project) {
    return this.projects[project.id] = project;
  };

  User.prototype.listProjects = function() {
    var key, list;
    list = [];
    for (key in this.projects) {
      list.push(this.projects[key]);
    }
    return list;
  };

  User.prototype.listPublicProjects = function() {
    var key, list, project, ref;
    list = [];
    ref = this.projects;
    for (key in ref) {
      project = ref[key];
      if (project["public"]) {
        list.push(project);
      }
    }
    return list;
  };

  User.prototype.getTotalSize = function() {
    var key, project, ref, size;
    size = 0;
    ref = this.projects;
    for (key in ref) {
      project = ref[key];
      size += project.getSize();
    }
    return size;
  };

  User.prototype.addProjectLink = function(link) {
    return this.project_links.push(link);
  };

  User.prototype.listProjectLinks = function() {
    return this.project_links;
  };

  User.prototype.removeLink = function(projectid) {
    var i, j, len, link, ref;
    ref = this.project_links;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      link = ref[i];
      if (link.project.id === projectid) {
        this.project_links.splice(i, 1);
        return;
      }
    }
  };

  User.prototype.findProject = function(id) {
    return this.projects[id];
  };

  User.prototype.findProjectBySlug = function(slug) {
    var key, p;
    for (key in this.projects) {
      p = this.projects[key];
      if (p.slug === slug) {
        return p;
      }
    }
    return null;
  };

  User.prototype.deleteProject = function(project) {
    delete this.projects[project.id];
    return project["delete"]();
  };

  User.prototype.set = function(prop, value) {
    var data;
    data = this.record.get();
    data[prop] = value;
    this.record.set(data);
    return this[prop] = value;
  };

  User.prototype.addLike = function(id) {
    if (this.likes.indexOf(id) < 0) {
      this.likes.push(id);
      return this.set("likes", this.likes);
    }
  };

  User.prototype.removeLike = function(id) {
    var index;
    index = this.likes.indexOf(id);
    if (index >= 0) {
      this.likes.splice(index, 1);
      return this.set("likes", this.likes);
    }
  };

  User.prototype.isLiked = function(id) {
    return this.likes.indexOf(id) >= 0;
  };

  User.prototype.setFlag = function(flag, value) {
    if (value) {
      this.flags[flag] = value;
    } else {
      delete this.flags[flag];
    }
    return this.set("flags", this.flags);
  };

  User.prototype.setSetting = function(setting, value) {
    if (value) {
      this.settings[setting] = value;
    } else {
      delete this.settings[setting];
    }
    return this.set("settings", this.settings);
  };

  User.prototype.createValidationToken = function() {
    var i, j, map, token;
    map = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    token = "";
    for (i = j = 1; j <= 32; i = j += 1) {
      token += map.charAt(Math.floor(Math.random() * map.length));
    }
    this.record.setField("validation_token", token);
    return token;
  };

  User.prototype.getValidationToken = function() {
    var code;
    code = this.record.getField("validation_token");
    if (code == null) {
      code = this.createValidationToken();
    }
    return code;
  };

  User.prototype.resetValidationToken = function() {
    return this.record.setField("validation_token");
  };

  User.prototype.canPublish = function() {
    return this.flags.validated && !this.flags.deleted && !this.flags.banned;
  };

  User.prototype.showPublicStuff = function() {
    return this.flags.validated && !this.flags.deleted && !this.flags.banned && !this.flags.censored;
  };

  User.prototype.notify = function(text) {
    return this.notifications.push(text);
  };

  User.prototype["delete"] = function() {
    var folder, key, project, ref;
    this.setFlag("deleted", true);
    this.content.userDeleted(this);
    ref = this.projects;
    for (key in ref) {
      project = ref[key];
      project["delete"]();
    }
    this.projects = {};
    folder = "" + this.id;
    this.content.files.deleteFolder(folder);
  };

  return User;

})();

module.exports = this.User;
