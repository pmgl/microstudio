class @FloatingWindow
  constructor:(@app,@elementid,@listener,@options = {})->
    @window = document.getElementById(@elementid)

    document.querySelector("##{@elementid}").addEventListener "mousedown",(event)=>
      @moveToFront()

    document.querySelector("##{@elementid} .titlebar").addEventListener "mousedown",(event)=>@startMove(event)
    if not @options.fixed_size
      document.querySelector("##{@elementid} .navigation .resize").addEventListener "mousedown",(event)=>@startResize(event)
    document.addEventListener "mousemove",(event)=>@mouseMove(event)
    document.addEventListener "mouseup",(event)=>@mouseUp(event)
    window.addEventListener "resize",()=>
      b = @window.getBoundingClientRect()
      @setPosition b.x - @getParentX(), b.y - @getParentY()

    document.querySelector("##{@elementid} .titlebar .minify").addEventListener "click",()=>@close()
    @max_ratio = .75

  moveToFront:()->
    list = document.getElementsByClassName "floating-window"
    for e in list
      if e.id == @elementid
        e.style["z-index"] = 11
      else
        e.style["z-index"] = 10
    return

  close:()->
    @shown = false
    document.getElementById("#{@elementid}").style.display = "none"
    if @listener? and @listener.floatingWindowClosed?
      @listener.floatingWindowClosed()

  show:()->
    @shown = true
    document.getElementById("#{@elementid}").style.display = "block"
    @moveToFront()

  startMove:(event)->
    @moving = true
    @drag_start_x = event.clientX
    @drag_start_y = event.clientY
    @drag_pos_x = @window.getBoundingClientRect().x - @getParentX()
    @drag_pos_y = @window.getBoundingClientRect().y - @getParentY()
    list = document.querySelectorAll "iframe"
    for e in list
      e.classList.add "ignoreMouseEvents"
    return

  startResize:(event)->
    @resizing = true
    @drag_start_x = event.clientX
    @drag_start_y = event.clientY
    @drag_size_w = @window.getBoundingClientRect().width
    @drag_size_h = @window.getBoundingClientRect().height
    list = document.querySelectorAll "iframe"
    for e in list
      e.classList.add "ignoreMouseEvents"
    return

  getParentX:()->
    if @window.parentNode?
      @window.parentNode.getBoundingClientRect().x
    else
      0
    
  getParentY:()->
    if @window.parentNode?
      @window.parentNode.getBoundingClientRect().y
    else
      0
    
  getParentWidth:()->
    if @window.parentNode? and @window.parentNode != document.body
      @window.parentNode.clientWidth
    else
      window.innerWidth

  getParentHeight:()->
    if @window.parentNode? and @window.parentNode != document.body
      @window.parentNode.clientHeight
    else
      window.innerHeight

  mouseMove:(event)->
    if @moving
      dx = event.clientX-@drag_start_x
      dy = event.clientY-@drag_start_y
      @setPosition(@drag_pos_x+dx,@drag_pos_y+dy)

    if @resizing
      dx = event.clientX-@drag_start_x
      dy = event.clientY-@drag_start_y
      w = Math.floor Math.max(200,Math.min(@getParentWidth()*@max_ratio,@drag_size_w+dx))
      h = Math.floor Math.max(200,Math.min(@getParentHeight()*@max_ratio,@drag_size_h+dy))
      if not @options.fixed_size
        @window.style.width = "#{w}px"
        @window.style.height = "#{h}px"
      b = @window.getBoundingClientRect()
      if w>@getParentWidth()-b.x or h>@getParentHeight()-b.y
        @setPosition(Math.min(b.x-@getParentX(),@getParentWidth()-w-4),Math.min(b.y-@getParentY(),@getParentHeight()-h-4))

      if @listener? and @listener.floatingWindowResized?
        @listener.floatingWindowResized()

  mouseUp:(event)->
    @moving = false
    @resizing = false
    list = document.querySelectorAll "iframe"
    for e in list
      e.classList.remove "ignoreMouseEvents"
    return

  setPosition:(x,y)->
    b = @window.getBoundingClientRect()
    x = Math.max(4-b.width/2,Math.min(@getParentWidth()-b.width/2-4,x))
    y = Math.max(4,Math.min(@getParentHeight()-b.height/2-4,y))
    @window.style.top = y+"px"
    @window.style.left = x+"px"

  resize:(x,y,w,h)->
    if not @options.fixed_size
      @window.style.width = "#{w}px"
      @window.style.height = "#{h}px"
    @setPosition(x,y)
