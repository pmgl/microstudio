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

  return AssetManager;

})();
