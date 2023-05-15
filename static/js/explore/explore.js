this.Explore = class Explore {
  constructor(app) {
    var likes;
    this.app = app;
    this.get("explore-back-button").addEventListener("click", () => {
      this.closeDetails();
      return this.app.appui.setMainSection("explore", true);
    });
    this.sort = "hot";
    this.active_tags = [];
    this.search = "";
    this.tags = [];
    this.visited_projects = {};
    this.sort_types = ["hot", "new", "top"];
    this.project_types = ["all", "app", "library", "plugin", "tutorial", "example", "template"];
    this.project_type = "all";
    this.sort_functions = {
      hot: function(a, b) {
        return b.likes - a.likes + b.date_published / (1000 * 3600 * 24) - a.date_published / (1000 * 3600 * 24);
      },
      top: function(a, b) {
        return b.likes - a.likes;
      },
      new: function(a, b) {
        return b.date_published - a.date_published;
      }
    };
    document.getElementById("explore-sort-button").addEventListener("click", () => {
      var e, j, len, ref, s;
      s = this.sort_types.indexOf(this.sort);
      s = (s + 1) % this.sort_types.length;
      this.sort = this.sort_types[s];
      e = document.getElementById("explore-sort-button");
      ref = this.sort_types;
      for (j = 0, len = ref.length; j < len; j++) {
        s = ref[j];
        if (s === this.sort) {
          e.classList.add(s);
        } else {
          e.classList.remove(s);
        }
      }
      document.querySelector("#explore-sort-button span").innerText = this.app.translator.get(this.sort.substring(0, 1).toUpperCase() + this.sort.substring(1));
      return this.query();
    });
    document.getElementById("explore-type-button").addEventListener("click", () => {
      var s;
      s = this.project_types.indexOf(this.project_type);
      s = (s + 1) % this.project_types.length;
      this.setProjectType(this.project_types[s]);
      return this.query();
    });
    document.getElementById("explore-search-input").addEventListener("input", () => {
      this.search = document.getElementById("explore-search-input").value;
      if (this.search_timeout != null) {
        clearTimeout(this.search_timeout);
      }
      return this.search_timeout = setTimeout((() => {
        return this.query();
      }), 1500);
    });
    document.getElementById("explore-contents").addEventListener("scroll", () => {
      var contents, h1, h2, pos, scrollzone;
      contents = document.getElementById("explore-box-list");
      scrollzone = document.getElementById("explore-contents");
      h1 = contents.getBoundingClientRect().height;
      h2 = scrollzone.getBoundingClientRect().height;
      if (scrollzone.scrollTop > h1 - h2 - 100) { //contents.getBoundingClientRect().height < scrollzone.scrollTop+window.innerHeight*2
        if (!this.completed) {
          pos = this.projects.length;
          if (pos !== this.query_position) {
            this.query(pos);
          }
        }
      }
    });
    this.cloned = {};
    this.get("project-details-clonebutton").addEventListener("click", () => {
      if (this.app.user == null) {
        return alert(this.app.translator.get("Log in or create your account to clone this project."));
      }
      this.get("project-details-clonebutton").style.display = "none";
      this.cloned[this.project.id] = true;
      return this.app.client.sendRequest({
        name: "clone_public_project",
        project: this.project.id
      }, (msg) => {
        this.app.appui.setMainSection("projects");
        this.app.appui.backToProjectList();
        this.app.updateProjectList(msg.id);
        return this.app.appui.showNotification(this.app.translator.get("Project cloned! Here is your copy."));
      });
    });
    likes = this.get("project-details-likes");
    likes.addEventListener("click", () => {
      if (!this.app.user.flags.validated) {
        return alert(this.app.translator.get("Validate your e-mail address to enable votes."));
      }
      if (this.project != null) {
        return this.app.client.sendRequest({
          name: "toggle_like",
          project: this.project.id
        }, (msg) => {
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
    });
    document.querySelector("#explore-tags-bar i").addEventListener("click", () => {
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
    });
  }

  setProjectType(project_type) {
    var e, j, len, ref, s;
    this.project_type = project_type;
    e = document.getElementById("explore-type-button");
    ref = this.project_types;
    for (j = 0, len = ref.length; j < len; j++) {
      s = ref[j];
      if (s === this.project_type) {
        e.classList.add(s);
      } else {
        e.classList.remove(s);
      }
    }
    return document.querySelector("#explore-type-button span").innerText = this.app.translator.get(this.project_type.substring(0, 1).toUpperCase() + this.project_type.substring(1));
  }

  closeDetails() {
    return this.closeProject();
  }

  //@app.setHomeState()
  closed() {
    if (!document.title.startsWith("microStudio")) {
      return document.title = "microStudio";
    }
  }

  findBestTag(p) {
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
  }

  createProjectBox(p) {
    var author, awaiting, element, icon, infobox, label, likes, runbutton, smallicon, tag, title;
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
      icon.src = location.origin + `/${p.owner}/${p.slug}/poster.png`;
      icon.classList.add("poster");
      //icon.classList.add "pixelated"
      icon.alt = p.title;
      icon.title = p.title;
      element.appendChild(icon);
      smallicon = new Image;
      smallicon.src = location.origin + `/${p.owner}/${p.slug}/icon.png`;
      smallicon.classList.add("smallicon");
      smallicon.classList.add("pixelated");
      smallicon.alt = p.title;
      smallicon.title = p.title;
      element.appendChild(smallicon);
    } else {
      icon = new Image;
      icon.src = location.origin + `/${p.owner}/${p.slug}/icon.png`;
      icon.classList.add("icon");
      icon.classList.add("pixelated");
      icon.alt = p.title;
      icon.title = p.title;
      element.appendChild(icon);
    }
    element.style.opacity = 0;
    element.style["transition-duration"] = "1s";
    element.style["transition-property"] = "opacity";
    icon.onload = () => {
      return element.style.opacity = 1;
    };
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
    likes.addEventListener("click", (event) => {
      event.stopImmediatePropagation();
      if (!this.app.user.flags.validated) {
        return alert(this.app.translator.get("Validate your e-mail address to enable votes."));
      }
      return this.app.client.sendRequest({
        name: "toggle_like",
        project: p.id
      }, (msg) => {
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
    });
    if (p.type !== "app") {
      label = document.createElement("div");
      label.classList.add("type-label");
      label.classList.add(p.type);
      switch (p.type) {
        case "library":
          label.innerHTML = `<i class="fas fa-file-code"></i> ${this.app.translator.get("Library")}`;
          break;
        case "plugin":
          label.innerHTML = `<i class="fas fa-plug"></i> ${this.app.translator.get("Plug-in")}`;
          break;
        case "tutorial":
          label.innerHTML = `<i class="fas fa-graduation-cap"></i> ${this.app.translator.get("Tutorial")}`;
          break;
        case "example":
          label.innerHTML = `<i class="fas fa-lightbulb"></i> ${this.app.translator.get("Example")}`;
          break;
        case "template":
          label.innerHTML = `<i class="fas fa-boxes"></i> ${this.app.translator.get("Template")}`;
      }
      element.appendChild(label);
    }
    if (!p.flags.approved && !p.owner_info.approved && window.ms_project_moderation) {
      awaiting = document.createElement("div");
      awaiting.classList.add("awaiting-label");
      awaiting.innerHTML = "Awaiting approval";
      element.appendChild(awaiting);
    }
    runbutton.addEventListener("click", (event) => {
      event.stopPropagation();
      if (p.type === "tutorial") {
        return window.open(location.origin.replace(".dev", ".io") + `/tutorial/${p.owner}/${p.slug}/`, "_blank");
      } else {
        return window.open(location.origin.replace(".dev", ".io") + `/${p.owner}/${p.slug}/`, "_blank");
      }
    });
    element.addEventListener("click", () => {
      if (screen.width <= 700) {
        return window.open(location.origin.replace(".dev", ".io") + `/${p.owner}/${p.slug}/`, "_blank");
      } else {
        this.app.app_state.pushState("project_details", `/i/${p.owner}/${p.slug}/`, {
          project: p
        });
        this.openProject(p);
        return this.canBack = true;
      }
    });
    return element;
  }

  get(id) {
    return document.getElementById(id);
  }

  findProject(owner, slug) {
    var id, j, len, p, ref;
    id = `${owner}.${slug}`;
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
  }

  openProject(p) {
    var desc, div, j, k, len, len1, lib, likes, list, ref, ref1, t;
    this.visited_projects[`${p.owner}.${p.slug}`] = p;
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
    this.get("project-details-image").src = location.origin + `/${p.owner}/${p.slug}/icon.png`;
    this.get("project-details-title").innerText = p.title;
    desc = DOMPurify.sanitize(marked(p.description));
    if (p.poster) {
      this.get("project-details-info").style.background = `linear-gradient(to bottom, hsla(200,10%,10%,0.8), hsla(200,10%,10%,0.9)),url(/${p.owner}/${p.slug}/poster.png)`;
      this.get("project-details-info").style["background-size"] = "100%";
      this.get("project-details-info").style["background-repeat"] = "no-repeat";
    } else {
      this.get("project-details-info").style.background = "none";
    }
    desc += `<p style="margin-bottom: 5px; font-size: 14px; color: rgba(255,255,255,.5)"><i class="fas fa-calendar-alt" style="color:hsl(160,50%,40%)"></i>${this.app.translator.get("First published on %DATE%").replace("%DATE%", new Date(p.date_published).toLocaleDateString())}</p>`;
    desc += `<p style="margin-bottom: 5px; font-size: 14px; color: rgba(255,255,255,.5)"><i class="fas fa-calendar-alt" style="color:hsl(160,50%,40%)"></i>${this.app.translator.get("Last modified on %DATE%").replace("%DATE%", new Date(p.last_modified).toLocaleDateString())}</p>`;
    ref = p.libs;
    for (j = 0, len = ref.length; j < len; j++) {
      lib = ref[j];
      desc = `<p><i class="fas fa-info-circle" style="color:hsl(20,100%,70%)"></i>${this.app.translator.get("This project uses this optional library:")} ${lib}</p>` + desc;
    }
    if (p.graphics !== "M1") {
      desc = `<p><i class="fas fa-info-circle" style="color:hsl(20,100%,70%)"></i>${this.app.translator.get("This project uses this graphics API:")} ${p.graphics}</p>` + desc;
    }
    if (p.language != null) {
      desc = `<br /><div class="explore-project-language ${(p.language.split("_")[0])}">${(p.language.split("_")[0])}</div><br />` + desc;
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
      this.get("project-details-runbutton").href = location.origin.replace(".dev", ".io") + `/tutorial/${p.owner}/${p.slug}/`;
    } else {
      this.get("project-details-runbutton").href = location.origin.replace(".dev", ".io") + `/${p.owner}/${p.slug}/`;
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
        ((t) => {
          return div.addEventListener("click", () => {
            var index;
            if (confirm("really delete tag?")) {
              index = p.tags.indexOf(t);
              if (index >= 0) {
                p.tags.splice(index, 1);
                return this.app.client.sendRequest({
                  name: "set_project_tags",
                  project: p.id,
                  tags: p.tags
                }, (msg) => {
                  return this.openProject(p);
                });
              }
            }
          });
        })(t);
      }
    }
    if ((this.app.user != null) && (this.app.user.flags.admin || this.app.user.flags.moderator) && window.ms_project_moderation) {
      if (p.owner_info.approved) {
        document.getElementById("project-details-description").appendChild(this.createModerationParagraph("User approved, project visible to everyone"));
        document.getElementById("project-details-description").appendChild(this.createModerationButton("Remove user approval", () => {
          if (confirm("Really remove user approval?")) {
            return this.app.client.sendRequest({
              name: "set_user_approved",
              user: p.owner,
              approved: false
            }, (msg) => {
              return location.reload();
            });
          }
        }));
      } else if (p.flags.approved) {
        document.getElementById("project-details-description").appendChild(this.createModerationParagraph("Project is approved and visible to everyone"));
        document.getElementById("project-details-description").appendChild(this.createModerationButton("Remove project approval", () => {
          if (confirm("Really remove project approval?")) {
            return this.app.client.sendRequest({
              name: "set_project_approved",
              project: p.id,
              approved: false
            }, (msg) => {
              return location.reload();
            });
          }
        }));
      } else {
        document.getElementById("project-details-description").appendChild(this.createModerationParagraph("Project is visible only to moderators, awaiting approval"));
        document.getElementById("project-details-description").appendChild(this.createModerationButton("Approve project", () => {
          if (confirm("Really approve project?")) {
            return this.app.client.sendRequest({
              name: "set_project_approved",
              project: p.id,
              approved: true
            }, (msg) => {
              return location.reload();
            });
          }
        }));
        document.getElementById("project-details-description").appendChild(this.createModerationButton("Approve user", () => {
          if (confirm("Really approve user?")) {
            return this.app.client.sendRequest({
              name: "set_user_approved",
              user: p.owner,
              approved: true
            }, (msg) => {
              return location.reload();
            });
          }
        }));
      }
      div = document.createElement("div");
      div.classList.add("tag");
      div.innerText = "+ add";
      div.style = "background: hsl(0,50%,50%)";
      list.appendChild(div);
      div.addEventListener("click", () => {
        var value;
        value = prompt("add tag");
        if ((value != null) && value.length > 1) {
          p.tags.push(value);
          return this.app.client.sendRequest({
            name: "set_project_tags",
            project: p.id,
            tags: p.tags
          }, (msg) => {
            return this.openProject(p);
          });
        }
      });
    }
    if (this.details == null) {
      this.details = new ProjectDetails(this.app);
    }
    return this.details.set(p);
  }

  createModerationParagraph(text) {
    var p;
    p = document.createElement("p");
    p.style = "padding: 25px 0px 5px 0";
    p.innerHTML = text;
    return p;
  }

  createModerationButton(text, callback) {
    var div;
    div = document.createElement("div");
    div.style = "padding: 5px 10px ; margin-left: 10px ; background:hsl(20,50%,50%) ; cursor: pointer; display: inline-block; border-radius: 5px";
    div.innerHTML = text;
    div.addEventListener("click", () => {
      return callback();
    });
    return div;
  }

  closeProject(p) {
    this.get("explore-back-button").style.display = "none";
    this.get("explore-tools").style.display = "inline-block";
    this.get("explore-tags-bar").style.display = "block";
    this.get("explore-contents").style.display = "block";
    this.get("explore-project-details").style.display = "none";
    this.project = null;
    return this.closed();
  }

  createTags(tags) {
    var div, j, len, ref, t;
    this.tags = tags;
    document.getElementById("explore-tags").innerHTML = "";
    ref = this.tags;
    for (j = 0, len = ref.length; j < len; j++) {
      t = ref[j];
      div = document.createElement("div");
      div.innerText = t;
      if (this.active_tags.includes(t)) {
        div.classList.add("active");
      }
      //span = document.createElement "span"
      //span.innerText = t.count
      //div.appendChild span
      document.getElementById("explore-tags").appendChild(div);
      ((t, div) => {
        return div.addEventListener("click", () => {
          var index;
          index = this.active_tags.indexOf(t);
          if (index >= 0) {
            this.active_tags.splice(index, 1);
            div.classList.remove("active");
          } else {
            this.active_tags.push(t);
            div.classList.add("active");
          }
          return this.query();
        });
      })(t, div);
    }
  }

  loadProjects(pos = 0) {
    var contents, i, j, mod, p, ref, ref1, scrollzone;
    if (this.projects == null) {
      return;
    }
    contents = document.getElementById("explore-box-list");
    scrollzone = document.getElementById("explore-contents");
    if (pos === 0) {
      contents.innerHTML = "";
    }
    mod = (this.app.user != null) && (this.app.user.flags.admin || this.app.user.flags.moderator);
    for (i = j = ref = pos, ref1 = this.projects.length - 1; j <= ref1; i = j += 1) {
      p = this.projects[i];
      if (mod || (p.flags.approved || p.owner_info.approved || !window.ms_project_moderation)) {
        contents.appendChild(this.createProjectBox(p));
      }
    }
  }

  update() {
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
      }, (msg) => {
        project = msg.project;
        if (project != null) {
          this.openProject(project);
          document.getElementById("explore-section").style.opacity = 1;
        }
      });
    } else {
      if ((this.projects == null) || this.projects.length === 0) {
        return this.query();
      }
    }
  }

  query(position = 0) {
    var f;
    this.query_position = position;
    if (position === 0 || (this.current_offset == null)) {
      this.current_offset = 0;
    }
    f = () => {};
    this.app.client.sendRequest({
      name: "get_public_projects",
      ranking: this.sort,
      type: this.project_type,
      tags: this.active_tags,
      search: this.search.toLowerCase(),
      position: position,
      offset: this.current_offset
    }, (msg) => {
      var pos;
      if (position === 0) {
        this.current_position = position;
        this.current_offset = msg.offset;
        this.completed = false;
        this.projects = msg.list;
        this.createTags(msg.tags);
        this.loadProjects();
        document.getElementById("explore-contents").scrollTop = 0;
      } else {
        if (msg.list.length === 0) {
          this.completed = true;
        }
        this.current_position = position;
        this.current_offset = msg.offset;
        pos = this.projects.length;
        this.projects = this.projects.concat(msg.list);
        this.loadProjects(pos);
      }
      if (!this.initialized) {
        this.initialized = true;
        return document.getElementById("explore-section").style.opacity = 1;
      }
    });
  }

};

//@app.setHomeState()
