var ForumCategory, ForumPost, ForumReply, Indexer;

ForumCategory = require(__dirname + "/category.js");

ForumPost = require(__dirname + "/post.js");

ForumReply = require(__dirname + "/reply.js");

Indexer = require(__dirname + "/indexer.js");

this.Forum = class Forum {
  constructor(content) {
    this.content = content;
    this.db = this.content.db;
    this.server = this.content.server;
    this.languages = {};
    this.categories = {};
    this.posts = {};
    this.replies = {};
    this.category_by_slug = {};
    this.category_count = 0;
    this.post_count = 0;
    this.reply_count = 0;
    this.indexers = {};
    this.load();
  }

  close() {
    var i, indexer, key, len, ref;
    ref = this.indexers;
    for (indexer = i = 0, len = ref.length; i < len; indexer = ++i) {
      key = ref[indexer];
      indexer.stop();
    }
  }

  load() {
    var categories, i, j, k, len, len1, len2, posts, record, replies;
    categories = this.db.list("forum_categories");
    for (i = 0, len = categories.length; i < len; i++) {
      record = categories[i];
      this.loadCategory(record);
    }
    posts = this.db.list("forum_posts");
    for (j = 0, len1 = posts.length; j < len1; j++) {
      record = posts[j];
      this.loadPost(record);
    }
    replies = this.db.list("forum_replies");
    for (k = 0, len2 = replies.length; k < len2; k++) {
      record = replies[k];
      this.loadReply(record);
    }
    this.updateActivity();
  }

  index(language, text, target, uid) {
    var indexer;
    if (language == null) {
      return;
    }
    indexer = this.indexers[language];
    if (indexer == null) {
      this.indexers[language] = indexer = new Indexer();
    }
    return indexer.add(text, target, uid);
  }

  loadCategory(record) {
    var cat;
    cat = new ForumCategory(this, record);
    if ((cat.language != null) && !cat.deleted) {
      if (this.languages[cat.language] == null) {
        this.languages[cat.language] = [];
      }
      this.languages[cat.language].push(cat);
      this.category_by_slug[cat.slug] = cat;
      this.categories[cat.id] = cat;
      this.category_count++;
    }
    return cat;
  }

  loadPost(record) {
    var category, catid, post;
    catid = record.getField("category");
    category = this.categories[catid];
    if (category != null) {
      post = new ForumPost(category, record);
      if (!post.isDeleted()) {
        category.addPost(post);
        this.posts[post.id] = post;
        if (!category.hidden) {
          this.post_count++;
          this.index(post.category.language, `${post.title} ${post.category.name} ${post.author.nick}`, post, post.id);
          this.index(post.category.language, post.text, post, post.id);
        }
      }
      return post;
    }
  }

  loadReply(record) {
    var post, postid, reply;
    postid = record.getField("post");
    post = this.posts[postid];
    if (post != null) {
      reply = new ForumReply(post, record);
      if (!reply.isDeleted()) {
        post.addReply(reply);
        this.replies[reply.id] = reply;
        if (!post.category.hidden) {
          this.reply_count++;
          this.index(reply.post.category.language, reply.text, reply.post, post.id);
        }
        return reply;
      }
    }
  }

  createPost(category, user, title, text) {
    var data, err, i, id, len, post, record, ref;
    data = {
      author: user,
      category: category,
      title: title,
      text: text,
      date: Date.now(),
      activity: Date.now(),
      edits: 0
    };
    record = this.db.create("forum_posts", data);
    post = this.loadPost(record);
    if (post != null) {
      post.category.updateActivity();
      post.addWatch(post.author.id);
      try {
        ref = post.category.watch;
        for (i = 0, len = ref.length; i < len; i++) {
          id = ref[i];
          this.sendPostNotification(id, post);
        }
      } catch (error) {
        err = error;
        console.error(err);
      }
    }
    return post;
  }

  createReply(post, user, text) {
    var data, i, id, len, record, ref, reply;
    data = {
      post: post.id,
      author: user,
      text: text,
      date: Date.now(),
      activity: Date.now(),
      edits: 0
    };
    post.updateActivity();
    record = this.db.create("forum_replies", data);
    reply = this.loadReply(record);
    ref = post.watch;
    for (i = 0, len = ref.length; i < len; i++) {
      id = ref[i];
      this.sendReplyNotification(id, reply);
    }
    return reply;
  }

  sendPostNotification(userid, post) {
    var subject, text, translator, user;
    user = this.content.users[userid];
    if (user == null) {
      return;
    }
    if (user.email == null) {
      return;
    }
    if (!user.flags.validated) {
      return;
    }
    if (user === post.author) {
      return;
    }
    translator = this.content.translator.getTranslator(user.language);
    subject = translator.get("%USER% posted in %CATEGORY%").replace("%USER%", post.author.nick).replace("%CATEGORY%", post.category.name) + ` - ${translator.get("microStudio Community")}`;
    text = translator.get("%USER% published a new post in %CATEGORY%:").replace("%USER%", post.author.nick).replace("%CATEGORY%", post.category.name) + "\n\n";
    text += post.title + "\n";
    text += `https://microstudio.dev${post.getPath()}\n\n`;
    text += post.text.length < 500 ? post.text : post.text.substring(0, 500) + " (...)";
    return this.server.mailer.sendMail(user.email, subject, text);
  }

  sendReplyNotification(userid, reply) {
    var subject, text, translator, user;
    user = this.content.users[userid];
    if (user == null) {
      return;
    }
    if (user.email == null) {
      return;
    }
    if (!user.flags.validated) {
      return;
    }
    if (user === reply.author) {
      return;
    }
    translator = this.content.translator.getTranslator(user.language);
    subject = translator.get("%USER% posted a reply").replace("%USER%", reply.author.nick) + ` - ${translator.get("microStudio Community")}`;
    text = translator.get("%USER% posted a reply to %POST%:").replace("%USER%", reply.author.nick).replace("%POST%", reply.post.title) + "\n\n";
    text += `https://microstudio.dev${reply.post.getPath()}${reply.post.replies.length - 1}/\n\n`;
    text += reply.text.length < 500 ? reply.text : reply.text.substring(0, 500) + " (...)";
    return this.server.mailer.sendMail(user.email, subject, text);
  }

  createCategory(language, name, slug, description, hue, permissions) {
    var cat, data, record;
    data = {
      language: language,
      name: name,
      slug: slug,
      description: description,
      hue: hue || 0,
      permissions: permissions,
      deleted: false,
      activity: Date.now()
    };
    record = this.db.create("forum_categories", data);
    return cat = this.loadCategory(record);
  }

  editCategory(user, category, data) {}

  editPost(user, post, data) {}

  editReply(user, post, reply, data) {}

  listCategories(lang) {
    var c, cats, i, len, res;
    cats = this.languages[lang];
    if (cats != null) {
      res = [];
      for (i = 0, len = cats.length; i < len; i++) {
        c = cats[i];
        if (!c.deleted && !c.hidden) {
          res.push(c);
        }
      }
      res.sort(function(a, b) {
        return b.activity - a.activity;
      });
      return res;
    } else {
      return [];
    }
  }

  updateActivity() {
    var cat, key, ref;
    this.activity = 0;
    ref = this.categories;
    for (key in ref) {
      cat = ref[key];
      this.activity = Math.max(this.activity, cat.activity);
    }
    return this.sorted = false;
  }

  getLanguages() {
    var key, lang;
    lang = [];
    for (key in this.languages) {
      lang.push(key);
    }
    return lang;
  }

  getCategory(language, slug) {
    var lang;
    lang = this.languages[language];
    if (!lang) {
      return null;
    }
    return lang[slug];
  }

  escapeHTML(s) {
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

};

module.exports = this.Forum;
