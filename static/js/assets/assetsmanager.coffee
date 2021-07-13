class @AssetsManager
  constructor:(@app)->
    @viewer = new AssetViewer @

  projectOpened:()->
    @app.project.addListener @
    #@setSelectedAsset null

  projectUpdate:(change)->
    if change == "assetlist"
      @rebuildAssetList()

  init:()->
    return if @initialized

    @initialized = true
    s = document.createElement "script"
    s.src = "/lib/three.min.js"
    document.body.appendChild s

    s.onload = ()=>
      s = document.createElement "script"
      s.src = "/lib/GLTFLoader.js"
      document.body.appendChild s

    document.getElementById("assets-section").addEventListener "dragover",(event)=>
      event.preventDefault()
      #console.info event

    document.getElementById("assets-section").addEventListener "drop",(event)=>
      event.preventDefault()
      try
        list = []
        for i in event.dataTransfer.items
          list.push i.getAsFile()

        if list.length>0
          file = list[0]
          @fileDropped(file)
      catch err
        console.error err

    @name_validator = new InputValidator document.getElementById("asset-name"),
      document.getElementById("asset-name-button"),
      null,
      (value)=>
        if @dropped_model?
          name = value[0].toLowerCase()
          if RegexLib.filename.test(name) and not @app.project.getAsset(name)?
            @app.project.addPendingChange @
            @app.client.sendRequest {
              name: "write_project_file"
              project: @app.project.id
              file: "assets/#{name}.glb"
              properties: {}
              content: @dropped_model
              thumbnail: @viewer.getThumbnail()
            },(msg)=>
              console.info msg
              @app.project.removePendingChange(@)
              @app.project.updateAssetList()

            delete @dropped_model
            document.getElementById("asset-name").disabled = true
            @name_validator.validate()

    @name_validator.accept_initial = true
    @name_validator.auto_reset = false

    document.getElementById("delete-asset").addEventListener "click",()=>
      @deleteAsset()

  fileDropped:(file)->
    console.info "processing #{file.name}"
    reader = new FileReader()
    reader.addEventListener "load",()=>
      console.info "file read, size = "+ reader.result.length
      @viewer.view(reader.result)
      @dropped_model = reader.result.split(",")[1]
      console.info "file size = " +@dropped_model.length
      @name_validator.set file.name.split(".")[0]
      @name_validator.change()
      document.getElementById("asset-name").disabled = false

    reader.readAsDataURL(file)
      #url = "data:application/javascript;base64,"+btoa(Audio.processor)

  createAssetBox:(asset)->
    element = document.createElement "div"
    element.classList.add "asset-box"
    element.classList.add "large"
    element.setAttribute "id","project-asset-#{asset.name}"
    element.setAttribute "title",asset.name
    if asset.name == @selected_asset
      element.classList.add "selected"

    iconbox = document.createElement "div"
    iconbox.classList.add("icon-box")

    icon = new Image
    icon.src = asset.getThumbnailURL()
    icon.setAttribute "id","asset-image-#{asset.name}"
    iconbox.appendChild icon
    element.appendChild iconbox

    element.appendChild document.createElement "br"

    text = document.createElement "span"
    text.innerHTML = asset.name

    element.appendChild text

    element.addEventListener "click",()=>
      @openAsset asset.name

    activeuser = document.createElement "i"
    activeuser.classList.add "active-user"
    activeuser.classList.add "fa"
    activeuser.classList.add "fa-user"
    element.appendChild activeuser
    element

  rebuildAssetList:()->
    list = document.getElementById "asset-list"
    list.innerHTML = ""

    for s in @app.project.asset_list
      element = @createAssetBox s
      list.appendChild element

    #@updateActiveUsers()
    if @selected_asset? and not @app.project.getAsset(@selected_asset)?
      @setSelectedAsset null
    return

  openAsset:(name)->
    asset = @app.project.getAsset name
    if asset?
      @setSelectedAsset name
      @viewer.view asset.getURL()

  setSelectedAsset:(asset)->
    @selected_asset = asset
    list = document.getElementById("asset-list").childNodes

    if @selected_asset?
      for e in list
        if e.getAttribute("id") == "project-asset-#{asset}"
          e.classList.add("selected")
        else
          e.classList.remove("selected")

      document.getElementById("asset-name").value = asset
      @name_validator.update()
      document.getElementById("asset-name").disabled = true
      @viewer.resize()
    else
      for e in list
        e.classList.remove("selected")
      document.getElementById("asset-name").value = ""

  deleteAsset:()->
    if @selected_asset?
      a = @app.project.getAsset @selected_asset
      if a?
        if confirm "Really delete #{@selected_asset}?"
          @app.client.sendRequest {
            name: "delete_project_file"
            project: @app.project.id
            file: a.file
            thumbnail: true
          },(msg)=>
            @app.project.updateAssetList()
            @viewer.clear()
            @setSelectedAsset null
