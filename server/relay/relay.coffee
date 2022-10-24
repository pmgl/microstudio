WebSocket = require "ws"
RelaySession = require __dirname + "/relaysession.js"

class Relay
  constructor:(@config={})->
    @sessions = []
    @create()
    @token_requests = {}

  create:()->
    @io = new WebSocket.Server { port: @config.relay_port }

    @sessions = []

    @io.on "connection",(socket,request)=>
      
      socket.request = request
      socket.remoteAddress = request.connection.remoteAddress
      @sessions.push new RelaySession @,socket

    @startClient()


  startClient:()->
    try
      console.info "connecting to main server..."
      @client = new WebSocket(@config.microstudio_server_address)

      msg = JSON.stringify
        name: "relay_server_available"
        key: @config.key
        address: @config.relay_address

      @client.on "open",()=>
        console.info "connected to main server"
        @client.send msg

      @client.on "message",(msg)=>
        try
          data = JSON.parse(msg.data)
          if data.name == "check_server_token"
            if data.valid and @token_requests[data.token]?
              @token_requests[data.token]()
              delete @token_requests[data.token]

      interval = setInterval (()=>
        try
          @client.send msg
        catch err
      ),60000
      
      @client.on "error",(err)=>
        console.info err
        clearInterval(interval)
        setTimeout (()=>@startClient()),5000
        @client.close()

      @client.on "close",(msg)=>
        clearInterval(interval)
        setTimeout (()=>@startClient()),5000
    catch err
      console.error err
      if interval?
        clearInterval(interval)
      setTimeout (()=>@startClient()),5000

  sessionClosed:(session)->
    index = @sessions.indexOf(session)
    if index >= 0
      @sessions.splice index,1

  serverTokenCheck:(token,server_id,callback)->
    @token_requests[token] = callback()
    @client.send JSON.stringify
      name: "check_server_token"
      server_id: server_id
      token: token

fs = require "fs"

fs.readFile __dirname + "/config.json",(err,data)=>
  if not err
    @config = JSON.parse(data)
    console.info "config.json loaded"
  else
    console.info "No config.json file found, running with default settings"

  @relay = new Relay(@config)
