var TutorialsPage;

TutorialsPage = class TutorialsPage {
  constructor(tutorials) {
    this.tutorials = tutorials;
    this.app = this.tutorials.app;
    this.sections = ["core", "community", "examples"];
    this.initSections();
    this.setSection(this.sections[0], false);
    this.search = "";
    document.querySelector("#tutorials-example-view-topbar i").addEventListener("click", () => {
      this.closeExampleView();
      return this.pushState();
    });
    document.getElementById("example-search-input").addEventListener("input", () => {
      this.search = document.getElementById("example-search-input").value;
      return this.planExamplesUpdate();
    });
    document.querySelector("#tutorials-content-examples .project-search-bar select").addEventListener("change", () => {
      return this.planExamplesUpdate();
    });
  }

  planExamplesUpdate() {
    if (this.search_timeout != null) {
      clearTimeout(this.search_timeout);
    }
    this.search_timeout = setTimeout((() => {
      return this.queryExamples(0, (list) => {
        return this.displayExamples(list);
      });
    }), 1500);
    return document.querySelector("#tutorials-examples-list").style.opacity = .25;
  }

  initSections() {
    var j, len, ref, results, s;
    ref = this.sections;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      results.push(((s) => {
        return document.getElementById(`tutorials-${s}`).addEventListener("click", () => {
          if (window.ms_standalone) {
            if (s === "community") {
              return window.open("https://microstudio.dev/tutorials/community/", "_blank");
            } else if (s === "examples") {
              return window.open("https://microstudio.dev/tutorials/examples/", "_blank");
            }
          } else {
            return this.setSection(s);
          }
        });
      })(s));
    }
    return results;
  }

  pushState() {
    if (this.current === "core") {
      return this.app.app_state.pushState("tutorials", "/tutorials/");
    } else {
      if (this.current === "examples" && (this.current_project != null)) {
        return this.app.app_state.pushState(`tutorials.${this.current}.${this.current_project.owner}.${this.current_project.slug}`, `/tutorials/${this.current}/${this.current_project.owner}/${this.current_project.slug}/`);
      } else {
        return this.app.app_state.pushState(`tutorials.${this.current}`, `/tutorials/${this.current}/`);
      }
    }
  }

  setSection(section, push_state = true) {
    var j, len, ref, s;
    console.info(section);
    this.current = section;
    if (push_state) {
      this.pushState();
    }
    ref = this.sections;
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      if (s === section) {
        document.getElementById(`tutorials-${s}`).classList.add("selected");
        document.getElementById(`tutorials-content-${s}`).style.display = "block";
      } else {
        document.getElementById(`tutorials-${s}`).classList.remove("selected");
        document.getElementById(`tutorials-content-${s}`).style.display = "none";
      }
    }
    if (section === "community") {
      return this.updateCommunity();
    } else if (section === "examples") {
      return this.updateExamples();
    }
  }

  queryExamples(offset = 0, callback, list = []) {
    var language;
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
    }, (msg) => {
      if (msg.list.length === 0) {
        if (callback != null) {
          return callback(list);
        }
      } else {
        list = list.concat(msg.list);
        return this.queryExamples(msg.offset, callback, list);
      }
    });
  }

  fetchAll(type, offset = 0, callback, list = []) {
    return this.app.client.sendRequest({
      name: "get_public_projects",
      ranking: "hot",
      type: type,
      tags: [],
      search: "", //@search.toLowerCase()
      position: 0,
      offset: offset
    }, (msg) => {
      if (msg.list.length === 0) {
        return callback(list);
      } else {
        list = list.concat(msg.list);
        return this.fetchAll(type, msg.offset, callback, list);
      }
    });
  }

  createProjectBox(p) {
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
      icon.src = `${run_domain}/${p.owner}/${p.slug}/sprites/icon.png`;
    } else {
      icon.src = `${dev_domain}/img/lightbulb16.png`;
    }
    icon.classList.add("pixelated");
    div.appendChild(icon);
    i = document.createElement("i");
    i.classList.add("fa");
    i.classList.add("fa-play");
    div.appendChild(title);
    div.appendChild(i);
    return div;
  }

  updateCommunity() {
    var parent;
    parent = document.getElementById("tutorials-content-community");
    parent.innerHTML = "";
    return this.fetchAll("tutorial", 0, (list) => {
      var box, j, len, p, results;
      results = [];
      for (j = 0, len = list.length; j < len; j++) {
        p = list[j];
        box = this.createProjectBox(p);
        if (box) {
          parent.appendChild(box);
          results.push(((p) => {
            return box.addEventListener("click", () => {
              return window.open(dev_domain + `/tutorial/${p.owner}/${p.slug}/`, "_blank");
            });
          })(p));
        } else {
          results.push(void 0);
        }
      }
      return results;
    });
  }

  updateExamples() {
    return this.queryExamples(0, (list) => {
      return this.displayExamples(list);
    });
  }

  displayExamples(list) {
    var box, j, len, p, parent;
    parent = document.getElementById("tutorials-examples-list");
    parent.innerHTML = "";
    parent.style.opacity = 1;
    for (j = 0, len = list.length; j < len; j++) {
      p = list[j];
      box = this.createProjectBox(p);
      if (box) {
        parent.appendChild(box);
        ((p, box) => {
          return box.addEventListener("click", () => {
            this.current_project = {
              owner: p.owner,
              slug: p.slug
            };
            this.loadExample(p);
            this.openExampleView();
            return this.pushState();
          });
        })(p, box);
      }
    }
  }

  reloadExample(owner, slug) {
    return this.app.client.sendRequest({
      name: "get_public_project",
      owner: owner,
      project: slug
    }, (msg) => {
      var project;
      project = msg.project;
      if (project != null) {
        this.loadExample(project);
        this.openExampleView();
        return this.current_project = {
          owner: project.owner,
          slug: project.slug
        };
      }
    });
  }

  openExampleView() {
    document.getElementById("tutorials-examples-list").style.display = "none";
    document.querySelector("#tutorials-content-examples .project-search-bar").style.display = "none";
    document.getElementById("tutorials-examples-view").style.display = "block";
    return document.getElementById("tutorials-example-view-topbar").style.display = "block";
  }

  closeExampleView() {
    var device;
    document.getElementById("tutorials-examples-list").style.display = "block";
    document.querySelector("#tutorials-content-examples .project-search-bar").style.display = "block";
    document.getElementById("tutorials-examples-view").style.display = "none";
    document.getElementById("tutorials-example-view-topbar").style.display = "none";
    device = document.getElementById("tutorials-examples-run");
    device.innerHTML = "";
    return delete this.current_project;
  }

  loadExample(project) {
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
        useWorker: false // disables lua autocorrection ; preserves syntax coloring
      });
      this.examples_editor.getSession().on("change", () => {
        return this.codeEdited();
      });
    }
    if (project.icon) {
      icon = run_domain + `/${project.owner}/${project.slug}/sprites/icon.png`;
    } else {
      icon = `${dev_domain}/img/lightbulb16.png`;
    }
    document.querySelector("#tutorials-example-view-topbar img").src = icon;
    document.querySelector("#tutorials-example-view-topbar span").innerText = project.title;
    this.app.appui.createProjectLikesButton(document.getElementById("tutorials-example-view-topbar"), project);
    return this.app.client.sendRequest({
      name: "list_public_project_files",
      project: project.id,
      folder: "ms"
    }, (msg) => {
      var device, origin, url;
      this.setSourceList(msg.files, project);
      this.examples_splitbar.update();
      this.examples_code_splitbar.update();
      this.examples_splitbar.update();
      device = document.getElementById("tutorials-examples-run");
      origin = run_domain;
      url = `${run_domain}/${project.owner}/${project.slug}/`;
      device.innerHTML = `<iframe id='exampleiframe' allow='autoplay ${origin}; gamepad ${origin}; midi ${origin}; camera ${origin}; microphone ${origin}' src='${url}?debug'></iframe><i class='fas fa-redo'></i>`;
      return device.querySelector("i").addEventListener("click", () => {
        return this.postMessage({
          name: "command",
          line: "init()"
        });
      });
    });
  }

  setSelectedSource(file) {
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
  }

  setSourceList(files, project) {
    var f, folder, j, len, manager, s, table, view;
    table = {};
    manager = {
      folder: "ms",
      item: "source",
      openItem: (item) => {
        return this.setSelectedSource(item);
      }
    };
    this.project_sources = {};
    this.sources = {};
    project = JSON.parse(JSON.stringify(project)); // create a clone
    project.app = this.app;
    project.notifyListeners = (source) => {
      this.sources[source.name] = source.content;
      if (this.selected_source == null) {
        return this.setSelectedSource(source.name);
      }
    };
    project.getFullURL = function() {
      var url;
      return url = location.origin + `/${project.owner}/${project.slug}/`;
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
  }

  codeEdited() {
    if (this.selected_source) {
      return this.updateCode(this.selected_source + ".ms", this.examples_editor.getValue());
    }
  }

  updateCode(file, src) {
    return this.postMessage({
      name: "code_updated",
      file: file,
      code: src
    });
  }

  postMessage(data) {
    var iframe;
    iframe = document.getElementById("exampleiframe");
    if (iframe != null) {
      return iframe.contentWindow.postMessage(JSON.stringify(data), "*");
    }
  }

};
