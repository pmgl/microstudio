class @Debug
  constructor:(@app)->
    document.getElementById("open-debugger-button").addEventListener "click",()=>@toggleDebugView()
    document.getElementById("open-timemachine-button").addEventListener "click",()=>@toggleTimeMachineView()

    window.addEventListener "resize",()=>
      if not @app.appui.debug_splitbar.closed2 and @app.appui.debug_splitbar.position>=99
        @toggleDebugView()

    @watch = new Watch @app
    @time_machine = new TimeMachine @app

  toggleDebugView:()->
    if @app.appui.debug_splitbar.closed2
      @app.appui.debug_splitbar.closed2 = false
      @app.appui.debug_splitbar.position = Math.min(80,@app.appui.debug_splitbar.position)

      @watch.start()
    else
      @app.appui.debug_splitbar.closed2 = true

      @watch.stop()

    @app.appui.debug_splitbar.update()

  toggleTimeMachineView:()->
    if @time_machine_open
      @time_machine_open = false
      document.getElementById("debug-timemachine-bar").style.display = "none"
      document.getElementById("terminal-debug-container").style.top = "2px"
      @time_machine.closed()
    else
      @time_machine_open = true
      document.getElementById("debug-timemachine-bar").style.display = "block"
      document.getElementById("terminal-debug-container").style.top = "42px"

  projectOpened:()->
    @updateDebuggerVisibility()

  updateDebuggerVisibility:()->
    if @app.project?
      timemachine = @app.project.language.indexOf("microscript")>=0 and @app.project.graphics.toLowerCase() == "m1"
      document.getElementById("open-timemachine-button").style.display = if timemachine then "block" else "none"

      if @app.project.language.indexOf("microscript")>=0
        document.getElementById("open-debugger-button").style.display = "block"
      else
        document.getElementById("open-debugger-button").style.display = "none"
        if not @app.appui.debug_splitbar.closed2
          @app.appui.debug_splitbar.closed2 = true
          @app.appui.debug_splitbar.update()

  projectClosed:()->
    @watch.reset()
    if @time_machine_open
      @toggleTimeMachineView()
