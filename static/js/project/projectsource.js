this.ProjectSource = (function() {
  function ProjectSource(project, file, size) {
    this.project = project;
    this.file = file;
    this.size = size != null ? size : 0;
    this.name = this.file.substring(0, this.file.length - 3);
    this.filename = this.file;
    this.file = "ms/" + this.file;
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

  return ProjectSource;

})();
