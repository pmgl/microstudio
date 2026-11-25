class @SpriteView
  constructor:(@editor)->
    @canvas = document.querySelector "#spriteeditor canvas"
    @sprite = new Sprite(32,32)
    @viewport = new CanvasViewport document.getElementById("spriteeditor"),@canvas,@

    @canvas.addEventListener "touchstart", (event) =>
      if event.touches? and event.touches[0]?
        event.preventDefault() # prevents a mousedown event from being triggered
        event.touches[0].stopPropagation = ()->event.stopPropagation()
        @mouseDown(event.touches[0])

    document.addEventListener "touchmove", (event) =>
      @mouseMove(event.touches[0]) if event.touches? and event.touches[0]?

    document.addEventListener "touchend" , (event) => @mouseUp()
    @canvas.addEventListener "touchcancel" , (event) => @mouseOut()

    @canvas.addEventListener "mousedown", (event) => @mouseDown(event)
    document.addEventListener "mousemove", (event) => @mouseMove(event)
    @canvas.addEventListener "mouseout", (event) => @mouseOut(event)
    document.addEventListener "mouseup", (event) => @mouseUp(event)
    @canvas.addEventListener "contextmenu",(event)=>event.preventDefault()

    @canvas.addEventListener "mouseenter", (event) => @mouseEnter(event)

    @brush_opacity = 1
    @brush_type = "paint"
    @brush_size = 1

    @mouse_over = false
    @mouse_x = 0
    @mouse_y = 0

    @pixels_drawn = 0

    window.addEventListener "resize",()=>
      @windowResized()

    @editable = false
    @tile = false
    @vsymmetry = false
    @hsymmetry = false

    document.getElementById("spriteeditor").addEventListener "keydown",(e)=>
      if e.keyCode == 18 # Alt
        document.getElementById("selection-hint-clone").classList.add "active"
      else if e.keyCode == 16 # Shift
        document.getElementById("selection-hint-move").classList.add "active"

    document.addEventListener "keyup",(e)=>
      if e.keyCode == 18 # Alt
        document.getElementById("selection-hint-clone").classList.remove "active"
      else if e.keyCode == 16 # Shift
        document.getElementById("selection-hint-move").classList.remove "active"

    document.getElementById("sprite-zoom-plus").addEventListener "click",()=>
      @viewport.zoomBy(1.25)

    document.getElementById("sprite-zoom-minus").addEventListener "click",()=>
      @viewport.zoomBy(1/1.25)

    document.getElementById("sprite-zoom-fit").addEventListener "click",()=>
      @viewport.fit()
      @viewChanged()

  setSprite:(sprite)->
    if sprite != @sprite
      if @sprite?
        @saveZoom()
        @sprite.selection = @selection

      @sprite = sprite
      @restoreZoom()

      @selection = @sprite.selection or null
      @floating_selection = null

  setCurrentFrame:(index)->
    if index != @sprite.current_frame
      @sprite.setCurrentFrame(index)
      @selection = null

  getFrame:()->
    return @sprite.frames[@sprite.current_frame]

  saveZoom:()->
    if @sprite? and @viewport.width > 0
      @sprite.zoom = @viewport.getState()
      @sprite.zoom.key = @content_key

  restoreZoom:()->
    if @sprite.zoom?
      @viewport.setState @sprite.zoom
      @content_key = @sprite.zoom.key
    else
      @content_key = null

  getContentKey:()->
    "#{@sprite.width},#{@sprite.height},#{@tile}"

  updateContent:()->
    w = @sprite.width
    h = @sprite.height
    if @tile
      @viewport.setContent -w/2,-h/2,w*2,h*2
    else
      @viewport.setContent 0,0,w,h

    key = @getContentKey()
    if key != @content_key
      @content_key = key
      @viewport.fit()

  viewChanged:()->
    if @last_mouse_event? and not @mousepressed
      pos = @getMousePosition @last_mouse_event
      @mouse_x = pos.x
      @mouse_y = pos.y
      @mouse_over = pos.inside
    @update()

  updateGrabInfo:()->
    if @viewport.isZoomedIn()
      document.getElementById("sprite-grab-info").style.display = "inline-block"
    else
      document.getElementById("sprite-grab-info").style.display = "none"

  updateCursor:()->
    if @viewport.space_pressed
      document.getElementById("sprite-grab-info").classList.add "active"
    else
      document.getElementById("sprite-grab-info").classList.remove "active"

    cursor = @viewport.getCursor()
    if cursor?
      @canvas.style.cursor = cursor
    else if @editor.tool.selectiontool and @isInSelection(@mouse_x,@mouse_y)
      @canvas.style.cursor = "move"
    else if @colorpicker and not @editor.tool.selectiontool
      @canvas.style.cursor = "url( '/img/eyedropper.svg' ) 0 24, pointer"
    else
      @canvas.style.cursor = "crosshair"

  isInSelection:(x,y)->
    @selection? and x>=@selection.x and y>=@selection.y and x<@selection.x+@selection.w and y<@selection.y+@selection.h

  getPattern:(context)->
    if not @pattern?
      c = document.createElement "canvas"
      c.width = 64
      c.height = 64
      ctx = c.getContext "2d"
      data = ctx.getImageData 0,0,c.width,1
      for line in [0..c.height-1] by 1
        for i in [0..c.width-1] by 1
          value = 128+Math.random()*64-32
          data.data[i*4] = value
          data.data[i*4+1] = value
          data.data[i*4+2] = value
          data.data[i*4+3] = 64

        ctx.putImageData data,0,line

      @pattern = context.createPattern c,"repeat"

    @pattern

  getBackgroundColor:()->
    if @editor.background_color_picker? and typeof @editor.background_color_picker.color == "string"
      @editor.background_color_picker.color
    else
      "#000"

  updateBackgroundColor:()->
    @update()

  setColor:(@color)->

  windowResized: ()->
    @update()

  showBrushSize:()->
    @show_brush_size = Date.now()+2000
    @update()

  drawFrame:(context,frame)->
    return if not frame.canvas?
    w = @sprite.width
    h = @sprite.height
    if @tile
      for i in [-1..1] by 1
        for j in [-1..1] by 1
          context.drawImage frame.canvas,i*w,j*h,w,h
    else
      context.drawImage frame.canvas,0,0,w,h

  drawGrid:(context,ax,ay,aw,ah)->
    v = @viewport
    return if v.zoom < 4

    modulo = if @sprite.width%8 == 0 then 8 else 10
    x0 = v.screenX(ax)
    y0 = v.screenY(ay)
    x1 = v.screenX(ax+aw)
    y1 = v.screenY(ay+ah)

    i0 = Math.max(Math.ceil(ax),Math.floor(v.worldLeft()))
    i1 = Math.min(Math.floor(ax+aw),Math.ceil(v.worldRight()))
    j0 = Math.max(Math.ceil(ay),Math.floor(v.worldTop()))
    j1 = Math.min(Math.floor(ay+ah),Math.ceil(v.worldBottom()))

    for i in [i0..i1] by 1
      lw = if (i%modulo+modulo)%modulo == 0 then 2 else 1
      x = Math.round(v.screenX(i))
      context.fillStyle = "rgba(0,0,0,.1)"
      context.fillRect x,y0,lw,y1-y0
      context.fillStyle = "rgba(255,255,255,.1)"
      context.fillRect x-lw,y0,lw,y1-y0

    for j in [j0..j1] by 1
      lw = if (j%modulo+modulo)%modulo == 0 then 2 else 1
      y = Math.round(v.screenY(j))
      context.fillStyle = "rgba(0,0,0,.1)"
      context.fillRect x0,y,x1-x0,lw
      context.fillStyle = "rgba(255,255,255,.1)"
      context.fillRect x0,y-lw,x1-x0,lw

    return

  update:()->
    return if not @viewport.resize()
    @updateContent()
    @updateGrabInfo()

    @brush_size = @editor.tool.getSize(@sprite)
    v = @viewport
    z = v.zoom
    context = @canvas.getContext "2d"
    v.resetTransform context
    context.clearRect 0,0,v.width,v.height
    context.imageSmoothingEnabled = false

    w = @sprite.width
    h = @sprite.height
    if @tile
      ax = -w/2
      ay = -h/2
      aw = w*2
      ah = h*2
    else
      ax = 0
      ay = 0
      aw = w
      ah = h

    x0 = v.screenX(ax)
    y0 = v.screenY(ay)
    x1 = v.screenX(ax+aw)
    y1 = v.screenY(ay+ah)

    context.save()
    context.shadowBlur = 20
    context.shadowColor = "#000"
    context.fillStyle = @getBackgroundColor()
    context.fillRect x0,y0,x1-x0,y1-y0
    context.restore()

    context.save()
    context.translate x0,y0
    context.fillStyle = @getPattern(context)
    context.fillRect 0,0,x1-x0,y1-y0
    context.restore()

    context.save()
    context.beginPath()
    context.rect x0,y0,x1-x0,y1-y0
    context.clip()
    v.setTransform context
    if @sprite.frames.length>1
      f = @sprite.frames[(@sprite.current_frame+@sprite.frames.length-1)%@sprite.frames.length]
      context.globalAlpha = .2
      @drawFrame context,f
      context.globalAlpha = 1

    @drawFrame context,@getFrame()
    context.restore()

    @drawGrid context,ax,ay,aw,ah

    if (@mouse_over or Date.now()<@show_brush_size) and @canvas.style.cursor != "move" and not v.getCursor()?
      if Date.now()<@show_brush_size
        mx = Math.floor(@sprite.width/2-1)
        my = Math.floor(@sprite.height/2-1)
      else
        mx = @mouse_x
        my = @mouse_y
      bs = Math.floor((@brush_size-1)/2)
      context.strokeStyle = "#000"
      context.lineWidth = 4
      context.beginPath()
      if @editor.tool.shape == "round"
        d = if @brush_size % 2 then 0 else .5
        context.ellipse v.screenX(mx+.5+d),v.screenY(my+.5+d),z*@brush_size/2,z*@brush_size/2,0,0,Math.PI*2,true
      else
        context.rect v.screenX(mx-bs),v.screenY(my-bs),z*@brush_size,z*@brush_size
      context.stroke()
      context.strokeStyle = "#FFF"
      context.lineWidth = 3
      context.stroke()

    if @tile
      grd = context.createLinearGradient(x0,0,x1,0)
      grd.addColorStop(0,"rgba(0,0,0,1)")
      grd.addColorStop(.25,"rgba(0,0,0,0)")
      grd.addColorStop(.75,"rgba(0,0,0,0)")
      grd.addColorStop(1,"rgba(0,0,0,1)")
      context.fillStyle = grd
      context.fillRect(x0,y0,x1-x0,y1-y0)

      grd = context.createLinearGradient(0,y0,0,y1)
      grd.addColorStop(0,"rgba(0,0,0,1)")
      grd.addColorStop(.25,"rgba(0,0,0,0)")
      grd.addColorStop(.75,"rgba(0,0,0,0)")
      grd.addColorStop(1,"rgba(0,0,0,1)")
      context.fillStyle = grd
      context.fillRect(x0,y0,x1-x0,y1-y0)

      tx = v.screenX(0)
      ty = v.screenY(0)
      context.lineWidth = 1
      context.strokeStyle = "rgba(0,0,0,.5)"
      context.strokeRect tx+.5,ty+.5,w*z,h*z
      context.strokeStyle = "rgba(255,255,255,.5)"
      context.strokeRect tx-.5,ty-.5,w*z,h*z

    if @hsymmetry
      y = v.screenY(h/2)
      context.fillStyle = "rgba(0,0,0,.5)"
      context.fillRect x0,y-2,x1-x0,4
      context.fillStyle = "rgba(255,255,255,.5)"
      context.fillRect x0,y-1.5,x1-x0,3

    if @vsymmetry
      x = v.screenX(w/2)
      context.fillStyle = "rgba(0,0,0,.5)"
      context.fillRect x-2,y0,4,y1-y0
      context.fillStyle = "rgba(255,255,255,.5)"
      context.fillRect x-1.5,y0,3,y1-y0

    if @selection? and @editor.tool.selectiontool
      sx = v.screenX(@selection.x)
      sy = v.screenY(@selection.y)
      sw = @selection.w*z
      sh = @selection.h*z
      context.save()
      context.strokeStyle = "rgba(0,0,0,.5)"
      context.lineWidth = 3
      context.strokeRect(sx,sy,sw,sh)
      context.setLineDash([4,4])
      context.strokeStyle = if @floating_selection then "#FA0" else "#FFF"
      context.lineWidth = 2
      context.strokeRect(sx,sy,sw,sh)
      context.setLineDash([])
      if @selection.w>1 or @selection.h>1
        context.font = "#{Math.max(12,Math.min(32,z))}pt Ubuntu Mono"
        context.fillStyle = "#FFF"
        context.shadowBlur = 2
        context.shadowColor = "#000"
        context.shadowOpacity = 1
        context.textAlign = "center"
        context.textBaseline = "middle"
        context.fillText "#{@selection.w} x #{@selection.h}",sx+sw/2,sy+sh/2
        context.shadowBlur = 0
      context.restore()

  getMousePosition:(event)->
    p = @viewport.toWorld event.clientX,event.clientY
    x = Math.floor(p[0])
    y = Math.floor(p[1])
    w = @sprite.width
    h = @sprite.height
    if @tile
      inside = p[0] >= -w/2 and p[1] >= -h/2 and p[0] < w*1.5 and p[1] < h*1.5
    else
      inside = x >= 0 and y >= 0 and x < w and y < h

    x: x
    y: y
    inside: inside and @viewport.contains(event.clientX,event.clientY)

  wrapX:(x)->
    if @tile then (x%@sprite.width+@sprite.width)%@sprite.width else x

  wrapY:(y)->
    if @tile then (y%@sprite.height+@sprite.height)%@sprite.height else y

  mouseDown:(event)->
    event.stopPropagation()
    return if not @sprite?
    return if @viewport.mouseDown(event)
    return if not @editable

    pos = @getMousePosition event
    x = pos.x
    y = pos.y

    if @editor.tool.selectiontool
      @mousepressed = true
      @mouse_x = x
      @mouse_y = y
      if @isInSelection(x,y)
        if not @floating_selection? and (event.shiftKey or event.altKey)
          bg = document.createElement "canvas"
          bg.width = @getFrame().canvas.width
          bg.height = @getFrame().canvas.height
          context = bg.getContext "2d"
          context.drawImage @getFrame().canvas,0,0
          if not event.altKey
            context.clearRect @selection.x,@selection.y,@selection.w,@selection.h
          fg = document.createElement "canvas"
          fg.width = @selection.w
          fg.height = @selection.h
          context = fg.getContext "2d"
          context.drawImage @getFrame().canvas,-@selection.x,-@selection.y

          @floating_selection =
            bg: bg
            fg: fg
        else if event.altKey and @floating_selection?
          @floating_selection.bg.getContext("2d").drawImage @floating_selection.fg,@selection.x,@selection.y

        @moving_selection = true
        @moved_once = false
      else
        @floating_selection = null
        x = Math.max(0,Math.min(@sprite.width-1,x))
        y = Math.max(0,Math.min(@sprite.height-1,y))
        @selection_start_x = x
        @selection_start_y = y
        @selection_moved = false
        @selection =
          x: x
          y: y
          w: 1
          h: 1
      @update()
      return

    return if not pos.inside
    x = @wrapX x
    y = @wrapY y

    if @colorpicker
      c = @getFrame().getRGB(x,y)
      @editor.colorpicker.colorPicked(c)
      if not @editor.alt_pressed
        @editor.setColorPicker(false)
      return

    @mousepressed = true
    @sprite.undo = new Undo() if not @sprite.undo?
    @sprite.undo.pushState @sprite.clone() if @sprite.undo.empty()

    if @editor.tool.parameters["Color"]?
      @editor.tool.parameters["Color"].value = @color
    @editor.tool.tile = @tile
    @editor.tool.vsymmetry = @vsymmetry
    @editor.tool.hsymmetry = @hsymmetry
    @editor.tool.start(@getFrame(),x,y,event.button,event.shiftKey)
    @pixels_drawn += 1
    @mouse_x = pos.x
    @mouse_y = pos.y
    @update()
    @editor.spriteChanged()
    @floating_selection = null

  mouseEnter:(event)->
    document.getElementById("spriteeditor").focus()

  mouseMove:(event)->
    return if @viewport.mouseMove(event)
    return if not @editable or not @sprite?

    @last_mouse_event =
      clientX: event.clientX
      clientY: event.clientY

    pos = @getMousePosition event
    x = pos.x
    y = pos.y

    if pos.inside
      @show_brush_size = 0

    if not @mousepressed and not pos.inside
      if @mouse_over
        @mouse_over = false
        @editor.setCoordinates -1,-1
        @update()
      return

    if @mousepressed and @moving_selection
      if @floating_selection?
        if x != @mouse_x or y != @mouse_y
          if not @moved_once
            @moved_once = true
            @sprite.undo = new Undo() if not @sprite.undo?
            @sprite.undo.pushState @sprite.clone() if @sprite.undo.empty()

          @selection.x += x-@mouse_x
          @selection.y += y-@mouse_y
          @mouse_x = x
          @mouse_y = y
          @editor.setCoordinates x,y
          context = @getFrame().getContext()
          context.clearRect 0,0,@getFrame().canvas.width,@getFrame().canvas.height
          context.drawImage @floating_selection.bg,0,0
          context.drawImage @floating_selection.fg,@selection.x,@selection.y
          @editor.spriteChanged()
          @update()
      else
        @selection.x += x-@mouse_x
        @selection.y += y-@mouse_y
        @selection.x = Math.max(0,Math.min(@sprite.width-@selection.w,@selection.x))
        @selection.y = Math.max(0,Math.min(@sprite.height-@selection.h,@selection.y))
        @mouse_x = x
        @mouse_y = y
        @editor.setCoordinates x,y
        @update()

      return

    was_over = @mouse_over
    @mouse_over = pos.inside

    if x != @mouse_x or y != @mouse_y or not was_over
      @mouse_x = x
      @mouse_y = y
      if pos.inside
        @editor.setCoordinates @wrapX(x),@wrapY(y)

      if @mousepressed
        if @editor.tool.selectiontool and @selection
          @selection_moved = true
          cx = Math.max(0,Math.min(@sprite.width-1,x))
          cy = Math.max(0,Math.min(@sprite.height-1,y))
          @selection.x = Math.min(@selection_start_x,cx)
          @selection.y = Math.min(@selection_start_y,cy)
          @selection.w = Math.abs(cx-@selection_start_x)+1
          @selection.h = Math.abs(cy-@selection_start_y)+1
          @update()
          return

        @editor.tool.move(@getFrame(),@wrapX(x),@wrapY(y),event.buttons)
        @pixels_drawn += 1
        @update()
        @editor.spriteChanged()
      else
        @updateCursor()
        @update()

    false

  mouseUp:(event)->
    return if @viewport.mouseUp()

    if @mousepressed and not @editor.tool.selectiontool
      @sprite.undo.pushState @sprite.clone()

    if @mousepressed and @editor.tool.selectiontool and not @selection_moved and not @moving_selection
      @selection = null
      @update()

    if @moving_selection
      @moving_selection = false
      if @moved_once and @floating_selection?
        @sprite.undo.pushState @sprite.clone()
      @moved_once = false

    @mousepressed = false
    @editor.updateSelectionHints()

  mouseOut:(event)->
    @mouse_over = false
    @update()
    @editor.setCoordinates -1,-1

  flipSprite:(direction)->
    if @editor.tool.selectiontool
      if @selection?
        @sprite.undo = new Undo() if not @sprite.undo?
        @sprite.undo.pushState @sprite.clone() if @sprite.undo.empty()
        fg = document.createElement "canvas"
        fg.width = @selection.w
        fg.height = @selection.h
        context = fg.getContext "2d"
        if direction == "horizontal"
          context.translate @selection.w,0
          context.scale -1,1
        else
          context.translate 0,@selection.h
          context.scale 1,-1

        if not @floating_selection?
          context.drawImage @getFrame().canvas,-@selection.x,-@selection.y
          context = @getFrame().canvas.getContext("2d")
          context.clearRect @selection.x,@selection.y,@selection.w,@selection.h
          bg = document.createElement "canvas"
          bg.width = @getFrame().canvas.width
          bg.height = @getFrame().canvas.height
          bg.getContext("2d").drawImage @getFrame().canvas,0,0
          context.drawImage fg,@selection.x,@selection.y
          @floating_selection =
            bg: bg
            fg: fg
        else
          context.drawImage @floating_selection.fg,0,0
          @floating_selection.fg = fg

          context = @getFrame().getContext()
          context.clearRect 0,0,@getFrame().canvas.width,@getFrame().canvas.height
          context.drawImage @floating_selection.bg,0,0
          context.drawImage @floating_selection.fg,@selection.x,@selection.y

        @sprite.undo.pushState @sprite.clone()
        @update()
        @editor.spriteChanged()

  rotateSprite:(direction)->
    if @editor.tool.selectiontool
      if @selection?
        @sprite.undo = new Undo() if not @sprite.undo?
        @sprite.undo.pushState @sprite.clone() if @sprite.undo.empty()
        fg = document.createElement "canvas"
        fg.width = @selection.h
        fg.height = @selection.w
        context = fg.getContext "2d"
        context.translate fg.width/2,fg.height/2
        context.rotate direction*Math.PI/2

        cx = @selection.x+@selection.w/2
        cy = @selection.y+@selection.h/2
        nw = @selection.h
        nh = @selection.w
        nx = Math.round(cx-nw/2+.01*direction)
        ny = Math.round(cy-nh/2+.01*direction)

        if not @floating_selection?
          context.drawImage @getFrame().canvas,-@selection.x-@selection.w/2,-@selection.y-@selection.h/2
          context = @getFrame().canvas.getContext("2d")
          context.clearRect @selection.x,@selection.y,@selection.w,@selection.h

          bg = document.createElement "canvas"
          bg.width = @getFrame().canvas.width
          bg.height = @getFrame().canvas.height
          bg.getContext("2d").drawImage @getFrame().canvas,0,0

          context.drawImage fg,nx,ny
          @selection.x = nx
          @selection.y = ny
          @selection.w = nw
          @selection.h = nh

          @floating_selection =
            bg: bg
            fg: fg
        else
          context.drawImage @floating_selection.fg,-@floating_selection.fg.width/2,-@floating_selection.fg.height/2
          @floating_selection.fg = fg

          @selection.x = nx
          @selection.y = ny
          @selection.w = nw
          @selection.h = nh

          context = @getFrame().getContext()
          context.clearRect 0,0,@getFrame().canvas.width,@getFrame().canvas.height
          context.drawImage @floating_selection.bg,0,0
          context.drawImage @floating_selection.fg,@selection.x,@selection.y

        @sprite.undo.pushState @sprite.clone()
        @update()
        @editor.spriteChanged()
