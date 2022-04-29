class @ProjectSource
  constructor:(@project,@file,@size=0)->
    @name = @file.split(".")[0]
    @ext = @file.split(".")[1]
    @filename = @file
    @file = "ms/#{@file}"
    s = @name.split "-"
    @shortname = s[s.length-1]
    @path_prefix = if s.length>1 then s.splice(0,s.length-1).join("-")+"-" else ""

    @content = ""
    @fetched = false
    @reload()

  reload:(callback)->
    @project.app.client.sendRequest {
      name: "read_project_file"
      project: @project.id
      file: @file
    },(msg)=>
      @content = msg.content
      @fetched = true
      @loaded()
      callback() if callback?

  loaded:()->
    @project.notifyListeners @

  rename:(name)->
    delete @project.source_table[@name]
    @name = name
    @project.source_table[@name] = @

    @filename = @name + "." + @ext
    @file = "ms/"+@filename
    s = @name.split "-"
    @shortname = s[s.length-1]
    @path_prefix = if s.length>1 then s.splice(0,s.length-1).join("-")+"-" else ""
