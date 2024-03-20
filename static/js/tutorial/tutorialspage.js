var TutorialsPage;

TutorialsPage = (function() {
  function TutorialsPage(tutorials) {
    this.tutorials = tutorials;
    this.app = this.tutorials.app;
    this.sections = ["core", "community", "examples"];
    this.initSections();
    this.setSection(this.sections[0], false);
    this.search = "";
    document.querySelector("#tutorials-example-view-topbar i").addEventListener("click", (function(_this) {
      return function() {
        _this.closeExampleView();
        return _this.pushState();
      };
    })(this));
    document.getElementById("example-search-input").addEventListener("input", (function(_this) {
      return function() {
        _this.search = document.getElementById("example-search-input").value;
        return _this.planExamplesUpdate();
      };
    })(this));
    document.querySelector("#tutorials-content-examples .project-search-bar select").addEventListener("change", (function(_this) {
      return function() {
        return _this.planExamplesUpdate();
      };
    })(this));
  }

  TutorialsPage.prototype.planExamplesUpdate = function() {
    if (this.search_timeout != null) {
      clearTimeout(this.search_timeout);
    }
    this.search_timeout = setTimeout(((function(_this) {
      return function() {
        return _this.queryExamples(0, function(list) {
          return _this.displayExamples(list);
        });
      };
    })(this)), 1500);
    return document.querySelector("#tutorials-examples-list").style.opacity = .25;
  };

  TutorialsPage.prototype.initSections = function() {
    var j, len, ref, results, s;
    ref = this.sections;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      results.push((function(_this) {
        return function(s) {
          return document.getElementById("tutorials-" + s).addEventListener("click", function() {
            if (window.ms_standalone) {
              if (s === "community") {
                return window.open("https://microstudio.dev/tutorials/community/", "_blank");
              } else if (s === "examples") {
                return window.open("https://microstudio.dev/tutorials/examples/", "_blank");
              }
            } else {
              return _this.setSection(s);
            }
          });
        };
      })(this)(s));
    }
    return results;
  };

  TutorialsPage.prototype.pushState = function() {
    if (this.current === "core") {
      return this.app.app_state.pushState("tutorials", "/tutorials/");
    } else {
      if (this.current === "examples" && (this.current_project != null)) {
        return this.app.app_state.pushState("tutorials." + this.current + "." + this.current_project.owner + "." + this.current_project.slug, "/tutorials/" + this.current + "/" + this.current_project.owner + "/" + this.current_project.slug + "/");
      } else {
        return this.app.app_state.pushState("tutorials." + this.current, "/tutorials/" + this.current + "/");
      }
    }
  };

  TutorialsPage.prototype.setSection = function(section, push_state) {
    var j, len, ref, s;
    if (push_state == null) {
      push_state = true;
    }
    console.info(section);
    this.current = section;
    if (push_state) {
      this.pushState();
    }
    ref = this.sections;
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      if (s === section) {
        document.getElementById("tutorials-" + s).classList.add("selected");
        document.getElementById("tutorials-content-" + s).style.display = "block";
      } else {
        document.getElementById("tutorials-" + s).classList.remove("selected");
        document.getElementById("tutorials-content-" + s).style.display = "none";
      }
    }
    if (section === "community") {
      return this.updateCommunity();
    } else if (section === "examples") {
      return this.updateExamples();
    }
  };

  TutorialsPage.prototype.queryExamples = function(offset, callback, list) {
    var language;
    if (offset == null) {
      offset = 0;
    }
    if (list == null) {
      list = [];
    }
    language = document.querySelector("#tutorials-content-examples .project-search-bar select").value.toLowerCase();
    return this.app.client.sendRequest({
      name: "get_public_projects",
      ranking: "hot",
      type: "example",
      language: language,
      tags: [],
      search: this.search.toLowerCase(),
      position: 0,
      offset: offset
    }, (function(_this) {
      return function(msg) {
        if (msg.list.length === 0) {
          if (callback != null) {
            return callback(list);
          }
        } else {
          list = list.concat(msg.list);
          return _this.queryExamples(msg.offset, callback, list);
        }
      };
    })(this));
  };

  TutorialsPage.prototype.fetchAll = function(type, offset, callback, list) {
    if (offset == null) {
      offset = 0;
    }
    if (list == null) {
      list = [];
    }
    return this.app.client.sendRequest({
      name: "get_public_projects",
      ranking: "hot",
      type: type,
      tags: [],
      search: "",
      position: 0,
      offset: offset
    }, (function(_this) {
      return function(msg) {
        if (msg.list.length === 0) {
          return callback(list);
        } else {
          list = list.concat(msg.list);
          return _this.fetchAll(type, msg.offset, callback, list);
        }
      };
    })(this));
  };

  TutorialsPage.prototype.createProjectBox = function(p) {
    var div, i, icon, title;
    console.info(p);
    if (!p.flags.approved && !p.owner_info.approved && window.ms_project_moderation) {
      return null;
    }
    div = document.createElement("div");
    div.classList.add("launch-project-box");
    title = document.createElement("div");
    title.innerText = p.title;
    icon = new Image;
    if (p.icon) {
      icon.src = run_domain + "/" + p.owner + "/" + p.slug + "/sprites/icon.png";
    } else {
      icon.src = dev_domain + "/img/lightbulb16.png";
    }
    icon.classList.add("pixelated");
    div.appendChild(icon);
    i = document.createElement("i");
    i.classList.add("fa");
    i.classList.add("fa-play");
    div.appendChild(title);
    div.appendChild(i);
    return div;
  };

  TutorialsPage.prototype.updateCommunity = function() {
    var parent;
    parent = document.getElementById("tutorials-content-community");
    parent.innerHTML = "";
    return this.fetchAll("tutorial", 0, (function(_this) {
      return function(list) {
        var box, j, len, p, results;
        results = [];
        for (j = 0, len = list.length; j < len; j++) {
          p = list[j];
          box = _this.createProjectBox(p);
          if (box) {
            parent.appendChild(box);
            results.push((function(p) {
              return box.addEventListener("click", function() {
                return window.open(dev_domain + ("/tutorial/" + p.owner + "/" + p.slug + "/"), "_blank");
              });
            })(p));
          } else {
            results.push(void 0);
          }
        }
        return results;
      };
    })(this));
  };

  TutorialsPage.prototype.updateExamples = function() {
    return this.queryExamples(0, (function(_this) {
      return function(list) {
        return _this.displayExamples(list);
      };
    })(this));
  };

  TutorialsPage.prototype.displayExamples = function(list) {
    var box, j, len, p, parent;
    parent = document.getElementById("tutorials-examples-list");
    parent.innerHTML = "";
    parent.style.opacity = 1;
    for (j = 0, len = list.length; j < len; j++) {
      p = list[j];
      box = this.createProjectBox(p);
      if (box) {
        parent.appendChild(box);
        (function(_this) {
          return (function(p, box) {
            return box.addEventListener("click", function() {
              _this.current_project = {
                owner: p.owner,
                slug: p.slug
              };
              _this.loadExample(p);
              _this.openExampleView();
              return _this.pushState();
            });
          });
        })(this)(p, box);
      }
    }
  };

  TutorialsPage.prototype.reloadExample = function(owner, slug) {
    return this.app.client.sendRequest({
      name: "get_public_project",
      owner: owner,
      project: slug
    }, (function(_this) {
      return function(msg) {
        var project;
        project = msg.project;
        if (project != null) {
          _this.loadExample(project);
          _this.openExampleView();
          return _this.current_project = {
            owner: project.owner,
            slug: project.slug
          };
        }
      };
    })(this));
  };

  TutorialsPage.prototype.openExampleView = function() {
    document.getElementById("tutorials-examples-list").style.display = "none";
    document.querySelector("#tutorials-content-examples .project-search-bar").style.display = "none";
    document.getElementById("tutorials-examples-view").style.display = "block";
    return document.getElementById("tutorials-example-view-topbar").style.display = "block";
  };

  TutorialsPage.prototype.closeExampleView = function() {
    var device;
    document.getElementById("tutorials-examples-list").style.display = "block";
    document.querySelector("#tutorials-content-examples .project-search-bar").style.display = "block";
    document.getElementById("tutorials-examples-view").style.display = "none";
    document.getElementById("tutorials-example-view-topbar").style.display = "none";
    device = document.getElementById("tutorials-examples-run");
    device.innerHTML = "";
    return delete this.current_project;
  };

  TutorialsPage.prototype.loadExample = function(project) {
    var icon;
    delete this.selected_source;
    if (!this.examples_initialized) {
      this.examples_initialized = true;
      this.examples_splitbar = new SplitBar("tutorials-examples-view", "horizontal");
      this.examples_splitbar.auto = 1;
      this.examples_code_splitbar = new SplitBar("tutorials-examples-code", "horizontal");
      this.examples_code_splitbar.auto = .5;
      this.examples_code_splitbar.position = 20;
      this.examples_editor = ace.edit("tutorials-examples-code-editor");
      this.examples_editor.$blockScrolling = 2e308;
      this.examples_editor.setTheme("ace/theme/tomorrow_night_bright");
      this.examples_editor.getSession().setMode("ace/mode/microscript2");
      this.examples_editor.getSession().setOptions({
        tabSize: 2,
        useSoftTabs: true,
        useWorker: false
      });
      this.examples_editor.getSession().on("change", (function(_this) {
        return function() {
          return _this.codeEdited();
        };
      })(this));
    }
    if (project.icon) {
      icon = run_domain + ("/" + project.owner + "/" + project.slug + "/sprites/icon.png");
    } else {
      icon = dev_domain + "/img/lightbulb16.png";
    }
    document.querySelector("#tutorials-example-view-topbar img").src = icon;
    document.querySelector("#tutorials-example-view-topbar span").innerText = project.title;
    this.app.appui.createProjectLikesButton(document.getElementById("tutorials-example-view-topbar"), project);
    return this.app.client.sendRequest({
      name: "list_public_project_files",
      project: project.id,
      folder: "ms"
    }, (function(_this) {
      return function(msg) {
        var device, origin, url;
        _this.setSourceList(msg.files, project);
        _this.examples_splitbar.update();
        _this.examples_code_splitbar.update();
        _this.examples_splitbar.update();
        device = document.getElementById("tutorials-examples-run");
        origin = run_domain;
        url = run_domain + "/" + project.owner + "/" + project.slug + "/";
        device.innerHTML = "<iframe id='exampleiframe' allow='autoplay " + origin + "; gamepad " + origin + "; midi " + origin + "; camera " + origin + "; microphone " + origin + "' src='" + url + "?debug'></iframe><i class='fas fa-redo'></i>";
        return device.querySelector("i").addEventListener("click", function() {
          return _this.postMessage({
            name: "command",
            line: "init()"
          });
        });
      };
    })(this));
  };

  TutorialsPage.prototype.setSelectedSource = function(file) {
    var lang, source;
    this.selected_source = file;
    this.source_folder.setSelectedItem(file);
    source = this.project_sources[file];
    if ((source != null) && (source.parent != null)) {
      source.parent.setOpen(true);
    }
    if ((this.project != null) && (this.project.language != null)) {
      lang = this.project.language;
      if (lang === "microscript_v2" && (this.sources[file] != null) && /^\s*\/\/\s*javascript\s*\n/.test(this.sources[file])) {
        lang = "javascript";
      }
      lang = this.app.languages[lang] || this.app.languages["microscript2"];
      this.examples_editor.getSession().setMode(lang.ace_mode);
    }
    return this.examples_editor.setValue(this.sources[file], -1);
  };

  TutorialsPage.prototype.setSourceList = function(files, project) {
    var f, folder, j, len, manager, s, table, view;
    table = {};
    manager = {
      folder: "ms",
      item: "source",
      openItem: (function(_this) {
        return function(item) {
          return _this.setSelectedSource(item);
        };
      })(this)
    };
    this.project_sources = {};
    this.sources = {};
    project = JSON.parse(JSON.stringify(project));
    project.app = this.app;
    project.notifyListeners = (function(_this) {
      return function(source) {
        _this.sources[source.name] = source.content;
        if (_this.selected_source == null) {
          return _this.setSelectedSource(source.name);
        }
      };
    })(this);
    project.getFullURL = function() {
      var url;
      return url = location.origin + ("/" + project.owner + "/" + project.slug + "/");
    };
    folder = new ProjectFolder(null, "source");
    for (j = 0, len = files.length; j < len; j++) {
      f = files[j];
      s = new ExploreProjectSource(project, f.file);
      this.project_sources[s.name] = s;
      folder.push(s);
      table[s.name] = s;
    }
    view = new FolderView(manager, document.querySelector("#tutorials-examples-code-files"));
    this.source_folder = view;
    view.editable = false;
    view.rebuildList(folder);
    this.project = project;
  };

  TutorialsPage.prototype.codeEdited = function() {
    if (this.selected_source) {
      return this.updateCode(this.selected_source + ".ms", this.examples_editor.getValue());
    }
  };

  TutorialsPage.prototype.updateCode = function(file, src) {
    return this.postMessage({
      name: "code_updated",
      file: file,
      code: src
    });
  };

  TutorialsPage.prototype.postMessage = function(data) {
    var iframe;
    iframe = document.getElementById("exampleiframe");
    if (iframe != null) {
      return iframe.contentWindow.postMessage(JSON.stringify(data), "*");
    }
  };

  return TutorialsPage;

})();
