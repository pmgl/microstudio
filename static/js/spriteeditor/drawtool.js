var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

this.DrawTool = (function() {
  function DrawTool(name, icon) {
    this.name = name;
    this.icon = icon;
    this.parameters = {};
    this.hsymmetry = false;
    this.vsymmetry = false;
    this.tile = true;
  }

  DrawTool.prototype.getSize = function(sprite) {
    var size;
    if (this.parameters["Size"]) {
      size = Math.min(sprite.width, sprite.height) * this.parameters["Size"].value / 100 / 2;
      return size = 1 + Math.floor(size / 2) * 2;
    } else {
      return 1;
    }
  };

  DrawTool.prototype.start = function(sprite, x, y, button) {
    this.pixels = {};
    return this.move(sprite, x, y, button);
  };

  DrawTool.prototype.move = function(sprite, x, y, button, pass) {
    var d, i, ii, j, jj, k, nx, ny, ref1, ref2, results, size, xx, yy;
    if (pass == null) {
      pass = 0;
    }
    if (pass < 1 && this.vsymmetry) {
      nx = sprite.width - 1 - x;
      this.move(sprite, nx, y, button, 1);
    }
    if (pass < 2 && this.hsymmetry) {
      ny = sprite.height - 1 - y;
      this.move(sprite, x, ny, button, 2);
    }
    size = this.getSize(sprite);
    d = (size - 1) / 2;
    results = [];
    for (i = k = ref1 = -d, ref2 = d; k <= ref2; i = k += 1) {
      results.push((function() {
        var l, ref3, ref4, results1;
        results1 = [];
        for (j = l = ref3 = -d, ref4 = d; l <= ref4; j = l += 1) {
          xx = x + i;
          yy = y + j;
          if (this.tile) {
            results1.push((function() {
              var m, results2;
              results2 = [];
              for (ii = m = -1; m <= 1; ii = m += 1) {
                results2.push((function() {
                  var n, results3;
                  results3 = [];
                  for (jj = n = -1; n <= 1; jj = n += 1) {
                    results3.push(this.preprocessPixel(sprite, xx + ii * sprite.width, yy + jj * sprite.height, button));
                  }
                  return results3;
                }).call(this));
              }
              return results2;
            }).call(this));
          } else {
            results1.push(this.preprocessPixel(sprite, xx, yy, button));
          }
        }
        return results1;
      }).call(this));
    }
    return results;
  };

  DrawTool.prototype.preprocessPixel = function(sprite, x, y, button) {
    if (x < 0 || x >= sprite.width || y < 0 || y >= sprite.height) {
      return;
    }
    if (this.pixels[x + "-" + y] == null) {
      this.pixels[x + "-" + y] = true;
      return this.processPixel(sprite, x, y, button);
    }
  };

  DrawTool.prototype.processPixel = function(sprite, x, y) {};

  DrawTool.tools = [];

  return DrawTool;

})();

this.PencilTool = (function(superClass) {
  extend(PencilTool, superClass);

  function PencilTool() {
    PencilTool.__super__.constructor.call(this, "Pencil", "fa-pencil-alt");
    this.parameters["Size"] = {
      type: "range",
      value: 0
    };
    this.parameters["Opacity"] = {
      type: "range",
      value: 100
    };
    this.parameters["Color"] = {
      type: "color",
      value: "#FFF"
    };
  }

  PencilTool.prototype.processPixel = function(sprite, x, y, button) {
    var c;
    if (button === 2) {
      return sprite.erasePixel(x, y, this.parameters["Opacity"].value / 100);
    } else {
      c = sprite.getContext();
      c.globalAlpha = this.parameters["Opacity"].value / 100;
      c.fillStyle = this.parameters["Color"].value;
      c.fillRect(x, y, 1, 1);
      return c.globalAlpha = 1;
    }
  };

  return PencilTool;

})(this.DrawTool);

this.DrawTool.tools.push(new this.PencilTool());

this.EraserTool = (function(superClass) {
  extend(EraserTool, superClass);

  function EraserTool() {
    EraserTool.__super__.constructor.call(this, "Eraser", "fa-eraser");
    this.parameters["Size"] = {
      type: "range",
      value: 0
    };
    this.parameters["Opacity"] = {
      type: "range",
      value: 100
    };
  }

  EraserTool.prototype.processPixel = function(sprite, x, y) {
    return sprite.erasePixel(x, y, this.parameters["Opacity"].value / 100);
  };

  return EraserTool;

})(this.DrawTool);

this.DrawTool.tools.push(new this.EraserTool());

this.FillTool = (function(superClass) {
  extend(FillTool, superClass);

  function FillTool() {
    FillTool.__super__.constructor.call(this, "Fill", "fa-fill-drip");
    this.parameters["Threshold"] = {
      type: "range",
      value: 0
    };
    this.parameters["Opacity"] = {
      type: "range",
      value: 100
    };
    this.parameters["Color"] = {
      type: "color",
      value: "#FFF"
    };
  }

  FillTool.prototype.start = function(sprite, x, y) {
    var alpha, c, check, data, fill, index, list, p, ref, table, threshold;
    if (x < 0 || y < 0 || x >= sprite.width || y >= sprite.height) {
      return;
    }
    threshold = this.parameters["Threshold"].value / 100 * 255 + 1;
    alpha = this.parameters["Opacity"].value / 100;
    c = sprite.getContext();
    ref = c.getImageData(x, y, 1, 1);
    data = c.getImageData(0, 0, sprite.width, sprite.height);
    c.clearRect(x, y, 1, 1);
    c.globalAlpha = alpha;
    c.fillStyle = this.parameters["Color"].value;
    c.fillRect(x, y, 1, 1);
    c.globalAlpha = 1;
    fill = c.getImageData(x, y, 1, 1);
    list = [[x, y]];
    table = {};
    table[x + "-" + y] = true;
    check = function(x, y) {
      var da, db, dg, dr, index;
      if (x < 0 || y < 0 || x >= sprite.width || y >= sprite.height) {
        return false;
      }
      if (table[x + "-" + y]) {
        return false;
      }
      index = 4 * (x + y * sprite.width);
      dr = Math.abs(data.data[index] - ref.data[0]);
      dg = Math.abs(data.data[index + 1] - ref.data[1]);
      db = Math.abs(data.data[index + 2] - ref.data[2]);
      da = Math.abs(data.data[index + 3] - ref.data[3]);
      return Math.max(dr, dg, db, da) < threshold;
    };
    while (list.length > 0) {
      p = list.splice(0, 1)[0];
      x = p[0];
      y = p[1];
      index = 4 * (x + y * sprite.width);
      data.data[index] = fill.data[0];
      data.data[index + 1] = fill.data[1];
      data.data[index + 2] = fill.data[2];
      data.data[index + 3] = fill.data[3];
      if (check(x - 1, y)) {
        table[(x - 1) + "-" + y] = true;
        list.push([x - 1, y]);
      }
      if (check(x + 1, y)) {
        table[(x + 1) + "-" + y] = true;
        list.push([x + 1, y]);
      }
      if (check(x, y - 1)) {
        table[x + "-" + (y - 1)] = true;
        list.push([x, y - 1]);
      }
      if (check(x, y + 1)) {
        table[x + "-" + (y + 1)] = true;
        list.push([x, y + 1]);
      }
    }
    c.putImageData(data, 0, 0);
  };

  FillTool.prototype.move = function(sprite, x, y) {};

  return FillTool;

})(this.DrawTool);

this.DrawTool.tools.push(new this.FillTool());

this.BrightenTool = (function(superClass) {
  extend(BrightenTool, superClass);

  function BrightenTool(parent) {
    BrightenTool.__super__.constructor.call(this, "Brighten", "fa-sun");
    this.parameters = parent.parameters;
  }

  BrightenTool.prototype.processPixel = function(sprite, x, y) {
    var amount, b, c, data, db, dg, dr, g, r, v;
    amount = this.parameters["Amount"].value / 100;
    c = sprite.getContext();
    data = c.getImageData(x, y, 1, 1);
    r = data.data[0];
    g = data.data[1];
    b = data.data[2];
    v = (r + g + b) / 3;
    dr = r - v;
    dg = g - v;
    db = b - v;
    v = v * (1 + amount * .5);
    data.data[0] = Math.min(255, v + dr);
    data.data[1] = Math.min(255, v + dg);
    data.data[2] = Math.min(255, v + db);
    return c.putImageData(data, x, y);
  };

  return BrightenTool;

})(this.DrawTool);

this.DarkenTool = (function(superClass) {
  extend(DarkenTool, superClass);

  function DarkenTool(parent) {
    DarkenTool.__super__.constructor.call(this, "Darken", "fa-moon");
    this.parameters = parent.parameters;
  }

  DarkenTool.prototype.processPixel = function(sprite, x, y) {
    var amount, b, c, data, db, dg, dr, g, r, v;
    amount = this.parameters["Amount"].value / 100;
    c = sprite.getContext();
    data = c.getImageData(x, y, 1, 1);
    r = data.data[0];
    g = data.data[1];
    b = data.data[2];
    v = (r + g + b) / 3;
    dr = r - v;
    dg = g - v;
    db = b - v;
    v = v * (1 - amount * .5);
    data.data[0] = Math.max(0, v + dr);
    data.data[1] = Math.max(0, v + dg);
    data.data[2] = Math.max(0, v + db);
    return c.putImageData(data, x, y);
  };

  return DarkenTool;

})(this.DrawTool);

this.SmoothenTool = (function(superClass) {
  extend(SmoothenTool, superClass);

  function SmoothenTool(parent) {
    SmoothenTool.__super__.constructor.call(this, "Smoothen", "fa-brush");
    this.parameters = parent.parameters;
  }

  SmoothenTool.prototype.processPixel = function(sprite, x, y) {
    var amount, c, co, coef, data, i, j, k, l, ref, sum, xx, yy;
    amount = this.parameters["Amount"].value / 100;
    c = sprite.getContext();
    sum = [0, 0, 0, 0];
    coef = 0;
    ref = c.getImageData(x, y, 1, 1);
    for (i = k = -1; k <= 1; i = k += 1) {
      for (j = l = -1; l <= 1; j = l += 1) {
        xx = x + i;
        yy = y + j;
        if (xx < 0 || yy < 0 || xx >= sprite.width || yy >= sprite.height) {
          continue;
        }
        data = c.getImageData(xx, yy, 1, 1);
        co = 1 / (1 + i * i + j * j) * (1 + data.data[3]);
        coef += co;
        sum[0] += data.data[0] * co;
        sum[1] += data.data[1] * co;
        sum[2] += data.data[2] * co;
        sum[3] += data.data[3] * co;
      }
    }
    data.data[0] = sum[0] / coef * amount + (1 - amount) * ref.data[0];
    data.data[1] = sum[1] / coef * amount + (1 - amount) * ref.data[1];
    data.data[2] = sum[2] / coef * amount + (1 - amount) * ref.data[2];
    data.data[3] = sum[3] / coef * amount + (1 - amount) * ref.data[3];
    return c.putImageData(data, x, y);
  };

  return SmoothenTool;

})(this.DrawTool);

this.SharpenTool = (function(superClass) {
  extend(SharpenTool, superClass);

  function SharpenTool(parent) {
    SharpenTool.__super__.constructor.call(this, "Sharpen", "fa-adjust");
    this.parameters = parent.parameters;
  }

  SharpenTool.prototype.processPixel = function(sprite, x, y) {
    var amount, c, co, coef, data, i, j, k, l, ref, sum, xx, yy;
    amount = this.parameters["Amount"].value / 100;
    c = sprite.getContext();
    sum = [0, 0, 0, 0];
    coef = 0;
    ref = c.getImageData(x, y, 1, 1);
    for (i = k = -1; k <= 1; i = k += 1) {
      for (j = l = -1; l <= 1; j = l += 1) {
        if (i === 0 && j === 0) {
          continue;
        }
        xx = x + i;
        yy = y + j;
        if (xx < 0 || yy < 0 || xx >= sprite.width || yy >= sprite.height) {
          continue;
        }
        data = c.getImageData(xx, yy, 1, 1);
        co = 1 / (1 + i * i + j * j) * (1 + data.data[3]);
        coef += co;
        sum[0] += (ref.data[0] - data.data[0]) * co;
        sum[1] += (ref.data[1] - data.data[1]) * co;
        sum[2] += (ref.data[2] - data.data[2]) * co;
        sum[3] += (ref.data[3] - data.data[3]) * co;
      }
    }
    ref.data[0] += sum[0] / coef * amount;
    ref.data[1] += sum[1] / coef * amount;
    ref.data[2] += sum[2] / coef * amount;
    ref.data[3] += sum[3] / coef * amount;
    return c.putImageData(ref, x, y);
  };

  return SharpenTool;

})(this.DrawTool);

this.SaturationTool = (function(superClass) {
  extend(SaturationTool, superClass);

  function SaturationTool(parent) {
    SaturationTool.__super__.constructor.call(this, "Saturation", "fa-palette");
    this.parameters = parent.parameters;
  }

  SaturationTool.prototype.processPixel = function(sprite, x, y) {
    var amount, b, c, data, db, dg, dr, g, r, v;
    amount = this.parameters["Amount"].value / 100;
    amount = amount > .5 ? amount * 2 : .5 + amount;
    c = sprite.getContext();
    data = c.getImageData(x, y, 1, 1);
    r = data.data[0];
    g = data.data[1];
    b = data.data[2];
    v = (r + g + b) / 3;
    dr = r - v;
    dg = g - v;
    db = b - v;
    data.data[0] = Math.max(0, v + dr * amount);
    data.data[1] = Math.max(0, v + dg * amount);
    data.data[2] = Math.max(0, v + db * amount);
    return c.putImageData(data, x, y);
  };

  return SaturationTool;

})(this.DrawTool);

this.EnhanceTool = (function(superClass) {
  extend(EnhanceTool, superClass);

  function EnhanceTool() {
    EnhanceTool.__super__.constructor.call(this, "Enhance", "fa-magic");
    this.parameters["Tool"] = {
      type: "tool",
      set: [new BrightenTool(this), new DarkenTool(this), new SmoothenTool(this), new SharpenTool(this), new SaturationTool(this)],
      value: 0
    };
    this.parameters["Size"] = {
      type: "range",
      value: 0
    };
    this.parameters["Amount"] = {
      type: "range",
      value: 50
    };
  }

  EnhanceTool.prototype.processPixel = function(sprite, x, y) {
    return this.parameters.Tool.set[this.parameters.Tool.value].processPixel(sprite, x, y);
  };

  return EnhanceTool;

})(this.DrawTool);

this.DrawTool.tools.push(new this.EnhanceTool());

this.SelectTool = (function(superClass) {
  extend(SelectTool, superClass);

  function SelectTool() {
    SelectTool.__super__.constructor.call(this, "Select", "fa-vector-square");
    this.selectiontool = true;
  }

  SelectTool.prototype.processPixel = function(sprite, x, y) {};

  return SelectTool;

})(this.DrawTool);

this.DrawTool.tools.push(new this.SelectTool());
