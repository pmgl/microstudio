var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

this.AssetsManager = (function(superClass) {
  extend(AssetsManager, superClass);

  function AssetsManager(app) {
    this.app = app;
    AssetsManager.__super__.constructor.call(this, this.app);
    this.folder = "assets";
    this.item = "asset";
    this.list_change_event = "assetlist";
    this.get_item = "getAsset";
    this.use_thumbnails = true;
    this.extensions = ["glb", "obj", "json", "ttf", "png", "jpg", "txt", "csv"];
    this.update_list = "updateAssetList";
    this.model_viewer = new ModelViewer(this);
    this.font_viewer = new FontViewer(this);
    this.image_viewer = new ImageViewer(this);
    this.text_viewer = new TextViewer(this);
    this.init();
    document.querySelector("#capture-asset").addEventListener("click", (function(_this) {
      return function() {
        if (_this.asset != null) {
          switch (_this.asset.ext) {
            case "glb":
              return _this.model_viewer.updateThumbnail();
          }
        }
      };
    })(this));
    document.querySelector("#asset-load-code i").addEventListener("click", (function(_this) {
      return function() {
        var code, copy, input;
        input = document.querySelector("#asset-load-code input");
        copy = document.querySelector("#asset-load-code i");
        code = input.value;
        navigator.clipboard.writeText(code);
        input.value = _this.app.translator.get("Copied!");
        copy.classList.remove("fa-copy");
        copy.classList.add("fa-check");
        return setTimeout((function() {
          copy.classList.remove("fa-check");
          copy.classList.add("fa-copy");
          return input.value = code;
        }), 1000);
      };
    })(this));
  }

  AssetsManager.prototype.update = function() {
    return AssetsManager.__super__.update.call(this);
  };

  AssetsManager.prototype.checkThumbnail = function(asset, callback) {
    var img, url;
    url = asset.getThumbnailURL();
    img = new Image;
    img.src = url;
    return img.onload = (function(_this) {
      return function() {
        var canvas, ctx, data;
        if (img.width > 0 && img.height > 0) {
          canvas = document.createElement("canvas");
          canvas.width = 1;
          canvas.height = 1;
          ctx = canvas.getContext("2d");
          ctx.drawImage(img, -31, -31);
          data = ctx.getImageData(0, 0, 1, 1);
          if (data.data[3] > 128) {
            return;
          }
        }
        return callback();
      };
    })(this);
  };

  AssetsManager.prototype.openItem = function(name) {
    var e, i, len, parent, ref;
    AssetsManager.__super__.openItem.call(this, name);
    this.asset = this.app.project.getAsset(name);
    console.info(this.asset);
    parent = document.getElementById("asset-viewer");
    ref = parent.childNodes;
    for (i = 0, len = ref.length; i < len; i++) {
      e = ref[i];
      e.style.display = "none";
    }
    if (this.asset != null) {
      switch (this.asset.ext) {
        case "ttf":
          return this.font_viewer.view(this.asset);
        case "glb":
          return this.model_viewer.view(this.asset);
      }
    }
  };

  AssetsManager.prototype.createAsset = function(folder) {
    var input;
    input = document.createElement("input");
    input.type = "file";
    input.addEventListener("change", (function(_this) {
      return function(event) {
        var f, files, i, len;
        files = event.target.files;
        if (files.length >= 1) {
          for (i = 0, len = files.length; i < len; i++) {
            f = files[i];
            _this.fileDropped(f, folder);
          }
        }
      };
    })(this));
    return input.click();
  };

  AssetsManager.prototype.fileDropped = function(file, folder) {
    var reader;
    console.info("processing " + file.name);
    console.info("folder: " + folder);
    reader = new FileReader();
    reader.addEventListener("load", (function(_this) {
      return function() {
        var asset, canvas, data, ext, name, ref, split;
        console.info("file read, size = " + reader.result.length);
        if (reader.result.length > 6000000) {
          return;
        }
        split = file.name.split(".");
        name = split[0];
        ext = split[1];
        if (ref = !ext, indexOf.call(_this.extensions, ref) >= 0) {
          return;
        }
        name = _this.findNewFilename(name, "getAsset", folder);
        if (folder != null) {
          name = folder.getFullDashPath() + "-" + name;
        }
        if (folder != null) {
          folder.setOpen(true);
        }
        canvas = document.createElement("canvas");
        canvas.width = canvas.height = 64;
        asset = _this.app.project.createAsset(name, canvas.toDataURL(), reader.result.length, ext);
        asset.uploading = true;
        asset.local_url = reader.result;
        _this.setSelectedItem(name);
        _this.openItem(name);
        data = reader.result.split(",")[1];
        _this.app.project.addPendingChange(_this);
        return _this.app.client.sendRequest({
          name: "write_project_file",
          project: _this.app.project.id,
          file: "assets/" + name + "." + ext,
          properties: {},
          content: data,
          thumbnail: canvas.toDataURL().split(",")[1]
        }, function(msg) {
          console.info(msg);
          _this.app.project.removePendingChange(_this);
          asset.uploading = false;
          _this.app.project.updateAssetList();
          return _this.checkNameFieldActivation();
        });
      };
    })(this));
    return reader.readAsDataURL(file);
  };

  AssetsManager.prototype.updateAssetIcon = function(asset, canvas) {
    return this.app.client.sendRequest({
      name: "write_project_file",
      project: this.app.project.id,
      file: "assets/" + asset.name + "." + asset.ext,
      thumbnail: canvas.toDataURL().split(",")[1]
    }, (function(_this) {
      return function(msg) {
        return console.info(msg);
      };
    })(this));
  };

  return AssetsManager;

})(Manager);
