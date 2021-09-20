class @Runtime
  constructor:(@url,@sources,@resources,@listener)->
    if window.graphics == "M3D"
      @screen = new Screen3D @
    else
      @screen = new Screen @

    @audio = new AudioCore @
    @keyboard = new Keyboard()
    @gamepad = new Gamepad()
    @sprites = {}
    @maps = {}
    @sounds = {}
    @music = {}
    @touch = {}
    @mouse = @screen.mouse
    @previous_init = null
    @random = new Random(0)
    @orientation = window.orientation
    @aspect = window.aspect
    @report_errors = true

    @log = (text)=>
      @listener.log text

    @update_memory = {}

  updateSource:(file,src,reinit=false)->
    return false if not @vm?
    return false if src == @update_memory[file]
    @update_memory[file] = src
    @audio.cancelBeeps()
    @screen.clear()

    try
      parser = new Parser(src,file)
      parser.parse()
      if parser.error_info?
        err = parser.error_info
        err.type = "compile"
        err.file = file
        @listener.reportError err
        return false
      else
        @listener.postMessage
          name: "compile_success"
          file: file

      @vm.run(parser.program)
      @reportWarnings()
      if @vm.error_info?
        err = @vm.error_info
        err.type = "init"
        err.file = file
        @listener.reportError err
        return false

      init = @vm.context.global.init
      if init? and init.source != @previous_init and reinit
        @previous_init = init.source
        @vm.call("init")

      return true
    catch err
      if @report_errors
        console.error err
        err.file = file
        @listener.reportError err
        return false

  start:()->
    for i in @resources.images
      s = new Sprite(@url+"sprites/"+i.file+"?v="+i.version,null,i.properties)
      name = i.file.split(".")[0]
      s.name = name
      @sprites[name] = s
      s.loaded = ()=>
        @updateMaps()
        @checkStartReady()

    if Array.isArray(@resources.maps)
      for m in @resources.maps
        name = m.file.split(".")[0]
        @maps[name] = new MicroMap(@url+"maps/#{m.file}?v=#{m.version}",0,0,0,@sprites)
        @maps[name] = name
        @maps[name].loaded = ()=>
          @checkStartReady()

    else if @resources.maps?
      for key,value of @resources.maps
        @updateMap(key,0,value)

    for s in @resources.sounds
      name = s.file.split(".")[0]
      s = new Sound(@audio,@url+"sounds/"+s.file+"?v="+s.version)
      s.name = name
      @sounds[name] = s

    for m in @resources.music
      name = m.file.split(".")[0]
      m = new Music(@audio,@url+"music/"+m.file+"?v="+m.version)
      m.name = name
      @music[name] = m

    return

  checkStartReady:()->
    if not @start_ready
      for key,value of @sprites
        return if not value.ready

      for key,value of @maps
        return if not value.ready

      @start_ready = true
      @startReady()

  startReady:()->
    meta =
      print: (text)=>
        if typeof text == "object"
          text = Program.toString(text)
        @listener.log(text)

    global =
      screen: @screen.getInterface()
      audio: @audio.getInterface()
      keyboard: @keyboard.keyboard
      gamepad: @gamepad.status
      sprites: @sprites
      sounds: @sounds
      music: @music
      maps: @maps
      touch: @touch
      mouse: @mouse
      fonts: window.fonts

    if window.graphics == "M3D"
      global.M3D = new M3D @

    namespace = location.pathname
    @vm = new MicroVM(meta,global,namespace,location.hash == "#transpiler")
    for file,src of @sources
      @updateSource(file,src,false)

    init = @vm.context.global.init
    if init?
      @previous_init = init.source
      @vm.call("init")

    @dt = 1000/60
    @last_time = Date.now()
    @current_frame = 0
    @floating_frame = 0
    requestAnimationFrame(()=>@timer())
    @screen.startControl()

  updateMaps:()->
    for key,map of @maps
      map.needs_update = true
    return

  runCommand:(command)->
    try
      parser = new Parser(command)
      parser.parse()
      if parser.error_info?
        err = parser.error_info
        err.type = "compile"
        @listener.reportError err
        return 0

      warnings = @vm.context.warnings
      @vm.clearWarnings()
      res = @vm.run(parser.program)
      @reportWarnings()
      @vm.context.warnings = warnings
      if @vm.error_info?
        err = @vm.error_info
        err.type = "exec"
        @listener.reportError err
      res
    catch err
      @listener.reportError err

  projectFileUpdated:(type,file,version,data,properties)->
    switch type
      when "sprites"
        @updateSprite(file,version,data,properties)
      when "maps"
        @updateMap(file,version,data)
      when "ms"
        @updateCode(file,version,data)

  projectFileDeleted:(type,file)->
    switch type
      when "sprites"
        delete @sprites[file.substring(0,file.length-4)]
      when "maps"
        delete @maps[file.substring(0,file.length-5)]

  projectOptionsUpdated:(msg)->
    @orientation = msg.orientation
    @aspect = msg.aspect
    @screen.resize()

  updateSprite:(name,version,data,properties)->
    if data?
      data = "data:image/png;base64,"+data
      if @sprites[name]?
        img = new Image
        img.crossOrigin = "Anonymous"
        img.src = data
        img.onload = ()=>
          @sprites[name].load(img,properties)
          @updateMaps()
      else
        @sprites[name] = new Sprite(data,null,properties)
        @sprites[name].name = name
        @sprites[name].loaded = ()=>
          @updateMaps()
    else
      if @sprites[name]?
        img = new Image
        img.crossOrigin = "Anonymous"
        img.src = @url+"sprites/"+name+".png?v=#{version}"
        img.onload = ()=>
          @sprites[name].load(img,properties)
          @updateMaps()
      else
        @sprites[name] = new Sprite(@url+"sprites/"+name+".png?v=#{version}",null,properties)
        @sprites[name].name = name
        @sprites[name].loaded = ()=>
          @updateMaps()

  updateMap:(name,version,data)->
    if data?
      m = @maps[name]
      if m?
        m.load(data,@sprites)
        m.needs_update = true
      else
        m = new MicroMap(1,1,1,1,@sprites)
        m.load data,@sprites
        @maps[name] = m
    else
      url = @url+"maps/#{name}.json?v=#{version}"
      m = @maps[name]
      if m?
        m.loadFile(url)
      else
        @maps[name] = new MicroMap(url,0,0,0,@sprites)

  updateCode:(name,version,data)->
    if data?
      @sources[name] = data
      if @vm?
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
    @audio.cancelBeeps()

  resume:()->
    @stopped = false
    requestAnimationFrame(()=>@timer())

  timer:()->
    return if @stopped
    requestAnimationFrame(()=>@timer())
    time = Date.now()
    if Math.abs(time-@last_time)>1000
      @last_time = time-16

    dt = time-@last_time
    @dt = @dt*.99+dt*.01
    @last_time = time

    @floating_frame += @dt*60/1000
    ds = Math.min(30,Math.round(@floating_frame-@current_frame))
    for i in [1..ds] by 1
      @updateCall()

    @current_frame += ds
    @drawCall()
    #if ds == 0
    #  console.info "frame missed"
    #if @current_frame%60 == 0
    #  console.info("fps: #{Math.round(1000/@dt)}")

  updateCall:()->
    @updateControls()
    try
      #time = Date.now()
      @vm.call("update")
      @reportWarnings()
      #console.info "update time: "+(Date.now()-time)
      if @vm.error_info?
        err = @vm.error_info
        err.type = "update"
        @listener.reportError err
    catch err
      @listener.reportError err if @report_errors

  drawCall:()->
    try
      @screen.initDraw()
      @screen.updateInterface()

      @vm.call("draw")
      @reportWarnings()
      if @vm.error_info?
        err = @vm.error_info
        err.type = "draw"
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

  updateControls:()->
    touches = Object.keys(@screen.touches)
    @touch.touching = touches.length>0
    @touch.touches = []
    for key in touches
      t = @screen.touches[key]
      @touch.x = t.x
      @touch.y = t.y
      @touch.touches.push
        x: t.x
        y: t.y
        id: key

    if @mouse.pressed and not @previous_mouse_pressed
      @previous_mouse_pressed = true
      @mouse.press = 1
    else
      @mouse.press = 0

    if not @mouse.pressed and @previous_mouse_pressed
      @previous_mouse_pressed = false
      @mouse.release = 1
    else
      @mouse.release = 0

    if @touch.touching and not @previous_touch
      @previous_touch = true
      @touch.press = 1
    else
      @touch.press = 0

    if not @touch.touching and @previous_touch
      @previous_touch = false
      @touch.release = 1
    else
      @touch.release = 0

    @gamepad.update()
    @keyboard.update()
    try
      @vm.context.global.system.inputs.gamepad = if @gamepad.count>0 then 1 else 0
    catch err

    return

  getAssetURL:(asset)->
    @url+"assets/"+asset+".glb"
