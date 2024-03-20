var pug;

pug = require("pug");

this.ForumApp = (function() {
  function ForumApp(server, webapp) {
    this.server = server;
    this.webapp = webapp;
    this.app = this.webapp.app;
    this.forum = this.server.content.forum;
    this.getHue = function(nick) {
      var hue, i, j, ref;
      hue = 0;
      for (i = j = 0, ref = nick.length - 1; j <= ref; i = j += 1) {
        hue += nick.charCodeAt(i) * 5;
      }
      return hue % 360;
    };
    this.app.get(/^\/(..\/)?community\/?$/, (function(_this) {
      return function(req, res) {
        var c, cats, description, j, k, l, lang, len, len1, len2, len3, list, m, n, p, posts, ps, ref;
        if (_this.webapp.ensureDevArea(req, res)) {
          return;
        }
        lang = "en";
        ref = _this.webapp.languages;
        for (j = 0, len = ref.length; j < len; j++) {
          l = ref[j];
          if (req.path.startsWith("/" + l + "/")) {
            lang = l;
          }
        }
        list = _this.forum.listCategories(lang);
        cats = [];
        cats.push({
          name: _this.server.content.translator.get(lang, "All"),
          slug: "all",
          hue: 220,
          path: (lang !== "en" ? "/" + lang : "") + "/community/"
        });
        for (k = 0, len1 = list.length; k < len1; k++) {
          c = list[k];
          cats.push(c);
        }
        posts = [];
        for (m = 0, len2 = list.length; m < len2; m++) {
          c = list[m];
          ps = c.getSortedPosts();
          for (n = 0, len3 = ps.length; n < len3; n++) {
            p = ps[n];
            if (!p.isDeleted()) {
              posts.push(p);
            }
          }
        }
        posts.sort(function(a, b) {
          return b.activity - a.activity;
        });
        description = (_this.server.content.translator.get(lang, "Welcome!")) + "\n" + (_this.server.content.translator.get(lang, "In this space you can ask for help, share your best tips, read articles, submit bugs or feature requests, follow the roadmap and progress of microStudio.")) + "\n" + (_this.server.content.translator.get(lang, "You can discuss programming, game development, art, sound, music, useful tools and resources, microStudio and other game engines.")) + "\n" + (_this.server.content.translator.get(lang, "For anything else there is an Off Topic category."));
        return _this.categoryPage(req, res, lang, cats, "all", _this.server.content.translator.get(lang, "Community"), description, posts);
      };
    })(this));
    this.app.get(/^\/(..\/)?community\/([^\/\|\?\&\.]+)\/?$/, (function(_this) {
      return function(req, res) {
        var c, category, cats, description, j, k, l, lang, len, len1, len2, list, m, p, path, posts, ref;
        if (_this.webapp.ensureDevArea(req, res)) {
          return;
        }
        lang = "en";
        ref = _this.webapp.languages;
        for (j = 0, len = ref.length; j < len; j++) {
          l = ref[j];
          if (req.path.startsWith("/" + l + "/")) {
            lang = l;
          }
        }
        path = req.path.split("/");
        path.splice(0, 1);
        if (path[0] !== "community") {
          path.splice(0, 1);
        }
        category = path[1];
        category = _this.forum.category_by_slug[category];
        if (category) {
          list = _this.forum.listCategories(lang);
          cats = [];
          cats.push(category);
          cats.push({
            name: _this.server.content.translator.get(lang, "All"),
            slug: "all",
            hue: 220,
            path: (lang !== "en" ? "/" + lang : "") + "/community/"
          });
          for (k = 0, len1 = list.length; k < len1; k++) {
            c = list[k];
            if (c !== category) {
              cats.push(c);
            }
          }
          list = category.getSortedPosts();
          posts = [];
          for (m = 0, len2 = list.length; m < len2; m++) {
            p = list[m];
            if (!p.isDeleted()) {
              posts.push(p);
            }
          }
          description = category.description;
          return _this.categoryPage(req, res, lang, cats, category.slug, category.name, description, posts, category.permissions);
        } else {
          return _this.webapp.return404(req, res);
        }
      };
    })(this));
    this.app.get(/^\/(..\/)?community\/([^\/\|\?\&\.]+)\/([^\/\|\?\&\.]+)\/\d+(\/\d+)?\/?$/, (function(_this) {
      return function(req, res) {
        var c, cat, category, cats, id, j, k, l, lang, len, len1, list, path, post, ref, scroll, slug, theme;
        if (_this.webapp.ensureDevArea(req, res)) {
          return;
        }
        lang = "en";
        ref = _this.webapp.languages;
        for (j = 0, len = ref.length; j < len; j++) {
          l = ref[j];
          if (req.path.startsWith("/" + l + "/")) {
            lang = l;
          }
        }
        path = req.path.split("/");
        path.splice(0, 1);
        if (path[0] !== "community") {
          path.splice(0, 1);
        }
        category = path[1];
        slug = path[2];
        id = path[3];
        scroll = path[4];
        post = _this.forum.posts[id];
        if ((post != null) && !post.isDeleted() && !post.author.flags.censored && !post.author.flags.banned) {
          cat = post.category;
          list = _this.forum.listCategories(lang);
          cats = [];
          cats.push(cat);
          cats.push({
            name: _this.server.content.translator.get(lang, "All"),
            slug: "all",
            hue: 220,
            path: (lang !== "en" ? "/" + lang : "") + "/community/"
          });
          for (k = 0, len1 = list.length; k < len1; k++) {
            c = list[k];
            if (c !== cat) {
              cats.push(c);
            }
          }
          if ((_this.post == null) || !_this.server.use_cache) {
            _this.post = pug.compileFile("../templates/forum/post.pug");
          }
          theme = req.cookies.theme || "light";
          res.send(_this.post({
            translator: _this.server.content.translator.getTranslator(lang),
            language: lang,
            categories: cats,
            selected: category,
            post: post,
            scroll: scroll,
            getHue: _this.getHue,
            theme: theme,
            translation: _this.server.content.translator.languages[lang] != null ? _this.server.content.translator.languages[lang]["export"]() : "{}",
            post_info: {
              id: post.id,
              slug: post.slug,
              category: category,
              permissions: post.category.permissions,
              post_permissions: post.permissions,
              url: req.protocol + "://" + req.hostname + "/" + (lang === "en" ? "" : lang + "/") + "community/" + category + "/" + slug + "/" + id + "/"
            },
            community: {
              language: lang,
              category: category
            }
          }));
          return post.view(req.connection.remoteAddress);
        } else {
          return _this.webapp.return404(req, res);
        }
      };
    })(this));
  }

  ForumApp.prototype.categoryPage = function(req, res, lang, cats, selected, name, description, posts, permissions) {
    var langpath, theme;
    if ((this.category == null) || !this.server.use_cache) {
      this.category = pug.compileFile("../templates/forum/forum.pug");
    }
    langpath = lang === "en" ? "" : "/" + lang;
    theme = req.cookies.theme || "light";
    return res.send(this.category({
      translator: this.server.content.translator.getTranslator(lang),
      language: lang,
      langpath: langpath,
      categories: cats,
      posts: posts,
      selected: selected,
      name: name,
      theme: theme,
      description: description,
      translation: this.server.content.translator.languages[lang] != null ? this.server.content.translator.languages[lang]["export"]() : "{}",
      community: {
        language: lang,
        category: selected,
        languages: this.forum.getLanguages(),
        permissions: permissions
      },
      getHue: this.getHue
    }));
  };

  return ForumApp;

})();

module.exports = this.ForumApp;
