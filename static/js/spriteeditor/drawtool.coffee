class @DrawTool
  constructor:(@name,@icon)->
    @parameters = {}
    @hsymmetry = false
    @vsymmetry = false
    @tile = true

  getSize:(sprite)->
    if @parameters["Size"]
      size = Math.min(sprite.width,sprite.height)*@parameters["Size"].value/100/2
      size = 1+Math.floor(size/2)*2
    else
      1

  start:(sprite,x,y,button)->
    @pixels = {}
    @move(sprite,x,y,button)

  move:(sprite,x,y,button,pass=0)->
    if pass<1 and @vsymmetry
      nx = sprite.width-1-x
      @move(sprite,nx,y,button,1)
    if pass<2 and @hsymmetry
      ny = sprite.height-1-y
      @move(sprite,x,ny,button,2)

    size = @getSize(sprite)
    d = (size-1)/2
    for i in [-d..d] by 1
      for j in [-d..d] by 1
        xx = x+i
        yy = y+j
        if @tile
          for ii in [-1..1] by 1
            for jj in [-1..1] by 1
              @preprocessPixel(sprite,xx+ii*sprite.width,yy+jj*sprite.height,button)
        else
          @preprocessPixel(sprite,xx,yy,button)

  preprocessPixel:(sprite,x,y,button)->
    return if x<0 or x>=sprite.width or y<0 or y>=sprite.height
    if not @pixels["#{x}-#{y}"]?
      @pixels["#{x}-#{y}"] = true
      @processPixel(sprite,x,y,button)

  processPixel:(sprite,x,y)->

  @tools: []

class @PencilTool extends @DrawTool
  constructor:()->
    super("Pencil","fa-pencil-alt")

    @parameters["Size"] =
      type: "range"
      value: 0

    @parameters["Opacity"] =
      type: "range"
      value: 100

    @parameters["Color"] =
      type: "color"
      value: "#FFF"

  processPixel:(sprite,x,y,button)->
    if button == 2
      sprite.erasePixel x,y,@parameters["Opacity"].value/100
    else
      c = sprite.getContext()
      c.globalAlpha = @parameters["Opacity"].value/100
      c.fillStyle = @parameters["Color"].value
      c.fillRect x,y,1,1
      c.globalAlpha = 1

@DrawTool.tools.push new @PencilTool()

class @EraserTool extends @DrawTool
  constructor:()->
    super("Eraser","fa-eraser")

    @parameters["Size"] =
      type: "range"
      value: 0

    @parameters["Opacity"] =
      type: "range"
      value: 100

  processPixel:(sprite,x,y)->
    sprite.erasePixel x,y,@parameters["Opacity"].value/100

@DrawTool.tools.push new @EraserTool()

class @FillTool extends @DrawTool
  constructor:()->
    super("Fill","fa-fill-drip")

    @parameters["Threshold"] =
      type: "range"
      value: 0

    @parameters["Opacity"] =
      type: "range"
      value: 100

    @parameters["Color"] =
      type: "color"
      value: "#FFF"

  start:(sprite,x,y)->
    return if x<0 or y<0 or x>=sprite.width or y>=sprite.height
    threshold = @parameters["Threshold"].value/100*255+1
    alpha = @parameters["Opacity"].value/100

    c = sprite.getContext()
    ref = c.getImageData(x,y,1,1)

    data = c.getImageData(0,0,sprite.width,sprite.height)
    c.clearRect(x,y,1,1)
    c.globalAlpha = alpha
    c.fillStyle = @parameters["Color"].value
    c.fillRect(x,y,1,1)
    c.globalAlpha = 1

    fill = c.getImageData(x,y,1,1)

    list = [[x,y]]
    table = {}
    table["#{x}-#{y}"] = true
    check = (x,y)->
      return false if x<0 or y<0 or x>=sprite.width or y>=sprite.height
      return false if table["#{x}-#{y}"]
      index = 4*(x+y*sprite.width)
      dr = Math.abs(data.data[index]-ref.data[0])
      dg = Math.abs(data.data[index+1]-ref.data[1])
      db = Math.abs(data.data[index+2]-ref.data[2])
      da = Math.abs(data.data[index+3]-ref.data[3])
      Math.max(dr,dg,db,da)<threshold

    while list.length>0
      p = list.splice(0,1)[0]
      x = p[0]
      y = p[1]
      index = 4*(x+y*sprite.width)
      data.data[index] = fill.data[0]
      data.data[index+1] = fill.data[1]
      data.data[index+2] = fill.data[2]
      data.data[index+3] = fill.data[3]

      if check(x-1,y)
        table["#{x-1}-#{y}"] = true
        list.push [x-1,y]
      if check(x+1,y)
        table["#{x+1}-#{y}"] = true
        list.push [x+1,y]
      if check(x,y-1)
        table["#{x}-#{y-1}"] = true
        list.push [x,y-1]
      if check(x,y+1)
        table["#{x}-#{y+1}"] = true
        list.push [x,y+1]

    c.putImageData(data,0,0)
    return

  move:(sprite,x,y)->

@DrawTool.tools.push new @FillTool()


class @BrightenTool extends @DrawTool
  constructor:(parent)->
    super("Brighten","fa-sun")

    @parameters = parent.parameters

  processPixel:(sprite,x,y)->
    amount = @parameters["Amount"].value/100
    c = sprite.getContext()
    data = c.getImageData(x,y,1,1)
    r = data.data[0]
    g = data.data[1]
    b = data.data[2]
    v = (r+g+b)/3
    dr = r-v
    dg = g-v
    db = b-v
    v = v*(1+amount*.5)
    data.data[0] = Math.min(255,v+dr)
    data.data[1] = Math.min(255,v+dg)
    data.data[2] = Math.min(255,v+db)
    c.putImageData data,x,y

#@DrawTool.tools.push new @BrightenTool()

class @DarkenTool extends @DrawTool
  constructor:(parent)->
    super("Darken","fa-moon")

    @parameters = parent.parameters

  processPixel:(sprite,x,y)->
    amount = @parameters["Amount"].value/100
    c = sprite.getContext()
    data = c.getImageData(x,y,1,1)
    r = data.data[0]
    g = data.data[1]
    b = data.data[2]
    v = (r+g+b)/3
    dr = r-v
    dg = g-v
    db = b-v
    v = v*(1-amount*.5)
    data.data[0] = Math.max(0,v+dr)
    data.data[1] = Math.max(0,v+dg)
    data.data[2] = Math.max(0,v+db)
    c.putImageData data,x,y

#@DrawTool.tools.push new @DarkenTool()

class @SmoothenTool extends @DrawTool
  constructor:(parent)->
    super("Smoothen","fa-brush")

    @parameters = parent.parameters

  processPixel:(sprite,x,y)->
    amount = @parameters["Amount"].value/100
    c = sprite.getContext()
    sum = [0,0,0,0]
    coef = 0
    ref = c.getImageData(x,y,1,1)
    for i in [-1..1] by 1
      for j in [-1..1] by 1
        xx = x+i
        yy = y+j
        continue if xx<0 or yy<0 or xx>=sprite.width or yy>=sprite.height
        data = c.getImageData xx,yy,1,1
        co = 1/(1+i*i+j*j)*(1+data.data[3])
        coef += co
        sum[0] += data.data[0]*co
        sum[1] += data.data[1]*co
        sum[2] += data.data[2]*co
        sum[3] += data.data[3]*co

    data.data[0] = sum[0]/coef*amount+(1-amount)*ref.data[0]
    data.data[1] = sum[1]/coef*amount+(1-amount)*ref.data[1]
    data.data[2] = sum[2]/coef*amount+(1-amount)*ref.data[2]
    data.data[3] = sum[3]/coef*amount+(1-amount)*ref.data[3]
    c.putImageData data,x,y

#@DrawTool.tools.push new @SmoothenTool()

class @SharpenTool extends @DrawTool
  constructor:(parent)->
    super("Sharpen","fa-adjust")

    @parameters = parent.parameters

  processPixel:(sprite,x,y)->
    amount = @parameters["Amount"].value/100
    c = sprite.getContext()
    sum = [0,0,0,0]
    coef = 0
    ref = c.getImageData(x,y,1,1)
    for i in [-1..1] by 1
      for j in [-1..1] by 1
        continue if i==0 and j==0
        xx = x+i
        yy = y+j
        continue if xx<0 or yy<0 or xx>=sprite.width or yy>=sprite.height
        data = c.getImageData xx,yy,1,1
        co = 1/(1+i*i+j*j)*(1+data.data[3])
        coef += co
        sum[0] += (ref.data[0]-data.data[0])*co
        sum[1] += (ref.data[1]-data.data[1])*co
        sum[2] += (ref.data[2]-data.data[2])*co
        sum[3] += (ref.data[3]-data.data[3])*co

    ref.data[0] += sum[0]/coef*amount
    ref.data[1] += sum[1]/coef*amount
    ref.data[2] += sum[2]/coef*amount
    ref.data[3] += sum[3]/coef*amount
    c.putImageData ref,x,y

#@DrawTool.tools.push new @EnhanceTool()

class @SaturationTool extends @DrawTool
  constructor:(parent)->
    super("Saturation","fa-palette")

    @parameters = parent.parameters

  processPixel:(sprite,x,y)->
    amount = @parameters["Amount"].value/100
    amount = if amount>.5 then amount*2 else .5+amount
    c = sprite.getContext()
    data = c.getImageData(x,y,1,1)
    r = data.data[0]
    g = data.data[1]
    b = data.data[2]
    v = (r+g+b)/3
    dr = r-v
    dg = g-v
    db = b-v
    data.data[0] = Math.max(0,v+dr*amount)
    data.data[1] = Math.max(0,v+dg*amount)
    data.data[2] = Math.max(0,v+db*amount)
    c.putImageData data,x,y

#@DrawTool.tools.push new @SaturationTool()

class @EnhanceTool extends @DrawTool
  constructor:()->
    super("Enhance","fa-magic")

    @parameters["Tool"] =
      type: "tool"
      set: [new BrightenTool(@),new DarkenTool(@),new SmoothenTool(@),new SharpenTool(@),new SaturationTool(@)]
      value: 0

    @parameters["Size"] =
      type: "range"
      value: 0

    @parameters["Amount"] =
      type: "range"
      value: 50

  processPixel:(sprite,x,y)->
    @parameters.Tool.set[@parameters.Tool.value].processPixel(sprite,x,y)

@DrawTool.tools.push new @EnhanceTool()

class @SelectTool extends @DrawTool
  constructor:()->
    super("Select","fa-vector-square")
    @selectiontool = true

  processPixel:(sprite,x,y)->

@DrawTool.tools.push new @SelectTool()
