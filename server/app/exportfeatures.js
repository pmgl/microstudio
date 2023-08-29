(function() {
  var JSZip, Jimp, JobQueue, SERVER_EXPORT_README, fs, pug;

  fs = require("fs");

  Jimp = require("jimp");

  JSZip = require("jszip");

  pug = require("pug");

  JobQueue = require(__dirname + "/jobqueue.js");

  this.ExportFeatures = class ExportFeatures {
    constructor(webapp) {
      this.webapp = webapp;
      this.addSpritesExport();
      this.addPublishHTML();
      this.addProjectFilesExport();
    }

    addProjectFilesExport() {
      // /user/project[/code]/export/project/
      return this.webapp.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+\/([^\/\|\?\&\.]+\/)?export\/project\/$/, (req, res) => {
        var HH, MM, SS, access, date, dd, f, folders, j, last_modified, len, manager, mm, project, projectInfo, queue, user, yyyy, zip;
        access = this.webapp.getProjectAccess(req, res);
        if (access == null) {
          return;
        }
        user = access.user;
        project = access.project;
        manager = this.webapp.getProjectManager(project);
        folders = this.getFoldersWithTypes();
        projectInfo = this.prepareExportProjectInfo(project);
        date = new Date();
        date.setTime(project.last_modified);
        yyyy = String(date.getFullYear()).padStart(4, '0000');
        mm = String(date.getMonth()).padStart(2, '0');
        dd = String(date.getDay()).padStart(2, '0');
        HH = String(date.getHours()).padStart(2, '0');
        MM = String(date.getMinutes()).padStart(2, '0');
        SS = String(date.getSeconds()).padStart(2, '0');
        last_modified = `${yyyy}${mm}${dd}-${HH}${MM}${SS}`;
        zip = new JSZip;
        queue = new JobQueue(() => {
          return zip.generateAsync({
            type: "nodebuffer"
          }).then((content) => {
            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", `attachement; filename="${project.slug}_${last_modified}_archive.zip"`);
            return res.send(content);
          });
        });
        zip.file("project.json", JSON.stringify(projectInfo));
        for (j = 0, len = folders.length; j < len; j++) {
          f = folders[j];
          ((f) => {
            return this.enqueueFolderZipping(zip, queue, manager, user, project, f.name, f.fileType);
          })(f);
        }
        return queue.start();
      });
    }

    enqueueFolderZipping(zip, queue, manager, user, project, folder, fileType) {
      return queue.add(() => {
        return manager.listFiles(folder, (files) => {
          var f, j, len;
          for (j = 0, len = files.length; j < len; j++) {
            f = files[j];
            ((f) => {
              return queue.add(() => {
                //console.info "reading: "+JSON.stringify f
                return this.webapp.server.content.files.read(`${user.id}/${project.id}/${folder}/${f.file}`, fileType, (content) => {
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
                  //zip.folder(folder).file("#{f.file}.meta", JSON.stringify f)
                  return queue.next();
                });
              });
            })(f);
          }
          return queue.next();
        });
      });
    }

    getFoldersWithTypes() {
      var folders;
      return folders = [
        {
          name: "sprites",
          fileType: "binary"
        },
        {
          name: "ms",
          fileType: "text"
        },
        {
          name: "doc",
          fileType: "text"
        },
        {
          name: "maps",
          fileType: "text"
        },
        {
          name: "sounds",
          fileType: "binary"
        },
        {
          name: "sounds_th",
          fileType: "binary"
        },
        {
          name: "music",
          fileType: "binary"
        },
        {
          name: "music_th",
          fileType: "binary"
        },
        {
          name: "assets",
          fileType: "binary"
        },
        {
          name: "assets_th",
          fileType: "binary"
        }
      ];
    }

    prepareExportProjectInfo(project) {
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
        networking: project.networking,
        libs: project.libs,
        tabs: project.tabs,
        plugins: project.plugins,
        libraries: project.libraries,
        date_created: project.date_created,
        last_modified: project.last_modified,
        first_published: project.first_published,
        files: project.files,
        description: project.description
      };
    }

    addSpritesExport() {
      // /user/project[/code]/export/sprites/
      return this.webapp.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+\/([^\/\|\?\&\.]+\/)?export\/sprites\/$/, (req, res) => {
        var access, manager, project, queue, user, zip;
        access = this.webapp.getProjectAccess(req, res);
        if (access == null) {
          return;
        }
        user = access.user;
        project = access.project;
        manager = this.webapp.getProjectManager(project);
        zip = new JSZip;
        queue = new JobQueue(() => {
          return zip.generateAsync({
            type: "nodebuffer"
          }).then((content) => {
            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", `attachement; filename="${project.slug}_sprites.zip"`);
            return res.send(content);
          });
        });
        queue.add(() => {
          return manager.listFiles("sprites", (sprites) => {
            var j, len, s;
            for (j = 0, len = sprites.length; j < len; j++) {
              s = sprites[j];
              ((s) => {
                return queue.add(() => {
                  //console.info "reading: "+JSON.stringify s
                  return this.webapp.server.content.files.read(`${user.id}/${project.id}/sprites/${s.file}`, "binary", (content) => {
                    if (content != null) {
                      zip.file(s.file.replace(/-/g, "/"), content);
                    }
                    return queue.next();
                  });
                });
              })(s);
            }
            return queue.next();
          });
        });
        queue.add(() => {
          return manager.listFiles("doc", (docs) => {
            var doc, j, len;
            for (j = 0, len = docs.length; j < len; j++) {
              doc = docs[j];
              ((doc) => {
                return queue.add(() => {
                  //console.info "reading: "+JSON.stringify doc
                  return this.webapp.server.content.files.read(`${user.id}/${project.id}/doc/${doc.file}`, "text", (content) => {
                    if (content != null) {
                      zip.file(doc.file, content);
                    }
                    return queue.next();
                  });
                });
              })(doc);
            }
            return queue.next();
          });
        });
        return queue.start();
      });
    }

    addPublishHTML() {
      // /user/project[/code]/publish/html/
      return this.webapp.app.get(/^\/[^\/\|\?\&\.]+\/[^\/\|\?\&\.]+\/([^\/\|\?\&\.]+\/)?publish\/html\/$/, (req, res) => {
        var access, assets_list, fonts, fullsource, g, i, images, j, k, l, len, len1, len2, len3, lib, libs, manager, maps_dict, music_list, n, optlib, p, proglang, project, queue, ref, ref1, ref2, s, sounds_list, user, wrapsource, zip;
        if ((req.query != null) && (req.query.server != null)) {
          return this.publishServer(req, res);
        }
        access = this.webapp.getProjectAccess(req, res);
        if (access == null) {
          return;
        }
        user = access.user;
        project = access.project;
        manager = this.webapp.getProjectManager(project);
        zip = new JSZip;
        // icon16,32,64,180,192,512,1024.png
        // manifest.json
        maps_dict = {};
        images = [];
        assets_list = [];
        fonts = [];
        sounds_list = [];
        music_list = [];
        fullsource = "\n\n";
        wrapsource = function(s) {
          return s;
        };
        if (project.language === "microscript_v2") { // this is to prevent local variables contamination between files
          wrapsource = function(s) {
            if (/^\s*\/\/\s*javascript\s*\n/.test(s)) {
              return '\nsystem.javascript("""\n\n' + s.replace(/\\/g, "\\\\") + '\n\n""")\n';
            } else {
              return `\nfunction()\n${s}\nend()\n`;
            }
          };
        }
        libs = [];
        if ((project.graphics != null) && typeof project.graphics === "string") {
          g = project.graphics.toLowerCase();
          p = this.webapp.concatenator.findAltPlayer(g);
          if (p) {
            libs = [].concat(p.lib_path); // clone the array, will be modified
          }
        }
        ref = project.libs;
        for (j = 0, len = ref.length; j < len; j++) {
          optlib = ref[j];
          lib = this.webapp.concatenator.findOptionalLib(optlib);
          if (lib) {
            libs.push(lib.lib_path);
          }
        }
        proglang = this.webapp.concatenator.language_engines[project.language];
        if ((proglang != null) && proglang.scripts) {
          ref1 = proglang.scripts;
          for (k = 0, len1 = ref1.length; k < len1; k++) {
            s = ref1[k];
            libs.push(`../static${s}`);
          }
        }
        if ((proglang != null) && (proglang.lib_path != null)) {
          ref2 = proglang.lib_path;
          for (l = 0, len2 = ref2.length; l < len2; l++) {
            s = ref2[l];
            libs.push(s);
          }
        }
        queue = new JobQueue(() => {
          var export_funk, html, mani, resources;
          resources = JSON.stringify({
            images: images,
            assets: assets_list,
            maps: maps_dict,
            sounds: sounds_list,
            music: music_list
          });
          resources = `var resources = ${resources};\n`;
          resources += `var graphics = "${project.graphics}";\n`;
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
              language: project.language,
              use_server: project.networking || false
            }
          });
          zip.file("index.html", html);
          mani = this.webapp.manifest_template.toString().replace(/SCOPE/g, "");
          mani = mani.toString().replace("APPNAME", project.title);
          mani = mani.toString().replace("APPSHORTNAME", project.title);
          mani = mani.toString().replace("ORIENTATION", project.orientation);
          mani = mani.toString().replace(/USER/g, user.nick);
          mani = mani.toString().replace(/PROJECT/g, project.slug);
          mani = mani.toString().replace(/ICONVERSION/g, "0");
          mani = mani.replace("START_URL", ".");
          zip.file("manifest.json", mani);
          zip.file("microengine.js", this.webapp.concatenator.getEngineExport(project.graphics));
          return zip.generateAsync({
            type: "nodebuffer"
          }).then((content) => {
            res.setHeader("Content-Type", "application/zip");
            res.setHeader("Content-Disposition", `attachement; filename="${project.slug}.zip"`);
            res.setHeader("Cache-Control", "no-cache");
            return res.send(content);
          });
        });
        for (i = n = 0, len3 = libs.length; n < len3; i = ++n) {
          lib = libs[i];
          ((lib, i) => {
            return queue.add(() => {
              return fs.readFile(lib, (err, data) => {
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
          })(lib, i);
        }
        queue.add(() => {
          return manager.listFiles("sprites", (sprites) => {
            var len4, o;
            for (o = 0, len4 = sprites.length; o < len4; o++) {
              s = sprites[o];
              ((s) => {
                return queue.add(() => {
                  //console.info "reading: "+JSON.stringify s
                  return this.webapp.server.content.files.read(`${user.id}/${project.id}/sprites/${s.file}`, "binary", (content) => {
                    if (content != null) {
                      zip.file(`sprites/${s.file}`, content);
                      images.push(s);
                    }
                    return queue.next();
                  });
                });
              })(s);
            }
            return queue.next();
          });
        });
        queue.add(() => {
          return manager.listFiles("maps", (maps) => {
            var len4, map, o;
            for (o = 0, len4 = maps.length; o < len4; o++) {
              map = maps[o];
              ((map) => {
                return queue.add(() => {
                  //console.info "reading: "+JSON.stringify map
                  return this.webapp.server.content.files.read(`${user.id}/${project.id}/maps/${map.file}`, "text", (content) => {
                    if (content != null) {
                      maps_dict[map.file.split(".")[0].replace(/-/g, "/")] = content;
                    }
                    return queue.next();
                  });
                });
              })(map);
            }
            return queue.next();
          });
        });
        queue.add(() => {
          return manager.listFiles("sounds", (sounds) => {
            var len4, o;
            for (o = 0, len4 = sounds.length; o < len4; o++) {
              s = sounds[o];
              ((s) => {
                return queue.add(() => {
                  //console.info "reading: "+JSON.stringify s
                  return this.webapp.server.content.files.read(`${user.id}/${project.id}/sounds/${s.file}`, "binary", (content) => {
                    if (content != null) {
                      zip.file(`sounds/${s.file}`, content);
                      sounds_list.push(s);
                    }
                    return queue.next();
                  });
                });
              })(s);
            }
            return queue.next();
          });
        });
        queue.add(() => {
          return manager.listFiles("music", (music) => {
            var len4, m, o;
            for (o = 0, len4 = music.length; o < len4; o++) {
              m = music[o];
              ((m) => {
                return queue.add(() => {
                  //console.info "reading: "+JSON.stringify m
                  return this.webapp.server.content.files.read(`${user.id}/${project.id}/music/${m.file}`, "binary", (content) => {
                    if (content != null) {
                      zip.file(`music/${m.file}`, content);
                      music_list.push(m);
                    }
                    return queue.next();
                  });
                });
              })(m);
            }
            return queue.next();
          });
        });
        queue.add(() => {
          return manager.listFiles("assets", (assets) => {
            var asset, len4, o;
            for (o = 0, len4 = assets.length; o < len4; o++) {
              asset = assets[o];
              ((asset) => {
                return queue.add(() => {
                  //console.info "reading: "+JSON.stringify asset
                  return this.webapp.server.content.files.read(`${user.id}/${project.id}/assets/${asset.file}`, "binary", (content) => {
                    if (content != null) {
                      zip.file(`assets/${asset.file}`, content);
                      assets_list.push(asset);
                    }
                    return queue.next();
                  });
                });
              })(asset);
            }
            return queue.next();
          });
        });
        queue.add(() => {
          return manager.listFiles("doc", (docs) => {
            var doc, len4, o;
            for (o = 0, len4 = docs.length; o < len4; o++) {
              doc = docs[o];
              ((doc) => {
                return queue.add(() => {
                  //console.info "reading: "+JSON.stringify doc
                  return this.webapp.server.content.files.read(`${user.id}/${project.id}/doc/${doc.file}`, "text", (content) => {
                    if (content != null) {
                      zip.file(doc.file, content);
                    }
                    return queue.next();
                  });
                });
              })(doc);
            }
            return queue.next();
          });
        });
        queue.add(() => {
          return manager.listFiles("ms", (ms) => {
            var len4, o, src;
            for (o = 0, len4 = ms.length; o < len4; o++) {
              src = ms[o];
              ((src) => {
                return queue.add(() => {
                  //console.info "reading: "+JSON.stringify src
                  return this.webapp.server.content.files.read(`${user.id}/${project.id}/ms/${src.file}`, "text", (content) => {
                    if (content != null) {
                      fullsource += wrapsource(content) + "\n\n";
                    }
                    return queue.next();
                  });
                });
              })(src);
            }
            queue.add(() => {
              var font, len5, q, ref3;
              ref3 = this.webapp.fonts.fonts;
              for (q = 0, len5 = ref3.length; q < len5; q++) {
                font = ref3[q];
                if (font === "BitCell" || fullsource.indexOf(`"${font}"`) >= 0) {
                  fonts.push(font);
                  ((font) => {
                    return queue.add(() => {
                      //console.info "reading font: #{font}"
                      return this.webapp.fonts.read(font, (data) => {
                        if (data != null) {
                          zip.file(`fonts/${font}.ttf`, data);
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
        queue.add(() => {
          var path;
          path = `${user.id}/${project.id}/sprites/icon.png`;
          path = this.webapp.server.content.files.folder + "/" + this.webapp.server.content.files.sanitize(path);
          return Jimp.read(path, (err, img) => {
            var len4, o, ref3, size;
            if (!err) {
              ref3 = [16, 32, 64, 180, 192, 512, 1024];
              for (o = 0, len4 = ref3.length; o < len4; o++) {
                size = ref3[o];
                ((size) => {
                  return queue.add(() => {
                    return img.clone().resize(size, size, Jimp.RESIZE_NEAREST_NEIGHBOR).getBuffer(Jimp.MIME_PNG, (err, buffer) => {
                      if (err) {
                        return queue.next();
                      } else {
                        zip.file(`icon${size}.png`, buffer);
                        return queue.next();
                      }
                    });
                  });
                })(size);
              }
            }
            return queue.next();
          });
        });
        return queue.start();
      });
    }

    publishServer(req, res) {
      var access, assets_list, fonts, fullsource, g, i, images, j, k, l, len, len1, len2, len3, lib, libs, manager, maps_dict, music_list, n, optlib, proglang, project, queue, ref, ref1, ref2, s, server_src, sounds_list, user, wrapsource, zip;
      access = this.webapp.getProjectAccess(req, res);
      if (access == null) {
        return;
      }
      user = access.user;
      project = access.project;
      manager = this.webapp.getProjectManager(project);
      zip = new JSZip;
      maps_dict = {};
      images = [];
      assets_list = [];
      fonts = [];
      sounds_list = [];
      music_list = [];
      fullsource = "\n\n";
      server_src = "";
      wrapsource = function(s) {
        return s;
      };
      if (project.language === "microscript_v2") { // this is to prevent local variables contamination between files
        wrapsource = function(s) {
          if (/^\s*\/\/\s*javascript\s*\n/.test(s)) {
            return '\nsystem.javascript("""\n\n' + s.replace(/\\/g, "\\\\") + '\n\n""")\n';
          } else {
            return `\nfunction()\n${s}\nend()\n`;
          }
        };
      }
      libs = [];
      if ((project.graphics != null) && typeof project.graphics === "string") {
        g = project.graphics.toLowerCase();
        if (this.webapp.concatenator.alt_players[g] != null) {
          libs = [].concat(this.webapp.concatenator.alt_players[g].lib_path); // clone the array, will be modified
        }
      }
      ref = project.libs;
      for (j = 0, len = ref.length; j < len; j++) {
        optlib = ref[j];
        lib = this.webapp.concatenator.optional_libs[optlib];
        if (lib != null) {
          libs.push(lib.lib_path);
        }
      }
      proglang = this.webapp.concatenator.language_engines[project.language];
      if ((proglang != null) && proglang.scripts) {
        ref1 = proglang.scripts;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          s = ref1[k];
          libs.push(`../static${s}`);
        }
      }
      if ((proglang != null) && (proglang.lib_path != null)) {
        ref2 = proglang.lib_path;
        for (l = 0, len2 = ref2.length; l < len2; l++) {
          s = ref2[l];
          libs.push(s);
        }
      }
      queue = new JobQueue(() => {
        var config_json, package_json, resources;
        resources = JSON.stringify({
          images: images,
          assets: assets_list,
          maps: maps_dict,
          sounds: sounds_list,
          music: music_list
        });
        resources = `var resources = ${resources};\n`;
        resources += `var graphics = "${project.graphics}";\n`;
        server_src += `\n\n${this.webapp.concatenator.getServerEngineExport(project.graphics)}`;
        server_src = `var window = global ;\n\nvar start = function() {\n  window.player = new this.Player(function(event) {\n    if (event.name == "started") {\n      // signal that the game is started\n    }\n    else if (event.name == "log") {\n      // console.info(event.data) ;\n    }\n  }) ;\n}\n\nvar resources = ${JSON.stringify(resources)};\nvar graphics = "${project.graphics}";\n\nglobal.location = {\n  pathname: "",\n  hash: ""\n}\nglobal.navigator = {\n  language: "en"\n}\n\nwindow.ms_libs = [] ;\n\nserver_code = \`\n${fullsource.replace(/`/g, "\\\`")}\n\`\n      ${server_src}\n\nfor (const prop in this) {\n  global[prop] = this[prop] ;\n}\n\nvar fs = require("fs") ;\nfs.readFile("./config.json",(err,data)=> {\n  global.server_port = 3000 ;\n  if (! err) {\n    console.info("config.json loaded") ;\n    try {\n      var config = JSON.parse(data) ;\n      global.server_port = config.port || 3000 ;\n    } catch (err) {\n      console.info("could not parse config file") ;\n    }\n  } else {\n    console.info("could not read config file") ;\n  }\n  console.info( "starting with port set to: "+global.server_port ) ;\n  start() ;\n}) ;`;
        zip.file("server.js", server_src);
        package_json = {
          name: project.slug,
          version: "1.0.0",
          description: "",
          main: "server.js",
          scripts: {
            start: "node server.js"
          },
          author: project.owner.nick,
          license: "",
          dependencies: {
            ws: "^8.10.0"
          }
        };
        config_json = {
          port: 3000
        };
        zip.file("package.json", JSON.stringify(package_json, null, 2));
        zip.file("config.json", JSON.stringify(config_json, null, 2));
        zip.file("README.md", SERVER_EXPORT_README);
        return zip.generateAsync({
          type: "nodebuffer"
        }).then((content) => {
          res.setHeader("Content-Type", "application/zip");
          res.setHeader("Content-Disposition", `attachement; filename="${project.slug}.zip"`);
          res.setHeader("Cache-Control", "no-cache");
          return res.send(content);
        });
      });
      for (i = n = 0, len3 = libs.length; n < len3; i = ++n) {
        lib = libs[i];
        ((lib, i) => {
          return queue.add(() => {
            return fs.readFile(lib, (err, data) => {
              if (data != null) {
                data = data.toString("utf-8");
                server_src += `\n\n${data}`;
              }
              return queue.next();
            });
          });
        })(lib, i);
      }
      queue.add(() => {
        return manager.listFiles("maps", (maps) => {
          var len4, map, o;
          for (o = 0, len4 = maps.length; o < len4; o++) {
            map = maps[o];
            ((map) => {
              return queue.add(() => {
                return this.webapp.server.content.files.read(`${user.id}/${project.id}/maps/${map.file}`, "text", (content) => {
                  if (content != null) {
                    maps_dict[map.file.split(".")[0].replace(/-/g, "/")] = content;
                  }
                  return queue.next();
                });
              });
            })(map);
          }
          return queue.next();
        });
      });
      queue.add(() => {
        return manager.listFiles("ms", (ms) => {
          var len4, o, src;
          for (o = 0, len4 = ms.length; o < len4; o++) {
            src = ms[o];
            ((src) => {
              return queue.add(() => {
                return this.webapp.server.content.files.read(`${user.id}/${project.id}/ms/${src.file}`, "text", (content) => {
                  if (content != null) {
                    fullsource += wrapsource(content) + "\n\n";
                  }
                  return queue.next();
                });
              });
            })(src);
          }
          return queue.next();
        });
      });
      return queue.start();
    }

  };

  SERVER_EXPORT_README = "# Running your microStudio game server\n\nPreliminary step: you should have NodeJS installed on your server.\n\nAfter unzipping the server export and changing directory to the folder containing this README:\n\n* Run `npm install`\n* Edit `config.json` to set the desired port for your game server\n* Run `npm run start` to start your game server\n\nYou can test your server by running your game locally. You should set the address of your own server\nwhen creating a new ServerConnection from the client, example: `connection = new ServerConnection('ws://127.0.0.1:3000')`.";

  module.exports = this.ExportFeatures;

}).call(this);


//# sourceMappingURL=exportfeatures.js.map
//# sourceURL=coffeescript