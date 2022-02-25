class @FontViewer
  constructor:(@manager)->
    @element = document.getElementById "font-asset-viewer"

  updateSnippet:()->
    @manager.code_snippet.set [
      {
        name: "Load Font"
        value: """asset_manager.loadFont("#{@asset.name.replace(/-/g,"/")}")"""
      }
      {
        name: "Use Font"
        value: """screen.setFont("#{@asset.shortname}")"""
      }
    ]

  view:(asset)->
    @asset = asset
    @element.style.display = "block"
    @element.innerHTML = ""

    @updateSnippet()

    font = new FontFace(asset.shortname, "url(#{asset.getURL()})")
    font.load().then ()=>
      document.fonts.add(font)
      @element.style["font-family"] = asset.shortname
      @element.innerHTML = """
      <h1>#{asset.shortname}</h1>
      <h2>ABCDEFGHIJKLMNOPQRSTUVWXYZ</h2>
      <h2>abcdefghijklmnopqrstuvwxyz</h2>
      <h2>0123456789</h2>
      <p>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
      <p>abcdefghijklmnopqrstuvwxyz</p>
      <p>0123456789</p>
      """

      @manager.checkThumbnail asset,()=>
        console.info "Must create thumbnail"
        canvas = document.createElement "canvas"
        canvas.width = 128
        canvas.height = 96
        context = canvas.getContext "2d"
        context.save()
        context.fillStyle = "hsl(200,50%,85%)"
        context.fillRect(0,0,canvas.width,canvas.height)
        context.fillStyle = "rgba(0,0,0,.75)"
        context.rect(0,0,124,92)
        context.clip()
        context.font = "12pt #{asset.shortname}"
        context.fillText "ABCDEFGHIJKL",4,36
        context.fillText "abcdefghijkl",4,54
        context.fillText "0123456789",4,72

        size = 11
        while size>6 and context.measureText(asset.shortname).width>120
          size -= 1
          context.font = "#{size}pt #{asset.shortname}"

        context.fillText asset.shortname,4,14
        context.restore()

        if asset.element?
          asset.element.querySelector("img").src = canvas.toDataURL()

        @manager.updateAssetIcon asset,canvas
