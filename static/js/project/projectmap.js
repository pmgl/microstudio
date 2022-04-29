var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

this.ProjectMap = (function(superClass) {
  extend(ProjectMap, superClass);

  function ProjectMap(project, file, size) {
    var s;
    this.project = project;
    this.file = file;
    this.size = size != null ? size : 0;
    ProjectMap.__super__.constructor.call(this, 16, 10, 16, 16, this.project.sprite_table);
    this.url = this.project.getFullURL() + this.file;
    this.canvases = [];
    this.name = this.file.split(".")[0];
    this.ext = this.file.split(".")[1];
    this.filename = this.file;
    this.file = "maps/" + this.file;
    s = this.name.split("-");
    this.shortname = s[s.length - 1];
    this.path_prefix = s.length > 1 ? s.splice(0, s.length - 1).join("-") + "-" : "";
    this.loadFile();
  }

  ProjectMap.prototype.addCanvas = function(canvas) {
    this.canvases.push(canvas);
    return this.updateCanvas(canvas);
  };

  ProjectMap.prototype.updateCanvases = function() {
    var c, i, len, ref;
    ref = this.canvases;
    for (i = 0, len = ref.length; i < len; i++) {
      c = ref[i];
      this.updateCanvas(c);
    }
  };

  ProjectMap.prototype.updateCanvas = function(c) {
    var context, h, r, r1, r2, w;
    r1 = Math.max(128 / this.width, 96 / this.height);
    r2 = Math.min(128 / this.width, 96 / this.height);
    r = (r1 + r2) / 2;
    w = r * this.width;
    h = r * this.height;
    context = c.getContext("2d");
    context.fillStyle = "#666";
    context.fillRect(0, 0, c.width, c.height);
    context.imageSmoothingEnabled = false;
    return context.drawImage(this.canvas, c.width / 2 - w / 2, c.height / 2 - h / 2, w, h);
  };

  ProjectMap.prototype.loadFile = function() {
    return this.project.app.client.sendRequest({
      name: "read_project_file",
      project: this.project.id,
      file: this.file
    }, (function(_this) {
      return function(msg) {
        _this.load(msg.content, _this.project.sprite_table);
        _this.update();
        _this.updateCanvases();
        if (_this.project.app.map_editor.selected_map === _this.name) {
          return _this.project.app.map_editor.currentMapUpdated();
        }
      };
    })(this));
  };

  ProjectMap.prototype.getThumbnailElement = function() {
    var context;
    if (this.thumbnail == null) {
      this.thumbnail = document.createElement("canvas");
      this.thumbnail.width = 128;
      this.thumbnail.height = 96;
      context = this.thumbnail.getContext("2d");
      context.fillStyle = "#000";
      context.fillRect(0, 0, 128, 96);
      this.canvases.push(this.thumbnail);
      this.update();
      this.updateCanvases();
    }
    return this.thumbnail;
  };

  ProjectMap.prototype.rename = function(name) {
    var s;
    delete this.project.map_table[this.name];
    this.name = name;
    this.project.map_table[this.name] = this;
    this.filename = this.name + "." + this.ext;
    this.file = "maps/" + this.filename;
    this.url = this.project.getFullURL() + this.file;
    s = this.name.split("-");
    this.shortname = s[s.length - 1];
    return this.path_prefix = s.length > 1 ? s.splice(0, s.length - 1).join("-") + "-" : "";
  };

  return ProjectMap;

})(MicroMap);
