class @Manager
  constructor:(@app)->
    @box_width = 64
    @box_height = 84

  init:()->
    # @folder
    # @item
    # @list_change_event
    # @get_item = "getSound"
    # @use_thumbnails
    # @update_list

    @splitbar = new SplitBar("#{@folder}-section","horizontal")
    @splitbar.setPosition(20)

    if @fileDropped?
      document.getElementById("#{@item}list").addEventListener "dragover",(event)=>
        event.preventDefault()

      document.getElementById("#{@item}list").addEventListener "drop",(event)=>
        event.preventDefault()
        document.getElementById("#{@item}list").classList.remove("dragover")
        try
          list = []
          for i in event.dataTransfer.items
            list.push i.getAsFile()

          while list.length>0
            file = list.splice(0,1)[0]
            ext = file.name.split(".")[1].toLowerCase()
            if ext in @extensions
              @fileDropped(file)
        catch err
          console.error err

      document.getElementById("#{@item}list").addEventListener "dragenter",(event)=>
        document.getElementById("#{@item}list").classList.add("dragover")

      document.getElementById("#{@item}list").addEventListener "dragleave",(event)=>
        document.getElementById("#{@item}list").classList.remove("dragover")

    @name_validator = new InputValidator document.getElementById("#{@item}-name"),
      document.getElementById("#{@item}-name-button"),
      null,
      (value)=>
        return if not @selected_item
        item = @app.project[@get_item](@selected_item)
        return if not item?
        return if @app.project.isLocked("#{@folder}/#{item.name}.#{item.ext}")
        @app.project.lockFile("#{@folder}/#{item.name}.#{item.ext}")
        name = value[0].toLowerCase()
        name = RegexLib.fixFilename(name)
        document.getElementById("#{@item}-name").value = name
        @name_validator.update()
        if name != @selected_item and RegexLib.filename.test(name) and not @app.project[@get_item](name)?
          old = @selected_item
          @selected_item = name

          @app.client.sendRequest {
            name: "rename_project_file"
            project: @app.project.id
            source: "#{@folder}/#{old}.#{item.ext}"
            dest: "#{@folder}/#{name}.#{item.ext}"
            thumbnail: @use_thumbnails
          },(msg)=>
            @app.project[@update_list]()

    @name_validator.regex = RegexLib.filename

    document.getElementById("delete-#{@item}").addEventListener "click",()=>
      @deleteItem()


  update:()->
    @splitbar.update()

  projectOpened:()->
    @app.project.addListener @
    @setSelectedItem null

  projectUpdate:(change)->
    if change == @list_change_event
      @rebuildList()

  createItemBox:(item)->
    element = document.createElement "div"
    element.classList.add "asset-box"
    element.setAttribute "style","width:#{@box_width}px ; height:#{@box_height}px"
    element.setAttribute "id","project-#{@item}-#{item.name}"
    element.setAttribute "title",item.name
    if item.name == @selected_item
      element.classList.add "selected"

    icon = new Image
    icon.src = item.getThumbnailURL()
    icon.setAttribute "id","asset-image-#{item.name}"
    element.appendChild icon

    text = document.createElement "div"
    text.classList.add "asset-box-name"
    text.innerHTML = item.name

    element.appendChild text

    element.addEventListener "click",()=>
      @openItem item.name

    activeuser = document.createElement "i"
    activeuser.classList.add "active-user"
    activeuser.classList.add "fa"
    activeuser.classList.add "fa-user"
    element.appendChild activeuser
    element

  rebuildList:()->
    list = document.getElementById "#{@item}-list"
    list.innerHTML = ""

    for s in @app.project["#{@item}_list"]
      element = @createItemBox s
      list.appendChild element

    #@updateActiveUsers()
    if @selected_item? and not @app.project[@get_item](@selected_item)?
      @setSelectedItem null
    return

  openItem:(name)->
    item = @app.project[@get_item] name
    if item?
      @setSelectedItem name

  setSelectedItem:(item)->
    @selected_item = item
    list = document.getElementById("#{@item}-list").childNodes

    if @selected_item?
      for e in list
        if e.getAttribute("id") == "project-#{@item}-#{item}"
          e.classList.add("selected")
        else
          e.classList.remove("selected")

      document.getElementById("#{@item}-name").value = item
      @name_validator.update()
      document.getElementById("#{@item}-name").disabled = false
      item = @app.project[@get_item](@selected_item)
      if item? and item.uploading
        document.getElementById("#{@item}-name").disabled = true
    else
      for e in list
        e.classList.remove("selected")
      document.getElementById("#{@item}-name").value = ""
      document.getElementById("#{@item}-name").disabled = true

  checkNameFieldActivation:()->
    return if not @selected_item
    item = @app.project[@get_item](@selected_item)
    if item?
      document.getElementById("#{@item}-name").disabled = if item.uploading then true else false

  deleteItem:()->
    if @selected_item?
      a = @app.project[@get_item] @selected_item
      if a?
        text = @app.translator.get("Do you really want to delete %ITEM%?").replace("%ITEM%",@selected_item)
        if confirm text
          @app.client.sendRequest {
            name: "delete_project_file"
            project: @app.project.id
            file: a.file
            thumbnail: @use_thumbnails
          },(msg)=>
            @app.project[@update_list]()
            @setSelectedItem null

  findNewFilename:(name,getter)->
    name = RegexLib.fixFilename name
    if name.length>30 then name = name.substring(0,30)
    if @app.project[getter](name)
      count = 2
      while @app.project[getter](name+count)
        count += 1
      name = name+count

    name
