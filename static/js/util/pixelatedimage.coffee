class @PixelatedImage
  @create:(source,size)->
    img = new Image
    img.crossOrigin = "Anonymous"

    sourceimg = new Image
    sourceimg.crossOrigin = "Anonymous"
    sourceimg.src = source
    sourceimg.onload = ()->
      return if sourceimg.width<=0 or sourceimg.height<=0
      canvas = document.createElement "canvas"
      canvas.width = size
      canvas.height = size
      context = canvas.getContext "2d"
      context.imageSmoothingEnabled = false
      ratio = Math.min(size/sourceimg.width,size/sourceimg.height)
      w = sourceimg.width*ratio
      h = sourceimg.height*ratio
      context.drawImage sourceimg,size/2-w/2,size/2-h/2,w,h
      img.src = canvas.toDataURL()

    return img

  @setURL:(img,source,size)->
    img.crossOrigin = "Anonymous"

    sourceimg = new Image
    sourceimg.crossOrigin = "Anonymous"
    sourceimg.src = source
    sourceimg.onload = ()->
      return if sourceimg.width<=0 or sourceimg.height<=0
      if img instanceof HTMLCanvasElement
        canvas = img
      else
        canvas = document.createElement "canvas"

      canvas.width = size
      canvas.height = size
      context = canvas.getContext "2d"
      context.clearRect(0,0,size,size)
      context.imageSmoothingEnabled = false
      ratio = Math.min(size/sourceimg.width,size/sourceimg.height)
      w = sourceimg.width*ratio
      h = sourceimg.height*ratio
      context.drawImage sourceimg,size/2-w/2,size/2-h/2,w,h
      if img not instanceof HTMLCanvasElement
        img.src = canvas.toDataURL()
