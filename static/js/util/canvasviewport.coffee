class @CanvasViewport
  constructor:(@container,@canvas,@listener)->
    @zoom = 1
    @offset_x = 0
    @offset_y = 0
    @content_x = 0
    @content_y = 0
    @content_width = 1
    @content_height = 1
    @width = 0
    @height = 0
    @ratio = 1
    @margin = 40
    @max_zoom = 64

    @container.addEventListener "wheel",((e)=>@mouseWheel(e)),{ passive: false }

    @container.addEventListener "gesturestart",(e)=>
      e.preventDefault()
      @gesture_scale = 1

    @container.addEventListener "gesturechange",(e)=>
      e.preventDefault()
      b = @canvas.getBoundingClientRect()
      @zoomAt e.scale/@gesture_scale,e.clientX-b.left,e.clientY-b.top
      @gesture_scale = e.scale

    @container.addEventListener "keydown",(e)=>
      if e.keyCode == 32
        e.preventDefault()
        if not @space_pressed
          @space_pressed = true
          @listener.updateCursor()

    document.addEventListener "keyup",(e)=>
      if e.keyCode == 32 and @space_pressed
        @space_pressed = false
        @listener.updateCursor()

  resize:()->
    w = @container.clientWidth
    h = @container.clientHeight
    return false if w <= 0 or h <= 0
    ratio = window.devicePixelRatio or 1
    if w != @width or h != @height or ratio != @ratio
      if @width > 0
        @offset_x += (w-@width)/2
        @offset_y += (h-@height)/2
      @width = w
      @height = h
      @ratio = ratio
      @canvas.width = Math.round(w*ratio)
      @canvas.height = Math.round(h*ratio)
      @canvas.style.width = "#{w}px"
      @canvas.style.height = "#{h}px"
      @clampOffset()
    true

  setContent:(@content_x,@content_y,@content_width,@content_height)->

  fitZoom:()->
    w = Math.max(1,@width-@margin*2)
    h = Math.max(1,@height-@margin*2)
    Math.min(w/@content_width,h/@content_height)

  minZoom:()->
    Math.min(1,@fitZoom()/4)

  maxZoom:()->
    Math.max(@max_zoom,@fitZoom()*2)

  isZoomedIn:()->
    @zoom > @fitZoom()*1.01

  fit:()->
    @zoom = @fitZoom()
    @offset_x = @width/2-(@content_x+@content_width/2)*@zoom
    @offset_y = @height/2-(@content_y+@content_height/2)*@zoom

  zoomAt:(factor,x,y)->
    zoom = Math.max(@minZoom(),Math.min(@maxZoom(),@zoom*factor))
    return if zoom == @zoom
    wx = (x-@offset_x)/@zoom
    wy = (y-@offset_y)/@zoom
    @zoom = zoom
    @offset_x = x-wx*@zoom
    @offset_y = y-wy*@zoom
    @clampOffset() if not @containsWorld(wx,wy)
    @changed()

  zoomBy:(factor)->
    @zoomAt factor,@width/2,@height/2

  pan:(dx,dy)->
    ox = @offset_x
    oy = @offset_y
    @offset_x += dx
    @offset_y += dy
    @clampOffset(ox,oy)
    @changed()

  containsWorld:(x,y)->
    x >= @content_x and y >= @content_y and x <= @content_x+@content_width and y <= @content_y+@content_height

  clampOffset:(ox,oy)->
    return if @width <= 0
    min_x = @margin-(@content_x+@content_width)*@zoom
    max_x = @width-@margin-@content_x*@zoom
    min_y = @margin-(@content_y+@content_height)*@zoom
    max_y = @height-@margin-@content_y*@zoom
    if ox?
      min_x = Math.min(min_x,ox)
      max_x = Math.max(max_x,ox)
      min_y = Math.min(min_y,oy)
      max_y = Math.max(max_y,oy)
    @offset_x = Math.max(min_x,Math.min(max_x,@offset_x))
    @offset_y = Math.max(min_y,Math.min(max_y,@offset_y))

  changed:()->
    @listener.viewChanged()

  getState:()->
    zoom: @zoom
    offset_x: @offset_x
    offset_y: @offset_y

  setState:(state)->
    @zoom = state.zoom
    @offset_x = state.offset_x
    @offset_y = state.offset_y
    @clampOffset()

  setTransform:(context)->
    context.setTransform @ratio*@zoom,0,0,@ratio*@zoom,@ratio*@offset_x,@ratio*@offset_y

  resetTransform:(context)->
    context.setTransform @ratio,0,0,@ratio,0,0

  screenX:(x)->
    @offset_x+x*@zoom

  screenY:(y)->
    @offset_y+y*@zoom

  worldLeft:()->
    -@offset_x/@zoom

  worldTop:()->
    -@offset_y/@zoom

  worldRight:()->
    (@width-@offset_x)/@zoom

  worldBottom:()->
    (@height-@offset_y)/@zoom

  toWorld:(clientX,clientY)->
    b = @canvas.getBoundingClientRect()
    [(clientX-b.left-@offset_x)/@zoom,(clientY-b.top-@offset_y)/@zoom]

  contains:(clientX,clientY)->
    b = @canvas.getBoundingClientRect()
    clientX >= b.left and clientY >= b.top and clientX < b.right and clientY < b.bottom

  isTrackpad:(e)->
    time = Date.now()
    if not @wheel_time? or time-@wheel_time > 200
      @wheel_trackpad = @detectTrackpad(e)
    @wheel_time = time
    @wheel_trackpad

  detectTrackpad:(e)->
    return false if e.deltaMode != 0
    return true if e.deltaX != 0
    if e.wheelDeltaY? and e.wheelDeltaY != 0
      return e.wheelDeltaY%120 != 0
    Math.abs(e.deltaY) < 50

  mouseWheel:(e)->
    e.preventDefault()
    b = @canvas.getBoundingClientRect()
    x = e.clientX-b.left
    y = e.clientY-b.top
    if e.ctrlKey
      @zoomAt Math.exp(-Math.max(-50,Math.min(50,e.deltaY))*.01),x,y
    else if @isTrackpad(e)
      @pan -e.deltaX,-e.deltaY
    else
      dy = e.deltaY
      if e.deltaMode == 1
        dy *= 33
      else if e.deltaMode == 2
        dy *= 400
      dy = Math.max(-200,Math.min(200,dy))
      @zoomAt Math.pow(1.0015,-dy),x,y

  mouseDown:(event)->
    if event.button == 1 or @space_pressed
      event.preventDefault() if event.preventDefault?
      @grabbing = true
      @grab_x = event.clientX
      @grab_y = event.clientY
      @listener.updateCursor()
      return true
    false

  mouseMove:(event)->
    return false if not @grabbing
    dx = event.clientX-@grab_x
    dy = event.clientY-@grab_y
    @grab_x = event.clientX
    @grab_y = event.clientY
    @pan dx,dy
    true

  mouseUp:()->
    return false if not @grabbing
    @grabbing = false
    @listener.updateCursor()
    true

  getCursor:()->
    if @grabbing
      "grabbing"
    else if @space_pressed
      "grab"
    else
      null
