class @MPServerConnection
  constructor:()->
    @status = "connecting"
    impl = new MPServerConnectionImpl @

    @send = (data)=>
      impl.sendMessage data

    @messages = []

class @MPServerConnectionImpl
  constructor:(@interface)->
    @status = "connecting"
    reconnect_delay = 1000
    try
      @connect()
    catch err
      console.error err

    @messages = []
    player.runtime.addConnection @

  connect:()->
    @socket = new WebSocket("ws://localhost:8080")

    @socket.onmessage = (msg)=>
      console.info "received: "+msg.data
      try
        msg = JSON.parse msg.data

        switch msg.name
          when "mp_server_message"
            @messages.push msg.data
      catch err
        console.error err

    @socket.onopen = ()=>
      @interface.status = "connected"
      @reconnect_delay = 1000

      @send
        name: "mp_client_connection"
        server_id: "user/project"

    @socket.onclose = ()=>
      @interface.status = "connecting"
      setTimeout (()=>@connect()),@reconnect_delay
      @reconnect_delay += 1000

  update:()->
    @interface.messages = @messages
    @messages = []

  sendMessage:(data)->
    @send
      name: "mp_client_message"
      data: data

  send:(data)->
    @socket.send JSON.stringify data