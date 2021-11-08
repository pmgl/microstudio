class @Knob
  constructor:(@canvas,@value=0.5,@listener)->
    @canvas.width = 40
    @canvas.height = 40
    @id = @canvas.id
    @type = @canvas.dataset.type
    @quantize = @canvas.dataset.quantize
    @value = .5
    @update()

    @canvas.addEventListener "mousedown",(event)=>
      @mouseDown event

    document.addEventListener "mousemove",(event)=>
      @mouseMove event

    document.addEventListener "mouseup",(event)=>
      @mouseUp event

  update:()->
    context = @canvas.getContext("2d")
    context.clearRect(0,0,@canvas.width,@canvas.height)

    context.strokeStyle = "rgba(255,255,255,.1)"
    context.lineWidth = 2
    context.beginPath()
    context.arc(@canvas.width/2,@canvas.height/2,@canvas.width/2-1,.7*Math.PI,2.3*Math.PI,false)
    context.stroke()

    context.beginPath()
    context.fillStyle = "rgba(0,0,0,.5)"
    context.arc(@canvas.width/2,@canvas.height/2,@canvas.width/2-2,0,Math.PI*2,false)
    context.fill()

    context.beginPath()
    context.fillStyle = "rgba(255,255,255,.1)"
    context.arc(@canvas.width/2,@canvas.height/2,@canvas.width/2-6,0,Math.PI*2,false)
    context.fill()

    context.beginPath()
    context.lineWidth = 2
    context.strokeStyle = "hsl(200,100%,70%)"
    alpha = (.7+(2.3-.7)*@value)*Math.PI
    x1 = @canvas.width/2+(@canvas.width/2-14)*Math.cos(alpha)
    y1 = @canvas.height/2+(@canvas.width/2-14)*Math.sin(alpha)
    x2 = @canvas.width/2+(@canvas.width/2-8)*Math.cos(alpha)
    y2 = @canvas.height/2+(@canvas.width/2-8)*Math.sin(alpha)
    context.moveTo x1,y1
    context.lineTo x2,y2
    context.stroke()

    context.strokeStyle = "hsl(200,100%,70%)"
    context.lineWidth = 2

    if @type == "centered"
      if @value>.5
        context.beginPath()
        context.arc(@canvas.width/2,@canvas.height/2,@canvas.width/2-1,1.5*Math.PI,(.7+(2.3-.7)*@value)*Math.PI,false)
        context.stroke()
      else if @value<.5
        context.shadowColor = "hsl(20,100%,70%)"
        context.strokeStyle = "hsl(20,100%,70%)"
        context.beginPath()
        context.arc(@canvas.width/2,@canvas.height/2,@canvas.width/2-1,(.7+(2.3-.7)*@value)*Math.PI,1.5*Math.PI,false)
        context.stroke()

    else
      context.beginPath()
      context.arc(@canvas.width/2,@canvas.height/2,@canvas.width/2-1,.7*Math.PI,(.7+(2.3-.7)*@value)*Math.PI,false)
      context.stroke()

    context.shadowBlur = context.shadowOpacity = 0

  mouseDown:(event)->
    @mousepressed = true
    @start_y = event.clientY
    @start_value = @value

  mouseMove:(event)->
    return if not @mousepressed
    dy = event.clientY-@start_y
    v = Math.max(0,Math.min(1,@start_value-dy*.005))

    if @quantize and @quantize>0
      v = Math.round(v*@quantize)/@quantize

    if v != @value
      @value = v
      @update()
      @listener.knobChange(@id,@value)

  mouseUp:(event)->
    @mousepressed = false
