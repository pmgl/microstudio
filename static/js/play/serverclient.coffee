class @PlayerClient
  constructor:(@player)->
    @pending_requests = {}
    @request_id = 0
    @version_checked = false
    @reconnect_delay = 1000

    if location.protocol.startsWith "http"
      try
        @connect()
      catch err
        console.error err

      setInterval (()=>@sendRequest({name:"ping"}) if @socket?),30000

  connect:()->
    @socket = new WebSocket(window.location.origin.replace("http","ws"))

    @socket.onmessage = (msg)=>
      console.info "received: "+msg.data
      try
        msg = JSON.parse msg.data
        if msg.request_id?
          if @pending_requests[msg.request_id]?
            @pending_requests[msg.request_id](msg)
            delete @pending_requests[msg.request_id]

        #if msg.name == "code_updated"
        #  @player.runtime.updateSource(msg.file,msg.code,true)

        #if msg.name == "sprite_updated"
        #  @player.runtime.updateSprite(msg.sprite)

        if msg.name == "project_file_updated"
          @player.runtime.projectFileUpdated(msg.type,msg.file,msg.version,msg.data,msg.properties)

        if msg.name == "project_file_deleted"
          @player.runtime.projectFileDeleted(msg.type,msg.file)

        if msg.name == "project_options_updated"
          @player.runtime.projectOptionsUpdated(msg)

      catch err
        console.error err

    @socket.onopen = ()=>
      #console.info "socket opened"
      @reconnect_delay = 1000
      user = location.pathname.split("/")[1]
      project = location.pathname.split("/")[2]

      @send
        name: "listen_to_project"
        user: user
        project: project

      if not @version_checked
        @version_checked = true
        sprites = {}
        maps = {}
        sources = {}
        for s in @player.resources.images
          sprites[s.file.split(".")[0]] = s.version
        for s in @player.resources.maps
          maps[s.file.split(".")[0]] = s.version
        for s in @player.resources.sources
          sources[s.file.split(".")[0]] = s.version

        @sendRequest {
          name: "get_file_versions"
          user: user
          project: project
        },(msg)=>
          for name,info of msg.data.sources
            v = sources[name]
            if not v? or v!= info.version
              #console.info "updating #{name} to version #{version}"
              @player.runtime.projectFileUpdated("ms",name,info.version,null,info.properties)

          for name,info of msg.data.sprites
            v = sprites[name]
            if not v? or v!= info.version
              #console.info "updating #{name} to version #{version}"
              @player.runtime.projectFileUpdated("sprites",name,info.version,null,info.properties)

          for name,info of msg.data.maps
            v = maps[name]
            if not v? or v!= info.version
              #console.info "updating #{name} to version #{version}"
              @player.runtime.projectFileUpdated("maps",name,info.version,null,info.properties)

    @socket.onclose = ()=>
      #console.info "socket closed"
      setTimeout (()=>@connect()),@reconnect_delay
      @reconnect_delay += 1000

  send:(data)->
    @socket.send JSON.stringify data

  sendRequest:(msg,callback)->
    msg.request_id = @request_id++
    @pending_requests[msg.request_id] = callback
    @send msg
