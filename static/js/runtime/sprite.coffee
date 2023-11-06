class @Sprite
  constructor:(@width,@height)->
    @name = ""
    @frames=[]
    @animation_start = 0
    @fps = 5
    if @width>0 and @height>0
      @frames.push new msImage(@width,@height)
      @ready = 1

  setFPS:(fps)->
    dt = 1000/@fps
    frame = ((Date.now()-@animation_start)/dt) % @frames.length
    @fps = fps
    dt = 1000/fps
    @animation_start = Date.now() - frame*dt
    fps

  setFrame:(f)->
    @animation_start = Date.now()-1000/@fps*f

  getFrame:()->
    dt = 1000/@fps
    Math.floor((Date.now()-@animation_start)/dt)%@frames.length

@LoadSprite = (url,properties,loaded)->
  sprite = new Sprite(0,0)
  sprite.ready = 0
  img = new Image
  img.crossOrigin = "Anonymous" if location.protocol != "file:"
  img.src = url
  img.onload = ()=>
    sprite.ready = true

    if img.width>0 and img.height>0
      numframes = 1
      if properties? and properties.frames?
        numframes = properties.frames

      if properties.fps?
        sprite.fps = properties.fps

      sprite.width = img.width
      sprite.height = Math.round(img.height/numframes)
      sprite.frames = []

      for i in [0..numframes-1]
        frame = new msImage sprite.width,sprite.height
        frame.initContext()
        frame.context.drawImage(img,0,-i*sprite.height)
        sprite.frames.push frame
      sprite.ready = true
    loaded() if loaded?

  img.onerror = ()=>
    sprite.ready = 1

  sprite

@UpdateSprite = (sprite,img,properties)->
  if img.width>0 and img.height>0
    numframes = 1
    if properties? and properties.frames?
      numframes = properties.frames
    if properties? and properties.fps?
      sprite.fps = properties.fps
    sprite.width = img.width
    sprite.height = Math.round(img.height/numframes)
    sprite.frames = []
    for i in [0..numframes-1]
      frame = new msImage sprite.width,sprite.height
      frame.initContext()
      frame.context.drawImage(img,0,-i*sprite.height)
      sprite.frames.push frame
    sprite.ready = true
