class @TextViewer
  constructor:(@manager)->
    @element = document.getElementById "text-asset-viewer"
    @app = @manager.app

    @save_delay = 3000
    @save_time = 0
    setInterval (()=>@checkSave()),@save_delay/2


  updateSnippet:()->
    switch @asset.ext
      when "json"
        @manager.code_snippet.set [{
          name: "Load JSON as object"
          value: """loader = asset_manager.loadJSON("#{@asset.name.replace(/-/g,"/")}", callback)"""
        }]
      when "csv"
        @manager.code_snippet.set [{
          name: "Load CSV file as text"
          value: """loader = asset_manager.loadCSV("#{@asset.name.replace(/-/g,"/")}", callback)"""
        }]
      when "txt"
        @manager.code_snippet.set [{
          name: "Load text file"
          value: """loader = asset_manager.loadText("#{@asset.name.replace(/-/g,"/")}", callback)"""
        }]

  view:(asset)->
    @checkSave(true)
    @element.style.display = "block"
    @asset = asset
    @updateSnippet()

    if not @initialized
      @initialized = true
      @editor = ace.edit "text-asset-viewer"
      @editor.$blockScrolling = Infinity
      @editor.setTheme("ace/theme/tomorrow_night_bright")
      @editor.setFontSize("12px")
      @editor.setReadOnly(false)
      @editor.getSession().on "change",()=>
        @editorContentsChanged()

    switch asset.ext
      when "json"
        @editor.getSession().setMode("ace/mode/json")
      when "md"
        @editor.getSession().setMode("ace/mode/markdown")
      else
        @editor.getSession().setMode("ace/mode/text")

    if asset.local_text?
      @setText(asset,asset.local_text,asset.ext)
    else
      fetch(asset.getURL()).then (result)=>
        result.text().then (text)=>
          @setText asset,text,asset.ext

  setText:(asset,text,ext)->
    @ignore_changes = true
    #@updateCurrentFileLock()

    if ext == "json"
      try
        text = JSON.stringify(JSON.parse(text), null, '\t')
      catch err
        console.error err

    @editor.setValue(text,-1)
    @editor.getSession().setUndoManager(new ace.UndoManager())

    @manager.checkThumbnail asset,()=>
      console.info "Must create thumbnail"
      canvas = @createThumbnail text,ext

      if asset.element?
        asset.element.querySelector("img").src = canvas.toDataURL()

      @manager.updateAssetIcon asset,canvas

    @ignore_changes = false

  createThumbnail:(text,ext)->
    canvas = document.createElement "canvas"
    canvas.width = 128
    canvas.height = 96
    context = canvas.getContext "2d"
    context.save()
    context.fillStyle = "#222"
    context.fillRect(0,0,canvas.width,canvas.height)
    color = switch ext
      when "json" then "hsl(0,50%,60%)"
      when "csv" then "hsl(60,50%,60%)"
      else "hsl(160,50%,60%)"

    grd = context.createLinearGradient(0,0,0,96)
    grd.addColorStop(0,color)
    grd.addColorStop(1,"#222")
    context.fillStyle = grd

    context.rect(4,4,120,120)
    context.clip()
    context.font = "5pt Verdana"
    lines = text.split("\n")
    i = 0
    while i < lines.length and i < 10
      context.fillText lines[i],4,10+i*8
      i += 1

    context.restore()
    canvas


  editorContentsChanged:()->
    document.getElementById("text-asset-viewer").style.removeProperty("background")
    return if @ignore_changes
    @update_time = Date.now()
    @save_time = Date.now()
    @app.project.addPendingChange @
    if @asset?
      @app.project.lockFile "assets/#{@asset.filename}"
      @asset.content = @editor.getValue()

  checkSave:(immediate=false,callback)->
    if @save_time > 0 and (immediate or Date.now() > @save_time + @save_delay)
      @saveFile(callback)
      @save_time = 0

  forceSave:(callback)->
    @checkSave(true,callback)

  saveFile:(callback)->
    saved = false

    if @asset.ext == "json"
      try
        json = JSON.parse @asset.content
        console.info "JSON parsed successfully"
      catch err
        document.getElementById("text-asset-viewer").style.background = "#600"
        return
   
    @app.client.sendRequest {
      name: "write_project_file"
      project: @app.project.id
      file: "assets/#{@asset.filename}"
      content: @asset.content
    },(msg)=>
      saved = true
      @app.project.removePendingChange(@) if @save_time == 0
      @asset.size = msg.size
      callback() if callback?

    setTimeout (()=>
      if not saved
       @save_time = Date.now()
       console.info("retrying code save...")
      ),10000