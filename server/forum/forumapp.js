var pug;

pug = require("pug");

this.ForumApp = class ForumApp {
  constructor(server, webapp) {
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
    // main forum page
    this.app.get(/^\/(..\/)?community\/?$/, (req, res) => {
      var c, cats, description, j, k, l, lang, len, len1, len2, len3, list, m, n, p, posts, ps, ref;
      if (this.webapp.ensureDevArea(req, res)) {
        return;
      }
      if (!this.server.rate_limiter.accept("page_load_ip", req.connection.remoteAddress)) {
        return this.webapp.return429(req, res);
      }
      lang = "en";
      ref = this.webapp.languages;
      for (j = 0, len = ref.length; j < len; j++) {
        l = ref[j];
        if (req.path.startsWith(`/${l}/`)) {
          lang = l;
        }
      }
      list = this.forum.listCategories(lang);
      cats = [];
      cats.push({
        name: this.server.content.translator.get(lang, "All"),
        slug: "all",
        hue: 220,
        path: `${(lang !== "en" ? `/${lang}` : "")}/community/`
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
      description = `${this.server.content.translator.get(lang, "Welcome!")}\n${this.server.content.translator.get(lang, "In this space you can ask for help, share your best tips, read articles, submit bugs or feature requests, follow the roadmap and progress of microStudio.")}\n${this.server.content.translator.get(lang, "You can discuss programming, game development, art, sound, music, useful tools and resources, microStudio and other game engines.")}\n${this.server.content.translator.get(lang, "For anything else there is an Off Topic category.")}`;
      return this.categoryPage(req, res, lang, cats, "all", this.server.content.translator.get(lang, "Community"), description, posts);
    });
    // forum category
    this.app.get(/^\/(..\/)?community\/([^\/\|\?\&\.]+)\/?$/, (req, res) => {
      var c, category, cats, description, j, k, l, lang, len, len1, len2, list, m, p, path, posts, ref;
      if (this.webapp.ensureDevArea(req, res)) {
        return;
      }
      if (!this.server.rate_limiter.accept("page_load_ip", req.connection.remoteAddress)) {
        return this.webapp.return429(req, res);
      }
      lang = "en";
      ref = this.webapp.languages;
      for (j = 0, len = ref.length; j < len; j++) {
        l = ref[j];
        if (req.path.startsWith(`/${l}/`)) {
          lang = l;
        }
      }
      path = req.path.split("/");
      path.splice(0, 1);
      if (path[0] !== "community") {
        path.splice(0, 1);
      }
      category = path[1];
      category = this.forum.category_by_slug[category];
      if (category) {
        list = this.forum.listCategories(lang);
        cats = [];
        cats.push(category);
        cats.push({
          name: this.server.content.translator.get(lang, "All"),
          slug: "all",
          hue: 220,
          path: `${(lang !== "en" ? `/${lang}` : "")}/community/`
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
        return this.categoryPage(req, res, lang, cats, category.slug, category.name, description, posts, category.permissions);
      } else {
        return this.webapp.return404(req, res);
      }
    });
    // forum post
    this.app.get(/^\/(..\/)?community\/([^\/\|\?\&\.]+)\/([^\/\|\?\&\.]+)\/\d+(\/\d+)?\/?$/, (req, res) => {
      var c, cat, category, cats, id, j, k, l, lang, len, len1, list, path, post, ref, scroll, slug, theme;
      if (this.webapp.ensureDevArea(req, res)) {
        return;
      }
      if (!this.server.rate_limiter.accept("page_load_ip", req.connection.remoteAddress)) {
        return this.webapp.return429(req, res);
      }
      lang = "en";
      ref = this.webapp.languages;
      for (j = 0, len = ref.length; j < len; j++) {
        l = ref[j];
        if (req.path.startsWith(`/${l}/`)) {
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
      post = this.forum.posts[id];
      if ((post != null) && !post.isDeleted() && !post.author.flags.censored && !post.author.flags.banned) {
        cat = post.category;
        list = this.forum.listCategories(lang);
        cats = [];
        cats.push(cat);
        cats.push({
          name: this.server.content.translator.get(lang, "All"),
          slug: "all",
          hue: 220,
          path: `${(lang !== "en" ? `/${lang}` : "")}/community/`
        });
        for (k = 0, len1 = list.length; k < len1; k++) {
          c = list[k];
          if (c !== cat) {
            cats.push(c);
          }
        }
        if ((this.post == null) || !this.server.use_cache) {
          this.post = pug.compileFile("../templates/forum/post.pug");
        }
        theme = req.cookies.theme || "light";
        res.send(this.post({
          translator: this.server.content.translator.getTranslator(lang),
          language: lang,
          categories: cats,
          selected: category,
          post: post,
          scroll: scroll,
          getHue: this.getHue,
          theme: theme,
          translation: this.server.content.translator.languages[lang] != null ? this.server.content.translator.languages[lang].export() : "{}",
          post_info: {
            id: post.id,
            slug: post.slug,
            category: category,
            permissions: post.category.permissions,
            post_permissions: post.permissions,
            url: `${req.protocol}://${req.hostname}/${(lang === "en" ? "" : `${lang}/`)}community/${category}/${slug}/${id}/`
          },
          community: {
            language: lang,
            category: category
          }
        }));
        return post.view(req.connection.remoteAddress);
      } else {
        return this.webapp.return404(req, res);
      }
    });
  }

  categoryPage(req, res, lang, cats, selected, name, description, posts, permissions) {
    var langpath, theme;
    if ((this.category == null) || !this.server.use_cache) {
      this.category = pug.compileFile("../templates/forum/forum.pug");
    }
    langpath = lang === "en" ? "" : `/${lang}`;
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
      translation: this.server.content.translator.languages[lang] != null ? this.server.content.translator.languages[lang].export() : "{}",
      community: {
        language: lang,
        category: selected,
        languages: this.forum.getLanguages(),
        permissions: permissions
      },
      getHue: this.getHue
    }));
  }

};

module.exports = this.ForumApp;
