fs = require "fs"

class @Concatenator
  constructor:(@webapp)->
    @webapp.app.get /^\/all.js$/, (req,res)=>
      res.setHeader("Content-Type", "text/javascript")
      res.send @webapp_js_concat

    @webapp.app.get /^\/all.css$/, (req,res)=>
      res.setHeader("Content-Type", "text/css")
      res.send @webapp_css_concat

    @webapp.app.get /^\/play.js$/, (req,res)=>
      res.setHeader("Content-Type", "text/javascript")
      res.send @player_js_concat

    @webapp.app.get /^\/audioengine.js$/, (req,res)=>
      res.setHeader("Content-Type", "text/javascript")
      if not @webapp.server.use_cache
        @concat @audioengine_js,"audioengine_js_concat",()=>
          res.send @audioengine_js_concat
      else
        res.send @audioengine_js_concat

    @alt_player_base = [
      '/js/util/canvas2d.js'
      "/js/languages/microscript/random.js"
      "/js/runtime/microvm.js"
      '/js/runtime/runtime.js'
      '/js/runtime/projectinterface.js'
      '/js/runtime/timemachine.js'
      '/js/runtime/assetmanager.js'
      '/js/runtime/keyboard.js'
      '/js/runtime/gamepad.js'
      '/js/runtime/sprite.js'
      '/js/runtime/msimage.js'
      '/js/runtime/map.js'
      "/js/runtime/audio/audio.js"
      "/js/runtime/audio/beeper.js"
      "/js/runtime/audio/sound.js"
      "/js/runtime/audio/music.js"
      '/js/play/player.js'
      '/js/play/playerclient.js'
    ]

    @alt_players =
      m2d:
        lib: ["/lib/pixijs/pixi.min.js"]
        lib_path: ["node_modules/pixi.js/dist/browser/pixi.min.js"]
        scripts: ['/js/runtime/m2d/screen.js','/js/runtime/m2d/m2d.js']
      m3d:
        lib: ["/lib/babylonjs/babylon.js","/lib/babylonjs/babylonjs.loaders.min.js"]
        lib_path: ["node_modules/babylonjs/babylon.js","node_modules/babylonjs-loaders/babylonjs.loaders.min.js"]
        scripts: ['/js/runtime/m3d/screen.js','/js/runtime/m3d/m3d.js']
      pixi:
        lib: ["/lib/pixijs/pixi.min.js"]
        lib_path: ["node_modules/pixi.js/dist/browser/pixi.min.js"]
        scripts: ['/js/runtime/pixi/screen.js','/js/runtime/pixi/pixi.js']
      babylon:
        lib: ["/lib/babylonjs/babylon.js","/lib/babylonjs/babylonjs.loaders.min.js"]
        lib_path: ["node_modules/babylonjs/babylon.js","node_modules/babylonjs-loaders/babylonjs.loaders.min.js"]
        scripts: ['/js/runtime/babylon/screen.js','/js/runtime/babylon/babylon.js']

    @optional_libs =
      matterjs:
        title: "matter.js - 2D physics engine"
        lib: "/lib/matterjs/matter.min.js"
        lib_path: "node_modules/matter-js/build/matter.min.js"

      cannonjs:
        title: "cannon.js - 3D physics engine"
        lib: "/lib/cannonjs/cannon.min.js"
        lib_path: "node_modules/cannon/build/cannon.min.js"


    @language_engines =
      microscript_v2:
        title: "microScript 2.0"
        scripts: [ "/js/languages/microscript/v2/compiler.js",
          "/js/languages/microscript/v2/parser.js",
          "/js/languages/microscript/v2/processor.js",
          "/js/languages/microscript/v2/program.js",
          "/js/languages/microscript/v2/routine.js",
          "/js/languages/microscript/v2/runner.js",
          "/js/languages/microscript/v2/token.js",
          "/js/languages/microscript/v2/tokenizer.js",
          "/js/languages/microscript/v2/transpiler.js" ]
        lib: []

      python:
        title: "Python"
        scripts: ["/js/languages/python/runner.js"]
        lib:["/lib/brython/brython.js","/lib/brython/brython_stdlib.js"]
        lib_path:["node_modules/brython/brython.js","node_modules/brython/brython_stdlib.js"]

      lua:
        title: "Lua"
        scripts: ["/js/languages/lua/runner.js"]
        lib:["/lib/fengari/fengari-web.js"]
        lib_path:["node_modules/fengari-web/dist/fengari-web.js"]

      javascript:
        title: "JavaScript"
        scripts: ["/js/languages/javascript/runner.js"]
        lib: []

      microscript_v1_i:
        title: "microScript 1.0 - interpreted"
        scripts: [ "/js/languages/microscript/parser.js",
          "/js/languages/microscript/program.js",
          "/js/languages/microscript/token.js",
          "/js/languages/microscript/tokenizer.js",
          "/js/languages/microscript/runner_v1_i.js"]
        lib: []

      microscript_v1_t:
        title: "microScript 1.0 - transpiled"
        scripts: [ "/js/languages/microscript/parser.js",
          "/js/languages/microscript/program.js",
          "/js/languages/microscript/token.js",
          "/js/languages/microscript/tokenizer.js",
          "/js/languages/microscript/jstranspiler.js" ,
          "/js/languages/microscript/runner_v1_t.js" ]
        lib: []


      #blockly:
      #  title: "Blockly"
      #  scripts: []
      #  lib: []

    for key,value of @alt_players
      @webapp.app.get new RegExp("^\\/#{key}.js$"), (req,res)=>
        res.setHeader("Content-Type", "text/javascript")
        res.send @["#{key}_js_concat"]

    @webapp_css = [
      "/css/style.css"
      "/css/home.css"
      "/css/doc.css"
      "/css/code.css"
      "/css/debug.css"
      "/css/assets.css"
      "/css/sprites.css"
      "/css/sounds.css"
      "/css/synth.css"
      "/css/music.css"
      "/css/maps.css"
      "/css/publish.css"
      "/css/explore.css"
      "/css/options.css"
      "/css/user.css"
      "/css/media.css"
      "/css/terminal.css"
      "/css/tutorial.css"
      "/css/md.css"
    ]

    @webapp_js = [
      "/js/languages/microscript/random.js"

      "/js/languages/microscript/v2/parser.js",
      "/js/languages/microscript/v2/program.js",
      "/js/languages/microscript/v2/token.js",
      "/js/languages/microscript/v2/tokenizer.js",

      "/js/languages/microscript/microscript.js"
      "/js/languages/python/python.js"
      "/js/languages/javascript/javascript.js"
      "/js/languages/lua/lua.js"

      "/js/client/client.js"

      "/js/util/confirm.js"
      "/js/util/canvas2d.js"
      "/js/util/regexlib.js"
      "/js/util/inputvalidator.js"
      "/js/util/translator.js"

      "/js/manager.js"
      "/js/folderview.js"

      "/js/about/about.js"
      "/js/doc/documentation.js"
      "/js/doceditor/doceditor.js"
      "/js/editor/editor.js"
      "/js/editor/runwindow.js"
      "/js/editor/projectaccess.js"
      "/js/editor/rulercanvas.js"
      "/js/editor/valuetool.js"
      "/js/options/options.js"
      "/js/options/tabmanager.js"
      "/js/options/pluginview.js"

      "/js/publish/publish.js"
      "/js/publish/appbuild.js"

      "/js/explore/explore.js"
      "/js/explore/projectdetails.js"
      "/js/user/usersettings.js"
      "/js/user/translationapp.js"
      "/js/user/progress.js"

      "/js/spriteeditor/drawtool.js"
      "/js/spriteeditor/spritelist.js"
      "/js/spriteeditor/spriteeditor.js"
      "/js/spriteeditor/colorpicker.js"
      "/js/spriteeditor/spriteview.js"
      "/js/spriteeditor/animationpanel.js"
      "/js/spriteeditor/autopalette.js"
      "/js/spriteeditor/sprite.js"
      "/js/spriteeditor/spriteframe.js"

      "/js/mapeditor/mapview.js"
      "/js/mapeditor/mapeditor.js"
      "/js/mapeditor/tilepicker.js"
      "/js/mapeditor/map.js"

      "/js/assets/assetsmanager.js"
      "/js/assets/modelviewer.js"
      "/js/assets/imageviewer.js"
      "/js/assets/textviewer.js"
      "/js/assets/fontviewer.js"

      "/js/sound/audiocontroller.js"
      "/js/sound/knob.js"
      "/js/sound/slider.js"
      "/js/sound/keyboard.js"
      "/js/sound/synthwheel.js"
      "/js/sound/synth.js"
      "/js/sound/soundeditor.js"
      "/js/sound/soundthumbnailer.js"

      "/js/music/musiceditor.js"

      "/js/util/undo.js"
      "/js/util/random.js"
      "/js/util/splitbar.js"
      "/js/util/pixelartscaler.js"

      "/js/runtime/microvm.js"

      "/js/debug/debug.js"
      "/js/debug/watch.js"
      "/js/debug/timemachine.js"
      "/js/terminal/terminal.js"

      "/js/project/project.js"
      "/js/project/projectfolder.js"
      "/js/project/projectsource.js"
      "/js/project/projectsprite.js"
      "/js/project/projectmap.js"
      "/js/project/projectasset.js"
      "/js/project/projectsound.js"
      "/js/project/projectmusic.js"

      "/js/appui/floatingwindow.js"
      "/js/appui/appui.js"
      "/js/app.js"
      "/js/appstate.js"

      "/js/tutorial/tutorials.js"
      "/js/tutorial/tutorial.js"
      "/js/tutorial/tutorialwindow.js"
      "/js/tutorial/highlighter.js"
    ]

    @player_js = [
      '/js/util/canvas2d.js'

      "/js/languages/microscript/random.js"
      "/js/runtime/microvm.js"
      '/js/runtime/runtime.js'
      '/js/runtime/projectinterface.js'
      '/js/runtime/timemachine.js'
      '/js/runtime/screen.js'
      '/js/runtime/assetmanager.js'
      '/js/runtime/keyboard.js'
      '/js/runtime/gamepad.js'
      '/js/runtime/sprite.js'
      '/js/runtime/msimage.js'
      '/js/runtime/map.js'
      "/js/runtime/audio/audio.js"
      "/js/runtime/audio/beeper.js"
      "/js/runtime/audio/sound.js"
      "/js/runtime/audio/music.js"
      '/js/play/player.js'
      '/js/play/playerclient.js'
    ]

    for key,value of @alt_players
      @["#{key}_js"] = @alt_player_base.concat(value.scripts)

    @audioengine_js = [
      "/js/sound/audioengine/utils.js"
      "/js/sound/audioengine/oscillators.js"
      "/js/sound/audioengine/modulation.js"
      "/js/sound/audioengine/filters.js"
      "/js/sound/audioengine/effects.js"
      "/js/sound/audioengine/voice.js"
      "/js/sound/audioengine/instrument.js"
      "/js/sound/audioengine/audioengine.js"
    ]

    @refresh()

  refresh:()->
    @concat(@webapp_js,"webapp_js_concat")
    @concat(@player_js,"player_js_concat")
    for key,value of @alt_players
      @concat(@["#{key}_js"],"#{key}_js_concat")
    @concat(@webapp_css,"webapp_css_concat")
    @concat(@audioengine_js,"audioengine_js_concat")

  getHomeJSFiles:()->
    if @webapp.server.use_cache and @webapp_js_concat?
      ["/all.js"]
    else
      @webapp_js

  getHomeCSSFiles:()->
    if @webapp.server.use_cache and @webapp_css_concat?
      ["/all.css"]
    else
      @webapp_css

  getPlayerJSFiles:(graphics)->
    if graphics? and typeof graphics == "string" and @alt_players[graphics.toLowerCase()]
      g = graphics.toLowerCase()
      player = @alt_players[g]
      if @webapp.server.use_cache and @player3d_js_concat?
        player.lib.concat ["/#{g}.js"]
      else
        player.lib.concat @["#{g}_js"]
    else
      if @webapp.server.use_cache and @player_js_concat?
        ["/play.js"]
      else
        @player_js

  getEngineExport:(graphics)->
    if graphics? and typeof graphics == "string" and @alt_players[graphics.toLowerCase()]
      g = graphics.toLowerCase()
      @["#{g}_js_concat"] or ""
    else
      @player_js_concat

  concat:(files,variable,callback)->
    list = (f for f in files)
    res = ""
    funk = ()=>
      if list.length>0
        f = list.splice(0,1)[0]
        f = "../static"+f
        fs.readFile f,(err,data)=>
          if data? and not err?
            res += data+"\n"
            funk()
          else if err
            console.info err
      else
        @[variable] = res
        callback() if callback?

    funk()

module.exports = @Concatenator
