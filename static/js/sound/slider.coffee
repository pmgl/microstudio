class @Slider
  constructor:(@canvas,@value=0.5,@listener)->
    @canvas.width = 40
    @canvas.height = 110
    @margin = 8
    @id = @canvas.id
    @type = @canvas.dataset.type
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

    context.strokeStyle = "rgba(0,0,0,.5)"
    context.lineWidth = 6
    #context.beginPath()
    #context.moveTo 3,@canvas.height-@margin+1
    #context.lineTo 3,@margin-1
    #context.stroke()

    for i in [0..16] by 1
      if i%2 == 1
        op = .25
      else if (i/2)%2 == 1
        op = .25
      else if (i/4)%2 == 1
        op = .5
      else
        op = 1

      context.lineWidth = op*3
      context.strokeStyle = "rgba(255,255,255,.5)"
      context.beginPath()
      context.moveTo @canvas.width*.15,@margin+i*(@canvas.height-2*@margin)/16
      context.lineTo @canvas.width*.85,@margin+i*(@canvas.height-2*@margin)/16
      context.stroke()

    h = @canvas.height-2*@margin
    context.clearRect @canvas.width/2-7,@margin-4,14,h+8
    context.fillStyle = "hsl(200,50%,10%)"
    context.fillRoundRect @canvas.width/2-3,@margin-4,6,h+8,3

    context.shadowBlur = 4
    context.shadowColor = "hsl(200,100%,70%)"
    context.shadowOpacity = 1
    context.strokeStyle = "hsl(200,100%,70%)"
    context.lineWidth = 1.5
    context.beginPath()
    context.moveTo @canvas.width/2,@canvas.height-@margin
    context.lineTo @canvas.width/2,@canvas.height-@margin-@value*h
    context.stroke()
    context.shadowBlur = context.shadowOpacity = 0

    context.fillStyle = "#FFF"
    context.shadowBlur = 4
    context.shadowColor = "#000"
    context.shadowOpacity = 1
    context.fillRoundRect @canvas.width*.25,@canvas.height-@margin-h*@value-8,@canvas.width*.5,16,3
    context.shadowBlur = context.shadowOpacity = 0
    context.fillStyle = "#AAA"
    context.fillRoundRect @canvas.width*.25+1,@canvas.height-@margin-h*@value+1,@canvas.width*.5-2,7,2
    context.fillStyle = "#000"
    #context.fillRect @canvas.width*.3,@canvas.height-@margin-h*@value-.5,@canvas.width*.4,1


  mouseDown:(event)->
    @mousepressed = true
    @start_y = event.clientY
    @start_value = @value

  mouseMove:(event)->
    return if not @mousepressed
    dy = event.clientY-@start_y
    v = Math.max(0,Math.min(1,@start_value-dy*.005))
    if v != @value
      @value = v
      @update()
      @listener.knobChange(@id,@value)

  mouseUp:(event)->
    @mousepressed = false
