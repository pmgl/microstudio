var Converter, FileStorage, FolderManager, JobQueue, fs, getDirName, shajs;

fs = require("fs");

getDirName = require('path').dirname;

JobQueue = require(__dirname + "/../app/jobqueue.js");

FileStorage = require(__dirname + "/filestorage.js");

shajs = require("sha.js");

Converter = require(__dirname + "/converter.js");

FolderManager = (function() {
  function FolderManager(storage, folder1) {
    this.storage = storage;
    this.folder = folder1;
    this.files = {};
    this.pending = [];
    this.loaded = false;
    this.load();
  }

  FolderManager.prototype.load = function() {
    return this.storage.filestorage.read(this.folder + "/links.txt", null, (function(_this) {
      return function(data) {
        var f, j, len, line, list;
        if (data != null) {
          list = data.split("\n");
          for (j = 0, len = list.length; j < len; j++) {
            line = list[j];
            line = line.split("=");
            if (line.length > 1) {
              _this.files[line[1]] = line[0];
            }
          }
        }
        _this.loaded = true;
        while (_this.pending.length > 0) {
          f = _this.pending.splice(0, 1)[0];
          f();
        }
      };
    })(this));
  };

  FolderManager.prototype.hash = function(content) {
    var hash, t;
    if (typeof content === "string") {
      return new shajs.sha256().update(content).digest('hex');
    } else {
      t = Date.now();
      hash = new shajs.sha256().update(content).digest('hex');
      console.info("shajs took " + (Date.now() - t) + " ms");
      return hash;
    }
  };

  FolderManager.prototype.write = function(path, content, callback) {
    var h, hash, old, p;
    if (!this.loaded) {
      this.pending.push((function(_this) {
        return function() {
          return _this.write(path, content, callback);
        };
      })(this));
      return;
    }
    hash = this.hash(content);
    console.info("hash = " + hash);
    console.info(this.folder + "/" + path);
    h = this.files[path];
    if ((h != null) && this.storage.unique[h]) {
      old = "hs/" + (h.substring(0, 2)) + "/" + (h.substring(2, 4)) + "/" + h;
      this.storage.filestorage["delete"](old, function() {});
    }
    this.files[path] = hash;
    this.save();
    p = "hs/" + (hash.substring(0, 2)) + "/" + (hash.substring(2, 4)) + "/" + hash;
    return fs.stat(this.storage.folder + "/" + p, (function(_this) {
      return function(err, stat) {
        if (err != null) {
          _this.storage.unique[hash] = true;
          return _this.storage.filestorage.write(p, content, callback);
        } else {
          delete _this.storage.unique[hash];
          return callback();
        }
      };
    })(this));
  };

  FolderManager.prototype["delete"] = function(path, callback) {
    var hash, p;
    if (!this.loaded) {
      this.pending.push((function(_this) {
        return function() {
          return _this["delete"](path, callback);
        };
      })(this));
      return;
    }
    hash = this.files[path];
    if (hash != null) {
      delete this.files[path];
      this.save();
      callback();
      if (this.storage.unique[hash]) {
        delete this.storage.unique[hash];
        p = "hs/" + (hash.substring(0, 2)) + "/" + (hash.substring(2, 4)) + "/" + hash;
        return this.storage.filestorage["delete"](p, function() {});
      }
    } else {
      return this.storage.filestorage["delete"](this.folder + "/" + path, callback);
    }
  };

  FolderManager.prototype.read = function(path, encoding, callback) {
    var hash, p;
    if (!this.loaded) {
      this.pending.push((function(_this) {
        return function() {
          return _this.read(path, encoding, callback);
        };
      })(this));
      return;
    }
    hash = this.files[path];
    if (hash != null) {
      p = "hs/" + (hash.substring(0, 2)) + "/" + (hash.substring(2, 4)) + "/" + hash;
      return this.storage.filestorage.read(p, encoding, callback);
    } else {
      return this.storage.filestorage.read(this.folder + "/" + path, encoding, callback);
    }
  };

  FolderManager.prototype.list = function(path, callback) {
    if (!this.loaded) {
      this.pending.push((function(_this) {
        return function() {
          return _this.list(path, callback);
        };
      })(this));
      return;
    }
    return this.storage.filestorage.list(this.folder + "/" + path, (function(_this) {
      return function(list) {
        var file, folder, i, key, ref, value;
        list = list || [];
        ref = _this.files;
        for (key in ref) {
          value = ref[key];
          i = key.lastIndexOf("/");
          if (i >= 0) {
            folder = key.substring(0, i);
            file = key.substring(i + 1);
          }
          if (folder === path) {
            list.push(file);
          }
        }
        return callback(list);
      };
    })(this));
  };

  FolderManager.prototype.save = function() {
    if (this.save_timeout) {
      clearTimeout(this.save_timeout);
    }
    return this.save_timeout = setTimeout(((function(_this) {
      return function() {
        return _this.doSave();
      };
    })(this)), 1000);
  };

  FolderManager.prototype.doSave = function() {
    var key, ref, res, value;
    res = [];
    ref = this.files;
    for (key in ref) {
      value = ref[key];
      res.push(value + "=" + key);
    }
    return this.storage.filestorage.write(this.folder + "/links.txt", res.join("\n"), (function(_this) {
      return function(data) {};
    })(this));
  };

  return FolderManager;

})();

this.HashedStorage = (function() {
  function HashedStorage(folder1) {
    this.folder = folder1 != null ? folder1 : "../files";
    this.filestorage = new FileStorage(this.folder);
    this.folders = {};
    this.unique = {};
    this.converter = new Converter(this);
  }

  HashedStorage.prototype.list = function(file, callback) {
    var f, folder, path;
    f = file.split("/");
    if (f.length > 2) {
      folder = f.slice(0, 2).join("/");
      path = f.slice(2, f.length).join("/");
      console.info("folder = " + folder);
      console.info("path = " + path);
      return this.getFolderManager(folder).list(path, callback);
    } else {
      return this.filestorage.list(file, callback);
    }
  };

  HashedStorage.prototype.getFolderManager = function(folder) {
    var folder_manager;
    folder_manager = this.folders[folder];
    if (folder_manager == null) {
      folder_manager = this.folders[folder] = new FolderManager(this, folder);
    }
    return folder_manager;
  };

  HashedStorage.prototype.write = function(file, content, callback) {
    var f, folder, path;
    f = file.split("/");
    if (f.length > 2) {
      folder = f.slice(0, 2).join("/");
      path = f.slice(2, f.length).join("/");
      console.info("folder = " + folder);
      console.info("path = " + path);
      return this.getFolderManager(folder).write(path, content, callback);
    } else {
      return this.filestorage.write(file, content, callback);
    }
  };

  HashedStorage.prototype["delete"] = function(file, callback) {
    var f, folder, path;
    f = file.split("/");
    if (f.length > 2) {
      folder = f.slice(0, 2).join("/");
      path = f.slice(2, f.length).join("/");
      console.info("folder = " + folder);
      console.info("path = " + path);
      return this.getFolderManager(folder)["delete"](path, callback);
    } else {
      return this.filestorage["delete"](file, callback);
    }
  };

  HashedStorage.prototype.deleteFolder = function(srcfile, callback) {
    return this.filestorage.deleteFolder(srcfile, callback);
  };

  HashedStorage.prototype.read = function(file, encoding, callback) {
    var f, folder, path;
    f = file.split("/");
    if (f.length > 2) {
      folder = f.slice(0, 2).join("/");
      path = f.slice(2, f.length).join("/");
      console.info("folder = " + folder);
      console.info("path = " + path);
      return this.getFolderManager(folder).read(path, encoding, callback);
    } else {
      return this.filestorage.read(file, encoding, callback);
    }
  };

  HashedStorage.prototype.copyFile = function(path, file, callback) {
    return fs.readFile(path, (function(_this) {
      return function(err, data) {
        if ((data != null) && (err == null)) {
          return _this.write(file, data, callback);
        } else {
          return console.info(err);
        }
      };
    })(this));
  };

  HashedStorage.prototype.copy = function(source, dest, callback) {
    return this.read(source, "binary", (function(_this) {
      return function(data) {
        return _this.write(dest, data, function() {
          if (callback != null) {
            return callback();
          }
        });
      };
    })(this));
  };

  return HashedStorage;

})();

module.exports = this.HashedStorage;
