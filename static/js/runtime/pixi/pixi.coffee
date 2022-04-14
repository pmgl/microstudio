PIXI.Sprite._from = PIXI.Sprite.from

PIXI.Sprite.from = (source)->
  if source instanceof Sprite
    source = source.frames[0].canvas
  else if source instanceof msImage
    source = source.canvas or source.image
  else if typeof source == "string" and PIXI.runtime.sprites[source]?
    source = PIXI.runtime.sprites[source].frames[0].canvas
  return @_from(source)

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST
