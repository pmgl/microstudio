this.SoundEditor = class SoundEditor extends Manager {
  constructor(app) {
    super(app);
    this.folder = "sounds";
    this.item = "sound";
    this.list_change_event = "soundlist";
    this.get_item = "getSound";
    this.use_thumbnails = true;
    this.extensions = ["wav", "ogg", "flac"];
    this.update_list = "updateSoundList";
    this.init();
  }

  update() {
    return super.update();
  }

  openItem(name) {
    var sound;
    super.openItem(name);
    sound = this.app.project.getSound(name);
    if (sound != null) {
      return sound.play();
    }
  }

  createAsset(folder) {
    var input;
    input = document.createElement("input");
    input.type = "file";
    input.accept = ".wav,.ogg,.flac";
    input.addEventListener("change", (event) => {
      var f, files, i, len;
      files = event.target.files;
      if (files.length >= 1) {
        for (i = 0, len = files.length; i < len; i++) {
          f = files[i];
          this.fileDropped(f, folder);
        }
      }
    });
    return input.click();
  }

  fileDropped(file, folder) {
    var reader;
    console.info(`processing ${file.name}`);
    console.info("folder: " + folder);
    reader = new FileReader();
    reader.addEventListener("load", () => {
      var audioContext, file_size;
      file_size = reader.result.byteLength;
      console.info("file read, size = " + file_size);
      if (file_size > 30000000) { // client side limit 30 Mb
        this.app.appui.showNotification(this.app.translator.get("Audio file is too heavy"));
        return;
      }
      audioContext = new AudioContext();
      return audioContext.decodeAudioData(reader.result, (decoded) => {
        var ext, name, r2, sound, thumbnailer;
        console.info(decoded);
        thumbnailer = new SoundThumbnailer(decoded, 96, 64);
        name = file.name.split(".")[0];
        ext = file.name.split(".")[1].toLowerCase();
        name = this.findNewFilename(name, "getSound", folder);
        if (folder != null) {
          name = folder.getFullDashPath() + "-" + name;
        }
        if (folder != null) {
          folder.setOpen(true);
        }
        sound = this.app.project.createSound(name, thumbnailer.canvas.toDataURL(), file_size);
        sound.uploading = true;
        this.setSelectedItem(name);
        r2 = new FileReader();
        r2.addEventListener("load", () => {
          var data;
          sound.local_url = r2.result;
          data = r2.result.split(",")[1];
          this.app.project.addPendingChange(this);
          return this.app.client.sendRequest({
            name: "write_project_file",
            project: this.app.project.id,
            file: `sounds/${name}.${ext}`,
            properties: {},
            content: data,
            thumbnail: thumbnailer.canvas.toDataURL().split(",")[1]
          }, (msg) => {
            console.info(msg);
            this.app.project.removePendingChange(this);
            sound.uploading = false;
            this.app.project.updateSoundList();
            return this.checkNameFieldActivation();
          });
        });
        return r2.readAsDataURL(file);
      });
    });
    return reader.readAsArrayBuffer(file);
  }

};
