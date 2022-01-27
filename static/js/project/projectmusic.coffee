class @ProjectMusic
  constructor:(@project,@file,@size=0)->
    @name = @file.split(".")[0]
    @ext = @file.split(".")[1]
    @filename = @file
    @file = "music/#{@file}"
    s = @name.split "-"
    @shortname = s[s.length-1]
    @path_prefix = if s.length>1 then s.splice(0,s.length-1).join("-")+"-" else ""

  getURL:()->
    return @local_url if @local_url?

    @project.getFullURL()+@file

  getThumbnailURL:()->
    return @thumbnail_url if @thumbnail_url?

    f = @file.split(".")[0]+".png"
    f = f.replace("music/","music_th/")
    @project.getFullURL()+f

  loaded:()->
    @project.notifyListeners @

  play:()->
    if not @audio?
      @audio = new Audio(@getURL())
      @audio.loop = true

    funk = ()=>
      document.body.removeEventListener "mousedown",funk
      @audio.pause()

    document.body.addEventListener "mousedown",funk
    @audio.play()

  rename:(@name)->
    delete @project.music_table[@name]
    @name = name
    @project.music_table[@name] = @

    @filename = @name + "." + @ext
    @file = "music/"+@filename
    s = @name.split "-"
    @shortname = s[s.length-1]
    @path_prefix = if s.length>1 then s.splice(0,s.length-1).join("-")+"-" else ""
