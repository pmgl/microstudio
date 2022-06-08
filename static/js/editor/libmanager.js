this.LibManager = (function() {
  function LibManager(app) {
    this.app = app;
    this.known_libs = {};
  }

  LibManager.prototype.projectOpened = function() {
    this.active_libs = {};
    return this.updateLibSelection();
  };

  LibManager.prototype.createLibBox = function(project) {
    var desc, div, e, i, id, len, list, nick, path, user;
    console.info(project);
    nick = typeof project.owner === "string" ? project.owner : project.owner.nick;
    id = project.id;
    path = "/" + nick + "/" + project.slug;
    if (project.code != null) {
      path += "/" + project.code;
    }
    this.known_libs[id] = {
      nick: nick,
      slug: project.slug,
      title: project.title,
      code: project.code,
      url: "" + location.origin + path + "/",
      language: project.language
    };
    div = document.createElement("div");
    div.classList.add("lib-box");
    div.dataset.id = id;
    desc = project.description;
    if (desc.length > 300) {
      desc = desc.substring(0, 300) + " (...)";
    }
    div.innerHTML = "<img class=\"pixelated icon\" src=\"" + location.origin + path + "/sprites/icon.png\"/>\n<div class=\"description md dark\">\n  <div class=\"plugin-author\"></div>\n  <h4>" + project.title + "</h4>\n  <p>" + (DOMPurify.sanitize(marked(desc))) + "</p>\n  <div class=\"docbutton\"><i class=\"fa fa-book-open\"></i> " + (this.app.translator.get("Documentation")) + "</div>\n" + (project.code == null ? "<a class=\"docbutton\" href=\"" + location.origin + "/i/" + nick + "/" + project.slug + "/\" target=\"_blank\"><i class=\"fa fa-eye\"></i> " + (this.app.translator.get("Library Details")) + "</a>" : "") + "\n  <i class=\"fa fa-check check\"></i>\n</div>";
    list = div.getElementsByTagName("a");
    for (i = 0, len = list.length; i < len; i++) {
      e = list[i];
      e.target = "_blank";
      e.addEventListener("click", (function(_this) {
        return function(event) {
          return event.stopPropagation();
        };
      })(this));
    }
    if (project.owner_info) {
      user = this.app.appui.createUserTag(nick, project.owner_info.tier, project.owner_info.profile_image, 20);
    } else if (project.owner.nick === this.app.user.nick) {
      user = this.app.appui.createUserTag(this.app.user.nick, this.app.user.flags.tier || "", this.app.user.flags.profile_image, 20);
    } else {
      user = this.app.appui.createUserTag(project.owner.nick, "", false, 20);
    }
    div.querySelector(".plugin-author").appendChild(user);
    div.id = "lib-box-" + id;
    div.addEventListener("click", (function(_this) {
      return function() {
        if (div.querySelector("input") !== document.activeElement) {
          return _this.toggleLib(id);
        }
      };
    })(this));
    div.querySelector(".docbutton").addEventListener("click", (function(_this) {
      return function(event) {
        event.stopPropagation();
        return _this.openDoc(id);
      };
    })(this));
    return div;
  };

  LibManager.prototype.toggleLib = function(id) {
    if (this.isLibActive(id)) {
      return this.setLibActive(id, false);
    } else {
      return this.setLibActive(id, true);
    }
  };

  LibManager.prototype.resetLibs = function() {
    return this.libs_fetched = false;
  };

  LibManager.prototype.fetchAvailableLibs = function(callback) {
    var box, i, len, p, ref, your_libs, your_list;
    if (this.libs_fetched) {
      return callback();
    }
    this.libs_fetched = true;
    your_libs = document.querySelector("#your-libs");
    your_list = document.querySelector("#your-libs .lib-list");
    your_list.innerHTML = "";
    ref = this.app.projects;
    for (i = 0, len = ref.length; i < len; i++) {
      p = ref[i];
      if (p.type === "library") {
        box = this.createLibBox(p);
        your_list.appendChild(box);
      }
    }
    if (your_list.childNodes.length === 0) {
      your_libs.style.display = "none";
    } else {
      your_libs.style.display = "block";
    }
    return this.app.client.sendRequest({
      name: "get_public_libraries"
    }, (function(_this) {
      return function(msg) {
        var j, len1, public_libs, public_list, ref1;
        console.info(msg.list);
        public_libs = document.querySelector("#public-libs");
        public_list = document.querySelector("#public-libs .lib-list");
        ref1 = msg.list;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          p = ref1[j];
          if (_this.known_libs[p.id] == null) {
            box = _this.createLibBox(p);
            public_list.appendChild(box);
          }
        }
        if (public_list.childNodes.length === 0) {
          public_libs.style.display = "none";
        } else {
          public_libs.style.display = "block";
        }
        return callback();
      };
    })(this));
  };

  LibManager.prototype.updateLibSelection = function() {
    return this.fetchAvailableLibs((function(_this) {
      return function() {
        var e, i, key, len, lib, libs, list, ref, value;
        list = document.querySelectorAll(".lib-box");
        libs = _this.app.project.libraries || {};
        for (i = 0, len = list.length; i < len; i++) {
          e = list[i];
          if (libs[e.dataset.id]) {
            e.classList.add("selected");
          } else {
            e.classList.remove("selected");
          }
          lib = _this.known_libs[e.dataset.id];
          if ((lib != null) && lib.language.split("_")[0] === _this.app.project.language.split("_")[0]) {
            e.style.display = "block";
          } else {
            e.style.display = "none";
          }
        }
        for (key in libs) {
          value = libs[key];
          if (!_this.active_libs[key]) {
            _this.active_libs[key] = value;
            _this.createLibUI(key);
          }
        }
        ref = _this.active_libs;
        for (key in ref) {
          value = ref[key];
          if (!libs[key]) {
            delete _this.active_libs[key];
            _this.app.documentation.removeLib(key);
          }
        }
      };
    })(this));
  };

  LibManager.prototype.isLibActive = function(id) {
    var libs, p;
    p = this.app.project;
    if (!p) {
      return false;
    }
    libs = p.libraries || {};
    return libs[id] != null;
  };

  LibManager.prototype.setLibActive = function(id, active) {
    var p;
    p = this.app.project;
    if (p.libraries == null) {
      p.libraries = {};
    }
    if (active) {
      p.libraries[id] = {
        active: true
      };
    } else {
      delete p.libraries[id];
    }
    this.updateLibSelection();
    if (active) {
      this.install(id);
    } else {
      this.remove(id);
    }
    return this.app.client.sendRequest({
      name: "set_project_option",
      project: this.app.project.id,
      option: "libraries",
      value: p.libraries
    }, (function(_this) {
      return function(msg) {};
    })(this));
  };

  LibManager.prototype.createLibUI = function(id) {
    var data, doc_url, path;
    data = this.known_libs[id];
    if (data == null) {
      return;
    }
    if (data.code != null) {
      path = data.nick + "/" + data.slug + "/" + data.code;
    } else {
      path = data.nick + "/" + data.slug;
    }
    doc_url = location.origin + "/" + path + "/doc/doc.md";
    return this.app.documentation.addLib(id, data.title, doc_url);
  };

  LibManager.prototype.openDoc = function(id) {
    var data, doc_url, path;
    this.createLibUI(id);
    data = this.known_libs[id];
    if (data == null) {
      return;
    }
    if (data.code != null) {
      path = data.nick + "/" + data.slug + "/" + data.code;
    } else {
      path = data.nick + "/" + data.slug;
    }
    doc_url = location.origin + "/" + path + "/doc/doc.md";
    this.app.documentation.setSection(id, ((function(_this) {
      return function() {};
    })(this)), doc_url);
    return this.app.appui.setMainSection("help", true);
  };

  LibManager.prototype.projectClosed = function() {
    this.app.documentation.removeAllLibs();
  };

  LibManager.prototype.install = function(id) {
    var lib;
    lib = this.known_libs[id];
    if (lib != null) {
      return this.app.client.sendRequest({
        name: "list_project_files",
        project: id,
        folder: "ms"
      }, (function(_this) {
        return function(msg) {
          var f, files, i, j, k, len, len1, len2, ref, ref1, results;
          console.info(msg.files);
          files = [];
          ref = msg.files;
          for (i = 0, len = ref.length; i < len; i++) {
            f = ref[i];
            if (f.file.startsWith("lib-")) {
              files.push(f);
            }
          }
          if (files.length === 0) {
            ref1 = msg.files;
            for (j = 0, len1 = ref1.length; j < len1; j++) {
              f = ref1[j];
              if (!f.file.includes("demo") && !f.file.includes("main") && !f.file.includes("test") && !f.file.includes("example")) {
                files.push(f);
              }
            }
          }
          if (files.length === 0) {
            files = msg.files;
          }
          results = [];
          for (k = 0, len2 = files.length; k < len2; k++) {
            f = files[k];
            results.push((function(f) {
              var name;
              name = f.file;
              if (name.startsWith("lib-")) {
                name = name.substring(4);
              }
              name = "lib-" + (RegexLib.fixFilename(lib.nick)) + "-" + (RegexLib.fixFilename(lib.slug)) + "-" + (name.substring(0, name.length - 3));
              return _this.app.client.sendRequest({
                name: "read_project_file",
                project: id,
                file: "ms/" + f.file
              }, function(msg) {
                console.info(msg.content);
                return _this.app.project.writeSourceFile(name, msg.content);
              });
            })(f));
          }
          return results;
        };
      })(this));
    }
  };

  LibManager.prototype.remove = function(id) {
    var file, i, j, len, len1, lib, list, ref, results, start;
    lib = this.known_libs[id];
    if (lib != null) {
      start = "lib-" + (RegexLib.fixFilename(lib.nick)) + "-" + (RegexLib.fixFilename(lib.slug));
      list = [];
      ref = this.app.project.source_list;
      for (i = 0, len = ref.length; i < len; i++) {
        file = ref[i];
        if (file.name.startsWith(start)) {
          list.push(file);
        }
      }
      results = [];
      for (j = 0, len1 = list.length; j < len1; j++) {
        file = list[j];
        results.push(this.app.client.sendRequest({
          name: "delete_project_file",
          project: this.app.project.id,
          file: "ms/" + file.name + ".ms"
        }, (function(_this) {
          return function(msg) {
            console.info(msg);
            return _this.app.project.updateSourceList();
          };
        })(this)));
      }
      return results;
    }
  };

  return LibManager;

})();
