this.SpriteFrame = class SpriteFrame {
  constructor(sprite, width, height) {
    this.sprite = sprite;
    this.width = width;
    this.height = height;
    this.name = "";
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  clone() {
    var sf;
    sf = new SpriteFrame(this.sprite, this.width, this.height);
    sf.getContext().drawImage(this.canvas, 0, 0);
    return sf;
  }

  getContext() {
    if (this.canvas == null) {
      return null;
    }
    return this.context = this.getCanvas().getContext("2d");
  }

  getCanvas() {
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
  }

  setPixel(x, y, color, alpha = 1) {
    var c;
    c = this.getContext();
    c.globalAlpha = alpha;
    c.fillStyle = color;
    c.fillRect(x, y, 1, 1);
    return c.globalAlpha = 1;
  }

  erasePixel(x, y, alpha = 1) {
    var c, data;
    c = this.getContext();
    data = c.getImageData(x, y, 1, 1);
    data.data[3] *= 1 - alpha;
    return c.putImageData(data, x, y);
  }

  getRGB(x, y) {
    var c, data;
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return [0, 0, 0];
    }
    c = this.getContext();
    data = c.getImageData(x, y, 1, 1);
    return data.data;
  }

  clear() {
    return this.getContext().clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  resize(w, h) {
    var c;
    if (w === this.width && h === this.height) {
      return;
    }
    c = new PixelArtScaler().rescale(this.canvas, w, h);
    this.canvas = c;
    this.context = null;
    this.width = w;
    return this.height = h;
  }

  load(img) {
    this.resize(img.width, img.height);
    this.clear();
    return this.canvas.getContext("2d").drawImage(img, 0, 0);
  }

  copyFrom(frame) {
    this.resize(frame.width, frame.height);
    this.clear();
    return this.getContext().drawImage(frame.canvas, 0, 0);
  }

};
