class @Runtime
  constructor:(@url,@sources,@resources,@listener)->
    @sprites = {}
    @maps = {}
    @sounds = {}
    @music = {}
    @assets = {}

    @asset_manager = new AssetManager @

    @previous_init = null
    @report_errors = true

    @log = (text)=>
      @listener.log text

    @update_memory = {}
    @servers = []

  addServer:(server)->
    @servers.push server

  updateSource:(file,src,reinit=false)->
    return false if not @vm?
    return false if src == @update_memory[file]
    @update_memory[file] = src

    try
      @vm.run(src,3000,file)

      @listener.postMessage
        name: "compile_success"
        file: file

      @reportWarnings()
      if @vm.error_info?
        err = @vm.error_info
        err.type = "init"
        err.file = file
        @listener.reportError err
        return false

      if @vm.runner.getFunctionSource?
        init = @vm.runner.getFunctionSource "serverInit"
        if init? and init != @previous_init and reinit
          @previous_init = init
          @vm.call("serverInit")
          if @vm.error_info?
            err = @vm.error_info
            err.type = "serverInit"
            @listener.reportError err

      return true
    catch err
      if @report_errors
        console.error err
        err.file = file
        @listener.reportError err
        return false

  start:()->
    if window.ms_async_load
      @startReady()

    if Array.isArray(@resources.maps)
      for m in @resources.maps
        name = m.file.split(".")[0].replace(/-/g,"/")
        @maps[name] = LoadMap @url+"maps/#{m.file}?v=#{m.version}",()=>
          @checkStartReady()
        @maps[name].name = name

    else if @resources.maps?
      if not window.player?
        window.player = @listener

      for key,value of @resources.maps
        @updateMap(key,0,value)

    @checkStartReady()

    return

  checkStartReady:()->
    count = 0
    ready = 0

    for key,value of @maps
      count += 1
      if value.ready
        ready += 1

    if ready < count
      if not window.ms_async_load
        return
    else
      if window.ms_async_load and @vm?
        @vm.context.global.system.loading = 100

    if not @started
      @startReady()

  startReady:()->
    @started = true
    meta =
      print: (text)=>
        if (typeof text == "object" or typeof text == "function") and @vm?
          text = @vm.runner.toString(text)
        @listener.log(text)

    global =
      sprites: @sprites
      sounds: @sounds
      music: @music
      assets: @assets
      asset_manager: @asset_manager.getInterface()
      maps: @maps
      Map: MicroMap

    for lib in window.ms_libs
      switch lib
        when "matterjs" then global.Matter = Matter
        when "cannonjs" then global.CANNON = CANNON

    namespace = location.pathname
    @vm = new MicroVM(meta,global,namespace,location.hash == "#transpiler")
    @vm.context.global.Server = MPServer
    @vm.context.global.system.pause = ()=>
      @listener.codePaused()

    @vm.context.global.system.exit = ()=>
      @exit()

    if not window.ms_async_load
      @vm.context.global.system.loading = 100

    @vm.context.global.system.javascript = System.javascript

    System.runtime = @

    for file,src of @sources
      @updateSource(file,src,false)

    if @vm.runner.getFunctionSource?
      init = @vm.runner.getFunctionSource "serverInit"
      if init?
        @previous_init = init
        @vm.call("serverInit")
        if @vm.error_info?
          err = @vm.error_info
          err.type = "serverInit"
          @listener.reportError err
    else
      @vm.call("serverInit")
      if @vm.error_info?
        err = @vm.error_info
        err.type = "serverInit"
        @listener.reportError err

    @dt = 1000/60
    @last_time = Date.now()
    @current_frame = 0
    @floating_frame = 0
    @clock_interval = setInterval (()=>@clock()),16
    @watcher = new Watcher @
    @listener.postMessage
      name: "started"

  updateMaps:()->
    for key,map of @maps
      map.needs_update = true
    return

  runCommand:(command,callback)->
    try
      warnings = @vm.context.warnings
      @vm.clearWarnings()
      res = @vm.run(command,undefined,undefined,callback)
      @reportWarnings()
      @vm.context.warnings = warnings
      if @vm.error_info?
        err = @vm.error_info
        err.type = "exec"
        @listener.reportError err
      @watcher.update()
      if not callback?
        return res
      else if res?
        callback(res)
      return null
    catch err
      @listener.reportError err

  projectFileUpdated:(type,file,version,data,properties)->
    switch type
      when "maps"
        @updateMap(file,version,data)
      when "ms"
        @updateCode(file,version,data)

  projectFileDeleted:(type,file)->
    switch type
      when "maps"
        delete @maps[file.substring(0,file.length-5).replace(/-/g,"/")]

  projectOptionsUpdated:(msg)->

  updateMap:(name,version,data)->
    name = name.replace(/-/g,"/")
    if data?
      m = @maps[name]
      if m?
        UpdateMap m,data
        m.needs_update = true
      else
        m = new MicroMap(1,1,1,1)
        UpdateMap m,data
        @maps[name] = m
        @maps[name].name = name
    else
      url = @url+"maps/#{name}.json?v=#{version}"
      m = @maps[name]
      if m?
        m.loadFile(url)
      else
        @maps[name] = LoadMap url
        @maps[name].name = name

  updateCode:(name,version,data)->
    if data?
      @sources[name] = data
      if @vm? and data != @update_memory[name]
        @vm.clearWarnings()
      @updateSource name,data,true
    else
      url = @url+"ms/#{name}.ms?v=#{version}"

      req = new XMLHttpRequest()
      req.onreadystatechange = (event) =>
        if req.readyState == XMLHttpRequest.DONE
          if req.status == 200
            @sources[name] = req.responseText
            @updateSource(name,@sources[name],true)

      req.open "GET",url
      req.send()

  stop:()->
    @stopped = true
    clearInterval @clock_interval
    @audio.cancelBeeps()

  stepForward:()->
    if @stopped
      @updateCall()
      @watcher.update()

  resume:()->
    if @stopped
      @stopped = false
      @clock_interval = setInterval (()=>@clock()),16

  clock:()->
    if Date.now() - @last_time > 17
      @timer()

  timer:()->
    return if @stopped
    
    time = Date.now()
    if Math.abs(time-@last_time)>160
      @last_time = time-16

    dt = time-@last_time
    @dt = @dt*.9+dt*.1
    @last_time = time

    @vm.context.global.system.fps = Math.round(fps = 1000/@dt)

    @floating_frame += @dt*60/1000
    ds = Math.min(10,Math.round(@floating_frame-@current_frame))
    if (ds == 0 or ds == 2) and Math.abs(fps-60) < 2
      #console.info "INCORRECT DS: "+ds+ " floating = "+@floating_frame+" current = "+@current_frame
      ds = 1
      @floating_frame = @current_frame+1

    for i in [1..ds] by 1
      @updateCall()

    @current_frame += ds

    if ds>0
      @watcher.update()

    #if ds != 1
    #  console.info "frame missed"
    #if @current_frame%60 == 0
    #  console.info("fps: #{Math.round(1000/@dt)}")

  updateControls:()->
    for s in @servers
      s.update()

  updateCall:()->
    if @vm.runner.triggers_controls_update
      if not @vm.runner.updateControls?
        @vm.runner.updateControls = ()=> @updateControls()
    else
      @updateControls()

    try

      @vm.call("serverUpdate")

      @reportWarnings()

      if @vm.error_info?
        err = @vm.error_info
        err.type = "serverUpdate"
        @listener.reportError err
    catch err
      @listener.reportError err if @report_errors

  reportWarnings:()->
    if @vm?
      for key,value of @vm.context.warnings.invoking_non_function
        if not value.reported
          value.reported = true
          @listener.reportError
            error: ""
            type: "non_function"
            expression: value.expression
            line: value.line
            column: value.column
            file: value.file

      for key,value of @vm.context.warnings.using_undefined_variable
        if not value.reported
          value.reported = true
          @listener.reportError
            error: ""
            type: "undefined_variable"
            expression: value.expression
            line: value.line
            column: value.column
            file: value.file

      for key,value of @vm.context.warnings.assigning_field_to_undefined
        if not value.reported
          value.reported = true
          @listener.reportError
            error: ""
            type: "assigning_undefined"
            expression: value.expression
            line: value.line
            column: value.column
            file: value.file

      for key,value of @vm.context.warnings.assigning_api_variable
        if not value.reported
          value.reported = true
          @listener.reportError
            error: ""
            type: "assigning_api_variable"
            expression: value.expression
            line: value.line
            column: value.column
            file: value.file

      return

  exit:()->
    @stop()

    # microStudio embedded exit
    try
      @listener.exit()
    catch err

    # TODO: Cordova exit, this might work
    try
      if navigator.app? and navigator.app.exitApp?
        navigator.app.exitApp()
    catch err

    # TODO: Electron exit, may already be covered by window.close()

    # Windowed mode exit
    try
      window.close()
    catch err


@System =
  javascript:(s)->
    try
      f = eval("res = function(global) { #{s} }" )
      res = f.call(player.runtime.vm.context.global,player.runtime.vm.context.global)
    catch err
      console.error err

    if res? then res else 0
