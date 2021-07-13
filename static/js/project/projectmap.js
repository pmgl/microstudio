var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

this.ProjectMap = (function(superClass) {
  extend(ProjectMap, superClass);

  function ProjectMap(project, file, size) {
    this.project = project;
    this.file = file;
    this.size = size != null ? size : 0;
    ProjectMap.__super__.constructor.call(this, 16, 10, 16, 16, this.project.sprite_table);
    this.url = this.project.getFullURL() + this.file;
    this.canvases = [];
    this.name = this.file.substring(0, this.file.length - 5);
    this.filename = this.file;
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
    var context, h, r, w;
    r = Math.min(96 / this.width, 96 / this.height);
    w = r * this.width;
    h = r * this.height;
    c.width = 96;
    c.height = 96;
    context = c.getContext("2d");
    context.clearRect(0, 0, c.width, c.height);
    context.imageSmoothingEnabled = false;
    return context.drawImage(this.canvas, 48 - w / 2, 48 - h / 2, w, h);
  };

  ProjectMap.prototype.loadFile = function() {
    return this.project.app.client.sendRequest({
      name: "read_project_file",
      project: this.project.id,
      file: "maps/" + this.file
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

  ProjectMap.prototype.rename = function(name) {
    this.name = name;
    this.file = this.name + ".json";
    this.filename = this.file;
    return this.url = this.project.getFullURL() + this.file;
  };

  return ProjectMap;

})(MicroMap);
