var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

this.Manager = (function() {
  function Manager(app) {
    this.app = app;
    this.box_width = 64;
    this.box_height = 84;
  }

  Manager.prototype.init = function() {
    this.splitbar = new SplitBar(this.folder + "-section", "horizontal");
    this.splitbar.setPosition(20);
    if (this.fileDropped != null) {
      document.getElementById(this.item + "list").addEventListener("dragover", (function(_this) {
        return function(event) {
          return event.preventDefault();
        };
      })(this));
      document.getElementById(this.item + "list").addEventListener("drop", (function(_this) {
        return function(event) {
          var err, ext, file, i, j, len, list, ref, results;
          event.preventDefault();
          document.getElementById(_this.item + "list").classList.remove("dragover");
          try {
            list = [];
            ref = event.dataTransfer.items;
            for (j = 0, len = ref.length; j < len; j++) {
              i = ref[j];
              list.push(i.getAsFile());
            }
            results = [];
            while (list.length > 0) {
              file = list.splice(0, 1)[0];
              ext = file.name.split(".")[1].toLowerCase();
              if (indexOf.call(_this.extensions, ext) >= 0) {
                results.push(_this.fileDropped(file));
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
      document.getElementById(this.item + "list").addEventListener("dragenter", (function(_this) {
        return function(event) {
          return document.getElementById(_this.item + "list").classList.add("dragover");
        };
      })(this));
      document.getElementById(this.item + "list").addEventListener("dragleave", (function(_this) {
        return function(event) {
          return document.getElementById(_this.item + "list").classList.remove("dragover");
        };
      })(this));
    }
    this.name_validator = new InputValidator(document.getElementById(this.item + "-name"), document.getElementById(this.item + "-name-button"), null, (function(_this) {
      return function(value) {
        var item, name, old;
        if (!_this.selected_item) {
          return;
        }
        item = _this.app.project[_this.get_item](_this.selected_item);
        if (item == null) {
          return;
        }
        if (_this.app.project.isLocked(_this.folder + "/" + item.name + "." + item.ext)) {
          return;
        }
        _this.app.project.lockFile(_this.folder + "/" + item.name + "." + item.ext);
        name = value[0].toLowerCase();
        name = RegexLib.fixFilename(name);
        document.getElementById(_this.item + "-name").value = name;
        _this.name_validator.update();
        if (name !== _this.selected_item && RegexLib.filename.test(name) && (_this.app.project[_this.get_item](name) == null)) {
          old = _this.selected_item;
          _this.selected_item = name;
          return _this.app.client.sendRequest({
            name: "rename_project_file",
            project: _this.app.project.id,
            source: _this.folder + "/" + old + "." + item.ext,
            dest: _this.folder + "/" + name + "." + item.ext,
            thumbnail: _this.use_thumbnails
          }, function(msg) {
            return _this.app.project[_this.update_list]();
          });
        }
      };
    })(this));
    this.name_validator.regex = RegexLib.filename;
    return document.getElementById("delete-" + this.item).addEventListener("click", (function(_this) {
      return function() {
        return _this.deleteItem();
      };
    })(this));
  };

  Manager.prototype.update = function() {
    return this.splitbar.update();
  };

  Manager.prototype.projectOpened = function() {
    this.app.project.addListener(this);
    return this.setSelectedItem(null);
  };

  Manager.prototype.projectUpdate = function(change) {
    if (change === this.list_change_event) {
      return this.rebuildList();
    }
  };

  Manager.prototype.createItemBox = function(item) {
    var activeuser, element, icon, text;
    element = document.createElement("div");
    element.classList.add("asset-box");
    element.setAttribute("style", "width:" + this.box_width + "px ; height:" + this.box_height + "px");
    element.setAttribute("id", "project-" + this.item + "-" + item.name);
    element.setAttribute("title", item.name);
    if (item.name === this.selected_item) {
      element.classList.add("selected");
    }
    icon = new Image;
    icon.src = item.getThumbnailURL();
    icon.setAttribute("id", "asset-image-" + item.name);
    element.appendChild(icon);
    text = document.createElement("div");
    text.classList.add("asset-box-name");
    text.innerHTML = item.name;
    element.appendChild(text);
    element.addEventListener("click", (function(_this) {
      return function() {
        return _this.openItem(item.name);
      };
    })(this));
    activeuser = document.createElement("i");
    activeuser.classList.add("active-user");
    activeuser.classList.add("fa");
    activeuser.classList.add("fa-user");
    element.appendChild(activeuser);
    return element;
  };

  Manager.prototype.rebuildList = function() {
    var element, j, len, list, ref, s;
    list = document.getElementById(this.item + "-list");
    list.innerHTML = "";
    ref = this.app.project[this.item + "_list"];
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      element = this.createItemBox(s);
      list.appendChild(element);
    }
    if ((this.selected_item != null) && (this.app.project[this.get_item](this.selected_item) == null)) {
      this.setSelectedItem(null);
    }
  };

  Manager.prototype.openItem = function(name) {
    var item;
    item = this.app.project[this.get_item](name);
    if (item != null) {
      return this.setSelectedItem(name);
    }
  };

  Manager.prototype.setSelectedItem = function(item) {
    var e, j, k, len, len1, list;
    this.selected_item = item;
    list = document.getElementById(this.item + "-list").childNodes;
    if (this.selected_item != null) {
      for (j = 0, len = list.length; j < len; j++) {
        e = list[j];
        if (e.getAttribute("id") === ("project-" + this.item + "-" + item)) {
          e.classList.add("selected");
        } else {
          e.classList.remove("selected");
        }
      }
      document.getElementById(this.item + "-name").value = item;
      this.name_validator.update();
      document.getElementById(this.item + "-name").disabled = false;
      item = this.app.project[this.get_item](this.selected_item);
      if ((item != null) && item.uploading) {
        return document.getElementById(this.item + "-name").disabled = true;
      }
    } else {
      for (k = 0, len1 = list.length; k < len1; k++) {
        e = list[k];
        e.classList.remove("selected");
      }
      document.getElementById(this.item + "-name").value = "";
      return document.getElementById(this.item + "-name").disabled = true;
    }
  };

  Manager.prototype.checkNameFieldActivation = function() {
    var item;
    if (!this.selected_item) {
      return;
    }
    item = this.app.project[this.get_item](this.selected_item);
    if (item != null) {
      return document.getElementById(this.item + "-name").disabled = item.uploading ? true : false;
    }
  };

  Manager.prototype.deleteItem = function() {
    var a, text;
    if (this.selected_item != null) {
      a = this.app.project[this.get_item](this.selected_item);
      if (a != null) {
        text = this.app.translator.get("Do you really want to delete %ITEM%?").replace("%ITEM%", this.selected_item);
        return ConfirmDialog.confirm(text, this.app.translator.get("Delete"), this.app.translator.get("Cancel"), (function(_this) {
          return function() {
            return _this.app.client.sendRequest({
              name: "delete_project_file",
              project: _this.app.project.id,
              file: a.file,
              thumbnail: _this.use_thumbnails
            }, function(msg) {
              _this.app.project[_this.update_list]();
              return _this.setSelectedItem(null);
            });
          };
        })(this));
      }
    }
  };

  Manager.prototype.findNewFilename = function(name, getter) {
    var count;
    name = RegexLib.fixFilename(name);
    if (name.length > 30) {
      name = name.substring(0, 30);
    }
    if (this.app.project[getter](name)) {
      count = 2;
      while (this.app.project[getter](name + count)) {
        count += 1;
      }
      name = name + count;
    }
    return name;
  };

  return Manager;

})();
