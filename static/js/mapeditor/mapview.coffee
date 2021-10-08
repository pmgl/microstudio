class @MapView
  constructor:(@editor)->
    @canvas = document.createElement "canvas"
    @canvas.width = 400
    @canvas.height = 400
    @map = new MicroMap(24,16,16,16,{})

    @canvas.addEventListener "mousedown", (event) => @mouseDown(event)
    @canvas.addEventListener "mousemove", (event) => @mouseMove(event)
    @canvas.addEventListener "mouseout", (event) => @mouseOut(event)
    document.addEventListener "mouseup", (event) => @mouseUp(event)

    @canvas.addEventListener "contextmenu",(event)=>event.preventDefault()

    window.addEventListener "resize",()=>
      @windowResized()

    @editable = false

    @sprite = "icon"

    @cells_drawn = 0

  setSprite:(@sprite)->

  floodFillMap:(clickedSprite,fillSprite,xs,ys)->
    clickSprite =  @map.get xs,@map.height-1-ys
    return if clickSprite != clickedSprite
    if typeof clickSprite == "string"
      clickSprite = clickSprite.split(":")[0]
    return if clickSprite == fillSprite
    return if xs<0 or xs>@map.width-1 or ys<0 or ys>@map.height-1

    sel = @editor.tilepicker.selection
    if not sel? or not fillSprite
      @map.set xs,@map.height-1-ys,fillSprite
    else
      x = sel.x+(xs-@flood_x+@map.width)%sel.w
      y = sel.y+(ys-@flood_y+@map.height)%sel.h
      s = "#{fillSprite}:#{x},#{y}"
      @map.set xs,@map.height-1-ys,s

    @floodFillMap(clickedSprite,fillSprite,xs-1,ys)
    @floodFillMap(clickedSprite,fillSprite,xs,ys-1)
    @floodFillMap(clickedSprite,fillSprite,xs,ys+1)
    @floodFillMap(clickedSprite,fillSprite,xs+1,ys)

  windowResized: ()->
    c = @canvas.parentElement
    return if not c?

    return if c.clientWidth<= 0

    w = c.clientWidth-40
    h = c.clientHeight-40
    width = @map.width*@map.block_width
    height = @map.height*@map.block_height
    ratio = Math.min(w/width,h/height)
    w = Math.floor(ratio*width)
    h = Math.floor(ratio*height)
    if w != @canvas.width or h != @canvas.height
      @canvas.width = w
      @canvas.height = h
      @update()

    h = (c.clientHeight-h)/2
    @canvas.style["margin-top"] = h+"px"

  update:()->
    context = @canvas.getContext "2d"
    if @editor.background_color_picker?
      c = @editor.background_color_picker.color
      context.fillStyle = c
    else
      context.fillStyle = "#000"

    context.fillRect 0,0,@canvas.width,@canvas.height
    context.imageSmoothingEnabled = false

    if @editor.map_underlay?
      underlay = @editor.app.project.getMap @editor.map_underlay
      if underlay?
        underlay.update()
        context.globalAlpha = .3
        context.drawImage underlay.getCanvas(),0,0,@canvas.width,@canvas.height
        context.globalAlpha = 1

    wblock = @canvas.width/@map.width
    hblock = @canvas.height/@map.height
    context.lineWidth = 1
    context.strokeStyle = "rgba(0,0,0,.1)"
    for i in [0..@map.width]
      context.beginPath()
      context.moveTo i*wblock+.25,0
      context.lineTo i*wblock+.5,@canvas.height
      context.stroke()

    for i in [0..@map.height]
      context.beginPath()
      context.moveTo 0,i*hblock+.25
      context.lineTo @canvas.width,i*hblock+.5
      context.stroke()

    context.strokeStyle = "rgba(255,255,255,.1)"
    for i in [0..@map.width]
      context.beginPath()
      context.moveTo i*wblock-.25,0
      context.lineTo i*wblock-.25,@canvas.height
      context.stroke()

    for i in [0..@map.height]
      context.beginPath()
      context.moveTo 0,i*hblock-.25
      context.lineTo @canvas.width,i*hblock-.25
      context.stroke()

    @map.update()
    context.drawImage @map.getCanvas(),0,0,@canvas.width,@canvas.height

    if @mouse_over
      tw = 1
      th = 1
      if @editor.tilepicker.selection?
        tw = @editor.tilepicker.selection.w
        th = @editor.tilepicker.selection.h

      context.strokeStyle = "#000"
      context.lineWidth = 4
      context.beginPath()
      context.rect @mouse_x*wblock,@mouse_y*hblock,wblock*tw,hblock*th
      context.stroke()
      context.strokeStyle = "#FFF"
      context.lineWidth = 3
      context.stroke()

  mouseDown:(event)->
    return if not @editable
    @mousepressed = true
    @mode = if event.button == 2 then "erase" else "draw"
    @map.undo = new Undo() if not @map.undo?
    @map.undo.pushState @map.clone() if @map.undo.empty()
    @mouseMove(event,true)

  mouseMove:(event,force=false)->
    return if not @editable
    b = @canvas.getBoundingClientRect()
    min = Math.min @canvas.clientWidth,@canvas.clientHeight
    x = (event.clientX-b.left)
    y = (event.clientY-b.top)

    x = Math.floor(x/@canvas.width*@map.width)
    y = Math.floor(y/@canvas.height*@map.height)

    @mouse_over = true
    if x != @mouse_x or y != @mouse_y
      @mouse_x = x
      @mouse_y = y
      @update()
      @editor.setCoordinates x,@map.height-1-y
    else if not force
      return false

    if @mousepressed
      @cells_drawn += 1
      clickedSprite = @map.get x,@map.height-1-y
      if @editor.tilepicker.selection? and @mode =="draw"
        sel = @editor.tilepicker.selection

        if event.shiftKey
          @flood_x = x
          @flood_y = y
          @floodFillMap(clickedSprite,@sprite,x,y)
        else
          for i in [0..sel.w-1]
            for j in [0..sel.h-1]
              s = "#{@sprite}:#{sel.x+i},#{sel.y+j}"
              @map.set x+i,@map.height-1-y-j,s
      else
        s = if @mode == "draw" then @sprite else null
        if event.shiftKey
          @flood_x = x
          @flood_y = y
          @floodFillMap(clickedSprite,s,x,y)
        else
          @map.set x,@map.height-1-y,s

      @update()
      @editor.mapChanged()

    false

  mouseUp:(event)->
    if @mousepressed
      @map.undo.pushState @map.clone()

    @mousepressed = false

  mouseOut:(event)->
    @mouse_over = false
    @update()
    @editor.setCoordinates -1,-1

  setMap:(@map)->
    @windowResized()
    @update()
