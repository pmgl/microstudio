class @SpriteFrame
  constructor:(@sprite,@width,@height)->
    @name = ""
    @canvas = document.createElement "canvas"
    @canvas.width = @width
    @canvas.height = @height

  clone:()->
    sf = new SpriteFrame @sprite,@width,@height
    sf.getContext().drawImage @canvas,0,0
    sf

  getContext:()->
    return null if not @canvas?
    @context = @getCanvas().getContext "2d"

  getCanvas:()->
    return null if not @canvas?
    if @canvas not instanceof HTMLCanvasElement
      c = document.createElement "canvas"
      c.width = @canvas.width
      c.height = @canvas.height
      c.getContext("2d").drawImage @canvas,0,0
      @canvas = c

    @canvas

  setPixel:(x,y,color,alpha=1)->
    c = @getContext()
    c.globalAlpha = alpha
    c.fillStyle = color
    c.fillRect x,y,1,1
    c.globalAlpha = 1

  erasePixel:(x,y,alpha=1)->
    c = @getContext()
    data = c.getImageData x,y,1,1
    data.data[3] *= (1-alpha)
    c.putImageData data,x,y

  getRGB:(x,y)->
    return [0,0,0] if x<0 or x>=@width or y<0 or y>=@height
    c = @getContext()
    data = c.getImageData x,y,1,1
    return data.data

  clear:()->
    @getContext().clearRect 0,0,@canvas.width,@canvas.height

  resize:(w,h)->
    return if w == @width and h == @height
    c = new PixelArtScaler().rescale(@canvas,w,h)
    @canvas = c
    @context = null
    @width = w
    @height = h

  load:(img)->
    @resize(img.width,img.height)
    @clear()
    @canvas.getContext("2d").drawImage img,0,0

  copyFrom:(frame)->
    @resize frame.width,frame.height
    @clear()
    @getContext().drawImage frame.canvas,0,0
