this.ProjectDetails = (function() {
  function ProjectDetails(app) {
    var fn, j, len, ref, s;
    this.app = app;
    this.menu = ["code", "sprites", "sounds", "music", "doc"];
    ref = this.menu;
    fn = (function(_this) {
      return function(s) {
        return document.getElementById("project-contents-menu-" + s).addEventListener("click", function() {
          return _this.setSection(s);
        });
      };
    })(this);
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      fn(s);
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
      useWorker: false
    });
    document.querySelector("#project-contents-source-import").addEventListener("click", (function(_this) {
      return function() {
        var count, file, name;
        if (_this.app.project == null) {
          return;
        }
        file = _this.selected_source;
        if (file == null) {
          return;
        }
        if (_this.imported_sources[file]) {
          return;
        }
        _this.imported_sources[file] = true;
        name = file.split(".")[0];
        count = 1;
        while (_this.app.project.getSource(name) != null) {
          count += 1;
          name = file.split(".")[0] + count;
        }
        file = name + ".ms";
        return _this.app.client.sendRequest({
          name: "write_project_file",
          project: _this.app.project.id,
          file: "ms/" + file,
          content: _this.sources[_this.selected_source]
        }, function(msg) {
          _this.app.project.updateSourceList();
          return _this.setSelectedSource(_this.selected_source);
        });
      };
    })(this));
    document.querySelector("#project-contents-doc-import").addEventListener("click", (function(_this) {
      return function() {
        var value;
        if (_this.app.project == null) {
          return;
        }
        if (_this.imported_doc || (_this.doc == null)) {
          return;
        }
        _this.imported_doc = true;
        value = _this.app.doc_editor.editor.getValue();
        if ((value != null) && value.length > 0) {
          value = value + "\n\n" + _this.doc;
        } else {
          value = _this.doc;
        }
        return _this.app.client.sendRequest({
          name: "write_project_file",
          project: _this.app.project.id,
          file: "doc/doc.md",
          content: value
        }, function(msg) {
          _this.app.project.loadDoc();
          document.querySelector("#project-contents-doc-import").classList.add("done");
          document.querySelector("#project-contents-doc-import i").classList.add("fa-check");
          document.querySelector("#project-contents-doc-import i").classList.remove("fa-download");
          return document.querySelector("#project-contents-doc-import span").innerText = _this.app.translator.get("Doc imported");
        });
      };
    })(this));
    document.getElementById("post-project-comment-button").addEventListener("click", (function(_this) {
      return function() {
        var text;
        text = document.querySelector("#post-project-comment textarea").value;
        if ((text != null) && text.length > 0) {
          _this.postComment(text);
          return document.querySelector("#post-project-comment textarea").value = "";
        }
      };
    })(this));
    document.getElementById("login-to-post-comment").addEventListener("click", (function(_this) {
      return function() {
        return _this.app.appui.showLoginPanel();
      };
    })(this));
    document.getElementById("validate-to-post-comment").addEventListener("click", (function(_this) {
      return function() {
        return _this.app.appui.setMainSection("usersettings");
      };
    })(this));
  }

  ProjectDetails.prototype.set = function(project) {
    var a, j, len, ref, ref1, section, t;
    this.project = project;
    this.splitbar.update();
    this.sources = [];
    this.sprites = [];
    this.sounds = [];
    this.music = [];
    this.maps = [];
    this.imported_sources = {};
    this.imported_doc = false;
    document.querySelector("#project-contents-doc-import").classList.remove("done");
    document.querySelector("#project-contents-doc-import").style.display = this.app.project != null ? "block" : "none";
    document.querySelector("#project-contents-source-import").style.display = this.app.project != null ? "block" : "none";
    if (this.app.project != null) {
      document.querySelector("#project-contents-doc-import span").innerText = this.app.translator.get("Import doc to") + " " + this.app.project.title;
    }
    document.querySelector("#project-contents-view .code-list").innerHTML = "";
    document.querySelector("#project-contents-view .sprite-list").innerHTML = "";
    document.querySelector("#project-contents-view .sound-list").innerHTML = "";
    document.querySelector("#project-contents-view .music-list").innerHTML = "";
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
    }, (function(_this) {
      return function(msg) {
        return _this.setSourceList(msg.files);
      };
    })(this));
    this.app.client.sendRequest({
      name: "list_public_project_files",
      project: this.project.id,
      folder: "sprites"
    }, (function(_this) {
      return function(msg) {
        return _this.setSpriteList(msg.files);
      };
    })(this));
    this.app.client.sendRequest({
      name: "list_public_project_files",
      project: this.project.id,
      folder: "sounds"
    }, (function(_this) {
      return function(msg) {
        return _this.setSoundList(msg.files);
      };
    })(this));
    this.app.client.sendRequest({
      name: "list_public_project_files",
      project: this.project.id,
      folder: "music"
    }, (function(_this) {
      return function(msg) {
        return _this.setMusicList(msg.files);
      };
    })(this));
    this.app.client.sendRequest({
      name: "list_public_project_files",
      project: this.project.id,
      folder: "doc"
    }, (function(_this) {
      return function(msg) {
        return _this.setDocList(msg.files);
      };
    })(this));
    this.updateComments();
    this.updateCredentials();
    a = document.querySelector("#project-contents-view .sprites .export-panel a");
    a.href = "/" + this.project.owner + "/" + this.project.slug + "/export/sprites/";
    a.download = this.project.slug + "_sprites.zip";
    a = document.querySelector("#project-details-exportbutton");
    a.href = "/" + this.project.owner + "/" + this.project.slug + "/export/project/";
    return a.download = this.project.slug + "_files.zip";
  };

  ProjectDetails.prototype.updateCredentials = function() {
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
  };

  ProjectDetails.prototype.loadFile = function(url, callback) {
    var req;
    req = new XMLHttpRequest();
    req.onreadystatechange = (function(_this) {
      return function(event) {
        if (req.readyState === XMLHttpRequest.DONE) {
          if (req.status === 200) {
            return callback(req.responseText);
          }
        }
      };
    })(this);
    req.open("GET", url);
    return req.send();
  };

  ProjectDetails.prototype.setSection = function(section) {
    var j, len, ref, s;
    ref = this.menu;
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      if (s === section) {
        document.getElementById("project-contents-menu-" + s).classList.add("selected");
        document.querySelector("#project-contents-view ." + s).style.display = "block";
      } else {
        document.getElementById("project-contents-menu-" + s).classList.remove("selected");
        document.querySelector("#project-contents-view ." + s).style.display = "none";
      }
    }
  };

  ProjectDetails.prototype.createSourceEntry = function(file) {
    return this.app.client.sendRequest({
      name: "read_public_project_file",
      project: this.project.id,
      file: "ms/" + file
    }, (function(_this) {
      return function(msg) {
        var div;
        _this.sources[file] = msg.content;
        div = document.createElement("div");
        div.innerHTML = "<i class='fa fa-file-code'></i> " + (file.split(".")[0]);
        document.querySelector("#project-contents-view .code-list").appendChild(div);
        div.id = "project-contents-view-source-" + file;
        div.addEventListener("click", function() {
          return _this.setSelectedSource(file);
        });
        if (_this.selected_source == null) {
          return _this.setSelectedSource(file);
        }
      };
    })(this));
  };

  ProjectDetails.prototype.setSelectedSource = function(file) {
    var key;
    this.selected_source = file;
    for (key in this.sources) {
      if (key === file) {
        document.getElementById("project-contents-view-source-" + key).classList.add("selected");
      } else {
        document.getElementById("project-contents-view-source-" + key).classList.remove("selected");
      }
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
  };

  ProjectDetails.prototype.setSourceList = function(files) {
    var f, j, len;
    for (j = 0, len = files.length; j < len; j++) {
      f = files[j];
      this.createSourceEntry(f.file);
    }
  };

  ProjectDetails.prototype.createSpriteBox = function(file, prefs) {
    var button, clicked, div, i, img, span;
    div = document.createElement("div");
    div.classList.add("sprite");
    img = this.createSpriteThumb(new Sprite(location.origin + ("/" + this.project.owner + "/" + this.project.slug + "/" + file), null, prefs));
    div.appendChild(img);
    if (this.app.project != null) {
      button = document.createElement("div");
      i = document.createElement("i");
      i.classList.add("fa");
      i.classList.add("fa-download");
      button.appendChild(i);
      span = document.createElement("span");
      span.innerText = this.app.translator.get("Import to project") + (" " + this.app.project.title);
      button.appendChild(span);
      clicked = false;
      button.addEventListener("click", (function(_this) {
        return function() {
          var source;
          if (clicked) {
            return;
          }
          clicked = true;
          source = new Image;
          source.crossOrigin = "Anonymous";
          source.src = location.origin + ("/" + _this.project.owner + "/" + _this.project.slug + "/" + file);
          return source.onload = function() {
            var canvas, count, name;
            canvas = document.createElement("canvas");
            canvas.width = source.width;
            canvas.height = source.height;
            canvas.getContext("2d").drawImage(source, 0, 0);
            name = file.split(".")[0];
            count = 1;
            while (_this.app.project.getSprite(name) != null) {
              count += 1;
              name = file.split(".")[0] + count;
            }
            file = name + ".png";
            return _this.app.client.sendRequest({
              name: "write_project_file",
              project: _this.app.project.id,
              file: "sprites/" + file,
              content: canvas.toDataURL().split(",")[1],
              properties: prefs
            }, function(msg) {
              _this.app.project.updateSpriteList();
              div.style.width = "0px";
              return setTimeout((function() {
                return div.style.display = "none";
              }), 1000);
            });
          };
        };
      })(this));
      div.appendChild(button);
    }
    return document.querySelector("#project-contents-view .sprite-list").appendChild(div);
  };

  ProjectDetails.prototype.createSpriteThumb = function(sprite) {
    var canvas, mouseover, update;
    canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    sprite.loaded = (function(_this) {
      return function() {
        var context, frame, h, r, w;
        context = canvas.getContext("2d");
        frame = sprite.frames[0].getCanvas();
        r = Math.min(100 / frame.width, 100 / frame.height);
        context.imageSmoothingEnabled = false;
        w = r * frame.width;
        h = r * frame.height;
        return context.drawImage(frame, 50 - w / 2, 50 - h / 2, w, h);
      };
    })(this);
    mouseover = false;
    update = (function(_this) {
      return function() {
        var context, dt, frame, h, r, t, w;
        if (mouseover && sprite.frames.length > 1) {
          requestAnimationFrame(function() {
            return update();
          });
        }
        if (sprite.frames.length < 1) {
          return;
        }
        dt = 1000 / sprite.fps;
        t = Date.now();
        frame = mouseover ? Math.floor(t / dt) % sprite.frames.length : 0;
        context = canvas.getContext("2d");
        context.imageSmoothingEnabled = false;
        context.clearRect(0, 0, 100, 100);
        frame = sprite.frames[frame].getCanvas();
        r = Math.min(100 / frame.width, 100 / frame.height);
        w = r * frame.width;
        h = r * frame.height;
        return context.drawImage(frame, 50 - w / 2, 50 - h / 2, w, h);
      };
    })(this);
    canvas.addEventListener("mouseenter", (function(_this) {
      return function() {
        mouseover = true;
        return update();
      };
    })(this));
    canvas.addEventListener("mouseout", (function(_this) {
      return function() {
        return mouseover = false;
      };
    })(this));
    canvas.updateSprite = update;
    return canvas;
  };

  ProjectDetails.prototype.setSpriteList = function(files) {
    var f, j, len;
    for (j = 0, len = files.length; j < len; j++) {
      f = files[j];
      this.createSpriteBox(f.file, f.properties);
    }
  };

  ProjectDetails.prototype.createImportButton = function(div, file, folder) {
    var button, clicked, i, span;
    button = document.createElement("div");
    i = document.createElement("i");
    i.classList.add("fa");
    i.classList.add("fa-download");
    button.appendChild(i);
    span = document.createElement("span");
    span.innerText = this.app.translator.get("Import to project") + (" " + this.app.project.title);
    button.appendChild(span);
    clicked = false;
    return button.addEventListener("click", (function(_this) {
      return function() {
        var source;
        if (clicked) {
          return;
        }
        clicked = true;
        source = new Image;
        source.crossOrigin = "Anonymous";
        source.src = location.origin + ("/" + _this.project.owner + "/" + _this.project.slug + "/" + file);
        return source.onload = function() {
          var canvas, count, name;
          canvas = document.createElement("canvas");
          canvas.width = source.width;
          canvas.height = source.height;
          canvas.getContext("2d").drawImage(source, 0, 0);
          name = file.split(".")[0];
          count = 1;
          while (_this.app.project.getSprite(name) != null) {
            count += 1;
            name = file.split(".")[0] + count;
          }
          file = name + ".png";
          return _this.app.client.sendRequest({
            name: "write_project_file",
            project: _this.app.project.id,
            file: "sprites/" + file,
            content: canvas.toDataURL().split(",")[1],
            properties: prefs
          }, function(msg) {
            _this.app.project.updateSpriteList();
            div.style.width = "0px";
            return setTimeout((function() {
              return div.style.display = "none";
            }), 1000);
          });
        };
      };
    })(this));
  };

  ProjectDetails.prototype.createSoundBox = function(file, prefs) {
    var div, img, span;
    div = document.createElement("div");
    div.classList.add("sound");
    img = new Image;
    img.src = location.origin + ("/" + this.project.owner + "/" + this.project.slug + "/sounds_th/" + (file.replace(".wav", ".png")));
    div.appendChild(img);
    div.appendChild(document.createElement("br"));
    span = document.createElement("span");
    span.innerText = file.split(".")[0];
    div.appendChild(span);
    div.addEventListener("click", (function(_this) {
      return function() {
        var audio, funk, url;
        url = location.origin + ("/" + _this.project.owner + "/" + _this.project.slug + "/sounds/" + file);
        audio = new Audio(url);
        audio.play();
        funk = function() {
          audio.pause();
          return document.body.removeEventListener("mousedown", funk);
        };
        return document.body.addEventListener("mousedown", funk);
      };
    })(this));
    return document.querySelector("#project-contents-view .sound-list").appendChild(div);
  };

  ProjectDetails.prototype.setSoundList = function(files) {
    var f, j, len;
    if (files.length > 0) {
      document.getElementById("project-contents-menu-sounds").style.display = "block";
    } else {
      document.getElementById("project-contents-menu-sounds").style.display = "none";
    }
    for (j = 0, len = files.length; j < len; j++) {
      f = files[j];
      this.createSoundBox(f.file);
    }
  };

  ProjectDetails.prototype.createMusicBox = function(file, prefs) {
    var div, img, span;
    div = document.createElement("div");
    div.classList.add("music");
    img = new Image;
    img.src = location.origin + ("/" + this.project.owner + "/" + this.project.slug + "/music_th/" + (file.replace(".mp3", ".png")));
    div.appendChild(img);
    div.appendChild(document.createElement("br"));
    span = document.createElement("span");
    span.innerText = file.split(".")[0];
    div.appendChild(span);
    div.addEventListener("click", (function(_this) {
      return function() {
        var audio, funk, url;
        url = location.origin + ("/" + _this.project.owner + "/" + _this.project.slug + "/music/" + file);
        audio = new Audio(url);
        audio.play();
        funk = function() {
          audio.pause();
          return document.body.removeEventListener("mousedown", funk);
        };
        return document.body.addEventListener("mousedown", funk);
      };
    })(this));
    return document.querySelector("#project-contents-view .music-list").appendChild(div);
  };

  ProjectDetails.prototype.setMusicList = function(files) {
    var f, j, len;
    if (files.length > 0) {
      document.getElementById("project-contents-menu-music").style.display = "block";
    } else {
      document.getElementById("project-contents-menu-music").style.display = "none";
    }
    for (j = 0, len = files.length; j < len; j++) {
      f = files[j];
      this.createMusicBox(f.file, f.properties);
    }
  };

  ProjectDetails.prototype.setMapList = function(files) {
    return console.info(files);
  };

  ProjectDetails.prototype.setDocList = function(files) {
    if (files.length > 0) {
      document.getElementById("project-contents-menu-doc").style.display = "block";
      return this.app.client.sendRequest({
        name: "read_public_project_file",
        project: this.project.id,
        file: "doc/" + files[0].file
      }, (function(_this) {
        return function(msg) {
          _this.doc = msg.content;
          if ((_this.doc != null) && _this.doc.trim().length > 0) {
            return document.querySelector("#project-contents-view .doc-render").innerHTML = DOMPurify.sanitize(marked(msg.content));
          } else {
            return document.getElementById("project-contents-menu-doc").style.display = "none";
          }
        };
      })(this));
    } else {
      return document.getElementById("project-contents-menu-doc").style.display = "none";
    }
  };

  ProjectDetails.prototype.updateComments = function() {
    return this.app.client.sendRequest({
      name: "get_project_comments",
      project: this.project.id
    }, (function(_this) {
      return function(msg) {
        var c, e, j, len, ref;
        e = document.getElementById("project-comment-list");
        e.innerHTML = "";
        if (msg.comments != null) {
          ref = msg.comments;
          for (j = 0, len = ref.length; j < len; j++) {
            c = ref[j];
            _this.createCommentBox(c);
          }
        }
      };
    })(this));
  };

  ProjectDetails.prototype.createCommentBox = function(c) {
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
      buttons.appendChild(this.createButton("trash", "Delete", "red", (function(_this) {
        return function() {
          return _this.deleteComment(c);
        };
      })(this)));
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
  };

  ProjectDetails.prototype.createButton = function(icon, text, color, callback) {
    var button, i, span;
    button = document.createElement("div");
    button.classList.add("small" + color + "button");
    i = document.createElement("i");
    i.classList.add("fa");
    i.classList.add("fa-" + icon);
    button.appendChild(i);
    span = document.createElement("span");
    span.innerText = text;
    button.appendChild(span);
    button.addEventListener("click", (function(_this) {
      return function() {
        return callback();
      };
    })(this));
    return button;
  };

  ProjectDetails.prototype.postComment = function(text) {
    return this.app.client.sendRequest({
      name: "add_project_comment",
      project: this.project.id,
      text: text
    }, (function(_this) {
      return function(msg) {
        return _this.updateComments();
      };
    })(this));
  };

  ProjectDetails.prototype.editComment = function(id, text) {};

  ProjectDetails.prototype.deleteComment = function(c) {
    return ConfirmDialog.confirm(this.app.translator.get("Do you really want to delete this comment?"), this.app.translator.get("Delete"), this.app.translator.get("Cancel"), (function(_this) {
      return function() {
        return _this.app.client.sendRequest({
          name: "delete_project_comment",
          project: _this.project.id,
          id: c.id
        }, function(msg) {
          return _this.updateComments();
        });
      };
    })(this));
  };

  return ProjectDetails;

})();
