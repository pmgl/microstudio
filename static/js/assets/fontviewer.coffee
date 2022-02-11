class @FontViewer
  constructor:(@manager)->
    @element = document.getElementById "font-asset-viewer"

  view:(asset)->
    @element.style.display = "block"
    @element.innerHTML = ""

    input = document.querySelector "#asset-load-code input"
    input.value = """AssetManager.loadFont( "#{asset.name.replace(/-/g,"/")}" )"""

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
        canvas.width = canvas.height = 64
        context = canvas.getContext "2d"
        context.fillStyle = "#EEE"
        context.fillRect(0,0,canvas.width,canvas.height)
        context.fillStyle = "#444"
        context.rect(4,4,56,56)
        context.clip()
        context.font = "11pt #{asset.shortname}"
        context.fillText "ABCD",4,32
        context.fillText "abcd",4,46
        context.fillText "1234",4,60

        size = 11
        while size>6 and context.measureText(asset.shortname).width>56
          size -= 1
          context.font = "#{size}pt #{asset.shortname}"

        context.fillText asset.shortname,4,14

        if asset.element?
          asset.element.querySelector("img").src = canvas.toDataURL()

        @manager.updateAssetIcon asset,canvas
