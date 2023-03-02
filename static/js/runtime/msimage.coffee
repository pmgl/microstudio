class @msImage
  @classname = "Image"

  constructor:(@width,@height,@centered=false)->
    @class = msImage
    if @width instanceof Image
      @image = @width
      @width = @image.width
      @height = @image.height
    else if @width instanceof HTMLCanvasElement
      @canvas = @width
      @width = @canvas.width
      @height = @canvas.height
    else
      @canvas = document.createElement "canvas"
      @canvas.width = @width = Math.round @width
      @canvas.height = @height = Math.round @height

  setRGB:(x,y,r,g,b)->
    @initContext()
    if not @pixeldata? then @pixeldata = @context.getImageData 0,0,1,1
    if r.R?
      @pixeldata.data[0] = r.R
      @pixeldata.data[1] = r.G
      @pixeldata.data[2] = r.B
    else
      @pixeldata.data[0] = r
      @pixeldata.data[1] = g
      @pixeldata.data[2] = b

    @pixeldata.data[3] = 255
    @context.putImageData @pixeldata,x,y

  setRGBA:(x,y,r,g,b,a)->
    @initContext()
    if not @pixeldata? then @pixeldata = @context.getImageData 0,0,1,1
    if r.R?
      @pixeldata.data[0] = r.R
      @pixeldata.data[1] = r.G
      @pixeldata.data[2] = r.B
      @pixeldata.data[3] = if r.A? then r.A else 255
    else
      @pixeldata.data[0] = r
      @pixeldata.data[1] = g
      @pixeldata.data[2] = b
      @pixeldata.data[3] = a

    @context.putImageData @pixeldata,x,y

  getRGB:(x,y,result={})->
    @initContext()
    d = @context.getImageData x,y,1,1
    result.R = d.data[0]
    result.G = d.data[1]
    result.B = d.data[2]
    result

  getRGBA:(x,y,result={})->
    @initContext()
    d = @context.getImageData x,y,1,1
    result.R = d.data[0]
    result.G = d.data[1]
    result.B = d.data[2]
    result.A = d.data[3]
    result

  initContext:()->
    return if @context?
    if not @canvas? and @image?
      @canvas = document.createElement "canvas"
      @canvas.width = @image.width
      @canvas.height = @image.height
      @context = @canvas.getContext "2d"
      @context.drawImage @image,0,0
      @image = null

    @alpha = 1
    @pixelated = 1
    @line_width = 1
    @context = @canvas.getContext "2d"
    @context.lineCap = "round"
    if @centered
      @translation_x = @width/2
      @translation_y = @height/2
      @rotation = 0
      @scale_x = 1
      @scale_y = -1
      @image_transform = true
      @anchor_x = 0
      @anchor_y = 0
      @object_scale_y = -1
    else
      @translation_x = 0
      @translation_y = 0
      @rotation = 0
      @scale_x = 1
      @scale_y = 1
      @image_transform = false
      @anchor_x = -1
      @anchor_y = 1
      @object_scale_y = 1

    @object_rotation = 0
    @object_scale_x = 1

    @font = "BitCell"

  clear:(color)->
    @initContext()
    c = @context.fillStyle
    s = @context.strokeStyle
    blending_save = @context.globalCompositeOperation

    @context.globalAlpha = 1
    @context.globalCompositeOperation = "source-over"
    if color?
      @setColor(color)
    else
      @context.fillStyle = "#000"
    @context.fillRect 0,0,@width,@height

    @context.fillStyle = c
    @context.strokeStyle = s
    @context.globalCompositeOperation = blending_save

  setColor:(color)->
    @initContext()
    return if not color?
    if typeof color == "string"
      @context.fillStyle = color
      @context.strokeStyle = color

  setAlpha:(alpha)->
    @initContext()
    @alpha = alpha

  setPixelated:(pixelated)->
    @initContext()
    @pixelated = pixelated

  setBlending:(blending)->
    @initContext()
    blending = BLENDING_MODES[blending or "normal"] or "source-over"
    @context.globalCompositeOperation = blending

  setLineWidth:(line_width)->
    @initContext()
    @line_width = line_width

  setLineDash:(dash)->
    @initContext()
    if not Array.isArray(dash)
      @context.setLineDash []
    else
      @context.setLineDash dash

  setLinearGradient:(x1,y1,x2,y2,c1,c2)->
    @initContext()
    grd = @context.createLinearGradient(x1,y1,x2,y2)
    grd.addColorStop(0,c1)
    grd.addColorStop(1,c2)
    @context.fillStyle = grd
    @context.strokeStyle = grd

  setRadialGradient:(x,y,radius,c1,c2)->
    @initContext()
    grd = @context.createRadialGradient(x,y,0,x,y,radius)
    grd.addColorStop(0,c1)
    grd.addColorStop(1,c2)
    @context.fillStyle = grd
    @context.strokeStyle = grd

  setFont:(font)->
    @font = font or "Verdana"

  setTranslation:(translation_x,translation_y)->
    @initContext()

    @translation_x = translation_x
    @translation_y = translation_y

    if not isFinite @translation_x
      @translation_x = 0

    if not isFinite @translation_y
      @translation_y = 0

    @updateScreenTransform()

  setScale:(scale_x,scale_y)->
    @initContext()

    @scale_x = scale_x
    @scale_y = scale_y

    if not isFinite(@scale_x) or @scale_x == 0
      @scale_x = 1

    if not isFinite(@scale_y) or @scale_y == 0
      @scale_y = 1

    @updateScreenTransform()

  setRotation:(rotation)->
    @initContext()

    @rotation = rotation

    if not isFinite @rotation
      @rotation = 0
    @updateScreenTransform()

  updateScreenTransform:()->
    @image_transform = @translation_x != 0 or @translation_y != 0 or @scale_x != 1 or @scale_y != 1 or @rotation != 0

  setDrawAnchor:(anchor_x,anchor_y)->
    @initContext()

    @anchor_x = anchor_x
    @anchor_y = anchor_y

    @anchor_x = 0 if typeof @anchor_x != "number"
    @anchor_y = 0 if typeof @anchor_y != "number"

  setDrawRotation:(object_rotation)->
    @initContext()
    @object_rotation = object_rotation

  setDrawScale:(object_scale_x,object_scale_y=object_scale_x)->
    @initContext()
    @object_scale_x = object_scale_x
    @object_scale_y = object_scale_y

  initDrawOp:(x,y,object_transform = true)->
    res = false

    if @image_transform
      @context.save()
      res = true
      @context.translate @translation_x,@translation_y
      @context.scale @scale_x,@scale_y
      @context.rotate @rotation/180*Math.PI
      @context.translate x,y

    if object_transform and (@object_rotation != 0 or @object_scale_x != 1 or @object_scale_y != 1)
      if not res
        @context.save()
        res = true
        @context.translate x,y

      if @object_rotation != 0
        @context.rotate @object_rotation/180*Math.PI

      if @object_scale_x != 1 or @object_scale_y != 1
        @context.scale @object_scale_x,@object_scale_y

    res

  closeDrawOp:(x,y)->
    @context.restore()

  fillRect:(x,y,w,h,color)->
    @initContext()
    @setColor color
    @context.globalAlpha = @alpha
    if @initDrawOp(x,y)
      @context.fillRect -w/2-@anchor_x*w/2,-h/2+@anchor_y*h/2,w,h
      @closeDrawOp(x,y)
    else
      @context.fillRect x-w/2-@anchor_x*w/2,y-h/2+@anchor_y*h/2,w,h

  fillRoundRect:(x,y,w,h,round=10,color)->
    @initContext()
    @setColor color
    @context.globalAlpha = @alpha
    if @initDrawOp(x,y)
      @context.fillRoundRect -w/2-@anchor_x*w/2,-h/2+@anchor_y*h/2,w,h,round
      @closeDrawOp(x,y)
    else
      @context.fillRoundRect x-w/2-@anchor_x*w/2,y-h/2+@anchor_y*h/2,w,h,round

  fillRound:(x,y,w,h,color)->
    @initContext()
    @setColor color
    @context.globalAlpha = @alpha
    w = Math.abs(w)
    h = Math.abs(h)
    if @initDrawOp(x,y)
      @context.beginPath()
      @context.ellipse -@anchor_x*w/2,0+@anchor_y*h/2,w/2,h/2,0,0,Math.PI*2,false
      @context.fill()
      @closeDrawOp(x,y)
    else
      @context.beginPath()
      @context.ellipse x-@anchor_x*w/2,y+@anchor_y*h/2,w/2,h/2,0,0,Math.PI*2,false
      @context.fill()

  drawRect:(x,y,w,h,color)->
    @initContext()
    @setColor color
    @context.globalAlpha = @alpha
    @context.lineWidth = @line_width
    if @initDrawOp(x,y)
      @context.strokeRect -w/2-@anchor_x*w/2,-h/2+@anchor_y*h/2,w,h
      @closeDrawOp(x,y)
    else
      @context.strokeRect x-w/2-@anchor_x*w/2,y-h/2+@anchor_y*h/2,w,h

  drawRoundRect:(x,y,w,h,round=10,color)->
    @initContext()
    @setColor color
    @context.globalAlpha = @alpha
    @context.lineWidth = @line_width
    if @initDrawOp(x,y)
      @context.strokeRoundRect -w/2-@anchor_x*w/2,-h/2+@anchor_y*h/2,w,h,round
      @closeDrawOp(x,y)
    else
      @context.strokeRoundRect x-w/2-@anchor_x*w/2,y-h/2+@anchor_y*h/2,w,h,round

  drawRound:(x,y,w,h,color)->
    @initContext()
    @setColor color
    @context.globalAlpha = @alpha
    @context.lineWidth = @line_width
    w = Math.abs(w)
    h = Math.abs(h)
    if @initDrawOp(x,y)
      @context.beginPath()
      @context.ellipse 0-@anchor_x*w/2,0+@anchor_y*h/2,w/2,h/2,0,0,Math.PI*2,false
      @context.stroke()
      @closeDrawOp(x,y)
    else
      @context.beginPath()
      @context.ellipse x-@anchor_x*w/2,y+@anchor_y*h/2,w/2,h/2,0,0,Math.PI*2,false
      @context.stroke()

  drawLine:(x1,y1,x2,y2,color)->
    @initContext()
    @setColor color
    @context.globalAlpha = @alpha
    @context.lineWidth = @line_width
    transform = @initDrawOp 0,0,false
    @context.beginPath()
    @context.moveTo x1,y1
    @context.lineTo x2,y2
    @context.stroke()
    @closeDrawOp() if transform

  drawPolyline:()->
    args = arguments
    @initContext()
    if args.length>0 and args.length%2 == 1 and typeof args[args.length-1] == "string"
      @setColor args[args.length-1]

    if Array.isArray args[0]
      if args[1]? and typeof args[1] == "string"
        @setColor args[1]
      args = args[0]

    @context.globalAlpha = @alpha
    @context.lineWidth = @line_width
    return if args.length < 4
    len = Math.floor(args.length/2)
    transform = @initDrawOp 0,0,false
    @context.beginPath()
    @context.moveTo args[0],args[1]
    for i in [1..len-1]
      @context.lineTo args[i*2],args[i*2+1]

    @context.stroke()
    @closeDrawOp() if transform


  drawPolygon:()->
    args = arguments
    @initContext()
    if args.length>0 and args.length%2 == 1 and typeof args[args.length-1] == "string"
      @setColor args[args.length-1]

    if Array.isArray args[0]
      if args[1]? and typeof args[1] == "string"
        @setColor args[1]
      args = args[0]

    @context.globalAlpha = @alpha
    @context.lineWidth = @line_width
    return if args.length < 4
    len = Math.floor(args.length/2)
    transform = @initDrawOp 0,0,false
    @context.beginPath()
    @context.moveTo args[0],args[1]
    for i in [1..len-1]
      @context.lineTo args[i*2],args[i*2+1]

    @context.closePath()
    @context.stroke()
    @closeDrawOp() if transform

  fillPolygon:()->
    args = arguments
    @initContext()
    if args.length>0 and args.length%2 == 1 and typeof args[args.length-1] == "string"
      @setColor args[args.length-1]

    if Array.isArray args[0]
      if args[1]? and typeof args[1] == "string"
        @setColor args[1]
      args = args[0]

    @context.globalAlpha = @alpha
    @context.lineWidth = @line_width
    return if args.length<4
    len = Math.floor(args.length/2)
    transform = @initDrawOp 0,0,false
    @context.beginPath()
    @context.moveTo args[0],args[1]
    for i in [1..len-1]
      @context.lineTo args[i*2],args[i*2+1]

    @context.fill()
    @closeDrawOp() if transform

  textWidth:(text,size)->
    @initContext()
    @context.font = "#{size}pt #{@font}"
    @context.measureText(text).width

  drawText:(text,x,y,size,color)->
    @initContext()
    @setColor color
    @context.globalAlpha = @alpha
    @context.font = "#{size}pt #{@font}"
    @context.textAlign = "center"
    @context.textBaseline = "middle"
    w = @context.measureText(text).width
    h = size
    if @initDrawOp(x,y)
      @context.fillText text,0-@anchor_x*w/2,0+@anchor_y*h/2
      @closeDrawOp(x,y)
    else
      @context.fillText text,x-@anchor_x*w/2,y+@anchor_y*h/2

  drawTextOutline:(text,x,y,size,color)->
    @initContext()
    @setColor color
    @context.globalAlpha = @alpha
    @context.font = "#{size}pt #{@font}"
    @context.lineWidth = @line_width
    @context.textAlign = "center"
    @context.textBaseline = "middle"
    w = @context.measureText(text).width
    h = size
    if @initDrawOp(x,y)
      @context.strokeText text,0-@anchor_x*w/2,0+@anchor_y*h/2
      @closeDrawOp(x,y)
    else
      @context.strokeText text,x-@anchor_x*w/2,y+@anchor_y*h/2

  getSpriteFrame:(sprite)->
    frame = null
    if typeof sprite == "string"
      s = window.player.runtime.sprites[sprite]
      if s?
        sprite = s
      else
        s = sprite.split(".")
        if s.length>1
          sprite = window.player.runtime.sprites[s[0]]
          frame = s[1]|0
    else if sprite instanceof msImage
      return sprite.canvas or sprite.image

    return null if not sprite? or not sprite.ready

    if sprite.frames.length>1
      if not frame?
        dt = 1000/sprite.fps
        frame = Math.floor((Date.now()-sprite.animation_start)/dt)%sprite.frames.length
      if frame >= 0 and frame < sprite.frames.length
        return sprite.frames[frame].canvas
      else
        return sprite.frames[0].canvas
    else if sprite.frames[0]?
      return sprite.frames[0].canvas
    else
      return null

  drawImage:(sprite,x,y,w,h)-> @drawSprite(sprite,x,y,w,h)

  drawSprite:(sprite,x,y,w,h)->
    @initContext()
    canvas = @getSpriteFrame(sprite)
    return if not canvas?

    if not w?
      w = canvas.width

    if not h
      h = w/canvas.width*canvas.height

    @context.globalAlpha = @alpha
    @context.imageSmoothingEnabled = not @pixelated
    if @initDrawOp(x,y)
      @context.drawImage canvas,-w/2-@anchor_x*w/2,-h/2+@anchor_y*h/2,w,h
      @closeDrawOp(x,y)
    else
      @context.drawImage canvas,x-w/2-@anchor_x*w/2,y-h/2+@anchor_y*h/2,w,h

  drawImagePart:(sprite,sx,sy,sw,sh,x,y,w,h)-> @drawSpritePart(sprite,sx,sy,sw,sh,x,y,w,h)
  drawSpritePart:(sprite,sx,sy,sw,sh,x,y,w,h)->
    @initContext()
    canvas = @getSpriteFrame(sprite)
    return if not canvas?

    if not w?
      w = canvas.width

    if not h
      h = w/sw*sh

    @context.globalAlpha = @alpha
    @context.imageSmoothingEnabled = not @pixelated
    if @initDrawOp(x,y)
      @context.drawImage canvas,sx,sy,sw,sh,-w/2-@anchor_x*w/2,-h/2+@anchor_y*h/2,w,h
      @closeDrawOp(x,y)
    else
      @context.drawImage canvas,sx,sy,sw,sh,x-w/2-@anchor_x*w/2,y-h/2+@anchor_y*h/2,w,h

  drawMap:(map,x,y,w,h)->
    @initContext()
    map = window.player.runtime.maps[map] if typeof map == "string"
    return if not map? or not map.ready or not map.canvas?
    @context.globalAlpha = @alpha
    @context.imageSmoothingEnabled = not @pixelated
    if @initDrawOp(x,y)
      @context.drawImage map.getCanvas(),-w/2-@anchor_x*w/2,-h/2+@anchor_y*h/2,w,h
      @closeDrawOp(x,y)
    else
      @context.drawImage map.getCanvas(),x-w/2-@anchor_x*w/2,y-h/2+@anchor_y*h/2,w,h

@BLENDING_MODES =
  normal: "source-over"
  additive: "lighter"

for b in ["source-over","source-in","source-out","source-atop","destination-over","destination-in","destination-out","destination-atop","lighter","copy","xor","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity"]
  @BLENDING_MODES[b] = b
