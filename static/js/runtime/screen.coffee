class @Screen
  constructor:(@runtime)->
    @canvas = document.createElement "canvas"
    @canvas.width = 1080
    @canvas.height = 1920
    @touches = {}
    @mouse =
      x: -10000
      y: -10000
      pressed: 0
      left: 0
      middle: 0
      right: 0
      wheel: 0

    @translation_x = 0
    @translation_y = 0
    @rotation = 0
    @scale_x = 1
    @scale_y = 1
    @screen_transform = false

    @anchor_x = 0
    @anchor_y = 0
    @supersampling = @previous_supersampling = 1
    @font = "BitCell"
    @font_load_requested = {}
    @font_loaded = {}
    @loadFont @font
    @initContext()

    @cursor = "default"

    @canvas.addEventListener "mousemove",()=>
      @last_mouse_move = Date.now()
      if @cursor != "default" and @cursor_visibility == "auto"
        @cursor = "default"
        @canvas.style.cursor = "default"

    setInterval (()=>@checkMouseCursor()),1000
    @cursor_visibility = "auto"

  checkMouseCursor:()->
    if Date.now()>@last_mouse_move+4000 and @cursor_visibility == "auto"
      if @cursor != "none"
        @cursor = "none"
        @canvas.style.cursor = "none"

  setCursorVisible:(visible)->
    @cursor_visibility = visible
    if visible
      @cursor = "default"
      @canvas.style.cursor = "default"
    else
      @cursor = "none"
      @canvas.style.cursor = "none"

  initContext:()->
    c = @canvas.getContext "2d",{alpha: false}
    if c != @context
      @context = c
    else
      @context.restore()
    @context.save()
    @context.translate @canvas.width/2,@canvas.height/2
    ratio = Math.min(@canvas.width/200,@canvas.height/200)
    @context.scale ratio,ratio
    @width = @canvas.width/ratio
    @height = @canvas.height/ratio
    @alpha = 1
    @pixelated = 1
    @line_width = 1
    @object_rotation = 0
    @object_scale_x = 1
    @object_scale_y = 1

    # @translation_x = 0
    # @translation_y = 0
    # @rotation = 0
    # @scale_x = 1
    # @scale_y = 1
    # @screen_transform = false

    @context.lineCap = "round"
    @blending =
      normal: "source-over"
      additive: "lighter"

    for b in ["source-over","source-in","source-out","source-atop","destination-over","destination-in","destination-out","destination-atop","lighter","copy","xor","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity"]
      @blending[b] = b
    return

  getInterface:()->
    return @interface if @interface?
    screen = @
    @interface =
      width: @width
      height: @height
      clear: (color)->screen.clear(color)
      setColor: (color)->screen.setColor(color)
      setAlpha: (alpha)->screen.setAlpha(alpha)
      setPixelated:(pixelated)->screen.setPixelated(pixelated)
      setBlending: (blending)->screen.setBlending(blending)
      setLinearGradient: (x1,y1,x2,y2,c1,c2)->screen.setLinearGradient(x1,y1,x2,y2,c1,c2)
      setRadialGradient: (x,y,radius,c1,c2)->screen.setRadialGradient(x,y,radius,c1,c2)
      setFont: (font)->screen.setFont(font)
      setTranslation: (tx,ty)->screen.setTranslation(tx,ty)
      setScale: (x,y)->screen.setScale(x,y)
      setRotation: (rotation)->screen.setRotation(rotation)
      setDrawAnchor: (ax,ay)->screen.setDrawAnchor(ax,ay)
      setDrawRotation: (rotation)->screen.setDrawRotation(rotation)
      setDrawScale: (x,y)->screen.setDrawScale(x,y)
      fillRect: (x,y,w,h,c)->screen.fillRect(x,y,w,h,c)
      fillRoundRect: (x,y,w,h,r,c)->screen.fillRoundRect(x,y,w,h,r,c)
      fillRound: (x,y,w,h,c)->screen.fillRound(x,y,w,h,c)
      drawRect: (x,y,w,h,c)->screen.drawRect(x,y,w,h,c)
      drawRoundRect: (x,y,w,h,r,c)->screen.drawRoundRect(x,y,w,h,r,c)
      drawRound: (x,y,w,h,c)->screen.drawRound(x,y,w,h,c)
      drawSprite: (sprite,x,y,w,h)->screen.drawSprite(sprite,x,y,w,h)
      drawImage: (sprite,x,y,w,h)->screen.drawSprite(sprite,x,y,w,h)
      drawSpritePart: (sprite,sx,sy,sw,sh,x,y,w,h)->screen.drawSpritePart(sprite,sx,sy,sw,sh,x,y,w,h)
      drawImagePart: (sprite,sx,sy,sw,sh,x,y,w,h)->screen.drawSpritePart(sprite,sx,sy,sw,sh,x,y,w,h)
      drawMap: (map,x,y,w,h)->screen.drawMap(map,x,y,w,h)
      drawText: (text,x,y,size,color)->screen.drawText(text,x,y,size,color)
      drawTextOutline: (text,x,y,size,color)->screen.drawTextOutline(text,x,y,size,color)
      textWidth: (text,size)-> screen.textWidth(text,size)
      setLineWidth: (width)->screen.setLineWidth(width)
      setLineDash: (dash)->screen.setLineDash(dash)
      drawLine: (x1,y1,x2,y2,color)->screen.drawLine(x1,y1,x2,y2,color)
      drawPolygon: ()->screen.drawPolygon(arguments)
      drawPolyline: ()->screen.drawPolyline(arguments)
      fillPolygon: ()->screen.fillPolygon(arguments)
      setCursorVisible: (visible)->screen.setCursorVisible(visible)
      loadFont: (font)->screen.loadFont(font)
      isFontReady: (font)->screen.isFontReady(font)

  updateInterface:()->
    @interface.width = @width
    @interface.height = @height

  clear:(color)->
    c = @context.fillStyle
    s = @context.strokeStyle
    blending_save = @context.globalCompositeOperation

    @context.globalAlpha = 1
    @context.globalCompositeOperation = "source-over"
    if color?
      @setColor(color)
    else
      @context.fillStyle = "#000"
    @context.fillRect -@width/2,-@height/2,@width,@height

    @context.fillStyle = c
    @context.strokeStyle = s
    @context.globalCompositeOperation = blending_save

  initDraw:()->
    @alpha = 1
    @line_width = 1
    if @supersampling != @previous_supersampling
      @resize()
      @previous_supersampling = @supersampling

  setColor:(color)->
    return if not color?
    if not Number.isNaN(Number.parseInt(color))
      r = (Math.floor(color/100)%10)/9*255
      g = (Math.floor(color/10)%10)/9*255
      b = (Math.floor(color)%10)/9*255
      c = 0xFF000000
      c += r<<16
      c += g<<8
      c += b
      c = "#"+c.toString(16).substring(2,8)
      @context.fillStyle = c
      @context.strokeStyle = c
    else if typeof color == "string"
      @context.fillStyle = color
      @context.strokeStyle = color

  setAlpha:(@alpha)->

  setPixelated:(@pixelated)->

  setBlending:(blending)->
    blending = @blending[blending or "normal"] or "source-over"
    @context.globalCompositeOperation = blending

  setLineWidth:(@line_width)->

  setLineDash:(dash)->
    if not Array.isArray(dash)
      @context.setLineDash []
    else
      @context.setLineDash dash

  setLinearGradient:(x1,y1,x2,y2,c1,c2)->
    grd = @context.createLinearGradient(x1,-y1,x2,-y2)
    grd.addColorStop(0,c1)
    grd.addColorStop(1,c2)
    @context.fillStyle = grd
    @context.strokeStyle = grd

  setRadialGradient:(x,y,radius,c1,c2)->
    grd = @context.createRadialGradient(x,-y,0,x,-y,radius)
    grd.addColorStop(0,c1)
    grd.addColorStop(1,c2)
    @context.fillStyle = grd
    @context.strokeStyle = grd

  setFont:(font)->
    @font = font or "Verdana"
    @loadFont @font

  loadFont:(font="BitCell")->
    if not @font_load_requested[font]
      @font_load_requested[font] = true
      try
        if document.fonts? and document.fonts.load?
          document.fonts.load "16pt #{font}"
      catch err
    1

  isFontReady:(font=@font)->
    return 1 if @font_loaded[font]
    try
      if document.fonts? and document.fonts.check?
        res = document.fonts.check "16pt #{font}"
        if res
          @font_loaded[font] = res
        return if res then 1 else 0
    catch err
    1

  setTranslation:(@translation_x,@translation_y)->
    if not isFinite @translation_x
      @translation_x = 0

    if not isFinite @translation_y
      @translation_y = 0

    @updateScreenTransform()

  setScale:(@scale_x,@scale_y)->
    if not isFinite(@scale_x) or @scale_x == 0
      @scale_x = 1

    if not isFinite(@scale_y) or @scale_y == 0
      @scale_y = 1

    @updateScreenTransform()

  setRotation:(@rotation)->
    if not isFinite @rotation
      @rotation = 0
    @updateScreenTransform()

  updateScreenTransform:()->
    @screen_transform = @translation_x != 0 or @translation_y != 0 or @scale_x != 1 or @scale_y != 1 or @rotation != 0

  setDrawAnchor:(@anchor_x,@anchor_y)->
    @anchor_x = 0 if typeof @anchor_x != "number"
    @anchor_y = 0 if typeof @anchor_y != "number"

  setDrawRotation:(@object_rotation)->

  setDrawScale:(@object_scale_x,@object_scale_y=@object_scale_x)->

  initDrawOp:(x,y,object_transform=true)->
    res = false

    if @screen_transform
      @context.save()
      res = true
      @context.translate @translation_x,-@translation_y
      @context.scale @scale_x,@scale_y
      @context.rotate -@rotation/180*Math.PI
      @context.translate x,y

    if object_transform and (@object_rotation != 0 or @object_scale_x != 1 or @object_scale_y != 1)
      if not res
        @context.save()
        res = true
        @context.translate x,y

      if @object_rotation != 0
        @context.rotate -@object_rotation/180*Math.PI

      if @object_scale_x != 1 or @object_scale_y != 1
        @context.scale @object_scale_x,@object_scale_y

    res

  closeDrawOp:(x,y)->
    #if @object_scale_x != 1 or @object_scale_y != 1
    #  @context.scale 1/@object_scale_x,1/@object_scale_y

    #if @object_rotation != 0
    #  @context.rotate -@object_rotation/180*Math.PI
    #@context.translate -x,-y
    @context.restore()

  fillRect:(x,y,w,h,color)->
    @setColor color
    @context.globalAlpha = @alpha
    if @initDrawOp(x,-y)
      @context.fillRect -w/2-@anchor_x*w/2,-h/2+@anchor_y*h/2,w,h
      @closeDrawOp(x,-y)
    else
      @context.fillRect x-w/2-@anchor_x*w/2,-y-h/2+@anchor_y*h/2,w,h

  fillRoundRect:(x,y,w,h,round=10,color)->
    @setColor color
    @context.globalAlpha = @alpha
    if @initDrawOp(x,-y)
      @context.fillRoundRect -w/2-@anchor_x*w/2,-h/2+@anchor_y*h/2,w,h,round
      @closeDrawOp(x,-y)
    else
      @context.fillRoundRect x-w/2-@anchor_x*w/2,-y-h/2+@anchor_y*h/2,w,h,round

  fillRound:(x,y,w,h,color)->
    @setColor color
    @context.globalAlpha = @alpha
    w = Math.abs(w)
    h = Math.abs(h)
    if @initDrawOp(x,-y)
      @context.beginPath()
      @context.ellipse -@anchor_x*w/2,0+@anchor_y*h/2,w/2,h/2,0,0,Math.PI*2,false
      @context.fill()
      @closeDrawOp(x,-y)
    else
      @context.beginPath()
      @context.ellipse x-@anchor_x*w/2,-y+@anchor_y*h/2,w/2,h/2,0,0,Math.PI*2,false
      @context.fill()

  drawRect:(x,y,w,h,color)->
    @setColor color
    @context.globalAlpha = @alpha
    @context.lineWidth = @line_width
    if @initDrawOp(x,-y)
      @context.strokeRect -w/2-@anchor_x*w/2,-h/2+@anchor_y*h/2,w,h
      @closeDrawOp(x,-y)
    else
      @context.strokeRect x-w/2-@anchor_x*w/2,-y-h/2+@anchor_y*h/2,w,h

  drawRoundRect:(x,y,w,h,round=10,color)->
    @setColor color
    @context.globalAlpha = @alpha
    @context.lineWidth = @line_width
    if @initDrawOp(x,-y)
      @context.strokeRoundRect -w/2-@anchor_x*w/2,-h/2+@anchor_y*h/2,w,h,round
      @closeDrawOp(x,-y)
    else
      @context.strokeRoundRect x-w/2-@anchor_x*w/2,-y-h/2+@anchor_y*h/2,w,h,round

  drawRound:(x,y,w,h,color)->
    @setColor color
    @context.globalAlpha = @alpha
    @context.lineWidth = @line_width
    w = Math.abs(w)
    h = Math.abs(h)
    if @initDrawOp(x,-y)
      @context.beginPath()
      @context.ellipse 0-@anchor_x*w/2,0+@anchor_y*h/2,w/2,h/2,0,0,Math.PI*2,false
      @context.stroke()
      @closeDrawOp(x,-y)
    else
      @context.beginPath()
      @context.ellipse x-@anchor_x*w/2,-y+@anchor_y*h/2,w/2,h/2,0,0,Math.PI*2,false
      @context.stroke()

  drawLine:(x1,y1,x2,y2,color)->
    @setColor color
    @context.globalAlpha = @alpha
    @context.lineWidth = @line_width
    transform = @initDrawOp 0,0,false
    @context.beginPath()
    @context.moveTo x1,-y1
    @context.lineTo x2,-y2
    @context.stroke()
    @closeDrawOp() if transform

  drawPolyline:(args)->
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
    @context.moveTo args[0],-args[1]
    for i in [1..len-1]
      @context.lineTo args[i*2],-args[i*2+1]

    @context.stroke()
    @closeDrawOp() if transform


  drawPolygon:(args)->
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
    @context.moveTo args[0],-args[1]
    for i in [1..len-1]
      @context.lineTo args[i*2],-args[i*2+1]

    @context.closePath()
    @context.stroke()
    @closeDrawOp() if transform

  fillPolygon:(args)->
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
    @context.moveTo args[0],-args[1]
    for i in [1..len-1]
      @context.lineTo args[i*2],-args[i*2+1]

    @context.fill()
    @closeDrawOp() if transform

  textWidth:(text,size)->
    @context.font = "#{size}pt #{@font}"
    @context.measureText(text).width

  drawText:(text,x,y,size,color)->
    @setColor color
    @context.globalAlpha = @alpha
    @context.font = "#{size}pt #{@font}"
    @context.textAlign = "center"
    @context.textBaseline = "middle"
    w = @context.measureText(text).width
    h = size
    if @initDrawOp(x,-y)
      @context.fillText text,0-@anchor_x*w/2,0+@anchor_y*h/2
      @closeDrawOp(x,-y)
    else
      @context.fillText text,x-@anchor_x*w/2,-y+@anchor_y*h/2

  drawTextOutline:(text,x,y,size,color)->
    @setColor color
    @context.globalAlpha = @alpha
    @context.font = "#{size}pt #{@font}"
    @context.lineWidth = @line_width
    @context.textAlign = "center"
    @context.textBaseline = "middle"
    w = @context.measureText(text).width
    h = size
    if @initDrawOp(x,-y)
      @context.strokeText text,0-@anchor_x*w/2,0+@anchor_y*h/2
      @closeDrawOp(x,-y)
    else
      @context.strokeText text,x-@anchor_x*w/2,-y+@anchor_y*h/2

  getSpriteFrame:(sprite)->
    frame = null
    if typeof sprite == "string"
      s = @runtime.sprites[sprite]
      if s?
        sprite = s
      else
        s = sprite.split(".")
        if s.length>1
          sprite = @runtime.sprites[s[0]]
          frame = s[1]|0
    else if sprite instanceof msImage
      return sprite.canvas or sprite.image

    return null if not sprite? or not sprite.ready

    if sprite.frames.length>1
      if not frame?
        dt = 1000/sprite.fps
        frame = Math.floor((Date.now()-sprite.animation_start)/dt)%sprite.frames.length
      if frame>=0 and frame<sprite.frames.length
        return sprite.frames[frame].canvas
      else
        return sprite.frames[0].canvas
    else if sprite.frames[0]?
      return sprite.frames[0].canvas
    else
      return null

  drawSprite:(sprite,x,y,w,h)->
    canvas = @getSpriteFrame(sprite)
    return if not canvas?

    if not w?
      w = canvas.width

    if not h
      h = w/canvas.width*canvas.height

    @context.globalAlpha = @alpha
    @context.imageSmoothingEnabled = not @pixelated
    if @initDrawOp(x,-y)
      @context.drawImage canvas,-w/2-@anchor_x*w/2,-h/2+@anchor_y*h/2,w,h
      @closeDrawOp(x,-y)
    else
      @context.drawImage canvas,x-w/2-@anchor_x*w/2,-y-h/2+@anchor_y*h/2,w,h

  drawSpritePart:(sprite,sx,sy,sw,sh,x,y,w,h)->
    canvas = @getSpriteFrame(sprite)
    return if not canvas?

    if not w?
      w = sw

    if not h
      h = w/sw*sh

    @context.globalAlpha = @alpha
    @context.imageSmoothingEnabled = not @pixelated
    if @initDrawOp(x,-y)
      @context.drawImage canvas,sx,sy,sw,sh,-w/2-@anchor_x*w/2,-h/2+@anchor_y*h/2,w,h
      @closeDrawOp(x,-y)
    else
      @context.drawImage canvas,sx,sy,sw,sh,x-w/2-@anchor_x*w/2,-y-h/2+@anchor_y*h/2,w,h

  drawMap:(map,x,y,w,h)->
    map = @runtime.maps[map] if typeof map == "string"
    return if not map? or not map.ready
    @context.globalAlpha = @alpha
    @context.imageSmoothingEnabled = not @pixelated
    if @initDrawOp(x,-y)
      map.draw @context,-w/2-@anchor_x*w/2,-h/2+@anchor_y*h/2,w,h
      #@context.drawImage map.getCanvas(),-w/2-@anchor_x*w/2,-h/2+@anchor_y*h/2,w,h
      @closeDrawOp(x,-y)
    else
      map.draw @context,x-w/2-@anchor_x*w/2,-y-h/2+@anchor_y*h/2,w,h
      #@context.drawImage map.getCanvas(),x-w/2-@anchor_x*w/2,-y-h/2+@anchor_y*h/2,w,h

  resize:()->
    cw = window.innerWidth
    ch = window.innerHeight

    ratio = {
      "4x3": 4/3
      "16x9": 16/9
      "2x1": 2/1
      "1x1": 1/1
      ">4x3": 4/3
      ">16x9": 16/9
      ">2x1": 2/1
      ">1x1": 1/1
    }[@runtime.aspect]

    min = @runtime.aspect.startsWith(">")

    #if not ratio? and @runtime.orientation in ["portrait","landscape"]
    #  ratio = 16/9

    if ratio?
      if min
        switch @runtime.orientation
          when "portrait"
            ratio = Math.max(ratio,ch/cw)
          when "landscape"
            ratio = Math.max(ratio,cw/ch)
          else
            if ch>cw
              ratio = Math.max(ratio,ch/cw)
            else
              ratio = Math.max(ratio,cw/ch)

      switch @runtime.orientation
        when "portrait"
          r = Math.min(cw,ch/ratio)/cw
          w = cw*r
          h = cw*r*ratio

        when "landscape"
          r = Math.min(cw/ratio,ch)/ch
          w = ch*r*ratio
          h = ch*r

        else
          if cw>ch
            r = Math.min(cw/ratio,ch)/ch
            w = ch*r*ratio
            h = ch*r
          else
            r = Math.min(cw,ch/ratio)/cw
            w = cw*r
            h = cw*r*ratio
    else
      w = cw
      h = ch

    @canvas.style["margin-top"] = Math.round((ch-h)/2)+"px"
    @canvas.style.width = Math.round(w)+"px"
    @canvas.style.height = Math.round(h)+"px"

    devicePixelRatio = window.devicePixelRatio || 1
    backingStoreRatio = @context.webkitBackingStorePixelRatio ||
      @context.mozBackingStorePixelRatio ||
      @context.msBackingStorePixelRatio ||
      @context.oBackingStorePixelRatio ||
      @context.backingStorePixelRatio || 1

    @ratio = devicePixelRatio/backingStoreRatio*Math.max(1,Math.min(2,@supersampling))

    @width = w*@ratio
    @height = h*@ratio

    @canvas.width = @width
    @canvas.height = @height
    @initContext()

  startControl:(@element)->
    document.addEventListener "touchstart", (event) => @touchStart(event)
    document.addEventListener "touchmove", (event) => @touchMove(event)
    document.addEventListener "touchend" , (event) => @touchRelease(event)
    document.addEventListener "touchcancel" , (event) => @touchRelease(event)

    document.addEventListener "mousedown", (event) => @mouseDown(event)
    document.addEventListener "mousemove", (event) => @mouseMove(event)
    document.addEventListener "mouseup", (event) => @mouseUp(event)

    document.addEventListener "mousewheel", (event)=>@mouseWheel(event)
    document.addEventListener "DOMMouseScroll", (event)=>@mouseWheel(event)


    devicePixelRatio = window.devicePixelRatio || 1
    backingStoreRatio = @context.webkitBackingStorePixelRatio ||
      @context.mozBackingStorePixelRatio ||
      @context.msBackingStorePixelRatio ||
      @context.oBackingStorePixelRatio ||
      @context.backingStorePixelRatio || 1

    @ratio = devicePixelRatio/backingStoreRatio

  touchStart:(event)->
    event.preventDefault()
    event.stopPropagation()
    b = @canvas.getBoundingClientRect()
    for i in [0..event.changedTouches.length-1] by 1
      t = event.changedTouches[i]
      min = Math.min @canvas.clientWidth,@canvas.clientHeight
      x = (t.clientX-b.left-@canvas.clientWidth/2)/min*200
      y = (@canvas.clientHeight/2-(t.clientY-b.top))/min*200
      @touches[t.identifier] =
        x: x
        y: y
      @mouse.x = x
      @mouse.y = y
      @mouse.pressed = 1
      @mouse.left = 1
    false

  touchMove:(event)->
    event.preventDefault()
    event.stopPropagation()
    b = @canvas.getBoundingClientRect()
    for i in [0..event.changedTouches.length-1] by 1
      t = event.changedTouches[i]
      if @touches[t.identifier]?
        min = Math.min @canvas.clientWidth,@canvas.clientHeight
        x = (t.clientX-b.left-@canvas.clientWidth/2)/min*200
        y = (@canvas.clientHeight/2-(t.clientY-b.top))/min*200
        @touches[t.identifier].x = x
        @touches[t.identifier].y = y
        @mouse.x = x
        @mouse.y = y
    false

  touchRelease:(event)->
    for i in [0..event.changedTouches.length-1] by 1
      t = event.changedTouches[i]
      x = (t.clientX-@canvas.offsetLeft)*@ratio
      y = (t.clientY-@canvas.offsetTop)*@ratio
      delete @touches[t.identifier]

      @mouse.pressed = 0
      @mouse.left = 0
      @mouse.right = 0
      @mouse.middle = 0
    false

  mouseDown:(event)->
    @mousepressed = true
    b = @canvas.getBoundingClientRect()
    min = Math.min @canvas.clientWidth,@canvas.clientHeight
    x = (event.clientX-b.left-@canvas.clientWidth/2)/min*200
    y = (@canvas.clientHeight/2-(event.clientY-b.top))/min*200
    @touches["mouse"] =
      x: x
      y: y
    #console.info @touches["mouse"]

    @mouse.x = x
    @mouse.y = y
    switch event.button
      when 0 then @mouse.left = 1
      when 1 then @mouse.middle = 1
      when 2 then @mouse.right = 1

    @mouse.pressed = Math.min(1,@mouse.left+@mouse.right+@mouse.middle)
    false

  mouseMove:(event)->
    event.preventDefault()
    b = @canvas.getBoundingClientRect()
    min = Math.min @canvas.clientWidth,@canvas.clientHeight
    x = (event.clientX-b.left-@canvas.clientWidth/2)/min*200
    y = (@canvas.clientHeight/2-(event.clientY-b.top))/min*200
    if @touches["mouse"]?
      @touches["mouse"].x = x
      @touches["mouse"].y = y

    @mouse.x = x
    @mouse.y = y

    false

  mouseUp:(event)->
    delete @touches["mouse"]

    b = @canvas.getBoundingClientRect()
    min = Math.min @canvas.clientWidth,@canvas.clientHeight
    x = (event.clientX-b.left-@canvas.clientWidth/2)/min*200
    y = (@canvas.clientHeight/2-(event.clientY-b.top))/min*200

    @mouse.x = x
    @mouse.y = y
    switch event.button
      when 0 then @mouse.left = 0
      when 1 then @mouse.middle = 0
      when 2 then @mouse.right = 0

    @mouse.pressed = Math.min(1,@mouse.left+@mouse.right+@mouse.middle)

    false

  mouseWheel:(e)->
    if e.wheelDelta < 0 or e.detail > 0
      @wheel = -1
    else
      @wheel = 1

  takePicture:(callback)->
    callback @canvas.toDataURL()
