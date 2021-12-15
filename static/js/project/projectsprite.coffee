class @ProjectSprite extends Sprite
  constructor:(@project,name,width,height,properties,@size=0)->
    if width? and height?
      super width,height,properties
      @file = name
      @url = @project.getFullURL()+"sprites/"+@file
    else
      @file = name
      @url = @project.getFullURL()+"sprites/"+@file
      super @url,undefined,properties

    @name = @file.substring 0,@file.length-4
    @filename = @file
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

  updated:(url=@project.getFullURL()+"sprites/"+@file+"?v=#{Date.now()}")->
    for i in @images
      i.image.src = url
    return

  reload:(callback)->
    url=@project.getFullURL()+"sprites/"+@file+"?v=#{Date.now()}"
    img = new Image
    img.crossOrigin = "Anonymous"
    img.src = url
    img.onload = ()=>
      @load img
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

  rename:(@name)->
    @file = @name + ".png"
    @filename = @file
    @url = @project.getFullURL()+"sprites/"+@file
