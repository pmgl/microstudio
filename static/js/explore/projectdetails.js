this.ProjectDetails = class ProjectDetails {
  constructor(app) {
    var j, len, ref, s;
    this.app = app;
    this.menu = ["code", "sprites", "sounds", "music", "assets", "doc"];
    ref = this.menu;
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      ((s) => {
        return document.getElementById(`project-contents-menu-${s}`).addEventListener("click", () => {
          return this.setSection(s);
        });
      })(s);
    }
    this.splitbar = new SplitBar("explore-project-details", "horizontal");
    this.splitbar.setPosition(45);
    this.editor = ace.edit("project-contents-view-editor");
    this.editor.$blockScrolling = 2e308;
    this.editor.setTheme("ace/theme/tomorrow_night_bright");
    this.editor.getSession().setMode("ace/mode/microscript");
    this.editor.setReadOnly(true);
    this.editor.getSession().setOptions({
      tabSize: 2,
      useSoftTabs: true,
      useWorker: false // disables lua autocorrection ; preserves syntax coloring
    });
    document.querySelector("#project-contents-source-import").addEventListener("click", () => {
      var count, file, name;
      if (this.app.project == null) {
        return;
      }
      file = this.selected_source;
      if (file == null) {
        return;
      }
      if (this.imported_sources[file]) {
        return;
      }
      this.imported_sources[file] = true;
      name = file.split(".")[0];
      count = 1;
      while (this.app.project.getSource(name) != null) {
        count += 1;
        name = file.split(".")[0] + count;
      }
      file = name + ".ms";
      return this.app.client.sendRequest({
        name: "write_project_file",
        project: this.app.project.id,
        file: `ms/${file}`,
        content: this.sources[this.selected_source]
      }, (msg) => {
        this.app.project.updateSourceList();
        return this.setSelectedSource(this.selected_source);
      });
    });
    document.getElementById("project-contents-sprite-import").addEventListener("click", () => {
      var base, count, data, name;
      if (this.app.project == null) {
        return;
      }
      if (this.selected_sprite == null) {
        return;
      }
      name = this.selected_sprite.name;
      if (name == null) {
        return;
      }
      if (this.imported_sprites[name]) {
        return;
      }
      this.imported_sprites[name] = true;
      document.getElementById("project-contents-sprite-import").style.display = "none";
      count = 1;
      base = name;
      while (this.app.project.getSprite(name) != null) {
        count += 1;
        name = base + count;
      }
      data = this.selected_sprite.saveData().split(",")[1];
      return this.app.client.sendRequest({
        name: "write_project_file",
        project: this.app.project.id,
        file: `sprites/${name}.png`,
        properties: {
          frames: this.selected_sprite.frames.length,
          fps: this.selected_sprite.fps
        },
        content: data
      }, (msg) => {
        return this.app.project.updateSpriteList();
      });
    });
    document.querySelector("#project-contents-doc-import").addEventListener("click", () => {
      var value;
      if (this.app.project == null) {
        return;
      }
      if (this.imported_doc || (this.doc == null)) {
        return;
      }
      this.imported_doc = true;
      value = this.app.doc_editor.editor.getValue();
      if ((value != null) && value.length > 0) {
        value = value + "\n\n" + this.doc;
      } else {
        value = this.doc;
      }
      return this.app.client.sendRequest({
        name: "write_project_file",
        project: this.app.project.id,
        file: "doc/doc.md",
        content: value
      }, (msg) => {
        this.app.project.loadDoc();
        document.querySelector("#project-contents-doc-import").classList.add("done");
        document.querySelector("#project-contents-doc-import i").classList.add("fa-check");
        document.querySelector("#project-contents-doc-import i").classList.remove("fa-download");
        return document.querySelector("#project-contents-doc-import span").innerText = this.app.translator.get("Doc imported");
      });
    });
    document.getElementById("post-project-comment-button").addEventListener("click", () => {
      var text;
      text = document.querySelector("#post-project-comment textarea").value;
      if ((text != null) && text.length > 0) {
        this.postComment(text);
        return document.querySelector("#post-project-comment textarea").value = "";
      }
    });
    document.getElementById("login-to-post-comment").addEventListener("click", () => {
      return this.app.appui.showLoginPanel();
    });
    document.getElementById("validate-to-post-comment").addEventListener("click", () => {
      return this.app.appui.setMainSection("usersettings");
    });
  }

  set(project1) {
    var a, j, len, ref, ref1, section, t;
    this.project = project1;
    this.splitbar.update();
    this.sources = [];
    this.sprites = [];
    this.sounds = [];
    this.music = [];
    this.maps = [];
    this.imported_sources = {};
    this.imported_sprites = {};
    this.imported_doc = false;
    document.querySelector("#project-contents-doc-import").classList.remove("done");
    document.querySelector("#project-contents-doc-import").style.display = this.app.project != null ? "block" : "none";
    document.querySelector("#project-contents-source-import").style.display = (this.app.project != null) && this.app.project.id !== this.project.id ? "block" : "none";
    if (this.app.project != null) {
      document.querySelector("#project-contents-doc-import span").innerText = this.app.translator.get("Import doc to") + " " + this.app.project.title;
    }
    document.querySelector("#project-contents-view .code-list").innerHTML = "";
    document.querySelector("#project-contents-view .sprite-list").innerHTML = "";
    document.querySelector("#project-contents-view .sound-list").innerHTML = "";
    document.querySelector("#project-contents-view .music-list").innerHTML = "";
    document.querySelector("#project-contents-view .asset-list").innerHTML = "";
    //document.querySelector("#project-contents-view .maps").innerHTML = ""
    document.querySelector("#project-contents-view .doc-render").innerHTML = "";
    section = "code";
    ref = this.project.tags;
    for (j = 0, len = ref.length; j < len; j++) {
      t = ref[j];
      if (t.indexOf("sprite") >= 0) {
        section = "sprites";
      } else if (t.indexOf("tutorial") >= 0 || t.indexOf("tutoriel") >= 0) {
        section = "doc";
      }
    }
    if ((ref1 = this.project.type) === "tutorial" || ref1 === "library") {
      section = "doc";
    }
    this.setSection(section);
    this.sources = {};
    this.selected_source = null;
    this.app.client.sendRequest({
      name: "list_public_project_files",
      project: this.project.id,
      folder: "ms"
    }, (msg) => {
      return this.setSourceList(msg.files);
    });
    this.app.client.sendRequest({
      name: "list_public_project_files",
      project: this.project.id,
      folder: "sprites"
    }, (msg) => {
      return this.setSpriteList(msg.files);
    });
    this.app.client.sendRequest({
      name: "list_public_project_files",
      project: this.project.id,
      folder: "sounds"
    }, (msg) => {
      return this.setSoundList(msg.files);
    });
    this.app.client.sendRequest({
      name: "list_public_project_files",
      project: this.project.id,
      folder: "music"
    }, (msg) => {
      return this.setMusicList(msg.files);
    });
    this.app.client.sendRequest({
      name: "list_public_project_files",
      project: this.project.id,
      folder: "assets"
    }, (msg) => {
      return this.setAssetList(msg.files);
    });
    //@app.client.sendRequest {
    //  name: "list_public_project_files"
    //  project: @project.id
    //  folder: "maps"
    //},(msg)=>
    //  @setMapList msg.files
    this.app.client.sendRequest({
      name: "list_public_project_files",
      project: this.project.id,
      folder: "doc"
    }, (msg) => {
      return this.setDocList(msg.files);
    });
    this.updateComments();
    this.updateCredentials();
    a = document.querySelector("#project-contents-view .sprites .export-panel a");
    a.href = `/${this.project.owner}/${this.project.slug}/export/sprites/`;
    a.download = `${this.project.slug}_sprites.zip`;
    a = document.querySelector("#project-details-exportbutton");
    a.href = `/${this.project.owner}/${this.project.slug}/export/project/`;
    return a.download = `${this.project.slug}_files.zip`;
  }

  updateCredentials() {
    if (this.app.user != null) {
      document.getElementById("login-to-post-comment").style.display = "none";
      if (this.app.user.flags.validated) {
        document.getElementById("validate-to-post-comment").style.display = "none";
        return document.getElementById("post-project-comment").style.display = "block";
      } else {
        document.getElementById("validate-to-post-comment").style.display = "inline-block";
        return document.getElementById("post-project-comment").style.display = "none";
      }
    } else {
      document.getElementById("login-to-post-comment").style.display = "inline-block";
      document.getElementById("validate-to-post-comment").style.display = "none";
      return document.getElementById("post-project-comment").style.display = "none";
    }
  }

  loadFile(url, callback) {
    var req;
    req = new XMLHttpRequest();
    req.onreadystatechange = (event) => {
      if (req.readyState === XMLHttpRequest.DONE) {
        if (req.status === 200) {
          return callback(req.responseText);
        }
      }
    };
    req.open("GET", url);
    return req.send();
  }

  setSection(section) {
    var j, len, ref, s;
    ref = this.menu;
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      if (s === section) {
        document.getElementById(`project-contents-menu-${s}`).classList.add("selected");
        document.querySelector(`#project-contents-view .${s}`).style.display = "block";
      } else {
        document.getElementById(`project-contents-menu-${s}`).classList.remove("selected");
        document.querySelector(`#project-contents-view .${s}`).style.display = "none";
      }
    }
  }

  createSourceEntry(file) {
    return this.app.client.sendRequest({
      name: "read_public_project_file",
      project: this.project.id,
      file: `ms/${file}`
    }, (msg) => {
      var div;
      this.sources[file] = msg.content;
      div = document.createElement("div");
      div.innerHTML = `<i class='fa fa-file-code'></i> ${(file.split(".")[0])}`;
      document.querySelector("#project-contents-view .code-list").appendChild(div);
      div.id = `project-contents-view-source-${file}`;
      div.addEventListener("click", () => {
        return this.setSelectedSource(file);
      });
      if (this.selected_source == null) {
        return this.setSelectedSource(file);
      }
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
      this.editor.getSession().setMode(lang.ace_mode);
    }
    this.editor.setValue(this.sources[file], -1);
    if (this.app.project == null) {
      return;
    }
    if (this.imported_sources[file]) {
      document.querySelector("#project-contents-source-import").classList.add("done");
      document.querySelector("#project-contents-source-import i").classList.remove("fa-download");
      document.querySelector("#project-contents-source-import i").classList.add("fa-check");
      return document.querySelector("#project-contents-source-import span").innerText = this.app.translator.get("Source file imported");
    } else {
      document.querySelector("#project-contents-source-import").classList.remove("done");
      document.querySelector("#project-contents-source-import i").classList.add("fa-download");
      document.querySelector("#project-contents-source-import i").classList.remove("fa-check");
      return document.querySelector("#project-contents-source-import span").innerText = this.app.translator.get("Import source file to") + " " + this.app.project.title;
    }
  }

  setSourceList(files) {
    var f, folder, j, len, manager, project, s, table, view;
    // for f in files
    //   @createSourceEntry(f.file)
    // return
    table = {};
    manager = {
      folder: "ms",
      item: "source",
      openItem: (item) => {
        return this.setSelectedSource(item);
      }
    };
    // table[item].play()
    this.project_sources = {};
    project = JSON.parse(JSON.stringify(this.project)); // create a clone
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
    view = new FolderView(manager, document.querySelector("#project-contents-view .code-list"));
    this.source_folder = view;
    view.editable = false;
    view.rebuildList(folder);
  }

  setSpriteList(files) {
    var f, folder, j, len, manager, project, s, table;
    table = {};
    this.sprites = {};
    manager = {
      folder: "sprites",
      item: "sprite",
      openItem: (item) => {
        this.sprites_folder_view.setSelectedItem(item);
        this.selected_sprite = this.sprites[item];
        if ((this.app.project != null) && !this.imported_sprites[item]) {
          document.querySelector("#project-contents-sprite-import span").innerText = this.app.translator.get("Import %ITEM% to project %PROJECT%").replace("%ITEM%", item.replace(/-/g, "/")).replace("%PROJECT%", this.app.project.title);
          return document.getElementById("project-contents-sprite-import").style.display = "block";
        } else {
          return document.getElementById("project-contents-sprite-import").style.display = "none";
        }
      }
    };
    project = JSON.parse(JSON.stringify(this.project)); // create a clone
    project.getFullURL = function() {
      var url;
      return url = location.origin + `/${project.owner}/${project.slug}/`;
    };
    project.map_list = [];
    project.notifyListeners = function() {};
    folder = new ProjectFolder(null, "sprites");
    for (j = 0, len = files.length; j < len; j++) {
      f = files[j];
      s = new ProjectSprite(project, f.file, null, null, f.properties);
      folder.push(s);
      table[s.name] = s;
      this.sprites[s.name] = s;
    }
    this.sprites_folder_view = new FolderView(manager, document.querySelector("#project-contents-view .sprite-list"));
    this.sprites_folder_view.editable = false;
    this.sprites_folder_view.rebuildList(folder);
    document.getElementById("project-contents-sprite-import").style.display = "none";
  }

  setSoundList(files) {
    var f, folder, j, len, manager, project, s, table, view;
    if (files.length > 0) {
      document.getElementById("project-contents-menu-sounds").style.display = "block";
    } else {
      document.getElementById("project-contents-menu-sounds").style.display = "none";
    }
    table = {};
    manager = {
      folder: "sounds",
      item: "sound",
      openItem: function(item) {
        return table[item].play();
      }
    };
    project = JSON.parse(JSON.stringify(this.project)); // create a clone
    project.getFullURL = function() {
      var url;
      return url = location.origin + `/${project.owner}/${project.slug}/`;
    };
    folder = new ProjectFolder(null, "sounds");
    for (j = 0, len = files.length; j < len; j++) {
      f = files[j];
      s = new ProjectSound(project, f.file);
      folder.push(s);
      table[s.name] = s;
    }
    view = new FolderView(manager, document.querySelector("#project-contents-view .sound-list"));
    view.editable = false;
    view.rebuildList(folder);
  }

  setMusicList(files) {
    var f, folder, j, len, manager, project, s, table, view;
    if (files.length > 0) {
      document.getElementById("project-contents-menu-music").style.display = "block";
    } else {
      document.getElementById("project-contents-menu-music").style.display = "none";
    }
    table = {};
    manager = {
      folder: "music",
      item: "music",
      openItem: function(item) {
        return table[item].play();
      }
    };
    project = JSON.parse(JSON.stringify(this.project)); // create a clone
    project.getFullURL = () => {
      var url;
      return url = location.origin + `/${project.owner}/${project.slug}/`;
    };
    folder = new ProjectFolder(null, "sounds");
    for (j = 0, len = files.length; j < len; j++) {
      f = files[j];
      s = new ProjectMusic(project, f.file);
      folder.push(s);
      table[s.name] = s;
    }
    view = new FolderView(manager, document.querySelector("#project-contents-view .music-list"));
    view.editable = false;
    view.rebuildList(folder);
  }

  setAssetList(files) {
    var f, folder, j, len, manager, project, s, table, view;
    if (files.length > 0) {
      document.getElementById("project-contents-menu-assets").style.display = "block";
    } else {
      document.getElementById("project-contents-menu-assets").style.display = "none";
    }
    table = {};
    manager = {
      folder: "assets",
      item: "asset",
      openItem: function(item) {}
    };
    project = JSON.parse(JSON.stringify(this.project)); // create a clone
    project.getFullURL = function() {
      var url;
      return url = location.origin + `/${project.owner}/${project.slug}/`;
    };
    folder = new ProjectFolder(null, "assets");
    for (j = 0, len = files.length; j < len; j++) {
      f = files[j];
      s = new ProjectAsset(project, f.file);
      folder.push(s);
      table[s.name] = s;
    }
    view = new FolderView(manager, document.querySelector("#project-contents-view .asset-list"));
    view.editable = false;
    view.rebuildList(folder);
  }

  setMapList(files) {
    return console.info(files);
  }

  setDocList(files) {
    if (files.length > 0) {
      document.getElementById("project-contents-menu-doc").style.display = "block";
      return this.app.client.sendRequest({
        name: "read_public_project_file",
        project: this.project.id,
        file: `doc/${files[0].file}`
      }, (msg) => {
        this.doc = msg.content;
        if ((this.doc != null) && this.doc.trim().length > 0) {
          return document.querySelector("#project-contents-view .doc-render").innerHTML = DOMPurify.sanitize(marked(msg.content));
        } else {
          return document.getElementById("project-contents-menu-doc").style.display = "none";
        }
      });
    } else {
      return document.getElementById("project-contents-menu-doc").style.display = "none";
    }
  }

  //console.info files
  updateComments() {
    return this.app.client.sendRequest({
      name: "get_project_comments",
      project: this.project.id
    }, (msg) => {
      var c, e, j, len, ref;
      e = document.getElementById("project-comment-list");
      e.innerHTML = "";
      if (msg.comments != null) {
        ref = msg.comments;
        for (j = 0, len = ref.length; j < len; j++) {
          c = ref[j];
          this.createCommentBox(c);
        }
      }
    });
  }

  createCommentBox(c) {
    var author, buttons, clear, contents, div, i, span, t, time, tt;
    console.info(c);
    div = document.createElement("div");
    div.classList.add("comment");
    author = document.createElement("div");
    author.classList.add("author");
    i = document.createElement("i");
    i.classList.add("fa");
    i.classList.add("fa-user");
    span = document.createElement("span");
    span.innerText = c.user;
    author.appendChild(i);
    author.appendChild(span);
    author = this.app.appui.createUserTag(c.user, c.user_info.tier, c.user_info.profile_image, 12);
    time = document.createElement("div");
    time.classList.add("time");
    t = (Date.now() - c.time) / 60000;
    if (t < 2) {
      tt = this.app.translator.get("now");
    } else if (t < 120) {
      tt = this.app.translator.get("%NUM% minutes ago").replace("%NUM%", Math.round(t));
    } else {
      t /= 60;
      if (t < 48) {
        tt = this.app.translator.get("%NUM% hours ago").replace("%NUM%", Math.round(t));
      } else {
        t /= 24;
        if (t < 14) {
          tt = this.app.translator.get("%NUM% days ago").replace("%NUM%", Math.round(t));
        } else if (t < 30) {
          tt = this.app.translator.get("%NUM% weeks ago").replace("%NUM%", Math.round(t / 7));
        } else {
          tt = new Date(c.time).toLocaleDateString(this.app.translator.lang, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      }
    }
    time.innerText = tt;
    div.appendChild(time);
    div.appendChild(author);
    if ((this.app.user != null) && (this.app.user.nick === c.user || this.app.user.flags.admin)) {
      buttons = document.createElement("div");
      buttons.classList.add("buttons");
      //buttons.appendChild @createButton "edit","Edit","green",()=>
      //  @editComment c
      //buttons.appendChild document.createElement "br"
      buttons.appendChild(this.createButton("trash", this.app.translator.get("Delete"), "red", () => {
        return this.deleteComment(c);
      }));
      div.appendChild(buttons);
    }
    contents = document.createElement("div");
    contents.classList.add("contents");
    contents.innerHTML = DOMPurify.sanitize(marked(c.text));
    div.appendChild(contents);
    clear = document.createElement("div");
    clear.style = "clear:both";
    div.appendChild(clear);
    return document.getElementById("project-comment-list").appendChild(div);
  }

  createButton(icon, text, color, callback) {
    var button, i, span;
    button = document.createElement("div");
    button.classList.add("small" + color + "button");
    i = document.createElement("i");
    i.classList.add("fa");
    i.classList.add(`fa-${icon}`);
    button.appendChild(i);
    span = document.createElement("span");
    span.innerText = text;
    button.appendChild(span);
    button.addEventListener("click", () => {
      return callback();
    });
    return button;
  }

  postComment(text) {
    return this.app.client.sendRequest({
      name: "add_project_comment",
      project: this.project.id,
      text: text
    }, (msg) => {
      return this.updateComments();
    });
  }

  editComment(id, text) {}

  deleteComment(c) {
    return ConfirmDialog.confirm(this.app.translator.get("Do you really want to delete this comment?"), this.app.translator.get("Delete"), this.app.translator.get("Cancel"), () => {
      return this.app.client.sendRequest({
        name: "delete_project_comment",
        project: this.project.id,
        id: c.id
      }, (msg) => {
        return this.updateComments();
      });
    });
  }

};

this.ExploreProjectSource = class ExploreProjectSource {
  constructor(project1, file1, size = 0) {
    var s;
    this.project = project1;
    this.file = file1;
    this.size = size;
    this.name = this.file.split(".")[0];
    this.ext = this.file.split(".")[1];
    this.filename = this.file;
    this.file = `ms/${this.file}`;
    s = this.name.split("-");
    this.shortname = s[s.length - 1];
    this.path_prefix = s.length > 1 ? s.splice(0, s.length - 1).join("-") + "-" : "";
    this.content = "";
    this.fetched = false;
    this.reload();
  }

  reload() {
    return fetch(this.project.getFullURL() + `ms/${this.name}.ms`).then((result) => {
      return result.text().then((text) => {
        this.content = text;
        this.fetched = true;
        return this.project.notifyListeners(this);
      });
    });
  }

};
