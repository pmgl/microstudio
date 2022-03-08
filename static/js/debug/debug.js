this.Debug = (function() {
  function Debug(app) {
    this.app = app;
    document.getElementById("open-debugger-button").addEventListener("click", (function(_this) {
      return function() {
        return _this.toggleDebugView();
      };
    })(this));
    window.addEventListener("resize", (function(_this) {
      return function() {
        if (!_this.app.appui.debug_splitbar.closed2 && _this.app.appui.debug_splitbar.position >= 99) {
          return _this.toggleDebugView();
        }
      };
    })(this));
    this.watch = new Watch(this.app);
  }

  Debug.prototype.toggleDebugView = function() {
    if (this.app.appui.debug_splitbar.closed2) {
      this.app.appui.debug_splitbar.closed2 = false;
      this.app.appui.debug_splitbar.position = Math.min(80, this.app.appui.debug_splitbar.position);
      this.watch.start();
    } else {
      this.app.appui.debug_splitbar.closed2 = true;
      this.watch.stop();
    }
    return this.app.appui.debug_splitbar.update();
  };

  Debug.prototype.projectOpened = function() {
    return this.updateDebuggerVisibility();
  };

  Debug.prototype.updateDebuggerVisibility = function() {
    if (this.app.project != null) {
      if (this.app.project.language.indexOf("microscript") >= 0) {
        return document.getElementById("open-debugger-button").style.display = "block";
      } else {
        document.getElementById("open-debugger-button").style.display = "none";
        if (!this.app.appui.debug_splitbar.closed2) {
          this.app.appui.debug_splitbar.closed2 = true;
          return this.app.appui.debug_splitbar.update();
        }
      }
    }
  };

  Debug.prototype.projectClosed = function() {
    return this.watch.reset();
  };

  return Debug;

})();
