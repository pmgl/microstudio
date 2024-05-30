this.MusicEditor = class MusicEditor extends Manager {
  constructor(app) {
    super(app);
    this.folder = "music";
    this.item = "music";
    this.list_change_event = "musiclist";
    this.get_item = "getMusic";
    this.use_thumbnails = true;
    this.extensions = ["mp3", "ogg", "flac"];
    this.update_list = "updateMusicList";
    this.init();
  }

  update() {
    var f, img, img2;
    super.update();
    if (!this.img_loaded) {
      this.img_loaded = true;
      img = new Image();
      img.src = "/img/mpu/mpums1.jpg";
      document.getElementById("music-editor-bg").appendChild(img);
      img.style = "position: absolute; width: 70%; bottom: 0; left:0; cursor: pointer";
      img2 = new Image();
      img2.src = "/img/mpu/mpums2.png";
      document.getElementById("music-editor-content").appendChild(img2);
      img2.style = "position: absolute; height: 60%; bottom: 20px; right:20px; cursor: pointer";
      f = function() {
        return window.open("https://store.steampowered.com/app/2246370/Music_Power_Up/?utm_source=microstudio", "_blank");
      };
      img.addEventListener("click", f);
      return img2.addEventListener("click", f);
    }
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
    input.accept = ".mp3,.ogg,.flac";
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
      if (file_size > 30000000) { // client-side limit to 30 Mb
        this.app.appui.showNotification(this.app.translator.get("Music file is too heavy"));
        return;
      }
      audioContext = new AudioContext();
      return audioContext.decodeAudioData(reader.result, (decoded) => {
        var ext, music, name, r2, thumbnailer;
        console.info(decoded);
        thumbnailer = new SoundThumbnailer(decoded, 192, 64, "hsl(200,80%,60%)");
        name = file.name.split(".")[0];
        ext = file.name.split(".")[1].toLowerCase();
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
            file: `music/${name}.${ext}`,
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
