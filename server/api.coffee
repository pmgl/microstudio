class @API
  constructor:(@server,@webapp)->
    @app = @webapp.app

    @app.get /^\/api\/status\/?$/, (req,res)=>
      return if @webapp.ensureDevArea(req,res)

      res.setHeader("Content-Type", "application/json")

      list = @server.content.new_projects.slice(0,4)
      projects = []
      for p in list
        projects.push
          id: p.id
          title: p.title
          slug: p.slug
          owner: p.owner.nick
          url: "https://microstudio.dev/i/#{p.owner.nick}/#{p.slug}/"
          date: p.first_published

      posts = @server.content.forum.posts
      list = []
      for id,post of posts
        if not post.deleted and post.date > Date.now()-60*60*1000*24
          list.push post

      list.sort (a,b)->b.date-a.date
      list = list.slice(0,5)
      posts = []
      for p in list
        if p.category.language == "en"
          posts.push
            id: p.id
            url: "https://microstudio.dev/community/#{p.category.slug}/#{p.slug}/#{p.id}/"
            language: p.category.language
            title: p.title
            author: p.author.nick
            date: p.date
            category: p.category.slug

      response =
        status: "running"
        status_at: Date.now()
        started_at: @server.date_started
        active_builders: @server.build_manager.getActiveBuildersData()
        new_public_projects: projects
        recent_community_posts: posts

      res.send JSON.stringify response,null,2

module.exports = @API
