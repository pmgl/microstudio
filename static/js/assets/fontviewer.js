this.FontViewer = (function() {
  function FontViewer(manager) {
    this.manager = manager;
    this.element = document.getElementById("font-asset-viewer");
  }

  FontViewer.prototype.updateSnippet = function() {
    return this.manager.code_snippet.set([
      {
        name: "Load Font",
        value: "asset_manager.loadFont(\"" + (this.asset.name.replace(/-/g, "/")) + "\")"
      }, {
        name: "Use Font",
        value: "screen.setFont(\"" + this.asset.shortname + "\")"
      }
    ]);
  };

  FontViewer.prototype.view = function(asset) {
    var font;
    this.asset = asset;
    this.element.style.display = "block";
    this.element.innerHTML = "";
    this.updateSnippet();
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
          canvas.width = 128;
          canvas.height = 96;
          context = canvas.getContext("2d");
          context.save();
          context.fillStyle = "hsl(200,50%,85%)";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.fillStyle = "rgba(0,0,0,.75)";
          context.rect(0, 0, 124, 92);
          context.clip();
          context.font = "12pt " + asset.shortname;
          context.fillText("ABCDEFGHIJKL", 4, 36);
          context.fillText("abcdefghijkl", 4, 54);
          context.fillText("0123456789", 4, 72);
          size = 11;
          while (size > 6 && context.measureText(asset.shortname).width > 120) {
            size -= 1;
            context.font = size + "pt " + asset.shortname;
          }
          context.fillText(asset.shortname, 4, 14);
          context.restore();
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
