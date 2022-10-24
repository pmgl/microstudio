var App, app;

app = null;

window.addEventListener("load", function() {
  return app = new App();
});

App = class App {
  constructor() {
    this.languages = {
      microscript2: LANGUAGE_MICROSCRIPT2,
      microscript: LANGUAGE_MICROSCRIPT,
      python: LANGUAGE_PYTHON,
      javascript: LANGUAGE_JAVASCRIPT,
      lua: LANGUAGE_LUA
    };
    this.translator = new Translator(this);
    this.app_state = new AppState(this);
    this.appui = new AppUI(this);
    this.explore = new Explore(this);
    this.client = new Client(this);
    this.user_progress = new UserProgress(this);
    this.about = new About(this);
    this.documentation = new Documentation(this);
    this.editor = new Editor(this);
    this.doc_editor = new DocEditor(this);
    this.sprite_editor = new SpriteEditor(this);
    this.map_editor = new MapEditor(this);
    this.assets_manager = new AssetsManager(this);
    this.audio_controller = new AudioController(this);
    this.sound_editor = new SoundEditor(this);
    this.music_editor = new MusicEditor(this);
    this.runwindow = new RunWindow(this);
    this.debug = new Debug(this);
    this.options = new Options(this);
    this.tab_manager = new TabManager(this);
    this.lib_manager = new LibManager(this);
    this.sync = new Sync(this);
    this.publish = new Publish(this);
    this.user_settings = new UserSettings(this);
    this.connected = false;
    this.tutorial = new TutorialWindow(this);
    this.tutorials = new Tutorials(this);
    this.client.start();
  }

  setToken(token, username) {
    this.token = token;
    this.username = username;
    return this.client.setToken(this.token);
  }

  createGuest() {
    return this.client.sendRequest({
      name: "create_guest",
      language: window.navigator.language != null ? window.navigator.language.substring(0, 2) : "en"
    }, (msg) => {
      switch (msg.name) {
        case "error":
          console.error(msg.error);
          if (msg.error != null) {
            return alert(this.translator.get(msg.error));
          }
          break;
        case "guest_created":
          this.setToken(msg.token);
          this.nick = msg.nick;
          this.user = {
            nick: msg.nick,
            flags: msg.flags,
            settings: msg.settings,
            info: msg.info
          };
          this.connected = true;
          return this.userConnected(msg.nick);
      }
    });
  }

  createAccount(nick, email, password, newsletter) {
    return this.client.sendRequest({
      name: "create_account",
      nick: nick,
      email: email,
      password: password,
      newsletter: newsletter,
      language: window.navigator.language != null ? window.navigator.language.substring(0, 2) : "en"
    }, (msg) => {
      switch (msg.name) {
        case "error":
          console.error(msg.error);
          if (msg.error != null) {
            return alert(this.translator.get(msg.error));
          }
          break;
        case "account_created":
          this.setToken(msg.token);
          this.nick = nick;
          this.user = {
            nick: msg.nick,
            email: msg.email,
            flags: msg.flags,
            settings: msg.settings,
            info: msg.info
          };
          this.connected = true;
          return this.userConnected(nick);
      }
    });
  }

  login(nick, password) {
    return this.client.sendRequest({
      name: "login",
      nick: nick,
      password: password
    }, (msg) => {
      var i, len, n, ref;
      switch (msg.name) {
        case "error":
          console.error(msg.error);
          if (msg.error != null) {
            return alert(this.translator.get(msg.error));
          }
          break;
        case "logged_in":
          this.setToken(msg.token);
          this.nick = msg.nick;
          this.user = {
            nick: msg.nick,
            email: msg.email,
            flags: msg.flags,
            settings: msg.settings,
            info: msg.info
          };
          if ((msg.notifications != null) && msg.notifications.length > 0) {
            ref = msg.notifications;
            for (i = 0, len = ref.length; i < len; i++) {
              n = ref[i];
              this.appui.showNotification(n);
            }
          }
          this.connected = true;
          this.userConnected(msg.nick);
          return this.appui.showNotification(this.translator.get("Welcome back!"));
      }
    });
  }

  sendPasswordRecovery(email) {
    if (!RegexLib.email.test(email)) {
      return alert(this.translator.get("incorrect email"));
    } else {
      return this.client.sendRequest({
        name: "send_password_recovery",
        email: email
      }, (msg) => {
        document.getElementById("forgot-password-panel").innerHTML = this.translator.get("Thank you. Please check your mail.");
        return setTimeout((() => {
          return this.appui.hide("login-overlay");
        }), 5000);
      });
    }
  }

  createProject(title, slug, options, callback) {
    if ((options != null) && typeof options === "function" && (callback == null)) {
      callback = options;
      options = {
        language: "microscript_v2"
      };
    }
    return this.client.sendRequest({
      name: "create_project",
      title: title,
      slug: slug,
      type: options.type,
      graphics: options.graphics,
      language: options.language,
      networking: options.networking,
      libs: options.libs
    }, (msg) => {
      switch (msg.name) {
        case "error":
          console.error(msg.error);
          if (msg.error != null) {
            alert(this.translator.get(msg.error));
          }
          break;
        case "project_created":
          this.getProjectList((list) => {
            var i, len, p, results;
            this.projects = list;
            this.appui.updateProjects();
            results = [];
            for (i = 0, len = list.length; i < len; i++) {
              p = list[i];
              if (p.id === msg.id) {
                this.openProject(p);
                if (callback != null) {
                  results.push(callback());
                } else {
                  results.push(void 0);
                }
              } else {
                results.push(void 0);
              }
            }
            return results;
          });
      }
    });
  }

  importProject(file) {
    var reader;
    if (this.importing) {
      return;
    }
    console.info(`importing ${file.name}`);
    reader = new FileReader();
    reader.addEventListener("load", () => {
      // return if not reader.result.startsWith("data:application/x-zip-compressed;base64,")
      // mime-type returned by browser may vary ; let's just check ZIP extension
      if (!file.name.toLowerCase().endsWith(".zip")) {
        return;
      }
      this.importing = true;
      return this.client.sendUpload({
        name: "import_project"
      }, reader.result, ((msg) => {
        console.log(`[ZIP] ${msg.name}`);
        switch (msg.name) {
          case "error":
            this.appui.showNotification(this.translator.get(msg.error));
            this.appui.resetImportButton();
            return this.importing = false;
          case "project_imported":
            this.updateProjectList(msg.id);
            this.appui.showNotification(this.translator.get("Project imported successfully"));
            this.appui.resetImportButton();
            this.importing = false;
            this.tab_manager.resetPlugins();
            return this.lib_manager.resetLibs();
        }
      }), (progress) => {
        return this.appui.setImportProgress(progress);
      });
    });
    return reader.readAsArrayBuffer(file);
  }

  updateProjectList(open_when_fetched) {
    return this.getProjectList((list) => {
      var i, len, p, ref, results;
      this.projects = list;
      this.appui.updateProjects();
      if (open_when_fetched != null) {
        ref = this.projects;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          p = ref[i];
          if (p.id === open_when_fetched) {
            this.openProject(p);
            break;
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    });
  }

  getProjectList(callback) {
    return this.client.sendRequest({
      name: "get_project_list"
    }, (msg) => {
      if (callback != null) {
        return callback(msg.list);
      }
    });
  }

  openProject(project, useraction = true) {
    var t, tuto;
    this.project = new Project(this, project);
    this.appui.setProject(this.project, useraction);
    this.editor.setCode("");
    this.editor.projectOpened();
    this.sprite_editor.projectOpened();
    this.map_editor.projectOpened();
    this.sound_editor.projectOpened();
    this.music_editor.projectOpened();
    this.assets_manager.projectOpened();
    this.runwindow.projectOpened();
    this.debug.projectOpened();
    this.options.projectOpened();
    this.tab_manager.projectOpened();
    this.lib_manager.projectOpened();
    this.sync.projectOpened();
    this.publish.loadProject(this.project);
    this.project.load();
    if (!this.tutorial.shown) {
      tuto = this.getProjectTutorial(project.slug);
      if (tuto != null) {
        t = new Tutorial(tuto);
        return t.load(() => {
          return this.tutorial.start(t);
        });
      }
    }
  }

  deleteProject(project) {
    if (project.owner.nick === this.nick) {
      return this.client.sendRequest({
        name: "delete_project",
        project: project.id
      }, (msg) => {
        return this.updateProjectList();
      });
    } else {
      return this.client.sendRequest({
        name: "remove_project_user",
        project: project.id,
        user: this.nick
      });
    }
  }

  projectTitleExists(title) {
    var i, len, p, ref;
    if (!this.projects) {
      return false;
    }
    ref = this.projects;
    for (i = 0, len = ref.length; i < len; i++) {
      p = ref[i];
      if (p.title === title) {
        return true;
      }
    }
    return false;
  }

  cloneProject(project) {
    var count, title;
    title = project.title + ` (${this.translator.get("copy")})`;
    count = 1;
    while (this.projectTitleExists(title)) {
      count += 1;
      title = project.title + ` (${this.translator.get("copy")} ${count})`;
    }
    return this.client.sendRequest({
      name: "clone_project",
      project: project.id,
      title: title
    }, (msg) => {
      this.appui.setMainSection("projects");
      this.appui.backToProjectList();
      this.updateProjectList();
      return this.appui.showNotification(this.translator.get("Project cloned! Here is your copy."));
    });
  }

  writeProjectFile(project_id, file, content, callback) {
    return this.client.sendRequest({
      name: "write_project_file",
      project: project_id,
      file: file,
      content: content
    }, (msg) => {});
  }

  readProjectFile(project_id, file, callback) {
    return this.client.sendRequest({
      name: "read_project_file",
      project: project_id,
      file: file
    }, (msg) => {
      return callback(msg.content);
    });
  }

  //listProjectFiles:(project_id,folder,callback)->
  //  @client.sendRequest {
  //    name:"list_project_files"
  //    project: project_id
  //    folder: folder
  //  },(msg)=>
  //    callback msg.content
  userConnected(nick) {
    this.appui.userConnected(nick);
    this.updateProjectList();
    this.user_settings.update();
    return this.user_progress.init();
  }

  disconnect() {
    if ((this.user.email == null) || this.user.flags.guest) {
      return this.client.sendRequest({
        name: "delete_guest"
      }, (msg) => {
        this.setToken(null);
        return location.reload();
      });
    } else {
      this.setToken(null);
      return location.reload();
    }
  }

  fetchPublicProjects() {
    return this.client.sendRequest({
      name: "get_public_projects",
      ranking: "hot",
      tags: []
    }, (msg) => {});
  }

  serverMessage(msg) {
    switch (msg.name) {
      case "project_user_list":
        return this.updateProjectUserList(msg);
      case "project_list":
        this.projects = msg.list;
        return this.appui.updateProjects();
      case "project_file_locked":
        if ((this.project != null) && msg.project === this.project.id) {
          return this.project.fileLocked(msg);
        }
        break;
      case "project_file_update":
        if ((this.project != null) && msg.project === this.project.id) {
          return this.project.fileUpdated(msg);
        }
        break;
      case "project_file_deleted":
        if ((this.project != null) && msg.project === this.project.id) {
          return this.project.fileDeleted(msg);
        }
        break;
      case "project_options_updated":
        if ((this.project != null) && msg.project === this.project.id) {
          this.project.optionsUpdated(msg);
          this.options.projectOpened();
          this.tab_manager.projectOpened();
          return this.lib_manager.projectOpened();
        }
        break;
      case "user_stats":
        if (this.user != null) {
          this.user.info.stats = msg.stats;
          this.user_progress.update();
          return this.user_progress.updateStatsPage();
        }
        break;
      case "achievements":
        if (this.user != null) {
          this.user.info.achievements = msg.achievements;
          return this.user_progress.checkAchievements();
        }
    }
  }

  updateProjectUserList(msg) {
    if ((this.project != null) && msg.project === this.project.id) {
      this.project.users = msg.users;
      return this.options.updateUserList();
    }
  }

  getUserSetting(setting) {
    if ((this.user != null) && (this.user.settings != null)) {
      return this.user.settings[setting];
    } else {
      return null;
    }
  }

  setUserSetting(setting, value) {
    if (this.user != null) {
      if (this.user.settings == null) {
        this.user.settings = {};
      }
      this.user.settings[setting] = value;
      return this.client.sendRequest({
        name: "set_user_setting",
        setting: setting,
        value: value
      }, (msg) => {});
    }
  }

  setTutorialProgress(tutorial_id, progress) {
    var tutorial_progress;
    tutorial_progress = this.getUserSetting("tutorial_progress");
    if (tutorial_progress == null) {
      tutorial_progress = {};
    }
    tutorial_progress[tutorial_id] = progress;
    return this.setUserSetting("tutorial_progress", tutorial_progress);
  }

  getTutorialProgress(tutorial_id) {
    var tutorial_progress;
    tutorial_progress = this.getUserSetting("tutorial_progress");
    if (tutorial_progress == null) {
      return 0;
    } else {
      return tutorial_progress[tutorial_id] || 0;
    }
  }

  setProjectTutorial(project_slug, tutorial_id) {
    var project_tutorial;
    project_tutorial = this.getUserSetting("project_tutorial");
    if (project_tutorial == null) {
      project_tutorial = {};
    }
    project_tutorial[project_slug] = tutorial_id;
    return this.setUserSetting("project_tutorial", project_tutorial);
  }

  getProjectTutorial(slug) {
    var project_tutorial;
    project_tutorial = this.getUserSetting("project_tutorial");
    if (project_tutorial == null) {
      return null;
    } else {
      return project_tutorial[slug];
    }
  }

  setHomeState() {
    if (this.translator.lang !== "en") {
      return history.replaceState(null, "microStudio", `/${this.translator.lang}/`);
    } else {
      return history.replaceState(null, "microStudio", "/");
    }
  }

  setState(state) {}

  getTierName(tier) {
    switch (tier) {
      case "pixel_master":
        return "Pixel Master";
      case "code_ninja":
        return "Code Ninja";
      case "gamedev_lord":
        return "Gamedev Lord";
      case "founder":
        return "Founder";
      case "sponsor":
        return "Sponsor";
      default:
        return "Standard";
    }
    return "";
  }

  openUserSettings() {
    this.appui.setMainSection("usersettings");
    this.user_settings.setSection("settings");
    return this.app_state.pushState("user.settings", "/user/settings/");
  }

  openUserProfile() {
    this.appui.setMainSection("usersettings");
    this.user_settings.setSection("profile");
    return this.app_state.pushState("user.profile", "/user/profile/");
  }

  openUserProgress() {
    this.appui.setMainSection("usersettings");
    this.user_settings.setSection("progress");
    return this.app_state.pushState("user.progress", "/user/progress/");
  }

};

if (navigator.serviceWorker != null) {
  navigator.serviceWorker.register("/app_sw.js", {
    scope: location.pathname
  }).then(function(reg) {
    return console.log('Registration succeeded. Scope is' + reg.scope);
  }).catch(function(error) {
    return console.log('Registration failed with' + error);
  });
}
