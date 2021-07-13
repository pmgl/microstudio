class @SplitBar
  constructor:(id,@type="horizontal")->
    @element = document.getElementById(id)
    @side1 = @element.childNodes[0]
    @splitbar = @element.childNodes[1]
    @side2 = @element.childNodes[2]
    @position = 50

    @splitbar.addEventListener "mousedown", (event)=>
      @dragging = true
      @drag_start_x = event.clientX
      @drag_start_y = event.clientY
      @drag_position = @position
      list = document.getElementsByTagName("iframe")
      for e in list
        e.classList.add "ignoreMouseEvents"
      return

    document.addEventListener "mousemove", (event)=>
      if @dragging
        switch @type
          when "horizontal"
            dx = (event.clientX-@drag_start_x)/(@element.clientWidth-@splitbar.clientWidth)*100
            ns = Math.round(Math.max(0,Math.min(100,@drag_position+dx)))
            if ns != @position
              @position = ns
              window.dispatchEvent(new Event('resize'))
          else
            dy = (event.clientY-@drag_start_y)/(@element.clientHeight-@splitbar.clientHeight)*100
            ns = Math.round(Math.max(0,Math.min(100,@drag_position+dy)))
            if ns != @position
              @position = ns
              window.dispatchEvent(new Event('resize'))

    document.addEventListener "mouseup", (event)=>
      @dragging = false
      list = document.getElementsByTagName("iframe")
      for e in list
        e.classList.remove "ignoreMouseEvents"
      return

    window.addEventListener "resize",(event)=>
      @update()

    @update()

  setPosition:(@position)->
    @update()

  update:()->
    return if @element.clientWidth == 0 or @element.clientHeight == 0
    switch @type
      when "horizontal"
        @total_width = w = @element.clientWidth-@splitbar.clientWidth

        w1 = Math.round(@position/100*w)
        w2 = w1+@splitbar.clientWidth
        w3 = @element.clientWidth-w2

        @side1.style.width = w1+"px"
        @splitbar.style.left = w1+"px"
        @side2.style.width = w3+"px"
      else
        @total_height = h = @element.clientHeight-@splitbar.clientHeight

        h1 = Math.round(@position/100*h)
        h2 = h1+@splitbar.clientHeight
        h3 = @element.clientHeight-h2

        @side1.style.height = h1+"px"
        @splitbar.style.top = h1+"px"
        @side2.style.height = h3+"px"
