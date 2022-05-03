class @FolderView
  constructor:(@manager,@panel)->
    @editable = true
    @app = @manager.app

  init:()->
    @panel.addEventListener "mousedown",()=>
      @setSelectedFolder(null)

    if @editable and @manager.fileDropped?
      @panel.addEventListener "dragover",(event)=>
        event.preventDefault()
        #console.info "dragover"

      @panel.addEventListener "drop",(event)=>
        event.preventDefault()
        @panel.classList.remove("dragover")
        try
          list = []
          for i in event.dataTransfer.items
            list.push i.getAsFile()
            if i.kind == "file"
              file = i.getAsFile()
              split = file.name.split(".")
              ext = split[split.length-1].toLowerCase()
              if ext in @manager.extensions
                @manager.fileDropped(file)
            else if i.kind == "string"
              i.getAsString (s)=>
                console.info s
                try
                  data = JSON.parse(s)
                  if data.type == @manager.item and @drag_file?
                    if @drag_file.parent != @folder
                      name = @manager.findNewFilename(@drag_file.shortname,@manager.get_item)
                      @manager.renameItem @drag_file,name
                  else if data.type == "folder" and @drag_folder?
                    @moveFolder @drag_folder,@folder

                catch err
                  console.error err
        catch err
          console.error err

      count = 0
      @panel.addEventListener "dragenter",(event)=>
        count += 1
        @panel.classList.add("dragover")
        @setSelectedFolder null

      @panel.addEventListener "dragleave",(event)=>
        count -= 1
        if count == 0
          @panel.classList.remove("dragover")

  moveFolder:(folder,dest)->
    for f in dest.subfolders
      if f.name == folder.name
        return

    dest.addFolder folder
    @fixFilesPath folder

  fixFilesPath:(folder)->
    for f in folder.subfolders
      @fixFilesPath f

    for f in folder.files
      name = folder.getFullDashPath()+"-"+f.shortname
      @manager.renameItem f,name

    return

  createItemBox:(item)->
    element = document.createElement "div"
    element.classList.add "asset-box"
    element.classList.add "asset-box-#{@manager.item}"
    item.element = element

    element.dataset.id = item.name

    element.setAttribute "title",item.shortname
    if item.name == @selected_item
      element.classList.add "selected"

    if item.getThumbnailURL?
      icon = new Image
      icon.src = item.getThumbnailURL()
      icon.loading = "lazy"
      icon.setAttribute "id","asset-image-#{item.name}"
      element.appendChild icon
      icon.draggable = false
    else if item.getThumbnailElement?
      icon = item.getThumbnailElement()
      #icon.setAttribute "id","asset-image-#{item.name}"
      element.appendChild icon
      icon.draggable = false

    text = document.createElement "div"
    text.classList.add "asset-box-name"
    if @manager.file_icon?
      text.innerHTML = """<i class="#{@manager.file_icon}"></i> #{item.shortname}"""
    else
      text.innerHTML = item.shortname

    element.appendChild text

    element.addEventListener "click",()=>
      @manager.openItem item.name

    activeuser = document.createElement "i"
    activeuser.classList.add "active-user"
    activeuser.classList.add "fa"
    activeuser.classList.add "fa-user"
    element.appendChild activeuser

    element.draggable = if item.canBeRenamed? then item.canBeRenamed() else true
    element.addEventListener "dragstart",(event)=>
      @drag_file = item
      event.dataTransfer.setData "text/plain",JSON.stringify
        type: @manager.item
        id: item.name

    element

  setSelectedFolder:(folder,current=@folder)->
    @selected_folder = folder
    return if not current?
    if current.element?
      if current == folder
        current.element.classList.add "selected"
      else
        current.element.classList.remove "selected"

    for f in current.subfolders
      @setSelectedFolder folder,f
    return

  createItemFolder:(folder,element)->
    for f in folder.subfolders
      fdiv = document.createElement "div"
      fdiv.classList.add "folder"
      element.appendChild fdiv
      f.setElement fdiv

      # del = document.createElement "i"
      # del.classList.add "fa"
      # del.classList.add "fa-trash"
      # del.classList.add "trash"
      # title.appendChild del

      title = document.createElement "div"
      title.classList.add "folder-title"
      title.innerHTML = """<i class="fas fa-trash-alt trash"></i><i class="fa caret"></i><i class="fa folder"></i> <span>#{f.name}</span> <i class="fa pencil fa-pencil-alt"></i>"""

      title.addEventListener "resize",()=>
        if title.getBoundingClientRect().width<200
          title.querySelector(".trash").style.display = "none"
        else
          title.querySelector(".trash").style.display = "inline-block"

      fdiv.appendChild title

      content = document.createElement "div"
      content.classList.add "folder-content"
      fdiv.appendChild content

      do (f,fdiv,title)=>
        if @editable
          title.querySelector(".trash").addEventListener "click",()=>
            @manager.deleteFolder f
            @setSelectedFolder null

          fdiv.addEventListener "mousedown",(event)=>
            event.stopPropagation()
            @setSelectedFolder(f)
            # this ensures potential active audio preview will stop playing
            document.body.dispatchEvent new MouseEvent "mousedown",{}

          title.draggable = true
          title.addEventListener "dragstart",(event)=>
            @drag_folder = f
            event.dataTransfer.setData "text/plain",JSON.stringify
              type: "folder"
              id: f.getFullDashPath()

        toggle = ()->
          f.setOpen not f.open

        title.addEventListener "click",(event)=>
          if event.clientX<title.getBoundingClientRect().x+50
            toggle()

        title.addEventListener "dblclick",(event)=>
          toggle()

        if @editable
          span = title.querySelector "span"
          span.addEventListener "dblclick",(event)=>
            event.stopPropagation()
            @editFolderName f

          title.querySelector(".pencil").addEventListener "click",()=>
            @editFolderName f

          count = 0

          fdiv.addEventListener "dragenter",(event)=>
            event.stopPropagation()
            count += 1
            if not f.element.classList.contains "selected"
              @setSelectedFolder f
            if not f.open
              if not f.open_timeout?
                f.open_timeout = setTimeout (()=>
                  f.setOpen true
                  delete f.open_timeout
                ),1000

          fdiv.addEventListener "dragleave",(event)=>
            event.stopPropagation()
            count -= 1
            if count == 0
              if f.open_timeout?
                clearTimeout f.open_timeout
                delete f.open_timeout

          fdiv.addEventListener "dragover",(event)=>
            event.preventDefault()

          fdiv.addEventListener "drop",(event)=>
            event.preventDefault()
            event.stopPropagation()
            try
              list = []
              for i in event.dataTransfer.items
                if i.kind == "file"
                  file = i.getAsFile()
                  ext = file.name.split(".")[1].toLowerCase()
                  if ext in @manager.extensions
                    @manager.fileDropped(file,f)
                else if i.kind == "string"
                  i.getAsString (s)=>
                    console.info s
                    try
                      data = JSON.parse(s)
                      if data.type == @manager.item and @drag_file?
                        if @drag_file.parent != f
                          name = @manager.findNewFilename(@drag_file.shortname,@manager.get_item,f)
                          fullname = f.getFullDashPath()+"-"+name
                          @manager.renameItem @drag_file,fullname
                      else if data.type == "folder" and @drag_folder?
                        if @drag_folder != f and not @drag_folder.isAncestorOf f
                          @moveFolder @drag_folder,f

                    catch err
                      console.error err

            catch err
              console.error err
            return

      @createItemFolder(f,content)

    for f in folder.files
      element.appendChild @createItemBox f
    return

  rebuildList:(@folder)->
    scroll_top = @panel.scrollTop
    @panel.innerHTML = ""

    @createItemFolder @folder,@panel
    #@updateActiveUsers()
    @panel.scrollTop = scroll_top
    if @selected_folder?
      @setSelectedFolder @selected_folder
    if @selected_item?
      @setSelectedItem @selected_item
    return

  setSelectedItem:(item)->
    list = @panel.getElementsByClassName "asset-box"

    @selected_item = item

    if @selected_item?
      for e in list
        if e.dataset.id == item
          e.classList.add("selected")
        else
          e.classList.remove("selected")
    else
      for e in list
        e.classList.remove("selected")

    return

  editFolderName:(folder)->
    parent = folder.parent
    while parent?
      if parent.setOpen?
        parent.setOpen true
      parent = parent.parent

    files = folder.getAllFiles()
    for f in files
      return if @app.project.isLocked "#{@manager.folder}/#{f.name}.#{f.ext}"

    input = document.createElement "input"
    input.value = folder.name
    span = folder.element.querySelector "span"
    span.parentNode.replaceChild input,span

    for f in files
      @app.project.lockFile "#{@manager.folder}/#{f.name}.#{f.ext}"

    input.focus()
    input.addEventListener "dblclick",(event)=>event.stopPropagation()
    input.addEventListener "blur",()=>
      input.parentNode.replaceChild span,input
      value = RegexLib.fixFilename(input.value)
      if value != folder.name
        if RegexLib.filename.test(value) and not folder.parent.getSubFolder(value)?
          span.innerText = value
          for f in files
            f.old_path = f.parent.getFullDashPath()+"-"+f.shortname+"."+f.ext
          folder.name = value
          for f in files
            oldpath = f.old_path
            name = f.parent.getFullDashPath()+"-"+f.shortname
            path = name+"."+f.ext
            f.rename(name)
            @app.client.sendRequest {
              name: "rename_project_file"
              project: @app.project.id
              source: "#{@manager.folder}/#{oldpath}"
              dest: "#{@manager.folder}/#{path}"
              thumbnail: @manager.use_thumbnails
            },(msg)=>
              @app.project[@manager.update_list]()

    input.addEventListener "keydown",(event)=>
      # @app.project.lockFile "ms/#{source.name}.ms"
      if event.key == "Enter"
        event.preventDefault()
        input.blur()
        false
      else
        true
