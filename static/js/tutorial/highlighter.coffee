class @Highlighter
  constructor:(@tutorial)->
    @shown = false
    @canvas = document.getElementById("highlighter")
    @arrow = document.getElementById("highlighter-arrow")

  highlight:(ref,auto)->
    element = document.querySelector(ref) if ref?
    if element?
      @highlighted = element
      rect = element.getBoundingClientRect()
      if rect.width == 0
        @hide()
        return

      x = rect.x+rect.width*.5
      y = rect.y+rect.height*.5
      w = Math.floor(rect.width*1)+40
      h = Math.floor(rect.height*1)+40
      @canvas.width = w
      @canvas.height = h
      @canvas.style.width = "#{w}px"
      @canvas.style.height = "#{h}px"
      @canvas.style.top = "#{Math.round(y-h/2)}px"
      @canvas.style.left = "#{Math.round(x-w/2)}px"
      @canvas.style.display = "block"
      @shown = true
      @updateCanvas()
      clearTimeout(@timeout) if @timeout?
      @timeout = setTimeout (()=> @justHide()),6000
      if auto
        @setAuto(element)
      else
        @remove_event_listener() if @remove_event_listener?
    else
      @hide()

  setAuto:(element)->
    if element.tagName == "INPUT" and element.type == "text"
      f = (event)=>
        if event.key == "Enter"
          @tutorial.nextStep()
          element.removeEventListener "keydown",f
      element.addEventListener "keydown",f
      @remove_event_listener() if @remove_event_listener?
      @remove_event_listener = ()=>
        element.removeEventListener "keydown",f
    else
      f = ()=>
        @tutorial.nextStep()
        element.removeEventListener "click",f
      element.addEventListener "click",f

      @remove_event_listener() if @remove_event_listener?
      @remove_event_listener = ()=>
        element.removeEventListener "click",f

  hide:()->
    @shown = false
    @canvas.style.display = "none"
    @remove_event_listener() if @remove_event_listener?

  justHide:()->
    @shown = false
    @canvas.style.display = "none"

  updateCanvas:()->
    return if not @shown
    requestAnimationFrame ()=>@updateCanvas()
    context = @canvas.getContext "2d"
    context.clearRect(0,0,@canvas.width,@canvas.height)
    return if @highlighted.getBoundingClientRect().width == 0
    context.shadowOpacity = 1
    context.shadowBlur = 5
    context.shadowColor = "#000"

    grd = context.createLinearGradient(0,0,@canvas.width,@canvas.height)
    grd.addColorStop 0,"hsl(0,50%,60%)"
    grd.addColorStop 1,"hsl(60,50%,60%)"
    context.strokeStyle = "hsl(30,100%,70%)"
    context.lineWidth = 3
    context.lineCap = "round"
    w = @canvas.width/2-5
    h = @canvas.height/2-5
    amount = (Date.now()%1000)/500

    context.globalAlpha = Math.min(1,2-amount)
    amount = Math.min(1,amount)

    context.beginPath()
    context.moveTo(@canvas.width/2+w,@canvas.height/2)
    for i in [0..amount] by .01
      x = Math.cos(i*2*Math.PI)
      y = Math.sin(i*2*Math.PI)
      x = if x>0 then Math.sqrt(x) else -Math.sqrt(-x)
      y = if y>0 then Math.sqrt(y) else -Math.sqrt(-y)
      context.lineTo(@canvas.width/2+x*w,@canvas.height/2+y*h)
    #context.ellipse(@canvas.width/2,@canvas.height/2,w,h,Math.PI,Math.PI*2*Math.min(1,amount),0,true)
    context.stroke()
