this.ForumSession = class ForumSession {
  constructor(session) {
    this.session = session;
    this.session.register("create_forum_category", (msg) => {
      return this.createForumCategory(msg);
    });
    this.session.register("edit_forum_category", (msg) => {
      return this.editForumCategory(msg);
    });
    this.session.register("create_forum_post", (msg) => {
      return this.createForumPost(msg);
    });
    this.session.register("edit_forum_post", (msg) => {
      return this.editForumPost(msg);
    });
    this.session.register("create_forum_reply", (msg) => {
      return this.createForumReply(msg);
    });
    this.session.register("edit_forum_reply", (msg) => {
      return this.editForumReply(msg);
    });
    this.session.register("get_raw_post", (msg) => {
      return this.getRawPost(msg);
    });
    this.session.register("get_raw_reply", (msg) => {
      return this.getRawReply(msg);
    });
    this.session.register("get_my_likes", (msg) => {
      return this.getMyLikes(msg);
    });
    this.session.register("set_post_like", (msg) => {
      return this.setPostLike(msg);
    });
    this.session.register("set_reply_like", (msg) => {
      return this.setReplyLike(msg);
    });
    this.session.register("search_forum", (msg) => {
      return this.searchForum(msg);
    });
    this.session.register("set_category_watch", (msg) => {
      return this.setCategoryWatch(msg);
    });
    this.session.register("get_category_watch", (msg) => {
      return this.getCategoryWatch(msg);
    });
    this.session.register("set_post_watch", (msg) => {
      return this.setPostWatch(msg);
    });
    this.session.register("get_post_watch", (msg) => {
      return this.getPostWatch(msg);
    });
    this.forum = this.session.server.content.forum;
    this.server = this.session.server;
    this.MAX_TEXT_LENGTH = 20000;
    this.MAX_TITLE_LENGTH = 400;
  }

  createForumCategory(data) {
    var cat;
    if (this.session.user == null) {
      return;
    }
    if (!this.session.user.flags.admin) {
      return;
    }
    if (!data.language) {
      return;
    }
    if (!data.title) {
      return;
    }
    if (!data.slug) {
      return;
    }
    if (!data.description) {
      return;
    }
    cat = this.forum.createCategory(data.language, data.title, data.slug, data.description, data.hue, data.permissions);
    return this.session.send({
      name: "create_forum_category",
      request_id: data.request_id,
      id: cat.id
    });
  }

  editForumCategory(data) {
    var category;
    if (this.session.user == null) {
      return;
    }
    if (!this.session.user.flags.admin) {
      return;
    }
    if (data.category == null) {
      return;
    }
    category = this.forum.category_by_slug[data.category];
    if (category != null) {
      if (data.deleted != null) {
        category.set("deleted", data.deleted);
      }
      if (data.hidden != null) {
        category.set("hidden", data.hidden);
      }
      if (data.description != null) {
        category.set("description", data.description);
      }
      if (data.title != null) {
        category.set("name", data.title);
      }
      if (data.hue != null) {
        category.set("hue", data.hue);
      }
      if (data.permissions != null) {
        category.set("permissions", data.permissions);
      }
      return this.session.send({
        name: "edit_forum_category",
        request_id: data.request_id
      });
    }
  }

  createForumPost(data) {
    var category, post;
    if (this.session.user == null) {
      return;
    }
    if (data.category == null) {
      return;
    }
    if (data.title == null) {
      return;
    }
    if (data.text == null) {
      return;
    }
    if (data.title.trim().length === 0) {
      return;
    }
    if (data.text.trim().length === 0) {
      return;
    }
    if ((this.session.user != null) && this.session.user.flags.validated && !this.session.user.flags.banned && !this.session.user.flags.censored) {
      if (!this.server.rate_limiter.accept("create_forum_post", this.session.user.id)) {
        return;
      }
      if (this.session.user.progress.stats.level < 10) {
        return;
      }
      category = this.forum.category_by_slug[data.category];
      if (category) {
        if (category.permissions.post !== "user") {
          if (!this.session.user.flags.admin) {
            return;
          }
        }
        post = this.forum.createPost(category.id, this.session.user.id, data.title, data.text);
        this.session.send({
          name: "create_forum_post",
          request_id: data.request_id,
          id: post.id
        });
        return this.session.user.progress.unlockAchievement("community/forum_post");
      }
    }
  }

  editForumPost(data) {
    var cat1, cat2, post;
    if (this.session.user == null) {
      return;
    }
    if (!this.session.user.flags.validated) {
      return;
    }
    if (data.post == null) {
      return;
    }
    post = this.forum.posts[data.post];
    if (post != null) {
      if (this.session.user !== post.author && !this.session.user.flags.admin) {
        return;
      }
      if (data.text != null) {
        post.edit(data.text);
      }
      if (data.title != null) {
        post.setTitle(data.title);
      }
      if ((data.progress != null) && this.session.user.flags.admin) {
        post.set("progress", data.progress);
        post.updateActivity();
      }
      if ((data.status != null) && this.session.user.flags.admin) {
        post.set("status", data.status);
        post.updateActivity();
      }
      if ((data.permissions != null) && this.session.user.flags.admin) {
        post.set("permissions", data.permissions);
      }
      if ((data.reverse != null) && this.session.user.flags.admin) {
        post.set("reverse", data.reverse);
      }
      if (data.deleted != null) {
        post.set("deleted", data.deleted);
      }
      if ((data.category != null) && this.session.user.flags.admin) {
        cat1 = post.category;
        cat2 = this.forum.category_by_slug[data.category];
        if (cat2 != null) {
          post.setCategoryId(cat2.id);
          post.category = cat2;
          cat1.removePost(post);
          cat2.addPost(post);
        }
      }
      return this.session.send({
        name: "edit_forum_post",
        request_id: data.request_id,
        id: post.id
      });
    }
  }

  createForumReply(data) {
    var category, post, reply;
    if (this.session.user == null) {
      return;
    }
    if (data.post == null) {
      return;
    }
    if (data.text == null) {
      return;
    }
    if (data.text.trim().length === 0) {
      return;
    }
    if ((this.session.user != null) && this.session.user.flags.validated && !this.session.user.flags.banned && !this.session.user.flags.censored) {
      if (!this.server.rate_limiter.accept("create_forum_reply", this.session.user.id)) {
        return;
      }
      if (this.session.user.progress.stats.level < 10) {
        return;
      }
      post = this.forum.posts[data.post];
      if (post != null) {
        category = post.category;
        if (category.permissions.reply !== "user") {
          if (!this.session.user.flags.admin) {
            return;
          }
        }
        if (post.permissions.reply !== "user") {
          if (!this.session.user.flags.admin) {
            return;
          }
        }
        reply = this.forum.createReply(post, this.session.user.id, data.text);
        return this.session.send({
          name: "create_forum_reply",
          request_id: data.request_id,
          id: reply.id,
          index: reply.post.replies.length - 1
        });
      }
    }
  }

  editForumReply(data) {
    var reply;
    if (this.session.user == null) {
      return;
    }
    if (!this.session.user.flags.validated) {
      return;
    }
    if (data.reply == null) {
      return;
    }
    reply = this.forum.replies[data.reply];
    if (reply != null) {
      if (reply.author !== this.session.user && !this.session.user.flags.admin) {
        return;
      }
      if (data.text != null) {
        reply.edit(data.text);
      }
      if (data.deleted != null) {
        reply.set("deleted", data.deleted);
      }
      return this.session.send({
        name: "edit_forum_reply",
        request_id: data.request_id
      });
    }
  }

  getRawPost(data) {
    var post;
    if (this.session.user == null) {
      return;
    }
    if (data.post == null) {
      return;
    }
    post = this.forum.posts[data.post];
    if (post != null) {
      if (this.session.user !== post.author && !this.session.user.flags.admin) {
        return;
      }
      return this.session.send({
        name: "get_raw_post",
        request_id: data.request_id,
        text: post.text,
        progress: post.progress,
        status: post.status
      });
    }
  }

  getRawReply(data) {
    var reply;
    if (this.session.user == null) {
      return;
    }
    if (data.reply == null) {
      return;
    }
    reply = this.forum.replies[data.reply];
    if (reply != null) {
      if (reply.author !== this.session.user && !this.session.user.flags.admin) {
        return;
      }
      return this.session.send({
        name: "get_raw_reply",
        request_id: data.request_id,
        text: reply.text
      });
    }
  }

  getMyLikes(data) {
    var cat, category, i, j, k, l, len, len1, len2, len3, list, post, r, ref, ref1, ref2, res;
    if (this.session.user == null) {
      return;
    }
    if (data.post != null) {
      post = this.forum.posts[data.post];
      if (post != null) {
        res = {
          post: post.isLiked(this.session.user.id),
          replies: []
        };
        ref = post.replies;
        for (i = 0, len = ref.length; i < len; i++) {
          r = ref[i];
          if (r.isLiked(this.session.user.id)) {
            res.replies.push(r.id);
          }
        }
        return this.session.send({
          name: "get_my_likes",
          request_id: data.request_id,
          data: res
        });
      }
    } else if (data.category != null) {
      category = this.forum.category_by_slug[data.category];
      if (category != null) {
        res = [];
        ref1 = category.posts;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          post = ref1[j];
          if (post.isLiked(this.session.user.id)) {
            res.push(post.id);
          }
        }
        return this.session.send({
          name: "get_my_likes",
          request_id: data.request_id,
          data: res
        });
      }
    } else if (data.language != null) {
      list = this.forum.listCategories(data.language);
      res = [];
      for (k = 0, len2 = list.length; k < len2; k++) {
        cat = list[k];
        ref2 = cat.posts;
        for (l = 0, len3 = ref2.length; l < len3; l++) {
          post = ref2[l];
          if (post.isLiked(this.session.user.id)) {
            res.push(post.id);
          }
        }
      }
      return this.session.send({
        name: "get_my_likes",
        request_id: data.request_id,
        data: res
      });
    }
  }

  setPostLike(data) {
    var post;
    if (this.session.user == null) {
      return;
    }
    if (data.post != null) {
      post = this.forum.posts[data.post];
      if (post != null) {
        if (data.like) {
          post.addLike(this.session.user.id);
        } else {
          post.removeLike(this.session.user.id);
        }
        return this.session.send({
          name: "set_post_like",
          request_id: data.request_id,
          likes: post.likes.length
        });
      }
    }
  }

  setReplyLike(data) {
    var reply;
    if (this.session.user == null) {
      return;
    }
    if (data.reply != null) {
      reply = this.forum.replies[data.reply];
      if (reply != null) {
        if (data.like) {
          reply.addLike(this.session.user.id);
        } else {
          reply.removeLike(this.session.user.id);
        }
        return this.session.send({
          name: "set_reply_like",
          request_id: data.request_id,
          likes: reply.likes.length
        });
      }
    }
  }

  setCategoryWatch(data) {
    var category;
    if (this.session.user == null) {
      return;
    }
    if (data.category == null) {
      return;
    }
    category = this.forum.category_by_slug[data.category];
    if (category) {
      if (data.watch) {
        category.addWatch(this.session.user.id);
      } else {
        category.removeWatch(this.session.user.id);
      }
      return this.session.send({
        name: "set_category_watch",
        request_id: data.request_id,
        watch: data.watch
      });
    }
  }

  setPostWatch(data) {
    var post;
    if (this.session.user == null) {
      return;
    }
    if (data.post == null) {
      return;
    }
    post = this.forum.posts[data.post];
    if (post != null) {
      if (data.watch) {
        post.addWatch(this.session.user.id);
      } else {
        post.removeWatch(this.session.user.id);
      }
      return this.session.send({
        name: "set_post_watch",
        request_id: data.request_id,
        watch: data.watch
      });
    }
  }

  getCategoryWatch(data) {
    var category;
    if (this.session.user == null) {
      return;
    }
    if (data.category == null) {
      return;
    }
    category = this.forum.category_by_slug[data.category];
    if (category) {
      return this.session.send({
        name: "get_category_watch",
        request_id: data.request_id,
        watch: category.isWatching(this.session.user.id)
      });
    }
  }

  getPostWatch(data) {
    var post;
    if (this.session.user == null) {
      return;
    }
    if (data.post == null) {
      return;
    }
    post = this.forum.posts[data.post];
    if (post != null) {
      return this.session.send({
        name: "get_post_watch",
        request_id: data.request_id,
        watch: post.isWatching(this.session.user.id)
      });
    }
  }

  searchForum(data) {
    var i, index, len, list, post, r, res;
    if (data.language == null) {
      return;
    }
    if (data.string == null) {
      return;
    }
    if (!this.server.rate_limiter.accept("search_forum", this.session.socket.remoteAddress)) {
      return;
    }
    index = this.forum.indexers[data.language];
    if (index != null) {
      res = index.search(data.string);
      list = [];
      for (i = 0, len = res.length; i < len; i++) {
        r = res[i];
        post = r.target.post != null ? r.target.post : r.target;
        list.push({
          title: post.title,
          score: r.score,
          id: post.id,
          slug: post.slug
        });
      }
      return this.session.send({
        name: "search_forum",
        request_id: data.request_id,
        results: list
      });
    }
  }

};

module.exports = this.ForumSession;
