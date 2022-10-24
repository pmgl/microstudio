ServerInstance = require __dirname + "/serverinstance.js"

class @RelayService
  constructor:(@session)->
    @session.register "mp_start_server",(msg)=> @startServer(msg)
    @session.register "mp_client_connection",(msg)=> @clientConnection(msg)
    @session.register "mp_server_status",(msg)=> @serverStatus(msg)

  startServer:(msg)->
    return if not msg.server_id?
    return if not msg.token?

    @session.serverTokenCheck msg.token,msg.server_id,()=>
      instance = new ServerInstance(@,msg.server_id,@session)
      RelayService.servers[msg.server_id] = instance

  serverDisconnected:(server)->
    if server == RelayService.servers[server.id]
      delete RelayService.servers[server.id]

  clientConnection:(msg)->
    return if not msg.server_id?
    server = RelayService.servers[msg.server_id]
    if server?
      server.clientConnection(@session)
    else
      @session.socket.close()

  serverStatus:(msg)->
    return if not msg.server_id?
    server = RelayService.servers[msg.server_id]
    @session.send
      name: "mp_server_status"
      server_id: msg.server_id
      running: server?


@RelayService.servers = {}

module.exports = @RelayService