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
            case "obj":
              return _this.model_viewer.updateThumbnail();
          }
        }
      };
    })(this));
    this.code_snippet = new CodeSnippet(this.app);
  }

  AssetsManager.prototype.init = function() {
    AssetsManager.__super__.init.call(this);
    return this.splitbar.setPosition(30);
  };

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

  AssetsManager.prototype.selectedItemRenamed = function() {
    if ((this.selected_item != null) && (this.viewer != null)) {
      return this.viewer.updateSnippet();
    }
  };

  AssetsManager.prototype.selectedItemDeleted = function() {
    var e, j, len, parent, ref;
    parent = document.getElementById("asset-viewer");
    ref = parent.childNodes;
    for (j = 0, len = ref.length; j < len; j++) {
      e = ref[j];
      e.style.display = "none";
    }
    this.viewer = null;
    this.asset = null;
    this.code_snippet.clear();
  };

  AssetsManager.prototype.openItem = function(name) {
    var e, j, len, parent, ref;
    AssetsManager.__super__.openItem.call(this, name);
    this.asset = this.app.project.getAsset(name);
    console.info(this.asset);
    parent = document.getElementById("asset-viewer");
    ref = parent.childNodes;
    for (j = 0, len = ref.length; j < len; j++) {
      e = ref[j];
      e.style.display = "none";
    }
    if (this.asset != null) {
      switch (this.asset.ext) {
        case "ttf":
          this.font_viewer.view(this.asset);
          return this.viewer = this.font_viewer;
        case "glb":
        case "obj":
          this.model_viewer.view(this.asset);
          return this.viewer = this.model_viewer;
        case "json":
        case "txt":
        case "csv":
          this.text_viewer.view(this.asset);
          return this.viewer = this.text_viewer;
        case "png":
        case "jpg":
          this.image_viewer.view(this.asset);
          return this.viewer = this.image_viewer;
      }
    }
  };

  AssetsManager.prototype.createAsset = function(folder) {
    var input;
    input = document.createElement("input");
    input.type = "file";
    input.addEventListener("change", (function(_this) {
      return function(event) {
        var f, files, j, len;
        files = event.target.files;
        if (files.length >= 1) {
          for (j = 0, len = files.length; j < len; j++) {
            f = files[j];
            _this.fileDropped(f, folder);
          }
        }
      };
    })(this));
    return input.click();
  };

  AssetsManager.prototype.fileDropped = function(file, folder) {
    var ext, name, reader, ref, split;
    console.info("processing " + file.name);
    console.info("folder: " + folder);
    reader = new FileReader();
    split = file.name.split(".");
    name = split[0];
    ext = split[split.length - 1];
    if (ref = !ext, indexOf.call(this.extensions, ref) >= 0) {
      return;
    }
    reader.addEventListener("load", (function(_this) {
      return function() {
        var asset, canvas, data;
        console.info("file read, size = " + reader.result.length);
        if (reader.result.length > 6000000) {
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
        if (ext === "json" || ext === "csv" || ext === "txt") {
          asset.local_text = reader.result;
        } else {
          asset.local_url = reader.result;
        }
        _this.setSelectedItem(name);
        _this.openItem(name);
        if (ext === "json" || ext === "csv" || ext === "txt") {
          data = reader.result;
        } else {
          data = reader.result.split(",")[1];
        }
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
          delete asset.local_url;
          _this.app.project.updateAssetList();
          return _this.checkNameFieldActivation();
        });
      };
    })(this));
    if (ext === "json" || ext === "csv" || ext === "txt") {
      return reader.readAsText(file);
    } else {
      return reader.readAsDataURL(file);
    }
  };

  AssetsManager.prototype.updateAssetIcon = function(asset, canvas) {
    var color, context, h, w;
    context = canvas.getContext("2d");
    color = (function() {
      switch (asset.ext) {
        case "ttf":
          return "hsl(200,50%,60%)";
        case "json":
          return "hsl(0,50%,60%)";
        case "csv":
          return "hsl(60,50%,60%)";
        case "txt":
          return "hsl(160,50%,60%)";
        case "glb":
          return "hsl(300,50%,60%)";
        case "obj":
          return "hsl(240,50%,70%)";
        default:
          return "hsl(0,0%,60%)";
      }
    })();
    w = canvas.width;
    h = canvas.height;
    context.fillStyle = "#222";
    context.fillRect(w - 30, h - 16, 30, 16);
    context.fillStyle = color;
    context.fillRect(0, h - 2, w, 2);
    context.font = "7pt sans-serif";
    context.fillText("" + (asset.ext.toUpperCase()), w - 26, h - 5);
    asset.thumbnail_url = canvas.toDataURL();
    this.app.client.sendRequest({
      name: "write_project_file",
      project: this.app.project.id,
      file: "assets/" + asset.name + "." + asset.ext,
      thumbnail: canvas.toDataURL().split(",")[1]
    }, (function(_this) {
      return function(msg) {
        return console.info(msg);
      };
    })(this));
    if (asset.element != null) {
      return asset.element.querySelector("img").src = canvas.toDataURL();
    }
  };

  return AssetsManager;

})(Manager);

this.CodeSnippet = (function() {
  function CodeSnippet(app) {
    var copyable;
    this.app = app;
    copyable = true;
    this.container = document.querySelector("#asset-load-code");
    this.input = document.querySelector("#asset-load-code input");
    this.select = document.querySelector("#asset-load-code select");
    this.select.addEventListener("change", (function(_this) {
      return function() {
        return _this.setIndex(_this.select.selectedIndex);
      };
    })(this));
    document.querySelector("#asset-load-code i").addEventListener("click", (function(_this) {
      return function() {
        var code, copy, input;
        if (!copyable) {
          return;
        }
        input = document.querySelector("#asset-load-code input");
        copy = document.querySelector("#asset-load-code i");
        code = input.value;
        navigator.clipboard.writeText(code);
        input.value = _this.app.translator.get("Copied!");
        copyable = false;
        copy.classList.remove("fa-copy");
        copy.classList.add("fa-check");
        return setTimeout((function() {
          copy.classList.remove("fa-check");
          copy.classList.add("fa-copy");
          input.value = code;
          return copyable = true;
        }), 1000);
      };
    })(this));
  }

  CodeSnippet.prototype.clear = function() {
    this.select.innerHTML = "";
    this.input.value = "";
    return this.container.style.display = "none";
  };

  CodeSnippet.prototype.set = function(list) {
    var i, j, len, name, option, ref, snippet, value;
    this.list = list;
    this.clear();
    ref = this.list;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      snippet = ref[i];
      name = this.app.translator.get(snippet.name);
      value = snippet.value;
      option = document.createElement("option");
      option.value = i;
      option.innerText = name;
      this.select.appendChild(option);
      if (i === 0) {
        this.input.value = snippet.value;
      }
    }
    return this.container.style.display = "block";
  };

  CodeSnippet.prototype.setIndex = function(index) {
    if ((this.list != null) && index < this.list.length) {
      return this.input.value = this.list[index].value;
    }
  };

  return CodeSnippet;

})();
