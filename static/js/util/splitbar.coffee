class @SplitBar
  constructor:(@id,@type="horizontal")->
    @element = document.getElementById(@id)
    @side1 = @element.childNodes[0]
    @splitbar = @element.childNodes[1]
    @side2 = @element.childNodes[2]
    @position = 50

    @closed1 = false
    @closed2 = false

    @splitbar_size = 10

    @splitbar.addEventListener "touchstart", (event) => @startDrag(event.touches[0]) if event.touches? and event.touches[0]?
    document.addEventListener "touchmove", (event) => @drag(event.touches[0]) if event.touches? and event.touches[0]?
    document.addEventListener "touchend" , (event) => @stopDrag()
    document.addEventListener "touchcancel" , (event) => @stopDrag()

    @splitbar.addEventListener "mousedown", (event)=> @startDrag(event)
    document.addEventListener "mousemove", (event)=> @drag(event)
    document.addEventListener "mouseup", (event)=> @stopDrag(event)

    window.addEventListener "resize",(event)=>
      @update()

    @update()

  startDrag:(event)->
    @dragging = true
    @drag_start_x = event.clientX
    @drag_start_y = event.clientY
    @drag_position = @position
    list = document.getElementsByTagName("iframe")
    for e in list
      e.classList.add "ignoreMouseEvents"
    return

  drag:(event)->
    if @dragging
      switch @type
        when "horizontal"
          dx = (event.clientX-@drag_start_x)/(@element.clientWidth-@splitbar.clientWidth)*100
          ns = Math.round(Math.max(0,Math.min(100,@drag_position+dx)))
          if ns != @position
            @position = ns
            window.dispatchEvent(new Event('resize'))
            @savePosition()
        else
          dy = (event.clientY-@drag_start_y)/(@element.clientHeight-@splitbar.clientHeight)*100
          ns = Math.round(Math.max(0,Math.min(100,@drag_position+dy)))
          if ns != @position
            @position = ns
            window.dispatchEvent(new Event('resize'))
            @savePosition()

  stopDrag:()->
    @dragging = false
    list = document.getElementsByTagName("iframe")
    for e in list
      e.classList.remove "ignoreMouseEvents"
    return

  initPosition:( default_position = 50 )->
    load = localStorage.getItem("splitbar-#{@id}")
    if load? and load >= 0 and load <= 100
      if load >= 98 or load <= 2
        load = default_position
      @setPosition(load*1,false)
    else
      @setPosition(default_position,false)

  setPosition:(@position,save=true)->
    @update()
    @savePosition() if save

  savePosition:()->
    localStorage.setItem("splitbar-#{@id}",@position)

  update:()->
    return if @element.clientWidth == 0 or @element.clientHeight == 0

    if @auto?
      if @element.clientWidth > @element.clientHeight*@auto
        @type = "horizontal"
        @splitbar.style.width = "10px"
        @splitbar.style.height = "unset"
        @splitbar.style.top = 0
        @splitbar.style.bottom = 0
        @splitbar.style.left = "unset"
        @splitbar.style.right = "unset"
        @splitbar.style.cursor = "ew-resize"

        @side1.style.left = 0
        @side1.style.right = "unset"
        @side1.style.height = "unset"
        @side1.style.top = 0
        @side1.style.bottom = 0

        @side2.style.right = 0
        @side2.style.left = "unset"
        @side2.style.height = "unset"
        @side2.style.top = 0
        @side2.style.bottom = 0

        @side1.classList.remove "vertical-split"
        @side1.classList.add "horizontal-split"
        @side2.classList.remove "vertical-split"
        @side2.classList.add "horizontal-split"
      else
        @type = "vertical"
        @splitbar.style.height = "10px"
        @splitbar.style.width = "unset"
        @splitbar.style.left = 0
        @splitbar.style.right = 0
        @splitbar.style.top = "unset"
        @splitbar.style.bottom = "unset"
        @splitbar.style.cursor = "ns-resize"

        @side1.style.top = 0
        @side1.style.width = "unset"
        @side1.style.bottom = "unset"
        @side1.style.left = 0
        @side1.style.right = 0

        @side2.style.bottom = 0
        @side2.style.width = "unset"
        @side2.style.top = "unset"
        @side2.style.left = 0
        @side2.style.right = 0

        @side1.classList.add "vertical-split"
        @side1.classList.remove "horizontal-split"
        @side2.classList.add "vertical-split"
        @side2.classList.remove "horizontal-split"

        
    switch @type
      when "horizontal"
        @total_width = w = @element.clientWidth-@splitbar.clientWidth

        if @closed2
          @side1.style.width = @element.clientWidth+"px"
          @splitbar.style.display = "none"
          @side2.style.display = "none"
        else if @closed1
          @side2.style.width = @element.clientWidth+"px"
          @splitbar.style.display = "none"
          @side1.style.display = "none"
        else
          @side1.style.display = "block"
          @side2.style.display = "block"

          w1 = Math.min(Math.max(1,Math.round(@position/100*w)),Math.round(w-1))
          w2 = w1+Math.max(@splitbar.clientWidth,@splitbar_size)
          w3 = @element.clientWidth-w2

          @side1.style.width = w1+"px"
          @splitbar.style.left = w1+"px"
          @side2.style.width = w3+"px"
          @splitbar.style.display = "block"
      else
        @total_height = h = @element.clientHeight-@splitbar.clientHeight

        h1 = Math.round(@position/100*h)
        h2 = h1+@splitbar.clientHeight
        h3 = @element.clientHeight-h2

        @side1.style.height = h1+"px"
        @splitbar.style.top = h1+"px"
        @side2.style.height = h3+"px"
