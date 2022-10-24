class @MPServerConnection
  constructor:()->
    @status = "connecting"
    impl = new MPServerConnectionImpl @

    @send = (data)=>
      try
        impl.sendMessage data
        return "sent"
      catch err
        console.error err
        return err.toString()

    @close = ()=>
      try
        impl.close()
      catch err
        console.error err

    @messages = []

class @MPServerConnectionImpl
  constructor:(@interface)->
    @status = "connecting"
    try
      @getRelay (address) => @connect(address)
    catch err
      console.error err

    @messages = []
    player.runtime.addConnection @

  getRelay:(callback)->
    player.client.sendRequest {
      name: "get_relay_server"
    },(msg)=>
      if msg.name == "error"
        @interface.status = "error"
        @interface.error = msg.error
      else
        address = msg.address
        if address == "self"
          address = location.origin.replace "http", "ws"
        callback(address)

  connect:(address)->
    @socket = new WebSocket(address)

    @socket.onmessage = (msg)=>
      try
        msg = JSON.parse msg.data

        switch msg.name
          when "mp_server_message"
            @messages.push msg.data
      catch err
        console.error err

    @socket.onopen = ()=>
      @interface.status = "connected"

      @send
        name: "mp_client_connection"
        server_id: ms_project_id

    @socket.onclose = ()=>
      @interface.status = "disconnected"

  update:()->
    if @messages.length > 0 or @interface.messages.length > 0
      @interface.messages = @messages
      @messages = []

  sendMessage:(data)->
    @send
      name: "mp_client_message"
      data: data

  send:(data)->
    @socket.send JSON.stringify data

  close:()->
    @socket.close()