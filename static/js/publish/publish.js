this.Publish = class Publish {
  constructor(app) {
    this.app = app;
    this.app.appui.setAction("publish-button", () => {
      return this.setProjectPublic(true);
    });
    this.app.appui.setAction("unpublish-button", () => {
      return this.setProjectPublic(false);
    });
    this.tags_validator = new InputValidator(document.getElementById("publish-add-tags"), document.getElementById("publish-add-tags-button"), null, (value) => {
      return this.addTags(value[0]);
    });
    this.description_save = 0;
    document.querySelector("#publish-box-textarea").addEventListener("input", () => {
      return this.description_save = Date.now() + 2000;
    });
    setInterval((() => {
      return this.checkDescriptionSave();
    }), 1000);
    this.builders = [];
    this.builders.push(new AppBuild(this.app, "android"));
    this.builders.push(new AppBuild(this.app, "windows"));
    this.builders.push(new AppBuild(this.app, "macos"));
    this.builders.push(new AppBuild(this.app, "linux"));
    this.builders.push(new AppBuild(this.app, "raspbian"));
    document.getElementById("publish-listed").addEventListener("change", () => {
      if (this.app.project != null) {
        this.app.project.unlisted = !document.getElementById("publish-listed").checked;
        this.app.options.optionChanged("unlisted", !document.getElementById("publish-listed").checked);
        this.sendProjectPublic(this.app.project.public);
        return this.updateCheckList();
      }
    });
  }

  loadProject(project) {
    var b, build, j, len, public_url, ref;
    if (project.public) {
      document.getElementById("publish-box").style.display = "none";
      document.getElementById("unpublish-box").style.display = "block";
    } else {
      document.getElementById("publish-box").style.display = "block";
      document.getElementById("unpublish-box").style.display = "none";
    }
    document.getElementById("publish-validate-first").style.display = this.app.user.flags["validated"] ? "none" : "block";
    document.getElementById("publish-listed").checked = !project.unlisted;
    this.updateCheckList();
    public_url = `${location.origin.replace(".dev", ".io")}/i/${this.app.project.owner.nick}/${this.app.project.slug}/`;
    document.getElementById("publish-public-link").href = public_url;
    document.getElementById("publish-public-link").innerText = public_url;
    document.querySelector("#publish-box-textarea").value = project.description;
    this.updateTags();
    project.addListener(this);
    if (this.app.user.flags["validated"]) {
      document.querySelector("#publish-box .publish-button").classList.remove("disabled");
    } else {
      document.querySelector("#publish-box .publish-button").classList.add("disabled");
    }
    b = document.querySelector("#html-export .publish-button");
    b.onclick = () => {
      var loc;
      loc = `/${project.owner.nick}/${project.slug}/`;
      if (!project.public) {
        loc += project.code + "/";
      }
      return window.location = loc + "publish/html/?v=" + Date.now();
    };
    b = document.querySelector("#server-export .publish-button");
    b.onclick = () => {
      var loc;
      loc = `/${project.owner.nick}/${project.slug}/`;
      if (!project.public) {
        loc += project.code + "/";
      }
      return window.location = loc + "publish/html/?server&v=" + Date.now();
    };
    ref = this.builders;
    for (j = 0, len = ref.length; j < len; j++) {
      build = ref[j];
      build.loadProject(project);
    }
    this.updateServerExport();
  }

  updateServerExport() {
    return document.querySelector("#publish-box-server").style.display = (this.app.project != null) && this.app.project.networking ? "block" : "none";
  }

  updateCheckList() {
    var project;
    project = this.app.project;
    if (project.public && !project.unlisted && !this.app.user.flags.approved && !project.flags.approved) {
      return document.getElementById("publish-checklist").style.display = "block";
    } else {
      return document.getElementById("publish-checklist").style.display = "none";
    }
  }

  updateTags() {
    var j, len, list, ref, t;
    list = document.getElementById("publish-tag-list");
    list.innerHTML = "";
    ref = this.app.project.tags;
    for (j = 0, len = ref.length; j < len; j++) {
      t = ref[j];
      ((t) => {
        var e, i, span;
        e = document.createElement("div");
        t = t.replace(/[<>&;"']/g, "");
        span = document.createElement("span");
        span.innerText = t;
        e.appendChild(span);
        i = document.createElement("i");
        i.classList.add("fa");
        i.classList.add("fa-times-circle");
        i.addEventListener("click", () => {
          return this.removeTag(t);
        });
        e.appendChild(i);
        return list.appendChild(e);
      })(t);
    }
  }

  removeTag(t) {
    var tags;
    tags = this.app.project.tags;
    if (tags.indexOf(t) >= 0) {
      tags.splice(tags.indexOf(t), 1);
      return this.app.client.sendRequest({
        name: "set_project_tags",
        project: this.app.project.id,
        tags: tags
      }, (msg) => {
        return this.updateTags();
      });
    }
  }

  addTags(value) {
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
      }, (msg) => {
        this.updateTags();
        return this.tags_validator.reset();
      });
    }
  }

  projectUpdate(type) {
    switch (type) {
      case "tags":
        return this.updateTags();
    }
  }

  checkDescriptionSave(force = false) {
    if (this.description_save > 0 && (Date.now() > this.description_save || force)) {
      this.description_save = 0;
      this.app.project.description = document.querySelector("#publish-box-textarea").value;
      return this.app.client.sendRequest({
        name: "set_project_option",
        project: this.app.project.id,
        option: "description",
        value: document.querySelector("#publish-box-textarea").value
      }, (msg) => {});
    }
  }

  setProjectPublic(pub) {
    if (pub && !this.app.user.flags["validated"]) {
      return;
    }
    if (pub) {
      document.getElementById("publish-checklist").style.display = "block";
      this.app.options.optionChanged("unlisted", true);
      document.getElementById("publish-listed").checked = false;
      this.app.project.unlisted = true;
    }
    this.checkDescriptionSave(true);
    this.sendProjectPublic(pub);
    return this.updateCheckList();
  }

  sendProjectPublic(pub) {
    if (this.app.project != null) {
      return this.app.client.sendRequest({
        name: "set_project_public",
        project: this.app.project.id,
        public: pub
      }, (msg) => {
        if (msg.public != null) {
          this.app.project.public = msg.public;
          this.app.project.notifyListeners("public");
          return this.loadProject(this.app.project);
        }
      });
    }
  }

};
