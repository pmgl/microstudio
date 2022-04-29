this.ProjectSource = (function() {
  function ProjectSource(project, file, size) {
    var s;
    this.project = project;
    this.file = file;
    this.size = size != null ? size : 0;
    this.name = this.file.split(".")[0];
    this.ext = this.file.split(".")[1];
    this.filename = this.file;
    this.file = "ms/" + this.file;
    s = this.name.split("-");
    this.shortname = s[s.length - 1];
    this.path_prefix = s.length > 1 ? s.splice(0, s.length - 1).join("-") + "-" : "";
    this.content = "";
    this.fetched = false;
    this.reload();
  }

  ProjectSource.prototype.reload = function(callback) {
    return this.project.app.client.sendRequest({
      name: "read_project_file",
      project: this.project.id,
      file: this.file
    }, (function(_this) {
      return function(msg) {
        _this.content = msg.content;
        _this.fetched = true;
        _this.loaded();
        if (callback != null) {
          return callback();
        }
      };
    })(this));
  };

  ProjectSource.prototype.loaded = function() {
    return this.project.notifyListeners(this);
  };

  ProjectSource.prototype.rename = function(name) {
    var s;
    delete this.project.source_table[this.name];
    this.name = name;
    this.project.source_table[this.name] = this;
    this.filename = this.name + "." + this.ext;
    this.file = "ms/" + this.filename;
    s = this.name.split("-");
    this.shortname = s[s.length - 1];
    return this.path_prefix = s.length > 1 ? s.splice(0, s.length - 1).join("-") + "-" : "";
  };

  return ProjectSource;

})();
