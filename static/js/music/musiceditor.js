var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

this.MusicEditor = (function(superClass) {
  extend(MusicEditor, superClass);

  function MusicEditor(app) {
    this.app = app;
    this.folder = "music";
    this.item = "music";
    this.list_change_event = "musiclist";
    this.get_item = "getMusic";
    this.use_thumbnails = true;
    this.extensions = ["mp3"];
    this.update_list = "updateMusicList";
    this.box_width = 192;
    this.box_height = 84;
    this.init();
  }

  MusicEditor.prototype.openItem = function(name) {
    var music;
    MusicEditor.__super__.openItem.call(this, name);
    music = this.app.project.getMusic(name);
    if (music != null) {
      return music.play();
    }
  };

  MusicEditor.prototype.fileDropped = function(file) {
    var reader;
    console.info("processing " + file.name);
    reader = new FileReader();
    reader.addEventListener("load", (function(_this) {
      return function() {
        var audioContext;
        console.info("file read, size = " + reader.result.length);
        if (reader.result.length > 5000000) {
          return;
        }
        audioContext = new AudioContext();
        return audioContext.decodeAudioData(reader.result, function(decoded) {
          var music, name, r2, thumbnailer;
          console.info(decoded);
          thumbnailer = new SoundThumbnailer(decoded, 192, 64, "hsl(200,80%,60%)");
          name = file.name.split(".")[0];
          name = _this.findNewFilename(name, "getMusic");
          music = _this.app.project.createMusic(name, thumbnailer.canvas.toDataURL(), reader.result.length);
          music.uploading = true;
          _this.setSelectedItem(name);
          r2 = new FileReader();
          r2.addEventListener("load", function() {
            var data;
            music.local_url = r2.result;
            data = r2.result.split(",")[1];
            _this.app.project.addPendingChange(_this);
            return _this.app.client.sendRequest({
              name: "write_project_file",
              project: _this.app.project.id,
              file: "music/" + name + ".mp3",
              properties: {},
              content: data,
              thumbnail: thumbnailer.canvas.toDataURL().split(",")[1]
            }, function(msg) {
              console.info(msg);
              _this.app.project.removePendingChange(_this);
              music.uploading = false;
              _this.app.project.updateMusicList();
              return _this.checkNameFieldActivation();
            });
          });
          return r2.readAsDataURL(file);
        });
      };
    })(this));
    return reader.readAsArrayBuffer(file);
  };

  return MusicEditor;

})(Manager);
