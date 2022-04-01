class @RulerCanvas
  constructor:(@app)->
    @canvas = document.getElementById("ruler-canvas")
    @update()

  resize:(width,height,top)->
    @canvas.style["margin-top"] = top+"px"
    @canvas.style.width = width+"px"
    @canvas.style.height = height+"px"

    @canvas.width = width
    @canvas.height = height

  hide:()->
    @canvas.style.display = "none"

  show:()->
    @canvas.style.display = "inline-block"

  showX:(x,y,w,h)->
    @show()

    @current = ()=>
      context = @canvas.getContext "2d"
      context.save()
      context.translate @canvas.width/2,@canvas.height/2
      ratio = Math.min(@canvas.width,@canvas.height)/200
      context.scale ratio,ratio

      w1 = @canvas.width*ratio
      h1 = @canvas.height*ratio

      w2 = Math.round(w1/2)
      h2 = Math.round(h1/2)

      context.clearRect(-w2,-h2,w1,h1)
      @drawXAxis(context)
      @drawDottedLine context,x,0,x,-y
      @drawLine context,x-3,-y-3,x+3,-y+3
      @drawLine context,x+3,-y-3,x-3,-y+3

      context.strokeStyle = "rgba(0,0,0,.3)"
      context.strokeRect x-w/2+.5,-y-h/2+.5,w,h
      context.strokeStyle = "rgba(255,255,255,.3)"
      context.strokeRect x-w/2,-y-h/2,w,h

      context.restore()

  showY:(x,y,w,h)->
    @show()
    @current = ()=>
      context = @canvas.getContext "2d"
      context.save()
      context.translate @canvas.width/2,@canvas.height/2
      ratio = Math.min(@canvas.width,@canvas.height)/200
      context.scale ratio,ratio

      w1 = @canvas.width*ratio
      h1 = @canvas.height*ratio

      w2 = Math.round(w1/2)
      h2 = Math.round(h1/2)

      context.clearRect(-w2,-h2,w1,h1)
      @drawYAxis(context)
      @drawDottedLine context,0,-y,x,-y
      @drawLine context,x-3,-y-3,x+3,-y+3
      @drawLine context,x+3,-y-3,x-3,-y+3

      context.strokeStyle = "rgba(0,0,0,.3)"
      context.strokeRect x-w/2+.5,-y-h/2+.5,w,h
      context.strokeStyle = "rgba(255,255,255,.3)"
      context.strokeRect x-w/2,-y-h/2,w,h

      context.restore()

  showW:(x,y,w,h)->
    @show()
    @current = ()=>
      context = @canvas.getContext "2d"
      context.save()
      context.translate @canvas.width/2,@canvas.height/2
      ratio = Math.min(@canvas.width,@canvas.height)/200
      context.scale ratio,ratio

      w1 = @canvas.width*ratio
      h1 = @canvas.height*ratio

      w2 = Math.round(w1/2)
      h2 = Math.round(h1/2)

      context.clearRect(-w2,-h2,w1,h1)
      @drawLine context,x-3,-y-3,x+3,-y+3
      @drawLine context,x+3,-y-3,x-3,-y+3

      context.strokeStyle = "rgba(0,0,0,.3)"
      context.strokeRect x-w/2+.5,-y-h/2+.5,w,h
      context.strokeStyle = "rgba(255,255,255,.3)"
      context.strokeRect x-w/2,-y-h/2,w,h

      if y>0
        @drawHorizontalArrow(context,x,-y+h/2+10,w)
      else
        @drawHorizontalArrow(context,x,-y-h/2-10,w)

      context.restore()

  showH:(x,y,w,h)->
    @show()
    @current = ()=>
      context = @canvas.getContext "2d"
      context.save()
      context.translate @canvas.width/2,@canvas.height/2
      ratio = Math.min(@canvas.width,@canvas.height)/200
      context.scale ratio,ratio

      w1 = @canvas.width*ratio
      h1 = @canvas.height*ratio

      w2 = Math.round(w1/2)
      h2 = Math.round(h1/2)

      context.clearRect(-w2,-h2,w1,h1)
      @drawLine context,x-3,-y-3,x+3,-y+3
      @drawLine context,x+3,-y-3,x-3,-y+3

      context.strokeStyle = "rgba(0,0,0,.3)"
      context.strokeRect x-w/2+.5,-y-h/2+.5,w,h
      context.strokeStyle = "rgba(255,255,255,.3)"
      context.strokeRect x-w/2,-y-h/2,w,h

      if x>0
        @drawVerticalArrow(context,x-w/2-10,-y,h)
      else
        @drawVerticalArrow(context,x+w/2+10,-y,h)

      context.restore()

  showBox:(x,y,w,h)->
    @show()
    @current = ()=>
      context = @canvas.getContext "2d"
      context.save()
      context.translate @canvas.width/2,@canvas.height/2
      ratio = Math.min(@canvas.width,@canvas.height)/200
      context.scale ratio,ratio

      w1 = @canvas.width*ratio
      h1 = @canvas.height*ratio

      w2 = Math.round(w1/2)
      h2 = Math.round(h1/2)

      context.clearRect(-w2,-h2,w1,h1)
      @drawLine context,x-3,-y-3,x+3,-y+3
      @drawLine context,x+3,-y-3,x-3,-y+3

      context.strokeStyle = "rgba(0,0,0,.3)"
      context.strokeRect x-w/2+.5,-y-h/2+.5,w,h
      context.strokeStyle = "rgba(255,255,255,.3)"
      context.strokeRect x-w/2,-y-h/2,w,h

      context.restore()

  drawHorizontalArrow:(context,x,y,w)->
    @drawLine context,x-w/2+2,y,x+w/2-2,y

    @drawLine context,x-w/2,y-5,x-w/2,y+5
    @drawLine context,x+w/2,y-5,x+w/2,y+5

    @drawLine context,x-w/2+1,y,x-w/2+6,y+5
    @drawLine context,x-w/2+1,y,x-w/2+6,y-5

    @drawLine context,x+w/2-1,y,x+w/2-6,y+5
    @drawLine context,x+w/2-1,y,x+w/2-6,y-5

  drawVerticalArrow:(context,x,y,h)->
    @drawLine context,x,y-h/2+2,x,y+h/2-2

    @drawLine context,x-5,y-h/2,x+5,y-h/2
    @drawLine context,x-5,y+h/2,x+5,y+h/2

    @drawLine context,x,y-h/2+1,x+5,y-h/2+6,
    @drawLine context,x,y-h/2+1,x-5,y-h/2+6

    @drawLine context,x,y+h/2-1,x+5,y+h/2-6
    @drawLine context,x,y+h/2-1,x-5,y+h/2-6

  update:()->
    requestAnimationFrame(()=>@update())
    return if not (@canvas.width>0 and @canvas.height>0)
    if @current?
      @current()
      @current = null

  drawLine:(context,x1,y1,x2,y2)->
    context.strokeStyle = "rgba(0,0,0,.8)"
    context.beginPath()
    context.moveTo x1+.5,y1+.5
    context.lineTo x2+.5,y2+.5
    context.stroke()
    context.strokeStyle = "rgba(255,255,255,.8)"
    context.beginPath()
    context.moveTo x1,y1
    context.lineTo x2,y2
    context.stroke()

  drawDottedLine:(context,x1,y1,x2,y2)->
    context.setLineDash([2,2])
    @drawLine(context,x1,y1,x2,y2)
    context.setLineDash([])

  drawText:(context,text,x,y)->
    context.font = "6pt Arial"
    context.textAlign = "center"
    context.textBaseline = "middle"

    context.fillStyle = "rgba(0,0,0,.8)"
    context.fillText text,x+.5,y+.5
    context.fillStyle = "rgba(255,255,255,.8)"
    context.fillText text,x,y

  drawXAxis:(context)->
    @drawLine context,0,-5,0,5

    ratio = 200/Math.min(@canvas.width,@canvas.height)
    w = @canvas.width*ratio
    h = @canvas.height*ratio

    w2 = Math.round(w/2)
    h2 = Math.round(h/2)

    for i in [50..w2-50] by 50
      @drawLine context,i,-2,i,2
      @drawLine context,-i,-2,-i,2
      @drawText context,"+#{i}",i,12
      @drawText context,"-#{i}",-i,12

    @drawText context,"0",0,12

    @drawLine context,-w2+2,0,w2-2,0

    @drawText context,"+#{w2}",w2-12,12
    @drawText context,"-#{w2}",-w2+12,12

    @drawLine context,-w2+1,0,-w2+6,5
    @drawLine context,-w2+1,0,-w2+6,-5
    @drawLine context,-w2+1,-5,-w2+1,5

    @drawLine context,w2-1,0,w2-6,5
    @drawLine context,w2-1,0,w2-6,-5
    @drawLine context,w2-1,-5,w2-1,5


  drawYAxis:(context)->
    @drawLine context,-5,0,5,0

    ratio = 200/Math.min(@canvas.width,@canvas.height)
    w = @canvas.width*ratio
    h = @canvas.height*ratio

    w2 = Math.round(w/2)
    h2 = Math.round(h/2)

    for i in [50..h2-50] by 50
      @drawLine context,-2,i,2,i
      @drawLine context,-2,-i,2,-i
      @drawText context,"+#{i}",-12,-i
      @drawText context,"-#{i}",-12,i

    @drawText context,"0",-12,0

    @drawLine context,0,-h2+2,0,h2-2

    @drawText context,"+#{h2}",-12,-h2+12
    @drawText context,"-#{h2}",-12,h2-12

    @drawLine context,0,-h2+1,5,-h2+6
    @drawLine context,0,-h2+1,-5,-h2+6
    @drawLine context,-5,-h2+1,5,-h2+1

    @drawLine context,0,h2-1,5,h2-6
    @drawLine context,0,h2-1,-5,h2-6
    @drawLine context,-5,h2-1,5,h2-1

  drawBounds:(context)->
    context.lineWidth = 1

    @drawLine context,-5,0,5,0
    @drawLine context,0,-5,0,5

    ratio = 200/Math.min(@canvas.width,@canvas.height)
    w = @canvas.width*ratio
    h = @canvas.height*ratio

    w2 = Math.round(w/2)
    h2 = Math.round(h/2)

    @drawLine context,w/2-1,-5,w/2-1,5
    for i in [50..w2-1] by 50
      @drawLine context,i,-2,i,2

    @drawLine context,-w/2+1,-5,-w/2+1,5
    for i in [50..w2-1] by 50
      @drawLine context,-i,-2,-i,2
    #@drawLine context,-w/2+5,0,-w/2,0

    @drawLine context,-5,-h/2+1,5,-h/2+1
    for i in [50..h2-1] by 50
      @drawLine context,-2,-i,2,-i
    #@drawLine context,0,-h/2+5,0,-h/2

    @drawLine context,-5,h/2-1,5,h/2-1
    for i in [50..h2-1] by 50
      @drawLine context,-2,i,2,i
    #@drawLine context,0,h/2-5,0,h/2

    @drawText context,"0,0",0,12

    @drawText context,"+#{w2}",w2-12,12
    @drawText context,"-#{w2}",-w2+12,12
    @drawText context,"+#{h2}",20,-h2+5
    @drawText context,"-#{h2}",20,h2-5

  showPolygon:(args,index)->
    @show()

    @current = ()=>
      context = @canvas.getContext "2d"
      context.save()
      context.translate @canvas.width/2,@canvas.height/2
      ratio = Math.min(@canvas.width,@canvas.height)/200
      context.scale ratio,ratio

      w1 = @canvas.width*ratio
      h1 = @canvas.height*ratio

      w2 = Math.round(w1/2)
      h2 = Math.round(h1/2)

      context.clearRect(-w2,-h2,w1,h1)
      if index%2 == 0
        @drawXAxis(context)
      else
        @drawYAxis(context)

      num = Math.floor((args.length+1)/2)
      for i in [0..num-1] by 1
        x = args[i*2]
        y = args[i*2+1]
        if not y? or typeof y != "number"
          y = 0

        if num>0
          @drawLine context,px,-py,x,-y

        px = x
        py = y

        if i*2 == index
          @drawDottedLine context,x,0,x,-y
        else if i*2+1 == index
          @drawDottedLine context,0,-y,x,-y

        @drawLine context,x-3,-y-3,x+3,-y+3
        @drawLine context,x+3,-y-3,x-3,-y+3

      context.restore()
