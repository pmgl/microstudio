this.MusicEditor = class MusicEditor extends Manager {
  constructor(app) {
    super(app);
    this.folder = "music";
    this.item = "music";
    this.list_change_event = "musiclist";
    this.get_item = "getMusic";
    this.use_thumbnails = true;
    this.extensions = ["mp3"];
    this.update_list = "updateMusicList";
    this.init();
  }

  openItem(name) {
    var music;
    super.openItem(name);
    music = this.app.project.getMusic(name);
    if (music != null) {
      return music.play();
    }
  }

  createAsset(folder) {
    var input;
    input = document.createElement("input");
    input.type = "file";
    input.accept = ".mp3";
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
    reader = new FileReader();
    reader.addEventListener("load", () => {
      var audioContext, file_size;
      file_size = reader.result.byteLength;
      console.info("file read, size = " + file_size);
      if (file_size > 5000000) {
        this.app.appui.showNotification(this.app.translator.get("Music file is too heavy"));
        return;
      }
      audioContext = new AudioContext();
      return audioContext.decodeAudioData(reader.result, (decoded) => {
        var music, name, r2, thumbnailer;
        console.info(decoded);
        thumbnailer = new SoundThumbnailer(decoded, 192, 64, "hsl(200,80%,60%)");
        name = file.name.split(".")[0];
        name = this.findNewFilename(name, "getMusic", folder);
        if (folder != null) {
          name = folder.getFullDashPath() + "-" + name;
        }
        if (folder != null) {
          folder.setOpen(true);
        }
        music = this.app.project.createMusic(name, thumbnailer.canvas.toDataURL(), file_size);
        music.uploading = true;
        this.setSelectedItem(name);
        r2 = new FileReader();
        r2.addEventListener("load", () => {
          var data;
          music.local_url = r2.result;
          data = r2.result.split(",")[1];
          this.app.project.addPendingChange(this);
          return this.app.client.sendRequest({
            name: "write_project_file",
            project: this.app.project.id,
            file: `music/${name}.mp3`,
            properties: {},
            content: data,
            thumbnail: thumbnailer.canvas.toDataURL().split(",")[1]
          }, (msg) => {
            console.info(msg);
            this.app.project.removePendingChange(this);
            music.uploading = false;
            this.app.project.updateMusicList();
            return this.checkNameFieldActivation();
          });
        });
        return r2.readAsDataURL(file);
      });
    });
    return reader.readAsArrayBuffer(file);
  }

};
