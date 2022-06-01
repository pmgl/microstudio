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
    this.active_tags = [];
    this.search = "";
    this.tags = [];
    this.visited_projects = {};
    this.sort_types = ["hot", "new", "top"];
    this.project_types = ["all", "app", "library", "plugin", "tutorial"];
    this.project_type = "all";
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
        var e, j, len, ref, s;
        s = _this.sort_types.indexOf(_this.sort);
        s = (s + 1) % _this.sort_types.length;
        _this.sort = _this.sort_types[s];
        e = document.getElementById("explore-sort-button");
        ref = _this.sort_types;
        for (j = 0, len = ref.length; j < len; j++) {
          s = ref[j];
          if (s === _this.sort) {
            e.classList.add(s);
          } else {
            e.classList.remove(s);
          }
        }
        document.querySelector("#explore-sort-button span").innerText = _this.app.translator.get(_this.sort.substring(0, 1).toUpperCase() + _this.sort.substring(1));
        return _this.query();
      };
    })(this));
    document.getElementById("explore-type-button").addEventListener("click", (function(_this) {
      return function() {
        var e, j, len, ref, s;
        s = _this.project_types.indexOf(_this.project_type);
        s = (s + 1) % _this.project_types.length;
        _this.project_type = _this.project_types[s];
        e = document.getElementById("explore-type-button");
        ref = _this.project_types;
        for (j = 0, len = ref.length; j < len; j++) {
          s = ref[j];
          if (s === _this.project_type) {
            e.classList.add(s);
          } else {
            e.classList.remove(s);
          }
        }
        document.querySelector("#explore-type-button span").innerText = _this.app.translator.get(_this.project_type.substring(0, 1).toUpperCase() + _this.project_type.substring(1));
        return _this.query();
      };
    })(this));
    document.getElementById("explore-search-input").addEventListener("input", (function(_this) {
      return function() {
        _this.search = document.getElementById("explore-search-input").value;
        if (_this.search_timeout != null) {
          clearTimeout(_this.search_timeout);
        }
        return _this.search_timeout = setTimeout((function() {
          return _this.query();
        }), 1500);
      };
    })(this));
    document.getElementById("explore-contents").addEventListener("scroll", (function(_this) {
      return function() {
        var contents, h1, h2, pos, scrollzone;
        contents = document.getElementById("explore-box-list");
        scrollzone = document.getElementById("explore-contents");
        h1 = contents.getBoundingClientRect().height;
        h2 = scrollzone.getBoundingClientRect().height;
        if (scrollzone.scrollTop > h1 - h2 - 100) {
          if (!_this.completed) {
            pos = _this.projects.length;
            if (pos !== _this.query_position) {
              _this.query(pos);
            }
          }
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
    document.querySelector("#explore-tags-bar i").addEventListener("click", (function(_this) {
      return function() {
        var bar, icon;
        bar = document.querySelector("#explore-tags-bar");
        icon = bar.querySelector("i");
        if (bar.classList.contains("collapsed")) {
          bar.classList.remove("collapsed");
          icon.classList.remove("fa-caret-right");
          return icon.classList.add("fa-caret-down");
        } else {
          bar.classList.add("collapsed");
          icon.classList.add("fa-caret-right");
          return icon.classList.remove("fa-caret-down");
        }
      };
    })(this));
  }

  Explore.prototype.closeDetails = function() {
    return this.closeProject();
  };

  Explore.prototype.closed = function() {
    if (!document.title.startsWith("microStudio")) {
      return document.title = "microStudio";
    }
  };

  Explore.prototype.findBestTag = function(p) {
    var index, j, len, ref, score, t, tag;
    tag = p.tags[0];
    score = this.tags.indexOf(tag);
    if (score < 0) {
      score = 1000;
    }
    ref = p.tags;
    for (j = 0, len = ref.length; j < len; j++) {
      t = ref[j];
      index = this.tags.indexOf(t);
      if (index >= 0 && index < score) {
        score = index;
        tag = t;
      }
    }
    return tag;
  };

  Explore.prototype.createProjectBox = function(p) {
    var author, element, icon, infobox, label, likes, runbutton, smallicon, tag, title;
    element = document.createElement("div");
    element.classList.add("explore-project-box");
    if (p.tags.length > 0) {
      tag = document.createElement("div");
      tag.innerText = this.findBestTag(p);
      tag.classList.add("project-tag");
      element.appendChild(tag);
    }
    if (p.poster) {
      icon = new Image;
      icon.src = location.origin + ("/" + p.owner + "/" + p.slug + "/poster.png");
      icon.classList.add("poster");
      icon.alt = p.title;
      icon.title = p.title;
      element.appendChild(icon);
      smallicon = new Image;
      smallicon.src = location.origin + ("/" + p.owner + "/" + p.slug + "/icon.png");
      smallicon.classList.add("smallicon");
      smallicon.classList.add("pixelated");
      smallicon.alt = p.title;
      smallicon.title = p.title;
      element.appendChild(smallicon);
    } else {
      icon = new Image;
      icon.src = location.origin + ("/" + p.owner + "/" + p.slug + "/icon.png");
      icon.classList.add("icon");
      icon.classList.add("pixelated");
      icon.alt = p.title;
      icon.title = p.title;
      element.appendChild(icon);
    }
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
    if (p.type !== "app") {
      label = document.createElement("div");
      label.classList.add("type-label");
      label.classList.add(p.type);
      switch (p.type) {
        case "library":
          label.innerHTML = "<i class=\"fas fa-file-code\"></i> " + (this.app.translator.get("Library"));
          break;
        case "plugin":
          label.innerHTML = "<i class=\"fas fa-plug\"></i> " + (this.app.translator.get("Plug-in"));
          break;
        case "tutorial":
          label.innerHTML = "<i class=\"fas fa-graduation-cap\"></i> " + (this.app.translator.get("Tutorial"));
      }
      element.appendChild(label);
    }
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
    return element;
  };

  Explore.prototype.get = function(id) {
    return document.getElementById(id);
  };

  Explore.prototype.findProject = function(owner, slug) {
    var id, j, len, p, ref;
    id = owner + "." + slug;
    if (this.visited_projects[id] != null) {
      return this.visited_projects[id];
    }
    if (this.projects != null) {
      ref = this.projects;
      for (j = 0, len = ref.length; j < len; j++) {
        p = ref[j];
        if (p.owner === owner && p.slug === slug) {
          return p;
        }
      }
    }
    return null;
  };

  Explore.prototype.openProject = function(p) {
    var desc, div, j, k, len, len1, lib, likes, list, ref, ref1, t;
    this.visited_projects[p.owner + "." + p.slug] = p;
    this.project = p;
    if (this.cloned[this.project.id]) {
      this.get("project-details-clonebutton").style.display = "none";
    } else {
      this.get("project-details-clonebutton").style.display = "inline-block";
    }
    document.title = this.app.translator.get("%PROJECT% - by %USER%").replace("%PROJECT%", p.title).replace("%USER%", p.owner);
    this.get("explore-back-button").style.display = "inline-block";
    this.get("explore-tools").style.display = "none";
    this.get("explore-tags-bar").style.display = "none";
    this.get("explore-contents").style.display = "none";
    this.get("explore-project-details").style.display = "block";
    this.get("project-details-image").src = location.origin + ("/" + p.owner + "/" + p.slug + "/icon.png");
    this.get("project-details-title").innerText = p.title;
    desc = DOMPurify.sanitize(marked(p.description));
    if (p.poster) {
      this.get("project-details-info").style.background = "linear-gradient(to bottom, hsla(200,10%,10%,0.8), hsla(200,10%,10%,0.9)),url(/" + p.owner + "/" + p.slug + "/poster.png)";
      this.get("project-details-info").style["background-size"] = "100%";
      this.get("project-details-info").style["background-repeat"] = "no-repeat";
    } else {
      this.get("project-details-info").style.background = "none";
    }
    desc += "<p style=\"margin-bottom: 5px; font-size: 14px; color: rgba(255,255,255,.5)\"><i class=\"fas fa-calendar-alt\" style=\"color:hsl(160,50%,40%)\"></i>" + (this.app.translator.get("First published on %DATE%").replace("%DATE%", new Date(p.date_published).toLocaleDateString())) + "</p>";
    desc += "<p style=\"margin-bottom: 5px; font-size: 14px; color: rgba(255,255,255,.5)\"><i class=\"fas fa-calendar-alt\" style=\"color:hsl(160,50%,40%)\"></i>" + (this.app.translator.get("Last modified on %DATE%").replace("%DATE%", new Date(p.last_modified).toLocaleDateString())) + "</p>";
    ref = p.libs;
    for (j = 0, len = ref.length; j < len; j++) {
      lib = ref[j];
      desc = ("<p><i class=\"fas fa-info-circle\" style=\"color:hsl(20,100%,70%)\"></i>" + (this.app.translator.get("This project uses this optional library:")) + " " + lib + "</p>") + desc;
    }
    if (p.graphics !== "M1") {
      desc = ("<p><i class=\"fas fa-info-circle\" style=\"color:hsl(20,100%,70%)\"></i>" + (this.app.translator.get("This project uses this graphics API:")) + " " + p.graphics + "</p>") + desc;
    }
    if (p.language != null) {
      desc = ("<br /><div class=\"explore-project-language " + (p.language.split("_")[0]) + "\">" + (p.language.split("_")[0]) + "</div><br />") + desc;
    }
    this.get("project-details-description").innerHTML = desc;
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
    ref1 = p.tags;
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      t = ref1[k];
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
      div.innerText = "Unpublish";
      div.style.padding = "10px";
      div.style.background = "hsl(20,50%,50%)";
      div.style.cursor = "pointer";
      div.style.display = "inline-block";
      div.style["border-radius"] = "5px";
      div.addEventListener("click", (function(_this) {
        return function() {
          if (confirm("Really unpublish project?")) {
            return _this.app.client.sendRequest({
              name: "set_project_public",
              id: p.id,
              "public": false
            }, function(msg) {
              _this.closeDetails();
              return _this.app.appui.setMainSection("explore", true);
            });
          }
        };
      })(this));
      document.getElementById("project-details-description").appendChild(div);
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
    this.get("explore-tags-bar").style.display = "block";
    this.get("explore-contents").style.display = "block";
    this.get("explore-project-details").style.display = "none";
    this.project = null;
    return this.closed();
  };

  Explore.prototype.createTags = function(tags) {
    var div, fn, j, len, ref, t;
    this.tags = tags;
    document.getElementById("explore-tags").innerHTML = "";
    ref = this.tags;
    fn = (function(_this) {
      return function(t, div) {
        return div.addEventListener("click", function() {
          var index;
          index = _this.active_tags.indexOf(t);
          if (index >= 0) {
            _this.active_tags.splice(index, 1);
            div.classList.remove("active");
          } else {
            _this.active_tags.push(t);
            div.classList.add("active");
          }
          return _this.query();
        });
      };
    })(this);
    for (j = 0, len = ref.length; j < len; j++) {
      t = ref[j];
      div = document.createElement("div");
      div.innerText = t;
      if (this.active_tags.includes(t)) {
        div.classList.add("active");
      }
      document.getElementById("explore-tags").appendChild(div);
      fn(t, div);
    }
  };

  Explore.prototype.loadProjects = function(pos) {
    var contents, i, j, p, ref, ref1, scrollzone;
    if (pos == null) {
      pos = 0;
    }
    if (this.projects == null) {
      return;
    }
    contents = document.getElementById("explore-box-list");
    scrollzone = document.getElementById("explore-contents");
    if (pos === 0) {
      contents.innerHTML = "";
    }
    for (i = j = ref = pos, ref1 = this.projects.length - 1; j <= ref1; i = j += 1) {
      p = this.projects[i];
      contents.appendChild(this.createProjectBox(p));
    }
  };

  Explore.prototype.update = function() {
    var owner, project;
    if (!this.initialized && location.pathname.startsWith("/i/")) {
      document.getElementById("explore-section").style.opacity = 0;
    }
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
      if ((this.projects == null) || this.projects.length === 0) {
        return this.query();
      }
    }
  };

  Explore.prototype.query = function(position) {
    var f;
    if (position == null) {
      position = 0;
    }
    this.query_position = position;
    if (position === 0 || (this.current_offset == null)) {
      this.current_offset = 0;
    }
    f = (function(_this) {
      return function() {};
    })(this);
    this.app.client.sendRequest({
      name: "get_public_projects",
      ranking: this.sort,
      type: this.project_type,
      tags: this.active_tags,
      search: this.search.toLowerCase(),
      position: position,
      offset: this.current_offset
    }, (function(_this) {
      return function(msg) {
        var pos;
        if (position === 0) {
          _this.current_position = position;
          _this.current_offset = msg.offset;
          _this.completed = false;
          _this.projects = msg.list;
          _this.createTags(msg.tags);
          _this.loadProjects();
          document.getElementById("explore-contents").scrollTop = 0;
        } else {
          if (msg.list.length === 0) {
            _this.completed = true;
          }
          _this.current_position = position;
          _this.current_offset = msg.offset;
          pos = _this.projects.length;
          _this.projects = _this.projects.concat(msg.list);
          _this.loadProjects(pos);
        }
        if (!_this.initialized) {
          _this.initialized = true;
          return document.getElementById("explore-section").style.opacity = 1;
        }
      };
    })(this));
  };

  return Explore;

})();
