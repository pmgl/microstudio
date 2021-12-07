this.AssetsManager = (function() {
  function AssetsManager(app) {
    this.app = app;
    this.viewer = new AssetViewer(this);
  }

  AssetsManager.prototype.projectOpened = function() {
    return this.app.project.addListener(this);
  };

  AssetsManager.prototype.projectUpdate = function(change) {
    if (change === "assetlist") {
      return this.rebuildAssetList();
    }
  };

  AssetsManager.prototype.init = function() {
    var s;
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    s = document.createElement("script");
    s.src = "/lib/three.min.js";
    document.body.appendChild(s);
    s.onload = (function(_this) {
      return function() {
        s = document.createElement("script");
        s.src = "/lib/GLTFLoader.js";
        return document.body.appendChild(s);
      };
    })(this);
    document.getElementById("assets-section").addEventListener("dragover", (function(_this) {
      return function(event) {
        return event.preventDefault();
      };
    })(this));
    document.getElementById("assets-section").addEventListener("drop", (function(_this) {
      return function(event) {
        var err, file, i, j, len, list, ref;
        event.preventDefault();
        try {
          list = [];
          ref = event.dataTransfer.items;
          for (j = 0, len = ref.length; j < len; j++) {
            i = ref[j];
            list.push(i.getAsFile());
          }
          if (list.length > 0) {
            file = list[0];
            return _this.fileDropped(file);
          }
        } catch (error) {
          err = error;
          return console.error(err);
        }
      };
    })(this));
    this.name_validator = new InputValidator(document.getElementById("asset-name"), document.getElementById("asset-name-button"), null, (function(_this) {
      return function(value) {
        var name;
        if (_this.dropped_model != null) {
          name = value[0].toLowerCase();
          if (RegexLib.filename.test(name) && (_this.app.project.getAsset(name) == null)) {
            _this.app.project.addPendingChange(_this);
            _this.app.client.sendRequest({
              name: "write_project_file",
              project: _this.app.project.id,
              file: "assets/" + name + ".glb",
              properties: {},
              content: _this.dropped_model,
              thumbnail: _this.viewer.getThumbnail()
            }, function(msg) {
              console.info(msg);
              _this.app.project.removePendingChange(_this);
              return _this.app.project.updateAssetList();
            });
            delete _this.dropped_model;
            document.getElementById("asset-name").disabled = true;
            return _this.name_validator.validate();
          }
        }
      };
    })(this));
    this.name_validator.accept_initial = true;
    this.name_validator.auto_reset = false;
    return document.getElementById("delete-asset").addEventListener("click", (function(_this) {
      return function() {
        return _this.deleteAsset();
      };
    })(this));
  };

  AssetsManager.prototype.fileDropped = function(file) {
    var reader;
    console.info("processing " + file.name);
    reader = new FileReader();
    reader.addEventListener("load", (function(_this) {
      return function() {
        console.info("file read, size = " + reader.result.length);
        _this.viewer.view(reader.result);
        _this.dropped_model = reader.result.split(",")[1];
        console.info("file size = " + _this.dropped_model.length);
        _this.name_validator.set(file.name.split(".")[0]);
        _this.name_validator.change();
        return document.getElementById("asset-name").disabled = false;
      };
    })(this));
    return reader.readAsDataURL(file);
  };

  AssetsManager.prototype.createAssetBox = function(asset) {
    var activeuser, element, icon, iconbox, text;
    element = document.createElement("div");
    element.classList.add("asset-box");
    element.classList.add("large");
    element.setAttribute("id", "project-asset-" + asset.name);
    element.setAttribute("title", asset.name);
    if (asset.name === this.selected_asset) {
      element.classList.add("selected");
    }
    iconbox = document.createElement("div");
    iconbox.classList.add("icon-box");
    icon = new Image;
    icon.src = asset.getThumbnailURL();
    icon.setAttribute("id", "asset-image-" + asset.name);
    iconbox.appendChild(icon);
    element.appendChild(iconbox);
    element.appendChild(document.createElement("br"));
    text = document.createElement("span");
    text.innerHTML = asset.name;
    element.appendChild(text);
    element.addEventListener("click", (function(_this) {
      return function() {
        return _this.openAsset(asset.name);
      };
    })(this));
    activeuser = document.createElement("i");
    activeuser.classList.add("active-user");
    activeuser.classList.add("fa");
    activeuser.classList.add("fa-user");
    element.appendChild(activeuser);
    return element;
  };

  AssetsManager.prototype.rebuildAssetList = function() {
    var element, j, len, list, ref, s;
    list = document.getElementById("asset-list");
    list.innerHTML = "";
    ref = this.app.project.asset_list;
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      element = this.createAssetBox(s);
      list.appendChild(element);
    }
    if ((this.selected_asset != null) && (this.app.project.getAsset(this.selected_asset) == null)) {
      this.setSelectedAsset(null);
    }
  };

  AssetsManager.prototype.openAsset = function(name) {
    var asset;
    asset = this.app.project.getAsset(name);
    if (asset != null) {
      this.setSelectedAsset(name);
      return this.viewer.view(asset.getURL());
    }
  };

  AssetsManager.prototype.setSelectedAsset = function(asset) {
    var e, j, k, len, len1, list;
    this.selected_asset = asset;
    list = document.getElementById("asset-list").childNodes;
    if (this.selected_asset != null) {
      for (j = 0, len = list.length; j < len; j++) {
        e = list[j];
        if (e.getAttribute("id") === ("project-asset-" + asset)) {
          e.classList.add("selected");
        } else {
          e.classList.remove("selected");
        }
      }
      document.getElementById("asset-name").value = asset;
      this.name_validator.update();
      document.getElementById("asset-name").disabled = true;
      return this.viewer.resize();
    } else {
      for (k = 0, len1 = list.length; k < len1; k++) {
        e = list[k];
        e.classList.remove("selected");
      }
      return document.getElementById("asset-name").value = "";
    }
  };

  AssetsManager.prototype.deleteAsset = function() {
    var a, msg;
    if (this.selected_asset != null) {
      a = this.app.project.getAsset(this.selected_asset);
      if (a != null) {
        msg = this.app.translator.get("Really delete %ITEM%?").replace("%ITEM%", this.selected_asset);
        return ConfirmDialog.confirm(msg, this.app.translator.get("Delete"), this.app.translator.get("Cancel"), (function(_this) {
          return function() {
            return _this.app.client.sendRequest({
              name: "delete_project_file",
              project: _this.app.project.id,
              file: a.file,
              thumbnail: true
            }, function(msg) {
              _this.app.project.updateAssetList();
              _this.viewer.clear();
              return _this.setSelectedAsset(null);
            });
          };
        })(this));
      }
    }
  };

  return AssetsManager;

})();
