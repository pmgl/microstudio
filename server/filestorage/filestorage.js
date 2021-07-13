var JobQueue, fs, getDirName;

fs = require("fs");

getDirName = require('path').dirname;

JobQueue = require(__dirname + "/../app/jobqueue.js");

this.FileStorage = (function() {
  function FileStorage(folder1) {
    this.folder = folder1 != null ? folder1 : "../files";
    if (!fs.existsSync(this.folder)) {
      fs.mkdir(this.folder, (function(_this) {
        return function() {};
      })(this));
    }
  }

  FileStorage.prototype.list = function(file, callback) {
    var f;
    file = this.sanitize(file);
    f = this.folder + ("/" + file);
    return fs.readdir(f, (function(_this) {
      return function(err, files) {
        return callback(files);
      };
    })(this));
  };

  FileStorage.prototype.write = function(file, content, callback) {
    file = this.sanitize(file);
    return this.mkdirs(getDirName(file), (function(_this) {
      return function() {
        var f;
        f = _this.folder + ("/" + file);
        return fs.writeFile(f, content, function() {
          if (callback != null) {
            return callback();
          }
        });
      };
    })(this));
  };

  FileStorage.prototype["delete"] = function(file, callback) {
    var f;
    file = this.sanitize(file);
    f = this.folder + ("/" + file);
    return fs.unlink(f, (function(_this) {
      return function() {
        if (callback != null) {
          return callback();
        }
      };
    })(this));
  };

  FileStorage.prototype.deleteFolder = function(srcfile, callback) {
    var addFile, file, queue;
    file = this.sanitize(srcfile);
    queue = new JobQueue();
    queue.conclude = (function(_this) {
      return function() {
        return fs.rmdir(_this.folder + "/" + file, function(err) {
          if (callback != null) {
            return callback();
          }
        });
      };
    })(this);
    addFile = (function(_this) {
      return function(f) {
        return queue.add(function() {
          return fs.lstat(_this.folder + "/" + file + "/" + f, function(err, stats) {
            if (err != null) {
              return queue.next();
            } else if (stats.isDirectory()) {
              return _this.deleteFolder(srcfile + "/" + f, function() {
                return queue.next();
              });
            } else {
              return _this["delete"](srcfile + "/" + f, function() {
                return queue.next();
              });
            }
          });
        });
      };
    })(this);
    queue.add((function(_this) {
      return function() {
        return fs.readdir(_this.folder + "/" + file, function(err, files) {
          var f, j, len;
          if (files != null) {
            for (j = 0, len = files.length; j < len; j++) {
              f = files[j];
              addFile(f);
            }
          }
          return queue.next();
        });
      };
    })(this));
    return queue.start();
  };

  FileStorage.prototype.mkdirs = function(folder, callback) {
    var f;
    f = this.folder + ("/" + folder);
    fs.stat(f, (function(_this) {
      return function(err, stat) {
        if (err != null) {
          if (folder.indexOf("/") > 0) {
            return _this.mkdirs(getDirName(folder), function() {
              return fs.mkdir(f, function() {
                return callback();
              });
            });
          } else {
            return fs.mkdir(f, function() {
              return callback();
            });
          }
        } else {
          return callback();
        }
      };
    })(this));
  };

  FileStorage.prototype.sanitize = function(file) {
    var d1, d2, d3, i, j, ref, s;
    s = file.split("/");
    for (i = j = ref = s.length - 1; j >= 0; i = j += -1) {
      if (s[i].indexOf("..") >= 0 || s[i] === "") {
        s.splice(i, 1);
      }
    }
    d1 = Math.floor(s[0] / 10000);
    d2 = Math.floor(s[0] / 100) % 100;
    d3 = s[0] % 100;
    s[0] = d3;
    s.splice(0, 0, d2);
    s.splice(0, 0, d1);
    return s.join("/");
  };

  FileStorage.prototype.read = function(file, encoding, callback) {
    var f;
    file = this.sanitize(file);
    f = this.folder + ("/" + file);
    return fs.readFile(f, (function(_this) {
      return function(err, data) {
        if ((data != null) && (err == null)) {
          switch (encoding) {
            case "base64":
              return callback(data.toString("base64"));
            case "binary":
              return callback(data);
            default:
              return callback(data.toString("utf8"));
          }
        } else {
          return callback(null);
        }
      };
    })(this));
  };

  FileStorage.prototype.copyFile = function(path, file, callback) {
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

  FileStorage.prototype.copy = function(source, dest, callback) {
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

  return FileStorage;

})();

module.exports = this.FileStorage;
