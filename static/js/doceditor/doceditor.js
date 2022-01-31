this.DocEditor = (function() {
  function DocEditor(app) {
    this.app = app;
    this.editor = ace.edit("doc-editor");
    this.editor.$blockScrolling = 2e308;
    this.editor.setTheme("ace/theme/tomorrow_night_bright");
    this.editor.getSession().setMode("ace/mode/markdown");
    this.editor.setFontSize("14px");
    this.editor.session.setOptions({
      tabSize: 2,
      useSoftTabs: true
    });
    this.save_delay = 3000;
    this.save_time = 0;
    setInterval(((function(_this) {
      return function() {
        return _this.checkSave();
      };
    })(this)), this.save_delay / 2);
    this.editor.getSession().on("change", (function(_this) {
      return function() {
        return _this.editorContentsChanged();
      };
    })(this));
    document.getElementById("doceditor-start-tutorial").addEventListener("click", (function(_this) {
      return function() {
        var p, url;
        p = _this.app.project;
        if (p["public"]) {
          url = location.origin + ("/tutorial/" + p.owner.nick + "/" + p.slug + "/");
        } else {
          url = location.origin + ("/tutorial/" + p.owner.nick + "/" + p.slug + "/" + p.code + "/");
        }
        return window.open(url, "_blank");
      };
    })(this));
  }

  DocEditor.prototype.editorContentsChanged = function() {
    var e, el, i, len, list, src;
    src = this.editor.getValue();
    e = document.getElementById("doc-render");
    e.innerHTML = DOMPurify.sanitize(marked(src));
    list = e.getElementsByTagName("a");
    for (i = 0, len = list.length; i < len; i++) {
      el = list[i];
      el.target = "_blank";
    }
    if (this.ignore_changes) {
      return;
    }
    this.app.project.addPendingChange(this);
    this.save_time = Date.now();
    return this.checkTutorial();
  };

  DocEditor.prototype.checkSave = function(immediate, callback) {
    if (this.save_time > 0 && (immediate || Date.now() > this.save_time + this.save_delay)) {
      this.saveDoc(callback);
      return this.save_time = 0;
    }
  };

  DocEditor.prototype.forceSave = function(callback) {
    return this.checkSave(true, callback);
  };

  DocEditor.prototype.saveDoc = function(callback) {
    var saved;
    saved = false;
    this.app.client.sendRequest({
      name: "write_project_file",
      project: this.app.project.id,
      file: "doc/doc.md",
      content: this.editor.getValue()
    }, (function(_this) {
      return function(msg) {
        saved = true;
        if (_this.save_time === 0) {
          _this.app.project.removePendingChange(_this);
        }
        if (callback != null) {
          return callback();
        }
      };
    })(this));
    return setTimeout(((function(_this) {
      return function() {
        if (!saved) {
          _this.save_time = Date.now();
          return console.info("retrying doc save...");
        }
      };
    })(this)), 10000);
  };

  DocEditor.prototype.setDoc = function(doc) {
    this.ignore_changes = true;
    this.editor.setValue(doc, -1);
    this.ignore_changes = false;
    this.editor.getSession().setUndoManager(new ace.UndoManager());
    return this.checkTutorial();
  };

  DocEditor.prototype.checkTutorial = function() {
    if ((this.app.project != null) && this.app.project.type === "tutorial") {
      return document.getElementById("doceditor-start-tutorial").style.display = "block";
    } else {
      return document.getElementById("doceditor-start-tutorial").style.display = "none";
    }
  };

  return DocEditor;

})();
