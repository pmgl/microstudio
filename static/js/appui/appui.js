var AppUI;

AppUI = class AppUI {
  constructor(app1) {
    var advanced, j, k, len, len1, ref, ref1, s;
    this.app = app1;
    this.sections = ["code", "sprites", "maps", "assets", "sounds", "music", "doc", "sync", "options", "publish", "tabs"];
    this.menuoptions = ["home", "explore", "projects", "help", "tutorials", "about", "usersettings"];
    ref = this.sections;
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      ((s) => {
        if (document.getElementById(`menuitem-${s}`) != null) {
          return document.getElementById(`menuitem-${s}`).addEventListener("click", (event) => {
            return this.setSection(s, true);
          });
        }
      })(s);
    }
    this.warning_messages = [];
    document.addEventListener("keydown", (e) => {
      if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) && e.keyCode === 83) {
        e.preventDefault();
        switch (this.current_section) {
          case "code":
            return this.app.editor.checkSave(true);
          case "sprites":
            return this.app.sprite_editor.checkSave(true);
          case "maps":
            return this.app.map_editor.checkSave(true);
          case "doc":
            return this.app.doc_editor.checkSave(true);
          case "assets":
            return this.app.assets_manager.text_viewer.checkSave(true);
        }
      }
    });
    ref1 = this.menuoptions;
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      s = ref1[k];
      ((s) => {
        var e;
        e = document.getElementById(`menu-${s}`);
        if (e != null) {
          return e.addEventListener("click", (event) => {
            if (window.ms_standalone && s === "explore") {
              return window.open("https://microstudio.dev/explore/", "_blank");
            } else if (window.ms_standalone && s === "home") {
              return window.open("https://microstudio.dev", "_blank");
            } else {
              return this.setMainSection(s, true);
            }
          });
        }
      })(s);
    }
    this.setAction("logo", () => {
      if (window.ms_standalone) {
        return window.open("https://microstudio.dev", "_blank");
      } else {
        return this.setMainSection("home", true);
      }
    });
    if (window.ms_standalone) {
      document.getElementById("menu-community").parentNode.href = "https://microstudio.dev/community/";
      document.getElementById("projectoptions-users-content").style.display = "none";
      document.getElementById("publish-box-online").style.display = "none";
      document.getElementById("usersetting-block-nickname").style.display = "none";
      document.getElementById("usersetting-block-email").style.display = "none";
      document.getElementById("usersetting-block-newsletter").style.display = "none";
      document.getElementById("usersetting-block-account-type").style.display = "none";
      document.body.classList.add("standalone");
    }
    //@setSection("options")
    this.createLoginFunctions();
    advanced = document.getElementById("advanced-create-project-options-button");
    this.setAction("create-project-button", () => {
      this.show("create-project-overlay");
      this.focus("create-project-title");
      document.getElementById("createprojectoption-type").value = "app";
      document.getElementById("createprojectoption-language").value = window.ms_default_project_language || "microscript_v2";
      document.getElementById("createprojectoption-graphics").value = "M1";
      document.getElementById("createprojectoption-networking").checked = false;
      document.getElementById("create-project-option-lib-matterjs").checked = false;
      document.getElementById("create-project-option-lib-cannonjs").checked = false;
      return this.hideAdvanced();
    });
    this.hideAdvanced = () => {
      advanced.classList.remove("open");
      document.getElementById("advanced-create-project-options").style.display = "none";
      return advanced.childNodes[1].innerText = this.app.translator.get("Advanced");
    };
    advanced.addEventListener("click", () => {
      if (advanced.classList.contains("open")) {
        return this.hideAdvanced();
      } else {
        advanced.classList.add("open");
        document.getElementById("advanced-create-project-options").style.display = "block";
        return advanced.childNodes[1].innerText = this.app.translator.get("Hide advanced options");
      }
    });
    this.setAction("import-project-button", () => {
      var input;
      input = document.createElement("input");
      input.type = "file";
      input.accept = "application/zip";
      input.addEventListener("change", (event) => {
        var f, files;
        files = event.target.files;
        if (files.length >= 1) {
          f = files[0];
          return this.app.importProject(f);
        }
      });
      return input.click();
    });
    this.setAction("home-action-explore", () => {
      return this.setMainSection("explore");
    });
    this.setAction("home-action-create", () => {
      return this.setMainSection("projects");
    });
    document.getElementById("create-project-overlay").addEventListener("mousedown", (event) => {
      var b;
      if (event.target !== document.getElementById("create-project-overlay")) {
        return true;
      }
      b = document.getElementById("create-project-window").getBoundingClientRect();
      if (event.clientX < b.x || event.clientX > b.x + b.width || event.clientY < b.y || event.clientY > b.y + b.height) {
        this.hide("create-project-overlay");
      }
      return true;
    });
    this.setAction("create-project-submit", () => {
      var libs, slug, title;
      title = this.get("create-project-title").value;
      slug = RegexLib.slugify(title);
      if (title.length > 0 && slug.length > 0) {
        libs = [];
        if (document.getElementById("create-project-option-lib-matterjs").checked) {
          libs.push("matterjs");
        }
        if (document.getElementById("create-project-option-lib-cannonjs").checked) {
          libs.push("cannonjs");
        }
        this.app.createProject(title, slug, {
          type: document.getElementById("createprojectoption-type").value,
          language: document.getElementById("createprojectoption-language").value,
          graphics: document.getElementById("createprojectoption-graphics").value,
          networking: document.getElementById("createprojectoption-networking").checked,
          libs: libs
        });
        this.hide("create-project-overlay");
        return this.get("create-project-title").value = "";
      }
    });
    this.doc_splitbar = new SplitBar("doc-section", "horizontal");
    this.doc_splitbar.auto = 1;
    this.code_splitbar = new SplitBar("code-section", "horizontal");
    this.code_splitbar.auto = 1;
    this.runtime_splitbar = new SplitBar("runtime-container", "vertical");
    this.runtime_splitbar.auto = 1.5;
    this.runtime_splitbar.initPosition(67);
    this.server_splitbar = new SplitBar("runtime-terminal", "horizontal");
    this.server_splitbar.initPosition(50);
    this.server_splitbar.closed1 = true;
    this.debug_splitbar = new SplitBar("terminal-debug-container", "horizontal");
    this.debug_splitbar.closed2 = true;
    this.debug_splitbar.splitbar_size = 12;
    this.setAction("backtoprojects", () => {
      if (this.app.project != null) {
        return this.app.project.savePendingChanges(() => {
          return this.backToProjectList(true);
        });
      } else {
        return this.backToProjectList(true);
      }
    });
    this.get("create_nick").addEventListener("input", () => {
      var value;
      value = this.get("create_nick").value;
      if (value !== RegexLib.fixNick(value)) {
        return this.get("create_nick").value = RegexLib.fixNick(value);
      }
    });
    this.startSaveStatus();
    this.last_activity = Date.now();
    document.addEventListener("mousemove", () => {
      return this.last_activity = Date.now();
    });
    document.addEventListener("keydown", () => {
      return this.last_activity = Date.now();
    });
    document.querySelector("#projects-search input").addEventListener("input", () => {
      var l, len2, len3, list, m, ok, p, results, results1, search;
      search = document.querySelector("#projects-search input").value.toLowerCase();
      list = document.getElementById("project-list").childNodes;
      if (search.trim().length > 0) {
        results = [];
        for (l = 0, len2 = list.length; l < len2; l++) {
          p = list[l];
          if (p.dataset.title == null) {
            continue;
          }
          ok = p.dataset.title.toLowerCase().indexOf(search) >= 0;
          ok |= p.dataset.description.toLowerCase().indexOf(search) >= 0;
          ok |= p.dataset.tags.toLowerCase().indexOf(search) >= 0;
          ok |= p.dataset.public && "public".indexOf(search) >= 0;
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
    });
    document.querySelector("#home-section").addEventListener("scroll", () => {
      var scroll;
      scroll = Math.min(60, document.querySelector("#home-section").scrollTop);
      return document.querySelector("#home-header-background").style.height = `${scroll}px`;
    });
    //document.querySelector("#home-section .part1").style["padding-top"] = "#{160-scroll}px"
    document.getElementById("myprojects").addEventListener("dragover", (event) => {
      return event.preventDefault();
    });
    document.getElementById("myprojects").addEventListener("drop", (event) => {
      event.preventDefault();
      if (event.dataTransfer.items && (event.dataTransfer.items[0] != null)) {
        return this.app.importProject(event.dataTransfer.items[0].getAsFile());
      }
    });
    this.createFullscreenFeatures();
    this.createProjectSideBarCollapse();
    setInterval((() => {
      return this.checkActivity();
    }), 10000);
    this.reboot_date = 1689163200000;
    this.checkRebootMessage();
  }

  checkRebootMessage() {
    var div, funk;
    if (this.reboot_date && Date.now() < this.reboot_date + 1000 * 60 * 2) {
      document.querySelector(".main-container").style.top = "100px";
      div = document.createElement("div");
      div.classList.add("meta-message");
      funk = () => {
        var hours, minutes;
        minutes = Math.max(0, this.reboot_date - Date.now()) / 60000;
        if (minutes >= 120) {
          hours = Math.floor(minutes / 60);
          return div.innerHTML = "<i class='fas fa-info-circle'></i> " + this.app.translator.get("microStudio will be down for server migration on %DATE% at %TIME%. Downtime will last a few minutes.").replace("%DATE%", new Date(this.reboot_date).toLocaleDateString()).replace("%TIME%", new Date(this.reboot_date).toLocaleTimeString());
        } else if (minutes >= 2) {
          minutes = Math.floor(minutes);
          return div.innerHTML = "<i class='fas fa-exclamation-circle'></i> " + this.app.translator.get("Downtime will start in %MINUTES% minutes").replace("%MINUTES%", minutes);
        } else {
          return div.innerHTML = "<i class='fas fa-exclamation-circle'></i> " + this.app.translator.get("Downtime will start immediately");
        }
      };
      funk();
      setInterval((() => {
        return funk();
      }), 30000);
      return document.body.appendChild(div);
    }
  }

  addWarningMessage(text, icon = "fa-exclamation-circle", id, dismissable) {
    var close, div, span;
    if (dismissable && (id != null)) {
      if (localStorage.getItem(id)) {
        return;
      }
    }
    div = document.createElement("div");
    div.classList.add("meta-message");
    span = document.createElement("span");
    span.innerHTML = `<i class='fas ${icon}'></i> ${text}`;
    if (dismissable) {
      close = document.createElement("i");
      close.classList.add("fa");
      close.classList.add("fa-times");
      close.addEventListener("click", () => {
        this.removeWarningMessage(div);
        return localStorage.setItem(id, true);
      });
      div.appendChild(close);
    }
    div.appendChild(span);
    this.warning_messages.push(div);
    document.querySelector(".main-container").style.top = `${60 + 40 * this.warning_messages.length}px`;
    document.body.appendChild(div);
    return this.layoutWarningMessages();
  }

  layoutWarningMessages() {
    var i, j, len, ref, results, w;
    ref = this.warning_messages;
    results = [];
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      w = ref[i];
      results.push(w.style.top = `${60 + i * 40}px`);
    }
    return results;
  }

  removeWarningMessage(div) {
    var index;
    if (document.body.contains(div)) {
      document.body.removeChild(div);
      index = this.warning_messages.indexOf(div);
      if (index >= 0) {
        this.warning_messages.splice(index, 1);
        document.querySelector(".main-container").style.top = `${60 + 40 * this.warning_messages.length}px`;
        return this.layoutWarningMessages();
      }
    }
  }

  checkActivity() {
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
  }

  backToProjectList(useraction) {
    this.hide("projectview");
    this.show("myprojects");
    this.app.runwindow.projectClosed();
    this.app.debug.projectClosed();
    this.app.tab_manager.projectClosed();
    this.app.lib_manager.projectClosed();
    this.app.project = null;
    this.project = null;
    this.app.updateProjectList();
    if (useraction) {
      this.app.app_state.pushState("projects", "/projects/");
    }
    if (document.fullscreenElement) {
      return document.exitFullscreen();
    }
  }

  setSection(section, useraction) {
    var item, j, k, len, len1, list, menuitem, ref, s;
    if (this.makeProjectSideBarVisible != null) {
      this.makeProjectSideBarVisible();
    }
    this.current_section = section;
    ref = this.sections;
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      ((s) => {
        var element, menuitem;
        element = document.getElementById(`${s}-section`);
        menuitem = document.getElementById(`menuitem-${s}`);
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
      })(s);
    }
    menuitem = document.getElementById(`menuitem-${section}`);
    if (menuitem != null) {
      menuitem.classList.add("selected");
    }
    list = document.querySelectorAll(".menuitem-plugin");
    for (k = 0, len1 = list.length; k < len1; k++) {
      item = list[k];
      if (item.id !== `menuitem-${section}`) {
        item.classList.remove("selected");
      }
    }
    this.app.tab_manager.setTabView(section);
    if (section === "sprites") {
      this.app.sprite_editor.spriteview.windowResized();
    }
    if (section === "code") {
      this.code_splitbar.update();
      this.server_splitbar.update();
      this.debug_splitbar.update();
      this.runtime_splitbar.update();
      this.app.runwindow.windowResized();
      this.app.editor.editor.resize();
      this.app.editor.update();
    }
    if (section === "sprites") {
      this.app.sprite_editor.update();
    }
    if (section === "maps") {
      this.app.map_editor.update();
    }
    if (section === "doc") {
      this.doc_splitbar.update();
      this.app.doc_editor.editor.resize();
      this.app.doc_editor.checkTutorial();
    }
    if (section === "sounds") {
      this.app.sound_editor.update();
    }
    if (section === "music") {
      this.app.music_editor.update();
    }
    if (section === "assets") {
      this.app.assets_manager.update();
    }
    if (section === "sync") {
      this.app.sync.update();
    }
    if (section === "options") {
      this.app.options.update();
    }
    app.editor.editor.setReadOnly(section !== "code");
    app.doc_editor.editor.setReadOnly(section !== "doc");
    if (useraction && (this.app.project != null)) {
      this.app.app_state.pushState(`project.${this.app.project.slug}.${section}`, `/projects/${this.app.project.slug}/${section}/`);
    }
    return this.app.runwindow.hideAll();
  }

  accountRequired(callback) {
    this.logged_callback = callback;
    this.setDisplay("login-overlay", "block");
    this.hide("login-panel");
    this.hide("create-account-panel");
    this.hide("forgot-password-panel");
    return this.show("guest-panel");
  }

  setMainSection(section, useraction = false) {
    var j, len, name, p, ref, s;
    if (section === "projects" && (this.app.user == null)) {
      this.accountRequired();
      return;
    }
    if (useraction) {
      if (section === "home") {
        this.app.app_state.pushState("home", this.app.translator.lang === "fr" ? "/fr" : "/");
      } else if (section === "projects" && (this.project != null) && (this.current_section != null)) {
        this.app.app_state.pushState(`project.${this.project.slug}.${this.current_section}`, `/projects/${this.project.slug}/${this.current_section}/`);
      } else if (section === "explore" && this.app.explore.project) {
        p = this.app.explore.project;
        this.app.app_state.pushState("project_details", `/i/${p.owner}/${p.slug}/`, {
          project: p
        });
      } else {
        name = {
          "help": "documentation"
        }[section] || section;
        if (name === "documentation") {
          this.app.documentation.pushState();
        } else if (name === "tutorials") {
          this.app.tutorials.tutorials_page.pushState();
        } else {
          this.app.app_state.pushState(name, `/${name}/`);
        }
      }
    }
    ref = this.menuoptions;
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      ((s) => {
        var element, menuitem;
        element = document.getElementById(`${s}-section`);
        menuitem = document.getElementById(`menu-${s}`);
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
      })(s);
    }
    if (section === "projects" && (this.app.project == null)) {
      this.hide("projectview");
      this.show("myprojects");
    }
    if (section === "projects") {
      this.code_splitbar.update();
      this.server_splitbar.update();
      this.debug_splitbar.update();
      this.runtime_splitbar.update();
      this.app.runwindow.windowResized();
    }
    if (section === "explore") {
      this.app.explore.update();
    } else {
      this.app.explore.closed();
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
    //@app.explore.closeDetails() if section != "explore"
    this.app.runwindow.hideAll();
  }

  setDisplay(element, value) {
    return document.getElementById(element).style.display = value;
  }

  focus(element) {
    return document.getElementById(element).focus();
  }

  get(id) {
    return document.getElementById(id);
  }

  setAction(id, callback) {
    return this.get(id).addEventListener("click", (event) => {
      event.preventDefault();
      return callback(event);
    });
  }

  show(element) {
    return this.setDisplay(element, "block");
  }

  hide(element) {
    return this.setDisplay(element, "none");
  }

  createLoginFunctions() {
    var j, lang, len, ref, s1, s2, s3, s4;
    s1 = document.getElementById("switch_to_create_account");
    s2 = document.getElementById("switch_to_log_in");
    s3 = document.getElementById("switch_from_forgot_to_login");
    s4 = document.getElementById("forgot-password-link");
    s1.addEventListener("click", () => {
      this.setDisplay("create-account-panel", "block");
      return document.getElementById("login-panel").style.display = "none";
    });
    s2.addEventListener("click", () => {
      document.getElementById("create-account-panel").style.display = "none";
      return document.getElementById("login-panel").style.display = "block";
    });
    s3.addEventListener("click", () => {
      document.getElementById("forgot-password-panel").style.display = "none";
      return document.getElementById("login-panel").style.display = "block";
    });
    s4.addEventListener("click", () => {
      document.getElementById("forgot-password-panel").style.display = "block";
      return document.getElementById("login-panel").style.display = "none";
    });
    document.getElementById("login-window").addEventListener("click", (event) => {
      return event.stopPropagation();
    });
    document.getElementById("login-overlay").addEventListener("mousedown", (event) => {
      return document.getElementById("login-overlay").style.display = "none";
    });
    document.getElementById("login-window").addEventListener("mousedown", (event) => {
      return event.stopPropagation();
    });
    this.setAction("login-button", () => {
      return this.showLoginPanel();
    });
    this.setAction("guest-action-login", () => {
      return this.showLoginPanel();
    });
    this.setAction("guest-action-create", () => {
      return this.showCreateAccountPanel();
    });
    this.setAction("create-account-button", () => {
      return this.showCreateAccountPanel();
    });
    this.setAction("create-account-toggle-terms", () => {
      return this.toggleTerms();
    });
    this.setAction("guest-action-guest", () => {
      this.app.createGuest();
      return document.getElementById("login-overlay").style.display = "none";
    });
    document.querySelector(".username").addEventListener("mouseup", (event) => {
      return event.stopPropagation();
    });
    document.querySelector(".username").addEventListener("click", (event) => {
      var c, e, j, len, num, ref;
      e = document.querySelector(".usermenu");
      if (window.ms_standalone) {
        e.classList.add("standalone");
        e.classList.remove("regular");
      } else if (this.app.user.flags.guest || (this.app.user.email == null)) {
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
        e.style.height = `${42 * num}px`;
        if (!this.usermenuclose) {
          return this.usermenuclose = document.body.addEventListener("mouseup", (event) => {
            return e.style.height = "0px";
          });
        }
      } else {
        return e.style.height = "0px";
      }
    });
    document.querySelector(".usermenu .logout").addEventListener("click", (event) => {
      return this.app.disconnect();
    });
    document.querySelector(".usermenu .settings").addEventListener("click", (event) => {
      return this.app.openUserSettings();
    });
    document.querySelector(".usermenu .profile").addEventListener("click", (event) => {
      return this.app.openUserProfile();
    });
    document.querySelector(".usermenu .progress").addEventListener("click", (event) => {
      return this.app.openUserProgress();
    });
    document.querySelector("#header-progress-summary").addEventListener("click", (event) => {
      return this.app.openUserProgress();
    });
    document.querySelector(".usermenu .create-account").addEventListener("click", (event) => {
      return this.showCreateAccountPanel();
    });
    document.querySelector(".usermenu .discard-account").addEventListener("click", (event) => {
      return this.app.disconnect();
    });
    document.querySelector("#language-setting").addEventListener("mouseup", (event) => {
      return event.stopPropagation();
    });
    this.createMainMenuFunction();
    document.querySelector("#language-setting").addEventListener("click", (event) => {
      var e;
      e = document.querySelector("#language-menu");
      if (!e.classList.contains("language-menu-open")) {
        e.classList.add("language-menu-open");
        if (!this.languagemenuclose) {
          return this.languagemenuclose = document.body.addEventListener("mouseup", (event) => {
            return e.classList.remove("language-menu-open");
          });
        }
      } else {
        return e.classList.remove("language-menu-open");
      }
    });
    ref = window.ms_languages;
    for (j = 0, len = ref.length; j < len; j++) {
      lang = ref[j];
      ((lang) => {
        if (document.querySelector(`#language-choice-${lang}`) != null) {
          document.querySelector(`#language-choice-${lang}`).addEventListener("click", (event) => {
            return this.setLanguage(lang);
          });
        }
        if (document.querySelector(`#switch-to-${lang}`) != null) {
          return document.querySelector(`#switch-to-${lang}`).addEventListener("click", (event) => {
            event.preventDefault();
            return this.setLanguage(lang);
          });
        }
      })(lang);
    }
    this.setAction("login-submit", () => {
      return this.app.login(this.get("login_nick").value, this.get("login_password").value);
    });
    this.setAction("create-account-submit", () => {
      if (!this.get("create-account-tos").checked) {
        return alert(this.app.translator.get("You must accept the terms of use in order to create an account."));
      }
      return this.app.createAccount(this.get("create_nick").value, this.get("create_email").value, this.get("create_password").value, this.get("create-account-newsletter").checked);
    });
    return this.setAction("forgot-submit", () => {
      return this.app.sendPasswordRecovery(document.getElementById("forgot_email").value);
    });
  }

  showLoginPanel() {
    this.setDisplay("login-overlay", "block");
    this.show("login-panel");
    this.hide("create-account-panel");
    this.hide("forgot-password-panel");
    return this.hide("guest-panel");
  }

  showCreateAccountPanel() {
    this.setDisplay("login-overlay", "block");
    this.hide("login-panel");
    this.show("create-account-panel");
    this.hide("forgot-password-panel");
    return this.hide("guest-panel");
  }

  userConnected(nick) {
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
        this.updateProjectTitle();
        this.get("project-icon").src = location.origin + `/${this.project.owner.nick}/${this.project.slug}/${this.project.code}/icon.png`;
      }
    }
    this.get("user-nick").style.display = "inline-block";
    //@show "user-info"
    this.show("login-info");
    this.hide("login-overlay");
    this.setMainSection("projects", location.pathname.length < 4); // home page with language variation => record jump to /projects/
    
    // @addWarningMessage """Join <a target="_blank" href="https://itch.io/jam/microstudio-mini-jam-2">microStudio mini-jam #2</a>! From October 24/25. More info in the <a target="_blank" href="https://microstudio.dev/community/news/mini-jam-2/235/">Community Forum</a> and <a target="_blank" href="https://discord.gg/BDMqjxd">Discord</a>""","fa-info-circle","mini_jam_2_#{Math.floor(Date.now()/1000/3600/12)}",true
    if (this.app.user.info.size > this.app.user.info.max_storage) {
      text = this.app.translator.get("Your account is out of space!");
      text += " " + this.app.translator.get("You are using %USED% of the %ALLOWED% you are allowed.").replace("%USED%", this.displayByteSize(this.app.user.info.size)).replace("%ALLOWED%", this.displayByteSize(this.app.user.info.max_storage));
      text += ` <a href='https://microstudio.dev/community/tips/your-account-is-out-of-space/109/' target='_blank'>${this.app.translator.get("More info...")}</a>`;
      return this.addWarningMessage(text, void 0, "out_of_storage", false);
    }
  }

  //if not @project?
  //  @show "myprojects"
  //  @hide "projectview"
  //@get("menu-projects").style.display = "inline-block"
  //@setMainSection "projects"
  userDisconnected() {
    this.get("login-button").style.display = "block";
    this.get("user-nick").innerHTML = "nick";
    //@hide "menu-projects"
    this.hide("login-info");
    this.nick = null;
    return this.project = null;
  }

  //@get("user-info").style.display = "none"
  showLoginButton() {
    this.get("login-button").style.display = "block";
    return this.get("create-account-button").style.display = "block";
  }

  popMenu() {
    return document.querySelector("header").style.transform = "translateY(0%)";
  }

  createProjectBox(p) {
    var buttons, clone_button, delete_button, element, export_button, export_href, icon, pill, size, sizepill, title;
    element = document.createElement("a");
    element.classList.add("project-box");
    element.id = `project-box-${p.slug}`;
    element.href = `/projects/${p.slug}/code/`;
    element.dataset.title = p.title;
    element.dataset.description = p.description;
    element.dataset.tags = p.tags.join(",");
    if (p.public) {
      element.dataset.public = p.public;
    }
    buttons = document.createElement("div");
    buttons.classList.add("buttons");
    element.appendChild(buttons);
    if (p.size) {
      size = this.displayByteSize(p.size);
      sizepill = document.createElement("div");
      sizepill.innerText = size;
      sizepill.classList.add("pill", "bg-blue", "shadow5", 'marginbottom10', 'marginright10');
      buttons.appendChild(sizepill);
    }
    if (p.public) {
      pill = document.createElement("div");
      pill.innerHTML = "<i class=\"fa fa-eye\"></i> " + this.app.translator.get("public");
      pill.classList.add("pill", "bg-purple", "shadow5", 'marginbottom10');
      buttons.appendChild(pill);
    }
    export_href = `/${p.owner.nick}/${p.slug}/${p.code}/export/project/`;
    export_button = document.createElement("div");
    export_button.classList.add("button", "export", "shadow5");
    export_button.innerHTML = `<a href='${export_href}' download='${p.slug}_files.zip'><i class='fa fa-download'></i> ${this.app.translator.get("Export")}</a>`;
    buttons.appendChild(export_button);
    export_button.addEventListener("click", (event) => {
      event.stopPropagation();
      return event.stopImmediatePropagation();
    });
    clone_button = document.createElement("div");
    clone_button.classList.add("button", "clone", "shadow5");
    clone_button.innerHTML = `<i class='fa fa-copy'></i> ${this.app.translator.get("Clone")}`;
    buttons.appendChild(clone_button);
    clone_button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return ConfirmDialog.confirm(this.app.translator.get("Do you want to clone this project?"), this.app.translator.get("Clone"), this.app.translator.get("Cancel"), () => {
        return this.app.cloneProject(p);
      });
    });
    delete_button = document.createElement("div");
    delete_button.classList.add("button", "delete", "shadow5");
    if (p.owner.nick === this.app.nick) {
      delete_button.innerHTML = `<i class='fa fa-trash-alt'></i> ${this.app.translator.get("Delete")}`;
    } else {
      delete_button.innerHTML = `<i class='fa fa-times'></i> ${this.app.translator.get("Quit")}`;
    }
    buttons.appendChild(delete_button);
    delete_button.addEventListener("click", (event) => {
      var msg, ok;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      msg = p.owner.nick === this.app.nick ? this.app.translator.get("Really delete this project?") : this.app.translator.get("Really quit this project?");
      ok = p.owner.nick === this.app.nick ? this.app.translator.get("Delete") : this.app.translator.get("Quit");
      return ConfirmDialog.confirm(msg, ok, this.app.translator.get("Cancel"), () => {
        return this.app.deleteProject(p);
      });
    });
    title = document.createElement("div");
    title.classList.add("project-title");
    title.innerText = p.title;
    element.appendChild(title);
    element.appendChild(document.createElement("br"));
    icon = new Image;
    icon.src = location.origin + `/${p.owner.nick}/${p.slug}/${p.code}/icon.png`;
    icon.classList.add("pixelated");
    element.appendChild(icon);
    if (p.poster) {
      element.style.background = `linear-gradient(to bottom, hsla(200,20%,20%,0.6), hsla(200,20%,20%,0.9)),url(/${p.owner.nick}/${p.slug}/${p.code}/poster.png)`;
      element.style["background-size"] = "cover";
      element.style["background-opacity"] = .5;
      icon.style.width = "104px";
      icon.style.height = "104px";
      icon.style["margin-top"] = "40px";
      icon.style["box-shadow"] = "0 0 10px 1px #000";
    }
    element.addEventListener("click", (event) => {
      if (!event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        return this.app.openProject(p);
      }
    });
    return element;
  }

  updateProjects() {
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
        e.innerHTML = `<div class="buttons">\n   <div class="accept" title="Accept" onclick="app.appui.acceptInvite(${p.id})"><i class="fa fa-check"></i></div><div class="reject" title="Reject" onclick="app.appui.rejectInvite(${p.id})"><i class="fa fa-times"></i></div>\n</div>\n<img src="/${p.owner.nick}/${p.slug}/${p.code}/icon.png"/> ${p.title} by ${p.owner.nick}`;
        div.appendChild(e);
      }
      list.insertBefore(div, list.firstChild);
    }
    //# create list of projects to accept or reject
    if (this.logged_callback != null) {
      c = this.logged_callback;
      this.logged_callback = null;
      c();
    } else {
      this.app.app_state.projectsFetched();
    }
  }

  acceptInvite(projectid) {
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
  }

  rejectInvite(projectid) {
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
  }

  setProject(project1, useraction = true) {
    var j, len, ref, t, tab;
    this.project = project1;
    this.updateProjectTitle();
    this.get("project-icon").src = location.origin + `/${this.project.owner.nick}/${this.project.slug}/${this.project.code}/icon.png`;
    tab = "code";
    if ((this.project.tabs != null) && !this.app.tab_manager.isTabActive("code")) {
      tab = "options";
      ref = this.sections;
      for (j = 0, len = ref.length; j < len; j++) {
        t = ref[j];
        if (this.app.tab_manager.isTabActive(t)) {
          tab = t;
          break;
        }
      }
    }
    this.setSection(tab, useraction);
    this.show("projectview");
    this.hide("myprojects");
    this.project.addListener(this);
    this.code_splitbar.initPosition(50);
    this.debug_splitbar.closed2 = true;
    this.debug_splitbar.update();
    this.runtime_splitbar.initPosition(50);
    this.server_splitbar.initPosition(50);
    this.app.runwindow.terminal.start();
    this.updateActiveUsers();
    return this.doc_splitbar.initPosition(50);
  }

  updateProjectTitle() {
    var html;
    if (this.project != null) {
      html = this.project.title;
      if (this.project.public) {
        html += ` <div class="pill bg-purple shadow5 marginleft10"><i class="fa fa-eye"></i> ${this.app.translator.get("public")}</div>`;
      }
      return this.get("project-name").innerHTML = html;
    }
  }

  projectUpdate(change) {
    var icon, img;
    if (change === "spritelist") {
      icon = this.project.getSprite("icon");
      if (icon != null) {
        icon.addImage(this.get("project-icon"), 32);
        img = document.querySelector(`#project-box-${this.project.slug} img`);
        if (img != null) {
          return icon.addImage(img, 144);
        }
      }
    } else if (change === "title" || change === "public") {
      return this.updateProjectTitle();
    } else if (change === "locks") {
      return this.updateActiveUsers();
    }
  }

  updateActiveUsers() {
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
        div.style = `background:${this.createFriendColor(key)}`;
        div.id = `active-user-${key}`;
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
  }

  createFriendColor(friend) {
    var i, j, ref, seed;
    seed = 137;
    for (i = j = 0, ref = friend.length - 1; j <= ref; i = j += 1) {
      seed = (seed + friend.charCodeAt(i) * 31 + 97) % 360;
    }
    return `hsl(${seed},50%,50%)`;
  }

  startSaveStatus() {
    this.savetick = 0;
    return setInterval((() => {
      return this.checkSaveStatus();
    }), 500);
  }

  checkSaveStatus() {
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
          return e.style.transform = `scale(${t})`;
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
  }

  toggleTerms() {
    if (this.terms_shown) {
      this.terms_shown = false;
      return this.get("create-account-terms").style.display = "none";
    } else {
      this.terms_shown = true;
      this.get("create-account-terms").style.display = "block";
      return this.app.about.load("terms", (text) => {
        return this.get("create-account-terms").innerHTML = DOMPurify.sanitize(marked(text));
      });
    }
  }

  showNotification(text) {
    document.querySelector("#notification-bubble span").innerText = text;
    document.getElementById("notification-container").style.transform = "translateY(0px)";
    return setTimeout((() => {
      return document.getElementById("notification-container").style.transform = "translateY(-150px)";
    }), 5000);
  }

  setLanguage(lang) {
    var date;
    if ((document.cookie != null) && document.cookie.indexOf(`language=${lang}`) >= 0) {
      return;
    }
    date = new Date();
    date.setTime(date.getTime() + 1000 * 3600 * 24 * 60);
    document.cookie = `language=${lang};expires=${date.toUTCString()};path=/`;
    return window.location = location.origin + (lang !== "en" ? `/${lang}/` : ""); //+"?t=#{Date.now()}"
  }

  displayByteSize(size) {
    if (size < 1000) {
      return `${size} ${this.app.translator.get("Bytes")}`;
    } else if (size < 10000) {
      return `${(size / 1000).toFixed(1)} ${this.app.translator.get("Kb")}`;
    } else if (size < 1000000) {
      return `${Math.floor(size / 1000)} ${this.app.translator.get("Kb")}`;
    } else if (size < 10000000) {
      return `${(size / 1000000).toFixed(1)} ${this.app.translator.get("Mb")}`;
    } else if (size < 1000000000) {
      return `${Math.floor(size / 1000000)} ${this.app.translator.get("Mb")}`;
    } else {
      return `${(size / 1000000000).toFixed(1)} ${this.app.translator.get("Gb")}`;
    }
  }

  createUserTag(nick, tier, pic = false, picmargin) {
    var div, i, icon, span;
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
      icon = new Image;
      icon.src = location.origin + `/microstudio/patreon/badges/sprites/${tier}.png`;
      icon.classList.add("pixelated");
      icon.style = "width: 32px; height: 32px;";
      icon.alt = icon.title = this.app.getTierName(tier);
      div.appendChild(icon);
    }
    div.href = `/${nick}/`;
    div.target = "_blank";
    div.addEventListener("click", function(event) {
      return event.stopPropagation();
    });
    if (pic) {
      pic = document.createElement("img");
      pic.src = `/${nick}.png`;
      pic.classList.add("profile");
      div.appendChild(pic);
      if (picmargin) {
        div.style["margin-left"] = `${picmargin}px`;
      }
    }
    return div;
  }

  setImportProgress(progress) {
    document.getElementById("import-project-button").innerHTML = "<i class=\"fa fa-upload\"></i> Uploading... ";
    progress = Math.round(progress);
    return document.getElementById("import-project-button").style.background = `linear-gradient(90deg,hsl(200,50%,40%) 0%,hsl(200,50%,40%) ${progress}%,hsl(200,20%,20%) ${progress}%)`;
  }

  resetImportButton() {
    document.getElementById("import-project-button").innerHTML = `<i class="fa fa-upload"></i> ${this.app.translator.get("Import Project")}`;
    return document.getElementById("import-project-button").style.removeProperty("background");
  }

  bumpElement(select) {
    var element, interval, start;
    element = document.querySelector(select);
    if (element != null) {
      start = Date.now();
      return interval = setInterval((function() {
        var d, s, t;
        t = (Date.now() - start) / 300;
        if (t >= 1) {
          element.style.transform = "none";
          return clearInterval(interval);
        } else {
          t = Math.pow(t, .8);
          s = 1 + .5 * Math.sin(t * Math.PI);
          d = -.5 * Math.sin(t * Math.PI) * 20;
          return element.style.transform = `scale(${s}) rotateZ(${d}deg)`;
        }
      }), 16);
    }
  }

  createFullscreenFeatures() {
    var button;
    button = document.getElementById("project-fullscreen");
    button.addEventListener("click", () => {
      if (document.fullscreenElement) {
        return document.exitFullscreen();
      } else {
        document.getElementById("projectview").requestFullscreen();
        return document.getElementById("projectview").style.background = "hsl(200,20%,15%)";
      }
    });
    return window.addEventListener("fullscreenchange", () => {
      if (document.fullscreenElement) {
        button.classList.remove("fa-expand");
        return button.classList.add("fa-compress");
      } else {
        button.classList.add("fa-expand");
        button.classList.remove("fa-compress");
        return document.getElementById("projectview").style.background = "none";
      }
    });
  }

  createMainMenuFunction() {
    var bump, button, closing, displayed, menu, resize;
    button = document.getElementById("main-menu-button");
    menu = document.querySelector(".titlemenu");
    closing = false;
    displayed = false;
    bump = () => {
      var f, t;
      t = Date.now();
      f = () => {
        var rr, tt;
        tt = Date.now() - t;
        if (tt < 250) {
          tt = 1 - tt / 250;
          tt = Math.pow(tt, 2);
          rr = tt;
          tt = 1 + tt * .5;
          button.style.transform = `scale(${tt},${tt}) rotate(${-rr * 10}deg)`;
          return setTimeout(f, 16);
        } else {
          return button.style.transform = "none";
        }
      };
      return f();
    };
    button.addEventListener("click", (event) => {
      if (menu.style.left !== "0%" && !closing) {
        menu.style.left = "0%";
        return bump();
      } else {
        menu.style.left = "-100%";
        return bump();
      }
    });
    document.addEventListener("mouseup", () => {
      if ((button.offsetParent != null) && menu.style.left !== "-100%") {
        menu.style.left = "-100%";
        closing = true;
        return bump();
      } else {
        return closing = false;
      }
    });
    resize = () => {
      if (button.offsetParent == null) {
        menu.style.left = "0px";
        return displayed = false;
      } else if (menu.style.left !== "0%") {
        menu.style.left = "-100%";
        if (!displayed) {
          displayed = true;
          return bump();
        }
      }
    };
    window.addEventListener("resize", resize);
    return resize();
  }

  createProjectSideBarCollapse() {
    var collapse_time, resize_until;
    collapse_time = 0;
    resize_until = Date.now();
    this.makeProjectSideBarVisible = () => {
      if (document.getElementById("projectview").classList.contains("sidebar-collapsed")) {
        document.getElementById("projectview").classList.remove("sidebar-collapsed");
        window.dispatchEvent(new Event('resize'));
      }
      if (window.innerWidth < 600) {
        return collapse_time = Date.now() + 3000;
      }
    };
    window.addEventListener("resize", () => {
      if (!document.getElementById("projectview").classList.contains("sidebar-collapsed") && window.innerWidth < 600) {
        return collapse_time = Date.now() + 3000;
      } else if (document.getElementById("projectview").classList.contains("sidebar-collapsed") && window.innerWidth >= 600) {
        return this.makeProjectSideBarVisible();
      }
    });
    return setInterval((() => {
      if (Date.now() < resize_until) {
        window.dispatchEvent(new Event('resize'));
      }
      if (collapse_time && Date.now() > collapse_time) {
        collapse_time = 0;
        if (window.innerWidth < 600) {
          document.getElementById("projectview").classList.add("sidebar-collapsed");
          return window.dispatchEvent(new Event('resize'));
        }
      }
    }), 500);
  }

  createProjectLikesButton(element, project) {
    var e, likes;
    e = element.querySelector(".likes-button");
    if (e) {
      e.parentNode.removeChild(e);
    }
    likes = document.createElement("div");
    likes.classList.add("likes-button");
    likes.innerHTML = "<i class='fa fa-thumbs-up'></i> " + project.likes;
    if (project.liked) {
      likes.classList.add("liked");
    }
    element.appendChild(likes);
    return likes.addEventListener("click", () => {
      event.stopImmediatePropagation();
      if (!this.app.user.flags.validated) {
        return alert(this.app.translator.get("Validate your e-mail address to enable votes."));
      }
      return this.app.client.sendRequest({
        name: "toggle_like",
        project: project.id
      }, (msg) => {
        if (msg.name === "project_likes") {
          project.likes = msg.likes;
          project.liked = msg.liked;
          return this.createProjectLikesButton(element, project);
        }
      });
    });
  }

};
