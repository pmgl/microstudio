ServerInstance = require __dirname + "/serverinstance.js"

class @RelayService
  constructor:(@session)->
    @session.register "mp_start_server",(msg)=> @startServer(msg)
    @session.register "mp_client_connection",(msg)=> @clientConnection(msg)

  startServer:(msg)->
    return if not msg.server_id?
    
    instance = new ServerInstance(@session)
    RelayService.servers[msg.server_id] = instance

  clientConnection:(msg)->
    console.info JSON.stringify msg
    return if not msg.server_id?
    server = RelayService.servers[msg.server_id]
    if server?
      console.info "server found"
      server.clientConnection(@session)

@RelayService.servers = {}

module.exports = @RelayService