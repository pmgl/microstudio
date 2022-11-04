var DEFAULT_CODE,
  indexOf = [].indexOf;

this.Options = class Options {
  constructor(app) {
    var advanced, i, input, len, list;
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
    for (i = 0, len = list.length; i < len; i++) {
      input = list[i];
      ((input) => {
        return input.addEventListener("change", () => {
          var id, index;
          id = input.id.split("-");
          id = id[id.length - 1];
          if (input.checked) {
            if (indexOf.call(this.app.project.libs, id) < 0) {
              this.app.project.libs.push(id);
              return this.optionChanged("libs", this.app.project.libs);
            }
          } else {
            index = this.app.project.libs.indexOf(id);
            if (index >= 0) {
              this.app.project.libs.splice(index, 1);
              return this.optionChanged("libs", this.app.project.libs);
            }
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
    var e, i, input, j, len, len1, lib, list, ref;
    document.getElementById("projectoptions-icon").src = this.app.project.getFullURL() + "icon.png";
    //document.getElementById("projectoptions-icon").setAttribute("src","#{@app.project.getFullURL()}icon.png")
    document.getElementById("projectoption-name").value = this.app.project.title;
    this.project_slug_validator.set(this.app.project.slug);
    document.getElementById("projectoption-slugprefix").innerText = location.origin.replace(".dev", ".io") + `/${this.app.project.owner.nick}/`;
    document.getElementById("projectoption-orientation").value = this.app.project.orientation;
    document.getElementById("projectoption-aspect").value = this.app.project.aspect;
    document.getElementById("projectoption-type").value = this.app.project.type || "app";
    document.getElementById("projectoption-graphics").value = this.app.project.graphics || "M1";
    document.getElementById("projectoption-language").value = this.app.project.language || "microscript_v1_i";
    document.getElementById("projectoption-networking").checked = this.app.project.networking || false;
    this.library_tip.style.display = this.app.project.type === "library" ? "block" : "none";
    list = document.querySelectorAll("#project-option-libs input");
    for (i = 0, len = list.length; i < len; i++) {
      input = list[i];
      input.checked = false;
    }
    ref = this.app.project.libs;
    for (j = 0, len1 = ref.length; j < len1; j++) {
      lib = ref[j];
      e = document.getElementById(`project-option-lib-${lib}`);
      if (e != null) {
        e.checked = true;
      }
    }
    this.updateSecretCodeLine();
    this.updateUserList();
    this.app.project.addListener(this);
    if (window.ms_standalone || this.app.user.flags.guest) {
      return document.querySelector("#projectoptions-users-content").style.display = "none";
    } else {
      return document.querySelector("#projectoptions-users-content").style.display = "block";
    }
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
    this.app.project.setGraphics(value);
    this.app.debug.updateDebuggerVisibility();
    return this.app.client.sendRequest({
      name: "set_project_option",
      project: this.app.project.id,
      option: "graphics",
      value: value
    }, (msg) => {});
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
    var div, i, len, ref, user;
    div = document.getElementById("project-user-list");
    div.innerHTML = "";
    ref = this.app.project.users;
    for (i = 0, len = ref.length; i < len; i++) {
      user = ref[i];
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
