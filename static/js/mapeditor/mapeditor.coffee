class @MapEditor extends Manager
  constructor:(@app)->
    @folder = "maps"
    @item = "map"
    @list_change_event = "maplist"
    @get_item = "getMap"
    @use_thumbnails = false
    @extensions = ["json"]
    @update_list = "updateMapList"

    @init()

    @mapeditor_splitbar = new SplitBar("mapeditor-container","horizontal")
    @mapeditor_splitbar.initPosition(80)

    @mapview = new MapView @
    @tilepicker = new TilePicker @
    document.getElementById("mapeditor-wrapper").appendChild @mapview.canvas

    @save_delay = 1000
    @save_time = 0
    setInterval (()=>@checkSave()),@save_delay/2

    @app.appui.setAction "create-map-button",()=>@createMap()
    @selected_map = null

    @app.appui.setAction "undo-map",()=>@undo()
    @app.appui.setAction "redo-map",()=>@redo()
    @app.appui.setAction "copy-map",()=>@copy()
    @app.appui.setAction "cut-map",()=>@cut()
    @app.appui.setAction "paste-map",()=>@paste()
    @app.appui.setAction "delete-map",()=>@deleteMap()

    document.addEventListener "keydown",(event)=>
      return if not document.getElementById("mapeditor").offsetParent?
      #console.info event
      return if document.activeElement? and document.activeElement.tagName.toLowerCase() == "input"

      if event.metaKey or event.ctrlKey
        switch event.key
          when "z" then @undo()
          when "Z" then @redo()
          else return

        event.preventDefault()
        event.stopPropagation()

    @background_color_picker = new BackgroundColorPicker this,(color)=>
      @mapview.update()
      document.getElementById("map-background-color").style.background = color

    @map_underlay_select = document.getElementById "map-underlay-select"
    @map_underlay_select.addEventListener "change",()=>
      console.info @map_underlay_select.value
      name = @map_underlay_select.value.replace /\//g,"-"
      @map_underlay = name
      @mapview.update()

    document.getElementById("map-background-color").addEventListener "mousedown",(event)=>
      if @background_color_picker.shown
        @background_color_picker.hide()
      else
        @background_color_picker.show()
        event.stopPropagation()

    # @map_name_validator = new InputValidator document.getElementById("map-name"),
    #   document.getElementById("map-name-button"),
    #   null,
    #   (value)=>
    #     return if @app.project.isLocked("maps/#{@selected_map}.json")
    #     @app.project.lockFile("maps/#{@selected_map}.json")
    #     @saveNameChange(value[0])
    #
    # @map_name_validator.regex = RegexLib.filename

    @map_size_validator = new InputValidator [document.getElementById("map-width"),document.getElementById("map-height")],
      document.getElementById("map-size-button"),
      null,
      (value)=>
        return if @app.project.isLocked("maps/#{@selected_map}.json")
        @app.project.lockFile("maps/#{@selected_map}.json")
        @saveDimensionChange()

    @map_blocksize_validator = new InputValidator [document.getElementById("map-block-width"),document.getElementById("map-block-height")],
      document.getElementById("map-blocksize-button"),
      null,
      (value)=>
        return if @app.project.isLocked("maps/#{@selected_map}.json")
        @app.project.lockFile("maps/#{@selected_map}.json")
        @saveDimensionChange()

    @map_code_tip = new CodeSnippetField(@app,"#map-code-tip")

  mapChanged:()->
    return if @ignore_changes
    @app.project.lockFile("maps/#{@selected_map}.json")
    @save_time = Date.now()
    @app.project.addPendingChange @
    map = @app.project.getMap @selected_map
    if map?
      map.update()
      map.updateCanvases()
      @app.runwindow.updateMap @selected_map


  checkSave:(immediate=false,callback)->
    if @save_time>0 and (immediate or Date.now()>@save_time+@save_delay)
      @saveMap(callback)
      @save_time = 0

  forceSave:(callback)->
    @checkSave(true,callback)

  projectOpened:()->
    super()
    @app.project.addListener @
    @setSelectedMap null

  update:()->
    super()
    if @mapeditor_splitbar.position>90
      @mapeditor_splitbar.setPosition 80
    @mapeditor_splitbar.update()
    @mapview.windowResized()

  projectUpdate:(change)->
    super(change)
    switch change
      when "spritelist"
        @rebuildSpriteList()
      when "locks"
        @updateCurrentFileLock()
        @updateActiveUsers()

    if change instanceof ProjectSprite
      name = change.name
      c = document.querySelector "#map-sprite-image-#{name}"
      if c? and c.updateSprite?
        c.updateSprite()

  updateCurrentFileLock:()->
    if @selected_map?
      @mapview.editable = not @app.project.isLocked("maps/#{@selected_map}.json")

    lock = document.getElementById("map-editor-locked")
    if @selected_map? and @app.project.isLocked("maps/#{@selected_map}.json")
      user = @app.project.isLocked("maps/#{@selected_map}.json").user
      lock.style = "display: block; background: #{@app.appui.createFriendColor(user)}"
      lock.innerHTML = "<i class='fa fa-user'></i> Locked by #{user}"
    else
      lock.style = "display: none"

  saveMap:(callback)->
    return if not @selected_map? or not @mapview.map
    data = @mapview.map.save()
    map = @mapview.map
    saved = false
    cells = @mapview.cells_drawn
    @mapview.cells_drawn = 0
    @app.client.sendRequest {
      name: "write_project_file"
      project: @app.project.id
      file: "maps/#{@selected_map}.json"
      content: data
      cells: cells
    },(msg)=>
      saved = true
      @app.project.removePendingChange(@) if @save_time == 0
      map.size = msg.size
      callback() if callback?

    setTimeout (()=>
      if not saved
       @save_time = Date.now()
       console.info("retrying map save...")
      ),10000


  createAsset:(folder,name="map",content="")->
    @checkSave(true)

    if folder?
      name = folder.getFullDashPath()+"-#{name}"
      folder.setOpen true

    map = @app.project.createMap(name)
    map.resize @mapview.map.width,@mapview.map.height,@mapview.map.block_width,@mapview.map.block_height
    name = map.name
    @app.client.sendRequest {
      name: "write_project_file"
      project: @app.project.id
      file: "maps/#{name}.json"
      properties: {}
      content: map.save()
    },(msg)=>
      @app.project.updateMapList()
      @setSelectedItem name

  setSelectedItem:(name)->
    @setSelectedMap name
    super(name)

  setSelectedMap:(map)->
    @selected_map = map

    if @selected_map?
      m = @app.project.getMap(map)
      @mapview.setMap(m)
      @mapview.editable = true

      document.getElementById("map-width").value = m.width
      document.getElementById("map-height").value = m.height

      document.getElementById("map-block-width").value = m.block_width
      document.getElementById("map-block-height").value = m.block_height

      @map_size_validator.update()
      @map_blocksize_validator.update()
      e = document.getElementById("mapeditor-wrapper")
      if e.firstChild?
        e.firstChild.style.display = "inline-block"
    else
      e = document.getElementById("mapeditor-wrapper")
      if e.firstChild?
        e.firstChild.style.display = "none"

    @updateCurrentFileLock()
    @tilepicker.update()
    @setCoordinates(-1,-1)
    @updateCodeTip()

  setMap:(data)->
    map = MicroMap.loadMap(data,@app.project.sprite_table)
    @mapview.setMap(map)
    @mapview.editable = true
    document.getElementById("map-width").value = map.width
    document.getElementById("map-height").value = map.height
    @map_size_validator.update()
    @map_blocksize_validator.update()
    @tilepicker.update()

  rebuildList:()->
    super()
    if @selected_map? and not @app.project.getMap(@selected_map)?
      @setSelectedItem null

    select = document.getElementById "map-underlay-select"
    select.innerHTML = ""

    option = document.createElement "option"
    option.name = " "
    option.value = " "
    option.innerText = " "
    select.appendChild option

    for m in @app.project.map_list
      option = document.createElement "option"
      option.name = m.name
      option.value = m.name
      option.innerText = m.name.replace /-/g,"/"
      select.appendChild option

    if @map_underlay?
      select.value = @map_underlay
    return

  setCoordinates:(x,y)->
    e = document.getElementById("map-coordinates")
    if x<0 or y<0
      e.innerText = ""
    else
      e.innerText = "#{x} , #{y}"

  openMap:(s)->
    if @map_name_change?
      return @saveNameChange ()=>
        @openMap(s)

    @checkSave(true)
    @setSelectedMap(s)

  saveDimensionChange:()->
    @map_dimension_change = null
    w = document.getElementById("map-width").value
    h = document.getElementById("map-height").value
    bw = document.getElementById("map-block-width").value
    bh = document.getElementById("map-block-height").value

    try
      w = Number.parseFloat(w)
      h = Number.parseFloat(h)
      bw = Number.parseFloat(bw)
      bh = Number.parseFloat(bh)
    catch err

    if Number.isInteger(w) and Number.isInteger(h) and w>0 and h>0 and w<129 and h<129 and @selected_map? and (w != @mapview.map.width or h != @mapview.map.height or bw != @mapview.map.block_width or bh != @mapview.map.block_height) and Number.isInteger(bw) and Number.isInteger(bh) and bw>0 and bh>0 and bw<65 and bh<65
      @mapview.map.resize(w,h,bw,bh)
      @mapview.windowResized()
      @mapview.update()
      @mapChanged()
      @checkSave(true)
      document.getElementById("map-width").value = @mapview.map.width
      document.getElementById("map-height").value = @mapview.map.height
      document.getElementById("map-block-width").value = @mapview.map.block_width
      document.getElementById("map-block-height").value = @mapview.map.block_height
      @map_size_validator.update()
      @map_blocksize_validator.update()
    else
      document.getElementById("map-width").value = @mapview.map.width
      document.getElementById("map-height").value = @mapview.map.height
      document.getElementById("map-block-width").value = @mapview.map.block_width
      document.getElementById("map-block-height").value = @mapview.map.block_height
      @map_size_validator.update()
      @map_blocksize_validator.update()

  deleteMap:()->
    return if @app.project.isLocked("maps/#{@selected_map}.json")
    @app.project.lockFile("maps/#{@selected_map}.json")
    if @selected_map?
      msg = @app.translator.get("Really delete %ITEM%?").replace("%ITEM%",@selected_map)
      ConfirmDialog.confirm msg,@app.translator.get("Delete"),@app.translator.get("Cancel"),()=>
        @app.client.sendRequest {
          name: "delete_project_file"
          project: @app.project.id
          file: "maps/#{@selected_map}.json"
        },(msg)=>
          @app.project.updateMapList()
          @mapview.map.clear()
          @mapview.update()
          @mapview.editable = false
          @setSelectedMap null

  rebuildSpriteList:()->
    if not @sprite_folder_view?
      manager =
        folder: "sprites"
        item: "sprite"
        openItem:(item)=>
          @mapview.sprite = item
          @sprite_folder_view.setSelectedItem item
          @tilepicker.update()

      @sprite_folder_view = new FolderView manager,document.querySelector("#map-sprite-list")
      @sprite_folder_view.editable = false

    folder = new ProjectFolder(null,"sprites")
    class ProjectSpriteClone
      constructor:(@project_sprite)->
        @name = @project_sprite.name
        @shortname = @project_sprite.shortname

      getThumbnailElement:()->
        @project_sprite.getThumbnailElement()

      canBeRenamed:()-> false

    for s in @app.project.sprite_list
      folder.push new ProjectSpriteClone(s),s.name

    @sprite_folder_view.rebuildList folder
    return

  currentMapUpdated:()->
    @mapview.update()
    @mapview.windowResized()
    @updateSizeFields()

  updateSizeFields:()->
    if @mapview.map?
      document.getElementById("map-width").value = @mapview.map.width
      document.getElementById("map-height").value = @mapview.map.height
      document.getElementById("map-block-width").value = @mapview.map.block_width
      document.getElementById("map-block-height").value = @mapview.map.block_height
      @map_size_validator.update()
      @map_blocksize_validator.update()

  undo:()->
    return if @app.project.isLocked("maps/#{@selected_map}.json")
    @app.project.lockFile("maps/#{@selected_map}.json")
    if @mapview.map and @mapview.map.undo?
      s = @mapview.map.undo.undo ()=>@mapview.map.clone()
      if s?
        @mapview.map.copyFrom s
        @currentMapUpdated()
        @mapChanged()

  redo:()->
    return if @app.project.isLocked("maps/#{@selected_map}.json")
    @app.project.lockFile("maps/#{@selected_map}.json")
    if @mapview.map and @mapview.map.undo?
      s = @mapview.map.undo.redo()
      if s?
        @mapview.map.copyFrom s
        @currentMapUpdated()
        @mapChanged()

  copy:()->
    @clipboard = @mapview.map.clone()

  cut:()->
    return if @app.project.isLocked("maps/#{@selected_map}.json")
    @app.project.lockFile("maps/#{@selected_map}.json")
    @clipboard = @mapview.map.clone()
    @mapview.map.undo = new Undo() if not @mapview.map.undo?
    @mapview.map.undo.pushState @mapview.map.clone() if @mapview.map.undo.empty()
    @mapview.map.clear()
    @mapview.map.undo.pushState @mapview.map.clone()
    @currentMapUpdated()
    @mapChanged()

  paste:()->
    return if @app.project.isLocked("maps/#{@selected_map}.json")
    @app.project.lockFile("maps/#{@selected_map}.json")
    if @clipboard?
      @mapview.map.undo = new Undo() if not @mapview.map.undo?
      @mapview.map.undo.pushState @mapview.map.clone() if @mapview.map.undo.empty()
      @mapview.map.copyFrom(@clipboard)
      @mapview.map.undo.pushState @mapview.map.clone()
      @currentMapUpdated()
      @mapChanged()

  updateCodeTip:()->
    if @selected_map? and @app.project.getMap(@selected_map)?
      map = @app.project.getMap(@selected_map)
      if map.width>map.height
        h = 200
        w = Math.round(map.width/map.height*200)
      else
        w = 200
        h = Math.round(map.height/map.width*200)

      code = """screen.drawMap( "#{@selected_map.replace(/-/g,"/")}", 0, 0, #{w}, #{h} )"""
    else
      code = ""
    @map_code_tip.set code



class @BackgroundColorPicker
  constructor:(@editor,@callback,@editorid="map")->
    @tool = document.createElement "div"
    @tool.classList.add "value-tool"

    @color = [0,0,0]

    @picker = new ColorPicker @
    @tool.appendChild @picker.canvas

    @picker.colorPicked [0,0,0]

    document.getElementById("#{@editorid}s-section").appendChild @tool

    @started = true
    @tool.addEventListener "mousedown",(event)->
      event.stopPropagation()

    document.addEventListener "mousedown",(event)=>
      @hide()

    @hide()

  setColor:(@color)->
    @callback @color

  hide:()->
    @tool.style.display = "none"
    @shown = false

  show:()->
    e = document.getElementById(@editorid+"-background-color")
    @y = e.getBoundingClientRect().y
    @x = e.getBoundingClientRect().x+e.getBoundingClientRect().width/2

    @y = Math.max(0,@y-100)+document.querySelector("#editor-view .ace_content").getBoundingClientRect().y
    @x = Math.max(0,@x+25)+document.querySelector("#editor-view .ace_content").getBoundingClientRect().x
    @tool.style = "z-index: 20;top:#{@y-200}px;left:#{@x-75}px;"
    @tool.style.display = "block"
    @shown = true
