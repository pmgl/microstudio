var indexOf = [].indexOf;

this.AssetsManager = class AssetsManager extends Manager {
  constructor(app) {
    super(app);
    this.folder = "assets";
    this.item = "asset";
    this.list_change_event = "assetlist";
    this.get_item = "getAsset";
    this.use_thumbnails = true;
    this.extensions = ["glb", "obj", "json", "ttf", "png", "jpg", "txt", "csv", "md"];
    this.update_list = "updateAssetList";
    this.model_viewer = new ModelViewer(this);
    this.font_viewer = new FontViewer(this);
    this.image_viewer = new ImageViewer(this);
    this.text_viewer = new TextViewer(this);
    this.init();
    document.querySelector("#capture-asset").addEventListener("click", () => {
      if (this.asset != null) {
        switch (this.asset.ext) {
          case "glb":
          case "obj":
            return this.model_viewer.updateThumbnail();
        }
      }
    });
    this.code_snippet = new CodeSnippet(this.app);
  }

  init() {
    super.init();
    return this.splitbar.initPosition(30);
  }

  update() {
    return super.update();
  }

  checkThumbnail(asset, callback) {
    var img, url;
    url = asset.getThumbnailURL();
    img = new Image;
    img.src = url;
    return img.onload = () => {
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
  }

  selectedItemRenamed() {
    if ((this.selected_item != null) && (this.viewer != null)) {
      return this.viewer.updateSnippet();
    }
  }

  selectedItemDeleted() {
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
  }

  openItem(name) {
    var e, j, len, parent, ref;
    super.openItem(name);
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
        case "md":
          this.text_viewer.view(this.asset);
          return this.viewer = this.text_viewer;
        case "png":
        case "jpg":
          this.image_viewer.view(this.asset);
          return this.viewer = this.image_viewer;
      }
    }
  }

  createAsset(folder) {
    var input;
    input = document.createElement("input");
    input.type = "file";
    //input.accept = ".glb"
    input.addEventListener("change", (event) => {
      var f, files, j, len;
      files = event.target.files;
      if (files.length >= 1) {
        for (j = 0, len = files.length; j < len; j++) {
          f = files[j];
          this.fileDropped(f, folder);
        }
      }
    });
    return input.click();
  }

  fileDropped(file, folder) {
    var ext, name, reader, ref, split;
    console.info(`processing ${file.name}`);
    console.info("folder: " + folder);
    reader = new FileReader();
    split = file.name.split(".");
    name = split[0];
    ext = split[split.length - 1];
    if (ref = !ext, indexOf.call(this.extensions, ref) >= 0) {
      return;
    }
    reader.addEventListener("load", () => {
      var asset, canvas, data;
      console.info("file read, size = " + reader.result.length);
      if (reader.result.length > 6000000) {
        return;
      }
      name = this.findNewFilename(name, "getAsset", folder);
      if (folder != null) {
        name = folder.getFullDashPath() + "-" + name;
      }
      if (folder != null) {
        folder.setOpen(true);
      }
      canvas = document.createElement("canvas");
      canvas.width = canvas.height = 64;
      asset = this.app.project.createAsset(name, canvas.toDataURL(), reader.result.length, ext);
      asset.uploading = true;
      if (ext === "json" || ext === "csv" || ext === "txt" || ext === "md") {
        asset.local_text = reader.result;
      } else {
        asset.local_url = reader.result;
      }
      this.setSelectedItem(name);
      this.openItem(name);
      if (ext === "json" || ext === "csv" || ext === "txt" || ext === "md") {
        data = reader.result;
      } else {
        data = reader.result.split(",")[1];
      }
      this.app.project.addPendingChange(this);
      return this.app.client.sendRequest({
        name: "write_project_file",
        project: this.app.project.id,
        file: `assets/${name}.${ext}`,
        properties: {},
        content: data,
        thumbnail: canvas.toDataURL().split(",")[1]
      }, (msg) => {
        console.info(msg);
        this.app.project.removePendingChange(this);
        asset.uploading = false;
        delete asset.local_url;
        this.app.project.updateAssetList();
        return this.checkNameFieldActivation();
      });
    });
    if (ext === "json" || ext === "csv" || ext === "txt" || ext === "md") {
      return reader.readAsText(file);
    } else {
      return reader.readAsDataURL(file);
    }
  }

  updateAssetIcon(asset, canvas) {
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
        case "md":
          return "hsl(270,50%,60%)";
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
    context.fillText(`${asset.ext.toUpperCase()}`, w - 26, h - 5);
    asset.thumbnail_url = canvas.toDataURL();
    this.app.client.sendRequest({
      name: "write_project_file",
      project: this.app.project.id,
      file: `assets/${asset.name}.${asset.ext}`,
      thumbnail: canvas.toDataURL().split(",")[1]
    }, (msg) => {
      return console.info(msg);
    });
    if (asset.element != null) {
      return asset.element.querySelector("img").src = canvas.toDataURL();
    }
  }

};

this.CodeSnippet = class CodeSnippet {
  constructor(app1) {
    var copyable;
    this.app = app1;
    copyable = true;
    this.container = document.querySelector("#asset-load-code");
    this.input = document.querySelector("#asset-load-code input");
    this.select = document.querySelector("#asset-load-code select");
    this.select.addEventListener("change", () => {
      return this.setIndex(this.select.selectedIndex);
    });
    document.querySelector("#asset-load-code i").addEventListener("click", () => {
      var code, copy, input;
      if (!copyable) {
        return;
      }
      input = document.querySelector("#asset-load-code input");
      copy = document.querySelector("#asset-load-code i");
      code = input.value;
      navigator.clipboard.writeText(code);
      input.value = this.app.translator.get("Copied!");
      copyable = false;
      copy.classList.remove("fa-copy");
      copy.classList.add("fa-check");
      return setTimeout((() => {
        copy.classList.remove("fa-check");
        copy.classList.add("fa-copy");
        input.value = code;
        return copyable = true;
      }), 1000);
    });
  }

  clear() {
    this.select.innerHTML = "";
    this.input.value = "";
    return this.container.style.display = "none";
  }

  set(list) {
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
  }

  setIndex(index) {
    if ((this.list != null) && index < this.list.length) {
      return this.input.value = this.list[index].value;
    }
  }

};

this.CodeSnippetField = class CodeSnippetField {
  constructor(app1, query) {
    var copyable;
    this.app = app1;
    this.element = document.querySelector(query);
    this.input = this.element.querySelector("input");
    this.i = this.element.querySelector("i");
    copyable = true;
    this.i.addEventListener("click", () => {
      var code;
      if (!copyable) {
        return;
      }
      code = this.input.value;
      navigator.clipboard.writeText(code);
      this.input.value = this.app.translator.get("Copied!");
      copyable = false;
      this.i.classList.remove("fa-copy");
      this.i.classList.add("fa-check");
      return setTimeout((() => {
        this.i.classList.remove("fa-check");
        this.i.classList.add("fa-copy");
        this.input.value = this.code;
        return copyable = true;
      }), 1000);
    });
  }

  set(code1) {
    this.code = code1;
    return this.input.value = this.code;
  }

};
