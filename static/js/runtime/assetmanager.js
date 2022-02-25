this.AssetManager = (function() {
  function AssetManager(runtime) {
    this.runtime = runtime;
  }

  AssetManager.prototype.loadFont = function(font) {
    var err, file, name, split;
    if (typeof font !== "string") {
      return;
    }
    file = font.replace(/\//g, "-");
    split = file.split("-");
    name = split[split.length - 1];
    try {
      font = new FontFace(name, "url(assets/" + file + ".ttf)");
      return font.load().then((function(_this) {
        return function() {
          return document.fonts.add(font);
        };
      })(this));
    } catch (error) {
      err = error;
      return console.error(err);
    }
  };

  AssetManager.prototype.loadModel = function(path, scene, callback) {
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
    return BABYLON.SceneLoader.LoadAssetContainer("", "assets/" + path, scene, (function(_this) {
      return function(container) {
        loader.container = container;
        loader.ready = 1;
        return callback(container);
      };
    })(this));
  };

  AssetManager.prototype.loadJSON = function(path, callback) {
    var loader;
    path = path.replace(/\//g, "-");
    path = "assets/" + path + ".json";
    loader = {
      ready: 0
    };
    fetch(path).then((function(_this) {
      return function(result) {
        return result.json().then(function(data) {
          loader.data = data;
          loader.ready = 1;
          return callback(data);
        });
      };
    })(this));
    return loader;
  };

  AssetManager.prototype.loadText = function(path, callback, ext) {
    var loader;
    if (ext == null) {
      ext = "txt";
    }
    path = path.replace(/\//g, "-");
    path = "assets/" + path + "." + ext;
    loader = {
      ready: 0
    };
    fetch(path).then((function(_this) {
      return function(result) {
        return result.text().then(function(text) {
          loader.text = text;
          loader.ready = 1;
          return callback(text);
        });
      };
    })(this));
    return loader;
  };

  AssetManager.prototype.loadCSV = function(path, callback) {
    return this.loadText(path, callback, "csv");
  };

  return AssetManager;

})();
