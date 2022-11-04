WebSocket = require "ws"

class @MPServer
  constructor:()->
    impl = new MPServerImpl @
    @send = (data)->
      try
        impl.sendMessage(data)
        return "sent"
      catch err
        console.error err
        return err.toString()

    @close = ()->
      try
        impl.close()
      catch err
        console.error err

    @new_connections = []
    @active_connections = []
    @closed_connections = []
    @messages = []
    player.runtime.addServer(impl)
 
class @MPServerImpl
  constructor:(@interface)->
    @interface.status = "starting"
    @reconnect_delay = 1000
    @clients = {}
    @clients_connected = []
    @clients_disconnected = {}
    @client_id = 1
    @start()

  start:()->
    try
      @server = new WebSocket.Server { port: server_port }

      @server.on "connection",(socket,request)=>
        @clientConnected socket
    catch err
      console.error err

  clientConnected:(socket)->
    client = new MPClient @, socket, @client_id
    @clients_connected.push client
    @clients[@client_id] = client
    @client_id++

  clientMessage:(msg)->
    return if not msg.client_id?
    client = @clients[msg.client_id]
    if client?
      client.message(msg.data)

  clientDisconnected:(client)->
    delete @clients[client.client_id]
    @clients_disconnected[client.client_id] = true

  sendMessage:(data)->
    @send
      name: "mp_server_message"
      data: data

  send:(data)->
    @socket.send JSON.stringify data

  update:()->
    new_connections = []
    closed_connections = []

    for i in [@interface.active_connections.length-1..0] by -1
      c = @interface.active_connections[i]
      if @clients_disconnected[c.id]
        @interface.active_connections.splice i,1
        closed_connections.push c

    for c in @clients_connected
      new_connections.push c.interface
      @interface.active_connections.push c.interface

    @interface.new_connections = new_connections
    @interface.closed_connections = closed_connections

    @clients_disconnected = {}
    @clients_connected = []

    for id,client of @clients
      client.update()

    messages = []
    for connection in @interface.active_connections
      for m in connection.messages
        messages.push m

    @interface.messages = messages
    return

  close:()->
    @socket.close()
    

class @MPClient
  constructor:(@server,@socket,@client_id)->
    @interface =
      id: @client_id
      status: "connected"
      messages: []
      send:(data)=> @sendMessage(data)
      disconnect:()=> @disconnect()

    @message_buffer = []

    @socket.onmessage = (msg)=>
      try
        # console.info msg.data
        msg = JSON.parse msg.data
        switch msg.name
          when "mp_update"
            @interface.status = "running"
            player.runtime.timer()
          when "mp_client_connection"
            @clientConnected msg
          when "mp_client_message"
            @clientMessage msg
          when "mp_client_disconnected"
            @disconnected()  
      catch err
        console.error err

    @socket.onclose = ()=>
      @server.clientDisconnected @

  clientConnected:(msg)->

  clientMessage:(msg)->
    @message_buffer.push msg.data

  sendMessage:(data)->
    try
      @socket.send JSON.stringify
        name: "mp_server_message"
        data: data
    catch err
      console.error err
  
  disconnect:()->
    try
      @socket.close()
    catch err
      console.error err
  
  message:(msg)->
    @message_buffer.push msg.data

  disconnected:()->
    @interface.status = "disconnected"
    
  update:()->
    messages = []
    for m in @message_buffer
      messages.push
        connection: @interface
        data: m

    @interface.messages = messages
    @message_buffer = []
    
    
    
    