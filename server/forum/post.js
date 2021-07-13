var allowedTags, marked, sanitizeHTML;

marked = require("marked");

sanitizeHTML = require("sanitize-html");

allowedTags = sanitizeHTML.defaults.allowedTags.concat(["img"]);

this.ForumPost = (function() {
  function ForumPost(category, record) {
    var data;
    this.category = category;
    this.record = record;
    data = this.record.get();
    this.id = data.id;
    this.author = this.category.forum.content.users[data.author];
    this.title = data.title;
    this.text = data.text;
    this.media = data.media;
    this.date = data.date;
    this.activity = data.activity;
    this.edits = data.edits;
    this.views = data.views || 0;
    this.progress = data.progress || 0;
    this.status = data.status;
    this.deleted = data.deleted;
    this.likes = data.likes || [];
    this.watch = data.watch || [];
    this.users_watching = [];
    this.pinned = data.pinned;
    this.replies = [];
    this.slug = this.slugify(this.title);
    this.people = [];
    this.permissions = data.permissions || {
      reply: "user"
    };
    this.reverse = data.reverse;
  }

  ForumPost.prototype.addReply = function(reply) {
    this.replies.push(reply);
    if (!reply.deleted) {
      return this.addPeople(reply.author);
    }
  };

  ForumPost.prototype.addPeople = function(author) {
    var i, len, p, ref;
    this.sort_people = true;
    ref = this.people;
    for (i = 0, len = ref.length; i < len; i++) {
      p = ref[i];
      if (p.author === author) {
        p.replies += 1;
        return;
      }
    }
    return this.people.push({
      author: author,
      replies: 1
    });
  };

  ForumPost.prototype.getPeople = function() {
    if (this.sort_people) {
      this.sort_people = false;
      this.people.sort(function(a, b) {
        return a.replies - b.replies;
      });
    }
    return this.people;
  };

  ForumPost.prototype.set = function(prop, value) {
    var data;
    data = this.record.get();
    data[prop] = value;
    this.record.set(data);
    return this[prop] = value;
  };

  ForumPost.prototype.setCategoryId = function(id) {
    var data;
    data = this.record.get();
    data["category"] = id;
    return this.record.set(data);
  };

  ForumPost.prototype.edit = function(text) {
    this.set("text", text);
    this.set("edits", this.edits + 1);
    return this.updateActivity();
  };

  ForumPost.prototype.setTitle = function(title) {
    this.set("title", title);
    return this.slug = this.slugify(this.title);
  };

  ForumPost.prototype.addLike = function(id) {
    var index;
    index = this.likes.indexOf(id);
    if (index < 0) {
      this.likes.push(id);
      this.set("likes", this.likes);
    }
    return this.likes.length;
  };

  ForumPost.prototype.removeLike = function(id) {
    var index;
    index = this.likes.indexOf(id);
    if (index >= 0) {
      this.likes.splice(index, 1);
      this.set("likes", this.likes);
    }
    return this.likes.length;
  };

  ForumPost.prototype.isLiked = function(id) {
    return this.likes.indexOf(id) >= 0;
  };

  ForumPost.prototype.addWatch = function(id) {
    var index;
    index = this.watch.indexOf(id);
    if (index < 0) {
      this.watch.push(id);
      return this.set("watch", this.watch);
    }
  };

  ForumPost.prototype.removeWatch = function(id) {
    var index;
    index = this.watch.indexOf(id);
    if (index >= 0) {
      this.watch.splice(index, 1);
      return this.set("watch", this.watch);
    }
  };

  ForumPost.prototype.isWatching = function(id) {
    return this.watch.indexOf(id) >= 0;
  };

  ForumPost.prototype.view = function(ip) {
    if (ip == null) {
      return;
    }
    if ((this.views_buffer == null) || Date.now() > this.views_buffer_expiration) {
      this.views_buffer_expiration = Date.now() + 2 * 60 * 60 * 1000;
      this.views_buffer = {};
    }
    if (this.views_buffer[ip]) {
      return;
    }
    this.views_buffer[ip] = true;
    return this.set("views", this.views + 1);
  };

  ForumPost.prototype.updateActivity = function() {
    this.set("activity", Date.now());
    return this.category.updateActivity();
  };

  ForumPost.prototype.getPath = function() {
    var path;
    path = "/";
    if (this.category.language !== "en") {
      path += this.category.language + "/";
    }
    path += "community/" + this.category.slug + "/";
    return path += this.slug + "/" + this.id + "/";
  };

  ForumPost.prototype.slugify = function(text) {
    var res;
    res = text.normalize('NFD').replace(/[\s]/g, "-").replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase();
    if (res.length === 0) {
      res = "_";
    }
    return res;
  };

  ForumPost.prototype.getHTMLText = function() {
    return sanitizeHTML(marked(this.text), {
      allowedTags: allowedTags
    });
  };

  return ForumPost;

})();

module.exports = this.ForumPost;
