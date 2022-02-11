var DEFAULT_CODE,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

this.Options = (function() {
  function Options(app) {
    var advanced, fn, i, input, len, list;
    this.app = app;
    this.textInput("projectoption-name", (function(_this) {
      return function(value) {
        return _this.optionChanged("title", value);
      };
    })(this));
    this.project_slug_validator = new InputValidator(document.getElementById("projectoption-slug"), document.getElementById("project-slug-button"), null, (function(_this) {
      return function(value) {
        return _this.optionChanged("slug", value[0]);
      };
    })(this));
    this.project_code_validator = new InputValidator(document.getElementById("projectoption-code"), document.getElementById("project-code-button"), null, (function(_this) {
      return function(value) {
        return _this.optionChanged("code", value[0]);
      };
    })(this));
    this.selectInput("projectoption-orientation", (function(_this) {
      return function(value) {
        return _this.orientationChanged(value);
      };
    })(this));
    this.selectInput("projectoption-aspect", (function(_this) {
      return function(value) {
        return _this.aspectChanged(value);
      };
    })(this));
    this.selectInput("projectoption-type", (function(_this) {
      return function(value) {
        return _this.typeChanged(value);
      };
    })(this));
    this.selectInput("projectoption-graphics", (function(_this) {
      return function(value) {
        return _this.graphicsChanged(value);
      };
    })(this));
    this.selectInput("projectoption-language", (function(_this) {
      return function(value) {
        return _this.languageChanged(value);
      };
    })(this));
    advanced = document.getElementById("advanced-project-options-button");
    advanced.addEventListener("click", (function(_this) {
      return function() {
        if (advanced.classList.contains("open")) {
          advanced.classList.remove("open");
          document.getElementById("advanced-project-options").style.display = "none";
          return advanced.childNodes[1].innerText = _this.app.translator.get("Show advanced options");
        } else {
          advanced.classList.add("open");
          document.getElementById("advanced-project-options").style.display = "block";
          return advanced.childNodes[1].innerText = _this.app.translator.get("Hide advanced options");
        }
      };
    })(this));
    this.app.appui.setAction("add-project-user", (function(_this) {
      return function() {
        return _this.addProjectUser();
      };
    })(this));
    document.getElementById("add-project-user-nick").addEventListener("keyup", (function(_this) {
      return function(event) {
        if (event.keyCode === 13) {
          return _this.addProjectUser();
        }
      };
    })(this));
    list = document.querySelectorAll("#project-option-libs input");
    fn = (function(_this) {
      return function(input) {
        return input.addEventListener("change", function() {
          var id, index;
          id = input.id.split("-");
          id = id[id.length - 1];
          if (input.checked) {
            if (indexOf.call(_this.app.project.libs, id) < 0) {
              _this.app.project.libs.push(id);
              return _this.optionChanged("libs", _this.app.project.libs);
            }
          } else {
            index = _this.app.project.libs.indexOf(id);
            if (index >= 0) {
              _this.app.project.libs.splice(index, 1);
              return _this.optionChanged("libs", _this.app.project.libs);
            }
          }
        });
      };
    })(this);
    for (i = 0, len = list.length; i < len; i++) {
      input = list[i];
      fn(input);
    }
    this.initProjectTabSelection();
  }

  Options.prototype.textInput = function(element, action) {
    var e;
    e = document.getElementById(element);
    return e.addEventListener("input", (function(_this) {
      return function(event) {
        return action(e.value);
      };
    })(this));
  };

  Options.prototype.selectInput = function(element, action) {
    var e;
    e = document.getElementById(element);
    return e.addEventListener("change", (function(_this) {
      return function(event) {
        return action(e.options[e.selectedIndex].value);
      };
    })(this));
  };

  Options.prototype.projectOpened = function() {
    var e, i, input, j, len, len1, lib, list, ref;
    document.getElementById("projectoptions-icon").src = this.app.project.getFullURL() + "icon.png";
    document.getElementById("projectoption-name").value = this.app.project.title;
    this.project_slug_validator.set(this.app.project.slug);
    document.getElementById("projectoption-slugprefix").innerText = location.origin.replace(".dev", ".io") + ("/" + this.app.project.owner.nick + "/");
    document.getElementById("projectoption-orientation").value = this.app.project.orientation;
    document.getElementById("projectoption-aspect").value = this.app.project.aspect;
    document.getElementById("projectoption-type").value = this.app.project.type || "app";
    document.getElementById("projectoption-graphics").value = this.app.project.graphics || "M1";
    document.getElementById("projectoption-language").value = this.app.project.language || "microscript_v1_i";
    list = document.querySelectorAll("#project-option-libs input");
    for (i = 0, len = list.length; i < len; i++) {
      input = list[i];
      input.checked = false;
    }
    ref = this.app.project.libs;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      lib = ref[j];
      e = document.getElementById("project-option-lib-" + lib);
      if (e != null) {
        e.checked = true;
      }
    }
    this.updateSecretCodeLine();
    this.updateUserList();
    this.app.project.addListener(this);
    document.querySelector("#projectoptions-users").style.display = this.app.user.flags.guest ? "none" : "block";
    this.updateProjectTabSelection();
    return this.updateProjectTabs();
  };

  Options.prototype.updateSecretCodeLine = function() {
    this.project_code_validator.set(this.app.project.code);
    return document.getElementById("projectoption-codeprefix").innerText = location.origin.replace(".dev", ".io") + ("/" + this.app.project.owner.nick + "/" + this.app.project.slug + "/");
  };

  Options.prototype.projectUpdate = function(name) {
    var icon;
    if (name === "spritelist") {
      icon = this.app.project.getSprite("icon");
      if (icon != null) {
        return icon.addImage(document.getElementById("projectoptions-icon"), 160);
      }
    }
  };

  Options.prototype.update = function() {
    var storage;
    storage = this.app.appui.displayByteSize(this.app.project.getSize());
    return document.getElementById("projectoption-storage-used").innerText = storage;
  };

  Options.prototype.optionChanged = function(name, value) {
    if ((value.trim != null) && value.trim().length === 0) {
      return;
    }
    switch (name) {
      case "title":
        this.app.project.setTitle(value);
        break;
      case "slug":
        if (value !== RegexLib.slugify(value)) {
          value = RegexLib.slugify(value);
          this.project_slug_validator.set(value);
        }
        if (value.length === 0 || value === this.app.project.slug) {
          return;
        }
        this.app.project.setSlug(value);
        this.updateSecretCodeLine();
        break;
      case "code":
        this.app.project.setCode(value);
    }
    return this.app.client.sendRequest({
      name: "set_project_option",
      project: this.app.project.id,
      option: name,
      value: value
    }, (function(_this) {
      return function(msg) {
        if (msg.name === "error" && (msg.value != null)) {
          switch (name) {
            case "title":
              document.getElementById("projectoption-name").value = msg.value;
              return _this.app.project.setTitle(msg.value);
            case "slug":
              _this.project_slug_validator.set(msg.value);
              _this.app.project.setSlug(msg.value);
              return _this.updateSecretCodeLine();
          }
        }
      };
    })(this));
  };

  Options.prototype.orientationChanged = function(value) {
    this.app.project.setOrientation(value);
    return this.app.client.sendRequest({
      name: "set_project_option",
      project: this.app.project.id,
      option: "orientation",
      value: value
    }, (function(_this) {
      return function(msg) {};
    })(this));
  };

  Options.prototype.aspectChanged = function(value) {
    this.app.project.setAspect(value);
    return this.app.client.sendRequest({
      name: "set_project_option",
      project: this.app.project.id,
      option: "aspect",
      value: value
    }, (function(_this) {
      return function(msg) {};
    })(this));
  };

  Options.prototype.typeChanged = function(value) {
    this.app.project.setType(value);
    return this.app.client.sendRequest({
      name: "set_project_option",
      project: this.app.project.id,
      option: "type",
      value: value
    }, (function(_this) {
      return function(msg) {};
    })(this));
  };

  Options.prototype.graphicsChanged = function(value) {
    this.app.project.setGraphics(value);
    this.app.client.sendRequest({
      name: "set_project_option",
      project: this.app.project.id,
      option: "graphics",
      value: value
    }, (function(_this) {
      return function(msg) {};
    })(this));
    return this.app.appui.updateAllowedSections();
  };

  Options.prototype.languageChanged = function(value) {
    if (value !== this.app.project.language) {
      if (this.app.project.source_list.length === 1 && this.app.project.source_list[0].content.split("\n").length < 20) {
        if (!this.app.project.language.startsWith("microscript") || !value.startsWith("microscript")) {
          ConfirmDialog.confirm(this.app.translator.get("Your current code will be overwritten. Do you wish to proceed?"), this.app.translator.get("OK"), this.app.translator.get("Cancel"), ((function(_this) {
            return function() {
              _this.app.project.setLanguage(value);
              _this.app.editor.updateLanguage();
              if (DEFAULT_CODE[value] != null) {
                _this.app.editor.setCode(DEFAULT_CODE[value]);
              } else {
                _this.app.editor.setCode(DEFAULT_CODE["microscript"]);
              }
              _this.app.editor.editorContentsChanged();
              _this.app.editor.setTitleSourceName();
              return _this.setLanguage(value);
            };
          })(this)), ((function(_this) {
            return function() {
              return document.getElementById("projectoption-language").value = _this.app.project.language;
            };
          })(this)));
          return;
        }
      }
      return this.setLanguage(value);
    }
  };

  Options.prototype.setLanguage = function(value) {
    this.app.project.setLanguage(value);
    this.app.editor.updateLanguage();
    return this.app.client.sendRequest({
      name: "set_project_option",
      project: this.app.project.id,
      option: "language",
      value: value
    }, (function(_this) {
      return function(msg) {};
    })(this));
  };

  Options.prototype.setType = function(type) {
    if (type !== this.app.project.type) {
      console.info("setting type to " + type);
      this.app.project.setType(type);
      return this.app.client.sendRequest({
        name: "set_project_option",
        project: this.app.project.id,
        option: "type",
        value: type
      }, (function(_this) {
        return function(msg) {};
      })(this));
    }
  };

  Options.prototype.addProjectUser = function() {
    var nick;
    nick = document.getElementById("add-project-user-nick").value;
    if (nick.trim().length > 0) {
      this.app.client.sendRequest({
        name: "invite_to_project",
        project: this.app.project.id,
        user: nick
      }, (function(_this) {
        return function(msg) {
          return console.info(msg);
        };
      })(this));
      return document.getElementById("add-project-user-nick").value = "";
    }
  };

  Options.prototype.updateUserList = function() {
    var div, fn, i, len, ref, user;
    div = document.getElementById("project-user-list");
    div.innerHTML = "";
    ref = this.app.project.users;
    fn = (function(_this) {
      return function(user) {
        var e, name, remove;
        e = document.createElement("div");
        e.classList.add("user");
        name = document.createElement("div");
        name.classList.add("username");
        name.innerHTML = user.nick + " " + (user.accepted ? "<i class='fa fa-check'></i>" : "<i class='fa fa-clock'></i>");
        remove = document.createElement("div");
        remove.classList.add("remove");
        remove.innerHTML = "<i class='fa fa-times'></i> Remove";
        remove.addEventListener("click", function(event) {
          return _this.app.client.sendRequest({
            name: "remove_project_user",
            project: _this.app.project.id,
            user: user.nick
          });
        });
        e.appendChild(remove);
        e.appendChild(name);
        return div.appendChild(e);
      };
    })(this);
    for (i = 0, len = ref.length; i < len; i++) {
      user = ref[i];
      fn(user);
    }
  };

  Options.prototype.isTabActive = function(t) {
    var p, tabs;
    p = this.app.project;
    if (!p) {
      return false;
    }
    tabs = p.tabs || {};
    if (tabs[t] != null) {
      return tabs[t];
    } else {
      return Options.DEFAULT_TABS[t];
    }
  };

  Options.prototype.setTabActive = function(t, active) {
    var p;
    p = this.app.project;
    if (p.tabs == null) {
      p.tabs = {};
    }
    p.tabs[t] = active;
    this.updateProjectTabs();
    return this.app.client.sendRequest({
      name: "set_project_option",
      project: this.app.project.id,
      option: "tabs",
      value: p.tabs
    }, (function(_this) {
      return function(msg) {};
    })(this));
  };

  Options.prototype.updateProjectTabSelection = function() {
    var element, tab;
    for (tab in Options.DEFAULT_TABS) {
      element = document.getElementById("project-option-active-tab-" + tab);
      if (element != null) {
        element.checked = this.isTabActive(tab);
      }
    }
  };

  Options.prototype.updateProjectTabs = function() {
    var element, tab;
    for (tab in Options.DEFAULT_TABS) {
      element = document.getElementById("menuitem-" + tab);
      if (element != null) {
        element.style.display = this.isTabActive(tab) ? "block" : "none";
      }
    }
  };

  Options.prototype.initProjectTabSelection = function() {
    var fn, tab;
    fn = (function(_this) {
      return function(tab) {
        var element;
        element = document.getElementById("project-option-active-tab-" + tab);
        return element.addEventListener("change", function() {
          return _this.setTabActive(tab, !_this.isTabActive(tab));
        });
      };
    })(this);
    for (tab in Options.DEFAULT_TABS) {
      fn(tab);
    }
  };

  Options.DEFAULT_TABS = {
    code: true,
    sprites: true,
    maps: true,
    sounds: true,
    music: true,
    assets: false,
    doc: true,
    publish: true
  };

  return Options;

})();

DEFAULT_CODE = {
  python: "def init():\n  pass\n\ndef update():\n  pass\n\ndef draw():\n  pass",
  javascript: "init = function() {\n}\n\nupdate = function() {\n}\n\ndraw = function() {\n}",
  lua: "init = function()\nend\n\nupdate = function()\nend\n\ndraw = function()\nend",
  microscript: "init = function()\nend\n\nupdate = function()\nend\n\ndraw = function()\nend"
};
