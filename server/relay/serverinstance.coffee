class @ServerInstance
  constructor:(@session)->
    @connected_clients = {}
    @interval = setInterval (()=>@timer()),8
    @start_time = Date.now()
    @time = 0
    @client_id = 1

    @session.register "mp_server_message",(msg)=>@message(msg)


  message:(msg)->
    client = @connected_clients[msg.client_id]
    if client?
      client.send
        name: "mp_server_message"
        data: msg.data

  stop:()->
    clearInterval @interval

  timer:()->
    t = Date.now() - @start_time

    if t > @time+100
      @time = t - 1001/60

    if t > @time + 1000/60
      @time += 1000/60
      @session.send
        name: "mp_update"

  clientConnection:(clientsession)->
    clientsession.disconnected = ()=>
      if clientsession.client_id?
        delete @connected_clients[clientsession.client_id]

    clientsession.client_id = @client_id++
    @connected_clients[clientsession.client_id] = clientsession

    clientsession.register "mp_client_message",(msg)=>
      @session.send
        name: "mp_client_message"
        client_id: clientsession.client_id
        data: msg.data

    clientsession.disconnected = ()=>
      @session.send
        name: "mp_client_disconnected"
        client_id: clientsession.client_id

    @session.send
      name: "mp_client_connection"
      client_id: clientsession.client_id    

module.exports = @ServerInstance