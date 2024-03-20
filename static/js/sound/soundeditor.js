var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

this.SoundEditor = (function(superClass) {
  extend(SoundEditor, superClass);

  function SoundEditor(app) {
    SoundEditor.__super__.constructor.call(this, app);
    this.folder = "sounds";
    this.item = "sound";
    this.list_change_event = "soundlist";
    this.get_item = "getSound";
    this.use_thumbnails = true;
    this.extensions = ["wav", "ogg", "flac"];
    this.update_list = "updateSoundList";
    this.init();
  }

  SoundEditor.prototype.update = function() {
    return SoundEditor.__super__.update.call(this);
  };

  SoundEditor.prototype.openItem = function(name) {
    var sound;
    SoundEditor.__super__.openItem.call(this, name);
    sound = this.app.project.getSound(name);
    if (sound != null) {
      return sound.play();
    }
  };

  SoundEditor.prototype.createAsset = function(folder) {
    var input;
    input = document.createElement("input");
    input.type = "file";
    input.accept = ".wav,.ogg,.flac";
    input.addEventListener("change", (function(_this) {
      return function(event) {
        var f, files, i, len;
        files = event.target.files;
        if (files.length >= 1) {
          for (i = 0, len = files.length; i < len; i++) {
            f = files[i];
            _this.fileDropped(f, folder);
          }
        }
      };
    })(this));
    return input.click();
  };

  SoundEditor.prototype.fileDropped = function(file, folder) {
    var reader;
    console.info("processing " + file.name);
    console.info("folder: " + folder);
    reader = new FileReader();
    reader.addEventListener("load", (function(_this) {
      return function() {
        var audioContext, file_size;
        file_size = reader.result.byteLength;
        console.info("file read, size = " + file_size);
        if (file_size > 30000000) {
          _this.app.appui.showNotification(_this.app.translator.get("Audio file is too heavy"));
          return;
        }
        audioContext = new AudioContext();
        return audioContext.decodeAudioData(reader.result, function(decoded) {
          var ext, name, r2, sound, thumbnailer;
          console.info(decoded);
          thumbnailer = new SoundThumbnailer(decoded, 96, 64);
          name = file.name.split(".")[0];
          ext = file.name.split(".")[1].toLowerCase();
          name = _this.findNewFilename(name, "getSound", folder);
          if (folder != null) {
            name = folder.getFullDashPath() + "-" + name;
          }
          if (folder != null) {
            folder.setOpen(true);
          }
          sound = _this.app.project.createSound(name, thumbnailer.canvas.toDataURL(), file_size);
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
              file: "sounds/" + name + "." + ext,
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
