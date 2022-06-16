this.Sync = (function() {
  function Sync(app) {
    this.app = app;
    this.select = document.getElementById("project-sync-source");
    this.project_sync_list = document.getElementById("project-sync-list");
    this.project_sync_proceed = document.getElementById("project-sync-proceed");
    this.project_sync_input = document.querySelector("#project-sync-proceed input");
    this.project_sync_button = document.querySelector("#project-sync-proceed .proceed");
    this.project_sync_button.addEventListener("click", (function(_this) {
      return function() {
        console.info(_this.checklist);
        return _this.app.client.sendRequest({
          name: "sync_project_files",
          ops: _this.checklist,
          source: _this.source.id,
          dest: _this.app.project.id
        }, function(msg) {
          console.info(msg);
          _this.app.project.load();
          return _this.diff();
        });
      };
    })(this));
    this.select.addEventListener("change", (function(_this) {
      return function(event) {
        var i, id, len, p, ref;
        id = _this.select.options[_this.select.selectedIndex].value * 1;
        ref = _this.app.projects;
        for (i = 0, len = ref.length; i < len; i++) {
          p = ref[i];
          if (p.id === id) {
            _this.source = p;
            _this.diff();
            _this.app.client.sendRequest({
              name: "set_project_property",
              project: _this.app.project.id,
              property: "sync_source",
              value: p.id
            });
            return;
          }
        }
        _this.app.client.sendRequest({
          name: "set_project_property",
          project: _this.app.project.id,
          property: "sync_source"
        });
        _this.project_sync_list.innerHTML = "";
        return _this.project_sync_proceed.style.display = "none";
      };
    })(this));
    this.project_sync_input.addEventListener("input", (function(_this) {
      return function(event) {
        if (_this.project_sync_input.value === "SYNC NOW") {
          return _this.project_sync_button.style.display = "inline-block";
        } else {
          return _this.project_sync_button.style.display = "none";
        }
      };
    })(this));
  }

  Sync.prototype.projectOpened = function() {
    return this.reset();
  };

  Sync.prototype.reset = function() {
    this.select.innerHTML = "";
    this.project_sync_list.innerHTML = "";
    this.project_sync_proceed.style.display = "none";
    this.project_sync_input.value = "";
    return this.project_sync_button.style.display = "none";
  };

  Sync.prototype.update = function() {
    var i, len, option, option_none, p, ref, results;
    this.select.innerHTML = "";
    if (this.app.projects != null) {
      option_none = document.createElement("option");
      option_none.value = -1;
      option_none.innerText = this.app.translator.get("No source project");
      option_none.name = "";
      option_none.selected = true;
      this.select.appendChild(option_none);
      ref = this.app.projects;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        if (p.id !== this.app.project.id) {
          option = document.createElement("option");
          option.value = p.id;
          option.innerText = p.title + ("    - [" + p.slug + "]");
          option.name = p.slug;
          this.select.appendChild(option);
          if ((this.app.project != null) && this.app.project.properties.sync_source === p.id) {
            option_none.selected = false;
            option.selected = true;
            this.source = p;
            results.push(this.diff());
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      }
      return results;
    }
  };

  Sync.prototype.diff = function() {
    var text;
    text = this.app.translator.get("The following changes will be made to your project %PROJECT%:").replace("%PROJECT%", this.app.project.title + "  - [" + this.app.project.slug + "]");
    this.project_sync_list.innerHTML = "<h3>" + text + "</h3>";
    this.source_view = new Sync.ProjectView(this.app, this.source.id);
    this.checklist = [];
    return this.source_view.load((function(_this) {
      return function() {
        _this.dest_view = new Sync.ProjectView(_this.app, _this.app.project.id);
        return _this.dest_view.load(function() {
          var f, file, hr_path, path, ref, ref1, s;
          ref = _this.source_view.files;
          for (path in ref) {
            file = ref[path];
            f = _this.dest_view.files[path];
            hr_path = path.replace(/-/g, "/");
            if (f == null) {
              _this.addSyncLine("create", _this.app.translator.get("File %FILE% will be created").replace("%FILE%", hr_path));
              _this.checklist.push({
                op: "sync",
                file: file
              });
            } else if (file.version > f.version) {
              _this.addSyncLine("upgrade", _this.app.translator.get("File %FILE% will be upgraded from version %V1% to version %V2%").replace("%FILE%", hr_path).replace("%V1%", f.version).replace("%V2%", file.version));
              _this.checklist.push({
                op: "sync",
                file: file
              });
            } else if (file.version < f.version) {
              _this.addSyncLine("downgrade", _this.app.translator.get("File %FILE% will be downgraded from version %V1% to version %V2%").replace("%FILE%", hr_path).replace("%V1%", f.version).replace("%V2%", file.version));
              _this.checklist.push({
                op: "sync",
                file: file
              });
            } else if (file.size !== f.size) {
              _this.addSyncLine("sync", _this.app.translator.get("File %FILE% will be changed").replace("%FILE%", hr_path));
              _this.checklist.push({
                op: "sync",
                file: file
              });
            }
          }
          ref1 = _this.dest_view.files;
          for (path in ref1) {
            file = ref1[path];
            s = _this.source_view.files[path];
            hr_path = path.replace(/-/g, "/");
            if (s == null) {
              _this.addSyncLine("delete", _this.app.translator.get("File %FILE% will be deleted").replace("%FILE%", hr_path));
              _this.checklist.push({
                op: "delete",
                file: file
              });
            }
          }
          if (_this.checklist.length === 0) {
            text = _this.app.translator.get("Your project is 100% in sync with %PROJECT%").replace("%PROJECT%", _this.app.project.title + "  - [" + _this.app.project.slug + "]");
            _this.project_sync_list.innerHTML = "<h3>" + text + "</h3>";
            return _this.project_sync_proceed.style.display = "none";
          } else {
            return _this.project_sync_proceed.style.display = "block";
          }
        });
      };
    })(this));
  };

  Sync.prototype.addSyncLine = function(type, text) {
    var div;
    div = document.createElement("div");
    div.classList.add(type);
    div.innerHTML = "<i class=\"fa\"></i> " + text;
    return this.project_sync_list.appendChild(div);
  };

  Sync.prototype.fetchList = function(folder) {
    return this.app.client.sendRequest({
      name: "list_project_files",
      project: this.app.project.id,
      folder: folder
    }, (function(_this) {
      return function(msg) {
        return _this[callback](msg.files);
      };
    })(this));
  };

  return Sync;

})();

this.Sync.ProjectView = (function() {
  function ProjectView(app, id1) {
    this.app = app;
    this.id = id1;
    this.files = {};
  }

  ProjectView.prototype.load = function(callback) {
    var funk, list;
    list = ["ms", "sprites", "maps", "sounds", "music", "assets", "doc"];
    funk = (function(_this) {
      return function() {
        var e;
        if (list.length > 0) {
          e = list.splice(0, 1)[0];
          return _this.fetch(e, funk);
        } else {
          return callback();
        }
      };
    })(this);
    return funk();
  };

  ProjectView.prototype.fetch = function(folder, next) {
    return this.app.client.sendRequest({
      name: "list_project_files",
      project: this.id,
      folder: folder
    }, (function(_this) {
      return function(msg) {
        var f, i, len, path, ref;
        ref = msg.files;
        for (i = 0, len = ref.length; i < len; i++) {
          f = ref[i];
          console.info(f);
          path = folder + "/" + f.file;
          _this.files[path] = f;
          f.path = path;
        }
        return next();
      };
    })(this));
  };

  return ProjectView;

})();
