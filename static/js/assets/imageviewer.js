this.ImageViewer = (function() {
  function ImageViewer(manager) {
    this.manager = manager;
    this.element = document.getElementById("image-asset-viewer");
  }

  ImageViewer.prototype.updateSnippet = function() {
    return this.manager.code_snippet.set([
      {
        name: "Load Image",
        value: "image = asset_manager.loadImage(\"" + (this.asset.name.replace(/-/g, "/")) + "\", callback)"
      }
    ]);
  };

  ImageViewer.prototype.view = function(asset) {
    this.element.style.display = "block";
    this.asset = asset;
    this.updateSnippet();
    this.element.style["background-image"] = "url(" + (asset.getURL()) + ") ";
    return this.manager.checkThumbnail(asset, (function(_this) {
      return function() {
        return _this.createThumbnail(asset.getURL(), function(canvas) {
          if (asset.element != null) {
            asset.element.querySelector("img").src = canvas.toDataURL();
          }
          return _this.manager.updateAssetIcon(asset, canvas);
        });
      };
    })(this));
  };

  ImageViewer.prototype.createThumbnail = function(url, callback) {
    var img;
    img = new Image;
    img.src = url;
    return img.onload = (function(_this) {
      return function() {
        var canvas, context, r;
        canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 96;
        context = canvas.getContext("2d");
        context.save();
        context.fillStyle = "#222";
        context.fillRect(0, 0, canvas.width, canvas.height);
        r = Math.max(canvas.width / img.width, canvas.height / img.height);
        context.translate(canvas.width / 2, canvas.height / 2);
        context.drawImage(img, -r * img.width / 2, -r * img.height / 2, r * img.width, r * img.height);
        return callback(canvas);
      };
    })(this);
  };

  return ImageViewer;

})();
