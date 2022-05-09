class @Manager
  constructor:(@app)->

  init:()->
    @folder_view = new FolderView @,document.getElementById("#{@item}list")
    @folder_view.init()

    @splitbar = new SplitBar(@main_splitpanel or "#{@folder}-section","horizontal")
    @splitbar.initPosition(20)

    create_asset = document.querySelector "##{@item}-asset-bar .create-asset-button"
    create_folder = document.querySelector "##{@item}-asset-bar .create-folder-button"

    create_asset.addEventListener "click",()=>
      @createAsset @folder_view.selected_folder

    create_folder.addEventListener "click",()=>
      parent = @folder_view.selected_folder or @folder_view.folder
      f = parent.createEmptyFolder()
      f.protected = true
      @rebuildList()
      @folder_view.setSelectedFolder f
      @folder_view.editFolderName f

    document.getElementById("#{@item}-name").disabled = true
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
        if name != item.shortname and RegexLib.filename.test(name) and not @app.project[@get_item](item.path_prefix+name)?
          old = @selected_item
          @selected_item = item.path_prefix+name

          @app.client.sendRequest {
            name: "rename_project_file"
            project: @app.project.id
            source: "#{@folder}/#{old}.#{item.ext}"
            dest: "#{@folder}/#{item.path_prefix+name}.#{item.ext}"
            thumbnail: @use_thumbnails
          },(msg)=>
            item.rename(item.path_prefix+name)
            @app.project[@update_list]()
            if @selectedItemRenamed?
              @selectedItemRenamed()
            else
              @setSelectedItem item.name
        else
          document.getElementById("#{@item}-name").value = item.shortname

    @name_validator.regex = RegexLib.filename

    document.getElementById("delete-#{@item}").addEventListener "click",()=>
      @deleteItem()

  renameItem:(item,name)->
    @app.client.sendRequest {
      name: "rename_project_file"
      project: @app.project.id
      source: "#{@folder}/#{item.filename}"
      dest: "#{@folder}/#{name}.#{item.ext}"
      thumbnail: @use_thumbnails
    },(msg)=>
      @app.project[@update_list]()

  update:()->
    @splitbar.update()

  projectOpened:()->
    @app.project.addListener @
    @setSelectedItem null
    @folder_view.setSelectedFolder null

  projectUpdate:(change)->
    if change == @list_change_event
      @rebuildList()
    else if change == "locks"
      @updateActiveUsers()

  rebuildList:()->
    @folder_view.rebuildList @app.project["#{@item}_folder"]

    # for s in @app.project["#{@item}_list"]
    #   element = @createItemBox s
    #   list.appendChild element

    @updateActiveUsers()
    if @selected_item? and not @app.project[@get_item](@selected_item)?
      @setSelectedItem null
    return

  updateActiveUsers:(folder = @app.project["#{@item}_folder"])->
    for f in folder.subfolders
      @updateActiveUsers f

    for f in folder.files
      lock = @app.project.isLocked("#{@folder}/#{f.filename}")
      e = f.element
      if e?
        if lock? and Date.now()<lock.time
          e.querySelector(".active-user").style = "display: block; background: #{@app.appui.createFriendColor(lock.user)};"
        else
          e.querySelector(".active-user").style = "display: none;"
    return

  openItem:(name)->
    item = @app.project[@get_item] name
    if item?
      @setSelectedItem name

  setSelectedItem:(item)->
    @selected_item = item
    @folder_view.setSelectedItem item
    if @selected_item?
      document.getElementById("#{@item}-name").disabled = false
      item = @app.project[@get_item](@selected_item)

      document.getElementById("#{@item}-name").value = if item? then item.shortname else ""
      @name_validator.update()

      if item?
        document.getElementById("#{@item}-name").disabled = item.canBeRenamed? and not item.canBeRenamed()

      if item? and item.uploading
        document.getElementById("#{@item}-name").disabled = true
    else
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
        ConfirmDialog.confirm text,@app.translator.get("Delete"),@app.translator.get("Cancel"),()=>
          @app.client.sendRequest {
            name: "delete_project_file"
            project: @app.project.id
            file: a.file
            thumbnail: @use_thumbnails
          },(msg)=>
            @app.project[@update_list]()
            @setSelectedItem null
            if @selectedItemDeleted?
              @selectedItemDeleted()

  findNewFilename:(name,getter,folder)->
    name = RegexLib.fixFilename name
    if name.length>30 then name = name.substring(0,30)
    path = if folder? then folder.getFullDashPath()+"-"+name else name
    if @app.project[getter](path)
      count = 2
      while @app.project[getter](path+count)
        count += 1
      name = name+count

    name

  deleteFolder:(folder)->
    if not folder.containsFiles()
      folder.delete()
    else
      ConfirmDialog.confirm @app.translator.get("Do you really want to delete this folder and all its contents?"),@app.translator.get("Delete"),@app.translator.get("Cancel"),()=>
        console.info("Deleting #{folder.name}")
        folder.protected = false
        files = folder.getAllFiles()
        for f in files
          @app.client.sendRequest {
            name: "delete_project_file"
            project: @app.project.id
            file: f.file
            thumbnail: @use_thumbnails
          },(msg)=>
            @app.project[@update_list]()
            @setSelectedItem null
        if folder.parent?
          folder.parent.removeFolder folder
        return
