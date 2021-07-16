var JSZip, JobQueue, createCanvas, loadImage, pug, ref;

JSZip = require("jszip");

pug = require("pug");

JobQueue = require(__dirname + "/jobqueue.js");

ref = require('canvas'), createCanvas = ref.createCanvas, loadImage = ref.loadImage;

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
        var access, f, fn, folders, i, len, manager, project, projectInfo, queue, user, zip;
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
            res.setHeader("Content-Disposition", "attachement; filename=\"" + project.slug + "_files.zip\"");
            return res.send(content);
          });
        });
        zip.file("project.meta", JSON.stringify(projectInfo));
        fn = function(f) {
          return _this.enqueueFolderZipping(zip, queue, manager, user, project, f.name, f.fileType);
        };
        for (i = 0, len = folders.length; i < len; i++) {
          f = folders[i];
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
          var f, fn, i, len;
          fn = function(f) {
            return queue.add(function() {
              console.info("reading: " + JSON.stringify(f));
              return _this.webapp.server.content.files.read(user.id + "/" + project.id + "/" + folder + "/" + f.file, fileType, function(content) {
                if (content != null) {
                  zip.folder(folder).file(f.file, content);
                  zip.folder(folder).file(f.file + ".meta", JSON.stringify(f));
                }
                return queue.next();
              });
            });
          };
          for (i = 0, len = files.length; i < len; i++) {
            f = files[i];
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
        name: "music",
        fileType: "binary"
      }, {
        name: "assets",
        fileType: "binary"
      }
    ];
  };

  ExportFeatures.prototype.prepareExportProjectInfo = function(project) {
    var projectInfo;
    return projectInfo = {
      owner: project.owner.nick,
      id: project.id,
      title: project.title,
      slug: project.slug,
      tags: project.tags,
      orientation: project.orientation,
      aspect: project.aspect,
      platforms: project.platforms,
      controls: project.controls,
      type: project.type,
      date_created: project.date_created,
      last_modified: project.last_modified,
      first_published: project.first_published
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
            var fn, i, len, s;
            fn = function(s) {
              return queue.add(function() {
                console.info("reading: " + JSON.stringify(s));
                return _this.webapp.server.content.files.read(user.id + "/" + project.id + "/sprites/" + s.file, "binary", function(content) {
                  if (content != null) {
                    zip.file(s.file, content);
                  }
                  return queue.next();
                });
              });
            };
            for (i = 0, len = sprites.length; i < len; i++) {
              s = sprites[i];
              fn(s);
            }
            return queue.next();
          });
        });
        queue.add(function() {
          return manager.listFiles("doc", function(docs) {
            var doc, fn, i, len;
            fn = function(doc) {
              return queue.add(function() {
                console.info("reading: " + JSON.stringify(doc));
                return _this.webapp.server.content.files.read(user.id + "/" + project.id + "/doc/" + doc.file, "text", function(content) {
                  if (content != null) {
                    zip.file(doc.file, content);
                  }
                  return queue.next();
                });
              });
            };
            for (i = 0, len = docs.length; i < len; i++) {
              doc = docs[i];
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
        var access, assets, fonts, fullsource, images, manager, maps_dict, music_list, project, queue, sounds_list, user, zip;
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
            javascript_files: ["microengine.js"],
            fonts: fonts,
            game: {
              name: project.slug,
              title: project.title,
              author: user.nick,
              resources: resources,
              orientation: project.orientation,
              aspect: project.aspect,
              code: fullsource
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
          if (project.graphics === "M3D") {
            zip.file("microengine.js", _this.webapp.concatenator["player3d_js_concat"]);
          } else {
            zip.file("microengine.js", _this.webapp.concatenator["player_js_concat"]);
          }
          return zip.generateAsync({
            type: "nodebuffer"
          }).then(function(content) {
            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", "attachement; filename=\"" + project.slug + ".zip\"");
            res.setHeader("Cache-Control", "no-cache");
            return res.send(content);
          });
        });
        queue.add(function() {
          return manager.listFiles("sprites", function(sprites) {
            var fn, i, len, s;
            fn = function(s) {
              return queue.add(function() {
                console.info("reading: " + JSON.stringify(s));
                return _this.webapp.server.content.files.read(user.id + "/" + project.id + "/sprites/" + s.file, "binary", function(content) {
                  if (content != null) {
                    zip.file("sprites/" + s.file, content);
                    images.push(s);
                  }
                  return queue.next();
                });
              });
            };
            for (i = 0, len = sprites.length; i < len; i++) {
              s = sprites[i];
              fn(s);
            }
            return queue.next();
          });
        });
        queue.add(function() {
          return manager.listFiles("maps", function(maps) {
            var fn, i, len, map;
            fn = function(map) {
              return queue.add(function() {
                console.info("reading: " + JSON.stringify(map));
                return _this.webapp.server.content.files.read(user.id + "/" + project.id + "/maps/" + map.file, "text", function(content) {
                  if (content != null) {
                    maps_dict[map.file.split(".")[0]] = content;
                  }
                  return queue.next();
                });
              });
            };
            for (i = 0, len = maps.length; i < len; i++) {
              map = maps[i];
              fn(map);
            }
            return queue.next();
          });
        });
        queue.add(function() {
          return manager.listFiles("sounds", function(sounds) {
            var fn, i, len, s;
            fn = function(s) {
              return queue.add(function() {
                console.info("reading: " + JSON.stringify(s));
                return _this.webapp.server.content.files.read(user.id + "/" + project.id + "/sounds/" + s.file, "binary", function(content) {
                  if (content != null) {
                    zip.file("sounds/" + s.file, content);
                    sounds_list.push(s);
                  }
                  return queue.next();
                });
              });
            };
            for (i = 0, len = sounds.length; i < len; i++) {
              s = sounds[i];
              fn(s);
            }
            return queue.next();
          });
        });
        queue.add(function() {
          return manager.listFiles("music", function(music) {
            var fn, i, len, m;
            fn = function(m) {
              return queue.add(function() {
                console.info("reading: " + JSON.stringify(m));
                return _this.webapp.server.content.files.read(user.id + "/" + project.id + "/music/" + m.file, "binary", function(content) {
                  if (content != null) {
                    zip.file("music/" + m.file, content);
                    music_list.push(m);
                  }
                  return queue.next();
                });
              });
            };
            for (i = 0, len = music.length; i < len; i++) {
              m = music[i];
              fn(m);
            }
            return queue.next();
          });
        });
        queue.add(function() {
          return manager.listFiles("assets", function(assets) {
            var asset, fn, i, len;
            fn = function(asset) {
              return queue.add(function() {
                console.info("reading: " + JSON.stringify(asset));
                return _this.webapp.server.content.files.read(user.id + "/" + project.id + "/assets/" + asset.file, "binary", function(content) {
                  if (content != null) {
                    zip.file("assets/" + asset.file, content);
                    assets.push(asset);
                  }
                  return queue.next();
                });
              });
            };
            for (i = 0, len = assets.length; i < len; i++) {
              asset = assets[i];
              fn(asset);
            }
            return queue.next();
          });
        });
        queue.add(function() {
          return manager.listFiles("doc", function(docs) {
            var doc, fn, i, len;
            fn = function(doc) {
              return queue.add(function() {
                console.info("reading: " + JSON.stringify(doc));
                return _this.webapp.server.content.files.read(user.id + "/" + project.id + "/doc/" + doc.file, "text", function(content) {
                  if (content != null) {
                    zip.file(doc.file, content);
                  }
                  return queue.next();
                });
              });
            };
            for (i = 0, len = docs.length; i < len; i++) {
              doc = docs[i];
              fn(doc);
            }
            return queue.next();
          });
        });
        queue.add(function() {
          return manager.listFiles("ms", function(ms) {
            var fn, i, len, src;
            fn = function(src) {
              return queue.add(function() {
                console.info("reading: " + JSON.stringify(src));
                return _this.webapp.server.content.files.read(user.id + "/" + project.id + "/ms/" + src.file, "text", function(content) {
                  if (content != null) {
                    fullsource += content + "\n\n";
                  }
                  return queue.next();
                });
              });
            };
            for (i = 0, len = ms.length; i < len; i++) {
              src = ms[i];
              fn(src);
            }
            queue.add(function() {
              var font, j, len1, ref1;
              ref1 = _this.webapp.fonts.fonts;
              for (j = 0, len1 = ref1.length; j < len1; j++) {
                font = ref1[j];
                if (font === "BitCell" || fullsource.indexOf("\"" + font + "\"") >= 0) {
                  fonts.push(font);
                  (function(font) {
                    return queue.add(function() {
                      console.info("reading font: " + font);
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
          path = _this.webapp.server.content.files.sanitize(path);
          loadImage("../files/" + path).then((function(image) {
            var i, len, ref1, results, size;
            ref1 = [16, 32, 64, 180, 192, 512, 1024];
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
              size = ref1[i];
              results.push((function(size) {
                return queue.add(function() {
                  var canvas, context;
                  canvas = createCanvas(size, size);
                  context = canvas.getContext("2d");
                  context.antialias = "none";
                  context.imageSmoothingEnabled = false;
                  if (image != null) {
                    context.drawImage(image, 0, 0, size, size);
                  }
                  if (size > 100) {
                    context.antialias = "default";
                    context.globalCompositeOperation = "destination-in";
                    _this.webapp.fillRoundRect(context, 0, 0, size, size, size / 8);
                  }
                  return canvas.toBuffer(function(err, result) {
                    zip.file("icon" + size + ".png", result);
                    return queue.next();
                  });
                });
              })(size));
            }
            return results;
          }), function(error) {
            return queue.next();
          });
          return queue.next();
        });
        return queue.start();
      };
    })(this));
  };

  return ExportFeatures;

})();

module.exports = this.ExportFeatures;
