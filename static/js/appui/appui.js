var AppUI;

AppUI = (function() {
  function AppUI(app1) {
    var fn, fn1, j, k, len, len1, ref, ref1, s;
    this.app = app1;
    this.sections = ["code", "sprites", "maps", "assets", "sounds", "music", "doc", "options", "publish"];
    this.menuoptions = ["home", "explore", "projects", "help", "tutorials", "about", "usersettings"];
    this.allowed_sections = {
      "code": true,
      "sprites": true,
      "maps": true,
      "doc": true,
      "options": true,
      "publish": true
    };
    ref = this.sections;
    fn = (function(_this) {
      return function(s) {
        if (document.getElementById("menuitem-" + s) != null) {
          return document.getElementById("menuitem-" + s).addEventListener("click", function(event) {
            return _this.setSection(s, true);
          });
        }
      };
    })(this);
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      fn(s);
    }
    this.warning_messages = [];
    this.updateAllowedSections();
    document.addEventListener("keydown", (function(_this) {
      return function(e) {
        if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) && e.keyCode === 83) {
          e.preventDefault();
          switch (_this.current_section) {
            case "code":
              return _this.app.editor.checkSave(true);
            case "sprites":
              return _this.app.sprite_editor.checkSave(true);
            case "maps":
              return _this.app.map_editor.checkSave(true);
            case "doc":
              return _this.app.doc_editor.checkSave(true);
          }
        }
      };
    })(this));
    ref1 = this.menuoptions;
    fn1 = (function(_this) {
      return function(s) {
        var e;
        e = document.getElementById("menu-" + s);
        if (e != null) {
          return e.addEventListener("click", function(event) {
            if (window.ms_standalone && s === "explore") {
              return window.open("https://microstudio.dev/explore/", "_blank");
            } else if (window.ms_standalone && s === "home") {
              return window.open("https://microstudio.dev", "_blank");
            } else {
              return _this.setMainSection(s, true);
            }
          });
        }
      };
    })(this);
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      s = ref1[k];
      fn1(s);
    }
    this.setAction("logo", (function(_this) {
      return function() {
        if (window.ms_standalone) {
          return window.open("https://microstudio.dev", "_blank");
        } else {
          return _this.setMainSection("home", true);
        }
      };
    })(this));
    if (window.ms_standalone) {
      document.getElementById("menu-community").parentNode.href = "https://microstudio.dev/community/";
      document.getElementById("projectoptions-users-content").style.display = "none";
      document.getElementById("publish-box-online").style.display = "none";
      document.getElementById("usersetting-block-nickname").style.display = "none";
      document.getElementById("usersetting-block-email").style.display = "none";
      document.getElementById("usersetting-block-newsletter").style.display = "none";
      document.getElementById("usersetting-block-account-type").style.display = "none";
    }
    this.createLoginFunctions();
    this.setAction("create-project-button", (function(_this) {
      return function() {
        _this.show("create-project-overlay");
        return _this.focus("create-project-title");
      };
    })(this));
    this.setAction("import-project-button", (function(_this) {
      return function() {
        var input;
        input = document.createElement("input");
        input.type = "file";
        input.accept = "application/zip";
        input.addEventListener("change", function(event) {
          var f, files;
          files = event.target.files;
          if (files.length >= 1) {
            f = files[0];
            return _this.app.importProject(f);
          }
        });
        return input.click();
      };
    })(this));
    this.setAction("create-project-window", (function(_this) {
      return function(event) {
        return event.stopPropagation();
      };
    })(this));
    this.setAction("home-action-explore", (function(_this) {
      return function() {
        return _this.setMainSection("explore");
      };
    })(this));
    this.setAction("home-action-create", (function(_this) {
      return function() {
        return _this.setMainSection("projects");
      };
    })(this));
    document.getElementById("create-project-overlay").addEventListener("mousedown", (function(_this) {
      return function(event) {
        return _this.hide("create-project-overlay");
      };
    })(this));
    document.getElementById("create-project-window").addEventListener("mousedown", (function(_this) {
      return function(event) {
        return event.stopPropagation();
      };
    })(this));
    this.setAction("create-project-submit", (function(_this) {
      return function() {
        var slug, title;
        title = _this.get("create-project-title").value;
        slug = RegexLib.slugify(title);
        if (title.length > 0 && slug.length > 0) {
          _this.app.createProject(title, slug);
          _this.hide("create-project-overlay");
          return _this.get("create-project-title").value = "";
        }
      };
    })(this));
    this.doc_splitbar = new SplitBar("doc-section", "horizontal");
    this.code_splitbar = new SplitBar("code-section", "horizontal");
    this.runtime_splitbar = new SplitBar("runtime-container", "vertical");
    this.runtime_splitbar.setPosition(67);
    this.sprites_splitbar = new SplitBar("sprites-section", "horizontal");
    this.sprites_splitbar.setPosition(20);
    this.maps_splitbar = new SplitBar("maps-section", "horizontal");
    this.maps_splitbar.setPosition(20);
    this.mapeditor_splitbar = new SplitBar("mapeditor-container", "horizontal");
    this.mapeditor_splitbar.setPosition(80);
    this.setAction("backtoprojects", (function(_this) {
      return function() {
        if (_this.app.project != null) {
          return _this.app.project.savePendingChanges(function() {
            return _this.backToProjectList(true);
          });
        } else {
          return _this.backToProjectList(true);
        }
      };
    })(this));
    this.get("create_nick").addEventListener("input", (function(_this) {
      return function() {
        var value;
        value = _this.get("create_nick").value;
        if (value !== RegexLib.fixNick(value)) {
          return _this.get("create_nick").value = RegexLib.fixNick(value);
        }
      };
    })(this));
    this.startSaveStatus();
    this.last_activity = Date.now();
    document.addEventListener("mousemove", (function(_this) {
      return function() {
        return _this.last_activity = Date.now();
      };
    })(this));
    document.addEventListener("keydown", (function(_this) {
      return function() {
        return _this.last_activity = Date.now();
      };
    })(this));
    document.querySelector("#projects-search input").addEventListener("input", (function(_this) {
      return function() {
        var l, len2, len3, list, m, ok, p, results, results1, search;
        search = document.querySelector("#projects-search input").value.toLowerCase();
        list = document.getElementById("project-list").childNodes;
        if (search.trim().length > 0) {
          results = [];
          for (l = 0, len2 = list.length; l < len2; l++) {
            p = list[l];
            ok = p.dataset.title.toLowerCase().indexOf(search) >= 0;
            ok |= p.dataset.description.toLowerCase().indexOf(search) >= 0;
            ok |= p.dataset.tags.toLowerCase().indexOf(search) >= 0;
            if (ok) {
              results.push(p.style.display = "inline-block");
            } else {
              results.push(p.style.display = "none");
            }
          }
          return results;
        } else {
          results1 = [];
          for (m = 0, len3 = list.length; m < len3; m++) {
            p = list[m];
            results1.push(p.style.display = "inline-block");
          }
          return results1;
        }
      };
    })(this));
    document.querySelector("#home-section").addEventListener("scroll", (function(_this) {
      return function() {
        var scroll;
        scroll = Math.min(60, document.querySelector("#home-section").scrollTop);
        return document.querySelector("#home-header-background").style.height = scroll + "px";
      };
    })(this));
    document.getElementById("myprojects").addEventListener("dragover", (function(_this) {
      return function(event) {
        return event.preventDefault();
      };
    })(this));
    document.getElementById("myprojects").addEventListener("drop", (function(_this) {
      return function(event) {
        event.preventDefault();
        if (event.dataTransfer.items && (event.dataTransfer.items[0] != null)) {
          return _this.app.importProject(event.dataTransfer.items[0].getAsFile());
        }
      };
    })(this));
    setInterval(((function(_this) {
      return function() {
        return _this.checkActivity();
      };
    })(this)), 10000);
    this.reboot_date = 1622710800000;
    this.checkRebootMessage();
  }

  AppUI.prototype.checkRebootMessage = function() {
    var div, funk;
    if (this.reboot_date && Date.now() < this.reboot_date + 1000 * 60 * 2) {
      document.querySelector(".main-container").style.top = "100px";
      div = document.createElement("div");
      div.classList.add("meta-message");
      funk = (function(_this) {
        return function() {
          var hours, minutes;
          minutes = Math.max(0, _this.reboot_date - Date.now()) / 60000;
          if (minutes >= 120) {
            hours = Math.floor(minutes / 60);
            return div.innerHTML = "<i class='fas fa-info-circle'></i> " + _this.app.translator.get("microStudio is getting a new server! Migration planned on %DATE% at %TIME%. Downtime will last 1 hour.").replace("%DATE%", new Date(_this.reboot_date).toLocaleDateString()).replace("%TIME%", new Date(_this.reboot_date).toLocaleTimeString());
          } else if (minutes >= 2) {
            minutes = Math.floor(minutes);
            return div.innerHTML = "<i class='fas fa-exclamation-circle'></i> " + _this.app.translator.get("Downtime will start in %MINUTES% minutes").replace("%MINUTES%", minutes);
          } else {
            return div.innerHTML = "<i class='fas fa-exclamation-circle'></i> " + _this.app.translator.get("Downtime will start immediately");
          }
        };
      })(this);
      funk();
      setInterval(((function(_this) {
        return function() {
          return funk();
        };
      })(this)), 30000);
      return document.body.appendChild(div);
    }
  };

  AppUI.prototype.addWarningMessage = function(text, icon, id, dismissable) {
    var close, div, span;
    if (icon == null) {
      icon = "fa-exclamation-circle";
    }
    if (dismissable && (id != null)) {
      if (localStorage.getItem(id)) {
        return;
      }
    }
    div = document.createElement("div");
    div.classList.add("meta-message");
    span = document.createElement("span");
    span.innerHTML = "<i class='fas " + icon + "'></i> " + text;
    if (dismissable) {
      close = document.createElement("i");
      close.classList.add("fa");
      close.classList.add("fa-times");
      close.addEventListener("click", (function(_this) {
        return function() {
          _this.removeWarningMessage(div);
          return localStorage.setItem(id, true);
        };
      })(this));
      div.appendChild(close);
    }
    div.appendChild(span);
    this.warning_messages.push(div);
    document.querySelector(".main-container").style.top = (60 + 40 * this.warning_messages.length) + "px";
    document.body.appendChild(div);
    return this.layoutWarningMessages();
  };

  AppUI.prototype.layoutWarningMessages = function() {
    var i, j, len, ref, results, w;
    ref = this.warning_messages;
    results = [];
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      w = ref[i];
      results.push(w.style.top = (60 + i * 40) + "px");
    }
    return results;
  };

  AppUI.prototype.removeWarningMessage = function(div) {
    var index;
    if (document.body.contains(div)) {
      document.body.removeChild(div);
      index = this.warning_messages.indexOf(div);
      if (index >= 0) {
        this.warning_messages.splice(index, 1);
        document.querySelector(".main-container").style.top = (60 + 40 * this.warning_messages.length) + "px";
        return this.layoutWarningMessages();
      }
    }
  };

  AppUI.prototype.checkActivity = function() {
    var t;
    t = Date.now() - this.last_activity;
    if (this.app.project != null) {
      if (t > 60 * 60 * 1000) {
        return this.backToProjectList(true);
      } else {
        return this.app.client.sendRequest({
          name: "ping"
        });
      }
    }
  };

  AppUI.prototype.backToProjectList = function(useraction) {
    this.hide("projectview");
    this.show("myprojects");
    this.app.runwindow.projectClosed();
    this.app.project = null;
    this.project = null;
    this.app.updateProjectList();
    if (useraction) {
      return this.app.app_state.pushState("projects", "/projects/");
    }
  };

  AppUI.prototype.setSection = function(section, useraction) {
    var fn, j, len, ref, s;
    this.current_section = section;
    ref = this.sections;
    fn = (function(_this) {
      return function(s) {
        var element, menuitem;
        element = document.getElementById(s + "-section");
        menuitem = document.getElementById("menuitem-" + s);
        if ((element == null) || (menuitem == null)) {
          return;
        }
        if (s === section) {
          element.style.display = "block";
          menuitem.classList.add("selected");
        } else {
          element.style.display = "none";
          menuitem.classList.remove("selected");
        }
      };
    })(this);
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      fn(s);
    }
    if (section === "sprites") {
      this.app.sprite_editor.spriteview.windowResized();
    }
    if (section === "code") {
      this.code_splitbar.update();
      this.runtime_splitbar.update();
      this.app.runwindow.windowResized();
      this.app.editor.editor.resize();
    }
    if (section === "sprites") {
      this.sprites_splitbar.update();
      if (this.sprites_splitbar.position / 100 * this.sprites_splitbar.total_width < 64) {
        this.sprites_splitbar.setPosition(100 * 150 / this.sprites_splitbar.total_width);
      } else if (this.sprites_splitbar.position > 90) {
        this.sprites_splitbar.setPosition(50);
      }
    }
    if (section === "maps") {
      if (this.mapeditor_splitbar.position > 90) {
        this.mapeditor_splitbar.setPosition(80);
      }
      if (this.maps_splitbar.position / 100 * this.maps_splitbar.total_width < 90) {
        this.maps_splitbar.setPosition(100 * 210 / this.maps_splitbar.total_width);
      } else if (this.maps_splitbar.position > 90) {
        this.maps_splitbar.setPosition(50);
      }
      this.maps_splitbar.update();
      this.mapeditor_splitbar.update();
    }
    if (section === "doc") {
      this.doc_splitbar.update();
      this.app.doc_editor.editor.resize();
    }
    if (section === "sounds") {
      this.app.sound_editor.update();
    }
    if (section === "music") {
      this.app.music_editor.update();
    }
    if (section === "options") {
      this.app.options.update();
    }
    app.editor.editor.setReadOnly(section !== "code");
    app.doc_editor.editor.setReadOnly(section !== "doc");
    if (useraction && (this.app.project != null)) {
      return this.app.app_state.pushState("project." + this.app.project.slug + "." + section, "/projects/" + this.app.project.slug + "/" + section + "/");
    }
  };

  AppUI.prototype.accountRequired = function(callback) {
    this.logged_callback = callback;
    this.setDisplay("login-overlay", "block");
    this.hide("login-panel");
    this.hide("create-account-panel");
    this.hide("forgot-password-panel");
    return this.show("guest-panel");
  };

  AppUI.prototype.setMainSection = function(section, useraction) {
    var fn, j, len, name, p, ref, s;
    if (useraction == null) {
      useraction = false;
    }
    if (section === "projects" && (this.app.user == null)) {
      this.accountRequired();
      return;
    }
    if (useraction) {
      if (section === "home") {
        this.app.app_state.pushState("home", this.app.translator.lang === "fr" ? "/fr" : "/");
      } else if (section === "projects" && (this.project != null) && (this.current_section != null)) {
        this.app.app_state.pushState("project." + this.project.slug + "." + this.current_section, "/projects/" + this.project.slug + "/" + this.current_section + "/");
      } else if (section === "explore" && this.app.explore.project) {
        p = this.app.explore.project;
        this.app.app_state.pushState("project_details", "/i/" + p.owner + "/" + p.slug + "/", {
          project: p
        });
      } else {
        name = {
          "help": "documentation"
        }[section] || section;
        this.app.app_state.pushState(name, "/" + name + "/");
      }
    }
    ref = this.menuoptions;
    fn = (function(_this) {
      return function(s) {
        var element, menuitem;
        element = document.getElementById(s + "-section");
        menuitem = document.getElementById("menu-" + s);
        if (s === section) {
          element.style.display = "block";
          if (menuitem != null) {
            return menuitem.classList.add("selected");
          }
        } else {
          element.style.display = "none";
          if (menuitem != null) {
            return menuitem.classList.remove("selected");
          }
        }
      };
    })(this);
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      fn(s);
    }
    if (section === "projects" && (this.app.project == null)) {
      this.hide("projectview");
      this.show("myprojects");
    }
    if (section === "projects") {
      this.code_splitbar.update();
      this.runtime_splitbar.update();
      this.app.runwindow.windowResized();
    }
    if (section === "explore") {
      this.app.explore.update();
    }
    if (section === "help") {
      this.app.documentation.updateViewPos();
    }
    if (section === "about") {
      this.app.about.setSection("about");
    }
    if (section === "tutorials") {
      this.app.tutorials.load();
    }
  };

  AppUI.prototype.setDisplay = function(element, value) {
    return document.getElementById(element).style.display = value;
  };

  AppUI.prototype.focus = function(element) {
    return document.getElementById(element).focus();
  };

  AppUI.prototype.get = function(id) {
    return document.getElementById(id);
  };

  AppUI.prototype.setAction = function(id, callback) {
    return this.get(id).addEventListener("click", (function(_this) {
      return function(event) {
        event.preventDefault();
        return callback(event);
      };
    })(this));
  };

  AppUI.prototype.show = function(element) {
    return this.setDisplay(element, "block");
  };

  AppUI.prototype.hide = function(element) {
    return this.setDisplay(element, "none");
  };

  AppUI.prototype.createLoginFunctions = function() {
    var fn, j, lang, len, ref, s1, s2, s3, s4;
    s1 = document.getElementById("switch_to_create_account");
    s2 = document.getElementById("switch_to_log_in");
    s3 = document.getElementById("switch_from_forgot_to_login");
    s4 = document.getElementById("forgot-password-link");
    s1.addEventListener("click", (function(_this) {
      return function() {
        _this.setDisplay("create-account-panel", "block");
        return document.getElementById("login-panel").style.display = "none";
      };
    })(this));
    s2.addEventListener("click", (function(_this) {
      return function() {
        document.getElementById("create-account-panel").style.display = "none";
        return document.getElementById("login-panel").style.display = "block";
      };
    })(this));
    s3.addEventListener("click", (function(_this) {
      return function() {
        document.getElementById("forgot-password-panel").style.display = "none";
        return document.getElementById("login-panel").style.display = "block";
      };
    })(this));
    s4.addEventListener("click", (function(_this) {
      return function() {
        document.getElementById("forgot-password-panel").style.display = "block";
        return document.getElementById("login-panel").style.display = "none";
      };
    })(this));
    document.getElementById("login-window").addEventListener("click", (function(_this) {
      return function(event) {
        return event.stopPropagation();
      };
    })(this));
    document.getElementById("login-overlay").addEventListener("mousedown", (function(_this) {
      return function(event) {
        return document.getElementById("login-overlay").style.display = "none";
      };
    })(this));
    document.getElementById("login-window").addEventListener("mousedown", (function(_this) {
      return function(event) {
        return event.stopPropagation();
      };
    })(this));
    this.setAction("login-button", (function(_this) {
      return function() {
        return _this.showLoginPanel();
      };
    })(this));
    this.setAction("guest-action-login", (function(_this) {
      return function() {
        return _this.showLoginPanel();
      };
    })(this));
    this.setAction("guest-action-create", (function(_this) {
      return function() {
        return _this.showCreateAccountPanel();
      };
    })(this));
    this.setAction("create-account-button", (function(_this) {
      return function() {
        return _this.showCreateAccountPanel();
      };
    })(this));
    this.setAction("create-account-toggle-terms", (function(_this) {
      return function() {
        return _this.toggleTerms();
      };
    })(this));
    this.setAction("guest-action-guest", (function(_this) {
      return function() {
        _this.app.createGuest();
        return document.getElementById("login-overlay").style.display = "none";
      };
    })(this));
    document.querySelector(".username").addEventListener("mouseup", (function(_this) {
      return function(event) {
        return event.stopPropagation();
      };
    })(this));
    document.querySelector(".username").addEventListener("click", (function(_this) {
      return function(event) {
        var c, e, j, len, num, ref;
        e = document.querySelector(".usermenu");
        if (window.ms_standalone) {
          e.classList.add("standalone");
          e.classList.remove("regular");
        } else if (_this.app.user.flags.guest || (_this.app.user.email == null)) {
          e.classList.add("guest");
          e.classList.remove("regular");
        } else {
          e.classList.add("regular");
          e.classList.remove("guest");
        }
        if (e.style.height === "0px") {
          num = 0;
          ref = e.childNodes;
          for (j = 0, len = ref.length; j < len; j++) {
            c = ref[j];
            if (c.offsetParent != null) {
              num += 1;
            }
          }
          e.style.height = (42 * num) + "px";
          if (!_this.usermenuclose) {
            return _this.usermenuclose = document.body.addEventListener("mouseup", function(event) {
              return e.style.height = "0px";
            });
          }
        } else {
          return e.style.height = "0px";
        }
      };
    })(this));
    document.querySelector(".usermenu .logout").addEventListener("click", (function(_this) {
      return function(event) {
        return _this.app.disconnect();
      };
    })(this));
    document.querySelector(".usermenu .settings").addEventListener("click", (function(_this) {
      return function(event) {
        return _this.app.openUserSettings();
      };
    })(this));
    document.querySelector(".usermenu .profile").addEventListener("click", (function(_this) {
      return function(event) {
        return _this.app.openUserProfile();
      };
    })(this));
    document.querySelector(".usermenu .progress").addEventListener("click", (function(_this) {
      return function(event) {
        return _this.app.openUserProgress();
      };
    })(this));
    document.querySelector("#header-progress-summary").addEventListener("click", (function(_this) {
      return function(event) {
        return _this.app.openUserProgress();
      };
    })(this));
    document.querySelector(".usermenu .create-account").addEventListener("click", (function(_this) {
      return function(event) {
        return _this.showCreateAccountPanel();
      };
    })(this));
    document.querySelector(".usermenu .discard-account").addEventListener("click", (function(_this) {
      return function(event) {
        return _this.app.disconnect();
      };
    })(this));
    document.querySelector("#language-setting").addEventListener("mouseup", (function(_this) {
      return function(event) {
        return event.stopPropagation();
      };
    })(this));
    document.querySelector("#language-setting").addEventListener("click", (function(_this) {
      return function(event) {
        var e;
        e = document.querySelector("#language-menu");
        if (!e.classList.contains("language-menu-open")) {
          e.classList.add("language-menu-open");
          document.querySelector("#language-setting").style.width = "0px";
          if (!_this.languagemenuclose) {
            return _this.languagemenuclose = document.body.addEventListener("mouseup", function(event) {
              e.classList.remove("language-menu-open");
              return document.querySelector("#language-setting").style.width = "32px";
            });
          }
        } else {
          e.classList.remove("language-menu-open");
          return document.querySelector("#language-setting").style.width = "32px";
        }
      };
    })(this));
    ref = window.ms_languages;
    fn = (function(_this) {
      return function(lang) {
        if (document.querySelector("#language-choice-" + lang) != null) {
          document.querySelector("#language-choice-" + lang).addEventListener("click", function(event) {
            return _this.setLanguage(lang);
          });
        }
        if (document.querySelector("#switch-to-" + lang) != null) {
          return document.querySelector("#switch-to-" + lang).addEventListener("click", function(event) {
            event.preventDefault();
            return _this.setLanguage(lang);
          });
        }
      };
    })(this);
    for (j = 0, len = ref.length; j < len; j++) {
      lang = ref[j];
      fn(lang);
    }
    this.setAction("login-submit", (function(_this) {
      return function() {
        return _this.app.login(_this.get("login_nick").value, _this.get("login_password").value);
      };
    })(this));
    this.setAction("create-account-submit", (function(_this) {
      return function() {
        if (!_this.get("create-account-tos").checked) {
          return alert(_this.app.translator.get("You must accept the terms of use in order to create an account."));
        }
        return _this.app.createAccount(_this.get("create_nick").value, _this.get("create_email").value, _this.get("create_password").value, _this.get("create-account-newsletter").checked);
      };
    })(this));
    return this.setAction("forgot-submit", (function(_this) {
      return function() {
        return _this.app.sendPasswordRecovery(document.getElementById("forgot_email").value);
      };
    })(this));
  };

  AppUI.prototype.showLoginPanel = function() {
    this.setDisplay("login-overlay", "block");
    this.show("login-panel");
    this.hide("create-account-panel");
    this.hide("forgot-password-panel");
    return this.hide("guest-panel");
  };

  AppUI.prototype.showCreateAccountPanel = function() {
    this.setDisplay("login-overlay", "block");
    this.hide("login-panel");
    this.show("create-account-panel");
    this.hide("forgot-password-panel");
    return this.hide("guest-panel");
  };

  AppUI.prototype.userConnected = function(nick) {
    var text;
    if (this.nick === nick) {
      return;
    }
    this.hide("login-button");
    this.hide("create-account-button");
    this.nick = nick;
    if (this.app.user.flags.guest || (this.app.user.email == null)) {
      this.get("user-nick").innerHTML = this.app.translator.get("Guest");
      document.querySelector(".username i").classList.remove("fa-user");
      document.querySelector(".username i").classList.add("fa-user-clock");
      document.querySelector(".username").classList.add("guest");
    } else {
      document.querySelector(".username i").classList.add("fa-user");
      document.querySelector(".username i").classList.remove("fa-user-clock");
      document.querySelector(".username").classList.remove("guest");
      this.get("user-nick").innerHTML = nick;
      if (this.project != null) {
        this.get("project-name").innerHTML = this.project.title;
        PixelatedImage.setURL(this.get("project-icon"), location.origin + ("/" + this.project.owner.nick + "/" + this.project.slug + "/" + this.project.code + "/icon.png"), 32);
      }
    }
    this.get("user-nick").style.display = "inline-block";
    this.show("login-info");
    this.hide("login-overlay");
    this.updateAllowedSections();
    this.setMainSection("projects", location.pathname.length < 4);
    if (this.app.user.info.size > this.app.user.info.max_storage) {
      text = this.app.translator.get("Your account is out of space!");
      text += " " + this.app.translator.get("You are using %USED% of the %ALLOWED% you are allowed.").replace("%USED%", this.displayByteSize(this.app.user.info.size)).replace("%ALLOWED%", this.displayByteSize(this.app.user.info.max_storage));
      text += " <a href='https://microstudio.dev/community/tips/your-account-is-out-of-space/109/' target='_blank'>" + (this.app.translator.get("More info...")) + "</a>";
      return this.addWarningMessage(text, void 0, "out_of_storage", false);
    }
  };

  AppUI.prototype.updateAllowedSections = function() {
    var e, j, len, ref, s;
    if (this.app.user != null) {
      this.allowed_sections.sounds = true;
      this.allowed_sections.music = true;
    }
    ref = this.sections;
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      e = document.getElementById("menuitem-" + s);
      if (e != null) {
        if (this.allowed_sections[s]) {
          e.style.display = "block";
        } else {
          e.style.display = "none";
        }
      }
    }
  };

  AppUI.prototype.userDisconnected = function() {
    this.get("login-button").style.display = "block";
    this.get("user-nick").innerHTML = "nick";
    this.hide("login-info");
    this.nick = null;
    return this.project = null;
  };

  AppUI.prototype.showLoginButton = function() {
    this.get("login-button").style.display = "block";
    return this.get("create-account-button").style.display = "block";
  };

  AppUI.prototype.popMenu = function() {
    return document.querySelector("header").style.transform = "translateY(0%)";
  };

  AppUI.prototype.createProjectBox = function(p) {
    var buttons, clone_button, delete_button, element, export_button, export_href, icon, title;
    element = document.createElement("div");
    element.classList.add("project-box");
    element.id = "project-box-" + p.slug;
    element.dataset.title = p.title;
    element.dataset.description = p.description;
    element.dataset.tags = p.tags.join(",");
    buttons = document.createElement("div");
    buttons.classList.add("buttons");
    element.appendChild(buttons);
    export_href = "/" + p.owner.nick + "/" + p.slug + "/" + p.code + "/export/project/";
    export_button = document.createElement("div");
    export_button.classList.add("export");
    export_button.innerHTML = "<a href='" + export_href + "' download='" + p.slug + "_files.zip'><i class='fa fa-download'></i> " + (this.app.translator.get("Export")) + "</a>";
    buttons.appendChild(export_button);
    export_button.addEventListener("click", (function(_this) {
      return function(event) {
        event.stopPropagation();
        return event.stopImmediatePropagation();
      };
    })(this));
    clone_button = document.createElement("div");
    clone_button.classList.add("clone");
    clone_button.innerHTML = "<i class='fa fa-copy'></i> " + (this.app.translator.get("Clone"));
    buttons.appendChild(clone_button);
    clone_button.addEventListener("click", (function(_this) {
      return function(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        return ConfirmDialog.confirm(_this.app.translator.get("Do you want to clone this project?"), _this.app.translator.get("Clone"), _this.app.translator.get("Cancel"), function() {
          return _this.app.cloneProject(p);
        });
      };
    })(this));
    delete_button = document.createElement("div");
    delete_button.classList.add("delete");
    if (p.owner.nick === this.app.nick) {
      delete_button.innerHTML = "<i class='fa fa-trash-alt'></i> " + (this.app.translator.get("Delete"));
    } else {
      delete_button.innerHTML = "<i class='fa fa-times'></i> " + (this.app.translator.get("Quit"));
    }
    buttons.appendChild(delete_button);
    delete_button.addEventListener("click", (function(_this) {
      return function(event) {
        var msg, ok;
        event.stopPropagation();
        event.stopImmediatePropagation();
        msg = p.owner.nick === _this.app.nick ? _this.app.translator.get("Really delete this project?") : _this.app.translator.get("Really quit this project?");
        ok = p.owner.nick === _this.app.nick ? _this.app.translator.get("Delete") : _this.app.translator.get("Quit");
        return ConfirmDialog.confirm(msg, ok, _this.app.translator.get("Cancel"), function() {
          return _this.app.deleteProject(p);
        });
      };
    })(this));
    title = document.createElement("div");
    title.classList.add("project-title");
    title.innerText = p.title;
    element.appendChild(title);
    element.appendChild(document.createElement("br"));
    icon = PixelatedImage.create(location.origin + ("/" + p.owner.nick + "/" + p.slug + "/" + p.code + "/icon.png"), 144);
    element.appendChild(icon);
    element.addEventListener("click", (function(_this) {
      return function() {
        return _this.app.openProject(p);
      };
    })(this));
    return element;
  };

  AppUI.prototype.updateProjects = function() {
    var c, count, div, e, element, h2, j, k, len, len1, list, p, pending, ref;
    list = this.get("project-list");
    list.innerHTML = "";
    if (this.app.projects == null) {
      return;
    }
    document.querySelector("#projects-search input").value = "";
    this.app.projects.sort(function(a, b) {
      return b.last_modified - a.last_modified;
    });
    pending = [];
    count = 0;
    ref = this.app.projects;
    for (j = 0, len = ref.length; j < len; j++) {
      p = ref[j];
      if (p.owner.nick === this.app.nick || p.accepted) {
        element = this.createProjectBox(p);
        list.appendChild(element);
        count++;
      } else {
        pending.push(p);
      }
    }
    if (count === 0) {
      h2 = document.createElement("h2");
      h2.innerHTML = this.app.translator.get("Your projects will be displayed here.") + "<br />" + this.app.translator.get("Time to create your first project!");
      list.appendChild(h2);
    }
    if (pending.length > 0) {
      div = document.createElement("div");
      div.classList.add("project-invites-list");
      div.innerHTML = "<h2><i class='fa fa-users'></i> Pending invitations</h2>";
      for (k = 0, len1 = pending.length; k < len1; k++) {
        p = pending[k];
        e = document.createElement("div");
        e.classList.add("invite");
        e.innerHTML = "<div class=\"buttons\">\n   <div class=\"accept\" title=\"Accept\" onclick=\"app.appui.acceptInvite(" + p.id + ")\"><i class=\"fa fa-check\"></i></div><div class=\"reject\" title=\"Reject\" onclick=\"app.appui.rejectInvite(" + p.id + ")\"><i class=\"fa fa-times\"></i></div>\n</div>\n<img src=\"/" + p.owner.nick + "/" + p.slug + "/" + p.code + "/icon.png\"/> " + p.title + " by " + p.owner.nick;
        div.appendChild(e);
      }
      list.insertBefore(div, list.firstChild);
    }
    if (this.logged_callback != null) {
      c = this.logged_callback;
      this.logged_callback = null;
      c();
    } else {
      this.app.app_state.projectsFetched();
    }
  };

  AppUI.prototype.acceptInvite = function(projectid) {
    var j, len, p, ref;
    ref = this.app.projects;
    for (j = 0, len = ref.length; j < len; j++) {
      p = ref[j];
      if (p.id === projectid && p.owner.nick !== this.app.nick && !p.accepted) {
        this.app.client.sendRequest({
          name: "accept_invite",
          project: projectid
        });
      }
    }
  };

  AppUI.prototype.rejectInvite = function(projectid) {
    var j, len, p, ref;
    ref = this.app.projects;
    for (j = 0, len = ref.length; j < len; j++) {
      p = ref[j];
      if (p.id === projectid && p.owner.nick !== this.app.nick) {
        this.app.client.sendRequest({
          name: "remove_project_user",
          user: this.app.nick,
          project: projectid
        });
      }
    }
  };

  AppUI.prototype.setProject = function(project, useraction) {
    this.project = project;
    if (useraction == null) {
      useraction = true;
    }
    this.get("project-name").innerHTML = this.project.title;
    PixelatedImage.setURL(this.get("project-icon"), location.origin + ("/" + this.project.owner.nick + "/" + this.project.slug + "/" + this.project.code + "/icon.png"), 32);
    this.setSection("code", useraction);
    this.show("projectview");
    this.hide("myprojects");
    this.project.addListener(this);
    this.code_splitbar.setPosition(50);
    this.runtime_splitbar.setPosition(50);
    this.app.runwindow.terminal.start();
    this.updateActiveUsers();
    return this.updateAllowedSections();
  };

  AppUI.prototype.projectUpdate = function(change) {
    var icon, img;
    if (change === "spritelist") {
      icon = this.project.getSprite("icon");
      if (icon != null) {
        icon.addImage(this.get("project-icon"), 32);
        img = document.querySelector("#project-box-" + this.project.slug + " img");
        if (img != null) {
          return icon.addImage(img, 144);
        }
      }
    } else if (change === "title") {
      return this.get("project-name").innerHTML = this.project.title;
    } else if (change === "locks") {
      return this.updateActiveUsers();
    }
  };

  AppUI.prototype.updateActiveUsers = function() {
    var div, e, element, i, j, key, list, name, names, ref, span;
    element = document.querySelector(".projectheader #active-project-users");
    list = element.childNodes;
    names = {};
    for (i = j = ref = list.length - 1; j >= 0; i = j += -1) {
      e = list[i];
      name = e.id.split("-")[2];
      if (this.project.friends[name] == null) {
        element.removeChild(e);
      } else {
        names[name] = true;
      }
    }
    for (key in this.project.friends) {
      if (!names[key]) {
        div = document.createElement("div");
        div.style = "background:" + (this.createFriendColor(key));
        div.id = "active-user-" + key;
        i = document.createElement("i");
        i.classList.add("fa");
        i.classList.add("fa-user");
        div.appendChild(i);
        span = document.createElement("span");
        span.innerText = key;
        div.appendChild(span);
        element.appendChild(div);
      }
    }
  };

  AppUI.prototype.createFriendColor = function(friend) {
    var i, j, ref, seed;
    seed = 137;
    for (i = j = 0, ref = friend.length - 1; j <= ref; i = j += 1) {
      seed = (seed + friend.charCodeAt(i) * 31 + 97) % 360;
    }
    return "hsl(" + seed + ",50%,50%)";
  };

  AppUI.prototype.startSaveStatus = function() {
    this.savetick = 0;
    return setInterval(((function(_this) {
      return function() {
        return _this.checkSaveStatus();
      };
    })(this)), 500);
  };

  AppUI.prototype.checkSaveStatus = function() {
    var e, t;
    if (this.project == null) {
      return;
    }
    e = document.getElementById("save-status");
    switch (this.save_status) {
      case "saving":
        if (this.project.pending_changes.length === 0) {
          this.save_status = "saved";
          e.classList.remove("fa-ellipsis-h");
          e.classList.add("fa-check");
          e.style.color = "hsl(160,50%,70%)";
          e.style.opacity = 1;
          return e.style.transform = "scale(1.1)";
        } else {
          this.savetick = (this.savetick + 1) % 2;
          t = .9 + this.savetick * .2;
          return e.style.transform = "scale(" + t + ")";
        }
        break;
      case "saved":
        e.style.opacity = 0;
        e.style.transform = "scale(.9)";
        return this.save_status = "";
      default:
        if (this.project.pending_changes.length > 0) {
          this.save_status = "saving";
          e.classList.add("fa-ellipsis-h");
          e.classList.remove("fa-check");
          e.style.color = "hsl(0,50%,70%)";
          e.style.opacity = 1;
          return e.style.transform = "scale(1)";
        }
    }
  };

  AppUI.prototype.toggleTerms = function() {
    if (this.terms_shown) {
      this.terms_shown = false;
      return this.get("create-account-terms").style.display = "none";
    } else {
      this.terms_shown = true;
      this.get("create-account-terms").style.display = "block";
      return this.app.about.load("terms", (function(_this) {
        return function(text) {
          return _this.get("create-account-terms").innerHTML = DOMPurify.sanitize(marked(text));
        };
      })(this));
    }
  };

  AppUI.prototype.showNotification = function(text) {
    document.querySelector("#notification-bubble span").innerText = text;
    document.getElementById("notification-container").style.transform = "translateY(0px)";
    return setTimeout(((function(_this) {
      return function() {
        return document.getElementById("notification-container").style.transform = "translateY(-150px)";
      };
    })(this)), 5000);
  };

  AppUI.prototype.setLanguage = function(lang) {
    var date;
    if ((document.cookie != null) && document.cookie.indexOf("language=" + lang) >= 0) {
      return;
    }
    date = new Date();
    date.setTime(date.getTime() + 1000 * 3600 * 24 * 60);
    document.cookie = "language=" + lang + ";expires=" + (date.toUTCString()) + ";path=/";
    return window.location = location.origin + (lang !== "en" ? "/" + lang + "/" : "");
  };

  AppUI.prototype.displayByteSize = function(size) {
    if (size < 1000) {
      return size + " " + (this.app.translator.get("Bytes"));
    } else if (size < 10000) {
      return ((size / 1000).toFixed(1)) + " " + (this.app.translator.get("Kb"));
    } else if (size < 1000000) {
      return (Math.floor(size / 1000)) + " " + (this.app.translator.get("Kb"));
    } else if (size < 10000000) {
      return ((size / 1000000).toFixed(1)) + " " + (this.app.translator.get("Mb"));
    } else if (size < 1000000000) {
      return (Math.floor(size / 1000000)) + " " + (this.app.translator.get("Mb"));
    } else {
      return ((size / 1000000000).toFixed(1)) + " " + (this.app.translator.get("Gb"));
    }
  };

  AppUI.prototype.createUserTag = function(nick, tier, pic, picmargin) {
    var div, i, icon, span;
    if (pic == null) {
      pic = false;
    }
    div = document.createElement("a");
    div.classList.add("usertag");
    if (tier) {
      div.classList.add(tier);
    }
    i = document.createElement("i");
    i.classList.add("fa");
    i.classList.add("fa-user");
    div.appendChild(i);
    span = document.createElement("span");
    span.innerText = nick;
    div.appendChild(span);
    if (tier) {
      icon = PixelatedImage.create(location.origin + ("/microstudio/patreon/badges/sprites/" + tier + ".png"), 32);
      icon.alt = icon.title = this.app.getTierName(tier);
      div.appendChild(icon);
    }
    div.href = "/" + nick + "/";
    div.target = "_blank";
    div.addEventListener("click", function(event) {
      return event.stopPropagation();
    });
    if (pic) {
      pic = document.createElement("img");
      pic.src = "/" + nick + ".png";
      pic.classList.add("profile");
      div.appendChild(pic);
      if (picmargin) {
        div.style["margin-left"] = picmargin + "px";
      }
    }
    return div;
  };

  AppUI.prototype.setImportProgress = function(progress) {
    document.getElementById("import-project-button").innerHTML = "<i class=\"fa fa-upload\"></i> Uploading... ";
    progress = Math.round(progress);
    return document.getElementById("import-project-button").style.background = "linear-gradient(90deg,hsl(200,50%,40%) 0%,hsl(200,50%,40%) " + progress + "%,hsl(200,20%,20%) " + progress + "%)";
  };

  AppUI.prototype.resetImportButton = function() {
    document.getElementById("import-project-button").innerHTML = "<i class=\"fa fa-upload\"></i> " + (this.app.translator.get("Import Project"));
    return document.getElementById("import-project-button").style.removeProperty("background");
  };

  return AppUI;

})();
