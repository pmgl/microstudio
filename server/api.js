this.API = (function() {
  function API(server, webapp) {
    this.server = server;
    this.webapp = webapp;
    this.app = this.webapp.app;
    this.app.get(/^\/api\/status\/?$/, (function(_this) {
      return function(req, res) {
        var i, id, j, len, len1, list, p, post, posts, projects, response;
        if (_this.webapp.ensureDevArea(req, res)) {
          return;
        }
        res.setHeader("Content-Type", "application/json");
        list = _this.server.content.new_projects.slice(0, 4);
        projects = [];
        for (i = 0, len = list.length; i < len; i++) {
          p = list[i];
          projects.push({
            id: p.id,
            title: p.title,
            slug: p.slug,
            owner: p.owner.nick,
            url: "https://microstudio.dev/i/" + p.owner.nick + "/" + p.slug + "/",
            date: p.first_published
          });
        }
        posts = _this.server.content.forum.posts;
        list = [];
        for (id in posts) {
          post = posts[id];
          if (!post.deleted && post.date > Date.now() - 60 * 60 * 1000 * 24) {
            list.push(post);
          }
        }
        list.sort(function(a, b) {
          return b.date - a.date;
        });
        list = list.slice(0, 5);
        posts = [];
        for (j = 0, len1 = list.length; j < len1; j++) {
          p = list[j];
          if (p.category.language === "en") {
            posts.push({
              id: p.id,
              url: "https://microstudio.dev/community/" + p.category.slug + "/" + p.slug + "/" + p.id + "/",
              language: p.category.language,
              title: p.title,
              author: p.author.nick,
              date: p.date,
              category: p.category.slug
            });
          }
        }
        response = {
          status: "running",
          status_at: Date.now(),
          started_at: _this.server.date_started,
          active_builders: _this.server.build_manager.getActiveBuildersData(),
          new_public_projects: projects,
          recent_community_posts: posts
        };
        return res.send(JSON.stringify(response, null, 2));
      };
    })(this));
  }

  return API;

})();

module.exports = this.API;
