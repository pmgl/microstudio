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
      @setPosition b.x,b.y

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
    @drag_pos_x = @window.getBoundingClientRect().x
    @drag_pos_y = @window.getBoundingClientRect().y

  startResize:(event)->
    @resizing = true
    @drag_start_x = event.clientX
    @drag_start_y = event.clientY
    @drag_size_w = @window.getBoundingClientRect().width
    @drag_size_h = @window.getBoundingClientRect().height

  mouseMove:(event)->
    if @moving
      dx = event.clientX-@drag_start_x
      dy = event.clientY-@drag_start_y
      @setPosition(@drag_pos_x+dx,@drag_pos_y+dy)

    if @resizing
      dx = event.clientX-@drag_start_x
      dy = event.clientY-@drag_start_y
      w = Math.floor Math.max(200,Math.min(window.innerWidth*@max_ratio,@drag_size_w+dx))
      h = Math.floor Math.max(200,Math.min(window.innerHeight*@max_ratio,@drag_size_h+dy))
      if not @options.fixed_size
        @window.style.width = "#{w}px"
        @window.style.height = "#{h}px"
      b = @window.getBoundingClientRect()
      if w>window.innerWidth-b.x or h>window.innerHeight-b.y
        @setPosition(Math.min(b.x,window.innerWidth-w-4),Math.min(b.y,window.innerHeight-h-4))

      if @listener? and @listener.floatingWindowResized?
        @listener.floatingWindowResized()

  mouseUp:(event)->
    @moving = false
    @resizing = false

  setPosition:(x,y)->
    b = @window.getBoundingClientRect()
    x = Math.max(4-b.width/2,Math.min(window.innerWidth-b.width/2-4,x))
    y = Math.max(4,Math.min(window.innerHeight-b.height/2-4,y))
    @window.style.top = y+"px"
    @window.style.left = x+"px"

  resize:(x,y,w,h)->
    if not @options.fixed_size
      @window.style.width = "#{w}px"
      @window.style.height = "#{h}px"
    @setPosition(x,y)
