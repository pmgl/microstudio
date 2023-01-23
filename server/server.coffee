compression = require "compression"
express = require "express"
cookieParser = require('cookie-parser')
fs = require "fs"
path = require "path"
DB = require __dirname+"/db/db.js"
FileStorage = require __dirname+"/filestorage/filestorage.js"
Content = require __dirname+"/content/content.js"
WebApp = require __dirname+"/webapp.js"
Session = require __dirname+"/session/session.js"
RateLimiter = require __dirname+"/ratelimiter.js"
BuildManager = require __dirname+"/build/buildmanager.js"
WebSocket = require "ws"
process = require "process"

class @Server
  constructor:(@config={},@callback)->
    process.chdir __dirname

    @app_data = @config.app_data or ".."

    @mailer =    # STUB
      sendMail:(recipient,subject,text)->
        console.info "send mail to:#{recipient} subject:#{subject} text:#{text}"

    @stats =    # STUB
      set:(name,value)->
      max:(name,value)->
      unique:(name,id)->
      inc:(name)->
      stop:()->

    @last_backup_time = 0

    if @config.realm == "production"
      @PORT = 443
      @PROD = true
    else if @config.standalone
      @PORT = @config.port or 0
    else
      @PORT = @config.port or 8080
      @PROD = false

    @loadPlugins ()=>
      @create()

  create:()->
    app = express()
    static_files = "../static"

    @date_started = Date.now()

    @rate_limiter = new RateLimiter @
    app.use (req,res,next)=>
      if @rate_limiter.accept("request","general") and @rate_limiter.accept("request_ip",req.connection.remoteAddress)
        next()
      else
        res.status(500).send ""
      @stats.inc("http_requests")
      @stats.unique("ip_addresses",req.connection.remoteAddress)
      referrer = req.get("Referrer")
      if referrer? and not referrer.startsWith("http://localhost") and not referrer.startsWith("https://microstudio.io") and not referrer.startsWith("https://microstudio.dev")
        @stats.unique("referrer|"+referrer,req.connection.remoteAddress)

    app.use(compression())

    app.use(cookieParser())

    for plugin in @plugins
      if plugin.getStaticFolder?
        folder = plugin.getStaticFolder()
        app.use(express.static(folder))

    app.use(express.static(static_files))
    app.use("/microstudio.wiki",express.static("../microstudio.wiki",{dotfiles:"ignore"}))
    app.use("/lib/fontlib/ubuntu",express.static("node_modules/@fontsource/ubuntu"))
    app.use("/lib/fontlib/ubuntu-mono",express.static("node_modules/@fontsource/ubuntu-mono"))
    app.use("/lib/fontlib/source-sans-pro",express.static("node_modules/@fontsource/source-sans-pro"))
    app.use("/lib/fontlib/fontawesome",express.static("node_modules/@fortawesome/fontawesome-free"))
    app.use("/lib/ace",express.static("node_modules/ace-builds/src-min"))
    app.use("/lib/marked/marked.js",express.static("node_modules/marked/marked.min.js"))
    app.use("/lib/dompurify/purify.js",express.static("node_modules/dompurify/dist/purify.min.js"))
    app.use("/lib/jquery/jquery.js",express.static("node_modules/jquery/dist/jquery.min.js"))
    app.use("/lib/jquery-ui",express.static("node_modules/jquery-ui-dist"))
    app.use("/lib/pixijs",express.static("node_modules/pixi.js/dist/browser"))
    app.use("/lib/babylonjs",express.static("node_modules/babylonjs"))
    app.use("/lib/babylonjs",express.static("node_modules/babylonjs-loaders"))
    app.use("/lib/matterjs",express.static("node_modules/matter-js/build"))
    app.use("/lib/cannonjs",express.static("node_modules/cannon/build"))
    if @config.brython_path
      app.use("/lib/brython",express.static(@config.brython_path))
    else
      app.use("/lib/brython",express.static("node_modules/brython"))
    app.use("/lib/fengari",express.static("node_modules/fengari-web/dist"))
    app.use("/lib/qrcode",express.static("node_modules/qrcode/build"))
    app.use("/lib/wavefile",express.static("node_modules/wavefile/dist"))
    app.use("/lib/lamejs/lame.min.js",express.static("node_modules/lamejs/lame.min.js"))

    @db = new DB "#{@app_data}/data",(db)=>
      for plugin in @plugins
        if plugin.dbLoaded?
          plugin.dbLoaded(db)

      if @PROD
        require('greenlock-express').init
          packageRoot: __dirname
          configDir: "./greenlock.d"
          maintainerEmail: "contact@microstudio.dev"
          cluster: false
        .ready (glx)=>
          @httpserver = glx.httpsServer()
          @use_cache = true
          glx.serveApp app
          @start(app,db)
      else if @config.standalone
        @use_cache = false
        @httpserver = require("http").createServer(app).listen @PORT,"127.0.0.1",()=>
          @PORT = @httpserver.address().port
          @start(app,db)
          console.info "standalone running on port #{@PORT}"
          @callback() if @callback?
      else
        @httpserver = require("http").createServer(app).listen(@PORT)
        @use_cache = false
        @start(app,db)

  start:(app,db)->
    @active_users = 0

    @io = new WebSocket.Server
      server: @httpserver
      maxPayload: 40000000

    @sessions = []

    @io.on "connection",(socket,request)=>
      socket.request = request
      socket.remoteAddress = request.connection.remoteAddress
      @sessions.push new Session @,socket

    console.info "MAX PAYLOAD = "+@io.options.maxPayload

    @session_check = setInterval (()=>@sessionCheck()),10000

    @content = new Content @,db,new FileStorage "#{@app_data}/files"
    @build_manager = new BuildManager @
    @webapp = new WebApp @,app

    for l in @webapp.languages
      @content.translator.createLanguage l

    process.on 'SIGINT', ()=>
      console.log "caught INT signal"
      @exit()

    process.on 'SIGTERM', ()=>
      console.log "caught TERM signal"
      @exit()

    #process.on 'SIGKILL', ()=>
    #  console.log "caught KILL signal"
    #  @exit()

    @exitcheck = setInterval (()=>
      if fs.existsSync("exit")
        @exit()
        fs.unlinkSync("exit")

      if fs.existsSync("update")
        @webapp.concatenator.refresh()
        fs.unlinkSync("update")
    ),2000

  exit:()=>
    if @exited
      process.exit(0)
    @httpserver.close()
    @stats.stop()
    @rate_limiter.close()
    @io.close()
    @db.close()
    @content.close()
    clearInterval @exitcheck
    clearInterval @session_check
    @exited = true
    setTimeout (()=>@exit()),5000

  sessionCheck:()->
    for s in @sessions
      if s?
        s.timeCheck()
    return

  sessionClosed:(session)->
    index = @sessions.indexOf(session)
    if index>=0
      @sessions.splice index,1

  loadPlugins:(callback)->
    @plugins = []

    fs.readdir "../plugins",(err,files)=>
      files = [] if not files?

      funk = ()=>
        if files.length==0
          callback()
        else
          f = files.splice(0,1)[0]
          @loadPlugin "../plugins/#{f}",funk

      funk()

  loadPlugin:(folder,callback)->
    if fs.existsSync "#{folder}/index.js"
      try
        Plugin = require "#{folder}/index.js"
        p = new Plugin(@)
        @plugins.push p
        console.info "loaded plugin #{folder}"
      catch err
        console.error err
      callback()
    else
      console.info "plugin #{folder} has no index.js"
      callback()

module.exports = @Server
