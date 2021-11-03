fs = require "fs"
Server = require __dirname+"/server.js"

class @App
  constructor:()->
    @config =
      realm: "local"

    fs.readFile "../config.json",(err,data)=>
      if not err
        @config = JSON.parse(data)
        console.info "config.json loaded"
      else
        console.info "No config.json file found, running local with default settings"

      @server = new Server(@config)

module.exports = new @App()
