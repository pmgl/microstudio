class @SynthWheel
  constructor:(@canvas,@listener)->
    @update()

  update:()->
    h = @canvas.height-20
    w = @canvas.width-20
    context = @canvas.getContext "2d"
    context.globalAlpha = 1
    context.shadowBlur = 10
    context.shadowOpacity = 1
    context.shadowColor = "#000"
    context.fillStyle = "#000"
    context.fillRect 9,9,w+2,h+2
    context.beginPath()
    context.ellipse @canvas.width/2,@canvas.height/2,w/2+5,h/2,0,0,Math.PI*2
    context.fill()
    context.shadowBlur = 0
    context.shadowOpacity = 0
    context.fillStyle = "#FFF"
    for i in [0..h]
      y = (i-h/2)/h*Math.PI/2
      a = Math.asin(y)
      p = Math.cos(a)*Math.cos(-Math.PI/8)+Math.sin(a)*Math.sin(-Math.PI/8)
      context.globalAlpha = p
      context.fillRect(11,10+i,w-2,1)

    for i in [-Math.PI/4..Math.PI/4] by .05
      y = @canvas.height/2+Math.sin(i)*h/2/Math.sin(Math.PI/4)
      context.fillStyle = "rgba(0,0,0,.3)"
      context.globalAlpha = 1
      context.fillRect(11,y,w-2,Math.abs(Math.cos(i)))
