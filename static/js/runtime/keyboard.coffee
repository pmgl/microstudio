class @Keyboard
  constructor:()->
    document.addEventListener "keydown",(event)=>@keydown(event)
    document.addEventListener "keyup",(event)=>@keyup(event)
    @keyboard =
      press: {}
      release: {}

    @previous = {}

  convertCode:(code)->
    res = ""
    low = false
    for i in [0..code.length-1]
      c = code.charAt(i)
      if c == c.toUpperCase() and low
        res += "_"
        low = false
      else
        low = true
      res += c.toUpperCase()
    res

  keydown:(event)->
    event.preventDefault()
    #console.info event
    code = event.code
    key = event.key

    @keyboard[@convertCode(code)] = 1
    @keyboard[key.toUpperCase()] = 1

    @updateDirectional()

  keyup:(event)->
    #console.info event
    code = event.code
    key = event.key

    @keyboard[@convertCode(code)] = 0
    @keyboard[key.toUpperCase()] = 0

    @updateDirectional()

  updateDirectional:()->
    @keyboard.UP = @keyboard.KEY_W or @keyboard.ARROW_UP
    @keyboard.DOWN = @keyboard.KEY_S or @keyboard.ARROW_DOWN
    @keyboard.LEFT = @keyboard.KEY_A or @keyboard.ARROW_LEFT
    @keyboard.RIGHT = @keyboard.KEY_D or @keyboard.ARROW_RIGHT

  update:()->
    for key of @keyboard.press
      @keyboard.press[key] = 0

    for key of @keyboard.release
      @keyboard.release[key] = 0

    for key of @previous
      if @previous[key] and not @keyboard[key]
        @keyboard.release[key] = 1

    for key of @keyboard
      continue if key == "press" or key == "release"
      if @keyboard[key] and not @previous[key]
        @keyboard.press[key] = 1

    for key of @previous
      @previous[key] = 0

    for key of @keyboard
      continue if key == "press" or key == "release"
      @previous[key] = @keyboard[key]

    return
