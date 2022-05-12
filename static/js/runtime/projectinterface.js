this.ProjectInterface = (function() {
  function ProjectInterface(runtime) {
    this.runtime = runtime;
    this["interface"] = {
      listFiles: (function(_this) {
        return function(path, callback) {
          return _this.listFiles(path, callback);
        };
      })(this),
      readFile: (function(_this) {
        return function(path, callback) {
          return _this.readFile(path, callback);
        };
      })(this),
      writeFile: (function(_this) {
        return function(path, obj, options, callback) {
          return _this.writeFile(path, obj, options, callback);
        };
      })(this)
    };
  }

  ProjectInterface.prototype.callback = function(callback, data, res, error) {
    if (error != null) {
      res.error = error;
      res.ready = 1;
      if (typeof callback === "function") {
        return callback(0, error);
      }
    } else {
      res.data = data;
      res.ready = 1;
      if (typeof callback === "function") {
        return callback(data);
      }
    }
  };

  ProjectInterface.prototype.writeFile = function(path, obj, options, callback) {
    var kind;
    kind = path.split("/")[0];
    switch (kind) {
      case "source":
        return this.writeSourceFile(obj, path, options, callback);
      case "sprites":
        return this.writeSpriteFile(obj, path, options, callback);
      case "maps":
        return this.writeMapFile(obj, path, options, callback);
      case "sounds":
        return this.writeSoundFile(obj, path, options, callback);
      case "music":
        return this.writeMusicFile(obj, path, options, callback);
      case "assets":
        return this.writeAssetFile(obj, path, options, callback);
      default:
        return callback(0, "Root folder " + kind + " does not exist");
    }
  };

  ProjectInterface.prototype.writeSourceFile = function(obj, path, options, callback) {
    var msg, res;
    res = {
      ready: 0
    };
    if (typeof obj !== "string") {
      this.callback(callback, 0, res, "Incorrect object type, expected string");
    } else {
      msg = {
        name: "write_project_file",
        path: path,
        content: obj
      };
      this.runtime.listener.postRequest(msg, (function(_this) {
        return function(result) {
          return _this.callback(callback, result.content, res, result.error);
        };
      })(this));
    }
    return res;
  };

  ProjectInterface.prototype.writeSpriteFile = function(obj, path, options, callback) {
    var canvas, context, fps, frames, i, j, msg, ref, res;
    res = {
      ready: 0
    };
    if (obj instanceof msImage) {
      msg = {
        name: "write_project_file",
        path: path,
        content: obj.canvas.toDataURL().split(",")[1]
      };
      this.runtime.listener.postRequest(msg, (function(_this) {
        return function(result) {
          return _this.callback(callback, result.content, res, result.error);
        };
      })(this));
    } else if (obj instanceof Sprite) {
      fps = obj.fps;
      if (obj.frames.length === 1) {
        canvas = obj.frames[0].canvas;
        frames = 1;
      } else {
        canvas = document.createElement("canvas");
        canvas.width = obj.width;
        canvas.height = obj.height * obj.frames.length;
        context = canvas.getContext("2d");
        for (i = j = 0, ref = obj.frames.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
          context.drawImage(obj.frames[i].canvas, 0, i * obj.height);
        }
        frames = obj.frames.length;
      }
      msg = {
        name: "write_project_file",
        path: path,
        content: canvas.toDataURL().split(",")[1],
        fps: fps,
        frames: frames
      };
      this.runtime.listener.postRequest(msg, (function(_this) {
        return function(result) {
          return _this.callback(callback, result.content, res, result.error);
        };
      })(this));
    } else {
      this.callback(callback, 0, res, "Incorrect object type, expected Image or Sprite");
    }
    return res;
  };

  ProjectInterface.prototype.writeMapFile = function(obj, path, options, callback) {
    var msg, res;
    res = {
      ready: 0
    };
    if (obj instanceof MicroMap) {
      msg = {
        name: "write_project_file",
        path: path,
        content: SaveMap(obj)
      };
      this.runtime.listener.postRequest(msg, (function(_this) {
        return function(result) {
          return _this.callback(callback, result.content, res, result.error);
        };
      })(this));
    } else {
      this.callback(callback, 0, res, "Incorrect object type, expected Map");
    }
    return res;
  };

  ProjectInterface.prototype.writeSoundFile = function(obj, path, options, callback) {
    var res;
    res = {
      ready: 0
    };
    if (obj instanceof MicroSound) {
      loadWaveFileLib((function(_this) {
        return function() {
          var buffer, ch, ch1, ch2, encoded, i, j, k, msg, ref, ref1, wav;
          wav = new wavefile.WaveFile;
          ch1 = [];
          for (i = j = 0, ref = obj.length - 1; j <= ref; i = j += 1) {
            ch1[i] = Math.round(Math.min(1, Math.max(-1, obj.read(0, i))) * 32767);
          }
          if (obj.channels === 2) {
            ch2 = [];
            for (i = k = 0, ref1 = obj.length - 1; k <= ref1; i = k += 1) {
              ch2[i] = Math.round(Math.min(1, Math.max(-1, obj.read(1, i))) * 32767);
            }
            ch = [ch1, ch2];
          } else {
            ch = [ch1];
          }
          wav.fromScratch(ch.length, obj.sampleRate, '16', ch);
          buffer = wav.toBuffer();
          encoded = arrayBufferToBase64(buffer);
          msg = {
            name: "write_project_file",
            path: path,
            content: encoded
          };
          return _this.runtime.listener.postRequest(msg, function(result) {
            return _this.callback(callback, result.content, res, result.error);
          });
        };
      })(this));
    } else {
      this.callback(callback, 0, res, "Incorrect object type, expected Sound");
    }
    return res;
  };

  ProjectInterface.prototype.writeMusicFile = function(obj, path, options, callback) {
    var res;
    res = {
      ready: 0
    };
    if (obj instanceof MicroSound) {
      loadLameJSLib((function(_this) {
        return function() {
          var blob, fr, i, index, j, k, kbps, l, m, mp3Data, mp3buf, mp3encoder, ref, ref1, ref2, ref3, ref4, ref5, sampleBlockSize, samples, samplesR, toindex;
          kbps = 128;
          mp3encoder = new lamejs.Mp3Encoder(obj.channels, obj.sampleRate, kbps);
          index = 0;
          sampleBlockSize = 1152;
          samples = new Int16Array(sampleBlockSize);
          samplesR = new Int16Array(sampleBlockSize);
          mp3Data = [];
          while (index < obj.length) {
            toindex = Math.min(sampleBlockSize - 1, obj.length - index - 1);
            for (i = j = 0, ref = toindex; j <= ref; i = j += 1) {
              samples[i] = Math.round(32767 * Math.max(-1, Math.min(1, obj.read(0, index + i))));
            }
            if (obj.channels === 2) {
              for (i = k = 0, ref1 = toindex; k <= ref1; i = k += 1) {
                samplesR[i] = Math.round(32767 * Math.max(-1, Math.min(1, obj.read(1, index + i))));
              }
            }
            for (i = l = ref2 = toindex + 1, ref3 = sampleBlockSize - 1; l <= ref3; i = l += 1) {
              samples[i] = 0;
            }
            if (obj.channels === 2) {
              for (i = m = ref4 = toindex + 1, ref5 = sampleBlockSize - 1; m <= ref5; i = m += 1) {
                samplesR[i] = 0;
              }
            }
            index += sampleBlockSize;
            if (obj.channels === 2) {
              mp3buf = mp3encoder.encodeBuffer(samples, samplesR);
            } else {
              mp3buf = mp3encoder.encodeBuffer(samples);
            }
            if (mp3buf.length > 0) {
              mp3Data.push(mp3buf);
            }
          }
          mp3buf = mp3encoder.flush();
          if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
          }
          blob = new Blob(mp3Data, {
            type: 'audio/mp3'
          });
          fr = new FileReader();
          fr.onload = function(e) {
            var msg;
            msg = {
              name: "write_project_file",
              path: path,
              content: fr.result.split(",")[1]
            };
            return _this.runtime.listener.postRequest(msg, function(result) {
              return _this.callback(callback, result.content, res, result.error);
            });
          };
          return fr.readAsDataURL(blob);
        };
      })(this));
    } else {
      this.callback(callback, 0, res, "Incorrect object type, expected Sound");
    }
    return res;
  };

  ProjectInterface.prototype.writeAssetFile = function(obj, path, options, callback) {
    var ext, mime, msg, ref, ref1, res;
    res = {
      ready: 0
    };
    if (obj instanceof msImage || obj instanceof Sprite) {
      if (obj instanceof Sprite) {
        obj = obj.frames[0];
      }
      if ((ref = options.ext) === "jpg" || ref === "png") {
        ext = options.ext;
      } else {
        ext = "png";
      }
      mime = ext === "jpg" ? "image/jpeg" : "image/png";
      msg = {
        name: "write_project_file",
        path: path,
        content: obj.canvas.toDataURL(mime),
        ext: ext
      };
      this.runtime.listener.postRequest(msg, (function(_this) {
        return function(result) {
          return _this.callback(callback, result.content, res, result.error);
        };
      })(this));
    } else if (typeof obj === "string") {
      if ((ref1 = options.ext) === "txt" || ref1 === "csv" || ref1 === "obj") {
        ext = options.ext;
      } else {
        ext = "txt";
      }
      msg = {
        name: "write_project_file",
        path: path,
        content: obj,
        ext: ext
      };
      this.runtime.listener.postRequest(msg, (function(_this) {
        return function(result) {
          return _this.callback(callback, result.content, res, result.error);
        };
      })(this));
    } else if (typeof obj === "object") {
      obj = this.runtime.vm.storableObject(obj);
      msg = {
        name: "write_project_file",
        path: path,
        content: obj,
        ext: "json"
      };
      this.runtime.listener.postRequest(msg, (function(_this) {
        return function(result) {
          return _this.callback(callback, result.content, res, result.error);
        };
      })(this));
    } else {
      this.callback(callback, 0, res, "Unrecognized object type");
    }
    return res;
  };

  ProjectInterface.prototype.listFiles = function(path, callback) {
    var msg, res;
    msg = {
      name: "list_project_files",
      path: path
    };
    res = {
      ready: 0
    };
    this.runtime.listener.postRequest(msg, function(result) {
      res.ready = 1;
      if (result.list) {
        res.list = result.list;
      }
      if (result.error) {
        res.error = result.error;
      }
      return callback(result.list, result.error);
    });
    return res;
  };

  ProjectInterface.prototype.readFile = function(path, callback) {
    var kind, msg, res;
    msg = {
      name: "read_project_file",
      path: path
    };
    res = {
      ready: 0
    };
    kind = path.split("/")[0];
    this.runtime.listener.postRequest(msg, (function(_this) {
      return function(result) {
        var img, map, s;
        res.ready = 1;
        if (result.error) {
          res.error = result.error;
          if (typeof callback === "function") {
            return callback(0, result.error);
          }
        } else {
          switch (kind) {
            case "sprites":
              s = LoadSprite(result.content.data, {
                fps: result.content.fps,
                frames: result.content.frames
              }, function() {
                res.result = s;
                if (typeof callback === "function") {
                  return callback(res.result, 0);
                }
              });
              break;
            case "maps":
              map = new MicroMap(1, 1, 1, 1);
              UpdateMap(map, result.content);
              res.result = map;
              if (typeof callback === "function") {
                callback(res.result, 0);
              }
              break;
            case "sounds":
            case "music":
              s = new Sound(_this.runtime.audio, result.content);
              res.result = s;
              if (typeof callback === "function") {
                callback(s, 0);
              }
              break;
            case "assets":
              switch (result.content.type) {
                case "text":
                  res.result = result.content.data;
                  callback(res.result, 0);
                  break;
                case "json":
                  res.result = result.content.data;
                  callback(res.result, 0);
                  break;
                case "image":
                  img = new Image;
                  img.src = result.content.data;
                  img.onload = function() {
                    var image;
                    image = new msImage(img);
                    res.result = image;
                    return callback(res.result, 0);
                  };
              }
              break;
            default:
              res.result = result.content.toString();
              if (typeof callback === "function") {
                return callback(res.result, 0);
              }
          }
        }
      };
    })(this));
    return res;
  };

  ProjectInterface.prototype.deleteFile = function(path, callback) {};

  return ProjectInterface;

})();
