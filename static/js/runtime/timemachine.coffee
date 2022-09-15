class @TimeMachine
  constructor:(@runtime)->
    @history = []
    @record_index = 0
    @replay_position = 0
    @recording = false
    @max_length = 60*30
    @record_length = 0

    @loop_length = 60*4

  step:()->
    if @recording
      try
        if @replay_position != 0
          histo = []
          start = @record_length
          end = @replay_position+1
          for i in [start..end] by -1
            index = (@record_index-i+@max_length)%@max_length
            histo.push @history[index]

          if @looping
            @loop_start = @loop_length
          @history = histo
          @record_index = @history.length
          @record_length = @history.length
          @replay_position = 0

        @history[@record_index++] = @storableHistory(@runtime.vm.context.global)
        @record_length = Math.min(@record_length+1,@max_length)
        if @record_index>=@max_length
          @record_index = 0

        @sendStatus()
      catch err
        console.error err

  messageReceived:(data)->
    switch data.command
      when "start_recording"
        if not @recording
          @recording = true
          @record_index = 0
          @replay_position = 0
          @record_length = 0
          @history = []
          @sendStatus()

      when "stop_recording"
        if @recording
          @recording = false
          @sendStatus()

      when "step_backward" then @stepBackward()
      when "step_forward" then @stepForward()

      when "replay_position"
        pos = Math.round(data.position)
        @replay_position = Math.max(2,Math.min(@record_length-1,pos))
        if @looping
          @loop_start = @replay_position
          @loop_index = 0
        @replay()
        @sendStatus()

      when "start_looping"
        return if @record_length == 0
        @looping = true
        @recording = false
        @loop_start = Math.max(@replay_position,1)
        @loop_index = 0
        @loop()

      when "stop_looping"
        @stopLooping()

  stopLooping:()->
    if @looping
      @looping = false
      @replay_position = @loop_start
      @sendStatus()

  loop:()->
    return if not @looping
    requestAnimationFrame ()=>@loop()

    if @loop_index == 0
      @replay_position = @loop_start
      @replay(true)
      @loop_index += 1
    else
      @loop_index += 1

      if @loop_index>@loop_length
        @loop_index = 0
      @replay_position = @loop_start-@loop_index

      @replayControls()
      @runtime.updateCall()
      @runtime.drawCall()
      @runtime.watchStep()
      @resetControls()
    @sendStatus()

  stepBackward:()->
    return if @replay_position+1>=@record_length
    @stopLooping()
    @replay_position += 1
    @replay()
    @sendStatus()

  stepForward:()->
    return if @replay_position<=1
    @stopLooping()
    @replay_position--
    @replay()
    @sendStatus()


  replayControls:()->
    return if @replay_position>=@record_length
    return if @replay_position<=0

    index = (@record_index-@replay_position+@max_length)%@max_length
    @copyGlobal @history[index].keyboard, @runtime.vm.context.global.keyboard
    @copyGlobal @history[index].gamepad, @runtime.vm.context.global.gamepad
    @copyGlobal @history[index].touch, @runtime.vm.context.global.touch
    @copyGlobal @history[index].mouse, @runtime.vm.context.global.mouse

  resetControls:()->
    @runtime.keyboard.reset()
    touch = @runtime.vm.context.global.touch
    touch.touching = 0
    touch.touches = []
    mouse = @runtime.vm.context.global.mouse
    mouse.pressed = 0
    mouse.left = 0
    mouse.right = 0
    mouse.middle = 0

  replay:(clone = false)->
    index = (@record_index-@replay_position+@max_length)%@max_length
    @copyGlobal((if clone then @storableHistory(@history[index]) else @history[index]),@runtime.vm.context.global)
    #@runtime.vm.context.global = if clone then @storableHistory(@history[index]) else @history[index]
    #@runtime.vm.context.meta.global = @runtime.vm.context.global
    #@runtime.vm.context.object = @runtime.vm.context.global
    #@runtime.vm.context.local = @runtime.vm.context.global
    @runtime.vm.call("draw")
    @runtime.watchStep()

  copyGlobal:(source,dest)->
    for key,value of source
      continue if key in ["keyboard","gamepad","touch","mouse"]
      if (not Routine? or value not instanceof Routine) and value not instanceof Program.Function and typeof value != "function" and not value.classname?
        dest[key] = value

    for key of dest
      if not source[key]?
        delete dest[key]

    return

  sendStatus:()->
    @runtime.listener.postMessage
      name: "time_machine"
      command: "status"
      length: @record_length
      head: @record_length-@replay_position
      max: @max_length

  storableHistory:(value)->
    global = @runtime.vm.context.global
    @excluded = [
      global.screen
      global.system
      #global.keyboard
      global.audio
      #global.gamepad
      #global.touch
      #global.mouse
      global.sprites
      global.maps
      global.sounds
      global.music
      global.assets
      global.asset_manager
      global.fonts
      global.storage
      window
    ]
    # for key,value of window
    #   @excluded.push value

    @excluded.push global.PIXI if global.PIXI?
    @excluded.push global.BABYLON if global.BABYLON?
    @excluded.push global.M2D if global.M2D?
    @excluded.push global.M3D if global.M3D?
    @excluded.push global.Matter if global.Matter?
    @excluded.push global.CANNON if global.CANNON?

    @excluded.push global.Object if global.Object?
    @excluded.push global.List if global.List?
    @excluded.push global.String if global.String?
    @excluded.push global.Number if global.Number?
    @excluded.push global.Function if global.Function?
    @excluded.push global.random if global.random?

    refs = []
    clones = []
    @makeStorableObject(value,refs,clones)

  makeStorableObject:(value,refs,clones)->
    return value if not value?
    if typeof value == "function" or value instanceof Program.Function or Routine? and value instanceof Routine
      value
    else if typeof value == "object"
      return value if @excluded.indexOf(value)>=0
      return value if value instanceof Sprite or value instanceof MicroMap or value instanceof msImage or value instanceof MicroSound
      return value if value.classname?
      index = refs.indexOf(value)
      if index>=0
        return clones[index]

      if Array.isArray(value)
        res = []
        refs.push value
        clones.push res
        for v,i in value
          v = @makeStorableObject(v,refs,clones)
          if v?
            res[i] = v

        res
      else
        res = {}
        refs.push value
        clones.push res
        for key,v of value
          v = @makeStorableObject(v,refs,clones)
          if v?
            res[key] = v

        res
    else
      value
