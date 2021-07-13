class @ProjectAsset
  constructor:(@project,@file,@size=0)->
    @name = @file.split(".")[0]
    @ext = @file.split(".")[1]
    @filename = @file
    @file = "assets/#{@file}"

  getURL:()->
    @project.getFullURL()+@file

  getThumbnailURL:()->
    f = @file.split(".")[0]+".png"
    f = f.replace("assets/","assets_th/")
    @project.getFullURL()+f

  loaded:()->
    @project.notifyListeners @
