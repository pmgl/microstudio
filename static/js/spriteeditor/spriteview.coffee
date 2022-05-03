class @SpriteView
  constructor:(@editor)->
    @canvas = document.querySelector "#spriteeditor canvas"
    @canvas.width = 400
    @canvas.height = 400
    @sprite = new Sprite(32,32)


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
    @zoom = 1
    document.getElementById("spriteeditor").addEventListener("mousewheel", ((e)=>@mouseWheel(e)), false)
    document.getElementById("spriteeditor").addEventListener("DOMMouseScroll", ((e)=>@mouseWheel(e)), false)

    document.getElementById("spriteeditor").addEventListener "mousedown",()=>
      if @selection?
        @selection = null
        @update()

    document.getElementById("spriteeditor").addEventListener "keydown",(e)=>
      if e.keyCode == 32
        @space_pressed = true
        @canvas.style.cursor = "grab"
        e.preventDefault()
        document.getElementById("sprite-grab-info").classList.add "active"
      else if e.keyCode == 18 # Alt
        document.getElementById("selection-hint-clone").classList.add "active"
      else if e.keyCode == 16 # Shift
        document.getElementById("selection-hint-move").classList.add "active"

    document.addEventListener "keyup",(e)=>
      if e.keyCode == 32
        @space_pressed = false
        @canvas.style.cursor = "crosshair"
        document.getElementById("sprite-grab-info").classList.remove "active"
      else if e.keyCode == 18 # Alt
        document.getElementById("selection-hint-clone").classList.remove "active"
      else if e.keyCode == 16 # Shift
        document.getElementById("selection-hint-move").classList.remove "active"

    document.getElementById("sprite-zoom-plus").addEventListener "click",()=>
      @scaleZoom(1.1)

    document.getElementById("sprite-zoom-minus").addEventListener "click",()=>
      @scaleZoom(1/1.100001)

  setSprite:(sprite)->
    if sprite != @sprite
      if @sprite?
        @saveZoom()
        @sprite.selection = @selection

      @sprite = sprite
      if @sprite.zoom?
        @restoreZoom()
      else
        @scaleZoom(.5/@zoom)

      @selection = @sprite.selection or null
      @floating_selection = null

  setCurrentFrame:(index)->
    if index != @sprite.current_frame
      @sprite.setCurrentFrame(index)
      @selection = null

  getFrame:()->
    return @sprite.frames[@sprite.current_frame]

  mouseWheel:(e)->
    e.preventDefault()
    @next_wheel_action = Date.now() if not @next_wheel_action?

    return if Date.now()<@next_wheel_action
    @next_wheel_action = Date.now()+50

    if e.wheelDelta < 0 or e.detail > 0
      @scaleZoom(1/1.100001,e)
    else
      @scaleZoom(1.1,e)

  scaleZoom:(scale,e)->
    view = document.getElementById("spriteeditor").getBoundingClientRect()
    max_zoom = 4096/Math.max(view.width,view.height)
    @zoom = Math.max(1,Math.min(max_zoom,@zoom*scale))

    if e?
      b = @canvas.getBoundingClientRect()
      x = (e.clientX-b.left)/@canvas.width
      y = (e.clientY-b.top)/@canvas.height

    @windowResized()

    if e?
      view = document.getElementById("spriteeditor").getBoundingClientRect()
      scroll_x = view.x+@canvas.width*x-e.clientX+40
      scroll_y = view.y+@canvas.height*y-e.clientY+40
      document.getElementById("spriteeditor").scrollTo(scroll_x,scroll_y)
    @mouseMove(e) if e?

    if @zoom>1
      document.getElementById("sprite-grab-info").style.display = "inline-block"
    else
      document.getElementById("sprite-grab-info").style.display = "none"

  saveZoom:()->
    if @sprite?
      view = document.getElementById("spriteeditor")
      @sprite.zoom =
        zoom: @zoom
        left:view.scrollLeft
        top: view.scrollTop

  restoreZoom:()->
    if @sprite.zoom?
      view = document.getElementById("spriteeditor")
      @scaleZoom(@sprite.zoom.zoom/@zoom)
      view.scrollTo(@sprite.zoom.left,@sprite.zoom.top)

  addPattern:()->
    return if @pattern?
    c = document.createElement "canvas"
    c.width = 64
    c.height = 64
    context = c.getContext "2d"
    data = context.getImageData 0,0,c.width,1
    for line in [0..c.height-1] by 1
      for i in [0..c.width-1] by 1
        value = 128+Math.random()*64-32
        data.data[i*4] = value
        data.data[i*4+1] = value
        data.data[i*4+2] = value
        data.data[i*4+3] = 64

      context.putImageData data,0,line

    @pattern = c.toDataURL()

    document.querySelector(".spriteeditor canvas").style["background-image"] = "url(#{@pattern})"
    document.querySelector(".spriteeditor canvas").style["background-repeat"] = "repeat"
    @updateBackgroundColor()

  updateBackgroundColor:()->
    if @editor.background_color_picker?
      c = @editor.background_color_picker.color
      document.querySelector(".spriteeditor canvas").style["background-color"] = c
    else
      document.querySelector(".spriteeditor canvas").style["background-color"] = "#000"

  setColor:(@color)->

  windowResized: ()->
    c = @canvas.parentElement
    return if not c?

    return if c.clientWidth<= 0

    w = c.clientWidth-80
    h = c.clientHeight-80
    ratio = Math.min(w/@sprite.width,h/@sprite.height)
    w = Math.floor(ratio*@sprite.width*@zoom)
    h = Math.floor(ratio*@sprite.height*@zoom)
    if w != @canvas.width or h != @canvas.height
      @canvas.width = w
      @canvas.height = h
      @update()

    h = Math.max(40,(c.clientHeight-h)/2)
    @canvas.style["margin-top"] = h+"px"

  showBrushSize:()->
    @show_brush_size = Date.now()+2000
    @update()

  drawGrid:(ctx)->
    if not @grid_buffer? or @grid_buffer.width != @canvas.width or @grid_buffer.height != @canvas.height or @tile != @grid_tile or @grid_sw != @sprite.width or @grid_sh != @sprite.height
      if not @grid_buffer?
        @grid_buffer = document.createElement "canvas"
      @grid_buffer.width = @canvas.width
      @grid_buffer.height = @canvas.height
      @grid_tile = @tile
      @grid_sw = @sprite.width
      @grid_sh = @sprite.height
      console.info "updating grid"

      wblock = @canvas.width/@sprite.width
      hblock = @canvas.height/@sprite.height
      if @tile
        wblock /= 2
        hblock /= 2
      context = @grid_buffer.getContext "2d"

      context.lineWidth = 1
      context.strokeStyle = "rgba(0,0,0,.1)"
      woffset = if @tile and @sprite.width%2>0 then wblock*.5 else 0
      hoffset = if @tile and @sprite.height%2>0 then hblock*.5 else 0

      modulo = if @sprite.width%8 == 0 then 8 else 10
      return if wblock<3

      for i in [0..@canvas.width] by wblock
        lw = if Math.round(i/hblock)%modulo ==0 then 2 else 1
        context.lineWidth = lw
        context.beginPath()
        context.moveTo i+.25*lw+woffset,0
        context.lineTo i+.25*lw+woffset,@canvas.height
        context.stroke()

      for i in [0..@canvas.height] by hblock
        lw = if Math.round(i/hblock)%modulo ==0 then 2 else 1
        context.lineWidth = lw
        context.beginPath()
        context.moveTo 0,i+.25*lw+hoffset
        context.lineTo @canvas.width,i+.25*lw+hoffset
        context.stroke()

      context.strokeStyle = "rgba(255,255,255,.1)"
      for i in [0..@canvas.width] by wblock
        lw = if Math.round(i/hblock)%modulo ==0 then 2 else 1
        context.lineWidth = lw
        context.beginPath()
        context.moveTo i-.25*lw+woffset,0
        context.lineTo i-.25*lw+woffset,@canvas.height
        context.stroke()

      for i in [0..@canvas.height] by hblock
        lw = if Math.round(i/hblock)%modulo ==0 then 2 else 1
        context.lineWidth = lw
        context.beginPath()
        context.moveTo 0,i-.25*lw+hoffset
        context.lineTo @canvas.width,i-.25*lw+hoffset
        context.stroke()

    ctx.drawImage @grid_buffer,0,0

  update:()->
    @brush_size = @editor.tool.getSize(@sprite)
    context = @canvas.getContext "2d"
    context.clearRect 0,0,@canvas.width,@canvas.height
    context.imageSmoothingEnabled = false
    @addPattern()

    if @sprite.frames.length>1
      f = @sprite.frames[(@sprite.current_frame+@sprite.frames.length-1)%@sprite.frames.length]
      context.globalAlpha = .2
      if @tile
        w = @canvas.width
        h = @canvas.height
        for i in [0..2] by 1
          for j in [0..2] by 1
            if f.canvas?
              context.drawImage f.canvas,w*(-.25+i*.5),h*(-.25+j*.5),w*.5,h*.5
      else
        if f.canvas?
          context.drawImage f.canvas,0,0,@canvas.width,@canvas.height
      context.globalAlpha = 1

    if @tile
      w = @canvas.width
      h = @canvas.height
      for i in [0..2] by 1
        for j in [0..2] by 1
          if @getFrame().canvas?
            context.drawImage @getFrame().canvas,w*(-.25+i*.5),h*(-.25+j*.5),w*.5,h*.5
    else
      if @getFrame().canvas?
        context.drawImage @getFrame().canvas,0,0,@canvas.width,@canvas.height

    wblock = @canvas.width/@sprite.width
    hblock = @canvas.height/@sprite.height
    if @tile
      wblock /= 2
      hblock /= 2
    context.lineWidth = 1
    context.strokeStyle = "rgba(0,0,0,.1)"
    woffset = if @tile and @sprite.width%2>0 then wblock*.5 else 0
    hoffset = if @tile and @sprite.height%2>0 then hblock*.5 else 0

    @drawGrid(context)

    if (@mouse_over or Date.now()<@show_brush_size) and @canvas.style.cursor != "move"
      if Date.now()<@show_brush_size
        mx = Math.floor(@sprite.width/2)*if @tile then 2 else 1
        my = Math.floor(@sprite.height/2)*if @tile then 2 else 1
      else
        mx = @mouse_x
        my = @mouse_y
      bs = (@brush_size-1)/2
      context.strokeStyle = "#000"
      context.lineWidth = 4
      context.beginPath()
      context.rect (mx-bs)*wblock-woffset,(my-bs)*hblock-hoffset,wblock*@brush_size,hblock*@brush_size
      context.stroke()
      context.strokeStyle = "#FFF"
      context.lineWidth = 3
      context.stroke()

    if @tile
      grd = context.createLinearGradient(0,0,@canvas.width,0)
      grd.addColorStop(0,"rgba(0,0,0,1)")
      grd.addColorStop(.25,"rgba(0,0,0,0)")
      grd.addColorStop(.75,"rgba(0,0,0,0)")
      grd.addColorStop(1,"rgba(0,0,0,1)")
      context.fillStyle = grd
      context.fillRect(0,0,@canvas.width,@canvas.height)

      grd = context.createLinearGradient(0,0,0,@canvas.height)
      grd.addColorStop(0,"rgba(0,0,0,1)")
      grd.addColorStop(.25,"rgba(0,0,0,0)")
      grd.addColorStop(.75,"rgba(0,0,0,0)")
      grd.addColorStop(1,"rgba(0,0,0,1)")
      context.fillStyle = grd
      context.fillRect(0,0,@canvas.width,@canvas.height)

      w = @canvas.width
      h = @canvas.height
      context.strokeStyle = "rgba(0,0,0,.5)"
      context.strokeRect w*.25+.5,h*.25+.5,w*.5,h*.5
      context.strokeStyle = "rgba(255,255,255,.5)"
      context.strokeRect w*.25-.5,h*.25-.5,w*.5,h*.5

    if @hsymmetry
      w = @canvas.width
      h = @canvas.height
      context.fillStyle = "rgba(0,0,0,.5)"
      context.fillRect 0,h/2-2,w,4
      context.fillStyle = "rgba(255,255,255,.5)"
      context.fillRect 0,h/2-1.5,w,3

    if @vsymmetry
      w = @canvas.width
      h = @canvas.height
      context.fillStyle = "rgba(0,0,0,.5)"
      context.fillRect w/2-2,0,4,h
      context.fillStyle = "rgba(255,255,255,.5)"
      context.fillRect w/2-1.5,0,3,h

    if @selection? and @editor.tool.selectiontool
      context.save()
      if @tile
        context.translate @canvas.width*.25,@canvas.width*.25
      context.strokeStyle = "rgba(0,0,0,.5)"
      context.lineWidth = 3
      context.strokeRect(@selection.x*wblock,@selection.y*hblock,@selection.w*wblock,@selection.h*hblock)
      context.setLineDash([4,4])
      context.strokeStyle = if @floating_selection then "#FA0" else "#FFF"
      context.lineWidth = 2
      context.strokeRect(@selection.x*wblock,@selection.y*hblock,@selection.w*wblock,@selection.h*hblock)
      context.setLineDash([])
      if @selection.w>1 or @selection.h>1
        context.font = "#{Math.max(12,wblock)}pt Ubuntu Mono"
        context.fillStyle = "#FFF"
        context.shadowBlur = 2
        context.shadowColor = "#000"
        context.shadowOpacity = 1
        context.textAlign = "center"
        context.textBaseline = "middle"
        context.fillText "#{@selection.w} x #{@selection.h}",(@selection.x+@selection.w/2)*wblock,(@selection.y+@selection.h/2)*hblock
        context.shadowBlur = 0
      context.restore()

  mouseDown:(event)->
    event.stopPropagation()
    return if not @editable or not @sprite?
    @mousepressed = true
    b = @canvas.getBoundingClientRect()
    min = Math.min @canvas.clientWidth,@canvas.clientHeight
    x = (event.clientX-b.left)
    y = (event.clientY-b.top)

    if @tile
      x = Math.floor(x/@canvas.width*@sprite.width*2)
      y = Math.floor(y/@canvas.height*@sprite.height*2)
      x = Math.floor((x+@sprite.width/2)%@sprite.width)
      y = Math.floor((y+@sprite.height/2)%@sprite.height)
    else
      x = Math.floor(x/@canvas.width*@sprite.width)
      y = Math.floor(y/@canvas.height*@sprite.height)

    if @space_pressed
      @grab_x = event.clientX
      @grab_y = event.clientY
      @grabbing = true
      return

    if @colorpicker and not @editor.tool.selectiontool
      c = @getFrame().getRGB(x,y)
      @editor.colorpicker.colorPicked(c)
      @mousepressed = false
      if not @editor.alt_pressed
        @editor.setColorPicker(false)
      return

    if @editor.tool.selectiontool
      if @selection? and x>=@selection.x and y>=@selection.y and x<@selection.x+@selection.w and y<@selection.y+@selection.h
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
        else if event.altKey
          @floating_selection.bg.getContext("2d").drawImage @floating_selection.fg,@selection.x,@selection.y

        @moving_selection = true
        @moved_once = false
        @moving_start_x = x
        @moving_start_y = y
        @update()
        return
      else
        @floating_selection = null
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

    @sprite.undo = new Undo() if not @sprite.undo?
    @sprite.undo.pushState @sprite.clone() if @sprite.undo.empty()

    if @editor.tool.parameters["Color"]?
      @editor.tool.parameters["Color"].value = @color
    @editor.tool.tile = @tile
    @editor.tool.vsymmetry = @vsymmetry
    @editor.tool.hsymmetry = @hsymmetry
    @editor.tool.start(@getFrame(),x,y,event.button)
    @pixels_drawn += 1
    @mouse_x = x
    @mouse_y = y
    @update()
    @editor.spriteChanged()
    @floating_selection = null

  mouseEnter:(event)->
    document.getElementById("spriteeditor").focus()

  mouseMove:(event)->
    if @grabbing
      dx = event.clientX-@grab_x
      dy = event.clientY-@grab_y
      @grab_x = event.clientX
      @grab_y = event.clientY
      view = document.getElementById("spriteeditor")
      view.scrollTo(view.scrollLeft-dx,view.scrollTop-dy)
      return

    return if not @editable
    b = @canvas.getBoundingClientRect()
    min = Math.min @canvas.clientWidth,@canvas.clientHeight
    x = (event.clientX-b.left)
    y = (event.clientY-b.top)

    if x>=0 and y>=0 and x<b.right-b.left and y<b.bottom-b.top
      @show_brush_size = 0

    if @tile
      x = Math.floor(x/@canvas.width*@sprite.width*2)
      y = Math.floor(y/@canvas.height*@sprite.height*2)
      return if not @mousepressed and (x<0 or y<0 or x>=@sprite.width*2 or y>=@sprite.height*2)
    else
      x = Math.floor(x/@canvas.width*@sprite.width)
      y = Math.floor(y/@canvas.height*@sprite.height)
      return if not @mousepressed and (x<0 or y<0 or x>=@sprite.width or y>=@sprite.height)

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

    @mouse_over = true
    if @mousepressed and @editor.tool.selectiontool
      @selection_moved = true

    if x != @mouse_x or y != @mouse_y
      @mouse_x = x
      @mouse_y = y
      @editor.setCoordinates x,y

      if @mousepressed
        if @tile
          x = Math.floor((x+@sprite.width/2)%@sprite.width)
          y = Math.floor((y+@sprite.height/2)%@sprite.height)

        if @editor.tool.selectiontool and @selection
          @selection.x = Math.max(0,Math.min(@selection_start_x,x))
          @selection.y = Math.max(0,Math.min(@selection_start_y,y))
          @selection.w = Math.min @sprite.width-@selection.x,Math.max(@selection_start_x,x)-Math.min(@selection_start_x,Math.max(0,x))+1
          @selection.h = Math.min @sprite.height-@selection.y,Math.max(@selection_start_y,y)-Math.min(@selection_start_y,Math.max(0,y))+1

          @update()
          return

        @editor.tool.move(@getFrame(),x,y,event.buttons)
        @pixels_drawn += 1
        @update()
        @editor.spriteChanged()
      else
        if @selection? and @editor.tool.selectiontool and x>=@selection.x and y>=@selection.y and x<@selection.x+@selection.w and y<@selection.y+@selection.h
          @canvas.style.cursor = "move"
        else if @colorpicker and not @editor.tool.selectiontool
          @canvas.style.cursor = "url( '/img/eyedropper.svg' ) 0 24, pointer"
        else
          @canvas.style.cursor = "crosshair"
        @update()

    false

  mouseUp:(event)->
    if @grabbing
      @grabbing = false
    else if @mousepressed and not @editor.tool.selectiontool
      @sprite.undo.pushState @sprite.clone()

    if @editor.tool.selectiontool and not @selection_moved
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
