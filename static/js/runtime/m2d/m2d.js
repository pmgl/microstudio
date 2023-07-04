var M2D;

M2D = {};

M2D.Scene = class Scene extends PIXI.Container {
  constructor() {
    super();
  }

  add(child) {
    return this.addChild(child);
  }

};

M2D.Camera = class Camera {
  constructor(fov = 200, x = 0, y = 0) {
    this.fov = fov;
    this.x = x;
    this.y = y;
  }

};

M2D.Group = class Group extends PIXI.Container {
  constructor() {
    super();
  }

};

M2D.Sprite = class Sprite extends PIXI.Sprite {
  constructor(source, width = 20, height = 20) {
    if (source instanceof Sprite) {
      super(PIXI.Texture.from(source.frames[0].canvas));
    } else if (typeof source === "string" && (M2D.runtime.sprites[source] != null)) {
      super(PIXI.Texture.from(M2D.runtime.sprites[source].frames[0].canvas));
    } else {
      super(source);
    }
    this.width = width;
    this.height = height;
    this.anchor.x = .5;
    this.anchor.y = .5;
    this.scale.y *= -1;
  }

};

if (PIXI.BaseTexture.defaultOptions != null) {
  PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
} else {
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
}
