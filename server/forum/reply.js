var allowedTags, marked, sanitizeHTML;

marked = require("marked");

sanitizeHTML = require("sanitize-html");

allowedTags = sanitizeHTML.defaults.allowedTags.concat(["img"]);

this.ForumReply = (function() {
  function ForumReply(post, record) {
    var data;
    this.post = post;
    this.record = record;
    data = this.record.get();
    this.id = data.id;
    this.author = this.post.category.forum.content.users[data.author];
    this.text = data.text;
    this.date = data.date;
    this.edits = data.edits || 0;
    this.activity = data.activity;
    this.media = data.media;
    this.deleted = data.deleted;
    this.likes = data.likes || [];
    this.pinned = data.pinned;
  }

  ForumReply.prototype.set = function(prop, value) {
    var data;
    data = this.record.get();
    data[prop] = value;
    this.record.set(data);
    return this[prop] = value;
  };

  ForumReply.prototype.edit = function(text) {
    this.set("text", text);
    this.set("edits", this.edits + 1);
    return this.set("activity", Date.now());
  };

  ForumReply.prototype.addLike = function(id) {
    var index;
    index = this.likes.indexOf(id);
    if (index < 0) {
      this.likes.push(id);
      this.set("likes", this.likes);
    }
    return this.likes.length;
  };

  ForumReply.prototype.removeLike = function(id) {
    var index;
    index = this.likes.indexOf(id);
    if (index >= 0) {
      this.likes.splice(index, 1);
      this.set("likes", this.likes);
    }
    return this.likes.length;
  };

  ForumReply.prototype.isLiked = function(id) {
    return this.likes.indexOf(id) >= 0;
  };

  ForumReply.prototype.updateActivity = function() {
    this.set("activity", Date.now());
    return this.post.updateActivity();
  };

  ForumReply.prototype.getHTMLText = function() {
    return sanitizeHTML(marked(this.text), {
      allowedTags: allowedTags
    });
  };

  return ForumReply;

})();

module.exports = this.ForumReply;
