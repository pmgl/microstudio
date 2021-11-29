class @MicroVM
  constructor:(meta={},global = {},@namespace = "/microstudio")->
    if not meta.print?
      meta.print = (text)->
        if typeof text == "object"
          text = Program.toString text
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
            result = window.prompt(text)
            if callback? and callback instanceof Program.Function
              args = [(if result? then 1 else 0),result]
              @call(callback,args)
          ),0

      say:(text)=>
        setTimeout (()=>window.alert(text)),0

    try
      global.system.inputs.keyboard = if window.matchMedia("(pointer:fine)").matches then 1 else 0
      global.system.inputs.mouse = if window.matchMedia("(any-hover:none)").matches then 0 else 1
    catch err


    global.storage = @createStorageService()

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

  setMeta:(key,value)->
    @context.meta[key] = value

  setGlobal:(key,value)->
    @context.global[key] = value

  run:(@program,timeout=3000,filename="")->
    @error_info = null
    @context.timeout = Date.now()+timeout
    @context.stack_size = 0

    try
      res = @runner.run @program,filename
      @checkStorage()
      return Program.toString res
    catch err
      if @context.location? and @context.location.token?
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
      @checkStorage()

  call:(name,args=[],timeout=3000)->
    @error_info = null
    @context.timeout = Date.now()+timeout
    @context.stack_size = 0

    try
      res = @runner.call name,args
      @checkStorage()
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
      @checkStorage()

  createStorageService:()->
    @storage = {}
    try
      s = localStorage.getItem("ms#{@namespace}")
      if s
        @storage = JSON.parse(s)
    catch err

    return {
      set: (name,value)=>
        value = @storableObject(value)
        if name? and value?
          @storage[name] = value
          @write_storage = true
        value

      get: (name)=>
        if name?
          @storage[name]
        else
          0
    }

  checkStorage:()->
    if @write_storage
      @write_storage = false
      try
        localStorage.setItem("ms#{@namespace}",JSON.stringify(@storage))
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
    if typeof value == "function" or value instanceof Program.Function
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
