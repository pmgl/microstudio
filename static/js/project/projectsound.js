this.ProjectSound = (function() {
  function ProjectSound(project, file, size) {
    var s;
    this.project = project;
    this.file = file;
    this.size = size != null ? size : 0;
    this.name = this.file.split(".")[0];
    this.ext = this.file.split(".")[1];
    this.filename = this.file;
    this.file = "sounds/" + this.file;
    s = this.name.split("-");
    this.shortname = s[s.length - 1];
    this.path_prefix = s.length > 1 ? s.splice(0, s.length - 1).join("-") + "-" : "";
  }

  ProjectSound.prototype.getURL = function() {
    if (this.local_url != null) {
      return this.local_url;
    }
    return this.project.getFullURL() + this.file;
  };

  ProjectSound.prototype.getThumbnailURL = function() {
    var f;
    if (this.thumbnail_url != null) {
      return this.thumbnail_url;
    }
    f = this.file.split(".")[0] + ".png";
    f = f.replace("sounds/", "sounds_th/");
    return this.project.getFullURL() + f;
  };

  ProjectSound.prototype.loaded = function() {
    return this.project.notifyListeners(this);
  };

  ProjectSound.prototype.play = function() {
    var audio, funk;
    audio = new Audio(this.getURL());
    audio.play();
    funk = function() {
      audio.pause();
      return document.body.removeEventListener("mousedown", funk);
    };
    return document.body.addEventListener("mousedown", funk);
  };

  ProjectSound.prototype.rename = function(name) {
    var s;
    delete this.project.sound_table[this.name];
    this.name = name;
    this.project.sound_table[this.name] = this;
    this.filename = this.name + "." + this.ext;
    this.file = "sounds/" + this.filename;
    s = this.name.split("-");
    this.shortname = s[s.length - 1];
    return this.path_prefix = s.length > 1 ? s.splice(0, s.length - 1).join("-") + "-" : "";
  };

  return ProjectSound;

})();
