class @Debug
  constructor:(@app)->
    document.getElementById("open-debugger-button").addEventListener "click",()=>@toggleDebugView()

    window.addEventListener "resize",()=>
      if not @app.appui.debug_splitbar.closed2 and @app.appui.debug_splitbar.position>=99
        @toggleDebugView()

    @watch = new Watch(@app)

  toggleDebugView:()->
    if @app.appui.debug_splitbar.closed2
      @app.appui.debug_splitbar.closed2 = false
      @app.appui.debug_splitbar.position = Math.min(80,@app.appui.debug_splitbar.position)

      @watch.start()
    else
      @app.appui.debug_splitbar.closed2 = true

      @watch.stop()

    @app.appui.debug_splitbar.update()

  projectOpened:()->
    @updateDebuggerVisibility()

  updateDebuggerVisibility:()->
    if @app.project?
      if @app.project.language.indexOf("microscript")>=0
        document.getElementById("open-debugger-button").style.display = "block"
      else
        document.getElementById("open-debugger-button").style.display = "none"
        if not @app.appui.debug_splitbar.closed2
          @app.appui.debug_splitbar.closed2 = true
          @app.appui.debug_splitbar.update()

  projectClosed:()->
    @watch.reset()
