class @ProjectSprite extends Sprite
  constructor:(@project,name,width,height,properties,@size=0)->
    @properties = properties
    if width? and height?
      super width,height,properties
      @file = name
      @url = @project.getFullURL()+"sprites/"+@file
    else
      @file = name
      @url = @project.getFullURL()+"sprites/"+@file
      super @url,undefined,properties

    @name = @file.split(".")[0]
    @ext = @file.split(".")[1]
    @filename = @file
    @file = "sprites/#{@file}"
    s = @name.split "-"
    @shortname = s[s.length-1]
    @path_prefix = if s.length>1 then s.splice(0,s.length-1).join("-")+"-" else ""

    @images = []
    @load_listeners = []

  addLoadListener:(listener)->
    if @ready
      listener()
    else
      @load_listeners.push listener

  addImage:(img,size)->
    throw "Size must be defined" if not size?
    @images.push
      image: img
      size: size

  updated:(url=@project.getFullURL()+@file+"?v=#{Date.now()}")->
    for i in @images
      i.image.src = url
    @updateThumbnail() if @updateThumbnail?
    return

  reload:(callback)->
    url=@project.getFullURL()+@file+"?v=#{Date.now()}"
    img = new Image
    img.crossOrigin = "Anonymous"
    img.src = url
    img.onload = ()=>
      @load img,@properties
      @updated(url)
      callback() if callback?

  loaded:()->
    for m in @project.map_list
      m.update()
      m.updateCanvases()

    for l in @load_listeners
      l()
    @project.notifyListeners @
    return

  rename:(name)->
    @project.changeSpriteName @name,name
    delete @project.sprite_table[@name]
    @name = name
    @project.sprite_table[@name] = @

    @filename = @name + "." + @ext
    @file = "sprites/"+@filename
    @url = @project.getFullURL()+@file
    s = @name.split "-"
    @shortname = s[s.length-1]
    @path_prefix = if s.length>1 then s.splice(0,s.length-1).join("-")+"-" else ""

  updateThumbnail: ()=>
    return if not @thumbnails
    for canvas in @thumbnails
      context = canvas.getContext "2d"
      context.clearRect(0,0,canvas.width,canvas.height)
      frame = @frames[0].getCanvas()
      r = Math.min(64/frame.width,64/frame.height)
      context.imageSmoothingEnabled = false
      w = r*frame.width
      h = r*frame.height
      context.drawImage frame,32-w/2,32-h/2,w,h

  getThumbnailElement:()->
    canvas = document.createElement "canvas"
    canvas.width = 64
    canvas.height = 64

    if not @thumbnails?
      @thumbnails = []
      @addLoadListener ()=> @updateThumbnail()

    @thumbnails.push canvas

    mouseover = false
    update = ()=>
      if mouseover and @frames.length>1
        requestAnimationFrame ()=>update()

      dt = 1000/@fps
      t = Date.now()
      frame = if mouseover then Math.floor(t/dt)%@frames.length else 0
      context = canvas.getContext "2d"
      context.imageSmoothingEnabled = false
      context.clearRect 0,0,64,64
      frame = @frames[frame].getCanvas()
      r = Math.min(64/frame.width,64/frame.height)
      w = r*frame.width
      h = r*frame.height
      context.drawImage frame,32-w/2,32-h/2,w,h

    canvas.addEventListener "mouseenter",()=>
      mouseover = true
      update()

    canvas.addEventListener "mouseout",()=>
      mouseover = false

    canvas.updateSprite = update

    if @ready then update()

    canvas

  canBeRenamed:()->
    @name != "icon"
