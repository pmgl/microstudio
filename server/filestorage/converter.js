this.Converter = (function() {
  function Converter(hashedstorage) {
    this.hashedstorage = hashedstorage;
    this.filestorage = this.hashedstorage.filestorage;
    this.folders = ["music", "sounds", "sprites", "ms"];
  }

  Converter.prototype.start = function(content1) {
    var f, funk, i, key, len, list, project, ref, ref1;
    this.content = content1;
    list = [];
    ref = this.content.projects;
    for (key in ref) {
      project = ref[key];
      ref1 = this.folders;
      for (i = 0, len = ref1.length; i < len; i++) {
        f = ref1[i];
        list.push({
          project: project,
          folder: f
        });
      }
    }
    funk = (function(_this) {
      return function() {
        var folder, job, p;
        if (list.length > 0) {
          job = list.splice(0, 1)[0];
          p = job.project;
          folder = job.folder;
          if (!p.deleted) {
            return _this.filestorage.list(p.owner.id + "/" + p.id + "/" + folder, function(list) {
              if (list != null) {
                f = function() {
                  var file;
                  if (list.length > 0) {
                    file = list.splice(0, 1)[0];
                    file = p.owner.id + "/" + p.id + "/" + folder + "/" + file;
                    console.info("converting file: " + file);
                    return _this.filestorage.read(file, "binary", function(content) {
                      if (content != null) {
                        return _this.hashedstorage.write(file, content, function() {
                          return _this.filestorage["delete"](file, function() {
                            return f();
                          });
                        });
                      } else {
                        return f();
                      }
                    });
                  } else {
                    return funk();
                  }
                };
                return f();
              } else {
                return funk();
              }
            });
          } else {
            return funk();
          }
        }
      };
    })(this);
    return funk();
  };

  return Converter;

})();

module.exports = this.Converter;
