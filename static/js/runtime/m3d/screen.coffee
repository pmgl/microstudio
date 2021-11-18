class @Screen
  constructor:(@runtime)->
    @canvas = document.createElement "canvas"
    @canvas.width = 1000
    @canvas.height = 800
    @engine = new BABYLON.Engine @canvas,true

    BABYLON.engine = @engine

    @touches = {}
    @mouse =
      x: -10000
      y: -10000
      pressed: 0
      left: 0
      middle: 0
      right: 0

  getInterface:()->
    return @interface if @interface?
    screen = @
    @interface =
      width: @width
      height: @height
      render: (scene,camera)->scene.render(camera)

  updateInterface:()->
    @interface.width = @width
    @interface.height = @height

  initDraw:()->

  clear:()->

  resize:()->
    cw = window.innerWidth
    ch = window.innerHeight

    ratio = {
      "4x3": 4/3
      "16x9": 16/9
      "2x1": 2/1
      "1x1": 1/1
      ">4x3": 4/3
      ">16x9": 16/9
      ">2x1": 2/1
      ">1x1": 1/1
    }[@runtime.aspect]

    min = @runtime.aspect.startsWith(">")

    if ratio?
      if min
        switch @runtime.orientation
          when "portrait"
            ratio = Math.max(ratio,ch/cw)
          when "landscape"
            ratio = Math.max(ratio,cw/ch)
          else
            if ch>cw
              ratio = Math.max(ratio,ch/cw)
            else
              ratio = Math.max(ratio,cw/ch)

      switch @runtime.orientation
        when "portrait"
          r = Math.min(cw,ch/ratio)/cw
          w = cw*r
          h = cw*r*ratio

        when "landscape"
          r = Math.min(cw/ratio,ch)/ch
          w = ch*r*ratio
          h = ch*r

        else
          if cw>ch
            r = Math.min(cw/ratio,ch)/ch
            w = ch*r*ratio
            h = ch*r
          else
            r = Math.min(cw,ch/ratio)/cw
            w = cw*r
            h = cw*r*ratio
    else
      w = cw
      h = ch

    @canvas.style["margin-top"] = Math.round((ch-h)/2)+"px"
    @canvas.style.width = Math.round(w)+"px"
    @canvas.style.height = Math.round(h)+"px"

    @camera_aspect = w/h
    @update_camera = true

    @engine.resize true

  render:(scene,camera)->
    @renderer.render scene,camera

  startControl:(@element)->
    @canvas.addEventListener "touchstart", (event) => @touchStart(event)
    @canvas.addEventListener "touchmove", (event) => @touchMove(event)
    document.addEventListener "touchend" , (event) => @touchRelease(event)
    document.addEventListener "touchcancel" , (event) => @touchRelease(event)

    @canvas.addEventListener "mousedown", (event) => @mouseDown(event)
    @canvas.addEventListener "mousemove", (event) => @mouseMove(event)
    document.addEventListener "mouseup", (event) => @mouseUp(event)

    @ratio = devicePixelRatio

  touchStart:(event)->
    event.preventDefault()
    event.stopPropagation()
    b = @canvas.getBoundingClientRect()
    for i in [0..event.changedTouches.length-1] by 1
      t = event.changedTouches[i]
      min = Math.min @canvas.clientWidth,@canvas.clientHeight
      x = (t.clientX-b.left-@canvas.clientWidth/2)/min*200
      y = (@canvas.clientHeight/2-(t.clientY-b.top))/min*200
      @touches[t.identifier] =
        x: x
        y: y
      @mouse.x = x
      @mouse.y = y
      @mouse.pressed = 1
      @mouse.left = 1
    false

  touchMove:(event)->
    event.preventDefault()
    event.stopPropagation()
    b = @canvas.getBoundingClientRect()
    for i in [0..event.changedTouches.length-1] by 1
      t = event.changedTouches[i]
      if @touches[t.identifier]?
        min = Math.min @canvas.clientWidth,@canvas.clientHeight
        x = (t.clientX-b.left-@canvas.clientWidth/2)/min*200
        y = (@canvas.clientHeight/2-(t.clientY-b.top))/min*200
        @touches[t.identifier].x = x
        @touches[t.identifier].y = y
        @mouse.x = x
        @mouse.y = y
    false

  touchRelease:(event)->
    for i in [0..event.changedTouches.length-1] by 1
      t = event.changedTouches[i]
      x = (t.clientX-@canvas.offsetLeft)*@ratio
      y = (t.clientY-@canvas.offsetTop)*@ratio
      delete @touches[t.identifier]

      @mouse.pressed = 0
      @mouse.left = 0
      @mouse.right = 0
      @mouse.middle = 0
    false

  mouseDown:(event)->
    @mousepressed = true
    b = @canvas.getBoundingClientRect()
    min = Math.min @canvas.clientWidth,@canvas.clientHeight
    x = (event.clientX-b.left-@canvas.clientWidth/2)/min*200
    y = (@canvas.clientHeight/2-(event.clientY-b.top))/min*200
    @touches["mouse"] =
      x: x
      y: y
    #console.info @touches["mouse"]

    @mouse.x = x
    @mouse.y = y
    switch event.button
      when 0 then @mouse.left = 1
      when 1 then @mouse.middle = 1
      when 2 then @mouse.right = 1

    @mouse.pressed = Math.min(1,@mouse.left+@mouse.right+@mouse.middle)
    false

  mouseMove:(event)->
    event.preventDefault()
    b = @canvas.getBoundingClientRect()
    min = Math.min @canvas.clientWidth,@canvas.clientHeight
    x = (event.clientX-b.left-@canvas.clientWidth/2)/min*200
    y = (@canvas.clientHeight/2-(event.clientY-b.top))/min*200
    if @touches["mouse"]?
      @touches["mouse"].x = x
      @touches["mouse"].y = y

    @mouse.x = x
    @mouse.y = y

    false

  mouseUp:(event)->
    delete @touches["mouse"]

    b = @canvas.getBoundingClientRect()
    min = Math.min @canvas.clientWidth,@canvas.clientHeight
    x = (event.clientX-b.left-@canvas.clientWidth/2)/min*200
    y = (@canvas.clientHeight/2-(event.clientY-b.top))/min*200

    @mouse.x = x
    @mouse.y = y
    switch event.button
      when 0 then @mouse.left = 0
      when 1 then @mouse.middle = 0
      when 2 then @mouse.right = 0

    @mouse.pressed = Math.min(1,@mouse.left+@mouse.right+@mouse.middle)

    false
