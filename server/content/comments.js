var Comment;

this.Comments = (function() {
  function Comments(project, data) {
    this.project = project;
    this.comments = [];
    this.load(data);
  }

  Comments.prototype.load = function(data) {
    var c, j, len, user;
    if ((data != null) && data.length > 0) {
      for (j = 0, len = data.length; j < len; j++) {
        c = data[j];
        user = this.project.content.users[c.user];
        if (user != null) {
          this.comments.push(new Comment(this, user, c));
        }
      }
    }
  };

  Comments.prototype.save = function() {
    var c, j, len, ref, res;
    res = [];
    ref = this.comments;
    for (j = 0, len = ref.length; j < len; j++) {
      c = ref[j];
      res.push({
        user: c.user.id,
        text: c.text,
        flags: c.flags,
        time: c.time
      });
    }
    return this.project.set("comments", res, false);
  };

  Comments.prototype.getAll = function() {
    var c, i, j, len, ref, res;
    res = [];
    ref = this.comments;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      c = ref[i];
      if (!c.flags.deleted && !c.user.flags.censored) {
        res.push({
          user: c.user.nick,
          user_info: {
            tier: c.user.flags.tier,
            profile_image: c.user.flags.profile_image
          },
          text: c.text,
          id: i,
          time: c.time
        });
      }
    }
    return res;
  };

  Comments.prototype.get = function(id) {
    return this.comments[id];
  };

  Comments.prototype.add = function(user, text) {
    this.comments.push(new Comment(this, user, {
      text: text,
      flags: {},
      time: Date.now()
    }));
    return this.save();
  };

  Comments.prototype.remove = function(comment) {
    if (comment != null) {
      return comment.flags.deleted = true;
    }
  };

  return Comments;

})();

Comment = (function() {
  function Comment(comments, user1, data) {
    this.comments = comments;
    this.user = user1;
    this.text = data.text;
    this.flags = data.flags;
    this.time = data.time;
  }

  Comment.prototype.edit = function(text1) {
    this.text = text1;
    return this.comments.save();
  };

  Comment.prototype.remove = function() {
    return this.comments.remove(this);
  };

  return Comment;

})();

module.exports = this.Comments;
