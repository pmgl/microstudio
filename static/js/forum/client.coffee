class @Client
  constructor:(@forum)->
    @pending_requests = {}
    @request_id = 0
    @sends = []

  start:()->
    @token = localStorage.getItem "token"
    if @token?
      @connect()

  checkToken:()->
    return if not @token

    @sendRequest {
      name: "token"
      token: @token
    },(msg)=>
      switch msg.name
        when "error"
          console.error msg.error

        when "token_valid"
          @forum.nick = msg.nick
          @forum.user =
            nick: msg.nick
            email: msg.email
            flags: msg.flags
            settings: msg.settings
            info: msg.info

          @forum.userConnected(msg.nick)

  connect:()->
    @socket = new WebSocket(window.location.origin.replace("http","ws"))

    @socket.onmessage = (msg)=>
      msg = msg.data
      console.info "received: "+msg
      try
        msg = JSON.parse msg
        if msg.request_id?
          if @pending_requests[msg.request_id]?
            @pending_requests[msg.request_id](msg)
            delete @pending_requests[msg.request_id]

        else
          @forum.serverMessage msg

      catch err
        console.error err

    @socket.onopen = ()=>
      @checkToken()
      while @sends.length>0
        s = @sends.splice(0,1)[0]
        @send s
      return

    @socket.onclose = ()=>
      console.info "socket closed"
      @socket = null

  send:(data)->
    if @socket? and @socket.readyState == WebSocket.OPEN
      @socket.send JSON.stringify data
    else
      @sends.push data
      @connect() if not @socket? or @socket.readyState != WebSocket.CONNECTING

  sendRequest:(msg,callback)->
    msg.request_id = @request_id++
    @pending_requests[msg.request_id] = callback
    @send msg
