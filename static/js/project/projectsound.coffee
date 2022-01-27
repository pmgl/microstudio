class @ProjectSound
  constructor:(@project,@file,@size=0)->
    @name = @file.split(".")[0]
    @ext = @file.split(".")[1]
    @filename = @file
    @file = "sounds/#{@file}"
    s = @name.split "-"
    @shortname = s[s.length-1]
    @path_prefix = if s.length>1 then s.splice(0,s.length-1).join("-")+"-" else ""

  getURL:()->
    return @local_url if @local_url?

    @project.getFullURL()+@file

  getThumbnailURL:()->
    return @thumbnail_url if @thumbnail_url?

    f = @file.split(".")[0]+".png"
    f = f.replace("sounds/","sounds_th/")
    @project.getFullURL()+f

  loaded:()->
    @project.notifyListeners @

  play:()->
    audio = new Audio(@getURL())
    audio.play()

    funk = ()->
      audio.pause()
      document.body.removeEventListener "mousedown",funk

    document.body.addEventListener "mousedown",funk

  rename:(name)->
    delete @project.sound_table[@name]
    @name = name
    @project.sound_table[@name] = @
    
    @filename = @name + "." + @ext
    @file = "sounds/"+@filename
    s = @name.split "-"
    @shortname = s[s.length-1]
    @path_prefix = if s.length>1 then s.splice(0,s.length-1).join("-")+"-" else ""
