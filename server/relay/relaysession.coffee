RelayService = require __dirname + "/relayservice.js"

class @RelaySession
  constructor:(@server,@socket)->
    @socket.on "message",(msg)=>
      @messageReceived msg
      @last_active = Date.now()

    @socket.on "close",()=>
      @server.sessionClosed @
      @disconnected()

    @socket.on "error",(err)=>
      console.error "WS ERROR"
      console.error err

    @commands = {}
    
    @relay_service = new RelayService @

  register:(name,callback)->
    @commands[name] = callback

  disconnected:()->

  messageReceived:(msg)->
    if typeof msg != "string"
      return @bufferReceived msg

    #console.info msg
    try
      msg = JSON.parse msg
      if msg.name?
        c = @commands[msg.name]
        c(msg) if c?
    catch err
      console.info err

  send:(data)->
    @socket.send JSON.stringify data


  serverTokenCheck:(token,server_id,callback)->
    @server.serverTokenCheck(token,server_id,callback)

module.exports = @RelaySession
