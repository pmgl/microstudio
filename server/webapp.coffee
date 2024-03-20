SHA256 = require("crypto-js/sha256")
pug = require "pug"
fs = require "fs"
ProjectManager = require __dirname+"/session/projectmanager.js"
Jimp = require "jimp"
Concatenator = require __dirname+"/concatenator.js"
Fonts = require __dirname+"/fonts.js"
ExportFeatures = require __dirname+"/app/exportfeatures.js"
ForumApp = require __dirname+"/forum/forumapp.js"
API = require __dirname+"/api.js"

`const { marked } = require("marked")`

sanitizeHTML = require "sanitize-html"
allowedTags = sanitizeHTML.defaults.allowedTags.concat ["img"]


class @WebApp
  constructor:(@server,@app)->
    @code = ""
    fs.readFile "../templates/play/manifest.json",(err,data)=>
      @manifest_template = data

    #@app.get /^\/[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*\/[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/,(req,res)=>
    #  redir = req.protocol+'://' + req.get('host') + req.url+"/"
    #  console.info "redirecting to: "+redir
    #  redir = res.redirect(redir)

    @forum_app = new ForumApp @server,@
    @api = new API @server,@

    @concatenator = new Concatenator @
    @fonts = new Fonts

    @export_features = new ExportFeatures @
    @server.build_manager.createLinks(@app)

    @home_page = {}

    @languages = ["en","fr","pl","de","it","pt","ru","es"]
    home_exp = "^(\\/"
    for i in [1..@languages.length-1] by 1
      home_exp += "|\\/#{@languages[i]}\\/?"
      if i==@languages.length-1
        home_exp += "|"

    @reserved = ["explore","documentation","projects","about","login","user","tutorials\\/examples","tutorials\\/community"]
    @reserved_exact = ["tutorials"]

    for r in @reserved
      home_exp += "\\/#{r}|\\/#{r}\\/.*|"

    for r in @reserved_exact
      home_exp += "\\/#{r}|\\/#{r}\\/|"

    home_exp += "\\/tutorial\\/[^\\/\\|\\?\\&\\.]+\\/[^\\/\\|\\?\\&\\.]+(\\/([^\\/\\|\\?\\&\\.]+\\/?)?)|"

    home_exp += "(\\/i\\/.*))$"


    console.info "home_exp = #{home_exp}"

    @app.get new RegExp(home_exp), (req,res)=>
      return if @ensureDevArea(req,res)

      dev_domain = if @server.config.dev_domain then "'#{@server.config.dev_domain}'" else "location.origin"
      run_domain = if @server.config.run_domain then "'#{@server.config.run_domain}'" else "location.origin.replace('.dev','.io')"

      lang = @getLanguage(req)
      for l in @languages
        if req.path == "/#{l}" or req.path == "/#{l}/"
          lang = l
      #console.info "language=#{lang}"


      if not @home_funk? or not @server.use_cache
        @home_funk = pug.compileFile "../templates/home.pug"

      if @server.content.translator.languages[lang]? and @server.content.translator.languages[lang].updated
        @server.content.translator.languages[lang].updated = false
        delete @home_page[lang]

      s = req.path.split("/")
      if s[1] == "i"
        user = s[2]
        project = s[3]
        user = @server.content.findUserByNick(user)
        if not user?
          @return404(req,res)
          return null

        project = user.findProjectBySlug project
        if not project? or not project.public
          @return404(req,res)
          return null

        translator = @server.content.translator.getTranslator(lang)
        page = @home_funk
          name: project.title
          javascript_files: @concatenator.getHomeJSFiles()
          css_files: @concatenator.getHomeCSSFiles()
          translator: translator
          language: lang
          standalone: @server.config.standalone == true
          languages: @languages
          graphics_options: @concatenator.alt_players
          optional_libs: @concatenator.optional_libs
          language_engines: @concatenator.language_engines
          translation: if @server.content.translator.languages[lang]? then @server.content.translator.languages[lang].export() else "{}"
          title: translator.get("%PROJECT% - by %USER%").replace("%PROJECT%",project.title).replace("%USER%",user.nick)
          description: project.description
          long_description: project.description
          poster: if project.files? and project.files["sprites/poster.png"]? then "https://microstudio.io/#{user.nick}/#{project.slug}/sprites/poster.png" else "https://microstudio.io/#{user.nick}/#{project.slug}/sprites/icon.png"
          project_moderation: @server.config.project_moderation == true
          dev_domain: dev_domain
          run_domain: run_domain
          default_project_language: @server.config.default_project_language
          tutorials_root_url: @server.config.tutorials_root_url

        return res.send page
      else if not @home_page[lang]? or not @server.use_cache
        #console.info "generating home page #{lang}"
        translator = @server.content.translator.getTranslator(lang)
        @home_page[lang] = @home_funk
          name: "microStudio"
          javascript_files: @concatenator.getHomeJSFiles()
          css_files: @concatenator.getHomeCSSFiles()
          translator: translator
          language: lang
          standalone: @server.config.standalone == true
          languages: @languages
          graphics_options: @concatenator.alt_players
          optional_libs: @concatenator.optional_libs
          language_engines: @concatenator.language_engines
          translation: if @server.content.translator.languages[lang]? then @server.content.translator.languages[lang].export() else "{}"
          title: "microStudio - "+translator.get("Game Engine")
          description: translator.get("microStudio is a free, open source game engine, code centric, integrated, available in the cloud or offline.")
          long_description: translator.get("microStudio is a free, open source game engine, easy to learn and packed with features. It offers 4 programming languages and includes a sprite editor and a map editor.")
          poster: "https://microstudio.dev/img/microstudio.jpg"
          project_moderation: @server.config.project_moderation == true
          dev_domain: dev_domain
          run_domain: run_domain
          default_project_language: @server.config.default_project_language
          tutorials_root_url: @server.config.tutorials_root_url

      res.send @home_page[lang]

    for plugin in @server.plugins
      if plugin.addWebHooks?
        plugin.addWebHooks @app

    @app.get /^\/discord\/?$/, (req,res)=>
      res.redirect "https://discord.gg/nEMpBU7"

    # email validation
    @app.get /^\/v\/\d+\/[a-z0-9A-Z]+\/?$/,(req,res,next)=>
      #console.info "matched email validation"
      return if @ensureDevArea(req,res)
      s = req.path.split("/")
      userid = s[2]
      token = s[3]
      #console.info "userid = #{userid}"
      #console.info "token = #{token}"
      user = @server.content.users[userid]
      if user?
        @server.content.validateEMailAddress(user,token)
        redir = req.protocol+'://' + req.get("host")
        #console.info "redirecting to: "+redir
        return res.redirect(redir)
      @return404(req,res)

    # password recovery 1
    @app.get /^\/pw\/\d+\/[a-z0-9A-Z]+\/?$/,(req,res,next)=>
      #console.info "matched email validation"
      return if @ensureDevArea(req,res)
      s = req.path.split("/")
      userid = s[2]
      token = s[3]
      #console.info "userid = #{userid}"
      #console.info "token = #{token}"
      user = @server.content.users[userid]
      if user? and user.getValidationToken() == token
        page = pug.compileFile "../templates/password/reset1.pug"
        return res.send page
          userid: userid
          token: token
        return
      else
        @return404(req,res)

    # password recovery 2
    @app.get /^\/pwd\/\d+\/[a-z0-9A-Z]+\/.*\/?$/,(req,res,next)=>
      #console.info "matched email validation"
      return if @ensureDevArea(req,res)
      s = req.path.split("/")
      userid = s[2]
      token = s[3]
      pass = s[4]
      console.info "userid = #{userid}"
      console.info "token = #{token}"
      user = @server.content.users[userid]
      if user? and user.getValidationToken() == token
        salt = ""
        chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        for i in [0..15] by 1
          salt += chars.charAt(Math.floor(Math.random()*chars.length))
        hash = salt+"|"+SHA256(salt+pass)
        user.set "hash",hash
        user.resetValidationToken()
        translator = @server.content.translator.getTranslator(user.language)
        user.notify translator.get "Your password was successfully changed"
        page = pug.compileFile "../templates/password/reset2.pug"
        return res.send page({})
      else
        @return404(req,res)

    @app.get /^\/lang\/list\/?$/, (req,res)=>
      return if @ensureDevArea(req,res)
      res.setHeader("Content-Type", "application/json")
      res.send JSON.stringify @server.content.translator.list

    @app.get /^\/lang\/[a-z]+\/?$/, (req,res)=>
      return if @ensureDevArea(req,res)
      lang = req.path.split("/")[2]
      lang = @server.content.translator.languages[lang]
      res.setHeader("Content-Type", "application/json")
      if lang?
        res.send lang.export()
      else
        res.send "{}"

    @app.get /^\/box\/?$/, (req,res)=>
      return if @ensureIOArea(req,res)
      #if not @console_funk? or not @server.use_cache
      @console_funk = pug.compileFile "../templates/console/console.pug"

      res.send @console_funk
        gamelist: @server.content.getConsoleGameList()

    # /user/project[/code/]
    @app.get /^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+\/?)?)?$/,(req,res)=>
      if req.query? and req.query.server?
        return if @ensureDevArea(req,res)
        return @serverBox req,res

      return if @ensureIOArea(req,res)
      if req.path.charAt(req.path.length-1) != "/"
        redir = req.protocol+'://' + req.get("host") + req.url+"/"
        console.info "redirecting to: "+redir
        return res.redirect(redir)

      access = @getProjectAccess req,res
      return if not access?

      user = access.user
      project = access.project

      file = "#{user.id}/#{project.id}/ms/main.ms"

      encoding = "text"

      manager = @getProjectManager(project)

      if req.query? and req.query.srv?
        jsfiles = @concatenator.getServerJSFiles()
      else
        jsfiles = @concatenator.getPlayerJSFiles(project.graphics)

      for lib in project.libs
        l = @concatenator.findOptionalLib lib
        if l
          jsfiles.push l.lib

      prog_lang = project.language
      if @concatenator.language_engines[prog_lang]?
        jsfiles = jsfiles.concat @concatenator.language_engines[prog_lang].scripts
        jsfiles = jsfiles.concat @concatenator.language_engines[prog_lang].lib

      pathcode = if project.public then project.slug else "#{project.slug}/#{project.code}"
      poster = if project.files? and project.files["sprites/poster.png"]?
        "https://microstudio.io/#{user.nick}/#{pathcode}/sprites/poster.png"
      else
        "https://microstudio.io/#{user.nick}/#{pathcode}/icon512.png"

      if @server.config.player_extra_js?
        jsfiles = jsfiles.concat @server.config.player_extra_js

      manager.listFiles "ms",(sources)=>
        manager.listFiles "sprites",(sprites)=>
          manager.listFiles "maps",(maps)=>
            manager.listFiles "sounds",(sounds)=>
              manager.listFiles "music",(music)=>
                manager.listFiles "assets",(assets)=>
                  resources = JSON.stringify
                    sources: sources
                    images: sprites
                    maps: maps
                    sounds: sounds
                    music: music
                    assets: assets

                  resources = "var resources = #{resources};\n"

                  if req.query? and req.query.srv?
                    if not @server_funk? or not @server.use_cache
                      @server_funk = pug.compileFile "../templates/play/server.pug"
                    pf = @server_funk
                  else
                    if not @play_funk? or not @server.use_cache
                      @play_funk = pug.compileFile "../templates/play/play.pug"
                    pf = @play_funk

                  res.send pf
                    user: user
                    javascript_files: jsfiles
                    fonts: @fonts.fonts
                    debug: req.query? and req.query.debug?
                    server: req.query? and req.query.srv?
                    language: project.language
                    translator: @server.content.translator.getTranslator(@getLanguage(req))
                    game:
                      name: project.slug
                      pathcode: pathcode
                      title: project.title
                      author: user.nick
                      resources: resources
                      orientation: project.orientation
                      aspect: project.aspect
                      graphics: project.graphics
                      networking: project.networking or false
                      libs: JSON.stringify(project.libs)
                      description: project.description
                      poster: poster

    @app.get /^\/[A-Za-z0-9_]+\/?$/,(req,res)=>
      return if @ensureIOArea(req,res)
      @getUserPublicPage(req,res)

    @app.get /^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/manifest.json$/,(req,res)=>
      return if @ensureIOArea(req,res)

      access = @getProjectAccess req,res
      return if not access?

      user = access.user
      project = access.project

      manager = @getProjectManager(project)
      iconversion = manager.getFileVersion("sprites/icon.png")

      path = if project.public then "/#{user.nick}/#{project.slug}/" else "/#{user.nick}/#{project.slug}/#{project.code}/"

      res.setHeader("Content-Type", "application/json")
      s = req.path.split("/")
      mani = @manifest_template.toString().replace(/SCOPE/g,path)
      mani = mani.toString().replace("APPNAME",project.title)
      mani = mani.toString().replace("APPSHORTNAME",project.title)
      mani = mani.toString().replace("ORIENTATION",project.orientation)
      mani = mani.toString().replace(/USER/g,user.nick)
      mani = mani.toString().replace(/PROJECT/g,project.slug)
      mani = mani.toString().replace(/ICONVERSION/g,iconversion)
      mani = mani.replace("START_URL",path)
      res.send mani

    @app.get /^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/sw.js$/,(req,res)=>
      return if @ensureIOArea(req,res)

      access = @getProjectAccess req,res
      return if not access?

      user = access.user
      project = access.project

      fs.readFile "../static/sw.js",(err,data)=>
        res.setHeader("Content-Type", "application/javascript")
        res.send data

    # User Profile Image
    @app.get /^\/[^\/\|\?\&\.]+.png$/,(req,res)=>
      s = req.path.split("/")
      user = s[1].split(".")[0]

      user = @server.content.findUserByNick(user)
      if not user? or not user.flags.profile_image
        @return404(req,res)
        return null

      path = "#{user.id}/profile_image.png"

      @server.content.files.read path,"binary",(content)=>
        if content?
          res.setHeader("Content-Type", "image/png")
          res.send content
        else
          @return404(req,res)
          return null

    @app.get /^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/icon[0-9]+.png$/,(req,res)=>
      access = @getProjectAccess req,res
      return if not access?

      user = access.user
      project = access.project

      size = req.path.split("icon")
      size = size[size.length-1]
      size = Math.min(1024,size.split(".")[0]|0)

      path = "#{user.id}/#{project.id}/sprites/icon.png"
      path = @server.content.files.folder+"/"+@server.content.files.sanitize path

      Jimp.read path, (err, img) =>
        if err
          console.error err
          return
        img.resize(size,size,Jimp.RESIZE_NEAREST_NEIGHBOR).getBuffer Jimp.MIME_PNG,(err,buffer)=>
          if err
            console.error err
            return
          res.setHeader "Content-Type", "image/png"
          res.send buffer

    # source files for player
    @app.get /^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/ms\/[A-Za-z0-9_-]+.ms$/,(req,res)=>
      s = req.path.split("/")
      access = @getProjectAccess req,res
      return if not access?

      user = access.user
      project = access.project
      ms = s[s.length-1]

      @server.content.files.read "#{user.id}/#{project.id}/ms/#{ms}","text",(content)=>
        if content?
          res.setHeader("Content-Type", "application/javascript")
          res.send content
        else
          console.info "couldn't read file: #{req.path}"
          res.status(404).send("Error 404")

    # asset thumbnail
    @app.get /^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/(assets_th|sounds_th|music_th)\/[A-Za-z0-9_-]+.png$/,(req,res)=>
      s = req.path.split("/")
      access = @getProjectAccess req,res
      return if not access?

      user = access.user
      project = access.project
      folder = s[s.length-2]
      asset = s[s.length-1]

      #console.info "loading #{user.id}/#{project.id}/#{folder}/#{asset}"

      @server.content.files.read "#{user.id}/#{project.id}/#{folder}/#{asset}","binary",(content)=>
        if content?
          res.setHeader("Content-Type", "image/png")
          res.send content
        else
          console.info "couldn't read file: #{req.path}"
          res.status(404).send("Error 404")

    # image files for player ; should be deprecated in favor of /sprites/
    @app.get /^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/[A-Za-z0-9_]+.png$/,(req,res)=>
      s = req.path.split("/")
      access = @getProjectAccess req,res
      return if not access?

      user = access.user
      project = access.project
      image = s[s.length-1]

      @server.content.files.read "#{user.id}/#{project.id}/sprites/#{image}","binary",(content)=>
        if content?
          res.setHeader("Content-Type", "image/png")
          res.send content
        else
          console.info "couldn't read file: #{req.path}"
          res.status(404).send("Error 404")

    # image files for player and all
    @app.get /^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/sprites\/[A-Za-z0-9_-]+.png$/,(req,res)=>
      s = req.path.split("/")
      access = @getProjectAccess req,res
      return if not access?

      user = access.user
      project = access.project
      image = s[s.length-1]

      @server.content.files.read "#{user.id}/#{project.id}/sprites/#{image}","binary",(content)=>
        if content?
          res.setHeader("Content-Type", "image/png")
          res.send content
        else
          console.info "couldn't read file: #{req.path}"
          res.status(404).send("Error 404")

    # map files for player
    @app.get /^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/maps\/[A-Za-z0-9_-]+.json$/,(req,res)=>
      s = req.path.split("/")
      access = @getProjectAccess req,res
      return if not access?

      user = access.user
      project = access.project
      map = s[s.length-1]

      @server.content.files.read "#{user.id}/#{project.id}/maps/#{map}","text",(content)=>
        if content?
          res.setHeader("Content-Type", "application/json")
          res.send content
        else
          console.info "couldn't read file: #{req.path}"
          res.status(404).send("Error 404")

    # sound files for player and all
    @app.get /^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/sounds\/[A-Za-z0-9_-]+.(wav|ogg|flac)$/,(req,res)=>
      s = req.path.split("/")
      access = @getProjectAccess req,res
      return if not access?

      user = access.user
      project = access.project
      sound = s[s.length-1]
      ext = sound.split(".")[1]

      @server.content.files.read "#{user.id}/#{project.id}/sounds/#{sound}","binary",(content)=>
        if content?
          res.setHeader("Content-Type", "audio/#{ext}")
          res.send content
        else
          console.info "couldn't read file: #{req.path}"
          res.status(404).send("Error 404")


    # music files for player and all
    @app.get /^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/music\/[A-Za-z0-9_-]+.(mp3|ogg|flac)$/,(req,res)=>
      s = req.path.split("/")
      access = @getProjectAccess req,res
      return if not access?

      user = access.user
      project = access.project
      music = s[s.length-1]
      ext = music.split(".")[1]

      @server.content.files.read "#{user.id}/#{project.id}/music/#{music}","binary",(content)=>
        if content?
          res.setHeader("Content-Type", "audio/#{ext}")
          res.send content
        else
          console.info "couldn't read file: #{req.path}"
          res.status(404).send("Error 404")


    # asset files
    @app.get /^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/assets\/[A-Za-z0-9_-]+.(glb|obj|jpg|png|ttf|txt|csv|json|md)$/,(req,res)=>
      s = req.path.split("/")
      access = @getProjectAccess req,res
      return if not access?

      user = access.user
      project = access.project
      asset = s[s.length-1]

      @server.content.files.read "#{user.id}/#{project.id}/assets/#{asset}","binary",(content)=>
        if content?
          switch asset.split(".")[1]
            when "glb" then res.setHeader("Content-Type", "model/gltf-binary")
            when "obj" then res.setHeader("Content-Type", "model/gltf-binary")
            when "jpg" then res.setHeader("Content-Type", "image/jpg")
            when "png" then res.setHeader("Content-Type", "image/png")
            when "ttf" then res.setHeader("Content-Type", "application/font-sfnt")
            when "txt" then res.setHeader("Content-Type", "text/plain")
            when "csv" then res.setHeader("Content-Type", "text/csv")
            when "json" then res.setHeader("Content-Type", "application/json")

          res.send content
        else
          console.info "couldn't read file: #{req.path}"
          res.status(404).send("Error 404")

    # doc files
    @app.get /^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+(\/([^\/\|\?\&\.]+)?)?\/doc\/[A-Za-z0-9_]+.md$/,(req,res)=>
      s = req.path.split("/")
      access = @getProjectAccess req,res
      return if not access?

      user = access.user
      project = access.project
      doc = s[s.length-1]

      @server.content.files.read "#{user.id}/#{project.id}/doc/#{doc}","text",(content)=>
        if content?
          res.setHeader("Content-Type", "text/markdown")
          res.send content
        else
          console.info "couldn't read file: #{req.path}"
          res.status(404).send("Error 404")

    @app.use (req,res)=>
      @return404(req,res)

  return404:(req,res)->
    if not @err404_funk? or not @server.use_cache
      @err404_funk = pug.compileFile "../templates/404.pug"

    res.status(404).send @err404_funk {}

  ensureDevArea:(req,res)->
    #console.info req.get("host")

    if req.get("host").indexOf(".io")>0
      host = req.get("host").replace(".io",".dev")
      redir = req.protocol+'://' + host + req.url
      console.info "redirecting to: "+redir
      redir = res.redirect(redir)
      true
    else
      false

  ensureIOArea:(req,res)->
    #console.info req.get("host")

    if req.get("host").indexOf(".dev")>0
      host = req.get("host").replace(".dev",".io")
      redir = req.protocol+'://' + host + req.url
      console.info "redirecting to: "+redir
      redir = res.redirect(redir)
      true
    else
      false

  serverBox:(req,res)->
    access = @getProjectAccess req,res
    return if not access?

    user = access.user
    project = access.project

    pathcode = if project.public then project.slug else "#{project.slug}/#{project.code}"
    if not @serverbox_funk? or not @server.use_cache
      @serverbox_funk = pug.compileFile "../templates/play/serverbox.pug"

    host = req.get("host").replace(".dev",".io")
    if @server.config.run_domain?
      server_url = @server.config.run_domain + req.path + "?srv"
    else
      server_url = req.protocol+'://' + host + req.url.replace "?server", "?srv"

    res.send @serverbox_funk
      user: user
      server_url: server_url
      standalone: @server.config.standalone == true
      game:
        name: project.slug
        pathcode: pathcode
        title: project.title
        author: user.nick
        description: project.description

  getUserPublicPage:(req,res)->
    s = req.path.split("/")
    user = s[1]

    user = @server.content.findUserByNick(user)
    if not user?
      return @return404(req,res)

    projects = user.listPublicProjects()
    projects.sort (a,b)-> b.last_modified-a.last_modified

    lang = @getLanguage req
    translator = @server.content.translator.getTranslator(lang)

    funk = pug.compileFile "../templates/play/userpage.pug"

    stats = user.progress.exportStats()

    map =
      pixels_drawn: "Pixels Drawn"
      map_cells_drawn: "Map Cells Painted"
      characters_typed: "Characters Typed"
      lines_of_code: "Lines of Code"
      time_coding: "Coding Time"
      time_drawing: "Drawing Time"
      time_mapping: "Map Editor Time"
      xp: "XP"
      level: "Level"

    list = [
      "level"
      "xp"
      "characters_typed"
      "lines_of_code"
      "pixels_drawn"
      "map_cells_drawn"
      "cells_drawn"
      "time_coding"
      "time_drawing"
      "time_mapping"
    ]

    level = stats["level"] or 0
    xp = stats["xp"] or 0

    stat_list = []

    displayNumber = (x)->
      x = ""+x
      li = []
      while x.length>3
        li.splice(0,0,x.substring(x.length-3,x.length))
        x = x.substring(0,x.length-3)
      li.splice(0,0,x)
      return li.join(" ")

    for key in list
      value = stats[key]
      continue if not value? or key == "xp" or key == "level"
      unit = ""
      if key.startsWith "time"
        if value>=60
          unit = translator.get("hours")
          value = Math.floor(value/60)
        else
          unit = translator.get("minutes")

      stat_list.push
        name: if map[key] then translator.get(map[key]) else key
        value: displayNumber(value)
        unit: unit

    xp1 = if level>0 then user.progress.levels.total_cost[level-1] else 0
    xp2 = user.progress.levels.total_cost[level]
    dxp = xp2-xp1
    percent = Math.max(0,Math.min(99,Math.floor((xp-xp1)/dxp*100)))

    achievements = user.progress.exportAchievements()
    achievements.sort (a,b)-> b.date-a.date

    res.send funk
      user: user.nick
      profile_image: user.flags.profile_image == true
      description: sanitizeHTML marked(user.description),{allowedTags:allowedTags}
      projects: projects
      stats: stat_list
      level: level
      xp: xp
      percent: percent
      achievements: achievements
      translator: @server.content.translator.getTranslator(lang)
      language: lang

  getLanguage:(request)->
    if request.cookies.language?
      lang = request.cookies.language
    else
      lang = request.headers["accept-language"]
    if lang? and lang.length>=2
      lang = lang.substring(0,2)
    else
      lang = "en"

    if lang not in @languages
      lang = "en"

    lang

  getProjectAccess:(req,res)->
    s = req.path.split("/")
    user = s[1]
    project = s[2]
    code = s[3]

    user = @server.content.findUserByNick(user)
    if not user?
      @return404(req,res)
      return null

    project = user.findProjectBySlug project
    if not project?
      @return404(req,res)
      return null

    if project.public or project.code == code
      return { user: user, project: project }

    res.send "Project does not exist"
    return null

  getProjectManager:(project)->
    if not project.manager?
      new ProjectManager project
    project.manager

  roundRect: (context,x, y, w, h, r)->
    r = w / 2 if (w < 2 * r)
    r = h / 2 if (h < 2 * r)
    context.beginPath()
    context.moveTo(x+r, y)
    context.arcTo(x+w, y,   x+w, y+h, r)
    context.arcTo(x+w, y+h, x,   y+h, r)
    context.arcTo(x,   y+h, x,   y,   r)
    context.arcTo(x,   y,   x+w, y,   r)
    context.closePath()

  fillRoundRect: (context,x, y, w, h, r)->
    @roundRect context,x,y,w,h,r
    context.fill()

module.exports = @WebApp
