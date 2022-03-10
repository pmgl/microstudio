class @TimeMachine
  constructor:(@runtime)->
    @history = []
    @record_index = 0
    @replay_position = 0
    @recording = false
    @max_length = 60*30
    @record_length = 0

    @loop_length = 60*3

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
      @runtime.updateCall()
      @runtime.drawCall()
      if @runtime.watching_variables
        @runtime.watchStep()
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

  replay:(clone = false)->
    index = (@record_index-@replay_position+@max_length)%@max_length
    @copyGlobal((if clone then @storableHistory(@history[index]) else @history[index]),@runtime.vm.context.global)
    #@runtime.vm.context.global = if clone then @storableHistory(@history[index]) else @history[index]
    #@runtime.vm.context.meta.global = @runtime.vm.context.global
    #@runtime.vm.context.object = @runtime.vm.context.global
    #@runtime.vm.context.local = @runtime.vm.context.global
    @runtime.vm.call("draw")
    if @runtime.watching_variables
      @runtime.watchStep()

  copyGlobal:(source,dest)->
    for key,value of source
      if value not instanceof Program.Function and typeof value != "function" and not value.classname?
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
      global.keyboard
      global.audio
      global.gamepad
      global.touch
      global.mouse
      global.sprites
      global.maps
      global.sounds
      global.music
      global.assets
      global.asset_manager
      global.fonts
      global.storage
    ]
    @excluded.push global.PIXI if global.PIXI?
    @excluded.push global.BABYLON if global.BABYLON?
    @excluded.push global.M2D if global.M2D?
    @excluded.push global.M3D if global.M3D?
    @excluded.push global.Matter if global.Matter?
    @excluded.push global.CANNON if global.CANNON?

    refs = []
    clones = []
    @makeStorableObject(value,refs,clones)

  makeStorableObject:(value,refs,clones)->
    return value if not value?
    if typeof value == "function" or value instanceof Program.Function or Routine? and value instanceof Routine
      value
    else if typeof value == "object"
      return value if @excluded.indexOf(value)>=0
      return value if value instanceof Sprite or value instanceof MicroMap
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
