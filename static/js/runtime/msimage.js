var b, j, len1, ref;

this.msImage = (function() {
  class msImage {
    constructor(width, height, centered = false) {
      this.width = width;
      this.height = height;
      this.centered = centered;
      this.class = msImage;
      if (this.width instanceof Image) {
        this.image = this.width;
        this.width = this.image.width;
        this.height = this.image.height;
      } else if (this.width instanceof HTMLCanvasElement) {
        this.canvas = this.width;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
      } else {
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width = Math.round(this.width);
        this.canvas.height = this.height = Math.round(this.height);
      }
    }

    setRGB(x, y, r, g, b) {
      this.initContext();
      if (this.pixeldata == null) {
        this.pixeldata = this.context.getImageData(0, 0, 1, 1);
      }
      if (r.R != null) {
        this.pixeldata.data[0] = r.R;
        this.pixeldata.data[1] = r.G;
        this.pixeldata.data[2] = r.B;
      } else {
        this.pixeldata.data[0] = r;
        this.pixeldata.data[1] = g;
        this.pixeldata.data[2] = b;
      }
      this.pixeldata.data[3] = 255;
      return this.context.putImageData(this.pixeldata, x, y);
    }

    setRGBA(x, y, r, g, b, a) {
      this.initContext();
      if (this.pixeldata == null) {
        this.pixeldata = this.context.getImageData(0, 0, 1, 1);
      }
      if (r.R != null) {
        this.pixeldata.data[0] = r.R;
        this.pixeldata.data[1] = r.G;
        this.pixeldata.data[2] = r.B;
        this.pixeldata.data[3] = r.A != null ? r.A : 255;
      } else {
        this.pixeldata.data[0] = r;
        this.pixeldata.data[1] = g;
        this.pixeldata.data[2] = b;
        this.pixeldata.data[3] = a;
      }
      return this.context.putImageData(this.pixeldata, x, y);
    }

    getRGB(x, y, result = {}) {
      var d;
      this.initContext();
      d = this.context.getImageData(x, y, 1, 1);
      result.R = d.data[0];
      result.G = d.data[1];
      result.B = d.data[2];
      return result;
    }

    getRGBA(x, y, result = {}) {
      var d;
      this.initContext();
      d = this.context.getImageData(x, y, 1, 1);
      result.R = d.data[0];
      result.G = d.data[1];
      result.B = d.data[2];
      result.A = d.data[3];
      return result;
    }

    initContext() {
      if (this.context != null) {
        return;
      }
      if ((this.canvas == null) && (this.image != null)) {
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.image.width;
        this.canvas.height = this.image.height;
        this.context = this.canvas.getContext("2d");
        this.context.drawImage(this.image, 0, 0);
        this.image = null;
      }
      this.alpha = 1;
      this.pixelated = 1;
      this.line_width = 1;
      this.context = this.canvas.getContext("2d");
      this.context.lineCap = "round";
      if (this.centered) {
        this.translation_x = this.width / 2;
        this.translation_y = this.height / 2;
        this.rotation = 0;
        this.scale_x = 1;
        this.scale_y = -1;
        this.image_transform = true;
        this.anchor_x = 0;
        this.anchor_y = 0;
        this.object_scale_y = -1;
      } else {
        this.translation_x = 0;
        this.translation_y = 0;
        this.rotation = 0;
        this.scale_x = 1;
        this.scale_y = 1;
        this.image_transform = false;
        this.anchor_x = -1;
        this.anchor_y = 1;
        this.object_scale_y = 1;
      }
      this.object_rotation = 0;
      this.object_scale_x = 1;
      return this.font = "BitCell";
    }

    clear(color) {
      var blending_save, c, s;
      this.initContext();
      c = this.context.fillStyle;
      s = this.context.strokeStyle;
      blending_save = this.context.globalCompositeOperation;
      this.context.globalAlpha = 1;
      this.context.globalCompositeOperation = "source-over";
      if (color != null) {
        this.setColor(color);
      } else {
        this.context.fillStyle = "#000";
      }
      this.context.fillRect(0, 0, this.width, this.height);
      this.context.fillStyle = c;
      this.context.strokeStyle = s;
      return this.context.globalCompositeOperation = blending_save;
    }

    setColor(color) {
      this.initContext();
      if (color == null) {
        return;
      }
      if (typeof color === "string") {
        this.context.fillStyle = color;
        return this.context.strokeStyle = color;
      }
    }

    setAlpha(alpha) {
      this.initContext();
      return this.alpha = alpha;
    }

    setPixelated(pixelated) {
      this.initContext();
      return this.pixelated = pixelated;
    }

    setBlending(blending) {
      this.initContext();
      blending = BLENDING_MODES[blending || "normal"] || "source-over";
      return this.context.globalCompositeOperation = blending;
    }

    setLineWidth(line_width) {
      this.initContext();
      return this.line_width = line_width;
    }

    setLineDash(dash) {
      this.initContext();
      if (!Array.isArray(dash)) {
        return this.context.setLineDash([]);
      } else {
        return this.context.setLineDash(dash);
      }
    }

    setLinearGradient(x1, y1, x2, y2, c1, c2) {
      var grd;
      this.initContext();
      grd = this.context.createLinearGradient(x1, y1, x2, y2);
      grd.addColorStop(0, c1);
      grd.addColorStop(1, c2);
      this.context.fillStyle = grd;
      return this.context.strokeStyle = grd;
    }

    setRadialGradient(x, y, radius, c1, c2) {
      var grd;
      this.initContext();
      grd = this.context.createRadialGradient(x, y, 0, x, y, radius);
      grd.addColorStop(0, c1);
      grd.addColorStop(1, c2);
      this.context.fillStyle = grd;
      return this.context.strokeStyle = grd;
    }

    setFont(font) {
      return this.font = font || "Verdana";
    }

    setTranslation(translation_x, translation_y) {
      this.initContext();
      this.translation_x = translation_x;
      this.translation_y = translation_y;
      if (!isFinite(this.translation_x)) {
        this.translation_x = 0;
      }
      if (!isFinite(this.translation_y)) {
        this.translation_y = 0;
      }
      return this.updateScreenTransform();
    }

    setScale(scale_x, scale_y) {
      this.initContext();
      this.scale_x = scale_x;
      this.scale_y = scale_y;
      if (!isFinite(this.scale_x) || this.scale_x === 0) {
        this.scale_x = 1;
      }
      if (!isFinite(this.scale_y) || this.scale_y === 0) {
        this.scale_y = 1;
      }
      return this.updateScreenTransform();
    }

    setRotation(rotation) {
      this.initContext();
      this.rotation = rotation;
      if (!isFinite(this.rotation)) {
        this.rotation = 0;
      }
      return this.updateScreenTransform();
    }

    updateScreenTransform() {
      return this.image_transform = this.translation_x !== 0 || this.translation_y !== 0 || this.scale_x !== 1 || this.scale_y !== 1 || this.rotation !== 0;
    }

    setDrawAnchor(anchor_x, anchor_y) {
      this.initContext();
      this.anchor_x = anchor_x;
      this.anchor_y = anchor_y;
      if (typeof this.anchor_x !== "number") {
        this.anchor_x = 0;
      }
      if (typeof this.anchor_y !== "number") {
        return this.anchor_y = 0;
      }
    }

    setDrawRotation(object_rotation) {
      this.initContext();
      return this.object_rotation = object_rotation;
    }

    setDrawScale(object_scale_x, object_scale_y = object_scale_x) {
      this.initContext();
      this.object_scale_x = object_scale_x;
      return this.object_scale_y = object_scale_y;
    }

    initDrawOp(x, y, object_transform = true) {
      var res;
      res = false;
      if (this.image_transform) {
        this.context.save();
        res = true;
        this.context.translate(this.translation_x, this.translation_y);
        this.context.scale(this.scale_x, this.scale_y);
        this.context.rotate(this.rotation / 180 * Math.PI);
        this.context.translate(x, y);
      }
      if (object_transform && (this.object_rotation !== 0 || this.object_scale_x !== 1 || this.object_scale_y !== 1)) {
        if (!res) {
          this.context.save();
          res = true;
          this.context.translate(x, y);
        }
        if (this.object_rotation !== 0) {
          this.context.rotate(this.object_rotation / 180 * Math.PI);
        }
        if (this.object_scale_x !== 1 || this.object_scale_y !== 1) {
          this.context.scale(this.object_scale_x, this.object_scale_y);
        }
      }
      return res;
    }

    closeDrawOp(x, y) {
      return this.context.restore();
    }

    fillRect(x, y, w, h, color) {
      this.initContext();
      this.setColor(color);
      this.context.globalAlpha = this.alpha;
      if (this.initDrawOp(x, y)) {
        this.context.fillRect(-w / 2 - this.anchor_x * w / 2, -h / 2 + this.anchor_y * h / 2, w, h);
        return this.closeDrawOp(x, y);
      } else {
        return this.context.fillRect(x - w / 2 - this.anchor_x * w / 2, y - h / 2 + this.anchor_y * h / 2, w, h);
      }
    }

    fillRoundRect(x, y, w, h, round = 10, color) {
      this.initContext();
      this.setColor(color);
      this.context.globalAlpha = this.alpha;
      if (this.initDrawOp(x, y)) {
        this.context.fillRoundRect(-w / 2 - this.anchor_x * w / 2, -h / 2 + this.anchor_y * h / 2, w, h, round);
        return this.closeDrawOp(x, y);
      } else {
        return this.context.fillRoundRect(x - w / 2 - this.anchor_x * w / 2, y - h / 2 + this.anchor_y * h / 2, w, h, round);
      }
    }

    fillRound(x, y, w, h, color) {
      this.initContext();
      this.setColor(color);
      this.context.globalAlpha = this.alpha;
      w = Math.abs(w);
      h = Math.abs(h);
      if (this.initDrawOp(x, y)) {
        this.context.beginPath();
        this.context.ellipse(-this.anchor_x * w / 2, 0 + this.anchor_y * h / 2, w / 2, h / 2, 0, 0, Math.PI * 2, false);
        this.context.fill();
        return this.closeDrawOp(x, y);
      } else {
        this.context.beginPath();
        this.context.ellipse(x - this.anchor_x * w / 2, y + this.anchor_y * h / 2, w / 2, h / 2, 0, 0, Math.PI * 2, false);
        return this.context.fill();
      }
    }

    drawRect(x, y, w, h, color) {
      this.initContext();
      this.setColor(color);
      this.context.globalAlpha = this.alpha;
      this.context.lineWidth = this.line_width;
      if (this.initDrawOp(x, y)) {
        this.context.strokeRect(-w / 2 - this.anchor_x * w / 2, -h / 2 + this.anchor_y * h / 2, w, h);
        return this.closeDrawOp(x, y);
      } else {
        return this.context.strokeRect(x - w / 2 - this.anchor_x * w / 2, y - h / 2 + this.anchor_y * h / 2, w, h);
      }
    }

    drawRoundRect(x, y, w, h, round = 10, color) {
      this.initContext();
      this.setColor(color);
      this.context.globalAlpha = this.alpha;
      this.context.lineWidth = this.line_width;
      if (this.initDrawOp(x, y)) {
        this.context.strokeRoundRect(-w / 2 - this.anchor_x * w / 2, -h / 2 + this.anchor_y * h / 2, w, h, round);
        return this.closeDrawOp(x, y);
      } else {
        return this.context.strokeRoundRect(x - w / 2 - this.anchor_x * w / 2, y - h / 2 + this.anchor_y * h / 2, w, h, round);
      }
    }

    drawRound(x, y, w, h, color) {
      this.initContext();
      this.setColor(color);
      this.context.globalAlpha = this.alpha;
      this.context.lineWidth = this.line_width;
      w = Math.abs(w);
      h = Math.abs(h);
      if (this.initDrawOp(x, y)) {
        this.context.beginPath();
        this.context.ellipse(0 - this.anchor_x * w / 2, 0 + this.anchor_y * h / 2, w / 2, h / 2, 0, 0, Math.PI * 2, false);
        this.context.stroke();
        return this.closeDrawOp(x, y);
      } else {
        this.context.beginPath();
        this.context.ellipse(x - this.anchor_x * w / 2, y + this.anchor_y * h / 2, w / 2, h / 2, 0, 0, Math.PI * 2, false);
        return this.context.stroke();
      }
    }

    drawLine(x1, y1, x2, y2, color) {
      var transform;
      this.initContext();
      this.setColor(color);
      this.context.globalAlpha = this.alpha;
      this.context.lineWidth = this.line_width;
      transform = this.initDrawOp(0, 0, false);
      this.context.beginPath();
      this.context.moveTo(x1, y1);
      this.context.lineTo(x2, y2);
      this.context.stroke();
      if (transform) {
        return this.closeDrawOp();
      }
    }

    drawPolyline() {
      var args, i, j, len, ref, transform;
      args = arguments;
      this.initContext();
      if (args.length > 0 && args.length % 2 === 1 && typeof args[args.length - 1] === "string") {
        this.setColor(args[args.length - 1]);
      }
      if (Array.isArray(args[0])) {
        if ((args[1] != null) && typeof args[1] === "string") {
          this.setColor(args[1]);
        }
        args = args[0];
      }
      this.context.globalAlpha = this.alpha;
      this.context.lineWidth = this.line_width;
      if (args.length < 4) {
        return;
      }
      len = Math.floor(args.length / 2);
      transform = this.initDrawOp(0, 0, false);
      this.context.beginPath();
      this.context.moveTo(args[0], args[1]);
      for (i = j = 1, ref = len - 1; (1 <= ref ? j <= ref : j >= ref); i = 1 <= ref ? ++j : --j) {
        this.context.lineTo(args[i * 2], args[i * 2 + 1]);
      }
      this.context.stroke();
      if (transform) {
        return this.closeDrawOp();
      }
    }

    drawPolygon() {
      var args, i, j, len, ref, transform;
      args = arguments;
      this.initContext();
      if (args.length > 0 && args.length % 2 === 1 && typeof args[args.length - 1] === "string") {
        this.setColor(args[args.length - 1]);
      }
      if (Array.isArray(args[0])) {
        if ((args[1] != null) && typeof args[1] === "string") {
          this.setColor(args[1]);
        }
        args = args[0];
      }
      this.context.globalAlpha = this.alpha;
      this.context.lineWidth = this.line_width;
      if (args.length < 4) {
        return;
      }
      len = Math.floor(args.length / 2);
      transform = this.initDrawOp(0, 0, false);
      this.context.beginPath();
      this.context.moveTo(args[0], args[1]);
      for (i = j = 1, ref = len - 1; (1 <= ref ? j <= ref : j >= ref); i = 1 <= ref ? ++j : --j) {
        this.context.lineTo(args[i * 2], args[i * 2 + 1]);
      }
      this.context.closePath();
      this.context.stroke();
      if (transform) {
        return this.closeDrawOp();
      }
    }

    fillPolygon() {
      var args, i, j, len, ref, transform;
      args = arguments;
      this.initContext();
      if (args.length > 0 && args.length % 2 === 1 && typeof args[args.length - 1] === "string") {
        this.setColor(args[args.length - 1]);
      }
      if (Array.isArray(args[0])) {
        if ((args[1] != null) && typeof args[1] === "string") {
          this.setColor(args[1]);
        }
        args = args[0];
      }
      this.context.globalAlpha = this.alpha;
      this.context.lineWidth = this.line_width;
      if (args.length < 4) {
        return;
      }
      len = Math.floor(args.length / 2);
      transform = this.initDrawOp(0, 0, false);
      this.context.beginPath();
      this.context.moveTo(args[0], args[1]);
      for (i = j = 1, ref = len - 1; (1 <= ref ? j <= ref : j >= ref); i = 1 <= ref ? ++j : --j) {
        this.context.lineTo(args[i * 2], args[i * 2 + 1]);
      }
      this.context.fill();
      if (transform) {
        return this.closeDrawOp();
      }
    }

    drawQuadCurve() {
      var args, index, len, transform;
      args = arguments;
      this.initContext();
      if (args.length > 0 && args.length % 2 === 1 && typeof args[args.length - 1] === "string") {
        this.setColor(args[args.length - 1]);
      }
      if (Array.isArray(args[0])) {
        if ((args[1] != null) && typeof args[1] === "string") {
          this.setColor(args[1]);
        }
        args = args[0];
      }
      this.context.globalAlpha = this.alpha;
      this.context.lineWidth = this.line_width;
      if (args.length < 4) {
        return;
      }
      len = Math.floor(args.length / 2);
      transform = this.initDrawOp(0, 0, false);
      this.context.beginPath();
      this.context.moveTo(args[0], args[1]);
      index = 2;
      while (index <= args.length - 4) {
        this.context.quadraticCurveTo(args[index], args[index + 1], args[index + 2], args[index + 3]);
        index += 4;
      }
      this.context.stroke();
      if (transform) {
        return this.closeDrawOp();
      }
    }

    drawBezierCurve() {
      var args, index, len, transform;
      args = arguments;
      this.initContext();
      if (args.length > 0 && args.length % 2 === 1 && typeof args[args.length - 1] === "string") {
        this.setColor(args[args.length - 1]);
      }
      if (Array.isArray(args[0])) {
        if ((args[1] != null) && typeof args[1] === "string") {
          this.setColor(args[1]);
        }
        args = args[0];
      }
      this.context.globalAlpha = this.alpha;
      this.context.lineWidth = this.line_width;
      if (args.length < 4) {
        return;
      }
      len = Math.floor(args.length / 2);
      transform = this.initDrawOp(0, 0, false);
      this.context.beginPath();
      this.context.moveTo(args[0], args[1]);
      index = 2;
      while (index <= args.length - 6) {
        this.context.bezierCurveTo(args[index], args[index + 1], args[index + 2], args[index + 3], args[index + 4], args[index + 5]);
        index += 6;
      }
      this.context.stroke();
      if (transform) {
        return this.closeDrawOp();
      }
    }

    drawArc(x, y, radius, angle1, angle2, ccw, color) {
      this.initContext();
      this.setColor(color);
      this.context.globalAlpha = this.alpha;
      this.context.lineWidth = this.line_width;
      if (this.initDrawOp(x, y)) {
        this.context.beginPath();
        this.context.arc(0, 0, radius, angle1 / 180 * Math.PI, angle2 / 180 * Math.PI, ccw);
        this.context.stroke();
        return this.closeDrawOp(x, -y);
      } else {
        this.context.beginPath();
        this.context.arc(x, y, radius, angle1 / 180 * Math.PI, angle2 / 180 * Math.PI, ccw);
        return this.context.stroke();
      }
    }

    fillArc(x, y, radius, angle1, angle2, ccw, color) {
      this.initContext();
      this.setColor(color);
      this.context.globalAlpha = this.alpha;
      this.context.lineWidth = this.line_width;
      if (this.initDrawOp(x, y)) {
        this.context.beginPath();
        this.context.arc(0, 0, radius, angle1 / 180 * Math.PI, angle2 / 180 * Math.PI, ccw);
        this.context.fill();
        return this.closeDrawOp(x, -y);
      } else {
        this.context.beginPath();
        this.context.arc(x, y, radius, angle1 / 180 * Math.PI, angle2 / 180 * Math.PI, ccw);
        return this.context.fill();
      }
    }

    textWidth(text, size) {
      this.initContext();
      this.context.font = `${size}pt ${this.font}`;
      return this.context.measureText(text).width;
    }

    drawText(text, x, y, size, color) {
      var h, w;
      this.initContext();
      this.setColor(color);
      this.context.globalAlpha = this.alpha;
      this.context.font = `${size}pt ${this.font}`;
      this.context.textAlign = "center";
      this.context.textBaseline = "middle";
      w = this.context.measureText(text).width;
      h = size;
      if (this.initDrawOp(x, y)) {
        this.context.fillText(text, 0 - this.anchor_x * w / 2, 0 + this.anchor_y * h / 2);
        return this.closeDrawOp(x, y);
      } else {
        return this.context.fillText(text, x - this.anchor_x * w / 2, y + this.anchor_y * h / 2);
      }
    }

    drawTextOutline(text, x, y, size, color) {
      var h, w;
      this.initContext();
      this.setColor(color);
      this.context.globalAlpha = this.alpha;
      this.context.font = `${size}pt ${this.font}`;
      this.context.lineWidth = this.line_width;
      this.context.textAlign = "center";
      this.context.textBaseline = "middle";
      w = this.context.measureText(text).width;
      h = size;
      if (this.initDrawOp(x, y)) {
        this.context.strokeText(text, 0 - this.anchor_x * w / 2, 0 + this.anchor_y * h / 2);
        return this.closeDrawOp(x, y);
      } else {
        return this.context.strokeText(text, x - this.anchor_x * w / 2, y + this.anchor_y * h / 2);
      }
    }

    getSpriteFrame(sprite) {
      var dt, frame, s;
      frame = null;
      if (typeof sprite === "string") {
        s = window.player.runtime.sprites[sprite];
        if (s != null) {
          sprite = s;
        } else {
          s = sprite.split(".");
          if (s.length > 1) {
            sprite = window.player.runtime.sprites[s[0]];
            frame = s[1] | 0;
          }
        }
      } else if (sprite instanceof msImage) {
        return sprite.canvas || sprite.image;
      }
      if ((sprite == null) || !sprite.ready) {
        return null;
      }
      if (sprite.frames.length > 1) {
        if (frame == null) {
          dt = 1000 / sprite.fps;
          frame = Math.floor((Date.now() - sprite.animation_start) / dt) % sprite.frames.length;
        }
        if (frame >= 0 && frame < sprite.frames.length) {
          return sprite.frames[frame].canvas;
        } else {
          return sprite.frames[0].canvas;
        }
      } else if (sprite.frames[0] != null) {
        return sprite.frames[0].canvas;
      } else {
        return null;
      }
    }

    drawImage(sprite, x, y, w, h) {
      return this.drawSprite(sprite, x, y, w, h);
    }

    drawSprite(sprite, x, y, w, h) {
      var canvas;
      this.initContext();
      canvas = this.getSpriteFrame(sprite);
      if (canvas == null) {
        return;
      }
      if (w == null) {
        w = canvas.width;
      }
      if (!h) {
        h = w / canvas.width * canvas.height;
      }
      this.context.globalAlpha = this.alpha;
      this.context.imageSmoothingEnabled = !this.pixelated;
      if (this.initDrawOp(x, y)) {
        this.context.drawImage(canvas, -w / 2 - this.anchor_x * w / 2, -h / 2 + this.anchor_y * h / 2, w, h);
        return this.closeDrawOp(x, y);
      } else {
        return this.context.drawImage(canvas, x - w / 2 - this.anchor_x * w / 2, y - h / 2 + this.anchor_y * h / 2, w, h);
      }
    }

    drawImagePart(sprite, sx, sy, sw, sh, x, y, w, h) {
      return this.drawSpritePart(sprite, sx, sy, sw, sh, x, y, w, h);
    }

    drawSpritePart(sprite, sx, sy, sw, sh, x, y, w, h) {
      var canvas;
      this.initContext();
      canvas = this.getSpriteFrame(sprite);
      if (canvas == null) {
        return;
      }
      if (w == null) {
        w = canvas.width;
      }
      if (!h) {
        h = w / sw * sh;
      }
      this.context.globalAlpha = this.alpha;
      this.context.imageSmoothingEnabled = !this.pixelated;
      if (this.initDrawOp(x, y)) {
        this.context.drawImage(canvas, sx, sy, sw, sh, -w / 2 - this.anchor_x * w / 2, -h / 2 + this.anchor_y * h / 2, w, h);
        return this.closeDrawOp(x, y);
      } else {
        return this.context.drawImage(canvas, sx, sy, sw, sh, x - w / 2 - this.anchor_x * w / 2, y - h / 2 + this.anchor_y * h / 2, w, h);
      }
    }

    drawMap(map, x, y, w, h) {
      this.initContext();
      if (typeof map === "string") {
        map = window.player.runtime.maps[map];
      }
      if ((map == null) || !map.ready || (map.canvas == null)) {
        return;
      }
      this.context.globalAlpha = this.alpha;
      this.context.imageSmoothingEnabled = !this.pixelated;
      if (this.initDrawOp(x, y)) {
        this.context.drawImage(map.getCanvas(), -w / 2 - this.anchor_x * w / 2, -h / 2 + this.anchor_y * h / 2, w, h);
        return this.closeDrawOp(x, y);
      } else {
        return this.context.drawImage(map.getCanvas(), x - w / 2 - this.anchor_x * w / 2, y - h / 2 + this.anchor_y * h / 2, w, h);
      }
    }

  };

  msImage.classname = "Image";

  return msImage;

}).call(this);

this.BLENDING_MODES = {
  normal: "source-over",
  additive: "lighter"
};

ref = ["source-over", "source-in", "source-out", "source-atop", "destination-over", "destination-in", "destination-out", "destination-atop", "lighter", "copy", "xor", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"];
for (j = 0, len1 = ref.length; j < len1; j++) {
  b = ref[j];
  this.BLENDING_MODES[b] = b;
}
