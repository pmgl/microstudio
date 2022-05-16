var Build, Builder;

Builder = require(__dirname + "/builder.js");

Build = require(__dirname + "/build.js");

this.BuildManager = (function() {
  function BuildManager(server) {
    this.server = server;
    this.builders = {};
    this.builds = {};
    this.jobs = [];
  }

  BuildManager.prototype.registerBuilder = function(session, target) {
    var builder;
    builder = new Builder(this, session, target);
    if (!this.builders[target]) {
      return this.builders[target] = [builder];
    } else {
      return this.builders[target].push(builder);
    }
  };

  BuildManager.prototype.unregisterBuilder = function(builder) {
    var index, target;
    target = builder.target;
    if (this.builders[target] != null) {
      index = this.builders[target].indexOf(builder);
      if (index >= 0) {
        return this.builders[target].splice(index, 1);
      }
    }
  };

  BuildManager.prototype.getActiveBuilders = function() {
    var key, ref, s, value;
    s = "";
    ref = this.builders;
    for (key in ref) {
      value = ref[key];
      if (value.length > 0) {
        if (s.length > 0) {
          s += ", ";
        }
        s += key + (" (" + value.length + ")");
      }
    }
    return s;
  };

  BuildManager.prototype.getActiveBuildersData = function() {
    var key, obj, ref, value;
    obj = {};
    ref = this.builders;
    for (key in ref) {
      value = ref[key];
      obj[key] = value.length;
    }
    return obj;
  };

  BuildManager.prototype.startBuild = function(project, target) {
    var key;
    key = project.id + "-" + target;
    if (!this.builds[key]) {
      this.builds[key] = new Build(project, target);
    }
    this.jobs.push(this.builds[key]);
    return this.builds[key];
  };

  BuildManager.prototype.hasBuilder = function(target) {
    var b, j, len, ref;
    if (this.builders[target] != null) {
      ref = this.builders[target];
      for (j = 0, len = ref.length; j < len; j++) {
        b = ref[j];
        if (b.isActive()) {
          return true;
        }
      }
    }
    return false;
  };

  BuildManager.prototype.getBuildInfo = function(project, target) {
    var build, key;
    key = project.id + "-" + target;
    build = this.builds[key];
    if (build != null) {
      if (build.downloaded && build.version_check !== project.last_modified) {
        delete this.builds[key];
        return null;
      }
      if ((build.builder != null) && !build.builder.isActive()) {
        delete this.builds[key];
        return null;
      }
    }
    return build;
  };

  BuildManager.prototype.getJob = function(target) {
    var build, i, j, len, ref;
    ref = this.jobs;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      build = ref[i];
      if (build.status === "request" && build.target === target) {
        build.status = "starting";
        this.jobs.splice(i, 1);
        return build;
      }
    }
    return null;
  };

  BuildManager.prototype.createLinks = function(app) {
    return this.addDownloadBuild(app);
  };

  BuildManager.prototype.addDownloadBuild = function(app) {
    return app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+\/([^\/\|\?\&\.]+\/)?download\/[^\/\|\?\&\.]+\/$/, (function(_this) {
      return function(req, res) {
        var access, build, key, manager, project, split, target, user;
        access = _this.server.webapp.getProjectAccess(req, res);
        if (access == null) {
          return;
        }
        user = access.user;
        project = access.project;
        manager = _this.server.webapp.getProjectManager(project);
        split = req.path.split("/");
        target = split[split.length - 2];
        if (project != null) {
          key = project.id + "-" + target;
          build = _this.builds[key];
          if ((build != null) && build.progress === 100 && (build.file_info != null) && (build.builder != null)) {
            return build.builder.startDownload(build, res);
          }
        }
      };
    })(this));
  };

  return BuildManager;

})();

module.exports = this.BuildManager;
