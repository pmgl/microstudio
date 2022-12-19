var indexOf = [].indexOf;

this.FolderView = class FolderView {
  constructor(manager, panel) {
    this.manager = manager;
    this.panel = panel;
    this.editable = true;
    this.app = this.manager.app;
  }

  isDroppable(event) {
    var i, j, len, ref;
    ref = event.dataTransfer.items;
    for (j = 0, len = ref.length; j < len; j++) {
      i = ref[j];
      if (i.kind === "file") {
        return true;
      } else if (i.kind === "string") {
        if (i.type !== "application/json") {
          return false;
        } else {
          return true;
        }
      }
    }
    return false;
  }

  init() {
    var count;
    this.panel.addEventListener("mousedown", () => {
      return this.setSelectedFolder(null);
    });
    if (this.editable && (this.manager.fileDropped != null)) {
      this.panel.addEventListener("dragover", (event) => {
        if (this.isDroppable(event)) {
          return event.preventDefault();
        }
      });
      this.panel.addEventListener("drop", (event) => {
        var err, ext, file, i, j, len, list, ref, results, split;
        event.preventDefault();
        this.panel.classList.remove("dragover");
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
              if (indexOf.call(this.manager.extensions, ext) >= 0) {
                results.push(this.manager.fileDropped(file));
              } else {
                results.push(void 0);
              }
            } else if (i.kind === "string") {
              results.push(i.getAsString((s) => {
                var data, err, name;
                console.info(s);
                try {
                  data = JSON.parse(s);
                  if (data.type === this.manager.item && (this.drag_file != null)) {
                    if (this.drag_file.parent !== this.folder) {
                      name = this.manager.findNewFilename(this.drag_file.shortname, this.manager.get_item);
                      return this.manager.renameItem(this.drag_file, name);
                    }
                  } else if (data.type === "folder" && (this.drag_folder != null)) {
                    return this.moveFolder(this.drag_folder, this.folder);
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
      });
      count = 0;
      this.panel.addEventListener("dragenter", (event) => {
        count += 1;
        this.panel.classList.add("dragover");
        return this.setSelectedFolder(null);
      });
      return this.panel.addEventListener("dragleave", (event) => {
        count -= 1;
        if (count === 0) {
          return this.panel.classList.remove("dragover");
        }
      });
    }
  }

  moveFolder(folder, dest) {
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
  }

  fixFilesPath(folder) {
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
  }

  createItemBox(item) {
    var activeuser, element, icon, text;
    element = document.createElement("div");
    element.classList.add("asset-box");
    element.classList.add(`asset-box-${this.manager.item}`);
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
      icon.setAttribute("id", `asset-image-${item.name}`);
      element.appendChild(icon);
      icon.draggable = false;
    } else if (item.getThumbnailElement != null) {
      icon = item.getThumbnailElement();
      //icon.setAttribute "id","asset-image-#{item.name}"
      element.appendChild(icon);
      icon.draggable = false;
    }
    text = document.createElement("div");
    text.classList.add("asset-box-name");
    if (this.manager.file_icon != null) {
      text.innerHTML = `<i class="${this.manager.file_icon}"></i> ${item.shortname}`;
    } else {
      text.innerHTML = item.shortname;
    }
    element.appendChild(text);
    element.addEventListener("click", () => {
      return this.manager.openItem(item.name);
    });
    activeuser = document.createElement("i");
    activeuser.classList.add("active-user");
    activeuser.classList.add("fa");
    activeuser.classList.add("fa-user");
    element.appendChild(activeuser);
    element.draggable = item.canBeRenamed != null ? item.canBeRenamed() : true;
    element.addEventListener("dragstart", (event) => {
      this.drag_file = item;
      return event.dataTransfer.setData("application/json", JSON.stringify({
        type: this.manager.item,
        id: item.name
      }));
    });
    return element;
  }

  setSelectedFolder(folder, current = this.folder) {
    var f, j, len, ref;
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
  }

  createItemFolder(folder, element) {
    var content, f, fdiv, j, k, len, len1, ref, ref1, title;
    ref = folder.subfolders;
    for (j = 0, len = ref.length; j < len; j++) {
      f = ref[j];
      fdiv = document.createElement("div");
      fdiv.classList.add("folder");
      element.appendChild(fdiv);
      f.setElement(fdiv);
      // del = document.createElement "i"
      // del.classList.add "fa"
      // del.classList.add "fa-trash"
      // del.classList.add "trash"
      // title.appendChild del
      title = document.createElement("div");
      title.classList.add("folder-title");
      title.innerHTML = `<i class="fas fa-trash-alt trash"></i><i class="fa caret"></i><i class="fa folder"></i> <span>${f.name}</span> <i class="fa pencil fa-pencil-alt"></i>`;
      title.addEventListener("resize", () => {
        if (title.getBoundingClientRect().width < 200) {
          return title.querySelector(".trash").style.display = "none";
        } else {
          return title.querySelector(".trash").style.display = "inline-block";
        }
      });
      fdiv.appendChild(title);
      content = document.createElement("div");
      content.classList.add("folder-content");
      fdiv.appendChild(content);
      ((f, fdiv, title) => {
        var count, span, toggle;
        if (this.editable) {
          title.querySelector(".trash").addEventListener("click", () => {
            this.manager.deleteFolder(f);
            return this.setSelectedFolder(null);
          });
          fdiv.addEventListener("mousedown", (event) => {
            event.stopPropagation();
            this.setSelectedFolder(f);
            // this ensures potential active audio preview will stop playing
            return document.body.dispatchEvent(new MouseEvent("mousedown", {}));
          });
          title.draggable = true;
          title.addEventListener("dragstart", (event) => {
            this.drag_folder = f;
            return event.dataTransfer.setData("application/json", JSON.stringify({
              type: "folder",
              id: f.getFullDashPath()
            }));
          });
        }
        toggle = function() {
          return f.setOpen(!f.open);
        };
        title.addEventListener("click", (event) => {
          if (event.clientX < title.getBoundingClientRect().x + 50) {
            return toggle();
          }
        });
        title.addEventListener("dblclick", (event) => {
          return toggle();
        });
        if (this.editable) {
          span = title.querySelector("span");
          span.addEventListener("dblclick", (event) => {
            event.stopPropagation();
            return this.editFolderName(f);
          });
          title.querySelector(".pencil").addEventListener("click", () => {
            return this.editFolderName(f);
          });
          count = 0;
          fdiv.addEventListener("dragenter", (event) => {
            event.stopPropagation();
            count += 1;
            if (!f.element.classList.contains("selected")) {
              this.setSelectedFolder(f);
            }
            if (!f.open) {
              if (f.open_timeout == null) {
                return f.open_timeout = setTimeout((() => {
                  f.setOpen(true);
                  return delete f.open_timeout;
                }), 1000);
              }
            }
          });
          fdiv.addEventListener("dragleave", (event) => {
            event.stopPropagation();
            count -= 1;
            if (count === 0) {
              if (f.open_timeout != null) {
                clearTimeout(f.open_timeout);
                return delete f.open_timeout;
              }
            }
          });
          fdiv.addEventListener("dragover", (event) => {
            if (this.isDroppable(event)) {
              return event.preventDefault();
            }
          });
          return fdiv.addEventListener("drop", (event) => {
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
                  if (indexOf.call(this.manager.extensions, ext) >= 0) {
                    this.manager.fileDropped(file, f);
                  }
                } else if (i.kind === "string") {
                  i.getAsString((s) => {
                    var data, err, fullname, name;
                    console.info(s);
                    try {
                      data = JSON.parse(s);
                      if (data.type === this.manager.item && (this.drag_file != null)) {
                        if (this.drag_file.parent !== f) {
                          name = this.manager.findNewFilename(this.drag_file.shortname, this.manager.get_item, f);
                          fullname = f.getFullDashPath() + "-" + name;
                          return this.manager.renameItem(this.drag_file, fullname);
                        }
                      } else if (data.type === "folder" && (this.drag_folder != null)) {
                        if (this.drag_folder !== f && !this.drag_folder.isAncestorOf(f)) {
                          return this.moveFolder(this.drag_folder, f);
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
      })(f, fdiv, title);
      this.createItemFolder(f, content);
    }
    ref1 = folder.files;
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      f = ref1[k];
      element.appendChild(this.createItemBox(f));
    }
  }

  rebuildList(folder1) {
    var scroll_top;
    this.folder = folder1;
    scroll_top = this.panel.scrollTop;
    this.panel.innerHTML = "";
    this.createItemFolder(this.folder, this.panel);
    //@updateActiveUsers()
    this.panel.scrollTop = scroll_top;
    if (this.selected_folder != null) {
      this.setSelectedFolder(this.selected_folder);
    }
    if (this.selected_item != null) {
      this.setSelectedItem(this.selected_item);
    }
  }

  setSelectedItem(item) {
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
  }

  editFolderName(folder) {
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
      if (this.app.project.isLocked(`${this.manager.folder}/${f.name}.${f.ext}`)) {
        return;
      }
    }
    input = document.createElement("input");
    input.value = folder.name;
    span = folder.element.querySelector("span");
    span.parentNode.replaceChild(input, span);
    for (k = 0, len1 = files.length; k < len1; k++) {
      f = files[k];
      this.app.project.lockFile(`${this.manager.folder}/${f.name}.${f.ext}`);
    }
    input.focus();
    input.addEventListener("dblclick", (event) => {
      return event.stopPropagation();
    });
    input.addEventListener("blur", () => {
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
            results.push(this.app.client.sendRequest({
              name: "rename_project_file",
              project: this.app.project.id,
              source: `${this.manager.folder}/${oldpath}`,
              dest: `${this.manager.folder}/${path}`,
              thumbnail: this.manager.use_thumbnails
            }, (msg) => {
              return this.app.project[this.manager.update_list]();
            }));
          }
          return results;
        }
      }
    });
    return input.addEventListener("keydown", (event) => {
      // @app.project.lockFile "ms/#{source.name}.ms"
      if (event.key === "Enter") {
        event.preventDefault();
        input.blur();
        return false;
      } else {
        return true;
      }
    });
  }

};
