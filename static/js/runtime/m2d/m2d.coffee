M2D = {}

class M2D.Scene extends PIXI.Container
  constructor: ()->
    super()

class M2D.Camera
  constructor:(@fov=200,@x=0,@y=0)->

class M2D.Group
  constructor:()->

class M2D.Sprite extends PIXI.Sprite
  constructor:(source)->
    if source instanceof Sprite
      super new PIXI.Texture source.frames[0].canvas
    else if typeof source == "string" and M2D.runtime.sprites[source]?
      super new PIXI.Texture M2D.runtime.sprites[source].frames[0].canvas
    else
      super(source)
