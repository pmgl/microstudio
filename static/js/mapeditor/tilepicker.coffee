class @TilePicker
  constructor:(@mapeditor)->
    @element = document.getElementById("map-tilepicker")

    window.addEventListener "resize",(event)=>
      @update()

    @zoom = 1
    @offset_x = 0
    @offset_y = 0

    document.getElementById("mapbar").addEventListener "keydown",(e)=>
      if e.keyCode == 32
        @space_pressed = true
        if @canvas?
          @canvas.style.cursor = "grab"
        e.preventDefault()

    document.addEventListener "keyup",(e)=>
      if e.keyCode == 32
        @space_pressed = false
        if @canvas?
          @canvas.style.cursor = "crosshair"

  update:()->
    @map = @mapeditor.mapview.map
    sprite = @mapeditor.mapview.sprite

    if @map? and sprite? and @mapeditor.app.project?
      @sprite = @mapeditor.app.project.getSprite sprite
      if @sprite? and (@sprite.width>@map.block_width or @sprite.height>@map.block_height)
        if @sprite.tile_selection?
          @selection = @sprite.tile_selection
        else
          @selection =
            x: 0
            y: 0
            w: 1
            h: 1

        @zoom = if @sprite.tile_zoom? then @sprite.tile_zoom else 1
        @offset_x = if @sprite.tile_offset_x? then @sprite.tile_offset_x else 0
        @offset_y = if @sprite.tile_offset_y? then @sprite.tile_offset_y else 0

        ww = Math.max(1,@element.getBoundingClientRect().width-20)
        r = ww/Math.max(@sprite.width,@sprite.height)
        @ratio = r
        w = r*@sprite.width
        h = r*@sprite.height
        if not @canvas?
          @canvas = document.createElement "canvas"
          @element.appendChild @canvas
          @canvas.addEventListener "mousedown", (event) => @mouseDown(event)
          @canvas.addEventListener "mousemove", (event) => @mouseMove(event)
          @canvas.addEventListener "mouseenter", (event) => @mouseEnter(event)
          @canvas.addEventListener "mouseout", (event) => @mouseOut(event)
          document.addEventListener "mouseup", (event) => @mouseUp(event)
          @canvas.addEventListener("mousewheel", ((e)=>@mouseWheel(e)), false)
          @canvas.addEventListener("DOMMouseScroll", ((e)=>@mouseWheel(e)), false)


        @canvas.width = w
        @canvas.height = h
        document.getElementById("map-sprite-list").style.top = "#{h+20}px"
        context = @canvas.getContext "2d"
        context.save()
        if @zoom
          context.translate(-@offset_x,-@offset_y)
          context.scale(@zoom,@zoom)
        context.imageSmoothingEnabled = false
        context.drawImage @sprite.frames[0].getCanvas(),0,0,w,h
        bw = @map.block_width*r
        bh = @map.block_height*r
        context.lineWidth = .5
        context.strokeStyle = "rgba(0,0,0,.5)"
        for i in [0..w] by bw*2
          context.strokeRect(i+.25,-2,bw,h+4)

        for i in [0..h] by bh*2
          context.strokeRect(-2,i+.25,w+4,bh)

        context.strokeStyle = "rgba(255,255,255,.5)"
        for i in [0..w] by bw*2
          context.strokeRect(i-.25,-2,bw,h+4)

        for i in [0..h] by bh*2
          context.strokeRect(-2,i-.25,w+4,bh)

        if @hover?
          context.save()
          context.lineWidth = 2
          context.strokeStyle = "#CCC"
          context.shadowOpacity = 1
          context.shadowBlur = 4
          context.shadowColor = "#000"
          context.strokeRect @hover.x*bw-1,@hover.y*bh-1,bw+2,bh+2
          context.restore()

        if @selection?
          context.save()
          context.lineWidth = 3
          context.strokeStyle = "#FFF"
          context.shadowOpacity = 1
          context.shadowBlur = 4
          context.shadowColor = "#000"
          context.strokeRect @selection.x*bw,@selection.y*bh,@selection.w*bw,@selection.h*bh
          context.restore()
        context.restore()

        @canvas.style.display = "inline-block"
        document.querySelector(".mapbar").scrollTo(0,0)
        return

    if @canvas?
      @selection = null
      @canvas.style.display = "none"
    document.getElementById("map-sprite-list").style.top = "0px"

  mouseDown:(event)->
    @mousedown = true

    b = @canvas.getBoundingClientRect()
    x = (event.clientX-b.left)
    y = (event.clientY-b.top)

    if @space_pressed
      @drag_start_x = x
      @drag_start_y = y
      @offset_start_x = @offset_x
      @offset_start_y = @offset_y
      @drag_view = true
    else
      @drag_view = false
      bw = @ratio*@map.block_width*@zoom
      bh = @ratio*@map.block_height*@zoom

      x = Math.floor((x+@offset_x)/bw)
      y = Math.floor((y+@offset_y)/bh)

      @selection =
        x: x
        y: y
        w: 1
        h: 1

      @sprite.tile_selection = @selection

      @selection_start_x = x
      @selection_start_y = y

      @update()

      @mouseMove(event)

  mouseUp:(event)->
    @mousedown = false

  mouseMove:(event)->
    b = @canvas.getBoundingClientRect()
    x = (event.clientX-b.left)
    y = (event.clientY-b.top)

    if @drag_view and @mousedown
      @offset_x = @offset_start_x-(x-@drag_start_x)
      @offset_y = @offset_start_y-(y-@drag_start_y)
      @fixOffset()
      @update()
    else
      bw = @ratio*@map.block_width*@zoom
      bh = @ratio*@map.block_height*@zoom

      x = Math.floor((x+@offset_x)/bw)
      y = Math.floor((y+@offset_y)/bh)

      if @mousedown
        sx = if x<@selection_start_x then x else @selection_start_x
        sy = if y<@selection_start_y then y else @selection_start_y
        sw = Math.max(x+1-@selection_start_x,@selection_start_x-x+1)
        sh = Math.max(y+1-@selection_start_y,@selection_start_y-y+1)

        tw = Math.floor(@sprite.width/@map.block_width)
        th = Math.floor(@sprite.height/@map.block_height)
        sx = Math.max(0,Math.min(tw-sw,sx))
        sy = Math.max(0,Math.min(th-sh,sy))
        sw = Math.max(1,Math.min(tw-sx,sw))
        sh = Math.max(1,Math.min(th-sy,sh))

        if sx != @selection.x or sy != @selection.y or sw != @selection.w or sh != @selection.h
          @selection.x = sx
          @selection.y = sy
          @selection.w = sw
          @selection.h = sh
          @update()

      else if not @hover? or x != @hover.x or y != @hover.y
        @hover = {} if not @hover?
        @hover.x = x
        @hover.y = y
        @update()

  mouseEnter:(event)->
    document.getElementById("mapbar").focus()

  mouseOut:(event)->
    if @hover?
      @hover = null
      @update()

  mouseWheel:(e)->
    e.preventDefault()
    @next_wheel_action = Date.now() if not @next_wheel_action?

    return if Date.now()<@next_wheel_action
    @next_wheel_action = Date.now()+50

    b = @canvas.getBoundingClientRect()
    x = (event.clientX-b.left)
    y = (event.clientY-b.top)

    fx = (@offset_x+x)/(@canvas.width*@zoom)
    fy = (@offset_y+y)/(@canvas.height*@zoom)

    if e.wheelDelta < 0 or e.detail > 0
      @zoom = Math.max(1,@zoom/1.1)
    else
      @zoom = Math.min(4,@zoom*1.1)

    @offset_x = fx*@canvas.width*@zoom-x
    @offset_y = fy*@canvas.height*@zoom-y

    @fixOffset()

    @update()

  fixOffset:()->
    return if not @canvas?
    w = @canvas.width
    h = @canvas.height
    @offset_x = Math.max(0,Math.min(w*(@zoom-1),@offset_x))
    @offset_y = Math.max(0,Math.min(h*(@zoom-1),@offset_y))

    if @sprite?
      @sprite.tile_zoom = @zoom
      @sprite.tile_offset_x = @offset_x
      @sprite.tile_offset_y = @offset_y
