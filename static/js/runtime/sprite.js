this.Sprite = (function() {
  function Sprite(width, height) {
    this.width = width;
    this.height = height;
    this.name = "";
    this.frames = [];
    this.animation_start = 0;
    this.fps = 5;
    if (this.width > 0 && this.height > 0) {
      this.frames.push(new msImage(this.width, this.height));
      this.ready = 1;
    }
  }

  Sprite.prototype.setFrame = function(f) {
    return this.animation_start = Date.now() - 1000 / this.fps * f;
  };

  Sprite.prototype.getFrame = function() {
    var dt;
    dt = 1000 / this.fps;
    return Math.floor((Date.now() - this.animation_start) / dt) % this.frames.length;
  };

  return Sprite;

})();

this.LoadSprite = function(url, properties, loaded) {
  var img, sprite;
  sprite = new Sprite(0, 0);
  sprite.ready = 0;
  img = new Image;
  if (location.protocol !== "file:") {
    img.crossOrigin = "Anonymous";
  }
  img.src = url;
  img.onload = (function(_this) {
    return function() {
      var frame, i, j, numframes, ref;
      sprite.ready = true;
      if (img.width > 0 && img.height > 0) {
        numframes = 1;
        if ((properties != null) && (properties.frames != null)) {
          numframes = properties.frames;
        }
        if (properties.fps != null) {
          sprite.fps = properties.fps;
        }
        sprite.width = img.width;
        sprite.height = Math.round(img.height / numframes);
        sprite.frames = [];
        for (i = j = 0, ref = numframes - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
          frame = new msImage(sprite.width, sprite.height);
          frame.initContext();
          frame.context.drawImage(img, 0, -i * sprite.height);
          sprite.frames.push(frame);
        }
        sprite.ready = true;
      }
      if (loaded != null) {
        return loaded();
      }
    };
  })(this);
  img.onerror = (function(_this) {
    return function() {
      return sprite.ready = 1;
    };
  })(this);
  return sprite;
};

this.UpdateSprite = function(sprite, img, properties) {
  var frame, i, j, numframes, ref;
  if (img.width > 0 && img.height > 0) {
    numframes = 1;
    if ((properties != null) && (properties.frames != null)) {
      numframes = properties.frames;
    }
    if ((properties != null) && (properties.fps != null)) {
      sprite.fps = properties.fps;
    }
    sprite.width = img.width;
    sprite.height = Math.round(img.height / numframes);
    sprite.frames = [];
    for (i = j = 0, ref = numframes - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      frame = new msImage(sprite.width, sprite.height);
      frame.initContext();
      frame.context.drawImage(img, 0, -i * sprite.height);
      sprite.frames.push(frame);
    }
    return sprite.ready = true;
  }
};
