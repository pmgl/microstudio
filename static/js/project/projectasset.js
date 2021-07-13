this.ProjectAsset = (function() {
  function ProjectAsset(project, file, size) {
    this.project = project;
    this.file = file;
    this.size = size != null ? size : 0;
    this.name = this.file.split(".")[0];
    this.ext = this.file.split(".")[1];
    this.filename = this.file;
    this.file = "assets/" + this.file;
  }

  ProjectAsset.prototype.getURL = function() {
    return this.project.getFullURL() + this.file;
  };

  ProjectAsset.prototype.getThumbnailURL = function() {
    var f;
    f = this.file.split(".")[0] + ".png";
    f = f.replace("assets/", "assets_th/");
    return this.project.getFullURL() + f;
  };

  ProjectAsset.prototype.loaded = function() {
    return this.project.notifyListeners(this);
  };

  return ProjectAsset;

})();
