this.FontViewer = (function() {
  function FontViewer(manager) {
    this.manager = manager;
    this.element = document.getElementById("font-asset-viewer");
  }

  FontViewer.prototype.view = function(asset) {
    var font, input;
    this.element.style.display = "block";
    this.element.innerHTML = "";
    input = document.querySelector("#asset-load-code input");
    input.value = "AssetManager.loadFont( \"" + (asset.name.replace(/-/g, "/")) + "\" )";
    font = new FontFace(asset.shortname, "url(" + (asset.getURL()) + ")");
    return font.load().then((function(_this) {
      return function() {
        document.fonts.add(font);
        _this.element.style["font-family"] = asset.shortname;
        _this.element.innerHTML = "<h1>" + asset.shortname + "</h1>\n<h2>ABCDEFGHIJKLMNOPQRSTUVWXYZ</h2>\n<h2>abcdefghijklmnopqrstuvwxyz</h2>\n<h2>0123456789</h2>\n<p>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>\n<p>abcdefghijklmnopqrstuvwxyz</p>\n<p>0123456789</p>";
        return _this.manager.checkThumbnail(asset, function() {
          var canvas, context, size;
          console.info("Must create thumbnail");
          canvas = document.createElement("canvas");
          canvas.width = canvas.height = 64;
          context = canvas.getContext("2d");
          context.fillStyle = "#EEE";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.fillStyle = "#444";
          context.rect(4, 4, 56, 56);
          context.clip();
          context.font = "11pt " + asset.shortname;
          context.fillText("ABCD", 4, 32);
          context.fillText("abcd", 4, 46);
          context.fillText("1234", 4, 60);
          size = 11;
          while (size > 6 && context.measureText(asset.shortname).width > 56) {
            size -= 1;
            context.font = size + "pt " + asset.shortname;
          }
          context.fillText(asset.shortname, 4, 14);
          if (asset.element != null) {
            asset.element.querySelector("img").src = canvas.toDataURL();
          }
          return _this.manager.updateAssetIcon(asset, canvas);
        });
      };
    })(this));
  };

  return FontViewer;

})();
