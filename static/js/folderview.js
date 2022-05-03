var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

this.FolderView = (function() {
  function FolderView(manager, panel) {
    this.manager = manager;
    this.panel = panel;
    this.editable = true;
    this.app = this.manager.app;
  }

  FolderView.prototype.init = function() {
    var count;
    this.panel.addEventListener("mousedown", (function(_this) {
      return function() {
        return _this.setSelectedFolder(null);
      };
    })(this));
    if (this.editable && (this.manager.fileDropped != null)) {
      this.panel.addEventListener("dragover", (function(_this) {
        return function(event) {
          return event.preventDefault();
        };
      })(this));
      this.panel.addEventListener("drop", (function(_this) {
        return function(event) {
          var err, ext, file, i, j, len, list, ref, results, split;
          event.preventDefault();
          _this.panel.classList.remove("dragover");
          try {
            list = [];
            ref = event.dataTransfer.items;
            results = [];
            for (j = 0, len = ref.length; j < len; j++) {
              i = ref[j];
              list.push(i.getAsFile());
              if (i.kind === "file") {
                file = i.getAsFile();
                split = file.name.split(".");
                ext = split[split.length - 1].toLowerCase();
                if (indexOf.call(_this.manager.extensions, ext) >= 0) {
                  results.push(_this.manager.fileDropped(file));
                } else {
                  results.push(void 0);
                }
              } else if (i.kind === "string") {
                results.push(i.getAsString(function(s) {
                  var data, err, name;
                  console.info(s);
                  try {
                    data = JSON.parse(s);
                    if (data.type === _this.manager.item && (_this.drag_file != null)) {
                      if (_this.drag_file.parent !== _this.folder) {
                        name = _this.manager.findNewFilename(_this.drag_file.shortname, _this.manager.get_item);
                        return _this.manager.renameItem(_this.drag_file, name);
                      }
                    } else if (data.type === "folder" && (_this.drag_folder != null)) {
                      return _this.moveFolder(_this.drag_folder, _this.folder);
                    }
                  } catch (error) {
                    err = error;
                    return console.error(err);
                  }
                }));
              } else {
                results.push(void 0);
              }
            }
            return results;
          } catch (error) {
            err = error;
            return console.error(err);
          }
        };
      })(this));
      count = 0;
      this.panel.addEventListener("dragenter", (function(_this) {
        return function(event) {
          count += 1;
          _this.panel.classList.add("dragover");
          return _this.setSelectedFolder(null);
        };
      })(this));
      return this.panel.addEventListener("dragleave", (function(_this) {
        return function(event) {
          count -= 1;
          if (count === 0) {
            return _this.panel.classList.remove("dragover");
          }
        };
      })(this));
    }
  };

  FolderView.prototype.moveFolder = function(folder, dest) {
    var f, j, len, ref;
    ref = dest.subfolders;
    for (j = 0, len = ref.length; j < len; j++) {
      f = ref[j];
      if (f.name === folder.name) {
        return;
      }
    }
    dest.addFolder(folder);
    return this.fixFilesPath(folder);
  };

  FolderView.prototype.fixFilesPath = function(folder) {
    var f, j, k, len, len1, name, ref, ref1;
    ref = folder.subfolders;
    for (j = 0, len = ref.length; j < len; j++) {
      f = ref[j];
      this.fixFilesPath(f);
    }
    ref1 = folder.files;
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      f = ref1[k];
      name = folder.getFullDashPath() + "-" + f.shortname;
      this.manager.renameItem(f, name);
    }
  };

  FolderView.prototype.createItemBox = function(item) {
    var activeuser, element, icon, text;
    element = document.createElement("div");
    element.classList.add("asset-box");
    element.classList.add("asset-box-" + this.manager.item);
    item.element = element;
    element.dataset.id = item.name;
    element.setAttribute("title", item.shortname);
    if (item.name === this.selected_item) {
      element.classList.add("selected");
    }
    if (item.getThumbnailURL != null) {
      icon = new Image;
      icon.src = item.getThumbnailURL();
      icon.loading = "lazy";
      icon.setAttribute("id", "asset-image-" + item.name);
      element.appendChild(icon);
      icon.draggable = false;
    } else if (item.getThumbnailElement != null) {
      icon = item.getThumbnailElement();
      element.appendChild(icon);
      icon.draggable = false;
    }
    text = document.createElement("div");
    text.classList.add("asset-box-name");
    if (this.manager.file_icon != null) {
      text.innerHTML = "<i class=\"" + this.manager.file_icon + "\"></i> " + item.shortname;
    } else {
      text.innerHTML = item.shortname;
    }
    element.appendChild(text);
    element.addEventListener("click", (function(_this) {
      return function() {
        return _this.manager.openItem(item.name);
      };
    })(this));
    activeuser = document.createElement("i");
    activeuser.classList.add("active-user");
    activeuser.classList.add("fa");
    activeuser.classList.add("fa-user");
    element.appendChild(activeuser);
    element.draggable = item.canBeRenamed != null ? item.canBeRenamed() : true;
    element.addEventListener("dragstart", (function(_this) {
      return function(event) {
        _this.drag_file = item;
        return event.dataTransfer.setData("text/plain", JSON.stringify({
          type: _this.manager.item,
          id: item.name
        }));
      };
    })(this));
    return element;
  };

  FolderView.prototype.setSelectedFolder = function(folder, current) {
    var f, j, len, ref;
    if (current == null) {
      current = this.folder;
    }
    this.selected_folder = folder;
    if (current == null) {
      return;
    }
    if (current.element != null) {
      if (current === folder) {
        current.element.classList.add("selected");
      } else {
        current.element.classList.remove("selected");
      }
    }
    ref = current.subfolders;
    for (j = 0, len = ref.length; j < len; j++) {
      f = ref[j];
      this.setSelectedFolder(folder, f);
    }
  };

  FolderView.prototype.createItemFolder = function(folder, element) {
    var content, f, fdiv, fn, j, k, len, len1, ref, ref1, title;
    ref = folder.subfolders;
    fn = (function(_this) {
      return function(f, fdiv, title) {
        var count, span, toggle;
        if (_this.editable) {
          title.querySelector(".trash").addEventListener("click", function() {
            _this.manager.deleteFolder(f);
            return _this.setSelectedFolder(null);
          });
          fdiv.addEventListener("mousedown", function(event) {
            event.stopPropagation();
            _this.setSelectedFolder(f);
            return document.body.dispatchEvent(new MouseEvent("mousedown", {}));
          });
          title.draggable = true;
          title.addEventListener("dragstart", function(event) {
            _this.drag_folder = f;
            return event.dataTransfer.setData("text/plain", JSON.stringify({
              type: "folder",
              id: f.getFullDashPath()
            }));
          });
        }
        toggle = function() {
          return f.setOpen(!f.open);
        };
        title.addEventListener("click", function(event) {
          if (event.clientX < title.getBoundingClientRect().x + 50) {
            return toggle();
          }
        });
        title.addEventListener("dblclick", function(event) {
          return toggle();
        });
        if (_this.editable) {
          span = title.querySelector("span");
          span.addEventListener("dblclick", function(event) {
            event.stopPropagation();
            return _this.editFolderName(f);
          });
          title.querySelector(".pencil").addEventListener("click", function() {
            return _this.editFolderName(f);
          });
          count = 0;
          fdiv.addEventListener("dragenter", function(event) {
            event.stopPropagation();
            count += 1;
            if (!f.element.classList.contains("selected")) {
              _this.setSelectedFolder(f);
            }
            if (!f.open) {
              if (f.open_timeout == null) {
                return f.open_timeout = setTimeout((function() {
                  f.setOpen(true);
                  return delete f.open_timeout;
                }), 1000);
              }
            }
          });
          fdiv.addEventListener("dragleave", function(event) {
            event.stopPropagation();
            count -= 1;
            if (count === 0) {
              if (f.open_timeout != null) {
                clearTimeout(f.open_timeout);
                return delete f.open_timeout;
              }
            }
          });
          fdiv.addEventListener("dragover", function(event) {
            return event.preventDefault();
          });
          return fdiv.addEventListener("drop", function(event) {
            var err, ext, file, i, k, len1, list, ref1;
            event.preventDefault();
            event.stopPropagation();
            try {
              list = [];
              ref1 = event.dataTransfer.items;
              for (k = 0, len1 = ref1.length; k < len1; k++) {
                i = ref1[k];
                if (i.kind === "file") {
                  file = i.getAsFile();
                  ext = file.name.split(".")[1].toLowerCase();
                  if (indexOf.call(_this.manager.extensions, ext) >= 0) {
                    _this.manager.fileDropped(file, f);
                  }
                } else if (i.kind === "string") {
                  i.getAsString(function(s) {
                    var data, err, fullname, name;
                    console.info(s);
                    try {
                      data = JSON.parse(s);
                      if (data.type === _this.manager.item && (_this.drag_file != null)) {
                        if (_this.drag_file.parent !== f) {
                          name = _this.manager.findNewFilename(_this.drag_file.shortname, _this.manager.get_item, f);
                          fullname = f.getFullDashPath() + "-" + name;
                          return _this.manager.renameItem(_this.drag_file, fullname);
                        }
                      } else if (data.type === "folder" && (_this.drag_folder != null)) {
                        if (_this.drag_folder !== f && !_this.drag_folder.isAncestorOf(f)) {
                          return _this.moveFolder(_this.drag_folder, f);
                        }
                      }
                    } catch (error) {
                      err = error;
                      return console.error(err);
                    }
                  });
                }
              }
            } catch (error) {
              err = error;
              console.error(err);
            }
          });
        }
      };
    })(this);
    for (j = 0, len = ref.length; j < len; j++) {
      f = ref[j];
      fdiv = document.createElement("div");
      fdiv.classList.add("folder");
      element.appendChild(fdiv);
      f.setElement(fdiv);
      title = document.createElement("div");
      title.classList.add("folder-title");
      title.innerHTML = "<i class=\"fas fa-trash-alt trash\"></i><i class=\"fa caret\"></i><i class=\"fa folder\"></i> <span>" + f.name + "</span> <i class=\"fa pencil fa-pencil-alt\"></i>";
      title.addEventListener("resize", (function(_this) {
        return function() {
          if (title.getBoundingClientRect().width < 200) {
            return title.querySelector(".trash").style.display = "none";
          } else {
            return title.querySelector(".trash").style.display = "inline-block";
          }
        };
      })(this));
      fdiv.appendChild(title);
      content = document.createElement("div");
      content.classList.add("folder-content");
      fdiv.appendChild(content);
      fn(f, fdiv, title);
      this.createItemFolder(f, content);
    }
    ref1 = folder.files;
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      f = ref1[k];
      element.appendChild(this.createItemBox(f));
    }
  };

  FolderView.prototype.rebuildList = function(folder1) {
    var scroll_top;
    this.folder = folder1;
    scroll_top = this.panel.scrollTop;
    this.panel.innerHTML = "";
    this.createItemFolder(this.folder, this.panel);
    this.panel.scrollTop = scroll_top;
    if (this.selected_folder != null) {
      this.setSelectedFolder(this.selected_folder);
    }
    if (this.selected_item != null) {
      this.setSelectedItem(this.selected_item);
    }
  };

  FolderView.prototype.setSelectedItem = function(item) {
    var e, j, k, len, len1, list;
    list = this.panel.getElementsByClassName("asset-box");
    this.selected_item = item;
    if (this.selected_item != null) {
      for (j = 0, len = list.length; j < len; j++) {
        e = list[j];
        if (e.dataset.id === item) {
          e.classList.add("selected");
        } else {
          e.classList.remove("selected");
        }
      }
    } else {
      for (k = 0, len1 = list.length; k < len1; k++) {
        e = list[k];
        e.classList.remove("selected");
      }
    }
  };

  FolderView.prototype.editFolderName = function(folder) {
    var f, files, input, j, k, len, len1, parent, span;
    parent = folder.parent;
    while (parent != null) {
      if (parent.setOpen != null) {
        parent.setOpen(true);
      }
      parent = parent.parent;
    }
    files = folder.getAllFiles();
    for (j = 0, len = files.length; j < len; j++) {
      f = files[j];
      if (this.app.project.isLocked(this.manager.folder + "/" + f.name + "." + f.ext)) {
        return;
      }
    }
    input = document.createElement("input");
    input.value = folder.name;
    span = folder.element.querySelector("span");
    span.parentNode.replaceChild(input, span);
    for (k = 0, len1 = files.length; k < len1; k++) {
      f = files[k];
      this.app.project.lockFile(this.manager.folder + "/" + f.name + "." + f.ext);
    }
    input.focus();
    input.addEventListener("dblclick", (function(_this) {
      return function(event) {
        return event.stopPropagation();
      };
    })(this));
    input.addEventListener("blur", (function(_this) {
      return function() {
        var l, len2, len3, m, name, oldpath, path, results, value;
        input.parentNode.replaceChild(span, input);
        value = RegexLib.fixFilename(input.value);
        if (value !== folder.name) {
          if (RegexLib.filename.test(value) && (folder.parent.getSubFolder(value) == null)) {
            span.innerText = value;
            for (l = 0, len2 = files.length; l < len2; l++) {
              f = files[l];
              f.old_path = f.parent.getFullDashPath() + "-" + f.shortname + "." + f.ext;
            }
            folder.name = value;
            results = [];
            for (m = 0, len3 = files.length; m < len3; m++) {
              f = files[m];
              oldpath = f.old_path;
              name = f.parent.getFullDashPath() + "-" + f.shortname;
              path = name + "." + f.ext;
              f.rename(name);
              results.push(_this.app.client.sendRequest({
                name: "rename_project_file",
                project: _this.app.project.id,
                source: _this.manager.folder + "/" + oldpath,
                dest: _this.manager.folder + "/" + path,
                thumbnail: _this.manager.use_thumbnails
              }, function(msg) {
                return _this.app.project[_this.manager.update_list]();
              }));
            }
            return results;
          }
        }
      };
    })(this));
    return input.addEventListener("keydown", (function(_this) {
      return function(event) {
        if (event.key === "Enter") {
          event.preventDefault();
          input.blur();
          return false;
        } else {
          return true;
        }
      };
    })(this));
  };

  return FolderView;

})();
