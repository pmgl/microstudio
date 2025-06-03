compression = require "compression"
express = require "express"
cookieParser = require('cookie-parser')
fs = require "fs"
path = require "path"
WebSocket = require "ws"
process = require "process"
morgan = require "morgan"

BanIP = require __dirname+"/banip.js"

class Session
  constructor:(@server,@socket)->
    @socket.on "message",(msg)=>
      if msg.length
        console.info "received ws message from " +@socket.remoteAddress+", length = "+msg.length

    @socket.on "close",()=>

    @socket.on "error",(err)=>
      console.error err


class @DumbApp
  constructor:(@config={},@callback)->
    process.chdir __dirname

    @config =
      realm: "local"

    if @config.realm == "production"
      @PORT = 443
      @PROD = true
    else if @config.standalone
      @PORT = @config.port or 0
    else
      @PORT = @config.port or 8080
      @PROD = false

    @ban_ip = new BanIP(this)
    @create()

  create:()->
    app = express()

    if fs.existsSync( path.join(__dirname, "../logs") )
      accessLogStream = fs.createWriteStream(path.join(__dirname, "../logs/access.log"), { flags: 'a' })

      # setup the logger
      app.use(morgan('combined', { stream: accessLogStream }))

    app.use (req,res,next)=>
      if @ban_ip.isBanned( req.connection.remoteAddress )
        if req.socket
          req.socket.destroy()
          return

        return res.status(429).send "Too many requests"

      if req.path == "/"
        @ban_ip.request( req.connection.remoteAddress )

      console.info req.connection.remoteAddress + " : " + req.path
      res.status(200).send req.path

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
        @start(app)
    else
      @httpserver = require("http").createServer(app).listen(@PORT)
      @use_cache = false
      @start(app)

  start:(app)->
    @io = new WebSocket.Server
      server: @httpserver
      maxPayload: 40000000

    @io.on "connection",(socket,request)=>
      if @ban_ip.isBanned(request.connection.remoteAddress)
        try
          socket.close()
        catch err
        return

      socket.request = request
      socket.remoteAddress = request.connection.remoteAddress
      new Session @,socket

    console.info "MAX PAYLOAD = "+@io.options.maxPayload
 
module.exports = new @DumbApp() 