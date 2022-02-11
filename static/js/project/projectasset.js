this.ProjectAsset = (function() {
  function ProjectAsset(project, file, size) {
    var s;
    this.project = project;
    this.file = file;
    this.size = size != null ? size : 0;
    this.name = this.file.split(".")[0];
    this.ext = this.file.split(".")[1];
    this.filename = this.file;
    this.file = "assets/" + this.file;
    s = this.name.split("-");
    this.shortname = s[s.length - 1];
    this.path_prefix = s.length > 1 ? s.splice(0, s.length - 1).join("-") + "-" : "";
  }

  ProjectAsset.prototype.getURL = function() {
    if (this.local_url != null) {
      return this.local_url;
    }
    return this.project.getFullURL() + this.file;
  };

  ProjectAsset.prototype.getThumbnailURL = function() {
    var f;
    if (this.thumbnail_url != null) {
      return this.thumbnail_url;
    }
    f = this.file.split(".")[0] + ".png";
    f = f.replace("assets/", "assets_th/");
    return this.project.getFullURL() + f;
  };

  ProjectAsset.prototype.loaded = function() {
    return this.project.notifyListeners(this);
  };

  ProjectAsset.prototype.rename = function(name) {
    var s;
    delete this.project.asset_table[this.name];
    this.name = name;
    this.project.asset_table[this.name] = this;
    this.filename = this.name + "." + this.ext;
    this.file = "assets/" + this.filename;
    s = this.name.split("-");
    this.shortname = s[s.length - 1];
    return this.path_prefix = s.length > 1 ? s.splice(0, s.length - 1).join("-") + "-" : "";
  };

  return ProjectAsset;

})();
