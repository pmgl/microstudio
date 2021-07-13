class @ProjectSource
  constructor:(@project,@file,@size=0)->
    @name = @file.substring 0,@file.length-3
    @filename = @file
    @file = "ms/#{@file}"
    @content = ""
    @reload()

  reload:(callback)->
    @project.app.client.sendRequest {
      name: "read_project_file"
      project: @project.id
      file: @file
    },(msg)=>
      @content = msg.content
      @loaded()
      callback() if callback?

  loaded:()->
    @project.notifyListeners @
