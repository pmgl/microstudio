this.MicroMap = (function() {
  function MicroMap(width, height, block_width, block_height, sprites1) {
    var req;
    this.width = width;
    this.height = height;
    this.block_width = block_width;
    this.block_height = block_height;
    this.sprites = sprites1;
    this.map = [];
    if ((this.width != null) && typeof this.width === "string") {
      this.ready = false;
      req = new XMLHttpRequest();
      req.onreadystatechange = (function(_this) {
        return function(event) {
          if (req.readyState === XMLHttpRequest.DONE) {
            _this.ready = true;
            if (req.status === 200) {
              _this.load(req.responseText, _this.sprites);
              _this.update();
            }
            if (_this.loaded != null) {
              return _this.loaded();
            }
          }
        };
      })(this);
      req.open("GET", this.width);
      req.send();
      this.width = 10;
      this.height = 10;
      this.block_width = 10;
      this.block_height = 10;
    } else {
      this.ready = true;
    }
    this.clear();
    this.update();
  }

  MicroMap.prototype.clear = function() {
    var i, j, k, l, ref1, ref2;
    for (j = k = 0, ref1 = this.height - 1; k <= ref1; j = k += 1) {
      for (i = l = 0, ref2 = this.width - 1; l <= ref2; i = l += 1) {
        this.map[i + j * this.width] = null;
      }
    }
  };

  MicroMap.prototype.set = function(x, y, ref) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.map[x + y * this.width] = ref;
      return this.needs_update = true;
    }
  };

  MicroMap.prototype.get = function(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return "";
    }
    return this.map[x + y * this.width] || "";
  };

  MicroMap.prototype.getCanvas = function() {
    if ((this.canvas == null) || this.needs_update) {
      this.update();
    }
    return this.canvas;
  };

  MicroMap.prototype.update = function() {
    var c, context, i, index, j, k, l, ref1, ref2, s, sprite, tx, ty, xy;
    this.needs_update = false;
    if (this.canvas == null) {
      this.canvas = document.createElement("canvas");
    }
    if (this.canvas.width !== this.width * this.block_width || this.canvas.height !== this.height * this.block_height) {
      this.canvas.width = this.width * this.block_width;
      this.canvas.height = this.height * this.block_height;
    }
    context = this.canvas.getContext("2d");
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (j = k = 0, ref1 = this.height - 1; k <= ref1; j = k += 1) {
      for (i = l = 0, ref2 = this.width - 1; l <= ref2; i = l += 1) {
        index = i + (this.height - 1 - j) * this.width;
        s = this.map[index];
        if ((s != null) && s.length > 0) {
          s = s.split(":");
          sprite = this.sprites[s[0]];
          if ((sprite != null) && (sprite.frames[0] != null)) {
            if (s[1] != null) {
              xy = s[1].split(",");
              tx = xy[0] * this.block_width;
              ty = xy[1] * this.block_height;
              c = sprite.frames[0].canvas;
              if ((c != null) && c.width > 0 && c.height > 0) {
                context.drawImage(c, tx, ty, this.block_width, this.block_height, this.block_width * i, this.block_height * j, this.block_width, this.block_height);
              }
            } else {
              c = sprite.frames[0].canvas;
              if ((c != null) && c.width > 0 && c.height > 0) {
                context.drawImage(c, this.block_width * i, this.block_height * j);
              }
            }
          }
        }
      }
    }
  };

  MicroMap.prototype.resize = function(w, h, block_width, block_height) {
    var i, j, k, l, map, ref1, ref2;
    this.block_width = block_width != null ? block_width : this.block_width;
    this.block_height = block_height != null ? block_height : this.block_height;
    map = [];
    for (j = k = 0, ref1 = h - 1; k <= ref1; j = k += 1) {
      for (i = l = 0, ref2 = w - 1; l <= ref2; i = l += 1) {
        if (j < this.height && i < this.width) {
          map[i + j * w] = this.map[i + j * this.width];
        } else {
          map[i + j * w] = null;
        }
      }
    }
    this.map = map;
    this.width = w;
    return this.height = h;
  };

  MicroMap.prototype.save = function() {
    var data, i, index, j, k, l, list, m, map, n, ref1, ref2, ref3, ref4, s, table;
    index = 1;
    list = [0];
    table = {};
    for (j = k = 0, ref1 = this.height - 1; k <= ref1; j = k += 1) {
      for (i = l = 0, ref2 = this.width - 1; l <= ref2; i = l += 1) {
        s = this.map[i + j * this.width];
        if ((s != null) && s.length > 0 && (table[s] == null)) {
          list.push(s);
          table[s] = index++;
        }
      }
    }
    map = [];
    for (j = m = 0, ref3 = this.height - 1; m <= ref3; j = m += 1) {
      for (i = n = 0, ref4 = this.width - 1; n <= ref4; i = n += 1) {
        s = this.map[i + j * this.width];
        map[i + j * this.width] = (s != null) && s.length > 0 ? table[s] : 0;
      }
    }
    data = {
      width: this.width,
      height: this.height,
      block_width: this.block_width,
      block_height: this.block_height,
      sprites: list,
      data: map
    };
    return JSON.stringify(data);
  };

  MicroMap.prototype.loadFile = function(url) {
    var req;
    req = new XMLHttpRequest();
    req.onreadystatechange = (function(_this) {
      return function(event) {
        if (req.readyState === XMLHttpRequest.DONE) {
          if (req.status === 200) {
            _this.load(req.responseText, _this.sprites);
            return _this.update();
          }
        }
      };
    })(this);
    req.open("GET", url);
    return req.send();
  };

  MicroMap.prototype.load = function(data, sprites) {
    var i, j, k, l, ref1, ref2, s;
    data = JSON.parse(data);
    this.width = data.width;
    this.height = data.height;
    this.block_width = data.block_width;
    this.block_height = data.block_height;
    for (j = k = 0, ref1 = data.height - 1; k <= ref1; j = k += 1) {
      for (i = l = 0, ref2 = data.width - 1; l <= ref2; i = l += 1) {
        s = data.data[i + j * data.width];
        if (s > 0) {
          this.map[i + j * data.width] = data.sprites[s];
        } else {
          this.map[i + j * data.width] = null;
        }
      }
    }
  };

  MicroMap.loadMap = function(data, sprites) {
    var i, j, k, l, map, ref1, ref2, s;
    data = JSON.parse(data);
    map = new MicroMap(data.width, data.height, data.block_width, data.block_height, sprites);
    for (j = k = 0, ref1 = data.height - 1; k <= ref1; j = k += 1) {
      for (i = l = 0, ref2 = data.width - 1; l <= ref2; i = l += 1) {
        s = data.data[i + j * data.width];
        if (s > 0) {
          map.map[i + j * data.width] = data.sprites[s];
        }
      }
    }
    return map;
  };

  MicroMap.prototype.clone = function() {
    var i, j, k, l, map, ref1, ref2;
    map = new MicroMap(this.width, this.height, this.block_width, this.block_height, this.sprites);
    for (j = k = 0, ref1 = this.height - 1; k <= ref1; j = k += 1) {
      for (i = l = 0, ref2 = this.width - 1; l <= ref2; i = l += 1) {
        map.map[i + j * this.width] = this.map[i + j * this.width];
      }
    }
    map.needs_update = true;
    return map;
  };

  MicroMap.prototype.copyFrom = function(map) {
    var i, j, k, l, ref1, ref2;
    this.width = map.width;
    this.height = map.height;
    this.block_width = map.block_width;
    this.block_height = map.block_height;
    for (j = k = 0, ref1 = this.height - 1; k <= ref1; j = k += 1) {
      for (i = l = 0, ref2 = this.width - 1; l <= ref2; i = l += 1) {
        this.map[i + j * this.width] = map.map[i + j * this.width];
      }
    }
    this.update();
    return this;
  };

  return MicroMap;

})();
