class @ImageViewer
  constructor:(@manager)->
    @element = document.getElementById "image-asset-viewer"

  updateSnippet:()->
    @manager.code_snippet.set [{
      name: "Load Image"
      value: """image = asset_manager.loadImage("#{@asset.name.replace(/-/g,"/")}", callback)"""
    }]

  view:(asset)->
    @element.style.display = "block"
    @asset = asset
    @updateSnippet()

    @element.style["background-image"] = """url(#{asset.getURL()}) """

    @manager.checkThumbnail asset,()=>
      img = new Image
      img.src = asset.getURL()
      img.onload = ()=>
        canvas = document.createElement "canvas"
        canvas.width = 128
        canvas.height = 96
        context = canvas.getContext "2d"
        context.save()
        context.fillStyle = "#222"
        context.fillRect(0,0,canvas.width,canvas.height)
        r = Math.max(canvas.width/img.width,canvas.height/img.height)
        context.translate canvas.width/2,canvas.height/2
        context.drawImage img,-r*img.width/2,-r*img.height/2,r*img.width,r*img.height

        if asset.element?
          asset.element.querySelector("img").src = canvas.toDataURL()

        @manager.updateAssetIcon asset,canvas
