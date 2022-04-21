var Cleaner, DEFAULT_CODE, Forum, Project, Tag, Token, Translator, User, usage;

usage = require("pidusage");

User = require(__dirname + "/user.js");

Project = require(__dirname + "/project.js");

Tag = require(__dirname + "/tag.js");

Token = require(__dirname + "/token.js");

Translator = require(__dirname + "/translator.js");

Forum = require(__dirname + "/../forum/forum.js");

Cleaner = require(__dirname + "/cleaner.js");

this.Content = (function() {
  function Content(server, db, files) {
    this.server = server;
    this.db = db;
    this.files = files;
    this.users = {};
    this.users_by_email = {};
    this.users_by_nick = {};
    this.tokens = {};
    this.projects = {};
    this.tags = {};
    this.sorted_tags = [];
    this.project_count = 0;
    this.user_count = 0;
    this.guest_count = 0;
    this.load();
    this.hot_projects = [];
    this.top_projects = [];
    this.new_projects = [];
    this.updatePublicProjects();
    console.info("Content loaded: " + this.user_count + " users and " + this.project_count + " projects");
    this.top_interval = setInterval(((function(_this) {
      return function() {
        return _this.sortPublicProjects();
      };
    })(this)), 10001);
    this.log_interval = setInterval(((function(_this) {
      return function() {
        return _this.statusLog();
      };
    })(this)), 6000);
    this.translator = new Translator(this);
    this.forum = new Forum(this);
    this.cleaner = new Cleaner(this);
  }

  Content.prototype.close = function() {
    clearInterval(this.top_interval);
    clearInterval(this.log_interval);
    this.forum.close();
    if (this.cleaner != null) {
      return this.cleaner.stop();
    }
  };

  Content.prototype.statusLog = function() {
    return usage(process.pid, (function(_this) {
      return function(err, result) {
        if (result == null) {
          return;
        }
        console.info("------------");
        console.info("" + (new Date().toString()));
        console.info("cpu: " + (Math.round(result.cpu)) + "%");
        console.info("memory: " + (Math.round(result.memory / 1000000)) + " mb");
        console.info("users: " + _this.user_count);
        console.info("projects: " + _this.project_count);
        _this.current_cpu = Math.round(result.cpu);
        _this.current_memory = Math.round(result.memory / 1000000);
        _this.server.stats.max("cpu_max", Math.round(result.cpu));
        return _this.server.stats.max("memory_max", _this.current_memory);
      };
    })(this));
  };

  Content.prototype.load = function() {
    var j, k, l, len, len1, len2, projects, record, token, tokens, user, users;
    users = this.db.list("users");
    for (j = 0, len = users.length; j < len; j++) {
      record = users[j];
      this.loadUser(record);
    }
    if (this.server.config.standalone) {
      if (this.user_count > 1) {
        throw "Error, cannot run standalone if user_count>1";
      } else if (this.user_count === 0) {
        user = this.createUser({
          nick: "microstudio",
          email: "standalone@microstudio.dev",
          flags: {
            validated: true
          },
          hash: "---",
          date_created: Date.now(),
          last_active: Date.now(),
          creation_ip: "127.0.0.1"
        });
      }
    }
    tokens = this.db.list("tokens");
    for (k = 0, len1 = tokens.length; k < len1; k++) {
      token = tokens[k];
      this.loadToken(token);
    }
    projects = this.db.list("projects");
    for (l = 0, len2 = projects.length; l < len2; l++) {
      record = projects[l];
      this.loadProject(record);
    }
    this.initLikes();
  };

  Content.prototype.loadUser = function(record) {
    var data, user;
    data = record.get();
    user = new User(this, record);
    if (user.flags.deleted) {
      return;
    }
    this.users[user.id] = user;
    if (user.email != null) {
      this.users_by_email[user.email] = user;
    } else {
      this.guest_count += 1;
    }
    this.users_by_nick[user.nick] = user;
    this.user_count++;
    return user;
  };

  Content.prototype.loadProject = function(record) {
    var data, project;
    data = record.get();
    project = new Project(this, record);
    if ((project.owner != null) && !project.deleted) {
      this.projects[project.id] = project;
      this.loadTags(project);
      this.project_count++;
    }
    return project;
  };

  Content.prototype.loadTags = function(project) {
    var j, len, ref, t, tag;
    ref = project.tags;
    for (j = 0, len = ref.length; j < len; j++) {
      t = ref[j];
      tag = this.tags[t];
      if (tag == null) {
        tag = new Tag(t);
        this.tags[t] = tag;
        this.sorted_tags.push(tag);
      }
      tag.add(project);
    }
  };

  Content.prototype.loadToken = function(record) {
    var data, token;
    data = record.get();
    token = new Token(this, record);
    if (token.user != null) {
      this.tokens[token.value] = token;
    }
    return token;
  };

  Content.prototype.initLikes = function() {
    var f, j, key, len, ref, ref1, user;
    ref = this.users;
    for (key in ref) {
      user = ref[key];
      ref1 = user.likes;
      for (j = 0, len = ref1.length; j < len; j++) {
        f = ref1[j];
        if (this.projects[f] != null) {
          this.projects[f].likes++;
        }
      }
    }
  };

  Content.prototype.updatePublicProjects = function() {
    var key, project, ref;
    this.hot_projects = [];
    this.top_projects = [];
    this.new_projects = [];
    ref = this.projects;
    for (key in ref) {
      project = ref[key];
      if (project["public"] && !project.unlisted && project.owner.flags["validated"] && !project.deleted && !project.owner.flags["censored"]) {
        this.hot_projects.push(project);
        this.top_projects.push(project);
        this.new_projects.push(project);
      }
    }
    return this.sortPublicProjects();
  };

  Content.prototype.sortPublicProjects = function() {
    var fade, maxLikes, note, now, time;
    time = Date.now();
    this.top_projects.sort(function(a, b) {
      return b.likes - a.likes;
    });
    this.new_projects.sort(function(a, b) {
      return b.first_published - a.first_published;
    });
    this.sorted_tags.sort(function(a, b) {
      return b.uses + b.num_users * 10 - a.uses - a.num_users * 10;
    });
    if (this.top_projects.length < 5) {
      return;
    }
    now = Date.now();
    maxLikes = Math.max(1, this.top_projects[4].likes);
    fade = function(x) {
      return 1 - Math.max(0, Math.min(1, x));
    };
    note = function(p) {
      var rating, recent;
      recent = fade((now - p.first_published) / 1000 / 3600 / 24 / 4);
      rating = p.likes / maxLikes * (.15 + 2 * fade((now - p.first_published) / 1000 / 3600 / 24 / 180));
      return recent + rating;
    };
    this.hot_projects.sort(function(a, b) {
      return note(b) - note(a);
    });
    return console.info("Sorting public projects took: " + (Date.now() - time) + " ms");
  };

  Content.prototype.setProjectPublic = function(project, pub) {
    var index;
    project.set("public", pub);
    if (pub && project.first_published === 0) {
      project.set("first_published", Date.now());
    }
    if (pub && !project.unlisted) {
      if (this.hot_projects.indexOf(project) < 0) {
        this.hot_projects.push(project);
      }
      if (this.top_projects.indexOf(project) < 0) {
        this.top_projects.push(project);
      }
      if (this.new_projects.indexOf(project) < 0) {
        return this.new_projects.push(project);
      }
    } else {
      index = this.hot_projects.indexOf(project);
      if (index >= 0) {
        this.hot_projects.splice(index, 1);
      }
      index = this.top_projects.indexOf(project);
      if (index >= 0) {
        this.top_projects.splice(index, 1);
      }
      index = this.new_projects.indexOf(project);
      if (index >= 0) {
        return this.new_projects.splice(index, 1);
      }
    }
  };

  Content.prototype.projectDeleted = function(project) {
    var index;
    this.project_count -= 1;
    index = this.hot_projects.indexOf(project);
    if (index >= 0) {
      this.hot_projects.splice(index, 1);
    }
    index = this.top_projects.indexOf(project);
    if (index >= 0) {
      this.top_projects.splice(index, 1);
    }
    index = this.new_projects.indexOf(project);
    if (index >= 0) {
      return this.new_projects.splice(index, 1);
    }
  };

  Content.prototype.addProjectTag = function(project, t) {
    var tag;
    tag = this.tags[t];
    if (tag == null) {
      tag = new Tag(t);
      this.tags[t] = tag;
      this.sorted_tags.push(tag);
    }
    return tag.add(project);
  };

  Content.prototype.removeProjectTag = function(project, t) {
    var tag;
    tag = this.tags[t];
    if (tag != null) {
      return tag.remove(project);
    }
  };

  Content.prototype.setProjectTags = function(project, tags) {
    var j, k, len, len1, ref, t;
    ref = project.tags;
    for (j = 0, len = ref.length; j < len; j++) {
      t = ref[j];
      if (tags.indexOf(t) < 0) {
        this.removeProjectTag(project, t);
      }
    }
    for (k = 0, len1 = tags.length; k < len1; k++) {
      t = tags[k];
      if (project.tags.indexOf(t) < 0) {
        this.addProjectTag(project, t);
      }
    }
    return project.set("tags", tags);
  };

  Content.prototype.createUser = function(data) {
    var record;
    record = this.db.create("users", data);
    return this.loadUser(record);
  };

  Content.prototype.createToken = function(user) {
    var chars, i, j, record, value;
    value = "";
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (i = j = 0; j <= 31; i = j += 1) {
      value += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    record = this.db.create("tokens", {
      value: value,
      user: user.id,
      date_created: Date.now()
    });
    return this.loadToken(record);
  };

  Content.prototype.findUserByNick = function(nick) {
    return this.users_by_nick[nick];
  };

  Content.prototype.findUserByEmail = function(email) {
    return this.users_by_email[email];
  };

  Content.prototype.changeUserNick = function(user, nick) {
    delete this.users_by_nick[user.nick];
    user.set("nick", nick);
    return this.users_by_nick[nick] = user;
  };

  Content.prototype.changeUserEmail = function(user, email) {
    if (user.email != null) {
      delete this.users_by_email[user.email];
    } else {
      this.guest_count -= 1;
    }
    user.set("email", email);
    return this.users_by_email[email] = user;
  };

  Content.prototype.userDeleted = function(user) {
    delete this.users_by_nick[user.nick];
    if (user.email != null) {
      delete this.users_by_email[user.email];
    } else {
      this.guest_count -= 1;
    }
    return this.user_count -= 1;
  };

  Content.prototype.findToken = function(token) {
    return this.tokens[token];
  };

  Content.prototype.createProject = function(owner, data, callback, empty) {
    var content, count, d, project, record, slug;
    if (empty == null) {
      empty = false;
    }
    slug = data.slug;
    if (owner.findProjectBySlug(slug)) {
      count = 2;
      while (owner.findProjectBySlug(slug + count) != null) {
        count += 1;
      }
      data.slug = slug + count;
    }
    d = {
      title: data.title,
      slug: data.slug,
      tags: [],
      likes: [],
      "public": data["public"] || false,
      date_created: Date.now(),
      last_modified: Date.now(),
      deleted: false,
      owner: owner.id,
      orientation: data.orientation,
      aspect: data.aspect,
      type: data.type,
      language: data.language,
      graphics: data.graphics,
      libs: data.libs,
      tabs: data.tabs
    };
    record = this.db.create("projects", d);
    project = this.loadProject(record);
    if (empty) {
      return callback(project);
    } else {
      if ((project.language != null) && (DEFAULT_CODE[project.language] != null)) {
        content = DEFAULT_CODE[project.language];
      } else {
        content = DEFAULT_CODE.microscript;
      }
      return this.files.write(owner.id + "/" + project.id + "/ms/main.ms", content, (function(_this) {
        return function() {
          return _this.files.copyFile("../static/img/defaultappicon.png", owner.id + "/" + project.id + "/sprites/icon.png", function() {
            return callback(project);
          });
        };
      })(this));
    }
  };

  Content.prototype.getConsoleGameList = function() {
    var key, list, p, ref;
    list = [];
    ref = this.projects;
    for (key in ref) {
      p = ref[key];
      if (p["public"] && !p.deleted) {
        list.push({
          author: p.owner.nick,
          slug: p.slug,
          title: p.title
        });
      }
    }
    return list;
  };

  Content.prototype.sendValidationMail = function(user) {
    var subject, text, token, translator;
    if (user.email == null) {
      return;
    }
    token = user.getValidationToken();
    translator = this.translator.getTranslator(user.language);
    subject = translator.get("Microstudio e-mail validation");
    text = translator.get("Thank you for using Microstudio!") + "\n\n";
    text += translator.get("Click on the link below to validate your e-mail address:") + "\n\n";
    text += ("https://microstudio.dev/v/" + user.id + "/" + token) + "\n\n";
    return this.server.mailer.sendMail(user.email, subject, text);
  };

  Content.prototype.sendPasswordRecoveryMail = function(user) {
    var subject, text, token, translator;
    if (user.email == null) {
      return;
    }
    token = user.getValidationToken();
    translator = this.translator.getTranslator(user.language);
    subject = translator.get("Reset your microStudio password");
    text = translator.get("Click on the link below to choose a new microStudio password:") + "\n\n";
    text += ("https://microstudio.dev/pw/" + user.id + "/" + token) + "\n\n";
    return this.server.mailer.sendMail(user.email, subject, text);
  };

  Content.prototype.checkValidationToken = function(user, token) {
    return token === user.getValidationToken();
  };

  Content.prototype.validateEMailAddress = function(user, token) {
    var translator;
    console.info("verifying " + token + " against " + (user.getValidationToken()));
    if ((token != null) && token.length > 0 && this.checkValidationToken(user, token)) {
      user.resetValidationToken();
      user.setFlag("validated", true);
      translator = this.translator.getTranslator(user.language);
      return user.notify(translator.get("Your e-mail address is now validated"));
    }
  };

  return Content;

})();

DEFAULT_CODE = {
  python: "def init():\n  pass\n\ndef update():\n  pass\n\ndef draw():\n  pass",
  javascript: "init = function() {\n}\n\nupdate = function() {\n}\n\ndraw = function() {\n}",
  lua: "init = function()\nend\n\nupdate = function()\nend\n\ndraw = function()\nend",
  microscript: "init = function()\nend\n\nupdate = function()\nend\n\ndraw = function()\nend"
};

module.exports = this.Content;
