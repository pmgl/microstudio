var Comment;

this.Comments = class Comments {
  constructor(project, data) {
    this.project = project;
    this.comments = [];
    this.load(data);
  }

  load(data) {
    var c, j, len, user;
    if ((data != null) && data.length > 0) {
      for (j = 0, len = data.length; j < len; j++) {
        c = data[j];
        user = this.project.content.users[c.user];
        if ((user != null) && !user.flags.deleted) {
          this.comments.push(new Comment(this, user, c));
        }
      }
    }
  }

  save() {
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
  }

  getAll() {
    var c, i, j, len, ref, res;
    res = [];
    ref = this.comments;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      c = ref[i];
      if (!c.flags.deleted && !c.user.flags.censored && !c.user.flags.deleted) {
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
  }

  get(id) {
    return this.comments[id];
  }

  add(user, text) {
    this.comments.push(new Comment(this, user, {
      text: text,
      flags: {},
      time: Date.now()
    }));
    return this.save();
  }

  remove(comment) {
    if (comment != null) {
      comment.text = "";
      comment.flags.deleted = true;
      return this.save();
    }
  }

};

Comment = class Comment {
  constructor(comments, user1, data) {
    this.comments = comments;
    this.user = user1;
    this.text = data.text;
    this.flags = data.flags;
    this.time = data.time;
  }

  edit(text1) {
    this.text = text1;
    return this.comments.save();
  }

  remove() {
    return this.comments.remove(this);
  }

};

module.exports = this.Comments;
