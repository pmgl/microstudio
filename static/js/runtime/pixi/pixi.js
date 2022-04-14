PIXI.Sprite._from = PIXI.Sprite.from;

PIXI.Sprite.from = function(source) {
  if (source instanceof Sprite) {
    source = source.frames[0].canvas;
  } else if (source instanceof msImage) {
    source = source.canvas || source.image;
  } else if (typeof source === "string" && (PIXI.runtime.sprites[source] != null)) {
    source = PIXI.runtime.sprites[source].frames[0].canvas;
  }
  return this._from(source);
};

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
