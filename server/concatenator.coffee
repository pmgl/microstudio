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

    @webapp.app.get /^\/play3d.js$/, (req,res)=>
      res.setHeader("Content-Type", "text/javascript")
      res.send @player3d_js_concat

    @webapp.app.get /^\/audioengine.js$/, (req,res)=>
      res.setHeader("Content-Type", "text/javascript")
      if not @webapp.server.use_cache
        @concat @audioengine_js,"audioengine_js_concat",()=>
          res.send @audioengine_js_concat
      else
        res.send @audioengine_js_concat

    @webapp_css = [
      "/css/style.css"
      "/css/home.css"
      "/css/doc.css"
      "/css/code.css"
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
      "/js/microscript/random.js"
      "/js/microscript/microvm.js"
      "/js/microscript/tokenizer.js"
      "/js/microscript/token.js"
      "/js/microscript/parser.js"
      "/js/microscript/program.js"
      "/js/microscript/jstranspiler.js"

      "/js/client/client.js"

      "/js/util/canvas2d.js"
      "/js/util/regexlib.js"
      "/js/util/inputvalidator.js"
      "/js/util/translator.js"

      "/js/manager.js"

      "/js/about/about.js"
      "/js/doc/documentation.js"
      "/js/doceditor/doceditor.js"
      "/js/editor/editor.js"
      "/js/editor/runwindow.js"
      "/js/editor/rulercanvas.js"
      "/js/editor/valuetool.js"
      "/js/options/options.js"

      "/js/publish/publish.js"
      "/js/publish/appbuild.js"

      "/js/explore/explore.js"
      "/js/explore/projectdetails.js"
      "/js/user/usersettings.js"
      "/js/user/translationapp.js"

      "/js/spriteeditor/drawtool.js"
      "/js/spriteeditor/spritelist.js"
      "/js/spriteeditor/spriteeditor.js"
      "/js/spriteeditor/colorpicker.js"
      "/js/spriteeditor/spriteview.js"
      "/js/spriteeditor/animationpanel.js"
      "/js/spriteeditor/autopalette.js"

      "/js/mapeditor/mapview.js"
      "/js/mapeditor/mapeditor.js"
      "/js/mapeditor/tilepicker.js"

      "/js/assets/assetsmanager.js"
      "/js/assets/assetviewer.js"

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
      "/js/util/pixelatedimage.js"

      "/js/runtime/sprite.js"
      "/js/runtime/spriteframe.js"
      "/js/runtime/map.js"

      "/js/terminal/terminal.js"

      "/js/project/project.js"
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

      "/js/microscript/random.js"
      "/js/microscript/microvm.js"
      "/js/microscript/tokenizer.js"
      "/js/microscript/token.js"
      "/js/microscript/parser.js"
      "/js/microscript/program.js"
      "/js/microscript/jstranspiler.js"

      '/js/runtime/runtime.js'
      '/js/runtime/screen.js'
      '/js/runtime/keyboard.js'
      '/js/runtime/gamepad.js'
      '/js/runtime/sprite.js'
      '/js/runtime/spriteframe.js'
      '/js/runtime/map.js'
      "/js/runtime/audio/audio.js"
      "/js/runtime/audio/beeper.js"
      "/js/runtime/audio/sound.js"
      "/js/runtime/audio/music.js"
      '/js/play/player.js'
      '/js/play/playerclient.js'
    ]

    @player3d_js = [
      '/js/util/canvas2d.js'

      "/js/microscript/random.js"
      "/js/microscript/microvm.js"
      "/js/microscript/tokenizer.js"
      "/js/microscript/token.js"
      "/js/microscript/parser.js"
      "/js/microscript/program.js"
      "/js/microscript/jstranspiler.js"

      '/js/runtime/m3d/screen3d.js'
      '/js/runtime/m3d/m3d.js'

      '/js/runtime/runtime.js'
      '/js/runtime/keyboard.js'
      '/js/runtime/gamepad.js'
      '/js/runtime/sprite.js'
      '/js/runtime/spriteframe.js'
      '/js/runtime/map.js'
      "/js/runtime/audio/audio.js"
      "/js/runtime/audio/beeper.js"
      "/js/runtime/audio/sound.js"
      "/js/runtime/audio/music.js"
      '/js/play/player.js'
      '/js/play/playerclient.js'
    ]

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
    @concat(@player3d_js,"player3d_js_concat")
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
    if graphics == "M3D"
      if @webapp.server.use_cache and @player3d_js_concat?
        ["/play3d.js"]
      else
        @player3d_js
    else
      if @webapp.server.use_cache and @player_js_concat?
        ["/play.js"]
      else
        @player_js

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
