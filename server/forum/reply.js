const { marked } = require("marked");
var allowedTags, sanitizeHTML;

sanitizeHTML = require("sanitize-html");

allowedTags = sanitizeHTML.defaults.allowedTags.concat(["img"]);

this.ForumReply = class ForumReply {
  constructor(post, record) {
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

  set(prop, value) {
    var data;
    data = this.record.get();
    data[prop] = value;
    this.record.set(data);
    return this[prop] = value;
  }

  edit(text) {
    this.set("text", text);
    this.set("edits", this.edits + 1);
    return this.set("activity", Date.now());
  }

  addLike(id) {
    var index;
    index = this.likes.indexOf(id);
    if (index < 0) {
      this.likes.push(id);
      this.set("likes", this.likes);
    }
    return this.likes.length;
  }

  removeLike(id) {
    var index;
    index = this.likes.indexOf(id);
    if (index >= 0) {
      this.likes.splice(index, 1);
      this.set("likes", this.likes);
    }
    return this.likes.length;
  }

  isLiked(id) {
    return this.likes.indexOf(id) >= 0;
  }

  updateActivity() {
    this.set("activity", Date.now());
    return this.post.updateActivity();
  }

  getHTMLText() {
    return sanitizeHTML(marked(this.text), {
      allowedTags: allowedTags
    });
  }

};

module.exports = this.ForumReply;
