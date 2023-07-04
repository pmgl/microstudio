var DEFAULT_CODE;

this.Options = class Options {
  constructor(app) {
    var advanced, input, j, len, list;
    this.app = app;
    this.textInput("projectoption-name", (value) => {
      return this.optionChanged("title", value);
    });
    this.project_slug_validator = new InputValidator(document.getElementById("projectoption-slug"), document.getElementById("project-slug-button"), null, (value) => {
      return this.optionChanged("slug", value[0]);
    });
    this.project_code_validator = new InputValidator(document.getElementById("projectoption-code"), document.getElementById("project-code-button"), null, (value) => {
      return this.optionChanged("code", value[0]);
    });
    this.selectInput("projectoption-orientation", (value) => {
      return this.orientationChanged(value);
    });
    this.selectInput("projectoption-aspect", (value) => {
      return this.aspectChanged(value);
    });
    this.selectInput("projectoption-type", (value) => {
      return this.typeChanged(value);
    });
    this.selectInput("projectoption-graphics", (value) => {
      return this.graphicsChanged(value);
    });
    this.selectInput("projectoption-graphics-version", (value) => {
      return this.graphicsChanged(value);
    });
    this.selectInput("projectoption-language", (value) => {
      return this.languageChanged(value);
    });
    this.checkInput("projectoption-networking", (value) => {
      return this.networkingChanged(value);
    });
    advanced = document.getElementById("advanced-project-options-button");
    advanced.addEventListener("click", () => {
      if (advanced.classList.contains("open")) {
        advanced.classList.remove("open");
        document.getElementById("advanced-project-options").style.display = "none";
        return advanced.childNodes[1].innerText = this.app.translator.get("Show advanced options");
      } else {
        advanced.classList.add("open");
        document.getElementById("advanced-project-options").style.display = "block";
        return advanced.childNodes[1].innerText = this.app.translator.get("Hide advanced options");
      }
    });
    this.app.appui.setAction("add-project-user", () => {
      return this.addProjectUser();
    });
    document.getElementById("add-project-user-nick").addEventListener("keyup", (event) => {
      if (event.keyCode === 13) {
        return this.addProjectUser();
      }
    });
    list = document.querySelectorAll("#project-option-libs input");
    for (j = 0, len = list.length; j < len; j++) {
      input = list[j];
      ((input) => {
        var id, key, option, ref, value, version_e;
        id = input.id.split("-");
        id = id[id.length - 1];
        if (ms_optional_libs[id] != null) {
          version_e = document.getElementById(`project-option-lib-${id}-version`);
          if (ms_optional_libs[id].versions != null) {
            ref = ms_optional_libs[id].versions;
            for (key in ref) {
              value = ref[key];
              option = document.createElement("option");
              option.value = key;
              option.innerText = value.name;
              version_e.appendChild(option);
            }
            this.selectInput(version_e.id, (value) => {
              this.addLib(value);
              return this.libsChanged();
            });
          } else {
            version_e.style.display = "none";
          }
        }
        return input.addEventListener("change", () => {
          if (input.checked) {
            this.addLib(id);
            return this.libsChanged();
          } else {
            this.removeLib(id);
            return this.libsChanged();
          }
        });
      })(input);
    }
    this.library_tip = document.querySelector("#project-option-type .library");
  }

  textInput(element, action) {
    var e;
    e = document.getElementById(element);
    return e.addEventListener("input", (event) => {
      return action(e.value);
    });
  }

  selectInput(element, action) {
    var e;
    e = document.getElementById(element);
    return e.addEventListener("change", (event) => {
      return action(e.options[e.selectedIndex].value);
    });
  }

  checkInput(element, action) {
    var e;
    e = document.getElementById(element);
    return e.addEventListener("change", (event) => {
      return action(e.checked);
    });
  }

  projectOpened() {
    document.getElementById("projectoptions-icon").src = this.app.project.getFullURL() + "icon.png";
    //document.getElementById("projectoptions-icon").setAttribute("src","#{@app.project.getFullURL()}icon.png")
    document.getElementById("projectoption-name").value = this.app.project.title;
    this.project_slug_validator.set(this.app.project.slug);
    document.getElementById("projectoption-slugprefix").innerText = location.origin.replace(".dev", ".io") + `/${this.app.project.owner.nick}/`;
    document.getElementById("projectoption-orientation").value = this.app.project.orientation;
    document.getElementById("projectoption-aspect").value = this.app.project.aspect;
    document.getElementById("projectoption-type").value = this.app.project.type || "app";
    document.getElementById("projectoption-graphics").value = (this.app.project.graphics || "M1").split("_")[0];
    document.getElementById("projectoption-language").value = this.app.project.language || "microscript_v1_i";
    document.getElementById("projectoption-networking").checked = this.app.project.networking || false;
    this.library_tip.style.display = this.app.project.type === "library" ? "block" : "none";
    this.updateOptionalLibs();
    this.updateSecretCodeLine();
    this.updateUserList();
    this.app.project.addListener(this);
    if (window.ms_standalone || this.app.user.flags.guest) {
      document.querySelector("#projectoptions-users-content").style.display = "none";
    } else {
      document.querySelector("#projectoptions-users-content").style.display = "block";
    }
    return this.updateGraphicsVersion();
  }

  updateGraphicsVersion() {
    var e, full_id, graphics, id, key, option, ref, ref1, v;
    e = document.getElementById("projectoption-graphics-version");
    full_id = this.app.project.graphics || "M1";
    id = full_id.split("_")[0].toLowerCase();
    graphics = ms_graphics_options[id];
    if (graphics) {
      if (graphics.versions) {
        e.innerHTML = "";
        ref = graphics.versions;
        for (key in ref) {
          v = ref[key];
          option = document.createElement("option");
          option.value = key.toUpperCase();
          option.innerText = v.name;
          e.appendChild(option);
        }
        if (graphics.versions[full_id.toLowerCase()]) {
          e.value = full_id;
        } else {
          ref1 = graphics.versions;
          for (key in ref1) {
            v = ref1[key];
            if (v.original) {
              e.value = key.toUpperCase();
            }
          }
        }
        return e.style.display = "inline-block";
      } else {
        return e.style.display = "none";
      }
    } else {
      return e.style.display = "none";
    }
  }

  updateOptionalLibs() {
    var checked, e, id, input, j, k, key, len, len1, lib, list, optlib, ref, results, v, value, version;
    list = document.querySelectorAll("#project-option-libs input");
    results = [];
    for (j = 0, len = list.length; j < len; j++) {
      input = list[j];
      input.checked = false;
      id = input.id;
      id = id.split("-");
      id = id[id.length - 1];
      e = document.getElementById(`project-option-lib-${id}`);
      v = document.getElementById(`project-option-lib-${id}-version`);
      checked = false;
      version = null;
      optlib = null;
      ref = this.app.project.libs;
      for (k = 0, len1 = ref.length; k < len1; k++) {
        lib = ref[k];
        if (lib.startsWith(id)) {
          checked = true;
          version = lib;
          optlib = ms_optional_libs[id];
        }
      }
      e.checked = checked;
      if (checked && (optlib.versions != null)) {
        v.style.display = "inline-block";
        if (optlib.versions[version] != null) {
          results.push(v.value = version);
        } else {
          results.push((function() {
            var ref1, results1;
            ref1 = optlib.versions;
            results1 = [];
            for (key in ref1) {
              value = ref1[key];
              if (value.original) {
                results1.push(v.value = key);
              } else {
                results1.push(void 0);
              }
            }
            return results1;
          })());
        }
      } else {
        results.push(v.style.display = "none");
      }
    }
    return results;
  }

  updateSecretCodeLine() {
    this.project_code_validator.set(this.app.project.code);
    return document.getElementById("projectoption-codeprefix").innerText = location.origin.replace(".dev", ".io") + `/${this.app.project.owner.nick}/${this.app.project.slug}/`;
  }

  projectUpdate(name) {
    var icon;
    if (name === "spritelist") {
      icon = this.app.project.getSprite("icon");
      if (icon != null) {
        return icon.addImage(document.getElementById("projectoptions-icon"), 160);
      }
    }
  }

  update() {
    var storage;
    storage = this.app.appui.displayByteSize(this.app.project.getSize());
    return document.getElementById("projectoption-storage-used").innerText = storage;
  }

  optionChanged(name, value) {
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
    }, (msg) => {
      if (msg.name === "error" && (msg.value != null)) {
        switch (name) {
          case "title":
            document.getElementById("projectoption-name").value = msg.value;
            return this.app.project.setTitle(msg.value);
          case "slug":
            this.project_slug_validator.set(msg.value);
            this.app.project.setSlug(msg.value);
            return this.updateSecretCodeLine();
        }
      }
    });
  }

  orientationChanged(value) {
    this.app.project.setOrientation(value);
    return this.app.client.sendRequest({
      name: "set_project_option",
      project: this.app.project.id,
      option: "orientation",
      value: value
    }, (msg) => {});
  }

  aspectChanged(value) {
    this.app.project.setAspect(value);
    return this.app.client.sendRequest({
      name: "set_project_option",
      project: this.app.project.id,
      option: "aspect",
      value: value
    }, (msg) => {});
  }

  typeChanged(value) {
    this.app.project.setType(value);
    this.library_tip.style.display = value === "library" ? "block" : "none";
    this.app.client.sendRequest({
      name: "set_project_option",
      project: this.app.project.id,
      option: "type",
      value: value
    }, (msg) => {});
    this.app.tab_manager.resetPlugins();
    return this.app.lib_manager.resetLibs();
  }

  graphicsChanged(value) {
    var graphics, id, key, ref, v;
    id = value.split("_")[0];
    if (id === value) {
      graphics = ms_graphics_options[id.toLowerCase()];
      if (graphics && graphics.versions) {
        ref = graphics.versions;
        for (key in ref) {
          v = ref[key];
          if (v.default) {
            value = key.toUpperCase();
            break;
          }
        }
      }
    }
    this.app.project.setGraphics(value);
    this.app.debug.updateDebuggerVisibility();
    this.updateGraphicsVersion();
    return this.app.client.sendRequest({
      name: "set_project_option",
      project: this.app.project.id,
      option: "graphics",
      value: value
    }, (msg) => {});
  }

  fixLib(lib) {
    var key, ref, value;
    if ((ms_optional_libs[lib] != null) && ms_optional_libs[lib].versions) {
      ref = ms_optional_libs[lib].versions;
      for (key in ref) {
        value = ref[key];
        if (value.default) {
          return key;
        }
      }
    }
    return lib;
  }

  addLib(lib) {
    this.removeLib(lib);
    return this.app.project.libs.push(this.fixLib(lib));
  }

  removeLib(lib) {
    var i, id, j, l, ref, results;
    id = lib.split("_")[0];
    results = [];
    for (i = j = ref = this.app.project.libs.length - 1; j >= 0; i = j += -1) {
      l = this.app.project.libs[i];
      if (l.split("_")[0] === id) {
        results.push(this.app.project.libs.splice(i, 1));
      } else {
        results.push(void 0);
      }
    }
    return results;
  }

  libsChanged() {
    this.optionChanged("libs", this.app.project.libs);
    return this.updateOptionalLibs();
  }

  languageChanged(value) {
    if (value !== this.app.project.language) {
      if (this.app.project.source_list.length === 1 && this.app.project.source_list[0].content.split("\n").length < 20) {
        if (!this.app.project.language.startsWith("microscript") || !value.startsWith("microscript")) {
          ConfirmDialog.confirm(this.app.translator.get("Your current code will be overwritten. Do you wish to proceed?"), this.app.translator.get("OK"), this.app.translator.get("Cancel"), (() => {
            this.app.project.setLanguage(value);
            this.app.editor.updateLanguage();
            this.app.debug.updateDebuggerVisibility();
            if (DEFAULT_CODE[value] != null) {
              this.app.editor.setCode(DEFAULT_CODE[value]);
            } else {
              this.app.editor.setCode(DEFAULT_CODE["microscript"]);
            }
            this.app.editor.editorContentsChanged();
            return this.setLanguage(value);
          }), (() => {
            return document.getElementById("projectoption-language").value = this.app.project.language;
          }));
          return;
        }
      }
      return this.setLanguage(value);
    }
  }

  setLanguage(value) {
    this.app.project.setLanguage(value);
    this.app.editor.updateLanguage();
    this.app.debug.updateDebuggerVisibility();
    return this.app.client.sendRequest({
      name: "set_project_option",
      project: this.app.project.id,
      option: "language",
      value: value
    }, (msg) => {});
  }

  networkingChanged(value) {
    this.app.project.networking = value;
    this.app.runwindow.updateServerBar();
    this.app.publish.updateServerExport();
    return this.app.client.sendRequest({
      name: "set_project_option",
      project: this.app.project.id,
      option: "networking",
      value: value
    }, (msg) => {});
  }

  setType(type) {
    if (type !== this.app.project.type) {
      console.info(`setting type to ${type}`);
      this.app.project.setType(type);
      return this.app.client.sendRequest({
        name: "set_project_option",
        project: this.app.project.id,
        option: "type",
        value: type
      }, (msg) => {});
    }
  }

  addProjectUser() {
    var nick;
    nick = document.getElementById("add-project-user-nick").value;
    if (nick.trim().length > 0) {
      this.app.client.sendRequest({
        name: "invite_to_project",
        project: this.app.project.id,
        user: nick
      }, (msg) => {
        return console.info(msg);
      });
      return document.getElementById("add-project-user-nick").value = "";
    }
  }

  updateUserList() {
    var div, j, len, ref, user;
    div = document.getElementById("project-user-list");
    div.innerHTML = "";
    ref = this.app.project.users;
    for (j = 0, len = ref.length; j < len; j++) {
      user = ref[j];
      ((user) => {
        var e, name, remove;
        e = document.createElement("div");
        e.classList.add("user");
        name = document.createElement("div");
        name.classList.add("username");
        name.innerHTML = user.nick + " " + (user.accepted ? "<i class='fa fa-check'></i>" : "<i class='fa fa-clock'></i>");
        remove = document.createElement("div");
        remove.classList.add("remove");
        remove.innerHTML = "<i class='fa fa-times'></i> Remove";
        remove.addEventListener("click", (event) => {
          return this.app.client.sendRequest({
            name: "remove_project_user",
            project: this.app.project.id,
            user: user.nick
          });
        });
        e.appendChild(remove);
        e.appendChild(name);
        return div.appendChild(e);
      })(user);
    }
  }

};

DEFAULT_CODE = {
  python: "def init():\n  pass\n\ndef update():\n  pass\n\ndef draw():\n  pass",
  javascript: "init = function() {\n}\n\nupdate = function() {\n}\n\ndraw = function() {\n}",
  lua: "init = function()\nend\n\nupdate = function()\nend\n\ndraw = function()\nend",
  microscript: "init = function()\nend\n\nupdate = function()\nend\n\ndraw = function()\nend"
};
