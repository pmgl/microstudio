class @Watcher
  constructor:(@runtime)->
    @vm = @runtime.vm


  update:()->
    if @watching_variables
      @step()

  watch:(variables)->
    @watching = true
    @watching_variables = variables
    @exclusion_list = [
      @vm.context.global.screen
      @vm.context.global.system
      @vm.context.global.keyboard
      @vm.context.global.audio
      @vm.context.global.gamepad
      @vm.context.global.touch
      @vm.context.global.mouse
      @vm.context.global.sprites
      @vm.context.global.maps
      @vm.context.global.sounds
      @vm.context.global.music
      @vm.context.global.assets
      @vm.context.global.asset_manager
      @vm.context.global.fonts
      @vm.context.global.storage
    ]
    @exclusion_list.push(@vm.context.global.Function) if @vm.context.global.Function?
    @exclusion_list.push(@vm.context.global.String) if @vm.context.global.String?
    @exclusion_list.push(@vm.context.global.List) if @vm.context.global.List?
    @exclusion_list.push(@vm.context.global.Number) if @vm.context.global.Number?
    @exclusion_list.push(@vm.context.global.Object) if @vm.context.global.Object?
    @exclusion_list.push(@vm.context.global.Image) if @vm.context.global.Image?
    @exclusion_list.push(@vm.context.global.Sound) if @vm.context.global.Sound?
    @exclusion_list.push(@vm.context.global.Sprite) if @vm.context.global.Sprite?
    @exclusion_list.push(@vm.context.global.Map) if @vm.context.global.Map?
    @exclusion_list.push(@vm.context.global.random) if @vm.context.global.random?
    @exclusion_list.push(@vm.context.global.print) if @vm.context.global.print?
    @step()

  stop:()->
    @watching = false

  step:(variables=@watching_variables)->
    return if not @watching
    res = {}
    for v in variables
      if v == "global"
        value = @vm.context.global
      else
        vs = v.split(".")
        value = @vm.context.global
        index = 0
        while index < vs.length and value?
          value = value[vs[index++]]

      if value? and @exclusion_list.indexOf(value) < 0
        res[v] = @exploreValue(value,1,10)

    @runtime.listener.postMessage
      name: "watch_update"
      data: res

  exploreValue:(value,depth=1,array_max=10)->
    if not value?
      return
        type: "number"
        value: 0
    if typeof value == "function" or value instanceof Program.Function or Routine? and value instanceof Routine
      return
        type: "function"
        value: ""
    else if typeof value == "object"
      if Array.isArray(value)
        if depth == 0 then return
          type: "list"
          value: ""
          length: value.length

        res = []
        for v,i in value
          break if i>=100
          if @exclusion_list.indexOf(v) < 0
            res[i] = @exploreValue(v,depth-1,array_max)
        res
      else
        if depth == 0
          v = ""
          if value.classname then v = "class "+value.classname
          if value.class? and value.class.classname? then v = value.class.classname
          return
            type: "object"
            value: v

        res = {}
        for key,v of value
          if @exclusion_list.indexOf(v) < 0
            res[key] = @exploreValue(v,depth-1,array_max)
        res
    else if typeof value == "string"
      return
        type: "string"
        value: if value.length < 43 then value else value.substring(0,40)+"..."
    else if typeof value == "number"
      return
        type: "number"
        value: if isFinite(value) then value else 0
    else if typeof value == "boolean"
      return
        type: "number"
        value: if value then 1 else 0
    else
      return
        type: "unknown"
        value: value
