class @Client
  constructor:(@app)->
    @pending_requests = {}
    @request_id = 0
    @sends = []
    setInterval (()=>@check()),1000

    @listeners = {}

    @listen "error",(msg)=>
      if msg.error?
        @app.appui.showNotification @app.translator.get msg.error

  start:()->
    @token = localStorage.getItem "token"
    if window.ms_standalone
      @token = "---"

    if @token?
      setTimeout (()=>@app.appui.popMenu()),500
      @connect()
    else
      @app.appui.showLoginButton()
      setTimeout (()=>@app.appui.popMenu()),500
      @app.app_state.initState()

  setToken:(@token)->
    if @token?
      localStorage.setItem "token",@token
      date = new Date()
      date.setTime
      document.cookie = "token=#{@token};expires=#{new Date(Date.now()+3600000*24*14).toUTCString()};path=/"
    else
      localStorage.removeItem "token"
      document.cookie = "token=#{@token};expires=#{new Date(Date.now()-3600000*24*14).toUTCString()};path=/"

  checkToken:()->
    return if not @token

    @sendRequest {
      name: "token"
      token: @token
    },(msg)=>
      switch msg.name
        when "error"
          console.error msg.error
          @app.setToken null
          @app.appui.showLoginButton()
          @app.app_state.initState()

        when "token_valid"
          @app.nick = msg.nick
          @setToken @token    # refresh cookie
          @app.user =
            nick: msg.nick
            email: msg.email
            flags: msg.flags
            settings: msg.settings
            info: msg.info

          if msg.notifications? and msg.notifications.length>0
            for n in msg.notifications
              @app.appui.showNotification n

          @app.connected = true
          @app.userConnected(msg.nick)
          @app.app_state.initState()

  connect:()->
    @socket = new WebSocket(window.location.origin.replace("http","ws"))
    @extend()

    @socket.onmessage = (msg)=>
      msg = msg.data
      console.info "received: "+msg
      try
        msg = JSON.parse msg
        if msg.request_id?
          if @pending_requests[msg.request_id]?
            c = @pending_requests[msg.request_id]
            delete @pending_requests[msg.request_id]
            c(msg)
        else
          if msg.name? and @listeners[msg.name]?
            @listeners[msg.name](msg)

          @app.serverMessage msg

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

  extend:()->
    @timeout = Date.now()+10000

  send:(data)->
    if @socket? and @socket.readyState == WebSocket.OPEN
      @extend()
      @socket.send JSON.stringify data
    else
      @sends.push data
      @connect() if not @socket? or @socket.readyState != WebSocket.CONNECTING

  sendRequest:(msg,callback)->
    # r = Math.random()
    # if @socket? and msg.name == "write_project_file" and r<.5
    #   console.info("BAD CONNECTION SIMULATED "+r)
    #   @socket.close()
    #   return
    msg.request_id = @request_id++
    @pending_requests[msg.request_id] = callback
    @send msg

  sendUpload:(msg,data,callback,progress_callback)->
    request_id = @request_id

    @sendRequest {
      name: "upload_request"
      size: data.byteLength
      request: msg
    },(response)=>
      count = 0
      if response.name == "error"
        return callback response
      funk = (res)=>
        if res? and res.name == "error"
          return callback res
        if progress_callback?
          progress_callback count/data.byteLength*100

        @pending_requests[request_id] = funk #(res)=> setTimeout((()=>funk(res)),200)
        len = Math.min(100000,data.byteLength-count)
        if len>0
          buffer = new ArrayBuffer(len+4)
          new Uint8Array(buffer, 4, len).set(new Uint8Array(data,count,len))
          count += len
          new DataView(buffer).setUint32(0,request_id,true)
          console.info("sending #{len} bytes")
          @socket.send(buffer)
        else
          console.info(res)
          callback(res)
      funk()

  check:()->
    #if @socket and @socket.readyState == "open" and Date.now()>@timeout
    #  @socket.close()

  listen:(name,callback)->
    @listeners[name] = callback
