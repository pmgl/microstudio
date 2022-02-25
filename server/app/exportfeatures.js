var JSZip, Jimp, JobQueue, fs, pug;

fs = require("fs");

Jimp = require("jimp");

JSZip = require("jszip");

pug = require("pug");

JobQueue = require(__dirname + "/jobqueue.js");

this.ExportFeatures = (function() {
  function ExportFeatures(webapp) {
    this.webapp = webapp;
    this.addSpritesExport();
    this.addPublishHTML();
    this.addProjectFilesExport();
  }

  ExportFeatures.prototype.addProjectFilesExport = function() {
    return this.webapp.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+\/([^\/\|\?\&\.]+\/)?export\/project\/$/, (function(_this) {
      return function(req, res) {
        var access, f, fn, folders, j, len, manager, project, projectInfo, queue, user, zip;
        access = _this.webapp.getProjectAccess(req, res);
        if (access == null) {
          return;
        }
        user = access.user;
        project = access.project;
        manager = _this.webapp.getProjectManager(project);
        folders = _this.getFoldersWithTypes();
        projectInfo = _this.prepareExportProjectInfo(project);
        zip = new JSZip;
        queue = new JobQueue(function() {
          return zip.generateAsync({
            type: "nodebuffer"
          }).then(function(content) {
            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", "attachement; filename=\"" + project.slug + "_archive.zip\"");
            return res.send(content);
          });
        });
        zip.file("project.json", JSON.stringify(projectInfo));
        fn = function(f) {
          return _this.enqueueFolderZipping(zip, queue, manager, user, project, f.name, f.fileType);
        };
        for (j = 0, len = folders.length; j < len; j++) {
          f = folders[j];
          fn(f);
        }
        return queue.start();
      };
    })(this));
  };

  ExportFeatures.prototype.enqueueFolderZipping = function(zip, queue, manager, user, project, folder, fileType) {
    return queue.add((function(_this) {
      return function() {
        return manager.listFiles(folder, function(files) {
          var f, fn, j, len;
          fn = function(f) {
            return queue.add(function() {
              return _this.webapp.server.content.files.read(user.id + "/" + project.id + "/" + folder + "/" + f.file, fileType, function(content) {
                var name;
                if (content != null) {
                  name = f.file.replace(/-/g, "/");
                  if (name.endsWith(".ms")) {
                    switch (project.language) {
                      case "javascript":
                        name = name.replace(".ms", ".js");
                        break;
                      case "python":
                        name = name.replace(".ms", ".py");
                        break;
                      case "lua":
                        name = name.replace(".ms", ".lua");
                    }
                  }
                  zip.folder(folder).file(name, content);
                }
                return queue.next();
              });
            });
          };
          for (j = 0, len = files.length; j < len; j++) {
            f = files[j];
            fn(f);
          }
          return queue.next();
        });
      };
    })(this));
  };

  ExportFeatures.prototype.getFoldersWithTypes = function() {
    var folders;
    return folders = [
      {
        name: "sprites",
        fileType: "binary"
      }, {
        name: "ms",
        fileType: "text"
      }, {
        name: "doc",
        fileType: "text"
      }, {
        name: "maps",
        fileType: "text"
      }, {
        name: "sounds",
        fileType: "binary"
      }, {
        name: "sounds_th",
        fileType: "binary"
      }, {
        name: "music",
        fileType: "binary"
      }, {
        name: "music_th",
        fileType: "binary"
      }, {
        name: "assets",
        fileType: "binary"
      }
    ];
  };

  ExportFeatures.prototype.prepareExportProjectInfo = function(project) {
    return {
      owner: project.owner.nick,
      title: project.title,
      slug: project.slug,
      tags: project.tags,
      orientation: project.orientation,
      aspect: project.aspect,
      platforms: project.platforms,
      controls: project.controls,
      type: project.type,
      language: project.language,
      graphics: project.graphics,
      libs: project.libs,
      tabs: project.tabs,
      date_created: project.date_created,
      last_modified: project.last_modified,
      first_published: project.first_published,
      files: project.files
    };
  };

  ExportFeatures.prototype.addSpritesExport = function() {
    return this.webapp.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+\/([^\/\|\?\&\.]+\/)?export\/sprites\/$/, (function(_this) {
      return function(req, res) {
        var access, manager, project, queue, user, zip;
        access = _this.webapp.getProjectAccess(req, res);
        if (access == null) {
          return;
        }
        user = access.user;
        project = access.project;
        manager = _this.webapp.getProjectManager(project);
        zip = new JSZip;
        queue = new JobQueue(function() {
          return zip.generateAsync({
            type: "nodebuffer"
          }).then(function(content) {
            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", "attachement; filename=\"" + project.slug + "_sprites.zip\"");
            return res.send(content);
          });
        });
        queue.add(function() {
          return manager.listFiles("sprites", function(sprites) {
            var fn, j, len, s;
            fn = function(s) {
              return queue.add(function() {
                return _this.webapp.server.content.files.read(user.id + "/" + project.id + "/sprites/" + s.file, "binary", function(content) {
                  if (content != null) {
                    zip.file(s.file, content);
                  }
                  return queue.next();
                });
              });
            };
            for (j = 0, len = sprites.length; j < len; j++) {
              s = sprites[j];
              fn(s);
            }
            return queue.next();
          });
        });
        queue.add(function() {
          return manager.listFiles("doc", function(docs) {
            var doc, fn, j, len;
            fn = function(doc) {
              return queue.add(function() {
                return _this.webapp.server.content.files.read(user.id + "/" + project.id + "/doc/" + doc.file, "text", function(content) {
                  if (content != null) {
                    zip.file(doc.file, content);
                  }
                  return queue.next();
                });
              });
            };
            for (j = 0, len = docs.length; j < len; j++) {
              doc = docs[j];
              fn(doc);
            }
            return queue.next();
          });
        });
        return queue.start();
      };
    })(this));
  };

  ExportFeatures.prototype.addPublishHTML = function() {
    return this.webapp.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+\/([^\/\|\?\&\.]+\/)?publish\/html\/$/, (function(_this) {
      return function(req, res) {
        var access, assets, fn, fonts, fullsource, g, i, images, j, k, l, len, len1, len2, len3, lib, libs, manager, maps_dict, music_list, n, optlib, proglang, project, queue, ref, ref1, ref2, s, sounds_list, user, zip;
        access = _this.webapp.getProjectAccess(req, res);
        if (access == null) {
          return;
        }
        user = access.user;
        project = access.project;
        manager = _this.webapp.getProjectManager(project);
        zip = new JSZip;
        maps_dict = {};
        images = [];
        assets = [];
        fonts = [];
        sounds_list = [];
        music_list = [];
        fullsource = "\n\n";
        libs = [];
        if ((project.graphics != null) && typeof project.graphics === "string") {
          g = project.graphics.toLowerCase();
          if (_this.webapp.concatenator.alt_players[g] != null) {
            libs = [].concat(_this.webapp.concatenator.alt_players[g].lib_path);
          }
        }
        ref = project.libs;
        for (j = 0, len = ref.length; j < len; j++) {
          optlib = ref[j];
          lib = _this.webapp.concatenator.optional_libs[optlib];
          if (lib != null) {
            libs.push(lib.lib_path);
          }
        }
        proglang = _this.webapp.concatenator.language_engines[project.language];
        if ((proglang != null) && proglang.scripts) {
          ref1 = proglang.scripts;
          for (k = 0, len1 = ref1.length; k < len1; k++) {
            s = ref1[k];
            libs.push("../static" + s);
          }
        }
        if ((proglang != null) && (proglang.lib_path != null)) {
          ref2 = proglang.lib_path;
          for (l = 0, len2 = ref2.length; l < len2; l++) {
            s = ref2[l];
            libs.push(s);
          }
        }
        queue = new JobQueue(function() {
          var export_funk, html, mani, resources;
          resources = JSON.stringify({
            images: images,
            assets: assets,
            maps: maps_dict,
            sounds: sounds_list,
            music: music_list
          });
          resources = "var resources = " + resources + ";\n";
          resources += "var graphics = \"" + project.graphics + "\";\n";
          export_funk = pug.compileFile("../templates/export/html.pug");
          html = export_funk({
            user: user,
            javascript_files: libs.concat(["microengine.js"]),
            fonts: fonts,
            game: {
              name: project.slug,
              title: project.title,
              author: user.nick,
              resources: resources,
              orientation: project.orientation,
              aspect: project.aspect,
              libs: JSON.stringify(project.libs),
              code: fullsource,
              language: project.language
            }
          });
          zip.file("index.html", html);
          mani = _this.webapp.manifest_template.toString().replace(/SCOPE/g, "");
          mani = mani.toString().replace("APPNAME", project.title);
          mani = mani.toString().replace("APPSHORTNAME", project.title);
          mani = mani.toString().replace("ORIENTATION", project.orientation);
          mani = mani.toString().replace(/USER/g, user.nick);
          mani = mani.toString().replace(/PROJECT/g, project.slug);
          mani = mani.toString().replace(/ICONVERSION/g, "0");
          mani = mani.replace("START_URL", ".");
          zip.file("manifest.json", mani);
          zip.file("microengine.js", _this.webapp.concatenator.getEngineExport(project.graphics));
          return zip.generateAsync({
            type: "nodebuffer"
          }).then(function(content) {
            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", "attachement; filename=\"" + project.slug + ".zip\"");
            res.setHeader("Cache-Control", "no-cache");
            return res.send(content);
          });
        });
        fn = function(lib, i) {
          return queue.add(function() {
            return fs.readFile(lib, function(err, data) {
              if (data != null) {
                data = data.toString("utf-8");
                lib = lib.split("/");
                lib = lib[lib.length - 1];
                libs[i] = lib;
                zip.file(lib, data);
              }
              return queue.next();
            });
          });
        };
        for (i = n = 0, len3 = libs.length; n < len3; i = ++n) {
          lib = libs[i];
          fn(lib, i);
        }
        queue.add(function() {
          return manager.listFiles("sprites", function(sprites) {
            var fn1, len4, o;
            fn1 = function(s) {
              return queue.add(function() {
                return _this.webapp.server.content.files.read(user.id + "/" + project.id + "/sprites/" + s.file, "binary", function(content) {
                  if (content != null) {
                    zip.file("sprites/" + s.file, content);
                    images.push(s);
                  }
                  return queue.next();
                });
              });
            };
            for (o = 0, len4 = sprites.length; o < len4; o++) {
              s = sprites[o];
              fn1(s);
            }
            return queue.next();
          });
        });
        queue.add(function() {
          return manager.listFiles("maps", function(maps) {
            var fn1, len4, map, o;
            fn1 = function(map) {
              return queue.add(function() {
                return _this.webapp.server.content.files.read(user.id + "/" + project.id + "/maps/" + map.file, "text", function(content) {
                  if (content != null) {
                    maps_dict[map.file.split(".")[0]] = content;
                  }
                  return queue.next();
                });
              });
            };
            for (o = 0, len4 = maps.length; o < len4; o++) {
              map = maps[o];
              fn1(map);
            }
            return queue.next();
          });
        });
        queue.add(function() {
          return manager.listFiles("sounds", function(sounds) {
            var fn1, len4, o;
            fn1 = function(s) {
              return queue.add(function() {
                return _this.webapp.server.content.files.read(user.id + "/" + project.id + "/sounds/" + s.file, "binary", function(content) {
                  if (content != null) {
                    zip.file("sounds/" + s.file, content);
                    sounds_list.push(s);
                  }
                  return queue.next();
                });
              });
            };
            for (o = 0, len4 = sounds.length; o < len4; o++) {
              s = sounds[o];
              fn1(s);
            }
            return queue.next();
          });
        });
        queue.add(function() {
          return manager.listFiles("music", function(music) {
            var fn1, len4, m, o;
            fn1 = function(m) {
              return queue.add(function() {
                return _this.webapp.server.content.files.read(user.id + "/" + project.id + "/music/" + m.file, "binary", function(content) {
                  if (content != null) {
                    zip.file("music/" + m.file, content);
                    music_list.push(m);
                  }
                  return queue.next();
                });
              });
            };
            for (o = 0, len4 = music.length; o < len4; o++) {
              m = music[o];
              fn1(m);
            }
            return queue.next();
          });
        });
        queue.add(function() {
          return manager.listFiles("assets", function(assets) {
            var asset, fn1, len4, o;
            fn1 = function(asset) {
              return queue.add(function() {
                return _this.webapp.server.content.files.read(user.id + "/" + project.id + "/assets/" + asset.file, "binary", function(content) {
                  if (content != null) {
                    zip.file("assets/" + asset.file, content);
                    assets.push(asset);
                  }
                  return queue.next();
                });
              });
            };
            for (o = 0, len4 = assets.length; o < len4; o++) {
              asset = assets[o];
              fn1(asset);
            }
            return queue.next();
          });
        });
        queue.add(function() {
          return manager.listFiles("doc", function(docs) {
            var doc, fn1, len4, o;
            fn1 = function(doc) {
              return queue.add(function() {
                return _this.webapp.server.content.files.read(user.id + "/" + project.id + "/doc/" + doc.file, "text", function(content) {
                  if (content != null) {
                    zip.file(doc.file, content);
                  }
                  return queue.next();
                });
              });
            };
            for (o = 0, len4 = docs.length; o < len4; o++) {
              doc = docs[o];
              fn1(doc);
            }
            return queue.next();
          });
        });
        queue.add(function() {
          return manager.listFiles("ms", function(ms) {
            var fn1, len4, o, src;
            fn1 = function(src) {
              return queue.add(function() {
                return _this.webapp.server.content.files.read(user.id + "/" + project.id + "/ms/" + src.file, "text", function(content) {
                  if (content != null) {
                    fullsource += content + "\n\n";
                  }
                  return queue.next();
                });
              });
            };
            for (o = 0, len4 = ms.length; o < len4; o++) {
              src = ms[o];
              fn1(src);
            }
            queue.add(function() {
              var font, len5, p, ref3;
              ref3 = _this.webapp.fonts.fonts;
              for (p = 0, len5 = ref3.length; p < len5; p++) {
                font = ref3[p];
                if (font === "BitCell" || fullsource.indexOf("\"" + font + "\"") >= 0) {
                  fonts.push(font);
                  (function(font) {
                    return queue.add(function() {
                      return _this.webapp.fonts.read(font, function(data) {
                        if (data != null) {
                          zip.file("fonts/" + font + ".ttf", data);
                        }
                        return queue.next();
                      });
                    });
                  })(font);
                }
              }
              return queue.next();
            });
            return queue.next();
          });
        });
        queue.add(function() {
          var path;
          path = user.id + "/" + project.id + "/sprites/icon.png";
          path = _this.webapp.server.content.files.folder + "/" + _this.webapp.server.content.files.sanitize(path);
          return Jimp.read(path, function(err, img) {
            var fn1, len4, o, ref3, size;
            if (!err) {
              ref3 = [16, 32, 64, 180, 192, 512, 1024];
              fn1 = function(size) {
                return queue.add(function() {
                  return img.clone().resize(size, size, Jimp.RESIZE_NEAREST_NEIGHBOR).getBuffer(Jimp.MIME_PNG, function(err, buffer) {
                    if (err) {
                      return queue.next();
                    } else {
                      zip.file("icon" + size + ".png", buffer);
                      return queue.next();
                    }
                  });
                });
              };
              for (o = 0, len4 = ref3.length; o < len4; o++) {
                size = ref3[o];
                fn1(size);
              }
            }
            return queue.next();
          });
        });
        return queue.start();
      };
    })(this));
  };

  return ExportFeatures;

})();

module.exports = this.ExportFeatures;
