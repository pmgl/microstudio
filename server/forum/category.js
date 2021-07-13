this.ForumCategory = (function() {
  function ForumCategory(forum, record) {
    var data;
    this.forum = forum;
    this.record = record;
    data = this.record.get();
    this.id = data.id;
    this.language = data.language;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.hue = data.hue || 0;
    this.activity = data.activity;
    this.deleted = data.deleted;
    this.hidden = data.hidden || false;
    this.watch = data.watch || [];
    this.permissions = data.permissions || {
      post: "user",
      reply: "user"
    };
    this.options = data.options || {
      post_progress: false,
      post_close: false,
      post_sortorder: false
    };
    this.posts = [];
    this.path = this.language === "en" ? "/community/" + this.slug + "/" : "/" + this.language + "/community/" + this.slug + "/";
  }

  ForumCategory.prototype.set = function(prop, value) {
    var data;
    data = this.record.get();
    data[prop] = value;
    this.record.set(data);
    return this[prop] = value;
  };

  ForumCategory.prototype.addPost = function(post) {
    this.posts.push(post);
    return this.sorted = false;
  };

  ForumCategory.prototype.removePost = function(post) {
    var index;
    index = this.posts.indexOf(post);
    if (index >= 0) {
      this.posts.splice(index, 1);
      return this.sorted = false;
    }
  };

  ForumCategory.prototype.updateActivity = function() {
    this.set("activity", Date.now());
    this.updateSort();
    return this.forum.updateActivity();
  };

  ForumCategory.prototype.updateSort = function() {
    return this.sorted = false;
  };

  ForumCategory.prototype.getSortedPosts = function() {
    if (!this.sorted) {
      this.posts.sort(function(a, b) {
        return b.activity - a.activity;
      });
    }
    return this.posts;
  };

  ForumCategory.prototype.addWatch = function(id) {
    var index;
    index = this.watch.indexOf(id);
    if (index < 0) {
      this.watch.push(id);
      return this.set("watch", this.watch);
    }
  };

  ForumCategory.prototype.removeWatch = function(id) {
    var index;
    index = this.watch.indexOf(id);
    if (index >= 0) {
      this.watch.splice(index, 1);
      return this.set("watch", this.watch);
    }
  };

  ForumCategory.prototype.isWatching = function(id) {
    return this.watch.indexOf(id) >= 0;
  };

  return ForumCategory;

})();

module.exports = this.ForumCategory;
