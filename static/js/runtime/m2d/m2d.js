var M2D,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

M2D = {};

M2D.Scene = (function(superClass) {
  extend(Scene, superClass);

  function Scene() {
    Scene.__super__.constructor.call(this);
  }

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

M2D.Group = (function() {
  function Group() {}

  return Group;

})();

M2D.Sprite = (function(superClass) {
  extend(Sprite, superClass);

  function Sprite(source) {
    if (source instanceof Sprite) {
      Sprite.__super__.constructor.call(this, new PIXI.Texture(source.frames[0].canvas));
    } else if (typeof source === "string" && (M2D.runtime.sprites[source] != null)) {
      Sprite.__super__.constructor.call(this, new PIXI.Texture(M2D.runtime.sprites[source].frames[0].canvas));
    } else {
      Sprite.__super__.constructor.call(this, source);
    }
  }

  return Sprite;

})(PIXI.Sprite);
