this.ProjectMusic = (function() {
  function ProjectMusic(project, file, size) {
    this.project = project;
    this.file = file;
    this.size = size != null ? size : 0;
    this.name = this.file.split(".")[0];
    this.ext = this.file.split(".")[1];
    this.filename = this.file;
    this.file = "music/" + this.file;
  }

  ProjectMusic.prototype.getURL = function() {
    if (this.local_url != null) {
      return this.local_url;
    }
    return this.project.getFullURL() + this.file;
  };

  ProjectMusic.prototype.getThumbnailURL = function() {
    var f;
    if (this.thumbnail_url != null) {
      return this.thumbnail_url;
    }
    f = this.file.split(".")[0] + ".png";
    f = f.replace("music/", "music_th/");
    return this.project.getFullURL() + f;
  };

  ProjectMusic.prototype.loaded = function() {
    return this.project.notifyListeners(this);
  };

  ProjectMusic.prototype.play = function() {
    var funk;
    if (this.audio == null) {
      this.audio = new Audio(this.getURL());
      this.audio.loop = true;
    }
    funk = (function(_this) {
      return function() {
        document.body.removeEventListener("mousedown", funk);
        return _this.audio.pause();
      };
    })(this);
    document.body.addEventListener("mousedown", funk);
    return this.audio.play();
  };

  ProjectMusic.prototype.rename = function(name) {
    this.name = name;
    this.filename = this.name + "." + this.ext;
    return this.file = "music/" + this.filename;
  };

  return ProjectMusic;

})();
