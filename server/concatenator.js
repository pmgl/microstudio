var fs;

fs = require("fs");

this.Concatenator = (function() {
  function Concatenator(webapp) {
    var key, ref, ref1, value;
    this.webapp = webapp;
    this.webapp.app.get(/^\/all.js$/, (function(_this) {
      return function(req, res) {
        res.setHeader("Content-Type", "text/javascript");
        return res.send(_this.webapp_js_concat);
      };
    })(this));
    this.webapp.app.get(/^\/all.css$/, (function(_this) {
      return function(req, res) {
        res.setHeader("Content-Type", "text/css");
        return res.send(_this.webapp_css_concat);
      };
    })(this));
    this.webapp.app.get(/^\/play.js$/, (function(_this) {
      return function(req, res) {
        res.setHeader("Content-Type", "text/javascript");
        return res.send(_this.player_js_concat);
      };
    })(this));
    this.webapp.app.get(/^\/audioengine.js$/, (function(_this) {
      return function(req, res) {
        res.setHeader("Content-Type", "text/javascript");
        if (!_this.webapp.server.use_cache) {
          return _this.concat(_this.audioengine_js, "audioengine_js_concat", function() {
            return res.send(_this.audioengine_js_concat);
          });
        } else {
          return res.send(_this.audioengine_js_concat);
        }
      };
    })(this));
    this.alt_player_base = ['/js/util/canvas2d.js', "/js/languages/microscript/random.js", "/js/runtime/microvm.js", '/js/runtime/runtime.js', '/js/runtime/projectinterface.js', '/js/runtime/timemachine.js', '/js/runtime/assetmanager.js', '/js/runtime/keyboard.js', '/js/runtime/gamepad.js', '/js/runtime/sprite.js', '/js/runtime/msimage.js', '/js/runtime/map.js', "/js/runtime/audio/audio.js", "/js/runtime/audio/beeper.js", "/js/runtime/audio/sound.js", "/js/runtime/audio/music.js", '/js/play/player.js', '/js/play/playerclient.js'];
    this.alt_players = {
      m2d: {
        lib: ["/lib/pixijs/pixi.min.js"],
        lib_path: ["node_modules/pixi.js/dist/browser/pixi.min.js"],
        scripts: ['/js/runtime/m2d/screen.js', '/js/runtime/m2d/m2d.js']
      },
      m3d: {
        lib: ["/lib/babylonjs/babylon.js", "/lib/babylonjs/babylonjs.loaders.min.js"],
        lib_path: ["node_modules/babylonjs/babylon.js", "node_modules/babylonjs-loaders/babylonjs.loaders.min.js"],
        scripts: ['/js/runtime/m3d/screen.js', '/js/runtime/m3d/m3d.js']
      },
      pixi: {
        lib: ["/lib/pixijs/pixi.min.js"],
        lib_path: ["node_modules/pixi.js/dist/browser/pixi.min.js"],
        scripts: ['/js/runtime/pixi/screen.js', '/js/runtime/pixi/pixi.js']
      },
      babylon: {
        lib: ["/lib/babylonjs/babylon.js", "/lib/babylonjs/babylonjs.loaders.min.js"],
        lib_path: ["node_modules/babylonjs/babylon.js", "node_modules/babylonjs-loaders/babylonjs.loaders.min.js"],
        scripts: ['/js/runtime/babylon/screen.js', '/js/runtime/babylon/babylon.js']
      }
    };
    this.optional_libs = {
      matterjs: {
        title: "matter.js - 2D physics engine",
        lib: "/lib/matterjs/matter.min.js",
        lib_path: "node_modules/matter-js/build/matter.min.js"
      },
      cannonjs: {
        title: "cannon.js - 3D physics engine",
        lib: "/lib/cannonjs/cannon.min.js",
        lib_path: "node_modules/cannon/build/cannon.min.js"
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
      this.webapp.app.get(new RegExp("^\\/" + key + ".js$"), (function(_this) {
        return function(req, res) {
          res.setHeader("Content-Type", "text/javascript");
          return res.send(_this[key + "_js_concat"]);
        };
      })(this));
    }
    this.webapp_css = ["/css/style.css", "/css/home.css", "/css/doc.css", "/css/code.css", "/css/debug.css", "/css/assets.css", "/css/sprites.css", "/css/sounds.css", "/css/synth.css", "/css/music.css", "/css/maps.css", "/css/publish.css", "/css/explore.css", "/css/options.css", "/css/user.css", "/css/media.css", "/css/terminal.css", "/css/tutorial.css", "/css/md.css"];
    this.webapp_js = ["/js/languages/microscript/random.js", "/js/languages/microscript/v2/parser.js", "/js/languages/microscript/v2/program.js", "/js/languages/microscript/v2/token.js", "/js/languages/microscript/v2/tokenizer.js", "/js/languages/microscript/microscript.js", "/js/languages/python/python.js", "/js/languages/javascript/javascript.js", "/js/languages/lua/lua.js", "/js/client/client.js", "/js/util/confirm.js", "/js/util/canvas2d.js", "/js/util/regexlib.js", "/js/util/inputvalidator.js", "/js/util/translator.js", "/js/manager.js", "/js/folderview.js", "/js/about/about.js", "/js/doc/documentation.js", "/js/doceditor/doceditor.js", "/js/editor/editor.js", "/js/editor/runwindow.js", "/js/editor/projectaccess.js", "/js/editor/rulercanvas.js", "/js/editor/valuetool.js", "/js/options/options.js", "/js/publish/publish.js", "/js/publish/appbuild.js", "/js/explore/explore.js", "/js/explore/projectdetails.js", "/js/user/usersettings.js", "/js/user/translationapp.js", "/js/user/progress.js", "/js/spriteeditor/drawtool.js", "/js/spriteeditor/spritelist.js", "/js/spriteeditor/spriteeditor.js", "/js/spriteeditor/colorpicker.js", "/js/spriteeditor/spriteview.js", "/js/spriteeditor/animationpanel.js", "/js/spriteeditor/autopalette.js", "/js/spriteeditor/sprite.js", "/js/spriteeditor/spriteframe.js", "/js/mapeditor/mapview.js", "/js/mapeditor/mapeditor.js", "/js/mapeditor/tilepicker.js", "/js/mapeditor/map.js", "/js/assets/assetsmanager.js", "/js/assets/modelviewer.js", "/js/assets/imageviewer.js", "/js/assets/textviewer.js", "/js/assets/fontviewer.js", "/js/sound/audiocontroller.js", "/js/sound/knob.js", "/js/sound/slider.js", "/js/sound/keyboard.js", "/js/sound/synthwheel.js", "/js/sound/synth.js", "/js/sound/soundeditor.js", "/js/sound/soundthumbnailer.js", "/js/music/musiceditor.js", "/js/util/undo.js", "/js/util/random.js", "/js/util/splitbar.js", "/js/util/pixelartscaler.js", "/js/runtime/microvm.js", "/js/debug/debug.js", "/js/debug/watch.js", "/js/debug/timemachine.js", "/js/terminal/terminal.js", "/js/project/project.js", "/js/project/projectfolder.js", "/js/project/projectsource.js", "/js/project/projectsprite.js", "/js/project/projectmap.js", "/js/project/projectasset.js", "/js/project/projectsound.js", "/js/project/projectmusic.js", "/js/appui/floatingwindow.js", "/js/appui/appui.js", "/js/app.js", "/js/appstate.js", "/js/tutorial/tutorials.js", "/js/tutorial/tutorial.js", "/js/tutorial/tutorialwindow.js", "/js/tutorial/highlighter.js"];
    this.player_js = ['/js/util/canvas2d.js', "/js/languages/microscript/random.js", "/js/runtime/microvm.js", '/js/runtime/runtime.js', '/js/runtime/projectinterface.js', '/js/runtime/timemachine.js', '/js/runtime/screen.js', '/js/runtime/assetmanager.js', '/js/runtime/keyboard.js', '/js/runtime/gamepad.js', '/js/runtime/sprite.js', '/js/runtime/msimage.js', '/js/runtime/map.js', "/js/runtime/audio/audio.js", "/js/runtime/audio/beeper.js", "/js/runtime/audio/sound.js", "/js/runtime/audio/music.js", '/js/play/player.js', '/js/play/playerclient.js'];
    ref1 = this.alt_players;
    for (key in ref1) {
      value = ref1[key];
      this[key + "_js"] = this.alt_player_base.concat(value.scripts);
    }
    this.audioengine_js = ["/js/sound/audioengine/utils.js", "/js/sound/audioengine/oscillators.js", "/js/sound/audioengine/modulation.js", "/js/sound/audioengine/filters.js", "/js/sound/audioengine/effects.js", "/js/sound/audioengine/voice.js", "/js/sound/audioengine/instrument.js", "/js/sound/audioengine/audioengine.js"];
    this.refresh();
  }

  Concatenator.prototype.refresh = function() {
    var key, ref, value;
    this.concat(this.webapp_js, "webapp_js_concat");
    this.concat(this.player_js, "player_js_concat");
    ref = this.alt_players;
    for (key in ref) {
      value = ref[key];
      this.concat(this[key + "_js"], key + "_js_concat");
    }
    this.concat(this.webapp_css, "webapp_css_concat");
    return this.concat(this.audioengine_js, "audioengine_js_concat");
  };

  Concatenator.prototype.getHomeJSFiles = function() {
    if (this.webapp.server.use_cache && (this.webapp_js_concat != null)) {
      return ["/all.js"];
    } else {
      return this.webapp_js;
    }
  };

  Concatenator.prototype.getHomeCSSFiles = function() {
    if (this.webapp.server.use_cache && (this.webapp_css_concat != null)) {
      return ["/all.css"];
    } else {
      return this.webapp_css;
    }
  };

  Concatenator.prototype.getPlayerJSFiles = function(graphics) {
    var g, player;
    if ((graphics != null) && typeof graphics === "string" && this.alt_players[graphics.toLowerCase()]) {
      g = graphics.toLowerCase();
      player = this.alt_players[g];
      if (this.webapp.server.use_cache && (this.player3d_js_concat != null)) {
        return player.lib.concat(["/" + g + ".js"]);
      } else {
        return player.lib.concat(this[g + "_js"]);
      }
    } else {
      if (this.webapp.server.use_cache && (this.player_js_concat != null)) {
        return ["/play.js"];
      } else {
        return this.player_js;
      }
    }
  };

  Concatenator.prototype.getEngineExport = function(graphics) {
    var g;
    if ((graphics != null) && typeof graphics === "string" && this.alt_players[graphics.toLowerCase()]) {
      g = graphics.toLowerCase();
      return this[g + "_js_concat"] || "";
    } else {
      return this.player_js_concat;
    }
  };

  Concatenator.prototype.concat = function(files, variable, callback) {
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
    funk = (function(_this) {
      return function() {
        if (list.length > 0) {
          f = list.splice(0, 1)[0];
          f = "../static" + f;
          return fs.readFile(f, function(err, data) {
            if ((data != null) && (err == null)) {
              res += data + "\n";
              return funk();
            } else if (err) {
              return console.info(err);
            }
          });
        } else {
          _this[variable] = res;
          if (callback != null) {
            return callback();
          }
        }
      };
    })(this);
    return funk();
  };

  return Concatenator;

})();

module.exports = this.Concatenator;
