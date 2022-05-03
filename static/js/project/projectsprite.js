var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

this.ProjectSprite = (function(superClass) {
  extend(ProjectSprite, superClass);

  function ProjectSprite(project, name, width, height, properties, size1) {
    var s;
    this.project = project;
    this.size = size1 != null ? size1 : 0;
    this.updateThumbnail = bind(this.updateThumbnail, this);
    this.properties = properties;
    if ((width != null) && (height != null)) {
      ProjectSprite.__super__.constructor.call(this, width, height, properties);
      this.file = name;
      this.url = this.project.getFullURL() + "sprites/" + this.file;
    } else {
      this.file = name;
      this.url = this.project.getFullURL() + "sprites/" + this.file;
      ProjectSprite.__super__.constructor.call(this, this.url, void 0, properties);
    }
    this.name = this.file.split(".")[0];
    this.ext = this.file.split(".")[1];
    this.filename = this.file;
    this.file = "sprites/" + this.file;
    s = this.name.split("-");
    this.shortname = s[s.length - 1];
    this.path_prefix = s.length > 1 ? s.splice(0, s.length - 1).join("-") + "-" : "";
    this.images = [];
    this.load_listeners = [];
  }

  ProjectSprite.prototype.addLoadListener = function(listener) {
    if (this.ready) {
      return listener();
    } else {
      return this.load_listeners.push(listener);
    }
  };

  ProjectSprite.prototype.addImage = function(img, size) {
    if (size == null) {
      throw "Size must be defined";
    }
    return this.images.push({
      image: img,
      size: size
    });
  };

  ProjectSprite.prototype.updated = function(url) {
    var i, j, len, ref;
    if (url == null) {
      url = this.project.getFullURL() + this.file + ("?v=" + (Date.now()));
    }
    ref = this.images;
    for (j = 0, len = ref.length; j < len; j++) {
      i = ref[j];
      i.image.src = url;
    }
    if (this.updateThumbnail != null) {
      this.updateThumbnail();
    }
  };

  ProjectSprite.prototype.reload = function(callback) {
    var img, url;
    url = this.project.getFullURL() + this.file + ("?v=" + (Date.now()));
    img = new Image;
    img.crossOrigin = "Anonymous";
    img.src = url;
    return img.onload = (function(_this) {
      return function() {
        _this.load(img, _this.properties);
        _this.updated(url);
        if (callback != null) {
          return callback();
        }
      };
    })(this);
  };

  ProjectSprite.prototype.loaded = function() {
    var j, k, l, len, len1, m, ref, ref1;
    ref = this.project.map_list;
    for (j = 0, len = ref.length; j < len; j++) {
      m = ref[j];
      m.update();
      m.updateCanvases();
    }
    ref1 = this.load_listeners;
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      l = ref1[k];
      l();
    }
    this.project.notifyListeners(this);
  };

  ProjectSprite.prototype.rename = function(name) {
    var s;
    this.project.changeSpriteName(this.name, name);
    delete this.project.sprite_table[this.name];
    this.name = name;
    this.project.sprite_table[this.name] = this;
    this.filename = this.name + "." + this.ext;
    this.file = "sprites/" + this.filename;
    this.url = this.project.getFullURL() + this.file;
    s = this.name.split("-");
    this.shortname = s[s.length - 1];
    return this.path_prefix = s.length > 1 ? s.splice(0, s.length - 1).join("-") + "-" : "";
  };

  ProjectSprite.prototype.updateThumbnail = function() {
    var canvas, context, frame, h, j, len, r, ref, results, w;
    if (!this.thumbnails) {
      return;
    }
    ref = this.thumbnails;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      canvas = ref[j];
      context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      frame = this.frames[0].getCanvas();
      r = Math.min(64 / frame.width, 64 / frame.height);
      context.imageSmoothingEnabled = false;
      w = r * frame.width;
      h = r * frame.height;
      results.push(context.drawImage(frame, 32 - w / 2, 32 - h / 2, w, h));
    }
    return results;
  };

  ProjectSprite.prototype.getThumbnailElement = function() {
    var canvas, mouseover, update;
    canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    if (this.thumbnails == null) {
      this.thumbnails = [];
      this.addLoadListener((function(_this) {
        return function() {
          return _this.updateThumbnail();
        };
      })(this));
    }
    this.thumbnails.push(canvas);
    mouseover = false;
    update = (function(_this) {
      return function() {
        var context, dt, frame, h, r, t, w;
        if (mouseover && _this.frames.length > 1) {
          requestAnimationFrame(function() {
            return update();
          });
        }
        dt = 1000 / _this.fps;
        t = Date.now();
        frame = mouseover ? Math.floor(t / dt) % _this.frames.length : 0;
        context = canvas.getContext("2d");
        context.imageSmoothingEnabled = false;
        context.clearRect(0, 0, 64, 64);
        frame = _this.frames[frame].getCanvas();
        r = Math.min(64 / frame.width, 64 / frame.height);
        w = r * frame.width;
        h = r * frame.height;
        return context.drawImage(frame, 32 - w / 2, 32 - h / 2, w, h);
      };
    })(this);
    canvas.addEventListener("mouseenter", (function(_this) {
      return function() {
        mouseover = true;
        return update();
      };
    })(this));
    canvas.addEventListener("mouseout", (function(_this) {
      return function() {
        return mouseover = false;
      };
    })(this));
    canvas.updateSprite = update;
    if (this.ready) {
      update();
    }
    return canvas;
  };

  ProjectSprite.prototype.canBeRenamed = function() {
    return this.name !== "icon";
  };

  return ProjectSprite;

})(Sprite);
