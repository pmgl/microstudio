class @ProjectSound
  constructor:(@project,@file,@size=0)->
    @name = @file.split(".")[0]
    @ext = @file.split(".")[1]
    @filename = @file
    @file = "sounds/#{@file}"

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

  rename:(@name)->
    @filename = @name + "." + @ext
    @file = "sounds/"+@filename
