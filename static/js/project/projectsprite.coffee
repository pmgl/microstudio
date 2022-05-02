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
    @file = "sounds/#{@file}"
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
    delete @project.sprite_table[@name]
    @name = name
    @project.sprite_table[@name] = @

    @filename = @name + "." + @ext
    @file = "sprites/"+@filename
    @url = @project.getFullURL()+@file
    s = @name.split "-"
    @shortname = s[s.length-1]
    @path_prefix = if s.length>1 then s.splice(0,s.length-1).join("-")+"-" else ""
