class @ProjectMap extends MicroMap
  constructor:(@project,@file,@size=0)->
    super 16,10,16,16,@project.sprite_table
    @url = @project.getFullURL()+@file
    @canvases = []
    @name = @file.substring 0,@file.length-5
    @filename = @file
    @loadFile()

  addCanvas:(canvas)->
    @canvases.push canvas
    @updateCanvas canvas

  updateCanvases:()->
    for c in @canvases
      @updateCanvas c
    return

  updateCanvas:(c)->
    r = Math.min(96/@width,96/@height)
    w = r*@width
    h = r*@height
    c.width = 96
    c.height = 96

    context = c.getContext "2d"
    context.clearRect 0,0,c.width,c.height
    context.imageSmoothingEnabled = false
    context.drawImage @canvas,48-w/2,48-h/2,w,h

  loadFile:()->
    @project.app.client.sendRequest {
      name: "read_project_file"
      project: @project.id
      file: "maps/#{@file}"
    },(msg)=>
      @load(msg.content,@project.sprite_table)
      @update()
      @updateCanvases()
      if @project.app.map_editor.selected_map == @name
        @project.app.map_editor.currentMapUpdated()

  rename:(@name)->
    @file = @name+".json"
    @filename = @file
    @url = @project.getFullURL()+@file
