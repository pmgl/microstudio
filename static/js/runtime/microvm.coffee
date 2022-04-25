class @MicroVM
  constructor:(meta={},global = {},@namespace = "/microstudio",@preserve_ls = false)->
    if not meta.print?
      meta.print = (text)=>
        if typeof text == "object" and @runner?
          text = @runner.toString text
        console.info(text)


    Array.prototype.insert = (e)->
      this.splice(0,0,e)
      e

    Array.prototype.insertAt = (e,i)->
      if i>=0 and i<this.length
        this.splice(i,0,e)
      else
        this.push(e)
      e

    Array.prototype.remove = (i)->
      if i>=0 and i<this.length
        this.splice(i,1)[0]
      else
        0

    Array.prototype.removeAt = (i)->
      if i>=0 and i<this.length
        this.splice(i,1)[0]
      else
        0

    Array.prototype.removeElement = (e)->
      index = this.indexOf(e)
      if index>=0
        this.splice(index,1)[0]
      else
        0

    Array.prototype.contains = (e)->
      if this.indexOf(e)>=0 then 1 else 0

    meta.round = (x)->Math.round(x)
    meta.floor = (x)->Math.floor(x)
    meta.ceil = (x)->Math.ceil(x)
    meta.abs = (x)->Math.abs(x)

    meta.min = (x,y)->Math.min(x,y)
    meta.max = (x,y)->Math.max(x,y)

    meta.sqrt = (x)->Math.sqrt(x)
    meta.pow = (x,y)->Math.pow(x,y)

    meta.sin = (x)->Math.sin(x)
    meta.cos = (x)->Math.cos(x)
    meta.tan = (x)->Math.tan(x)
    meta.acos = (x)->Math.acos(x)
    meta.asin = (x)->Math.asin(x)
    meta.atan = (x)->Math.atan(x)
    meta.atan2 = (y,x)->Math.atan2(y,x)

    meta.sind = (x)->Math.sin(x/180*Math.PI)
    meta.cosd = (x)->Math.cos(x/180*Math.PI)
    meta.tand = (x)->Math.tan(x/180*Math.PI)
    meta.acosd = (x)->Math.acos(x)*180/Math.PI
    meta.asind = (x)->Math.asin(x)*180/Math.PI
    meta.atand = (x)->Math.atan(x)*180/Math.PI
    meta.atan2d = (y,x)->Math.atan2(y,x)*180/Math.PI

    meta.log = (x)->Math.log(x)
    meta.exp = (x)->Math.exp(x)

    meta.random = new Random(0)

    meta.PI = Math.PI
    meta.true = 1
    meta.false = 0

    global.system =
      time: Date.now
      language: navigator.language
      inputs:
        keyboard: 1
        mouse: 1
        touch: if "ontouchstart" of window then 1 else 0
        gamepad: 0
      prompt: (text,callback)=>
        setTimeout (()=>
            global.mouse.pressed = 0
            global.touch.touching = 0

            result = window.prompt(text)
            if callback? and typeof callback == "function"
              args = [(if result? then 1 else 0),result]
              @context.timeout = Date.now()+1000
              callback.apply(null,args)
          ),0

      say:(text)=>
        setTimeout (()=>window.alert(text)),0

    try
      global.system.inputs.keyboard = if window.matchMedia("(pointer:fine)").matches then 1 else 0
      global.system.inputs.mouse = if window.matchMedia("(any-hover:none)").matches then 0 else 1
    catch err


    @storage_service = @createStorageService()
    global.storage = @storage_service.api

    meta.global = global

    @context =
      meta: meta
      global: global
      local: global
      object: global
      breakable: 0
      continuable: 0
      returnable: 0
      stack_size: 0

    ctx = @context
    Array.prototype.sortList = (f)->
      if f? and f instanceof Program.Function
        funk = (a,b)->f.call(ctx,[a,b],true)
      else if f? and typeof f == "function"
        funk = f
      this.sort(funk)

    @clearWarnings()
    @runner = new Runner @

  clearWarnings:()->
    @context.warnings =
      using_undefined_variable: {}
      assigning_field_to_undefined: {}
      invoking_non_function: {}
      assigning_api_variable: {}

  setMeta:(key,value)->
    @context.meta[key] = value

  setGlobal:(key,value)->
    @context.global[key] = value

  run:(@program,timeout=3000,filename="",callback)->
    @error_info = null
    @context.timeout = Date.now()+timeout
    @context.stack_size = 0

    try
      res = @runner.run @program,filename,callback
      @storage_service.check()
      if res?
        return @runner.toString res
      else
        return null
    catch err
      if err.type? and err.line? and err.error?
         @error_info = err
      else if @context.location? and @context.location.token?
        @error_info =
          error: err
          file: filename
          line: @context.location.token.line
          column: @context.location.token.column
        console.info "Error at line: #{@context.location.token.line} column: #{@context.location.token.column}"
      else
        @error_info =
          error: err
          file: filename

      console.error err
      @storage_service.check()

  call:(name,args=[],timeout=3000)->
    @error_info = null
    @context.timeout = Date.now()+timeout
    @context.stack_size = 0

    try
      res = @runner.call name,args
      @storage_service.check()
      res
    catch err
      console.error err
      if @context.location? and @context.location.token?
        @error_info =
          error: err
          line: @context.location.token.line
          column: @context.location.token.column
          file: @context.location.token.file
      else
        @error_info =
          error: err

      if @context.location? and @context.location.token?
        console.info "Error at line: #{@context.location.token.line} column: #{@context.location.token.column}"
      @storage_service.check()

  createStorageService:()->
    try
      ls = window.localStorage
    catch error # in incognito mode, embedded by an iframe, localStorage isn't available
      console.info "localStorage not available"
      return service =
        api:
          set: ()->
          get: ()-> 0
        check:()->

    if not @preserve_ls
      try
        delete window.localStorage
      catch err

    storage = {}
    write_storage = false
    namespace = @namespace

    try
      s = ls.getItem("ms#{namespace}")
      if s
        storage = JSON.parse(s)
    catch err

    service =
      api:
        set: (name,value)=>
          value = @storableObject(value)
          if name? and value?
            storage[name] = value
            write_storage = true
          value

        get:(name)=>
          if name?
            if storage[name]? then storage[name] else 0
          else
            0

      check:()=>
        if write_storage
          write_storage = false
          try
            ls.setItem("ms#{namespace}",JSON.stringify(storage))
          catch err

  storableObject:(value)->
    referenced = [
      @context.global.screen
      @context.global.system
      @context.global.keyboard
      @context.global.audio
      @context.global.gamepad
      @context.global.touch
      @context.global.mouse
      @context.global.sprites
      @context.global.maps
    ]

    @makeStorableObject(value,referenced)

  makeStorableObject:(value,referenced)->
    return value if not value?
    if typeof value == "function" or value instanceof Program.Function or (Routine? and value instanceof Routine)
      undefined
    else if typeof value == "object"
      return undefined if referenced.indexOf(value)>=0
      referenced = referenced.slice()
      referenced.push(value)
      if Array.isArray(value)
        res = []
        for v,i in value
          v = @makeStorableObject(v,referenced)
          if v?
            res[i] = v
        res
      else
        res = {}
        for key,v of value
          v = @makeStorableObject(v,referenced)
          if v?
            res[key] = v
        res
    else
      value
