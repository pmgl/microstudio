var path, sw;

this.Forum = class Forum {
  constructor() {
    var e, p, reply;
    this.client = new Client(this);
    this.client.start();
    this.translator = new Translator(this);
    this.setTimeInfo();
    this.setOtherInfo();
    this.addLinks();
    this.updateUserCapabilities();
    this.plug("create-post-button", () => {
      return document.getElementById("edit-post").style.display = "block";
    });
    this.plug("edit-post-cancel", () => {
      if (document.getElementById("edit-post")) {
        document.getElementById("edit-post").style.display = "none";
      }
      if (this.current_edit) {
        return this.cancelCurrentEdit();
      }
    });
    this.plug("edit-post-preview", () => {
      return this.togglePreview();
    });
    this.plug("edit-post-post", () => {
      return this.sendPost();
    });
    setInterval((() => {
      return this.setTimeInfo();
    }), 30000);
    this.update();
    p = location.pathname.split("/");
    if (p[1] !== "community") {
      p.splice(1, 0);
    }
    if (p.length >= 6) {
      reply = p[5];
      e = document.getElementById(`post-reply-${reply}`);
      if (e != null) {
        e.scrollIntoView();
      }
    }
    console.info(p);
    if (window.post != null) {
      document.getElementById("edit-post-cancel").style.display = "none";
    }
    e = document.getElementById("edit-post-progress");
    if (e != null) {
      e.addEventListener("input", () => {
        return this.updateProgressLabel();
      });
    }
    document.querySelector("header .username").addEventListener("click", () => {
      return this.login();
    });
    document.querySelector(".theme").addEventListener("click", () => {
      return this.toggleTheme();
    });
    if (document.querySelector("#searchbar input") != null) {
      document.querySelector("#searchbar input").addEventListener("input", () => {
        return this.send_search = Date.now() + 1000;
      });
      document.querySelector("#searchbar i").addEventListener("click", () => {
        if (document.querySelector("#searchbar input").value.trim() !== "") {
          document.querySelector("#searchbar input").value = "";
          return this.send_search = Date.now();
        }
      });
    }
    setInterval((() => {
      return this.checkSendSearch();
    }), 500);
    this.sort_modes = ["activity", "likes", "views", "replies", "created", "relevance"];
    this.current_sort = 0;
    this.sort_functions = {
      activity: function(a, b) {
        return b.dataset.postActivity - a.dataset.postActivity;
      },
      likes: function(a, b) {
        return b.dataset.postLikes - a.dataset.postLikes;
      },
      views: function(a, b) {
        return b.dataset.postViews - a.dataset.postViews;
      },
      replies: function(a, b) {
        return b.dataset.postReplies - a.dataset.postReplies;
      },
      created: function(a, b) {
        return b.dataset.postCreated - a.dataset.postCreated;
      },
      relevance: function(a, b) {
        return b.dataset.score - a.dataset.score;
      }
    };
    if (document.querySelector("#sorting") != null) {
      document.querySelector("#sorting").addEventListener("click", () => {
        return this.rotateSort();
      });
    }
    this.checkEmbedded();
    if (community.language === "fr") {
      document.querySelector("header .rightpart .discord").href = "https://discord.gg/nEMpBU7";
    }
  }

  rotateSort() {
    this.current_sort = (this.current_sort + 1) % this.sort_modes.length;
    if (this.current_sort === this.sort_modes.length - 1 && document.querySelector("#searchbar input").value === "") {
      this.current_sort = 0;
    }
    return this.applySort();
  }

  applySort() {
    var e, j, k, len, len1, list, res, sort, tab;
    sort = this.sort_modes[this.current_sort];
    document.querySelector("#sorting span").innerText = this.translator.get(sort.substring(0, 1).toUpperCase() + sort.substring(1, sort.length));
    list = document.querySelectorAll('[data-post-id]');
    tab = {};
    res = [];
    if (list != null) {
      for (j = 0, len = list.length; j < len; j++) {
        e = list[j];
        res.push(e);
      }
      res.sort(this.sort_functions[sort]);
      for (k = 0, len1 = res.length; k < len1; k++) {
        e = res[k];
        document.querySelector(".posts").appendChild(e);
      }
    }
  }

  checkSendSearch() {
    var e, j, len, list;
    if (this.send_search && Date.now() > this.send_search) {
      this.send_search = null;
      if (document.querySelector("#searchbar input").value.trim() !== "") {
        return this.search(document.querySelector("#searchbar input").value, (results) => {
          var e, j, k, len, len1, list, res, tab;
          console.info(results);
          list = document.querySelectorAll('[data-post-id]');
          tab = {};
          if (list != null) {
            for (j = 0, len = list.length; j < len; j++) {
              e = list[j];
              e.style.display = "none";
              tab[e.dataset.postId] = e;
              e.dataset.score = 0;
            }
          }
          for (k = 0, len1 = results.length; k < len1; k++) {
            res = results[k];
            e = tab[res.id];
            if (e != null) {
              e.dataset.score = res.score;
              e.style.display = "block";
            }
          }
          this.current_sort = this.sort_modes.length - 1;
          this.applySort();
          document.querySelector("#searchbar i").classList.add("fa-times");
          return document.querySelector("#searchbar i").classList.remove("fa-search");
        });
      } else {
        list = document.querySelectorAll('[data-post-id]');
        if (list != null) {
          for (j = 0, len = list.length; j < len; j++) {
            e = list[j];
            e.style.display = "block";
          }
        }
        this.current_sort = 0;
        this.applySort();
        document.querySelector("#searchbar i").classList.remove("fa-times");
        return document.querySelector("#searchbar i").classList.add("fa-search");
      }
    }
  }

  login() {
    if (this.user) {
      return location.href = "/";
    } else {
      return location.href = "/login/";
    }
  }

  plug(id, click) {
    var element;
    element = document.getElementById(id);
    if (element != null) {
      return element.addEventListener("click", click);
    }
  }

  toggleTheme() {
    var theme;
    if (document.body.classList.contains("dark")) {
      theme = "light";
    } else {
      theme = "dark";
    }
    document.cookie = `theme=${theme};expires=${new Date(Date.now() + 3600000 * 24 * 365).toUTCString()};path=/`;
    return location.reload();
  }

  setTimeInfo() {
    var date, dt, e, j, len, list, results1;
    list = document.querySelectorAll('[data-activity]');
    if (list != null) {
      results1 = [];
      for (j = 0, len = list.length; j < len; j++) {
        e = list[j];
        date = new Date(parseInt(e.dataset.activity));
        e.title = `${this.translator.get("Last activity:")} ${date.toLocaleString()}`;
        dt = Date.now() - e.dataset.activity;
        dt /= 60000;
        if (dt < 1) {
          results1.push(e.innerText = this.translator.get("now"));
        } else if (dt < 60) {
          results1.push(e.innerText = this.translator.get("%MINUTES%m").replace("%MINUTES%", Math.floor(dt)));
        } else {
          dt /= 60;
          if (dt < 24) {
            results1.push(e.innerText = this.translator.get("%HOURS%h").replace("%HOURS%", Math.floor(dt)));
          } else {
            dt /= 24;
            if (dt < 365) {
              results1.push(e.innerText = this.translator.get("%DAYS%d").replace("%DAYS%", Math.floor(dt)));
            } else {
              dt /= 365;
              results1.push(e.innerText = this.translator.get("%YEARS%y").replace("%YEARS%", Math.floor(dt)));
            }
          }
        }
      }
      return results1;
    }
  }

  setOtherInfo() {
    var e, j, k, len, len1, list;
    list = document.querySelectorAll('[data-views]');
    if (list != null) {
      for (j = 0, len = list.length; j < len; j++) {
        e = list[j];
        e.title = `${this.translator.get("Views:")} ${e.dataset.views}`;
      }
    }
    list = document.querySelectorAll('[data-replies]');
    if (list != null) {
      for (k = 0, len1 = list.length; k < len1; k++) {
        e = list[k];
        e.title = `${this.translator.get("Replies:")} ${e.dataset.replies}`;
      }
    }
  }

  getHue(tag) {
    var hue, i, j, ref;
    hue = 0;
    for (i = j = 0, ref = tag.length - 1; j <= ref; i = j += 1) {
      hue += tag.charCodeAt(i) * 10;
    }
    return hue % 360;
  }

  addEditBars() {
    var e, j, len, list;
    list = document.querySelectorAll('[data-author]');
    if (list != null) {
      for (j = 0, len = list.length; j < len; j++) {
        e = list[j];
        if (e.dataset.author === this.user.nick || this.user.flags.admin) {
          this.createEditBar(e);
        }
      }
    }
  }

  createEditBar(e) {
    var del, div, edit;
    div = document.createElement("div");
    div.classList.add("edit-bar");
    edit = document.createElement("div");
    edit.classList.add("edit");
    edit.innerHTML = `<i class="fas fa-pencil-alt"></i> ${this.translator.get("Edit")}`;
    div.appendChild(edit);
    del = document.createElement("div");
    del.classList.add("delete");
    del.innerHTML = `<i class="fa fa-times"></i> ${this.translator.get("Delete")}`;
    div.appendChild(del);
    e.parentNode.insertBefore(div, e);
    edit.addEventListener("click", () => {
      if (e.dataset.type === "post") {
        return this.client.sendRequest({
          name: "get_raw_post",
          post: window.post.id
        }, (msg) => {
          if (msg.text != null) {
            return this.editPostOrReply(e, msg.text, div, msg.progress, msg.status);
          }
        });
      } else {
        return this.client.sendRequest({
          name: "get_raw_reply",
          reply: e.parentNode.dataset.replyId
        }, (msg) => {
          if (msg.text != null) {
            return this.editPostOrReply(e, msg.text, div);
          }
        });
      }
    });
    return del.addEventListener("click", () => {
      var id, index;
      if (e.dataset.type === "post") {
        if (confirm(this.translator.get("Do you really want to delete this whole post?"))) {
          return this.editPost({
            deleted: true
          }, () => {
            var url;
            url = location.origin;
            if (community.language !== "en") {
              url += `/${community.language}`;
            }
            url += `/community/${community.category}/`;
            return window.location.href = url;
          });
        }
      } else {
        if (confirm(this.translator.get("Do you really want to delete your reply?"))) {
          id = e.parentNode.dataset.replyId;
          index = e.parentNode.id.split("-")[2];
          return this.editReply(id, {
            deleted: true
          }, () => {
            var url;
            url = location.origin;
            if (community.language !== "en") {
              url += `/${community.language}`;
            }
            url += `/community/${community.category}/${post.slug}/${post.id}/`;
            return window.location.href = url;
          });
        }
      }
    });
  }

  editPostOrReply(element, text, edit_bar, progress, status) {
    var div;
    this.cancelCurrentEdit();
    document.getElementById("edit-post-text").value = text;
    element.style.display = "none";
    div = document.getElementById("edit-post-content");
    element.parentNode.insertBefore(div, element);
    edit_bar.style.display = "none";
    this.current_edit = {
      element: element,
      edit_bar: edit_bar,
      text: text,
      progress: progress,
      status: status || ""
    };
    div.parentNode.scrollIntoView();
    if (element.dataset.type === "post") {
      document.querySelector("#edit-post-content h2").innerText = this.translator.get("Editing post");
      if (this.user.flags.admin) {
        document.getElementById("edit-post-reserved").style.display = "block";
        document.getElementById("edit-post-progress").value = progress;
        document.getElementById("edit-post-status").value = status || "";
        this.updateProgressLabel();
      }
    } else {
      document.querySelector("#edit-post-content h2").innerText = this.translator.get("Editing reply");
    }
    return document.getElementById("edit-post-cancel").style.display = "inline-block";
  }

  cancelCurrentEdit() {
    if (this.current_edit) {
      document.querySelector(".post-container").appendChild(document.getElementById("edit-post-content"));
      document.getElementById("edit-post-text").value = "";
      this.current_edit.element.style.display = "block";
      this.current_edit.edit_bar.style.display = "block";
      this.current_edit = null;
      document.querySelector("#edit-post-content h2").innerText = this.translator.get("Post Reply");
      document.getElementById("edit-post-cancel").style.display = "none";
      return document.getElementById("edit-post-reserved").style.display = "none";
    }
  }

  update() {
    var e, hue, j, k, len, len1, list, progress, results1;
    list = document.querySelectorAll('[data-progress]');
    if (list != null) {
      for (j = 0, len = list.length; j < len; j++) {
        e = list[j];
        progress = e.dataset.progress;
        e.style.background = `linear-gradient(90deg, hsl(190,80%,40%) 0%, hsl(190,80%,40%) ${progress}%,hsl(190,10%,70%) ${progress}%)`;
      }
    }
    list = document.querySelectorAll('[data-colorize]');
    if (list != null) {
      results1 = [];
      for (k = 0, len1 = list.length; k < len1; k++) {
        e = list[k];
        hue = this.getHue(e.dataset.colorize);
        results1.push(e.style.background = `hsl(${hue},40%,50%)`);
      }
      return results1;
    }
  }

  filterPerms() {
    var e, j, len, list, results1;
    if (!this.user.flags.admin) {
      list = document.querySelectorAll('[data-perm]');
      if (list != null) {
        results1 = [];
        for (j = 0, len = list.length; j < len; j++) {
          e = list[j];
          if (e.dataset.perm === "admin") {
            e.disabled = true;
            results1.push(e.selected = false);
          } else {
            results1.push(void 0);
          }
        }
        return results1;
      }
    }
  }

  addLinks() {
    var e, j, len, list;
    list = document.querySelectorAll('[data-link]');
    if (list != null) {
      for (j = 0, len = list.length; j < len; j++) {
        e = list[j];
        (function(e) {
          return e.addEventListener("click", function() {
            var link;
            link = e.dataset.link;
            navigator.clipboard.writeText(link);
            e.classList.remove("fa-link");
            e.classList.add("fa-check");
            return setTimeout((function() {
              e.classList.remove("fa-check");
              return e.classList.add("fa-link");
            }), 5000);
          });
        })(e);
      }
    }
  }

  userConnected(nick) {
    if (this.user.flags.admin) {
      console.info("admin");
    }
    this.filterPerms();
    this.updateUserCapabilities();
    this.createLikeButtons();
    this.createWatchButton();
    if (!this.edit_bars_added) {
      this.edit_bars_added = true;
      return this.addEditBars();
    }
  }

  updateUserCapabilities() {
    var canpost, e;
    if (this.user == null) {
      document.querySelector("#edit-post-content").style.display = "none";
      setTimeout((() => {
        if (this.user == null) {
          document.querySelector("header .username i").classList.remove("fa-user");
          document.querySelector("header .username i").classList.add("fa-sign-in-alt");
          return document.querySelector("header .username").style.display = "inline-block";
        }
      }), 2000);
      e = document.querySelector("#create-post-button");
      if (e != null) {
        return e.style.display = "none";
      }
    } else {
      canpost = this.user.flags.validated && this.user.info.stats.level >= 10;
      if (!this.user.flags.validated) {
        document.querySelector("#validate-your-email").style.display = "block";
      }
      if ((community.permissions != null) && community.permissions.post !== "user" && !this.user.flags.admin) {
        canpost = false;
      }
      document.querySelector("header .username").style.display = "inline-block";
      document.querySelector("header .username span").innerText = this.user.nick;
      if (this.user.flags.profile_image) {
        document.querySelector("header .username img").style.display = "inline-block";
        document.querySelector("header .username i").style.display = "none";
        document.querySelector("header .username img").src = `/${this.user.nick}.png`;
      }
      if (canpost) {
        document.querySelector("#edit-post-content").style.display = "block";
        e = document.querySelector("#create-post-button");
        if (e != null) {
          e.style.display = "block";
        }
      } else {
        document.querySelector("#edit-post-content").style.display = "none";
        e = document.querySelector("#create-post-button");
        if (e != null) {
          e.style.display = "none";
        }
      }
      if ((typeof post !== "undefined" && post !== null) && (post.permissions.reply === "admin" || post.post_permissions.reply === "admin") && !this.user.flags.admin) {
        return document.querySelector("#edit-post-content").style.display = "none";
      }
    }
  }

  serverMessage(msg) {
    return console.info(msg);
  }

  updateProgressLabel() {
    return document.getElementById("edit-post-progress-label").innerText = document.getElementById("edit-post-progress").value + " %";
  }

  sendPost() {
    var category, data, id, index, progress, status, text, title;
    if ((this.last_posted != null) && Date.now() < this.last_posted + 5000) {
      return;
    }
    //console.info "wait"
    this.last_posted = Date.now();
    document.getElementById("edit-post-post").style.background = "rgba(128,128,128,.2)";
    setTimeout((() => {
      return document.getElementById("edit-post-post").style.background = "";
    }), 5000);
    if (window.post != null) {
      if (this.current_edit != null) {
        if (this.current_edit.element.dataset.type === "post") {
          text = document.getElementById("edit-post-text").value;
          progress = document.getElementById("edit-post-progress").value;
          status = document.getElementById("edit-post-status").value;
          if (text === this.current_edit.text && progress === this.current_edit.progress && status === this.current_edit.status) {
            return this.cancelCurrentEdit();
          }
          data = {
            text: text !== this.current_edit.text ? text : void 0,
            progress: progress !== this.current_edit.progress ? progress : void 0,
            status: status !== this.current_edit.status ? status : void 0
          };
          return this.editPost(data, () => {
            var url;
            url = location.origin;
            if (community.language !== "en") {
              url += `/${community.language}`;
            }
            url += `/community/${community.category}/${post.slug}/${post.id}/`;
            return window.location.href = url;
          });
        } else {
          text = document.getElementById("edit-post-text").value;
          id = this.current_edit.element.parentNode.dataset.replyId;
          index = this.current_edit.element.parentNode.id.split("-")[2];
          return this.editReply(id, {
            text: text
          }, () => {
            var url;
            url = location.origin;
            if (community.language !== "en") {
              url += `/${community.language}`;
            }
            url += `/community/${community.category}/${post.slug}/${post.id}/${index}/`;
            return window.location.href = url;
          });
        }
      } else {
        text = document.getElementById("edit-post-text").value;
        return this.createReply(text, (index) => {
          var url;
          url = location.origin;
          if (community.language !== "en") {
            url += `/${community.language}`;
          }
          url += `/community/${community.category}/${post.slug}/${post.id}/${index}/`;
          return window.location.href = url;
        });
      }
    } else {
      category = document.getElementById("edit-post-category").value;
      title = document.getElementById("edit-post-title").value;
      text = document.getElementById("edit-post-text").value;
      return this.createPost(title, text, category, () => {
        var url;
        url = location.origin;
        if (community.language !== "en") {
          url += `/${community.language}`;
        }
        url += `/community/${category}/`;
        return window.location.href = url;
      });
    }
  }

  createCategory(title, slug, description, hue) {
    return this.client.sendRequest({
      name: "create_forum_category",
      language: community.language,
      title: title,
      slug: slug,
      description: description,
      hue: hue
    }, function(msg) {
      return console.info(msg);
    });
  }

  createPost(title, text, category, callback) {
    return this.client.sendRequest({
      name: "create_forum_post",
      category: category,
      title: title,
      text: text
    }, function(msg) {
      console.info(msg);
      if (callback != null) {
        return callback();
      }
    });
  }

  createReply(text, callback) {
    return this.client.sendRequest({
      name: "create_forum_reply",
      post: window.post.id,
      text: text
    }, function(msg) {
      console.info(msg);
      if (callback != null) {
        return callback(msg.index);
      }
    });
  }

  editCategory(fields) {
    fields.category = community.category;
    fields.name = "edit_forum_category";
    return this.client.sendRequest(fields, function(msg) {
      return console.info(msg);
    });
  }

  editPost(fields, callback) {
    fields.post = window.post.id;
    fields.name = "edit_forum_post";
    return this.client.sendRequest(fields, function(msg) {
      console.info(msg);
      if (callback != null) {
        return callback();
      }
    });
  }

  editReply(reply, fields, callback) {
    fields.reply = reply;
    fields.name = "edit_forum_reply";
    return this.client.sendRequest(fields, function(msg) {
      console.info(msg);
      if (callback != null) {
        return callback();
      }
    });
  }

  checkEmbedded() {
    var e, iframe, j, len, list, results1, t;
    list = document.querySelectorAll("p");
    if (list) {
      results1 = [];
      for (j = 0, len = list.length; j < len; j++) {
        e = list[j];
        t = e.innerText.split(" ");
        if (t[0] === ":embed" && (t[1] != null) && t[1].startsWith("https://microstudio.io/")) {
          iframe = document.createElement("iframe");
          iframe.src = t[1];
          e.innerHTML = "";
          results1.push(e.appendChild(iframe));
        } else {
          results1.push(void 0);
        }
      }
      return results1;
    }
  }

  togglePreview() {
    if (!this.preview) {
      this.preview = true;
      document.getElementById("edit-post-preview-area").style.display = "block";
      document.getElementById("edit-post-text").style.display = "none";
      document.getElementById("edit-post-preview-area").innerHTML = marked(document.getElementById("edit-post-text").value);
      document.querySelector("#edit-post-preview i").classList.add("fa-keyboard");
      document.querySelector("#edit-post-preview i").classList.remove("fa-eye");
      document.querySelector("#edit-post-preview span").innerText = this.translator.get("Write");
      return this.checkEmbedded();
    } else {
      this.preview = false;
      document.getElementById("edit-post-preview-area").style.display = "none";
      document.getElementById("edit-post-text").style.display = "block";
      document.querySelector("#edit-post-preview i").classList.remove("fa-keyboard");
      document.querySelector("#edit-post-preview i").classList.add("fa-eye");
      return document.querySelector("#edit-post-preview span").innerText = this.translator.get("Preview");
    }
  }

  setWatchButton(watch, text, callback) {
    var wbutton, wdiv, wtext;
    wdiv = document.querySelector(".watch");
    wtext = document.querySelector(".watch .text");
    wbutton = document.querySelector(".watch .button");
    if (text != null) {
      wtext.style.display = "block";
      wtext.innerText = text;
      if (this.watch_text_timeout != null) {
        clearTimeout(this.watch_text_timeout);
      }
      this.watch_text_timeout = setTimeout((() => {
        return wtext.style.display = "none";
      }), 10000);
    } else {
      wtext.style.display = "none";
    }
    if (watch) {
      wbutton.innerHTML = "<i class='fas fa-minus-circle'></i> " + this.translator.get("Unwatch");
      wbutton.classList.add("unwatch");
    } else {
      wbutton.innerHTML = "<i class='fas fa-envelope'></i> " + this.translator.get("Watch");
      wbutton.classList.remove("unwatch");
    }
    if (callback != null) {
      wbutton.addEventListener("click", callback);
    }
    return wdiv.style.display = "block";
  }

  createWatchButton() {
    if ((this.user != null) && this.user.flags.validated) {
      if (window.post != null) {
        return this.client.sendRequest({
          name: "get_post_watch",
          post: window.post.id
        }, (msg) => {
          return this.setWatchButton(msg.watch, null, () => {
            return this.client.sendRequest({
              name: "set_post_watch",
              post: window.post.id,
              watch: !msg.watch
            }, (m) => {
              var t;
              msg.watch = !msg.watch;
              t = msg.watch ? this.translator.get("You will receive e-mail notifications when new replies to this post are published.") : this.translator.get("You will no longer receive notifications.");
              return this.setWatchButton(msg.watch, t);
            });
          });
        });
      } else if (community.category !== "all") {
        return this.client.sendRequest({
          name: "get_category_watch",
          category: community.category
        }, (msg) => {
          return this.setWatchButton(msg.watch, null, () => {
            return this.client.sendRequest({
              name: "set_category_watch",
              category: community.category,
              watch: !msg.watch
            }, (m) => {
              var t;
              msg.watch = !msg.watch;
              t = msg.watch ? this.translator.get("You will receive e-mail notifications when new posts are published in this category.") : this.translator.get("You will no longer receive notifications.");
              return this.setWatchButton(msg.watch, t);
            });
          });
        });
      }
    }
  }

  createLikeButtons() {
    var list;
    if (this.user != null) {
      if (window.post != null) {
        this.client.sendRequest({
          name: "get_my_likes",
          post: window.post.id
        }, (msg) => {
          var id, j, len, list, p, r;
          p = document.querySelector("[data-likes-post]");
          this.createPostLikeButton(p, msg.data.post);
          list = document.querySelectorAll('[data-likes-reply]');
          if (list != null) {
            for (j = 0, len = list.length; j < len; j++) {
              r = list[j];
              id = r.dataset.likesReply | 0;
              this.createReplyLikeButton(r, msg.data.replies.indexOf(id) >= 0);
            }
          }
          return console.info(msg);
        });
      } else if (community.category !== "all") {
        this.client.sendRequest({
          name: "get_my_likes",
          category: community.category
        }, (msg) => {
          var id, j, len, list, p;
          list = document.querySelectorAll('[data-likes-post]');
          if (list != null) {
            for (j = 0, len = list.length; j < len; j++) {
              p = list[j];
              id = p.dataset.likesPost | 0;
              this.createPostLikeButton(p, msg.data.indexOf(id) >= 0);
            }
          }
          return console.info(msg);
        });
      } else {
        this.client.sendRequest({
          name: "get_my_likes",
          language: community.language
        }, (msg) => {
          var id, j, len, list, p;
          list = document.querySelectorAll('[data-likes-post]');
          if (list != null) {
            for (j = 0, len = list.length; j < len; j++) {
              p = list[j];
              id = p.dataset.likesPost | 0;
              this.createPostLikeButton(p, msg.data.indexOf(id) >= 0);
            }
          }
          return console.info(msg);
        });
      }
      list = document.querySelectorAll('.post-likes');
    }
  }

  //if list?
  //  for like in list
  //    @createLikeButton(like)
  createPostLikeButton(element, liked) {
    element.style.cursor = "pointer";
    element.addEventListener("click", () => {
      return this.client.sendRequest({
        name: "set_post_like",
        post: element.dataset.likesPost,
        like: !liked
      }, (msg) => {
        element.querySelector("span").innerText = msg.likes;
        liked = !liked;
        if (liked) {
          return element.classList.add("self");
        } else {
          return element.classList.remove("self");
        }
      });
    });
    if (liked) {
      return element.classList.add("self");
    }
  }

  createReplyLikeButton(element, liked) {
    element.style.cursor = "pointer";
    element.addEventListener("click", () => {
      return this.client.sendRequest({
        name: "set_reply_like",
        reply: element.dataset.likesReply,
        like: !liked
      }, (msg) => {
        element.querySelector("span").innerText = msg.likes;
        liked = !liked;
        if (liked) {
          return element.classList.add("self");
        } else {
          return element.classList.remove("self");
        }
      });
    });
    if (liked) {
      return element.classList.add("self");
    }
  }

  search(string, callback) {
    var j, len, w, words;
    words = string.toLowerCase().match(/\b(\w+)\b/g);
    if (words != null) {
      for (j = 0, len = words.length; j < len; j++) {
        w = words[j];
        if (w.length >= 2 && w.charAt(w.length - 1) !== "s") {
          string += ` ${w}s`;
        } else if (w.length >= 3 && w.charAt(w.length - 1) === "s") {
          string += ` ${w.substring(0, w.length - 1)}`;
        }
      }
      console.info(`search string: ${string}`);
    }
    return this.client.sendRequest({
      name: "search_forum",
      language: community.language,
      string: string
    }, (msg) => {
      if (callback != null) {
        return callback(msg.results);
      } else {
        return console.info(msg);
      }
    });
  }

};

window.addEventListener("load", () => {
  return window.forum = new this.Forum;
});

if ((navigator.serviceWorker != null) && !window.skip_service_worker) {
  path = location.pathname.split("/");
  if (path[2] === "community") {
    sw = `/${path[1]}/community/forum_sw.js`;
    path = `/${path[1]}/community/`;
  } else {
    sw = '/community/forum_sw.js';
    path = "/community/";
  }
  navigator.serviceWorker.register(sw, {
    scope: location.origin + path
  }).then(function(reg) {
    return console.log('Registration succeeded. Scope is' + reg.scope);
  }).catch(function(error) {
    return console.log('Registration failed with' + error);
  });
}
