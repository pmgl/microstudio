var fs;

fs = require("fs");

this.Concatenator = class Concatenator {
  constructor(webapp) {
    var k, key, ref, ref1, ref2, v, value;
    this.webapp = webapp;
    this.webapp.app.get(/^\/all.js$/, (req, res) => {
      res.setHeader("Content-Type", "text/javascript");
      return res.send(this.webapp_js_concat);
    });
    this.webapp.app.get(/^\/all.css$/, (req, res) => {
      res.setHeader("Content-Type", "text/css");
      return res.send(this.webapp_css_concat);
    });
    this.webapp.app.get(/^\/play.js$/, (req, res) => {
      res.setHeader("Content-Type", "text/javascript");
      return res.send(this.player_js_concat);
    });
    this.webapp.app.get(/^\/server.js$/, (req, res) => {
      res.setHeader("Content-Type", "text/javascript");
      return res.send(this.server_js_concat);
    });
    this.alt_player_base = ['/js/util/canvas2d.js', "/js/languages/microscript/random.js", "/js/runtime/microvm.js", "/js/runtime/mpserverconnection.js", '/js/runtime/runtime.js', '/js/runtime/watcher.js', '/js/runtime/projectinterface.js', '/js/runtime/timemachine.js', '/js/runtime/assetmanager.js', '/js/runtime/keyboard.js', '/js/runtime/gamepad.js', '/js/runtime/sprite.js', '/js/runtime/msimage.js', '/js/runtime/map.js', "/js/runtime/audio/audio.js", "/js/runtime/audio/beeper.js", "/js/runtime/audio/sound.js", "/js/runtime/audio/music.js", '/js/play/player.js', '/js/play/playerclient.js'];
    this.alt_players = {
      m2d: {
        lib: ["/lib/pixijs/v6/pixi.min.js"],
        lib_path: ["../static/lib/pixijs/v6/pixi.min.js"],
        scripts: ['/js/runtime/m2d/screen.js', '/js/runtime/m2d/m2d.js']
      },
      m3d: {
        lib: ["/lib/babylonjs/v4/babylon.js", "/lib/babylonjs/v4/babylonjs.loaders.min.js"],
        lib_path: ["../static/lib/babylonjs/v4/babylon.js", "../static/lib/babylonjs/v4/babylonjs.loaders.min.js"],
        scripts: ['/js/runtime/m3d/screen.js', '/js/runtime/m3d/m3d.js']
      },
      pixi: {
        lib: ["/lib/pixijs/v6/pixi.min.js"],
        lib_path: ["../static/lib/pixijs/v6/pixi.min.js"],
        scripts: ['/js/runtime/pixi/screen.js', '/js/runtime/pixi/pixi.js'],
        versions: {
          pixi_v6: {
            name: "version 6",
            lib: ["/lib/pixijs/v6/pixi.min.js"],
            lib_path: ["../static/lib/pixijs/v6/pixi.min.js"],
            scripts: ['/js/runtime/pixi/screen.js', '/js/runtime/pixi/pixi.js'],
            original: true
          },
          pixi_v7: {
            name: "version 7",
            lib: ["/lib/pixijs/v7/pixi.min.js"],
            lib_path: ["../static/lib/pixijs/v7/pixi.min.js"],
            scripts: ['/js/runtime/pixi/screen.js', '/js/runtime/pixi/pixi.js'],
            default: true
          }
        }
      },
      babylon: {
        lib: ["/lib/babylonjs/v4/babylon.js", "/lib/babylonjs/v4/babylonjs.loaders.min.js"],
        lib_path: ["../static/lib/babylonjs/v4/babylon.js", "../static/lib/babylonjs/v4/babylonjs.loaders.min.js"],
        scripts: ['/js/runtime/babylon/screen.js', '/js/runtime/babylon/babylon.js'],
        versions: {
          babylon_v4: {
            name: "version 4",
            lib: ["/lib/babylonjs/v4/babylon.js", "/lib/babylonjs/v4/babylonjs.loaders.min.js"],
            lib_path: ["../static/lib/babylonjs/v4/babylon.js", "../static/lib/babylonjs/v4/babylonjs.loaders.min.js"],
            scripts: ['/js/runtime/babylon/screen.js', '/js/runtime/babylon/babylon.js'],
            original: true
          },
          babylon_v5: {
            name: "version 5",
            lib: ["/lib/babylonjs/v5/babylon.js", "/lib/babylonjs/v5/babylonjs.loaders.min.js"],
            lib_path: ["../static/lib/babylonjs/v5/babylon.js", "../static/lib/babylonjs/v5/babylonjs.loaders.min.js"],
            scripts: ['/js/runtime/babylon/screen.js', '/js/runtime/babylon/babylon.js']
          },
          babylon_v6: {
            name: "version 6",
            lib: ["/lib/babylonjs/v6/babylon.js", "/lib/babylonjs/v6/babylonjs.loaders.min.js"],
            lib_path: ["../static/lib/babylonjs/v6/babylon.js", "../static/lib/babylonjs/v6/babylonjs.loaders.min.js"],
            scripts: ['/js/runtime/babylon/screen.js', '/js/runtime/babylon/babylon.js'],
            default: true
          }
        }
      }
    };
    this.optional_libs = {
      matterjs: {
        title: "matter.js - 2D physics engine",
        lib: "/lib/matterjs/v017/matter.min.js",
        lib_path: "../static/lib/matterjs/v017/matter.min.js",
        versions: {
          matterjs_v017: {
            name: "version 0.17",
            lib: "/lib/matterjs/v017/matter.min.js",
            lib_path: "../static/lib/matterjs/v017/matter.min.js",
            original: true
          },
          matterjs_v018: {
            name: "version 0.18",
            lib: "/lib/matterjs/v018/matter.min.js",
            lib_path: "../static/lib/matterjs/v018/matter.min.js"
          },
          matterjs_v019: {
            name: "version 0.19",
            lib: "/lib/matterjs/v019/matter.min.js",
            lib_path: "../static/lib/matterjs/v019/matter.min.js",
            default: true
          }
        }
      },
      cannonjs: {
        title: "cannon.js - 3D physics engine",
        lib: "/lib/cannonjs/v06/cannon.min.js",
        lib_path: "../static/lib/cannonjs/v06/cannon.min.js"
      }
    };
    this.language_engines = {
      microscript_v2: {
        title: "microScript 2.0",
        scripts: ["/js/languages/microscript/v2/compiler.js", "/js/languages/microscript/v2/parser.js", "/js/languages/microscript/v2/processor.js", "/js/languages/microscript/v2/program.js", "/js/languages/microscript/v2/routine.js", "/js/languages/microscript/v2/runner.js", "/js/languages/microscript/v2/token.js", "/js/languages/microscript/v2/tokenizer.js", "/js/languages/microscript/v2/transpiler.js"],
        lib: []
      },
      python: {
        title: "Python",
        scripts: ["/js/languages/python/runner.js"],
        lib: ["/lib/brython/brython.js", "/lib/brython/brython_stdlib.js"],
        lib_path: ["node_modules/brython/brython.js", "node_modules/brython/brython_stdlib.js"]
      },
      lua: {
        title: "Lua",
        scripts: ["/js/languages/lua/runner.js"],
        lib: ["/lib/fengari/fengari-web.js"],
        lib_path: ["node_modules/fengari-web/dist/fengari-web.js"]
      },
      javascript: {
        title: "JavaScript",
        scripts: ["/js/languages/javascript/runner.js"],
        lib: []
      },
      microscript_v1_i: {
        title: "microScript 1.0 - interpreted",
        scripts: ["/js/languages/microscript/parser.js", "/js/languages/microscript/program.js", "/js/languages/microscript/token.js", "/js/languages/microscript/tokenizer.js", "/js/languages/microscript/runner_v1_i.js"],
        lib: []
      },
      microscript_v1_t: {
        title: "microScript 1.0 - transpiled",
        scripts: ["/js/languages/microscript/parser.js", "/js/languages/microscript/program.js", "/js/languages/microscript/token.js", "/js/languages/microscript/tokenizer.js", "/js/languages/microscript/jstranspiler.js", "/js/languages/microscript/runner_v1_t.js"],
        lib: []
      }
    };
    ref = this.alt_players;
    for (key in ref) {
      value = ref[key];
      ((key, value) => {
        var k, ref1, results, v;
        this.webapp.app.get(new RegExp(`^\\/${key}.js$`), (req, res) => {
          res.setHeader("Content-Type", "text/javascript");
          return res.send(this[`${key}_js_concat`]);
        });
        if (value.versions) {
          ref1 = value.versions;
          results = [];
          for (k in ref1) {
            v = ref1[k];
            results.push(((k, v) => {
              return this.webapp.app.get(new RegExp(`^\\/${k}.js$`), (req, res) => {
                res.setHeader("Content-Type", "text/javascript");
                return res.send(this[`${k}_js_concat`]);
              });
            })(k, v));
          }
          return results;
        }
      })(key, value);
    }
    this.webapp_css = ["/css/style.css", "/css/home.css", "/css/doc.css", "/css/code.css", "/css/debug.css", "/css/assets.css", "/css/sprites.css", "/css/sounds.css", "/css/synth.css", "/css/music.css", "/css/maps.css", "/css/publish.css", "/css/explore.css", "/css/options.css", "/css/sync.css", "/css/user.css", "/css/media.css", "/css/terminal.css", "/css/tutorial.css", "/css/md.css", "/css/common.css"];
    this.webapp_js = ["/js/languages/microscript/random.js", "/js/languages/microscript/v2/parser.js", "/js/languages/microscript/v2/program.js", "/js/languages/microscript/v2/token.js", "/js/languages/microscript/v2/tokenizer.js", "/js/languages/microscript/microscript.js", "/js/languages/python/python.js", "/js/languages/javascript/javascript.js", "/js/languages/lua/lua.js", "/js/client/client.js", "/js/util/confirm.js", "/js/util/canvas2d.js", "/js/util/regexlib.js", "/js/util/inputvalidator.js", "/js/util/translator.js", "/js/manager.js", "/js/folderview.js", "/js/about/about.js", "/js/doc/documentation.js", "/js/doceditor/doceditor.js", "/js/editor/editor.js", "/js/editor/runwindow.js", "/js/editor/projectaccess.js", "/js/editor/rulercanvas.js", "/js/editor/valuetool.js", "/js/editor/libmanager.js", "/js/options/options.js", "/js/options/tabmanager.js", "/js/options/pluginview.js", "/js/sync/sync.js", "/js/publish/publish.js", "/js/publish/appbuild.js", "/js/explore/explore.js", "/js/explore/projectdetails.js", "/js/user/usersettings.js", "/js/user/translationapp.js", "/js/user/progress.js", "/js/spriteeditor/drawtool.js", "/js/spriteeditor/spritelist.js", "/js/spriteeditor/spriteeditor.js", "/js/spriteeditor/colorpicker.js", "/js/spriteeditor/spriteview.js", "/js/spriteeditor/animationpanel.js", "/js/spriteeditor/autopalette.js", "/js/spriteeditor/sprite.js", "/js/spriteeditor/spriteframe.js", "/js/mapeditor/mapview.js", "/js/mapeditor/mapeditor.js", "/js/mapeditor/tilepicker.js", "/js/mapeditor/map.js", "/js/assets/assetsmanager.js", "/js/assets/modelviewer.js", "/js/assets/imageviewer.js", "/js/assets/textviewer.js", "/js/assets/fontviewer.js", "/js/sound/soundeditor.js", "/js/sound/soundthumbnailer.js", "/js/music/musiceditor.js", "/js/util/undo.js", "/js/util/random.js", "/js/util/splitbar.js", "/js/util/pixelartscaler.js", "/js/runtime/microvm.js", "/js/debug/debug.js", "/js/debug/watch.js", "/js/debug/timemachine.js", "/js/terminal/terminal.js", "/js/project/project.js", "/js/project/projectfolder.js", "/js/project/projectsource.js", "/js/project/projectsprite.js", "/js/project/projectmap.js", "/js/project/projectasset.js", "/js/project/projectsound.js", "/js/project/projectmusic.js", "/js/appui/floatingwindow.js", "/js/appui/appui.js", "/js/app.js", "/js/appstate.js", "/js/tutorial/tutorials.js", "/js/tutorial/tutorial.js", "/js/tutorial/tutorialwindow.js", "/js/tutorial/highlighter.js"];
    this.player_js = ['/js/util/canvas2d.js', "/js/languages/microscript/random.js", "/js/runtime/mpserverconnection.js", "/js/runtime/microvm.js", '/js/runtime/runtime.js', '/js/runtime/watcher.js', '/js/runtime/projectinterface.js', '/js/runtime/timemachine.js', '/js/runtime/screen.js', '/js/runtime/assetmanager.js', '/js/runtime/keyboard.js', '/js/runtime/gamepad.js', '/js/runtime/sprite.js', '/js/runtime/msimage.js', '/js/runtime/map.js', "/js/runtime/audio/audio.js", "/js/runtime/audio/beeper.js", "/js/runtime/audio/sound.js", "/js/runtime/audio/music.js", '/js/play/player.js', '/js/play/playerclient.js'];
    this.server_js = ["/js/languages/microscript/random.js", "/js/runtime/microvm.js", '/js/runtime/watcher.js', '/js/runtime/assetmanager.js', "/js/runtime/mpserver.js", '/js/runtime/runtime_server.js', '/js/runtime/watcher.js', '/js/runtime/map.js', '/js/terminal/terminal.js', '/js/debug/watch.js', '/js/play/server.js', '/js/play/serverclient.js'];
    this.server_export_js = ["/js/languages/microscript/random.js", "/js/runtime/microvm.js", '/js/runtime/watcher.js', '/js/runtime/assetmanager.js', "/js/play/server_export/mpserver.js", '/js/runtime/runtime_server.js', '/js/runtime/watcher.js', '/js/runtime/map.js', '/js/debug/watch.js', '/js/play/server_export/server.js'];
    ref1 = this.alt_players;
    for (key in ref1) {
      value = ref1[key];
      this[`${key}_js`] = this.alt_player_base.concat(value.scripts);
      if (value.versions) {
        ref2 = value.versions;
        for (k in ref2) {
          v = ref2[k];
          this[`${k}_js`] = this.alt_player_base.concat(v.scripts);
        }
      }
    }
    this.refresh();
  }

  refresh() {
    var k, key, ref, ref1, v, value;
    this.concat(this.webapp_js, "webapp_js_concat");
    this.concat(this.player_js, "player_js_concat");
    this.concat(this.server_js, "server_js_concat");
    this.concat(this.server_export_js, "server_export_js_concat");
    ref = this.alt_players;
    for (key in ref) {
      value = ref[key];
      this.concat(this[`${key}_js`], `${key}_js_concat`);
      if (value.versions != null) {
        ref1 = value.versions;
        for (k in ref1) {
          v = ref1[k];
          this.concat(this[`${k}_js`], `${k}_js_concat`);
        }
      }
    }
    return this.concat(this.webapp_css, "webapp_css_concat");
  }

  getHomeJSFiles() {
    if (this.webapp.server.use_cache && (this.webapp_js_concat != null)) {
      return ["/all.js"];
    } else {
      return this.webapp_js;
    }
  }

  getHomeCSSFiles() {
    if (this.webapp.server.use_cache && (this.webapp_css_concat != null)) {
      return ["/all.css"];
    } else {
      return this.webapp_css;
    }
  }

  findAltPlayer(graphics) {
    var id, player;
    if ((graphics != null) && typeof graphics === "string") {
      graphics = graphics.toLowerCase();
      if (this.alt_players[graphics] != null) {
        return this.alt_players[graphics];
      } else {
        id = graphics.split("_")[0];
        player = this.alt_players[id];
        if ((player != null) && (player.versions != null)) {
          return player.versions[graphics];
        }
      }
    }
    return null;
  }

  getPlayerJSFiles(graphics) {
    var player;
    if ((graphics != null) && typeof graphics === "string") {
      graphics = graphics.toLowerCase();
      player = this.findAltPlayer(graphics);
      if (player != null) {
        if (this.webapp.server.use_cache && (this.babylon_js_concat != null)) {
          return player.lib.concat([`/${graphics}.js`]);
        } else {
          return player.lib.concat(this[`${graphics}_js`]);
        }
      } else {
        if (this.webapp.server.use_cache && (this.player_js_concat != null)) {
          return ["/play.js"];
        } else {
          return this.player_js;
        }
      }
    }
  }

  getServerJSFiles() {
    if (this.webapp.server.use_cache && (this.server_js_concat != null)) {
      return ["/server.js"];
    } else {
      return this.server_js;
    }
  }

  getEngineExport(graphics) {
    if ((graphics != null) && typeof graphics === "string") {
      graphics = graphics.toLowerCase();
      return this[`${graphics}_js_concat`] || this.player_js_concat;
    } else {
      return this.player_js_concat;
    }
  }

  getServerEngineExport() {
    return this.server_export_js_concat;
  }

  findOptionalLib(lib) {
    var id, l;
    if (typeof lib !== "string") {
      return false;
    }
    id = lib.split("_")[0];
    l = this.optional_libs[id];
    if (l != null) {
      if (id === lib || (l.versions == null) || (l.versions[lib] == null)) {
        return l;
      } else {
        return l.versions[lib];
      }
    } else {
      return false;
    }
  }

  concat(files, variable, callback) {
    var f, funk, list, res;
    list = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = files.length; i < len; i++) {
        f = files[i];
        results.push(f);
      }
      return results;
    })();
    res = "";
    funk = () => {
      if (list.length > 0) {
        f = list.splice(0, 1)[0];
        f = "../static" + f;
        return fs.readFile(f, (err, data) => {
          if ((data != null) && (err == null)) {
            res += data + "\n";
            return funk();
          } else if (err) {
            return console.info(err);
          }
        });
      } else {
        this[variable] = res;
        if (callback != null) {
          return callback();
        }
      }
    };
    return funk();
  }

};

module.exports = this.Concatenator;
