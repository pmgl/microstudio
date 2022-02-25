class @TextViewer
  constructor:(@manager)->
    @element = document.getElementById "text-asset-viewer"

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
    @element.style.display = "block"
    @asset = asset
    @updateSnippet()

    if not @initialized
      @initialized = true
      @editor = ace.edit "text-asset-viewer"
      @editor.$blockScrolling = Infinity
      @editor.setTheme("ace/theme/tomorrow_night_bright")
      @editor.setFontSize("12px")
      @editor.setReadOnly(true)

    switch asset.ext
      when "json"
        @editor.getSession().setMode("ace/mode/json")
      else
        @editor.getSession().setMode("ace/mode/text")

    if asset.local_text?
      @setText(asset,asset.local_text,asset.ext)
    else
      fetch(asset.getURL()).then (result)=>
        result.text().then (text)=>
          @setText asset,text,asset.ext

  setText:(asset,text,ext)->
    if ext == "json"
      try
        text = JSON.stringify(JSON.parse(text), null, '\t')
      catch err
        console.error err

    @editor.setValue(text,-1)

    @manager.checkThumbnail asset,()=>
      console.info "Must create thumbnail"
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
      while i<lines.length and i<10
        context.fillText lines[i],4,10+i*8
        i += 1

      context.restore()

      if asset.element?
        asset.element.querySelector("img").src = canvas.toDataURL()

      @manager.updateAssetIcon asset,canvas
