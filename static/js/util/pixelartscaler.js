this.PixelArtScaler = (function() {
  function PixelArtScaler() {}

  PixelArtScaler.prototype.rescale = function(canvas, width, height) {
    var c, context;
    if (width > canvas.width || height > canvas.height) {
      return this.rescale(this.triplePix(canvas), width, height);
    } else {
      c = document.createElement("canvas");
      c.width = width;
      c.height = height;
      context = c.getContext("2d");
      context.drawImage(canvas, 0, 0, width, height);
      return c;
    }
  };

  PixelArtScaler.prototype.distance = function(data, i1, i2) {
    var dw, dx, dy, dz;
    if (i1 * 4 > data.length || i2 * 4 > data.length || i1 < 0 || i2 < 0) {
      return 0;
    }
    dx = Math.abs(data[i1 * 4] - data[i2 * 4]);
    dy = Math.abs(data[i1 * 4 + 1] - data[i2 * 4 + 1]);
    dz = Math.abs(data[i1 * 4 + 2] - data[i2 * 4 + 2]);
    dw = Math.abs(data[i1 * 4 + 3] - data[i2 * 4 + 3]);
    return Math.max(dx, dy, dz, dw);
  };

  PixelArtScaler.prototype.inter = function(data, i1, i2, res, inter) {
    data[res * 4] = data[i1 * 4] * (1 - inter) + data[i2 * 4] * inter;
    data[res * 4 + 1] = data[i1 * 4 + 1] * (1 - inter) + data[i2 * 4 + 1] * inter;
    data[res * 4 + 2] = data[i1 * 4 + 2] * (1 - inter) + data[i2 * 4 + 2] * inter;
    return data[res * 4 + 3] = data[i1 * 4 + 3] * (1 - inter) + data[i2 * 4 + 3] * inter;
  };

  PixelArtScaler.prototype.inter4 = function(data, i1, i2, i3, i4, res, a, b) {
    data[res * 4] = (1 - b) * (data[i1 * 4] * (1 - a) + data[i2 * 4] * a) + b * (data[i3 * 4] * (1 - a) + data[i4 * 4] * a);
    data[res * 4 + 1] = (1 - b) * (data[i1 * 4 + 1] * (1 - a) + data[i2 * 4 + 1] * a) + b * (data[i3 * 4 + 1] * (1 - a) + data[i4 * 4 + 1] * a);
    data[res * 4 + 2] = (1 - b) * (data[i1 * 4 + 2] * (1 - a) + data[i2 * 4 + 2] * a) + b * (data[i3 * 4 + 2] * (1 - a) + data[i4 * 4 + 2] * a);
    return data[res * 4 + 3] = (1 - b) * (data[i1 * 4 + 3] * (1 - a) + data[i2 * 4 + 3] * a) + b * (data[i3 * 4 + 3] * (1 - a) + data[i4 * 4 + 3] * a);
  };

  PixelArtScaler.prototype.tripleSmoothing = function(canvas) {
    var context, d, d1, d2, data, dd1, dd2, diag1, diag2, i, i1, i2, i3, i4, j, k, l, m, n, o, p, q, r, ref, ref1, ref2, ref3, threshold;
    context = canvas.getContext("2d");
    data = context.getImageData(0, 0, canvas.width, canvas.height);
    threshold = 64;
    for (i = m = 1, ref = canvas.width - 4; m <= ref; i = m += 3) {
      for (j = n = 1, ref1 = canvas.height - 4; n <= ref1; j = n += 3) {
        i1 = i + j * canvas.width;
        i2 = (i + 3) + j * canvas.width;
        i3 = i + (j + 3) * canvas.width;
        i4 = (i + 3) + (j + 3) * canvas.width;
        d = this.distance(data.data, i1, i2) + this.distance(data.data, i3, i4) + this.distance(data.data, i1, i3) + this.distance(data.data, i2, i4);
        if (d < threshold * 2) {
          for (k = o = 0; o <= 3; k = o += 1) {
            for (l = p = 0; p <= 3; l = p += 1) {
              this.inter4(data.data, i1, i2, i3, i4, (i + k) + (j + l) * canvas.width, k / 3, l / 3);
            }
          }
        }
      }
    }
    for (i = q = 1, ref2 = canvas.width - 4; q <= ref2; i = q += 3) {
      for (j = r = 1, ref3 = canvas.height - 4; r <= ref3; j = r += 3) {
        i1 = i + j * canvas.width;
        i2 = (i + 3) + (j + 3) * canvas.width;
        i3 = i + 3 + j * canvas.width;
        i4 = i + (j + 3) * canvas.width;
        d1 = this.distance(data.data, i1, i2);
        d2 = this.distance(data.data, i3, i4);
        diag1 = !((i === canvas.width - 6 + 1 && j === 1) || (i === 1 && j === canvas.height - 6 + 1));
        diag2 = !((i === 1 && j === 1) || (i === canvas.width - 6 + 1 && j === canvas.height - 6 + 1));
        if (d1 < threshold && d2 >= threshold && diag1) {
          this.inter(data.data, i1, i2, (i + 2) + (j + 1) * canvas.width, .5);
          this.inter(data.data, i1, i2, (i + 1) + (j + 2) * canvas.width, .5);
          this.inter(data.data, i1, i2, (i + 1) + (j + 1) * canvas.width, 1 / 3);
          this.inter(data.data, i1, i2, (i + 2) + (j + 2) * canvas.width, 2 / 3);
          if (this.distance(data.data, i1, i1 - 3 * canvas.width) < threshold && this.distance(data.data, i3, i3 - 3 * canvas.width) < threshold) {
            this.inter(data.data, i1, i2, (i + 2) + j * canvas.width, .5);
          }
          if (this.distance(data.data, i2, i2 + 3 * canvas.width) < threshold && this.distance(data.data, i4, i4 + 3 * canvas.width) < threshold) {
            this.inter(data.data, i1, i2, (i + 1) + (j + 3) * canvas.width, .5);
          }
          if (this.distance(data.data, i1, i1 - 3) < threshold && this.distance(data.data, i4, i4 - 3) < threshold) {
            this.inter(data.data, i1, i2, i + (j + 2) * canvas.width, .5);
          }
          if (this.distance(data.data, i2, i2 + 3) < threshold && this.distance(data.data, i3, i3 + 3) < threshold) {
            this.inter(data.data, i1, i2, (i + 3) + (j + 1) * canvas.width, .5);
          }
        } else if (d2 < threshold && d1 >= threshold && diag2) {
          this.inter(data.data, i3, i4, (i + 1) + (j + 1) * canvas.width, .5);
          this.inter(data.data, i3, i4, (i + 2) + (j + 2) * canvas.width, .5);
          this.inter(data.data, i3, i4, (i + 2) + (j + 1) * canvas.width, 1 / 3);
          this.inter(data.data, i3, i4, (i + 1) + (j + 2) * canvas.width, 2 / 3);
          if (this.distance(data.data, i3, i3 - 3 * canvas.width) < threshold && this.distance(data.data, i1, i1 - 3 * canvas.width) < threshold) {
            this.inter(data.data, i3, i4, i3 - 2, .5);
          }
          if (this.distance(data.data, i4, i4 + 3 * canvas.width) < threshold && this.distance(data.data, i2, i2 + 3 * canvas.width) < threshold) {
            this.inter(data.data, i3, i4, i4 + 2, .5);
          }
          if (this.distance(data.data, i3, i3 + 3) < threshold && this.distance(data.data, i2, i2 + 3) < threshold) {
            this.inter(data.data, i3, i4, i3 + 2 * canvas.width, .5);
          }
          if (this.distance(data.data, i4, i4 - 3) < threshold && this.distance(data.data, i1, i1 - 3) < threshold) {
            this.inter(data.data, i3, i4, i4 - 2 * canvas.width, .5);
          }
        } else if (d1 < threshold && d2 < threshold) {
          dd1 = this.distance(data.data, i1, (i - 3) + j * canvas.width) + this.distance(data.data, i1, i + (j - 3) * canvas.width) + this.distance(data.data, i1, i + 6 + (j + 3) * canvas.width) + this.distance(data.data, i1, i + 3 + (j + 6) * canvas.width);
          dd2 = this.distance(data.data, i3, i - 3 + (j + 3) * canvas.width) + this.distance(data.data, i3, i + (j + 6) * canvas.width) + this.distance(data.data, i3, i + 3 + (j - 3) * canvas.width) + this.distance(data.data, i3, i + 6 + j * canvas.width);
          if (dd2 < dd1 && diag1) {
            this.inter(data.data, i1, i2, (i + 2) + (j + 1) * canvas.width, .5);
            this.inter(data.data, i1, i2, (i + 1) + (j + 2) * canvas.width, .5);
            this.inter(data.data, i1, i2, (i + 1) + (j + 1) * canvas.width, 1 / 3);
            this.inter(data.data, i1, i2, (i + 2) + (j + 2) * canvas.width, 2 / 3);
            if (this.distance(data.data, i1, i1 - 3 * canvas.width) < threshold && this.distance(data.data, i3, i3 - 3 * canvas.width) < threshold) {
              this.inter(data.data, i1, i2, (i + 2) + j * canvas.width, .5);
            }
            if (this.distance(data.data, i2, i2 + 3 * canvas.width) < threshold && this.distance(data.data, i4, i4 + 3 * canvas.width) < threshold) {
              this.inter(data.data, i1, i2, (i + 1) + (j + 3) * canvas.width, .5);
            }
            if (this.distance(data.data, i1, i1 - 3) < threshold && this.distance(data.data, i4, i4 - 3) < threshold) {
              this.inter(data.data, i1, i2, i + (j + 2) * canvas.width, .5);
            }
            if (this.distance(data.data, i2, i2 + 3) < threshold && this.distance(data.data, i3, i3 + 3) < threshold) {
              this.inter(data.data, i1, i2, (i + 3) + (j + 1) * canvas.width, .5);
            }
          } else if (dd1 < dd2 && diag2) {
            this.inter(data.data, i3, i4, (i + 1) + (j + 1) * canvas.width, .5);
            this.inter(data.data, i3, i4, (i + 2) + (j + 2) * canvas.width, .5);
            this.inter(data.data, i3, i4, (i + 2) + (j + 1) * canvas.width, 1 / 3);
            this.inter(data.data, i3, i4, (i + 1) + (j + 2) * canvas.width, 2 / 3);
            if (this.distance(data.data, i3, i3 - 3 * canvas.width) < threshold && this.distance(data.data, i1, i1 - 3 * canvas.width) < threshold) {
              this.inter(data.data, i3, i4, i3 - 2, .5);
            }
            if (this.distance(data.data, i4, i4 + 3 * canvas.width) < threshold && this.distance(data.data, i2, i2 + 3 * canvas.width) < threshold) {
              this.inter(data.data, i3, i4, i4 + 2, .5);
            }
            if (this.distance(data.data, i3, i3 + 3) < threshold && this.distance(data.data, i2, i2 + 3) < threshold) {
              this.inter(data.data, i3, i4, i3 + 2 * canvas.width, .5);
            }
            if (this.distance(data.data, i4, i4 - 3) < threshold && this.distance(data.data, i1, i1 - 3) < threshold) {
              this.inter(data.data, i3, i4, i4 - 2 * canvas.width, .5);
            }
          }
        }
      }
    }
    context.putImageData(data, 0, 0);
    return canvas;
  };

  PixelArtScaler.prototype.triplePix = function(canvas) {
    var c, context;
    c = document.createElement("canvas");
    c.width = (canvas.width + 2) * 3;
    c.height = (canvas.height + 2) * 3;
    context = c.getContext("2d");
    context.imageSmoothingEnabled = false;
    context.drawImage(canvas, 3, 3, c.width - 6, c.height - 6);
    this.tripleSmoothing(c);
    canvas = document.createElement("canvas");
    canvas.width = c.width - 6;
    canvas.height = c.height - 6;
    context = canvas.getContext("2d");
    context.drawImage(c, -3, -3);
    return canvas;
  };

  return PixelArtScaler;

})();
