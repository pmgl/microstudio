this.Publish = (function() {
  function Publish(app) {
    this.app = app;
    this.app.appui.setAction("publish-button", (function(_this) {
      return function() {
        return _this.setProjectPublic(true);
      };
    })(this));
    this.app.appui.setAction("unpublish-button", (function(_this) {
      return function() {
        return _this.setProjectPublic(false);
      };
    })(this));
    this.tags_validator = new InputValidator(document.getElementById("publish-add-tags"), document.getElementById("publish-add-tags-button"), null, (function(_this) {
      return function(value) {
        return _this.addTags(value[0]);
      };
    })(this));
    this.description_save = 0;
    document.querySelector("#publish-box-textarea").addEventListener("input", (function(_this) {
      return function() {
        return _this.description_save = Date.now() + 2000;
      };
    })(this));
    setInterval(((function(_this) {
      return function() {
        return _this.checkDescriptionSave();
      };
    })(this)), 1000);
    this.builders = [];
    this.builders.push(new AppBuild(this.app, "android"));
    this.builders.push(new AppBuild(this.app, "windows"));
    this.builders.push(new AppBuild(this.app, "macos"));
    this.builders.push(new AppBuild(this.app, "linux"));
    this.builders.push(new AppBuild(this.app, "raspbian"));
  }

  Publish.prototype.loadProject = function(project) {
    var b, build, j, len, ref;
    if (project["public"]) {
      document.getElementById("publish-box").style.display = "none";
      document.getElementById("unpublish-box").style.display = "block";
    } else {
      document.getElementById("publish-box").style.display = "block";
      document.getElementById("unpublish-box").style.display = "none";
    }
    document.getElementById("publish-validate-first").style.display = this.app.user.flags["validated"] ? "none" : "block";
    document.querySelector("#publish-box-textarea").value = project.description;
    this.updateTags();
    project.addListener(this);
    if (this.app.user.flags["validated"]) {
      document.querySelector("#publish-box .publish-button").classList.remove("disabled");
    } else {
      document.querySelector("#publish-box .publish-button").classList.add("disabled");
    }
    b = document.querySelector("#html-export .publish-button");
    b.onclick = (function(_this) {
      return function() {
        var loc;
        loc = "/" + project.owner.nick + "/" + project.slug + "/";
        if (!project["public"]) {
          loc += project.code + "/";
        }
        return window.location = loc + "publish/html/";
      };
    })(this);
    ref = this.builders;
    for (j = 0, len = ref.length; j < len; j++) {
      build = ref[j];
      build.loadProject(project);
    }
  };

  Publish.prototype.updateTags = function() {
    var fn, j, len, list, ref, t;
    list = document.getElementById("publish-tag-list");
    list.innerHTML = "";
    ref = this.app.project.tags;
    fn = (function(_this) {
      return function(t) {
        var e, i, span;
        e = document.createElement("div");
        t = t.replace(/[<>&;"']/g, "");
        span = document.createElement("span");
        span.innerText = t;
        e.appendChild(span);
        i = document.createElement("i");
        i.classList.add("fa");
        i.classList.add("fa-times-circle");
        i.addEventListener("click", function() {
          return _this.removeTag(t);
        });
        e.appendChild(i);
        return list.appendChild(e);
      };
    })(this);
    for (j = 0, len = ref.length; j < len; j++) {
      t = ref[j];
      fn(t);
    }
  };

  Publish.prototype.removeTag = function(t) {
    var tags;
    tags = this.app.project.tags;
    if (tags.indexOf(t) >= 0) {
      tags.splice(tags.indexOf(t), 1);
      return this.app.client.sendRequest({
        name: "set_project_tags",
        project: this.app.project.id,
        tags: tags
      }, (function(_this) {
        return function(msg) {
          return _this.updateTags();
        };
      })(this));
    }
  };

  Publish.prototype.addTags = function(value) {
    var change, j, len, tags, v;
    tags = this.app.project.tags;
    value = value.toLowerCase().split(",");
    change = false;
    for (j = 0, len = value.length; j < len; j++) {
      v = value[j];
      v = v.trim();
      if (tags.indexOf(v) < 0) {
        change = true;
        tags.push(v);
      }
    }
    if (change) {
      return this.app.client.sendRequest({
        name: "set_project_tags",
        project: this.app.project.id,
        tags: tags
      }, (function(_this) {
        return function(msg) {
          _this.updateTags();
          return _this.tags_validator.reset();
        };
      })(this));
    }
  };

  Publish.prototype.projectUpdate = function(type) {
    switch (type) {
      case "tags":
        return this.updateTags();
    }
  };

  Publish.prototype.checkDescriptionSave = function(force) {
    if (force == null) {
      force = false;
    }
    if (this.description_save > 0 && (Date.now() > this.description_save || force)) {
      this.description_save = 0;
      this.app.project.description = document.querySelector("#publish-box-textarea").value;
      return this.app.client.sendRequest({
        name: "set_project_option",
        project: this.app.project.id,
        option: "description",
        value: document.querySelector("#publish-box-textarea").value
      }, (function(_this) {
        return function(msg) {};
      })(this));
    }
  };

  Publish.prototype.setProjectPublic = function(pub) {
    if (pub && !this.app.user.flags["validated"]) {
      return;
    }
    this.checkDescriptionSave(true);
    if (this.app.project != null) {
      return this.app.client.sendRequest({
        name: "set_project_public",
        project: this.app.project.id,
        "public": pub
      }, (function(_this) {
        return function(msg) {
          if (msg["public"] != null) {
            _this.app.project["public"] = msg["public"];
            _this.app.project.notifyListeners("public");
            return _this.loadProject(_this.app.project);
          }
        };
      })(this));
    }
  };

  return Publish;

})();
