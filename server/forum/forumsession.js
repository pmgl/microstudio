this.ForumSession = (function() {
  function ForumSession(session) {
    this.session = session;
    this.session.register("create_forum_category", (function(_this) {
      return function(msg) {
        return _this.createForumCategory(msg);
      };
    })(this));
    this.session.register("edit_forum_category", (function(_this) {
      return function(msg) {
        return _this.editForumCategory(msg);
      };
    })(this));
    this.session.register("create_forum_post", (function(_this) {
      return function(msg) {
        return _this.createForumPost(msg);
      };
    })(this));
    this.session.register("edit_forum_post", (function(_this) {
      return function(msg) {
        return _this.editForumPost(msg);
      };
    })(this));
    this.session.register("create_forum_reply", (function(_this) {
      return function(msg) {
        return _this.createForumReply(msg);
      };
    })(this));
    this.session.register("edit_forum_reply", (function(_this) {
      return function(msg) {
        return _this.editForumReply(msg);
      };
    })(this));
    this.session.register("get_raw_post", (function(_this) {
      return function(msg) {
        return _this.getRawPost(msg);
      };
    })(this));
    this.session.register("get_raw_reply", (function(_this) {
      return function(msg) {
        return _this.getRawReply(msg);
      };
    })(this));
    this.session.register("get_my_likes", (function(_this) {
      return function(msg) {
        return _this.getMyLikes(msg);
      };
    })(this));
    this.session.register("set_post_like", (function(_this) {
      return function(msg) {
        return _this.setPostLike(msg);
      };
    })(this));
    this.session.register("set_reply_like", (function(_this) {
      return function(msg) {
        return _this.setReplyLike(msg);
      };
    })(this));
    this.session.register("search_forum", (function(_this) {
      return function(msg) {
        return _this.searchForum(msg);
      };
    })(this));
    this.session.register("set_category_watch", (function(_this) {
      return function(msg) {
        return _this.setCategoryWatch(msg);
      };
    })(this));
    this.session.register("get_category_watch", (function(_this) {
      return function(msg) {
        return _this.getCategoryWatch(msg);
      };
    })(this));
    this.session.register("set_post_watch", (function(_this) {
      return function(msg) {
        return _this.setPostWatch(msg);
      };
    })(this));
    this.session.register("get_post_watch", (function(_this) {
      return function(msg) {
        return _this.getPostWatch(msg);
      };
    })(this));
    this.forum = this.session.server.content.forum;
    this.server = this.session.server;
    this.MAX_TEXT_LENGTH = 20000;
    this.MAX_TITLE_LENGTH = 400;
  }

  ForumSession.prototype.createForumCategory = function(data) {
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
  };

  ForumSession.prototype.editForumCategory = function(data) {
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
  };

  ForumSession.prototype.createForumPost = function(data) {
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
  };

  ForumSession.prototype.editForumPost = function(data) {
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
  };

  ForumSession.prototype.createForumReply = function(data) {
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
  };

  ForumSession.prototype.editForumReply = function(data) {
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
  };

  ForumSession.prototype.getRawPost = function(data) {
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
  };

  ForumSession.prototype.getRawReply = function(data) {
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
  };

  ForumSession.prototype.getMyLikes = function(data) {
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
  };

  ForumSession.prototype.setPostLike = function(data) {
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
  };

  ForumSession.prototype.setReplyLike = function(data) {
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
  };

  ForumSession.prototype.setCategoryWatch = function(data) {
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
  };

  ForumSession.prototype.setPostWatch = function(data) {
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
  };

  ForumSession.prototype.getCategoryWatch = function(data) {
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
  };

  ForumSession.prototype.getPostWatch = function(data) {
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
  };

  ForumSession.prototype.searchForum = function(data) {
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
  };

  return ForumSession;

})();

module.exports = this.ForumSession;
