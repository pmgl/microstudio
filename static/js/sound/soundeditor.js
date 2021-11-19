var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

this.SoundEditor = (function(superClass) {
  extend(SoundEditor, superClass);

  function SoundEditor(app) {
    var synth;
    this.app = app;
    SoundEditor.__super__.constructor.call(this, this.app);
    this.folder = "sounds";
    this.item = "sound";
    this.list_change_event = "soundlist";
    this.get_item = "getSound";
    this.use_thumbnails = true;
    this.extensions = ["wav"];
    this.update_list = "updateSoundList";
    this.box_width = 96;
    this.box_height = 84;
    this.init();
    synth = document.getElementById("open-synth");
    synth.addEventListener("click", (function(_this) {
      return function() {
        if (_this.synth == null) {
          _this.app.audio_controller.init();
          _this.synth = new Synth(_this.app);
          return _this.synth.synth_window.show();
        } else {
          if (_this.synth.synth_window.shown) {
            return _this.synth.synth_window.close();
          } else {
            return _this.synth.synth_window.show();
          }
        }
      };
    })(this));
  }

  SoundEditor.prototype.update = function() {
    var synth;
    SoundEditor.__super__.update.call(this);
    synth = document.getElementById("open-synth");
    if (this.app.user && this.app.user.flags.experimental) {
      return synth.style.display = "inline-block";
    } else {
      return synth.style.display = "none";
    }
  };

  SoundEditor.prototype.openItem = function(name) {
    var sound;
    SoundEditor.__super__.openItem.call(this, name);
    sound = this.app.project.getSound(name);
    if (sound != null) {
      return sound.play();
    }
  };

  SoundEditor.prototype.fileDropped = function(file) {
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
          var name, r2, sound, thumbnailer;
          console.info(decoded);
          thumbnailer = new SoundThumbnailer(decoded, 96, 64);
          name = file.name.split(".")[0];
          name = _this.findNewFilename(name, "getSound");
          sound = _this.app.project.createSound(name, thumbnailer.canvas.toDataURL(), reader.result.length);
          sound.uploading = true;
          _this.setSelectedItem(name);
          r2 = new FileReader();
          r2.addEventListener("load", function() {
            var data;
            sound.local_url = r2.result;
            data = r2.result.split(",")[1];
            _this.app.project.addPendingChange(_this);
            return _this.app.client.sendRequest({
              name: "write_project_file",
              project: _this.app.project.id,
              file: "sounds/" + name + ".wav",
              properties: {},
              content: data,
              thumbnail: thumbnailer.canvas.toDataURL().split(",")[1]
            }, function(msg) {
              console.info(msg);
              _this.app.project.removePendingChange(_this);
              sound.uploading = false;
              _this.app.project.updateSoundList();
              return _this.checkNameFieldActivation();
            });
          });
          return r2.readAsDataURL(file);
        });
      };
    })(this));
    return reader.readAsArrayBuffer(file);
  };

  return SoundEditor;

})(Manager);
