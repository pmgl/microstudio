class @AssetsManager extends Manager
  constructor:(app)->
    super(app)

    @folder = "assets"
    @item = "asset"
    @list_change_event = "assetlist"
    @get_item = "getAsset"
    @use_thumbnails = true
    @extensions = ["glb","obj","json","ttf","png","jpg","txt","csv","md"]
    @update_list = "updateAssetList"

    @model_viewer = new ModelViewer @
    @font_viewer = new FontViewer @
    @image_viewer = new ImageViewer @
    @text_viewer = new TextViewer @

    @init()

    document.querySelector("#capture-asset").addEventListener "click",()=>
      if @asset?
        switch @asset.ext
          when "glb","obj" then @model_viewer.updateThumbnail()

    @code_snippet = new CodeSnippet @app

  init:()->
    super()
    @splitbar.initPosition(30)

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

  selectedItemRenamed:()->
    if @selected_item? and @viewer?
      @viewer.updateSnippet()

  selectedItemDeleted:()->
    parent = document.getElementById "asset-viewer"
    for e in parent.childNodes
      e.style.display = "none"
    @viewer = null
    @asset = null
    @code_snippet.clear()
    return

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
          @viewer = @font_viewer

        when "glb","obj"
          @model_viewer.view @asset
          @viewer = @model_viewer

        when "json","txt","csv","md"
          @text_viewer.view @asset
          @viewer = @text_viewer

        when "png","jpg"
          @image_viewer.view @asset
          @viewer = @image_viewer


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

    split = file.name.split(".")
    name = split[0]
    ext = split[split.length-1]
    return if not ext in @extensions

    reader.addEventListener "load",()=>
      console.info "file read, size = "+ reader.result.length
      return if reader.result.length>6000000


      name = @findNewFilename name,"getAsset",folder
      if folder? then name = folder.getFullDashPath()+"-"+name
      if folder? then folder.setOpen true

      canvas = document.createElement "canvas"
      canvas.width = canvas.height = 64

      asset = @app.project.createAsset(name,canvas.toDataURL(),reader.result.length,ext)
      asset.uploading = true

      if ext in ["json","csv","txt","md"]
        asset.local_text = reader.result
      else
        asset.local_url = reader.result

      @setSelectedItem name
      @openItem name

      if ext in ["json","csv","txt","md"]
        data = reader.result
      else
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
        delete asset.local_url
        @app.project.updateAssetList()
        @checkNameFieldActivation()

    if ext in ["json","csv","txt","md"]
      reader.readAsText(file)
    else
      reader.readAsDataURL(file)

  updateAssetIcon:(asset,canvas)->
    context = canvas.getContext "2d"
    color = switch asset.ext
      when "ttf" then "hsl(200,50%,60%)"
      when "json" then "hsl(0,50%,60%)"
      when "csv" then "hsl(60,50%,60%)"
      when "txt" then "hsl(160,50%,60%)"
      when "md" then "hsl(270,50%,60%)"
      when "glb" then "hsl(300,50%,60%)"
      when "obj" then "hsl(240,50%,70%)"
      else "hsl(0,0%,60%)"

    w = canvas.width
    h = canvas.height
    context.fillStyle = "#222"
    context.fillRect(w-30,h-16,30,16)
    context.fillStyle = color
    context.fillRect(0,h-2,w,2)
    context.font = "7pt sans-serif"
    context.fillText "#{asset.ext.toUpperCase()}",w-26,h-5

    asset.thumbnail_url = canvas.toDataURL()

    @app.client.sendRequest {
      name: "write_project_file"
      project: @app.project.id
      file: "assets/#{asset.name}.#{asset.ext}"
      thumbnail: canvas.toDataURL().split(",")[1]
    },(msg)=>
      console.info msg

    if asset.element?
      asset.element.querySelector("img").src = canvas.toDataURL()

class @CodeSnippet
  constructor:(@app)->

    copyable = true

    @container = document.querySelector "#asset-load-code"
    @input = document.querySelector "#asset-load-code input"
    @select = document.querySelector "#asset-load-code select"

    @select.addEventListener "change",()=>
      @setIndex @select.selectedIndex

    document.querySelector("#asset-load-code i").addEventListener "click",()=>
      return if not copyable
      input = document.querySelector("#asset-load-code input")
      copy = document.querySelector("#asset-load-code i")
      code = input.value
      navigator.clipboard.writeText code
      input.value = @app.translator.get "Copied!"
      copyable = false

      copy.classList.remove "fa-copy"
      copy.classList.add "fa-check"

      setTimeout (()=>
        copy.classList.remove "fa-check"
        copy.classList.add "fa-copy"
        input.value = code
        copyable = true),1000

  clear:()->
    @select.innerHTML = ""
    @input.value = ""
    @container.style.display = "none"

  set:(@list)->
    @clear()
    for snippet,i in @list
      name = @app.translator.get snippet.name
      value = snippet.value
      option = document.createElement "option"
      option.value = i
      option.innerText = name
      @select.appendChild option

      if i==0
        @input.value = snippet.value
    @container.style.display = "block"

  setIndex:(index)->
    if @list? and index<@list.length
      @input.value = @list[index].value

class @CodeSnippetField
  constructor:(@app,query)->
    @element = document.querySelector query
    @input = @element.querySelector "input"
    @i = @element.querySelector("i")

    copyable = true
    @i.addEventListener "click",()=>
      return if not copyable

      code = @input.value
      navigator.clipboard.writeText code
      @input.value = @app.translator.get "Copied!"
      copyable = false

      @i.classList.remove "fa-copy"
      @i.classList.add "fa-check"

      setTimeout (()=>
        @i.classList.remove "fa-check"
        @i.classList.add "fa-copy"
        @input.value = @code
        copyable = true),1000

  set:(@code)->
    @input.value = @code
