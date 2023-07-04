M2D = {}

class M2D.Scene extends PIXI.Container
  constructor: ()->
    super()

  add:(child)->
    @addChild(child)

class M2D.Camera
  constructor:(@fov=200,@x=0,@y=0)->

class M2D.Group extends PIXI.Container
  constructor:()->
    super()

class M2D.Sprite extends PIXI.Sprite
  constructor:(source,width=20,height=20)->
    if source instanceof Sprite
      super PIXI.Texture.from source.frames[0].canvas
    else if typeof source == "string" and M2D.runtime.sprites[source]?
      super PIXI.Texture.from M2D.runtime.sprites[source].frames[0].canvas
    else
      super(source)

    @width = width
    @height = height
    @anchor.x = .5
    @anchor.y = .5
    @scale.y *= -1

if PIXI.BaseTexture.defaultOptions?
  PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST
else
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST
