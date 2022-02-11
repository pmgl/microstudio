class @AssetsManager extends Manager
  constructor:(@app)->
    super(@app)

    @folder = "assets"
    @item = "asset"
    @list_change_event = "assetlist"
    @get_item = "getAsset"
    @use_thumbnails = true
    @extensions = ["glb","obj","json","ttf","png","jpg","txt","csv"]
    @update_list = "updateAssetList"

    @model_viewer = new ModelViewer @
    @font_viewer = new FontViewer @
    @image_viewer = new ImageViewer @
    @text_viewer = new TextViewer @

    @init()

    document.querySelector("#capture-asset").addEventListener "click",()=>
      if @asset?
        switch @asset.ext
          when "glb" then @model_viewer.updateThumbnail()

    document.querySelector("#asset-load-code i").addEventListener "click",()=>
      input = document.querySelector("#asset-load-code input")
      copy = document.querySelector("#asset-load-code i")
      code = input.value
      navigator.clipboard.writeText code
      input.value = @app.translator.get "Copied!"

      copy.classList.remove "fa-copy"
      copy.classList.add "fa-check"

      setTimeout (()=>
        copy.classList.remove "fa-check"
        copy.classList.add "fa-copy"
        input.value = code),1000

  update:()->
    super()

  checkThumbnail:(asset,callback)->
    url = asset.getThumbnailURL()
    img = new Image
    img.src = url
    img.onload = ()=>
      if img.width>0 and img.height>0
        canvas = document.createElement "canvas"
        canvas.width = 1
        canvas.height = 1
        ctx = canvas.getContext "2d"
        ctx.drawImage img,-31,-31
        data = ctx.getImageData 0,0,1,1
        if data.data[3]>128
          return

      callback()

  openItem:(name)->
    super(name)
    @asset = @app.project.getAsset(name)
    console.info @asset
    parent = document.getElementById "asset-viewer"
    for e in parent.childNodes
      e.style.display = "none"

    if @asset?
      switch @asset.ext
        when "ttf"
          @font_viewer.view @asset

        when "glb"
          @model_viewer.view @asset

  createAsset:(folder)->
    input = document.createElement "input"
    input.type = "file"
    #input.accept = ".glb"
    input.addEventListener "change",(event)=>
      files = event.target.files
      if files.length>=1
        for f in files
          @fileDropped(f,folder)
      return

    input.click()

  fileDropped:(file,folder)->
    console.info "processing #{file.name}"
    console.info "folder: "+folder
    reader = new FileReader()
    reader.addEventListener "load",()=>
      console.info "file read, size = "+ reader.result.length
      return if reader.result.length>6000000

      split = file.name.split(".")
      name = split[0]
      ext = split[1]
      return if not ext in @extensions

      name = @findNewFilename name,"getAsset",folder
      if folder? then name = folder.getFullDashPath()+"-"+name
      if folder? then folder.setOpen true

      canvas = document.createElement "canvas"
      canvas.width = canvas.height = 64

      asset = @app.project.createAsset(name,canvas.toDataURL(),reader.result.length,ext)
      asset.uploading = true
      asset.local_url = reader.result
      
      @setSelectedItem name
      @openItem name

      data = reader.result.split(",")[1]
      @app.project.addPendingChange @

      @app.client.sendRequest {
        name: "write_project_file"
        project: @app.project.id
        file: "assets/#{name}.#{ext}"
        properties: {}
        content: data
        thumbnail: canvas.toDataURL().split(",")[1]
      },(msg)=>
        console.info msg
        @app.project.removePendingChange(@)
        asset.uploading = false
        @app.project.updateAssetList()
        @checkNameFieldActivation()

    reader.readAsDataURL(file)

  updateAssetIcon:(asset,canvas)->
    @app.client.sendRequest {
      name: "write_project_file"
      project: @app.project.id
      file: "assets/#{asset.name}.#{asset.ext}"
      thumbnail: canvas.toDataURL().split(",")[1]
    },(msg)=>
      console.info msg
