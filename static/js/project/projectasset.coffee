class @ProjectAsset
  constructor:(@project,@file,@size=0)->
    @name = @file.split(".")[0]
    @ext = @file.split(".")[1]
    @filename = @file
    @file = "assets/#{@file}"
    s = @name.split "-"
    @shortname = s[s.length-1]
    @path_prefix = if s.length>1 then s.splice(0,s.length-1).join("-")+"-" else ""

  getURL:()->
    return @local_url if @local_url?
    @project.getFullURL()+@file

  getThumbnailURL:()->
    return @thumbnail_url if @thumbnail_url?

    f = @file.split(".")[0]+".png"
    f = f.replace("assets/","assets_th/")
    @project.getFullURL()+f

  loaded:()->
    @project.notifyListeners @

  rename:(name)->
    delete @project.asset_table[@name]
    @name = name
    @project.asset_table[@name] = @

    @filename = @name + "." + @ext
    @file = "assets/"+@filename
    s = @name.split "-"
    @shortname = s[s.length-1]
    @path_prefix = if s.length>1 then s.splice(0,s.length-1).join("-")+"-" else ""
