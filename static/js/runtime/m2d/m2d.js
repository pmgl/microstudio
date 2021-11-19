var M2D,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

M2D = {};

M2D.Scene = (function(superClass) {
  extend(Scene, superClass);

  function Scene() {
    Scene.__super__.constructor.call(this);
  }

  Scene.prototype.add = function(child) {
    return this.addChild(child);
  };

  return Scene;

})(PIXI.Container);

M2D.Camera = (function() {
  function Camera(fov, x, y) {
    this.fov = fov != null ? fov : 200;
    this.x = x != null ? x : 0;
    this.y = y != null ? y : 0;
  }

  return Camera;

})();

M2D.Group = (function(superClass) {
  extend(Group, superClass);

  function Group() {
    Group.__super__.constructor.call(this);
  }

  return Group;

})(PIXI.Container);

M2D.Sprite = (function(superClass) {
  extend(Sprite, superClass);

  function Sprite(source, width, height) {
    if (width == null) {
      width = 20;
    }
    if (height == null) {
      height = 20;
    }
    if (source instanceof Sprite) {
      Sprite.__super__.constructor.call(this, PIXI.Texture.from(source.frames[0].canvas));
    } else if (typeof source === "string" && (M2D.runtime.sprites[source] != null)) {
      Sprite.__super__.constructor.call(this, PIXI.Texture.from(M2D.runtime.sprites[source].frames[0].canvas));
    } else {
      Sprite.__super__.constructor.call(this, source);
    }
    this.width = width;
    this.height = height;
    this.anchor.x = .5;
    this.anchor.y = .5;
    this.scale.y *= -1;
  }

  return Sprite;

})(PIXI.Sprite);

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
