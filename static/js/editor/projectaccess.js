this.ProjectAccess = (function() {
  function ProjectAccess(app, directory, listener) {
    this.app = app;
    this.directory = directory != null ? directory : null;
    this.listener = listener;
  }

  ProjectAccess.prototype.fixPath = function(path) {
    var d, i, j, k, len, n, p, ref;
    if (!this.directory) {
      return path;
    } else {
      p = path.split("/");
      d = this.directory.split("/");
      for (i = j = 0, len = d.length; j < len; i = ++j) {
        n = d[i];
        p.splice(i + 1, 0, n);
      }
      for (i = k = 0, ref = p.length - 1; k <= ref; i = k += 1) {
        p[i] = RegexLib.fixFilename(p[i]);
      }
      return p.join("/");
    }
  };

  ProjectAccess.prototype.setFolder = function(directory) {
    this.directory = directory;
  };

  ProjectAccess.prototype.messageReceived = function(msg) {
    switch (msg.name) {
      case "write_project_file":
        return this.writeProjectFile(msg);
      case "list_project_files":
        return this.listProjectFiles(msg);
      case "read_project_file":
        return this.readProjectFile(msg);
      case "delete_project_file":
        return this.deleteProjectFile(msg);
    }
  };

  ProjectAccess.prototype.fileEntry = function(folder, asset) {
    var path;
    path = folder + "/" + (asset.name.replace(/-/g, "/"));
    if (this.directory) {
      path = path.replace("/" + this.directory, "");
    }
    return {
      name: asset.shortname,
      path: path,
      ext: asset.ext,
      size: asset.size
    };
  };

  ProjectAccess.prototype.listProjectFiles = function(msg) {
    var filter, kind, list, path;
    path = this.fixPath(msg.path);
    path = path.split("/");
    kind = path[0];
    path.splice(0, 1);
    path = path.join("-");
    filter = (function(_this) {
      return function(source) {
        var j, len, list, s;
        list = [];
        for (j = 0, len = source.length; j < len; j++) {
          s = source[j];
          if (s.name.startsWith(path)) {
            list.push(_this.fileEntry(kind, s));
          }
        }
        return list;
      };
    })(this);
    switch (kind) {
      case "source":
        list = filter(this.app.project.source_list);
        break;
      case "sprites":
        list = filter(this.app.project.sprite_list);
        break;
      case "maps":
        list = filter(this.app.project.map_list);
        break;
      case "sounds":
        list = filter(this.app.project.sound_list);
        break;
      case "music":
        list = filter(this.app.project.music_list);
        break;
      case "assets":
        list = filter(this.app.project.asset_list);
        break;
      default:
        this.listener.postMessage({
          name: "list_project_files",
          request_id: msg.request_id,
          error: "Folder does not exist: " + kind
        });
        return;
    }
    return this.listener.postMessage({
      name: "list_project_files",
      list: list,
      request_id: msg.request_id
    });
  };

  ProjectAccess.prototype.readProjectFile = function(msg) {
    var asset, content, data, kind, map, music, path, ref, ref1, sound, source, sprite;
    path = this.fixPath(msg.path);
    path = path.split("/");
    kind = path[0];
    switch (kind) {
      case "source":
        path.splice(0, 1);
        path = path.join("-");
        source = this.app.project.getSource(path);
        if (source != null) {
          content = source.content;
        }
        break;
      case "sprites":
        path.splice(0, 1);
        path = path.join("-");
        sprite = this.app.project.getSprite(path);
        if (sprite != null) {
          data = sprite.saveData();
          content = {
            data: data,
            fps: sprite.fps,
            frames: sprite.frames.length
          };
        }
        break;
      case "sounds":
        path.splice(0, 1);
        path = path.join("-");
        sound = this.app.project.getSound(path);
        if (sound != null) {
          fetch(sound.getURL()).then((function(_this) {
            return function(result) {
              return result.blob().then(function(blob) {
                var fr;
                fr = new FileReader();
                fr.onload = function(e) {
                  return _this.listener.postMessage({
                    name: "read_project_file",
                    request_id: msg.request_id,
                    content: fr.result
                  });
                };
                return fr.readAsDataURL(blob);
              });
            };
          })(this));
        }
        return;
      case "maps":
        path.splice(0, 1);
        path = path.join("-");
        map = this.app.project.getMap(path);
        if (map != null) {
          content = map.save();
        }
        break;
      case "music":
        path.splice(0, 1);
        path = path.join("-");
        music = this.app.project.getMusic(path);
        if (music != null) {
          fetch(music.getURL()).then((function(_this) {
            return function(result) {
              return result.blob().then(function(blob) {
                var fr;
                fr = new FileReader();
                fr.onload = function(e) {
                  return _this.listener.postMessage({
                    name: "read_project_file",
                    request_id: msg.request_id,
                    content: fr.result
                  });
                };
                return fr.readAsDataURL(blob);
              });
            };
          })(this));
        }
        return;
      case "assets":
        path.splice(0, 1);
        path = path.join("-");
        asset = this.app.project.getAsset(path);
        if (asset != null) {
          if ((ref = asset.ext) === "txt" || ref === "csv" || ref === "obj") {
            fetch(asset.getURL()).then((function(_this) {
              return function(result) {
                return result.text().then(function(text) {
                  return _this.listener.postMessage({
                    name: "read_project_file",
                    request_id: msg.request_id,
                    content: {
                      data: text,
                      type: "text"
                    }
                  });
                });
              };
            })(this));
          } else if (asset.ext === "json") {
            fetch(asset.getURL()).then((function(_this) {
              return function(result) {
                return result.json().then(function(json) {
                  return _this.listener.postMessage({
                    name: "read_project_file",
                    request_id: msg.request_id,
                    content: {
                      data: json,
                      type: "json"
                    }
                  });
                });
              };
            })(this));
          } else if ((ref1 = asset.ext) === "png" || ref1 === "jpg") {
            fetch(asset.getURL()).then((function(_this) {
              return function(result) {
                return result.blob().then(function(blob) {
                  var fr;
                  fr = new FileReader();
                  fr.onload = function(r) {
                    return _this.listener.postMessage({
                      name: "read_project_file",
                      request_id: msg.request_id,
                      content: {
                        data: fr.result,
                        type: "image"
                      }
                    });
                  };
                  return fr.readAsDataURL(blob);
                });
              };
            })(this));
          }
        }
        return;
      default:
        this.listener.postMessage({
          name: "read_project_file",
          request_id: msg.request_id,
          error: "Folder does not exist: " + kind
        });
    }
    if (content != null) {
      return this.listener.postMessage({
        name: "read_project_file",
        request_id: msg.request_id,
        content: content
      });
    } else {
      return this.listener.postMessage({
        name: "read_project_file",
        request_id: msg.request_id,
        error: "File Not Found"
      });
    }
  };

  ProjectAccess.prototype.projectFileExists = function(path) {
    var kind;
    path = path.split("/");
    kind = path[0];
    path.splice(0, 1);
    path = path.join("-");
    switch (kind) {
      case "source":
        return this.app.project.source_table[path];
      case "sprites":
        return this.app.project.sprite_table[path];
      case "maps":
        return this.app.project.map_table[path];
      case "sounds":
        return this.app.project.sound_table[path];
      case "music":
        return this.app.project.music_table[path];
      case "assets":
        return this.app.project.asset_table[path];
    }
    return false;
  };

  ProjectAccess.prototype.writeProjectFile = function(msg) {
    var base, count, kind, name, path;
    path = this.fixPath(msg.path);
    path = path.split("/");
    kind = path[0];
    if (!(msg.options && msg.options.replace)) {
      base = path.join("/");
      name = base;
      count = 2;
      while (this.projectFileExists(name)) {
        name = base + count++;
      }
      path = name.split("/");
    }
    switch (kind) {
      case "source":
        path.splice(0, 1);
        path = "ms/" + path.join("/");
        this.app.project.writeFile(path, msg.content);
        break;
      case "sprites":
        path.splice(0, 1);
        path = "sprites/" + path.join("/");
        this.app.project.writeFile(path, msg.content, {
          frames: msg.frames,
          fps: msg.fps
        });
        break;
      case "maps":
        path.splice(0, 1);
        path = "maps/" + path.join("/");
        this.app.project.writeFile(path, msg.content);
        break;
      case "sounds":
        path.splice(0, 1);
        path = "sounds/" + path.join("/");
        this.app.project.writeFile(path, msg.content);
        break;
      case "music":
        path.splice(0, 1);
        path = "music/" + path.join("/");
        this.app.project.writeFile(path, msg.content);
        break;
      case "assets":
        path.splice(0, 1);
        path = "assets/" + path.join("/");
        this.app.project.writeFile(path, msg.content, {
          ext: msg.ext
        });
        break;
      default:
        this.listener.postMessage({
          name: "write_project_file",
          request_id: msg.request_id,
          error: "Folder does not exist: " + kind
        });
        return;
    }
    return this.listener.postMessage({
      name: "write_project_file",
      request_id: msg.request_id,
      content: "success"
    });
  };

  ProjectAccess.prototype.deleteProjectFile = function(msg) {
    var asset, deleteFile, error, kind, map, music, path, sound, source, sprite;
    path = this.fixPath(msg.path);
    path = path.split("/");
    kind = path[0];
    path.splice(0, 1);
    path = path.join("-");
    deleteFile = (function(_this) {
      return function(path, thumbnail, callback) {
        return _this.app.client.sendRequest({
          name: "delete_project_file",
          project: _this.app.project.id,
          file: path,
          thumbnail: thumbnail
        }, function(response) {
          callback();
          return _this.listener.postMessage({
            name: "delete_project_file",
            request_id: msg.request_id,
            content: "success"
          });
        });
      };
    })(this);
    error = (function(_this) {
      return function(text) {
        return _this.listener.postMessage({
          name: "delete_project_file",
          request_id: msg.request_id,
          error: text
        });
      };
    })(this);
    switch (kind) {
      case "source":
        source = this.app.project.getSource(path);
        if (source != null) {
          return deleteFile(source.file, false, (function(_this) {
            return function() {
              return _this.app.project.updateSourceList();
            };
          })(this));
        } else {
          return error("File Not Found");
        }
        break;
      case "sprites":
        sprite = this.app.project.getSprite(path);
        if ((sprite != null) && path !== "icon") {
          return deleteFile(sprite.file, false, (function(_this) {
            return function() {
              return _this.app.project.updateSpriteList();
            };
          })(this));
        } else {
          return error("File Not Found");
        }
        break;
      case "maps":
        map = this.app.project.getMap(path);
        if (map != null) {
          return deleteFile(map.file, false, (function(_this) {
            return function() {
              return _this.app.project.updateMapList();
            };
          })(this));
        } else {
          return error("File Not Found");
        }
        break;
      case "sounds":
        sound = this.app.project.getSound(path);
        if (sound != null) {
          return deleteFile(sound.file, true, (function(_this) {
            return function() {
              return _this.app.project.updateSoundList();
            };
          })(this));
        } else {
          return error("File Not Found");
        }
        break;
      case "music":
        music = this.app.project.getMusic(path);
        if (music != null) {
          return deleteFile(music.file, true, (function(_this) {
            return function() {
              return _this.app.project.updateMusicList();
            };
          })(this));
        } else {
          return error("File Not Found");
        }
        break;
      case "assets":
        asset = this.app.project.getAsset(path);
        if (asset != null) {
          return deleteFile(asset.file, true, (function(_this) {
            return function() {
              return _this.app.project.updateAssetList();
            };
          })(this));
        } else {
          return error("File Not Found");
        }
    }
  };

  return ProjectAccess;

})();
