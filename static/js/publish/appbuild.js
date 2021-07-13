this.AppBuild = (function() {
  function AppBuild(app, target) {
    this.app = app;
    this.target = target;
    this.button = document.querySelector("#" + this.target + "-export .publish-button");
    this.button.addEventListener("click", (function(_this) {
      return function() {
        return _this.buttonClicked();
      };
    })(this));
  }

  AppBuild.prototype.loadProject = function(project) {
    this.project = project;
    if (this.interval != null) {
      clearInterval(this.interval);
      this.interval = null;
    }
    return this.updateBuildStatus();
  };

  AppBuild.prototype.buttonClicked = function() {
    var loc;
    if (this.build == null) {
      return this.app.client.sendRequest({
        name: "build_project",
        project: this.project.id,
        target: this.target
      }, (function(_this) {
        return function(msg) {
          return _this.handleBuildStatus(msg.build);
        };
      })(this));
    } else if (this.build.progress === 100) {
      loc = "/" + this.project.owner.nick + "/" + this.project.slug + "/";
      if (!this.project["public"]) {
        loc += this.project.code + "/";
      }
      console.info(loc + ("download/" + this.target + "/") + ("?v=" + this.project.last_modified));
      return window.location = loc + ("download/" + this.target + "/") + ("?v=" + this.project.last_modified);
    }
  };

  AppBuild.prototype.updateBuildStatus = function() {
    return this.app.client.sendRequest({
      name: "get_build_status",
      project: this.project.id,
      target: this.target
    }, (function(_this) {
      return function(msg) {
        if (msg.active_target) {
          document.querySelector("#publish-box-" + _this.target).style.display = "block";
        } else {
          document.querySelector("#publish-box-" + _this.target).style.display = "none";
        }
        return _this.handleBuildStatus(msg.build);
      };
    })(this));
  };

  AppBuild.prototype.handleBuildStatus = function(build) {
    this.build = build;
    if (this.build == null) {
      this.button.style.background = "hsl(160,50%,50%)";
      this.button.innerHTML = '<i class="fa fa-wrench"></i> ' + this.app.translator.get("Build");
      if (this.interval != null) {
        clearInterval(this.interval);
        return this.interval = null;
      }
    } else if (this.build.progress < 100) {
      this.setBuildProgress(this.build.status_text, this.build.progress);
      if (this.interval == null) {
        return this.interval = setInterval(((function(_this) {
          return function() {
            return _this.updateBuildStatus();
          };
        })(this)), 1000);
      }
    } else {
      this.button.style.background = "hsl(200,50%,50%)";
      return this.button.innerHTML = '<i class="fa fa-download"></i> ' + this.app.translator.get("Download");
    }
  };

  AppBuild.prototype.setBuildProgress = function(text, progress) {
    this.button.style.background = "linear-gradient(90deg,hsl(30,50%,50%) 0%,hsl(30,50%,50%) " + progress + "%,rgba(255,255,255,.1) " + progress + "%)";
    return this.button.innerHTML = '<i class="fa fa-sync-alt"></i> ' + text;
  };

  return AppBuild;

})();
