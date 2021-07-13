var Downloader;

this.Builder = (function() {
  function Builder(manager, session, target) {
    this.manager = manager;
    this.session = session;
    this.target = target;
    this.last_active = Date.now();
    this.downloads = {};
    this.download_id = 0;
    this.session.send("builder_started");
    this.session.messageReceived = (function(_this) {
      return function(msg) {
        var err, id;
        _this.last_active = Date.now();
        if (typeof msg === "string") {
          try {
            msg = JSON.parse(msg);
            switch (msg.name) {
              case "get_job":
                return _this.getJob();
              case "build_progress":
                return _this.setBuildProgress(msg);
              case "build_complete":
                return _this.buildComplete(msg);
              case "build_error":
                return _this.buildError(msg);
            }
          } catch (error) {
            err = error;
          }
        } else {
          id = msg.readUIntBE(0, 4);
          if (_this.downloads[id] != null) {
            return _this.downloads[id].chunkReceived(msg);
          } else {
            return console.info("Download not found: " + id);
          }
        }
      };
    })(this);
    this.session.disconnected = (function(_this) {
      return function() {
        _this.manager.unregisterBuilder(_this);
        return _this.last_active = 0;
      };
    })(this);
    this.interval = setInterval(((function(_this) {
      return function() {
        var err;
        if (!_this.isActive()) {
          clearInterval(_this.interval);
          try {
            _this.session.socket.close();
            return _this.manager.unregisterBuilder(_this);
          } catch (error) {
            err = error;
            return console.error(err);
          }
        }
      };
    })(this)), 60000);
    console.info("Builder created");
  }

  Builder.prototype.getJob = function() {
    var path;
    this.current_build = this.manager.getJob(this.target);
    if (this.current_build != null) {
      this.current_build.builder = this;
      if (this.current_build.project["public"]) {
        path = "/" + this.current_build.project.owner.nick + "/" + this.current_build.project.slug + "/publish/html/";
      } else {
        path = "/" + this.current_build.project.owner.nick + "/" + this.current_build.project.slug + "/" + this.current_build.project.code + "/publish/html/";
      }
      return this.session.send({
        name: "job",
        project: {
          title: this.current_build.project.title,
          slug: this.current_build.project.slug,
          owner: this.current_build.project.owner.nick,
          last_modified: this.current_build.project.last_modified,
          orientation: this.current_build.project.orientation,
          download: path
        }
      });
    } else {
      return this.session.send({
        name: "no_job"
      });
    }
  };

  Builder.prototype.setBuildProgress = function(msg) {
    if (this.current_build != null) {
      this.current_build.progress = msg.progress;
      return this.current_build.status_text = msg.text;
    }
  };

  Builder.prototype.buildComplete = function(msg) {
    this.current_build.file_info = {
      file: msg.file,
      folder: msg.folder,
      length: msg.length
    };
    return this.current_build = null;
  };

  Builder.prototype.buildError = function(msg) {
    this.current_build.error = msg.error || "Error";
    return this.current_build = null;
  };

  Builder.prototype.startDownload = function(build, res) {
    var download;
    download = new Downloader(this.download_id++, build, res);
    this.downloads[download.id] = download;
    return download.start();
  };

  Builder.prototype.removeDownload = function(download) {
    return delete this.downloads[download.id];
  };

  Builder.prototype.isActive = function() {
    return this.last_active + 5 * 60000 > Date.now();
  };

  return Builder;

})();

Downloader = (function() {
  function Downloader(id1, build1, res1) {
    this.id = id1;
    this.build = build1;
    this.res = res1;
    this.res.setHeader("Content-Type", "application/octet-stream");
    this.res.setHeader("Content-Disposition", "attachement; filename=\"" + this.build.file_info.file + "\"");
    this.res.setHeader("Content-Length", this.build.file_info.length);
    this.res.on("error", (function(_this) {
      return function(err) {
        return console.error(err);
      };
    })(this));
  }

  Downloader.prototype.start = function() {
    return this.build.builder.session.send({
      name: "download",
      file: this.build.file_info.file,
      folder: this.build.file_info.folder,
      download_id: this.id
    });
  };

  Downloader.prototype.chunkReceived = function(buffer) {
    var buf, cb;
    if (buffer.byteLength > 4) {
      buf = Buffer.alloc(buffer.byteLength - 4);
      buffer.copy(buf, 0, 4, buffer.byteLength);
      cb = (function(_this) {
        return function() {
          return _this.build.builder.session.send({
            name: "next_chunk",
            download_id: _this.id
          });
        };
      })(this);
      if (this.res.write(buf, "binary")) {
        return cb();
      } else {
        return this.res.once("drain", cb);
      }
    } else {
      this.res.end();
      this.build.builder.removeDownload(this);
      return this.build.downloaded = true;
    }
  };

  return Downloader;

})();

module.exports = this.Builder;
