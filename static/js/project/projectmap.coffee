class @ProjectMap extends MicroMap
  constructor:(@project,@file,@size=0)->
    super 16,10,16,16,@project.sprite_table
    @url = @project.getFullURL()+@file
    @canvases = []

    @name = @file.split(".")[0]
    @ext = @file.split(".")[1]
    @filename = @file
    @file = "maps/#{@file}"
    s = @name.split "-"
    @shortname = s[s.length-1]
    @path_prefix = if s.length>1 then s.splice(0,s.length-1).join("-")+"-" else ""

    @loadFile()

  addCanvas:(canvas)->
    @canvases.push canvas
    @updateCanvas canvas

  updateCanvases:()->
    for c in @canvases
      @updateCanvas c
    return

  updateCanvas:(c)->
    r1 = Math.max(128/@width,96/@height)
    r2 = Math.min(128/@width,96/@height)
    r = (r1+r2)/2
    w = r*@width
    h = r*@height

    context = c.getContext "2d"
    context.fillStyle = "#666"
    context.fillRect 0,0,c.width,c.height
    context.imageSmoothingEnabled = false
    @draw context,c.width/2-w/2,c.height/2-h/2,w,h

  loadFile:()->
    @project.app.client.sendRequest {
      name: "read_project_file"
      project: @project.id
      file: @file
    },(msg)=>
      @load(msg.content,@project.sprite_table)
      @update()
      @updateCanvases()
      if @project.app.map_editor.selected_map == @name
        @project.app.map_editor.currentMapUpdated()

  getThumbnailElement:()->
    if not @thumbnail?
      @thumbnail = document.createElement "canvas"
      @thumbnail.width = 128
      @thumbnail.height = 96
      context = @thumbnail.getContext "2d"
      context.fillStyle = "#000"
      context.fillRect(0,0,128,96)
      @canvases.push(@thumbnail)
      @update()
      @updateCanvases()
    @thumbnail

  rename:(name)->
    delete @project.map_table[@name]
    @name = name
    @project.map_table[@name] = @

    @filename = @name + "." + @ext
    @file = "maps/"+@filename
    @url = @project.getFullURL()+@file
    s = @name.split "-"
    @shortname = s[s.length-1]
    @path_prefix = if s.length>1 then s.splice(0,s.length-1).join("-")+"-" else ""
