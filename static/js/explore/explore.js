this.Explore = (function() {
  function Explore(app) {
    var likes;
    this.app = app;
    this.get("explore-back-button").addEventListener("click", (function(_this) {
      return function() {
        _this.closeDetails();
        return _this.app.appui.setMainSection("explore", true);
      };
    })(this));
    this.sort = "hot";
    this.sort_types = ["hot", "new", "top"];
    this.sort_functions = {
      hot: function(a, b) {
        return b.likes - a.likes + b.date_published / (1000 * 3600 * 24) - a.date_published / (1000 * 3600 * 24);
      },
      top: function(a, b) {
        return b.likes - a.likes;
      },
      "new": function(a, b) {
        return b.date_published - a.date_published;
      }
    };
    document.getElementById("explore-sort-button").addEventListener("click", (function(_this) {
      return function() {
        var e, i, len, ref, s;
        s = _this.sort_types.indexOf(_this.sort);
        s = (s + 1) % _this.sort_types.length;
        _this.sort = _this.sort_types[s];
        e = document.getElementById("explore-sort-button");
        ref = _this.sort_types;
        for (i = 0, len = ref.length; i < len; i++) {
          s = ref[i];
          if (s === _this.sort) {
            e.classList.add(s);
          } else {
            e.classList.remove(s);
          }
        }
        document.querySelector("#explore-sort-button span").innerText = _this.app.translator.get(_this.sort.substring(0, 1).toUpperCase() + _this.sort.substring(1));
        return _this.loadProjects();
      };
    })(this));
    document.getElementById("explore-search-input").addEventListener("input", (function(_this) {
      return function() {
        return _this.loadProjects();
      };
    })(this));
    document.getElementById("explore-contents").addEventListener("scroll", (function(_this) {
      return function() {
        var contents, scrollzone;
        contents = document.getElementById("explore-box-list");
        scrollzone = document.getElementById("explore-contents");
        while ((_this.remaining != null) && _this.remaining.length > 0 && contents.getBoundingClientRect().height < scrollzone.scrollTop + window.innerHeight * 2) {
          contents.appendChild(_this.createProjectBox(_this.remaining.splice(0, 1)[0]));
        }
      };
    })(this));
    this.cloned = {};
    this.get("project-details-clonebutton").addEventListener("click", (function(_this) {
      return function() {
        if (_this.app.user == null) {
          return alert(_this.app.translator.get("Log in or create your account to clone this project."));
        }
        _this.get("project-details-clonebutton").style.display = "none";
        _this.cloned[_this.project.id] = true;
        return _this.app.client.sendRequest({
          name: "clone_public_project",
          project: _this.project.id
        }, function(msg) {
          _this.app.appui.setMainSection("projects");
          _this.app.appui.backToProjectList();
          _this.app.updateProjectList(msg.id);
          return _this.app.appui.showNotification(_this.app.translator.get("Project cloned! Here is your copy."));
        });
      };
    })(this));
    likes = this.get("project-details-likes");
    likes.addEventListener("click", (function(_this) {
      return function() {
        if (!_this.app.user.flags.validated) {
          return alert(_this.app.translator.get("Validate your e-mail address to enable votes."));
        }
        if (_this.project != null) {
          return _this.app.client.sendRequest({
            name: "toggle_like",
            project: _this.project.id
          }, function(msg) {
            if (msg.name === "project_likes") {
              likes.innerHTML = "<i class='fa fa-thumbs-up'></i> " + msg.likes;
              if (msg.liked) {
                return likes.classList.add("voted");
              } else {
                return likes.classList.remove("voted");
              }
            }
          });
        }
      };
    })(this));
  }

  Explore.prototype.closeDetails = function() {
    return this.closeProject();
  };

  Explore.prototype.findBestTag = function(p) {
    var i, len, ref, score, t, tag;
    tag = p.tags[0];
    score = 0;
    ref = p.tags;
    for (i = 0, len = ref.length; i < len; i++) {
      t = ref[i];
      if (this.tag_scores[t] > score) {
        score = this.tag_scores[t];
        tag = t;
      }
    }
    return tag;
  };

  Explore.prototype.createProjectBox = function(p) {
    var author, element, icon, infobox, likes, runbutton, tag, title;
    if (this.boxes[p.owner + "/" + p.slug]) {
      return this.boxes[p.owner + "/" + p.slug];
    }
    element = document.createElement("div");
    element.classList.add("explore-project-box");
    if (p.tags.length > 0 && (this.tag_scores != null)) {
      tag = document.createElement("div");
      tag.innerText = this.findBestTag(p);
      tag.classList.add("project-tag");
      element.appendChild(tag);
    }
    icon = PixelatedImage.create(location.origin + ("/" + p.owner + "/" + p.slug + "/icon.png"), 200);
    icon.classList.add("icon");
    icon.alt = p.title;
    icon.title = p.title;
    element.appendChild(icon);
    element.style.opacity = 0;
    element.style["transition-duration"] = "1s";
    element.style["transition-property"] = "opacity";
    icon.onload = (function(_this) {
      return function() {
        return element.style.opacity = 1;
      };
    })(this);
    infobox = document.createElement("div");
    infobox.classList.add("explore-infobox");
    element.appendChild(infobox);
    title = document.createElement("div");
    title.classList.add("explore-project-title");
    title.innerText = p.title;
    infobox.appendChild(title);
    author = this.app.appui.createUserTag(p.owner, p.owner_info.tier, p.owner_info.profile_image);
    infobox.appendChild(author);
    likes = document.createElement("div");
    likes.classList.add("explore-project-likes");
    likes.innerHTML = "<i class='fa fa-thumbs-up'></i> " + p.likes;
    if (p.liked) {
      likes.classList.add("voted");
    }
    infobox.appendChild(likes);
    runbutton = document.createElement("div");
    runbutton.classList.add("run-button");
    runbutton.innerHTML = "<i class='fa fa-play'></i> " + this.app.translator.get("Run");
    element.appendChild(runbutton);
    likes.addEventListener("click", (function(_this) {
      return function(event) {
        event.stopImmediatePropagation();
        if (!_this.app.user.flags.validated) {
          return alert(_this.app.translator.get("Validate your e-mail address to enable votes."));
        }
        return _this.app.client.sendRequest({
          name: "toggle_like",
          project: p.id
        }, function(msg) {
          if (msg.name === "project_likes") {
            likes.innerHTML = "<i class='fa fa-thumbs-up'></i> " + msg.likes;
            p.likes = msg.likes;
            if (msg.liked) {
              likes.classList.add("voted");
              return p.liked = true;
            } else {
              p.liked = false;
              return likes.classList.remove("voted");
            }
          }
        });
      };
    })(this));
    runbutton.addEventListener("click", (function(_this) {
      return function(event) {
        event.stopPropagation();
        if (p.type === "tutorial") {
          return window.open(location.origin.replace(".dev", ".io") + ("/tutorial/" + p.owner + "/" + p.slug + "/"), "_blank");
        } else {
          return window.open(location.origin.replace(".dev", ".io") + ("/" + p.owner + "/" + p.slug + "/"), "_blank");
        }
      };
    })(this));
    element.addEventListener("click", (function(_this) {
      return function() {
        if (screen.width <= 700) {
          return window.open(location.origin.replace(".dev", ".io") + ("/" + p.owner + "/" + p.slug + "/"), "_blank");
        } else {
          _this.app.app_state.pushState("project_details", "/i/" + p.owner + "/" + p.slug + "/", {
            project: p
          });
          _this.openProject(p);
          return _this.canBack = true;
        }
      };
    })(this));
    return this.boxes[p.owner + "/" + p.slug] = element;
  };

  Explore.prototype.get = function(id) {
    return document.getElementById(id);
  };

  Explore.prototype.findProject = function(owner, slug) {
    var i, len, p, ref;
    if (this.projects != null) {
      ref = this.projects;
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        if (p.owner === owner && p.slug === slug) {
          return p;
        }
      }
    }
    return null;
  };

  Explore.prototype.openProject = function(p) {
    var div, i, len, likes, list, ref, t;
    this.project = p;
    if (this.cloned[this.project.id]) {
      this.get("project-details-clonebutton").style.display = "none";
    } else {
      this.get("project-details-clonebutton").style.display = "inline-block";
    }
    this.get("explore-back-button").style.display = "inline-block";
    this.get("explore-tools").style.display = "none";
    this.get("explore-contents").style.display = "none";
    this.get("explore-project-details").style.display = "block";
    PixelatedImage.setURL(this.get("project-details-image"), location.origin + ("/" + p.owner + "/" + p.slug + "/icon.png"), 200);
    this.get("project-details-title").innerText = p.title;
    this.get("project-details-description").innerHTML = DOMPurify.sanitize(marked(p.description));
    document.querySelector("#project-details-author").innerHTML = "";
    document.querySelector("#project-details-author").appendChild(this.app.appui.createUserTag(p.owner, p.owner_info.tier, p.owner_info.profile_image, 12));
    likes = this.get("project-details-likes");
    likes.innerHTML = "<i class='fa fa-thumbs-up'></i> " + p.likes;
    if (p.liked) {
      likes.classList.add("voted");
    } else {
      likes.classList.remove("voted");
    }
    if (p.type === "tutorial") {
      this.get("project-details-runbutton").href = location.origin.replace(".dev", ".io") + ("/tutorial/" + p.owner + "/" + p.slug + "/");
    } else {
      this.get("project-details-runbutton").href = location.origin.replace(".dev", ".io") + ("/" + p.owner + "/" + p.slug + "/");
    }
    list = this.get("project-details-tags");
    list.innerHTML = "";
    ref = p.tags;
    for (i = 0, len = ref.length; i < len; i++) {
      t = ref[i];
      div = document.createElement("div");
      div.classList.add("tag");
      div.innerText = t;
      list.appendChild(div);
      if ((this.app.user != null) && this.app.user.flags.admin) {
        (function(_this) {
          return (function(t) {
            return div.addEventListener("click", function() {
              var index;
              if (confirm("really delete tag?")) {
                index = p.tags.indexOf(t);
                if (index >= 0) {
                  p.tags.splice(index, 1);
                  return _this.app.client.sendRequest({
                    name: "set_project_tags",
                    project: p.id,
                    tags: p.tags
                  }, function(msg) {
                    return _this.openProject(p);
                  });
                }
              }
            });
          });
        })(this)(t);
      }
    }
    if ((this.app.user != null) && this.app.user.flags.admin) {
      div = document.createElement("div");
      div.classList.add("tag");
      div.innerText = "+ add";
      div.style = "background: hsl(0,50%,50%)";
      list.appendChild(div);
      div.addEventListener("click", (function(_this) {
        return function() {
          var value;
          value = prompt("add tag");
          if ((value != null) && value.length > 1) {
            p.tags.push(value);
            return _this.app.client.sendRequest({
              name: "set_project_tags",
              project: p.id,
              tags: p.tags
            }, function(msg) {
              return _this.openProject(p);
            });
          }
        };
      })(this));
    }
    if (this.details == null) {
      this.details = new ProjectDetails(this.app);
    }
    return this.details.set(p);
  };

  Explore.prototype.closeProject = function(p) {
    this.get("explore-back-button").style.display = "none";
    this.get("explore-tools").style.display = "inline-block";
    this.get("explore-contents").style.display = "block";
    this.get("explore-project-details").style.display = "none";
    return this.project = null;
  };

  Explore.prototype.createTags = function() {
    var count, div, fn, i, j, k, len, len1, len2, list, p, ref, ref1, t, tag, tags;
    this.active_tags = [];
    tags = {};
    count = {};
    ref = this.projects;
    for (i = 0, len = ref.length; i < len; i++) {
      p = ref[i];
      ref1 = p.tags;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        t = ref1[j];
        if (tags[t] == null) {
          tags[t] = {};
          count[t] = 1;
        }
        tags[t][p.owner] = true;
        count[t] += 1;
      }
    }
    for (t in tags) {
      tags[t] = Object.keys(tags[t]).length + count[t] * .001;
    }
    list = [];
    for (tag in tags) {
      count = tags[tag];
      list.push({
        tag: tag,
        count: count
      });
    }
    this.tag_scores = tags;
    list.sort(function(a, b) {
      return b.count - a.count;
    });
    document.getElementById("explore-tags").innerHTML = "";
    fn = (function(_this) {
      return function(t, div) {
        return div.addEventListener("click", function() {
          var index;
          index = _this.active_tags.indexOf(t.tag);
          if (index >= 0) {
            _this.active_tags.splice(index, 1);
            div.classList.remove("active");
          } else {
            _this.active_tags.push(t.tag);
            div.classList.add("active");
          }
          return _this.loadProjects();
        });
      };
    })(this);
    for (k = 0, len2 = list.length; k < len2; k++) {
      t = list[k];
      div = document.createElement("div");
      div.innerText = t.tag;
      document.getElementById("explore-tags").appendChild(div);
      fn(t, div);
    }
  };

  Explore.prototype.loadProjects = function() {
    var contents, found, h, i, j, k, len, len1, len2, maxAge, maxLikes, note, now, p, ref, ref1, ref2, scrollzone, search, t;
    if (this.projects == null) {
      return;
    }
    contents = document.getElementById("explore-box-list");
    scrollzone = document.getElementById("explore-contents");
    contents.innerHTML = "";
    this.remaining = [];
    if (this.sort === "hot" && this.projects.length > 4) {
      now = Date.now();
      this.projects.sort(this.sort_functions.top);
      maxLikes = Math.max(1, this.projects[4].likes);
      this.projects.sort(this.sort_functions["new"]);
      maxAge = now - this.projects[this.projects.length - 1].date_published;
      h = 1 / 24 / 7;
      h = Math.max(0, now - this.projects[4].date_published) / 1000 / 3600;
      note = function(p) {
        var bump;
        bump = Math.min(1, (now - p.date_published) / 1000 / 3600 / 24 / 10);
        bump = .5 + .5 * Math.cos(bump * Math.PI);
        return p.likes + maxLikes * (bump * .5 + 1.5 * Math.exp(Math.log(.5) * (now - p.date_published) / 1000 / 3600 / 24 / 180));
      };
      this.sort_functions.hot = function(a, b) {
        return note(b) - note(a);
      };
    }
    this.projects.sort(this.sort_functions[this.sort]);
    search = document.getElementById("explore-search-input").value.toLowerCase();
    ref = this.projects;
    for (i = 0, len = ref.length; i < len; i++) {
      p = ref[i];
      if (this.active_tags.length > 0) {
        found = false;
        ref1 = this.active_tags;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          t = ref1[j];
          if (p.tags.indexOf(t) >= 0) {
            found = true;
          }
        }
        if (!found) {
          continue;
        }
      }
      if (search.length > 0) {
        found = p.title.toLowerCase().indexOf(search) >= 0;
        found |= p.description.toLowerCase().indexOf(search) >= 0;
        found |= p.owner.toLowerCase().indexOf(search) >= 0;
        if (found) {
          console.info("found: " + p.owner);
        }
        ref2 = p.tags;
        for (k = 0, len2 = ref2.length; k < len2; k++) {
          t = ref2[k];
          found |= t.toLowerCase().indexOf(search) >= 0;
        }
        if (!found) {
          continue;
        }
      }
      if (contents.getBoundingClientRect().height < scrollzone.scrollTop + window.innerHeight * 2) {
        contents.appendChild(this.createProjectBox(p));
      } else {
        this.remaining.push(p);
      }
    }
  };

  Explore.prototype.update = function(callback) {
    var contents, owner, project;
    if (this.list_received) {
      if (callback != null) {
        callback();
      }
      return;
    }
    if (!this.initialized && location.pathname.startsWith("/i/")) {
      document.getElementById("explore-section").style.opacity = 0;
    }
    contents = document.getElementById("explore-box-list");
    contents.innerHTML = "";
    if (!this.initialized && location.pathname.startsWith("/i/")) {
      this.initialized = true;
      owner = location.pathname.split("/")[2];
      project = location.pathname.split("/")[3];
      return this.app.client.sendRequest({
        name: "get_public_project",
        owner: owner,
        project: project
      }, (function(_this) {
        return function(msg) {
          project = msg.project;
          if (project != null) {
            _this.openProject(project);
            document.getElementById("explore-section").style.opacity = 1;
          }
        };
      })(this));
    } else {
      this.app.client.sendRequest({
        name: "get_public_projects",
        ranking: "hot",
        tags: []
      }, (function(_this) {
        return function(msg) {
          _this.projects = msg.list;
          _this.list_received = true;
          _this.boxes = {};
          _this.createTags();
          _this.loadProjects();
          if (!_this.initialized) {
            _this.initialized = true;
            return document.getElementById("explore-section").style.opacity = 1;
          }
        };
      })(this));
      if (callback != null) {
        callback();
      }
    }
  };

  return Explore;

})();
