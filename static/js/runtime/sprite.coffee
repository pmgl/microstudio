class @Sprite
  constructor:(@width,@height,properties)->
    @name = ""
    @frames=[]

    if @width? and typeof @width == "string"
      @ready = false
      img = new Image
      img.crossOrigin = "Anonymous" if location.protocol != "file:"
      img.src = @width
      @width = 0
      @height = 0
      img.onload = ()=>
        @ready = true
        @load(img,properties)
        @loaded()

      img.onerror = ()=>
        @ready = true
    else
      @frames.push new SpriteFrame @,@width,@height
      @ready = true

    @current_frame = 0
    @animation_start = 0
    @fps = if properties then properties.fps or 5 else 5

  setFrame:(f)->
    @animation_start = Date.now()-1000/@fps*f

  getFrame:()->
    dt = 1000/@fps
    Math.floor((Date.now()-@animation_start)/dt)%@frames.length

  cutFrames:(num)->
    height = Math.round(@height/num)
    for i in [0..num-1]
      frame = new Sprite @width,height
      frame.getContext().drawImage @getCanvas(),0,-i*height
      @frames[i] = frame
    @height = height
    @canvas = @frames[0].canvas

  saveData:()->
    if @frames.length>1
      canvas = document.createElement "canvas"
      canvas.width = @width
      canvas.height = @height*@frames.length
      context = canvas.getContext "2d"
      for i in [0..@frames.length-1]
        context.drawImage @frames[i].getCanvas(),0,@height*i
      canvas.toDataURL()
    else
      @frames[0].getCanvas().toDataURL()

  loaded:()->

  setCurrentFrame:(index)->
    if index>=0 and index<@frames.length
      @current_frame = index

  clone:()->
    sprite = new Sprite @width,@height
    sprite.copyFrom @
    sprite

  resize:(@width,@height)->
    for f in @frames
      f.resize @width,@height
    return

  load:(img,properties)->
    if img.width>0 and img.height>0
      numframes = 1
      if properties? and properties.frames?
        numframes = properties.frames
      @width = img.width
      @height = Math.round(img.height/numframes)
      @frames = []
      for i in [0..numframes-1]
        frame = new SpriteFrame @,@width,@height
        frame.getContext().drawImage img,0,-i*@height
        @frames.push frame
      @ready = true

  copyFrom:(sprite)->
    @width = sprite.width
    @height = sprite.height
    @frames = []
    for f in sprite.frames
      @frames.push f.clone()

    @current_frame = sprite.current_frame
    return

  clear:()->
    for f in @frames
      f.clear()
    return

  addFrame:()->
    @frames.push new SpriteFrame @,@width,@height

  flipH:()->
    for f in @frames
      cc = f.clone().getContext()
      oc = f.getContext()
      for xx in [0..f.width-1]
        for yy in [0..f.height-1] 
          data = cc.getImageData(xx,yy,1,1)
          oc.putImageData(data,f.width-xx-1,yy)   
    return

  flipV:()->
    for f in @frames
      cc = f.clone().getContext()
      oc = f.getContext()
      for xx in [0..f.width-1]
        for yy in [0..f.height-1]        
          data = cc.getImageData(xx,yy,1,1)
          oc.putImageData(data,xx,f.height-yy-1)   
    return
