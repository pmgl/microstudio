class @Player
  constructor:(@listener)->
    #src = document.getElementById("code").innerText
    @source_count = 0
    @sources = {}
    @resources = resources
    @request_id = 1
    @pending_requests = {}
    if resources.sources?
      for source in resources.sources
        @loadSource(source)
    else
      @sources.main = document.getElementById("code").innerText
      @start()
      
  loadSource:(source)->
    req = new XMLHttpRequest()
    req.onreadystatechange = (event) =>
      if req.readyState == XMLHttpRequest.DONE
        if req.status == 200
          name = source.file.split(".")[0]
          @sources[name] = req.responseText
          @source_count++
          if @source_count>=resources.sources.length and not @runtime?
            @start()

    req.open "GET",location.origin+location.pathname+"ms/#{source.file}?v=#{source.version}"
    req.send()

  start:()->
    window.addEventListener "message",(msg)=>@messageReceived(msg)
    @postMessage
      name: "get_token"

  serverStart:()->
    @runtime = new Runtime((if window.exported_project then "" else location.origin+location.pathname),@sources,resources,@)

    @client = new PlayerClient @

    @terminal = new Terminal @
    @terminal.start()

    @runtime.start()

    @postMessage
      name: "focus"

  runCommand:(cmd)->
    return if cmd.trim().length == 0
    @runtime.runCommand cmd,(res)=>
      if not cmd.trim().startsWith("print")
        @terminal.echo res

  reportError:(err)->
    @postMessage
      name:"error"
      data: err

  log:(text)->
    @terminal.echo text

  codePaused:()->
    @postMessage
      name:"code_paused"

  exit:()->
    @postMessage
      name: "exit"

  messageReceived:(msg)->
    data = msg.data
    try
      data = JSON.parse data
      switch data.name
        when "set_token"
          window.ms_server_token = data.token
          @serverStart()
          
        when "command"
          @runtime.runCommand data.line,(res)=>
            if not data.line.trim().startsWith("print")
              @postMessage
                name: "output"
                data: res
                id: data.id

        when "pause"
          @runtime.stop()

        when "step_forward"
          @runtime.stepForward()

        when "resume"
          @runtime.resume()

        when "code_updated"
          code = data.code
          file = data.file.split(".")[0]
          if @runtime.vm?
            @runtime.vm.clearWarnings()
          @runtime.updateSource(file,code,true)

        when "sprite_updated"
          file = data.file
          @runtime.updateSprite(file,0,data.data,data.properties)

        when "map_updated"
          file = data.file
          @runtime.updateMap(file,0,data.data)

        when "time_machine"
          @runtime.time_machine.messageReceived data

        when "watch"
          @runtime.watch(data.list)

        when "stop_watching"
          @runtime.stopWatching()

        else
          if data.request_id?
            if @pending_requests[data.request_id]?
              @pending_requests[data.request_id](data)
              delete @pending_requests[data.request_id]

    catch err
      console.error err


  call:(name,args)->
    if @runtime? and @runtime.vm?
      @runtime.vm.call(name,args)

  setGlobal:(name,value)->
    if @runtime? and @runtime.vm?
      @runtime.vm.context.global[name] = value

  exec:(command,callback)->
    if @runtime?
      @runtime.runCommand command,callback

  postMessage:(data)->
    if window != window.parent
      window.parent.postMessage JSON.stringify(data),"*"
    if @listener?
      try
        @listener(data)
      catch err
        console.error err

  postRequest:(data,callback)->
    data.request_id = @request_id
    @pending_requests[@request_id++] = callback
    @postMessage(data)
