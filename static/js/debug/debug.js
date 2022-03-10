this.Debug = (function() {
  function Debug(app) {
    this.app = app;
    document.getElementById("open-debugger-button").addEventListener("click", (function(_this) {
      return function() {
        return _this.toggleDebugView();
      };
    })(this));
    document.getElementById("open-timemachine-button").addEventListener("click", (function(_this) {
      return function() {
        return _this.toggleTimeMachineView();
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
    this.time_machine = new TimeMachine(this.app);
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

  Debug.prototype.toggleTimeMachineView = function() {
    if (this.time_machine_open) {
      this.time_machine_open = false;
      document.getElementById("debug-timemachine-bar").style.display = "none";
      document.getElementById("terminal-debug-container").style.top = "2px";
      return this.time_machine.closed();
    } else {
      this.time_machine_open = true;
      document.getElementById("debug-timemachine-bar").style.display = "block";
      return document.getElementById("terminal-debug-container").style.top = "42px";
    }
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
    this.watch.reset();
    if (this.time_machine_open) {
      return this.toggleTimeMachineView();
    }
  };

  return Debug;

})();
