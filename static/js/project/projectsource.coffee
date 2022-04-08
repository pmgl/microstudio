class @ProjectSource
  constructor:(@project,@file,@size=0)->
    @name = @file.substring 0,@file.length-3
    @filename = @file
    @file = "ms/#{@file}"
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
