this.TextViewer = (function() {
  function TextViewer(manager) {
    this.manager = manager;
    this.element = document.getElementById("text-asset-viewer");
  }

  TextViewer.prototype.updateSnippet = function() {
    switch (this.asset.ext) {
      case "json":
        return this.manager.code_snippet.set([
          {
            name: "Load JSON as object",
            value: "loader = asset_manager.loadJSON(\"" + (this.asset.name.replace(/-/g, "/")) + "\", callback)"
          }
        ]);
      case "csv":
        return this.manager.code_snippet.set([
          {
            name: "Load CSV file as text",
            value: "loader = asset_manager.loadCSV(\"" + (this.asset.name.replace(/-/g, "/")) + "\", callback)"
          }
        ]);
      case "txt":
        return this.manager.code_snippet.set([
          {
            name: "Load text file",
            value: "loader = asset_manager.loadText(\"" + (this.asset.name.replace(/-/g, "/")) + "\", callback)"
          }
        ]);
    }
  };

  TextViewer.prototype.view = function(asset) {
    this.element.style.display = "block";
    this.asset = asset;
    this.updateSnippet();
    if (!this.initialized) {
      this.initialized = true;
      this.editor = ace.edit("text-asset-viewer");
      this.editor.$blockScrolling = 2e308;
      this.editor.setTheme("ace/theme/tomorrow_night_bright");
      this.editor.setFontSize("12px");
      this.editor.setReadOnly(true);
    }
    switch (asset.ext) {
      case "json":
        this.editor.getSession().setMode("ace/mode/json");
        break;
      default:
        this.editor.getSession().setMode("ace/mode/text");
    }
    if (asset.local_text != null) {
      return this.setText(asset, asset.local_text, asset.ext);
    } else {
      return fetch(asset.getURL()).then((function(_this) {
        return function(result) {
          return result.text().then(function(text) {
            return _this.setText(asset, text, asset.ext);
          });
        };
      })(this));
    }
  };

  TextViewer.prototype.setText = function(asset, text, ext) {
    var err;
    if (ext === "json") {
      try {
        text = JSON.stringify(JSON.parse(text), null, '\t');
      } catch (error) {
        err = error;
        console.error(err);
      }
    }
    this.editor.setValue(text, -1);
    return this.manager.checkThumbnail(asset, (function(_this) {
      return function() {
        var canvas, color, context, grd, i, lines;
        console.info("Must create thumbnail");
        canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 96;
        context = canvas.getContext("2d");
        context.save();
        context.fillStyle = "#222";
        context.fillRect(0, 0, canvas.width, canvas.height);
        color = (function() {
          switch (ext) {
            case "json":
              return "hsl(0,50%,60%)";
            case "csv":
              return "hsl(60,50%,60%)";
            default:
              return "hsl(160,50%,60%)";
          }
        })();
        grd = context.createLinearGradient(0, 0, 0, 96);
        grd.addColorStop(0, color);
        grd.addColorStop(1, "#222");
        context.fillStyle = grd;
        context.rect(4, 4, 120, 120);
        context.clip();
        context.font = "5pt Verdana";
        lines = text.split("\n");
        i = 0;
        while (i < lines.length && i < 10) {
          context.fillText(lines[i], 4, 10 + i * 8);
          i += 1;
        }
        context.restore();
        if (asset.element != null) {
          asset.element.querySelector("img").src = canvas.toDataURL();
        }
        return _this.manager.updateAssetIcon(asset, canvas);
      };
    })(this));
  };

  return TextViewer;

})();
