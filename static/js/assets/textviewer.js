this.TextViewer = (function() {
  function TextViewer(manager) {
    this.manager = manager;
    this.element = document.getElementById("text-asset-viewer");
    this.app = this.manager.app;
    this.save_delay = 3000;
    this.save_time = 0;
    setInterval(((function(_this) {
      return function() {
        return _this.checkSave();
      };
    })(this)), this.save_delay / 2);
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
    this.checkSave(true);
    this.element.style.display = "block";
    this.asset = asset;
    this.updateSnippet();
    if (!this.initialized) {
      this.initialized = true;
      this.editor = ace.edit("text-asset-viewer");
      this.editor.$blockScrolling = 2e308;
      this.editor.setTheme("ace/theme/tomorrow_night_bright");
      this.editor.setFontSize("12px");
      this.editor.setReadOnly(false);
      this.editor.getSession().on("change", (function(_this) {
        return function() {
          return _this.editorContentsChanged();
        };
      })(this));
    }
    switch (asset.ext) {
      case "json":
        this.editor.getSession().setMode("ace/mode/json");
        break;
      case "md":
        this.editor.getSession().setMode("ace/mode/markdown");
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
    this.ignore_changes = true;
    if (ext === "json") {
      try {
        text = JSON.stringify(JSON.parse(text), null, '\t');
      } catch (error) {
        err = error;
        console.error(err);
      }
    }
    this.editor.setValue(text, -1);
    this.editor.getSession().setUndoManager(new ace.UndoManager());
    this.manager.checkThumbnail(asset, (function(_this) {
      return function() {
        var canvas;
        console.info("Must create thumbnail");
        canvas = _this.createThumbnail(text, ext);
        if (asset.element != null) {
          asset.element.querySelector("img").src = canvas.toDataURL();
        }
        return _this.manager.updateAssetIcon(asset, canvas);
      };
    })(this));
    return this.ignore_changes = false;
  };

  TextViewer.prototype.createThumbnail = function(text, ext) {
    var canvas, color, context, grd, i, lines;
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
    return canvas;
  };

  TextViewer.prototype.editorContentsChanged = function() {
    document.getElementById("text-asset-viewer").style.removeProperty("background");
    if (this.ignore_changes) {
      return;
    }
    this.update_time = Date.now();
    this.save_time = Date.now();
    this.app.project.addPendingChange(this);
    if (this.asset != null) {
      this.app.project.lockFile("assets/" + this.asset.filename);
      return this.asset.content = this.editor.getValue();
    }
  };

  TextViewer.prototype.checkSave = function(immediate, callback) {
    if (immediate == null) {
      immediate = false;
    }
    if (this.save_time > 0 && (immediate || Date.now() > this.save_time + this.save_delay)) {
      this.saveFile(callback);
      return this.save_time = 0;
    }
  };

  TextViewer.prototype.forceSave = function(callback) {
    return this.checkSave(true, callback);
  };

  TextViewer.prototype.saveFile = function(callback) {
    var err, json, saved;
    saved = false;
    if (this.asset.ext === "json") {
      try {
        json = JSON.parse(this.asset.content);
        console.info("JSON parsed successfully");
      } catch (error) {
        err = error;
        document.getElementById("text-asset-viewer").style.background = "#600";
        return;
      }
    }
    this.app.client.sendRequest({
      name: "write_project_file",
      project: this.app.project.id,
      file: "assets/" + this.asset.filename,
      content: this.asset.content
    }, (function(_this) {
      return function(msg) {
        saved = true;
        if (_this.save_time === 0) {
          _this.app.project.removePendingChange(_this);
        }
        _this.asset.size = msg.size;
        if (callback != null) {
          return callback();
        }
      };
    })(this));
    return setTimeout(((function(_this) {
      return function() {
        if (!saved) {
          _this.save_time = Date.now();
          return console.info("retrying code save...");
        }
      };
    })(this)), 10000);
  };

  return TextViewer;

})();
