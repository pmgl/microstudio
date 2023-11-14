this.AssetManager = class AssetManager {
  constructor(runtime) {
    this.runtime = runtime;
    this.interface = {
      loadFont: (font) => {
        return this.loadFont(font);
      },
      loadModel: (path, scene, callback) => {
        return this.loadModel(path, scene, callback);
      },
      loadImage: (path, callback) => {
        return this.loadImage(path, callback);
      },
      loadJSON: (path, callback) => {
        return this.loadJSON(path, callback);
      },
      loadText: (path, callback) => {
        return this.loadText(path, callback);
      },
      loadCSV: (path, callback) => {
        return this.loadCSV(path, callback);
      },
      loadMarkdown: (path, callback) => {
        return this.loadMarkdown(path, callback);
      }
    };
  }

  getInterface() {
    return this.interface;
  }

  loadFont(font) {
    var err, file, name, split;
    if (typeof font !== "string") {
      return;
    }
    file = font.replace(/\//g, "-");
    split = file.split("-");
    name = split[split.length - 1];
    try {
      font = new FontFace(name, `url(assets/${file}.ttf)`);
      return font.load().then(() => {
        return document.fonts.add(font);
      });
    } catch (error) {
      err = error;
      return console.error(err);
    }
  }

  loadModel(path, scene, callback) {
    var loader;
    if (typeof BABYLON === "undefined" || BABYLON === null) {
      return;
    }
    loader = {
      ready: 0
    };
    if (this.runtime.assets[path] != null) {
      path = this.runtime.assets[path].file;
    } else {
      path = path.replace(/\//g, "-");
      path += ".glb";
    }
    return BABYLON.SceneLoader.LoadAssetContainer("", `assets/${path}`, scene, (container) => {
      loader.container = container;
      loader.ready = 1;
      if (callback) {
        return callback(container);
      }
    });
  }

  loadImage(path, callback) {
    var img, loader;
    loader = {
      ready: 0
    };
    if (this.runtime.assets[path] != null) {
      path = this.runtime.assets[path].file;
    }
    img = new Image;
    img.src = `assets/${path}`;
    img.onload = () => {
      var i;
      i = new msImage(img);
      loader.image = i;
      loader.ready = 1;
      if (callback) {
        return callback(i);
      }
    };
    return loader;
  }

  loadJSON(path, callback) {
    var loader;
    path = path.replace(/\//g, "-");
    path = `assets/${path}.json`;
    loader = {
      ready: 0
    };
    fetch(path).then((result) => {
      return result.json().then((data) => {
        loader.data = data;
        loader.ready = 1;
        if (callback) {
          return callback(data);
        }
      });
    });
    return loader;
  }

  loadText(path, callback, ext = "txt") {
    var loader;
    path = path.replace(/\//g, "-");
    path = `assets/${path}.${ext}`;
    loader = {
      ready: 0
    };
    fetch(path).then((result) => {
      return result.text().then((text) => {
        loader.text = text;
        loader.ready = 1;
        if (callback) {
          return callback(text);
        }
      });
    });
    return loader;
  }

  loadCSV(path, callback) {
    return this.loadText(path, callback, "csv");
  }

  loadMarkdown(path, callback) {
    return this.loadText(path, callback, "md");
  }

};
