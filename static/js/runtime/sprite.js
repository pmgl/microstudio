this.Sprite = (function() {
  function Sprite(width, height1, properties) {
    var img;
    this.width = width;
    this.height = height1;
    this.name = "";
    this.frames = [];
    if ((this.width != null) && typeof this.width === "string") {
      this.ready = false;
      img = new Image;
      if (location.protocol !== "file:") {
        img.crossOrigin = "Anonymous";
      }
      img.src = this.width;
      this.width = 0;
      this.height = 0;
      img.onload = (function(_this) {
        return function() {
          _this.ready = true;
          _this.load(img, properties);
          return _this.loaded();
        };
      })(this);
      img.onerror = (function(_this) {
        return function() {
          return _this.ready = true;
        };
      })(this);
    } else {
      this.frames.push(new SpriteFrame(this, this.width, this.height));
      this.ready = true;
    }
    this.current_frame = 0;
    this.animation_start = 0;
    this.fps = properties ? properties.fps || 5 : 5;
  }

  Sprite.prototype.setFrame = function(f) {
    return this.animation_start = Date.now() - 1000 / this.fps * f;
  };

  Sprite.prototype.getFrame = function() {
    var dt;
    dt = 1000 / this.fps;
    return Math.floor((Date.now() - this.animation_start) / dt) % this.frames.length;
  };

  Sprite.prototype.cutFrames = function(num) {
    var frame, height, i, j, ref;
    height = Math.round(this.height / num);
    for (i = j = 0, ref = num - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      frame = new Sprite(this.width, height);
      frame.getContext().drawImage(this.getCanvas(), 0, -i * height);
      this.frames[i] = frame;
    }
    this.height = height;
    return this.canvas = this.frames[0].canvas;
  };

  Sprite.prototype.saveData = function() {
    var canvas, context, i, j, ref;
    if (this.frames.length > 1) {
      canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height * this.frames.length;
      context = canvas.getContext("2d");
      for (i = j = 0, ref = this.frames.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        context.drawImage(this.frames[i].getCanvas(), 0, this.height * i);
      }
      return canvas.toDataURL();
    } else {
      return this.frames[0].getCanvas().toDataURL();
    }
  };

  Sprite.prototype.loaded = function() {};

  Sprite.prototype.setCurrentFrame = function(index) {
    if (index >= 0 && index < this.frames.length) {
      return this.current_frame = index;
    }
  };

  Sprite.prototype.clone = function() {
    var sprite;
    sprite = new Sprite(this.width, this.height);
    sprite.copyFrom(this);
    return sprite;
  };

  Sprite.prototype.resize = function(width, height1) {
    var f, j, len, ref;
    this.width = width;
    this.height = height1;
    ref = this.frames;
    for (j = 0, len = ref.length; j < len; j++) {
      f = ref[j];
      f.resize(this.width, this.height);
    }
  };

  Sprite.prototype.load = function(img, properties) {
    var frame, i, j, numframes, ref;
    if (img.width > 0 && img.height > 0) {
      numframes = 1;
      if ((properties != null) && (properties.frames != null)) {
        numframes = properties.frames;
      }
      this.width = img.width;
      this.height = Math.round(img.height / numframes);
      this.frames = [];
      for (i = j = 0, ref = numframes - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        frame = new SpriteFrame(this, this.width, this.height);
        frame.getContext().drawImage(img, 0, -i * this.height);
        this.frames.push(frame);
      }
      return this.ready = true;
    }
  };

  Sprite.prototype.copyFrom = function(sprite) {
    var f, j, len, ref;
    this.width = sprite.width;
    this.height = sprite.height;
    this.frames = [];
    ref = sprite.frames;
    for (j = 0, len = ref.length; j < len; j++) {
      f = ref[j];
      this.frames.push(f.clone());
    }
    this.current_frame = sprite.current_frame;
  };

  Sprite.prototype.clear = function() {
    var f, j, len, ref;
    ref = this.frames;
    for (j = 0, len = ref.length; j < len; j++) {
      f = ref[j];
      f.clear();
    }
  };

  Sprite.prototype.addFrame = function() {
    return this.frames.push(new SpriteFrame(this, this.width, this.height));
  };

  return Sprite;

})();
