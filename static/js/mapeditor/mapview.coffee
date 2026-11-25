class @MapView
  constructor:(@editor)->
    @canvas = document.createElement "canvas"
    @map = new MicroMap(24,16,16,16,{})
    @viewport = new CanvasViewport document.getElementById("mapeditor-wrapper"),@canvas,@
    @viewport.max_zoom = 16

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
    @canvas.addEventListener "mouseenter", (event) => @mouseEnter(event)

    @canvas.addEventListener "contextmenu",(event)=>event.preventDefault()

    window.addEventListener "resize",()=>
      @windowResized()

    document.getElementById("mapeditor-wrapper").addEventListener "keydown",(e)=>
      if e.keyCode == 18
        document.getElementById("map-selection-hint-clone").classList.add "active"
      else if e.keyCode == 16
        document.getElementById("map-selection-hint-move").classList.add "active"

    document.addEventListener "keyup",(e)=>
      if e.keyCode == 18
        document.getElementById("map-selection-hint-clone").classList.remove "active"
      else if e.keyCode == 16
        document.getElementById("map-selection-hint-move").classList.remove "active"

    document.getElementById("map-zoom-plus").addEventListener "click",()=>
      @viewport.zoomBy(1.25)

    document.getElementById("map-zoom-minus").addEventListener "click",()=>
      @viewport.zoomBy(1/1.25)

    document.getElementById("map-zoom-fit").addEventListener "click",()=>
      @viewport.fit()
      @viewChanged()

    @editable = false
    @tool = "draw"
    @sprite = "icon"
    @cells_drawn = 0
    @mouse_x = -1
    @mouse_y = -1

    @updateLoop()

  setSprite:(@sprite)->

  setTool:(@tool)->
    if @tool != "select"
      @floating_selection = null
    @updateCursor()
    @update()

  getCell:(x,y)->
    return null if x<0 or y<0 or x>=@map.width or y>=@map.height
    @map.map[x+(@map.height-1-y)*@map.width] or null

  setCell:(x,y,value)->
    @map.set x,@map.height-1-y,value

  getFillRegion:(x,y)->
    return [] if x<0 or y<0 or x>=@map.width or y>=@map.height
    ref = @getCell(x,y)
    visited = new Uint8Array(@map.width*@map.height)
    visited[x+y*@map.width] = 1
    list = [[x,y]]
    region = []
    while list.length>0
      p = list.pop()
      region.push p
      for d in [[-1,0],[1,0],[0,-1],[0,1]]
        nx = p[0]+d[0]
        ny = p[1]+d[1]
        if nx>=0 and ny>=0 and nx<@map.width and ny<@map.height and not visited[nx+ny*@map.width] and @getCell(nx,ny) == ref
          visited[nx+ny*@map.width] = 1
          list.push [nx,ny]
    region

  getFillValue:(x,y,origin_x,origin_y,erase)->
    return null if erase or not @sprite
    sel = @editor.tilepicker.selection
    if sel?
      tx = sel.x+((x-origin_x)%sel.w+sel.w)%sel.w
      ty = sel.y+((y-origin_y)%sel.h+sel.h)%sel.h
      "#{@sprite}:#{tx},#{ty}"
    else
      @sprite

  floodFill:(x,y,erase)->
    for p in @getFillRegion(x,y)
      @setCell p[0],p[1],@getFillValue(p[0],p[1],x,y,erase)
    return

  drawAt:(x,y)->
    sel = @editor.tilepicker.selection
    if @mode == "erase"
      @setCell x,y,null
    else if sel?
      for i in [0..sel.w-1] by 1
        for j in [0..sel.h-1] by 1
          @setCell x+i,y+j,"#{@sprite}:#{sel.x+i},#{sel.y+j}"
    else
      @setCell x,y,@sprite
    return

  drawLine:(x,y)->
    d = Math.max(Math.abs(x-@last_x),Math.abs(y-@last_y))
    for i in [1..d] by 1
      @drawAt Math.round(@last_x+(x-@last_x)*i/d),Math.round(@last_y+(y-@last_y)*i/d)
    @last_x = x
    @last_y = y

  isInSelection:(x,y)->
    @selection? and x>=@selection.x and y>=@selection.y and x<@selection.x+@selection.w and y<@selection.y+@selection.h

  getCells:(x,y,w,h)->
    data = []
    for j in [0..h-1] by 1
      for i in [0..w-1] by 1
        data.push @getCell(x+i,y+j)
    w: w
    h: h
    data: data

  clearCells:(x,y,w,h)->
    for j in [0..h-1] by 1
      for i in [0..w-1] by 1
        @setCell x+i,y+j,null
    return

  stampCells:(cells,x,y)->
    for j in [0..cells.h-1] by 1
      for i in [0..cells.w-1] by 1
        v = cells.data[i+j*cells.w]
        @setCell x+i,y+j,v if v?
    return

  drawFloatingSelection:()->
    @map.map = @floating_selection.bg.slice()
    @stampCells @floating_selection.fg,@selection.x,@selection.y
    @map.needs_update = true

  startFloatingSelection:(fg,clear)->
    if clear
      @clearCells @selection.x,@selection.y,@selection.w,@selection.h
    @floating_selection =
      bg: @map.map.slice()
      fg: fg
    @drawFloatingSelection()

  pushUndo:()->
    @map.undo = new Undo() if not @map.undo?
    @map.undo.pushState @map.clone() if @map.undo.empty()

  deleteSelection:()->
    return if not @selection? or @tool != "select"
    @pushUndo()
    if @floating_selection?
      @map.map = @floating_selection.bg.slice()
      @map.needs_update = true
      @floating_selection = null
    else
      @clearCells @selection.x,@selection.y,@selection.w,@selection.h
    @map.undo.pushState @map.clone()
    @update()
    @editor.mapChanged()

  clearSelection:()->
    @selection = null
    @floating_selection = null
    @update()

  pasteCells:(cells)->
    @tool = "select"
    x = Math.max(0,Math.min(@map.width-cells.w,@mouse_x))
    y = Math.max(0,Math.min(@map.height-cells.h,@mouse_y))
    @selection =
      x: x
      y: y
      w: cells.w
      h: cells.h
    @startFloatingSelection cells,false

  getContentKey:()->
    "#{@map.width*@map.block_width},#{@map.height*@map.block_height}"

  updateContent:()->
    @viewport.setContent 0,0,@map.width*@map.block_width,@map.height*@map.block_height
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

  updateCursor:()->
    cursor = @viewport.getCursor()
    if cursor?
      @canvas.style.cursor = cursor
    else if @tool == "select" and @isInSelection(@mouse_x,@mouse_y)
      @canvas.style.cursor = "move"
    else
      @canvas.style.cursor = "crosshair"

  windowResized: ()->
    @update()

  updateLoop:()->
    requestAnimationFrame ()=>@updateLoop()

    if @needs_update
      @needs_update = false
      @update()

  update:()->
    return if not @viewport.resize()
    @updateContent()

    v = @viewport
    z = v.zoom
    bw = @map.block_width
    bh = @map.block_height
    width = @map.width*bw
    height = @map.height*bh

    context = @canvas.getContext "2d"
    v.resetTransform context
    context.clearRect 0,0,v.width,v.height
    context.imageSmoothingEnabled = false

    x0 = v.screenX(0)
    y0 = v.screenY(0)
    x1 = v.screenX(width)
    y1 = v.screenY(height)

    context.save()
    context.shadowBlur = 30
    context.shadowColor = "#000"
    if @editor.background_color_picker? and typeof @editor.background_color_picker.color == "string"
      context.fillStyle = @editor.background_color_picker.color
    else
      context.fillStyle = "#000"
    context.fillRect x0,y0,x1-x0,y1-y0
    context.restore()

    context.save()
    context.beginPath()
    context.rect x0,y0,x1-x0,y1-y0
    context.clip()
    v.setTransform context

    if @editor.map_underlay?
      underlay = @editor.app.project.getMap @editor.map_underlay
      if underlay?
        underlay.update()
        context.globalAlpha = .3
        underlay.draw context,0,0,underlay.width*underlay.block_width,underlay.height*underlay.block_height
        context.globalAlpha = 1

    context.restore()

    if bw*z >= 4 and bh*z >= 4
      i0 = Math.max(0,Math.floor(v.worldLeft()/bw))
      i1 = Math.min(@map.width,Math.ceil(v.worldRight()/bw))
      j0 = Math.max(0,Math.floor(v.worldTop()/bh))
      j1 = Math.min(@map.height,Math.ceil(v.worldBottom()/bh))
      for i in [i0..i1] by 1
        x = Math.round(v.screenX(i*bw))
        context.fillStyle = "rgba(0,0,0,.1)"
        context.fillRect x,y0,1,y1-y0
        context.fillStyle = "rgba(255,255,255,.1)"
        context.fillRect x-1,y0,1,y1-y0

      for j in [j0..j1] by 1
        y = Math.round(v.screenY(j*bh))
        context.fillStyle = "rgba(0,0,0,.1)"
        context.fillRect x0,y,x1-x0,1
        context.fillStyle = "rgba(255,255,255,.1)"
        context.fillRect x0,y-1,x1-x0,1

    context.save()
    v.setTransform context
    @map.update()
    @map.draw context,0,0,width,height
    context.restore()
    if @map.animated? and @map.animated.length>0
      @needs_update = true

    context.strokeStyle = "rgba(255,255,255,.2)"
    context.lineWidth = 1
    context.strokeRect Math.round(x0)-.5,Math.round(y0)-.5,Math.round(x1-x0)+1,Math.round(y1-y0)+1

    if @mouse_over and not v.getCursor()?
      cw = bw*z
      ch = bh*z
      if @tool == "fill" and not @mousepressed
        region = @getFillRegion(@mouse_x,@mouse_y)
        context.fillStyle = "rgba(255,255,255,.25)"
        context.beginPath()
        for p in region
          context.rect v.screenX(p[0]*bw),v.screenY(p[1]*bh),cw,ch
        context.fill()

      tw = 1
      th = 1
      if @tool == "draw" and @editor.tilepicker.selection?
        tw = @editor.tilepicker.selection.w
        th = @editor.tilepicker.selection.h

      if @tool != "select" or not @isInSelection(@mouse_x,@mouse_y)
        context.strokeStyle = "#000"
        context.lineWidth = 4
        context.beginPath()
        context.rect v.screenX(@mouse_x*bw),v.screenY(@mouse_y*bh),cw*tw,ch*th
        context.stroke()
        context.strokeStyle = "#FFF"
        context.lineWidth = 3
        context.stroke()

    if @selection? and @tool == "select"
      sx = v.screenX(@selection.x*bw)
      sy = v.screenY(@selection.y*bh)
      sw = @selection.w*bw*z
      sh = @selection.h*bh*z
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
        context.font = "#{Math.max(12,Math.min(24,bw*z/2))}pt Ubuntu Mono"
        context.fillStyle = "#FFF"
        context.shadowBlur = 2
        context.shadowColor = "#000"
        context.textAlign = "center"
        context.textBaseline = "middle"
        context.fillText "#{@selection.w} x #{@selection.h}",sx+sw/2,sy+sh/2
      context.restore()

    return

  getMousePosition:(event)->
    p = @viewport.toWorld event.clientX,event.clientY
    x = Math.floor(p[0]/@map.block_width)
    y = Math.floor(p[1]/@map.block_height)
    inside = x>=0 and y>=0 and x<@map.width and y<@map.height

    x: x
    y: y
    inside: inside and @viewport.contains(event.clientX,event.clientY)

  mouseEnter:(event)->
    document.getElementById("mapeditor-wrapper").focus()

  mouseDown:(event)->
    event.stopPropagation()
    return if @viewport.mouseDown(event)
    return if not @editable

    pos = @getMousePosition event
    x = pos.x
    y = pos.y

    if @tool == "select"
      @mousepressed = true
      @mouse_x = x
      @mouse_y = y
      if @isInSelection(x,y)
        if not @floating_selection? and (event.shiftKey or event.altKey)
          @pushUndo()
          @startFloatingSelection @getCells(@selection.x,@selection.y,@selection.w,@selection.h),not event.altKey
        else if event.altKey and @floating_selection?
          @floating_selection.bg = @map.map.slice()

        @moving_selection = true
        @moved_once = false
      else
        @floating_selection = null
        x = Math.max(0,Math.min(@map.width-1,x))
        y = Math.max(0,Math.min(@map.height-1,y))
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

    @mousepressed = true
    @mode = if event.button == 2 then "erase" else "draw"
    @pushUndo()
    @floating_selection = null

    if @tool == "fill" or event.shiftKey
      @filling = true
      @floodFill x,y,@mode == "erase"
    else
      @filling = false
      @drawAt x,y

    @last_x = x
    @last_y = y
    @mouse_x = x
    @mouse_y = y
    @cells_drawn += 1
    @update()
    @editor.mapChanged()

  mouseMove:(event)->
    return if @viewport.mouseMove(event)
    return if not @editable

    @last_mouse_event =
      clientX: event.clientX
      clientY: event.clientY

    pos = @getMousePosition event
    x = pos.x
    y = pos.y

    if not @mousepressed and not pos.inside
      if @mouse_over
        @mouse_over = false
        @editor.setCoordinates -1,-1
        @update()
      return

    if @mousepressed and @moving_selection
      if x != @mouse_x or y != @mouse_y
        if @floating_selection?
          @moved_once = true
          @selection.x += x-@mouse_x
          @selection.y += y-@mouse_y
          @drawFloatingSelection()
          @editor.mapChanged()
        else
          @selection.x = Math.max(0,Math.min(@map.width-@selection.w,@selection.x+x-@mouse_x))
          @selection.y = Math.max(0,Math.min(@map.height-@selection.h,@selection.y+y-@mouse_y))
        @mouse_x = x
        @mouse_y = y
        @update()
      return

    was_over = @mouse_over
    @mouse_over = pos.inside

    if x != @mouse_x or y != @mouse_y or not was_over
      @mouse_x = x
      @mouse_y = y
      if pos.inside
        @editor.setCoordinates x,@map.height-1-y

      if @mousepressed
        if @tool == "select" and @selection?
          @selection_moved = true
          cx = Math.max(0,Math.min(@map.width-1,x))
          cy = Math.max(0,Math.min(@map.height-1,y))
          @selection.x = Math.min(@selection_start_x,cx)
          @selection.y = Math.min(@selection_start_y,cy)
          @selection.w = Math.abs(cx-@selection_start_x)+1
          @selection.h = Math.abs(cy-@selection_start_y)+1
        else if not @filling
          @drawLine x,y
          @cells_drawn += 1
          @editor.mapChanged()
      else
        @updateCursor()

      @update()

    false

  mouseUp:(event)->
    return if @viewport.mouseUp()

    if @mousepressed and @tool != "select"
      @map.undo.pushState @map.clone()

    if @mousepressed and @tool == "select" and not @selection_moved and not @moving_selection
      @selection = null
      @update()

    if @moving_selection
      @moving_selection = false
      if @moved_once and @floating_selection?
        @map.undo.pushState @map.clone()
      @moved_once = false

    @mousepressed = false
    @filling = false

  mouseOut:(event)->
    @mouse_over = false
    @update()
    @editor.setCoordinates -1,-1

  setMap:(map)->
    if map != @map
      if @map? and @viewport.width > 0
        @map.view_state = @viewport.getState()
        @map.view_state.key = @content_key
      @map = map
      if @map.view_state?
        @viewport.setState @map.view_state
        @content_key = @map.view_state.key
      else
        @content_key = null
      @selection = null
      @floating_selection = null
    @windowResized()
    @update()
