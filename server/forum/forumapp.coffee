pug = require "pug"

class @ForumApp
  constructor:(@server,@webapp)->
    @app = @webapp.app

    @forum = @server.content.forum

    @getHue = (nick)->
      hue = 0
      for i in [0..nick.length-1] by 1
        hue += nick.charCodeAt(i)*5

      hue%360

    # main forum page
    @app.get /^\/(..\/)?community\/?$/, (req,res)=>
      return if @webapp.ensureDevArea(req,res)
      return @webapp.return429(req,res) if not @server.rate_limiter.accept("page_load_ip",req.ip)

      lang = "en"
      for l in @webapp.languages
        if req.path.startsWith("/#{l}/")
          lang = l

      list = @forum.listCategories(lang)

      cats = []
      cats.push
        name: @server.content.translator.get lang,"All"
        slug: "all"
        hue: 220
        path: "#{if lang != "en" then "/#{lang}" else ""}/community/"

      for c in list
        cats.push c

      posts = []
      for c in list
        ps = c.getSortedPosts()
        for p in ps
          if not p.isDeleted()
            posts.push p

      posts.sort (a,b)->b.activity-a.activity

      description = """
      #{@server.content.translator.get lang,"Welcome!"}
      #{@server.content.translator.get lang,"In this space you can ask for help, share your best tips, read articles, submit bugs or feature requests, follow the roadmap and progress of microStudio."}
      #{@server.content.translator.get lang,"You can discuss programming, game development, art, sound, music, useful tools and resources, microStudio and other game engines."}
      #{@server.content.translator.get lang,"For anything else there is an Off Topic category."}
      """

      @categoryPage(req,res,lang,cats,"all",@server.content.translator.get(lang,"Community"),description,posts)

    # forum category
    @app.get /^\/(..\/)?community\/([^\/\|\?\&\.]+)\/?$/, (req,res)=>
      return if @webapp.ensureDevArea(req,res)
      return @webapp.return429(req,res) if not @server.rate_limiter.accept("page_load_ip",req.ip)

      lang = "en"
      for l in @webapp.languages
        if req.path.startsWith("/#{l}/")
          lang = l

      path = req.path.split("/")
      path.splice 0,1
      if path[0] != "community"
        path.splice 0,1

      category = path[1]
      category = @forum.category_by_slug[category]
      if category
        list = @forum.listCategories(lang)

        cats = []
        cats.push category

        cats.push
          name: @server.content.translator.get lang,"All"
          slug: "all"
          hue: 220
          path: "#{if lang != "en" then "/#{lang}" else ""}/community/"

        for c in list
          if c != category
            cats.push c

        list = category.getSortedPosts()
        posts = []
        for p in list
          if not p.isDeleted()
            posts.push p

        description = category.description

        @categoryPage(req,res,lang,cats,category.slug,category.name,description,posts,category.permissions)
      else
        @webapp.return404(req,res)

    # forum post
    @app.get /^\/(..\/)?community\/([^\/\|\?\&\.]+)\/([^\/\|\?\&\.]+)\/\d+(\/\d+)?\/?$/, (req,res)=>
      return if @webapp.ensureDevArea(req,res)
      return @webapp.return429(req,res) if not @server.rate_limiter.accept("page_load_ip",req.ip)

      lang = "en"
      for l in @webapp.languages
        if req.path.startsWith("/#{l}/")
          lang = l

      path = req.path.split("/")
      path.splice 0,1
      if path[0] != "community"
        path.splice 0,1

      category = path[1]
      slug = path[2]
      id = path[3]
      scroll = path[4]
      post = @forum.posts[id]
      if post? and not post.isDeleted() and not post.author.flags.censored and not post.author.flags.banned
        cat = post.category
        list = @forum.listCategories(lang)

        cats = []
        cats.push cat

        cats.push
          name: @server.content.translator.get lang,"All"
          slug: "all"
          hue: 220
          path: "#{if lang != "en" then "/#{lang}" else ""}/community/"

        for c in list
          if c != cat
            cats.push c

        if not @post? or not @server.use_cache
          @post = pug.compileFile "../templates/forum/post.pug"

        theme = req.cookies.theme or "light"

        res.send @post(
          translator: @server.content.translator.getTranslator(lang)
          language: lang
          categories: cats
          selected: category
          post: post
          scroll: scroll
          getHue: @getHue
          theme: theme
          translation: if @server.content.translator.languages[lang]? then @server.content.translator.languages[lang].export() else "{}"
          post_info:
            id: post.id
            slug: post.slug
            category: category
            permissions: post.category.permissions
            post_permissions: post.permissions
            url: "#{req.protocol}://#{req.hostname}/#{if lang == "en" then "" else "#{lang}/"}community/#{category}/#{slug}/#{id}/"
          community:
            language: lang
            category: category
        )

        post.view(req.ip)
      else
        @webapp.return404(req,res)


  categoryPage:(req,res,lang,cats,selected,name,description,posts,permissions)->
    if not @category? or not @server.use_cache
      @category = pug.compileFile "../templates/forum/forum.pug"

    langpath = if lang == "en" then "" else "/#{lang}"

    theme = req.cookies.theme or "light"

    res.send @category(
      translator: @server.content.translator.getTranslator(lang)
      language: lang
      langpath: langpath
      categories: cats
      posts: posts
      selected: selected
      name: name
      theme: theme
      description: description
      translation: if @server.content.translator.languages[lang]? then @server.content.translator.languages[lang].export() else "{}"
      community:
        language: lang
        category: selected
        languages: @forum.getLanguages()
        permissions: permissions

      getHue: @getHue
    )


module.exports = @ForumApp
