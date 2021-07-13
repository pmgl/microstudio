this.SpriteFrame = (function() {
  function SpriteFrame(sprite, width, height) {
    this.sprite = sprite;
    this.width = width;
    this.height = height;
    this.name = "";
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  SpriteFrame.prototype.clone = function() {
    var sf;
    sf = new SpriteFrame(this.sprite, this.width, this.height);
    sf.getContext().drawImage(this.canvas, 0, 0);
    return sf;
  };

  SpriteFrame.prototype.getContext = function() {
    if (this.canvas == null) {
      return null;
    }
    return this.context = this.getCanvas().getContext("2d");
  };

  SpriteFrame.prototype.getCanvas = function() {
    var c;
    if (this.canvas == null) {
      return null;
    }
    if (!(this.canvas instanceof HTMLCanvasElement)) {
      c = document.createElement("canvas");
      c.width = this.canvas.width;
      c.height = this.canvas.height;
      c.getContext("2d").drawImage(this.canvas, 0, 0);
      this.canvas = c;
    }
    return this.canvas;
  };

  SpriteFrame.prototype.setPixel = function(x, y, color, alpha) {
    var c;
    if (alpha == null) {
      alpha = 1;
    }
    c = this.getContext();
    c.globalAlpha = alpha;
    c.fillStyle = color;
    c.fillRect(x, y, 1, 1);
    return c.globalAlpha = 1;
  };

  SpriteFrame.prototype.erasePixel = function(x, y, alpha) {
    var c, data;
    if (alpha == null) {
      alpha = 1;
    }
    c = this.getContext();
    data = c.getImageData(x, y, 1, 1);
    data.data[3] *= 1 - alpha;
    return c.putImageData(data, x, y);
  };

  SpriteFrame.prototype.getRGB = function(x, y) {
    var c, data;
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return [0, 0, 0];
    }
    c = this.getContext();
    data = c.getImageData(x, y, 1, 1);
    return data.data;
  };

  SpriteFrame.prototype.clear = function() {
    return this.getContext().clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  SpriteFrame.prototype.resize = function(w, h) {
    var c;
    if (w === this.width && h === this.height) {
      return;
    }
    c = new PixelArtScaler().rescale(this.canvas, w, h);
    this.canvas = c;
    this.context = null;
    this.width = w;
    return this.height = h;
  };

  SpriteFrame.prototype.load = function(img) {
    this.resize(img.width, img.height);
    this.clear();
    return this.canvas.getContext("2d").drawImage(img, 0, 0);
  };

  SpriteFrame.prototype.copyFrom = function(frame) {
    this.resize(frame.width, frame.height);
    this.clear();
    return this.getContext().drawImage(frame.canvas, 0, 0);
  };

  return SpriteFrame;

})();
