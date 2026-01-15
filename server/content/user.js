var UserProgress;

UserProgress = require(__dirname + "/../gamify/userprogress.js");

this.User = class User {
  constructor(content, record) {
    var data;
    this.content = content;
    this.record = record;
    data = this.record.get();
    this.flags = data.flags || {};
    if (this.flags.deleted) {
      if (data.nick != null) {
        this.record.set({
          flags: {
            deleted: true
          }
        });
      }
    }
    if (!this.flags.deleted) {
      this.id = data.id;
      this.nick = data.nick;
      this.email = data.email;
      this.language = data.language || "en";
      this.settings = data.settings || {};
      this.hash = data.hash;
      this.patches = [];
      this.likes = data.likes || [];
      this.projects = {};
      this.project_links = [];
      this.listeners = [];
      this.notifications = [];
      this.description = data.description || "";
      this.last_active = data.last_active || 0;
      this.updateTier();
      this.progress = new UserProgress(this, data);
      this.checkStringField("nick", 50);
      this.checkStringField("email", 100);
      this.checkStringField("description", 10000);
    }
  }

  checkStringField(field, size) {
    if (typeof this[field] === "string") {
      if (this[field].length > size) {
        console.info("field " + field + " oversize: " + this[field].length);
        return this.set(field, this[field].substring(0, size));
      }
    }
  }

  updateTier() {
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
  }

  addListener(listener) {
    if (this.listeners.indexOf(listener) < 0) {
      return this.listeners.push(listener);
    }
  }

  removeListener(listener) {
    var index;
    index = this.listeners.indexOf(listener);
    if (index >= 0) {
      return this.listeners.splice(index, 1);
    }
  }

  addProject(project) {
    return this.projects[project.id] = project;
  }

  listProjects() {
    var key, list;
    list = [];
    for (key in this.projects) {
      list.push(this.projects[key]);
    }
    return list;
  }

  listPublicProjects() {
    var key, list, project, ref;
    list = [];
    ref = this.projects;
    for (key in ref) {
      project = ref[key];
      if (project.public) {
        list.push(project);
      }
    }
    return list;
  }

  getTotalSize() {
    var key, project, ref, size;
    size = 0;
    ref = this.projects;
    for (key in ref) {
      project = ref[key];
      size += project.getSize();
    }
    return size;
  }

  addProjectLink(link) {
    return this.project_links.push(link);
  }

  listProjectLinks() {
    return this.project_links;
  }

  removeLink(projectid) {
    var i, j, len, link, ref;
    ref = this.project_links;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      link = ref[i];
      if (link.project.id === projectid) {
        this.project_links.splice(i, 1);
        return;
      }
    }
  }

  findProject(id) {
    return this.projects[id];
  }

  findProjectBySlug(slug) {
    var key, p;
    for (key in this.projects) {
      p = this.projects[key];
      if (p.slug === slug) {
        return p;
      }
    }
    return null;
  }

  deleteProject(project) {
    delete this.projects[project.id];
    return project.delete();
  }

  set(prop, value) {
    var data;
    data = this.record.get();
    data[prop] = value;
    this.record.set(data);
    return this[prop] = value;
  }

  addLike(id) {
    if (this.likes.indexOf(id) < 0) {
      this.likes.push(id);
      return this.set("likes", this.likes);
    }
  }

  removeLike(id) {
    var index;
    index = this.likes.indexOf(id);
    if (index >= 0) {
      this.likes.splice(index, 1);
      return this.set("likes", this.likes);
    }
  }

  isLiked(id) {
    return this.likes.indexOf(id) >= 0;
  }

  // Flags reference
  // * validated (e-mail validated)
  // * deleted (account deleted)
  // *
  setFlag(flag, value) {
    if (value) {
      this.flags[flag] = value;
    } else {
      delete this.flags[flag];
    }
    return this.set("flags", this.flags);
  }

  setSetting(setting, value) {
    if (value) {
      this.settings[setting] = value;
    } else {
      delete this.settings[setting];
    }
    return this.set("settings", this.settings);
  }

  createValidationToken() {
    var i, j, map, token;
    map = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    token = "";
    for (i = j = 1; j <= 32; i = j += 1) {
      token += map.charAt(Math.floor(Math.random() * map.length));
    }
    this.record.setField("validation_token", token);
    return token;
  }

  getValidationToken() {
    var code;
    code = this.record.getField("validation_token");
    if (code == null) {
      code = this.createValidationToken();
    }
    return code;
  }

  resetValidationToken() {
    return this.record.setField("validation_token");
  }

  canPublish() {
    return this.flags.validated && !this.flags.deleted && !this.flags.banned;
  }

  showPublicStuff() {
    return this.flags.validated && !this.flags.deleted && !this.flags.banned && !this.flags.censored;
  }

  notify(text) {
    return this.notifications.push(text);
  }

  delete() {
    var folder, key, project, ref;
    this.flags.deleted = true;
    this.record.set({
      flags: {
        deleted: true
      }
    });
    this.content.userDeleted(this);
    ref = this.projects;
    for (key in ref) {
      project = ref[key];
      project.delete();
    }
    this.projects = {};
    folder = `${this.id}`;
    this.content.files.deleteFolder(folder);
  }

};

module.exports = this.User;
