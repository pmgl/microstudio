class @RunWindow
  constructor:(@app)->
    @app.appui.setAction "run-button",()=> @play()
    @app.appui.setAction "pause-button",()=> @pause()
    @app.appui.setAction "reload-button",()=> @reload()
    @app.appui.setAction "run-button-win",()=> @play()
    @app.appui.setAction "pause-button-win",()=> @pause()
    @app.appui.setAction "reload-button-win",()=> @reload()
    @app.appui.setAction "detach-button",()=> @detach()

    @app.appui.setAction "clear-button",()=> @clear()
    @app.appui.setAction "console-options-button",()=> @toggleConsoleOptions()

    @rulercanvas = new RulerCanvas @app

    window.addEventListener "resize",()=>
      @windowResized()

    @terminal = new Terminal @

    window.onmessage = (msg)=>
      @messageReceived msg.data

    @command_table = {}
    @command_id = 0

    @floating_window = new FloatingWindow @app,"run-window",@
    @floating_window.max_ratio = 1

    @initWarnings()


  initWarnings:()->
    document.getElementById("console-options-warning-undefined").addEventListener "change",()=>
      @warning_undefined = document.getElementById("console-options-warning-undefined").checked
      localStorage.setItem "console_warning_undefined", @warning_undefined

    document.getElementById("console-options-warning-nonfunction").addEventListener "change",()=>
      @warning_nonfunction = document.getElementById("console-options-warning-nonfunction").checked
      localStorage.setItem "console_warning_nonfunction", @warning_nonfunction

    document.getElementById("console-options-warning-assign").addEventListener "change",()=>
      @warning_assign = document.getElementById("console-options-warning-assign").checked
      localStorage.setItem "console_warning_assign", @warning_assign

    @warning_undefined = localStorage.getItem("console_warning_undefined") == "true" or false
    @warning_nonfunction = localStorage.getItem("console_warning_nonfunction") != "false"
    @warning_assign = localStorage.getItem("console_warning_assign") != "false"

    document.getElementById("console-options-warning-undefined").checked = @warning_undefined
    document.getElementById("console-options-warning-nonfunction").checked = @warning_nonfunction
    document.getElementById("console-options-warning-assign").checked = @warning_assign

  detach:()->
    if @detached
      @floating_window.close()
    else
      device = document.getElementById "device"
      if device?
        @detached = true
        document.querySelector("#detach-button i").classList.remove "fa-expand"
        document.querySelector("#detach-button i").classList.add "fa-compress"

        wincontent = document.querySelector "#run-window .content"
        wincontent.innerHTML = ""
        wincontent.appendChild device
        wincontent.appendChild document.getElementById "ruler"

        b = document.querySelector(".devicecontainer").getBoundingClientRect()
        @floating_window.resize b.x-5,b.y-45,b.width+10,b.height+90

        @floating_window.show()
        @floatingWindowResized()
        document.getElementById("runtime").style.display = "none"

  floatingWindowResized:()->
    @windowResized()

  floatingWindowClosed:()->
    return if not @detached
    @detached = false
    device = document.getElementById "device"
    if device?
      container = document.querySelector(".devicecontainer")
      container.innerHTML = ""
      container.appendChild device
      container.appendChild document.getElementById "ruler"

      document.querySelector("#detach-button i").classList.add "fa-expand"
      document.querySelector("#detach-button i").classList.remove "fa-compress"
      document.getElementById("runtime").style.display = "block"
      @windowResized()

  run:()->
    src = @app.editor.editor.getValue()

    resource =
      images: []

    for image in @app.project.sprite_list
      resource.images.push image.file
    #if @runtime?
    #  @runtime.stop()
    #@runtime = new Runtime(location.origin+"/#{@app.appui.nick}/#{@app.appui.project.slug}/",src,resource)

    device = document.getElementById("device")
    code = if @app.project.public then "" else "#{@app.project.code}/"
    url = "#{location.origin.replace(".dev",".io")}/#{@app.project.owner.nick}/#{@app.project.slug}/#{code}"

    @app.project.savePendingChanges ()=>
      device.innerHTML = "<iframe id='runiframe' allow='autoplay;gamepad' src='#{url}?debug'></iframe>"
      #document.getElementById("runiframe").focus()
      @windowResized()

  reload:()->
    @run()
    document.getElementById("run-button").classList.add("selected")
    document.getElementById("pause-button").classList.remove("selected")
    document.getElementById("reload-button").classList.remove("selected")
    document.getElementById("run-button-win").classList.add("selected")
    document.getElementById("pause-button-win").classList.remove("selected")
    document.getElementById("reload-button-win").classList.remove("selected")

  play:()->
    if document.getElementById("runiframe")?
      @resume()
    else
      @run()
      document.getElementById("run-button").classList.add("selected")
      document.getElementById("pause-button").classList.remove("selected")
      document.getElementById("reload-button").classList.remove("selected")
      document.getElementById("run-button-win").classList.add("selected")
      document.getElementById("pause-button-win").classList.remove("selected")
      document.getElementById("reload-button-win").classList.remove("selected")

  pause:()->
    e = document.getElementById("runiframe")
    if e?
      e.contentWindow.postMessage  JSON.stringify({
        name:"pause"
      }),"*"
    document.getElementById("run-button").classList.remove("selected")
    document.getElementById("pause-button").classList.add("selected")
    document.getElementById("reload-button").classList.remove("selected")
    document.getElementById("run-button-win").classList.remove("selected")
    document.getElementById("pause-button-win").classList.add("selected")
    document.getElementById("reload-button-win").classList.remove("selected")

  resume:()->
    e = document.getElementById("runiframe")
    if e?
      e.contentWindow.postMessage JSON.stringify({
        name:"resume"
      }),"*"
      e.contentWindow.focus()
    document.getElementById("run-button").classList.add("selected")
    document.getElementById("pause-button").classList.remove("selected")
    document.getElementById("reload-button").classList.remove("selected")
    document.getElementById("run-button-win").classList.add("selected")
    document.getElementById("pause-button-win").classList.remove("selected")
    document.getElementById("reload-button-win").classList.remove("selected")

  resetButtons:()->
    document.getElementById("run-button").classList.remove("selected")
    document.getElementById("pause-button").classList.add("selected")
    document.getElementById("reload-button").classList.add("selected")
    document.getElementById("run-button-win").classList.remove("selected")
    document.getElementById("pause-button-win").classList.add("selected")
    document.getElementById("reload-button-win").classList.add("selected")

  clear:()->
    @terminal.clear()

  toggleConsoleOptions:()->
    div = document.getElementById("runtime-splitbar")
    if div.getBoundingClientRect().height<= 41
      div.style.height = "180px"
    else
      div.style.height = "40px"
    setTimeout (()=>@app.appui.runtime_splitbar.update()),600

  updateCode:(file,src)->
    src = @app.editor.editor.getValue()
    iframe = document.getElementById("runiframe")
    if iframe?
      iframe.contentWindow.postMessage JSON.stringify({
        name: "code_updated"
        file: file
        code: src
      }),"*"

  updateSprite:(name)->
    iframe = document.getElementById("runiframe")
    if iframe?
      sprite = @app.project.getSprite(name)
      if sprite?
        data = sprite.saveData().split(",")[1]
        properties =
          frames: sprite.frames.length
          fps: sprite.fps

        iframe.contentWindow.postMessage JSON.stringify({
          name: "sprite_updated"
          file: name
          data: data
          properties: properties
        }),"*"

  updateMap:(name)->
    iframe = document.getElementById("runiframe")
    if iframe?
      map = @app.project.getMap(name)
      if map?
        data = map.save()

        iframe.contentWindow.postMessage JSON.stringify({
          name: "map_updated"
          file: name
          data: data
        }),"*"

  windowResized: ()->
    r = document.getElementById "device"
    c = document.getElementById("device").firstChild
    return if not @app.project?

    cw = r.clientWidth
    ch = r.clientHeight

    ratio = {
      "4x3": 4/3
      "16x9": 16/9
      "2x1": 2/1
      "1x1": 1/1
    }[@app.project.aspect]

    if not ratio? and @app.project.orientation in ["portrait","landscape"]
      ratio = 16/9

    if ratio?
      switch @app.project.orientation
        when "portrait"
          r = Math.min(cw,ch/ratio)/cw
          w = cw*r
          h = cw*r*ratio

        when "landscape"
          r = Math.min(cw/ratio,ch)/ch
          w = ch*r*ratio
          h = ch*r

        else
          if cw>ch
            r = Math.min(cw/ratio,ch)/ch
            w = ch*r*ratio
            h = ch*r
          else
            r = Math.min(cw,ch/ratio)/cw
            w = cw*r
            h = cw*r*ratio
    else
      w = cw
      h = ch

    if c?
      c.style["margin-top"] = Math.round((ch-h)/2)+"px"
      c.style.width = Math.round(w)+"px"
      c.style.height = Math.round(h)+"px"

    @rulercanvas.resize Math.round(w),Math.round(h),Math.round((ch-h)/2)

  logError:(err)->
    error = err.error
    switch err.type
      when "non_function"
        return if not @warning_nonfunction
        error = @app.translator.get("Warning: %EXP% is not a function").replace("%EXP%",err.expression)
        @annotateWarning(error,err)
      when "undefined_variable"
        return if not @warning_undefined
        error = @app.translator.get("Warning: %EXP% is not defined, defaulting to zero").replace("%EXP%",err.expression)
        @annotateWarning(error,err)
      when "assigning_undefined"
        return if not @warning_assign
        error = @app.translator.get("Warning: %EXP% is not defined, will be initialized to an empty object").replace("%EXP%",err.expression)
        @annotateWarning(error,err)

    if err.line?
      if err.file
        text = @app.translator.get("%ERROR%, in file \"%FILE%\" at line %LINE%")
        if err.column
          text += ", column %COLUMN%"

        @terminal.error text.replace("%ERROR%",error).replace("%FILE%",err.file).replace("%LINE%",err.line).replace("%COLUMN%",err.column)
      else
        @terminal.error error
    else
      @terminal.error "#{error}"

  annotateWarning:(warning,info)->
    if @app.editor.selected_source == info.file
      source = @app.project.getSource(info.file)
      if source?
        source.annotations = [{
          row: info.line-1
          column: info.column-1
          type: "warning"
          text: warning
        }]
        @app.project.notifyListeners "annotations"

  messageReceived:(msg)->
    try
      msg = JSON.parse msg
      switch msg.name
        when "error"
          if msg.data
            @logError msg.data
            if @app.editor.selected_source == msg.data.file
              source = @app.project.getSource(msg.data.file)
              if source? and msg.data.error
                source.annotations = [{
                  row: msg.data.line-1
                  column: msg.data.column-1
                  type: "error"
                  text: msg.data.error
                }]
                @app.project.notifyListeners "annotations"
          console.info msg.data

        when "compile_success"
          source = @app.project.getSource(msg.file)
          if source?
            if source.annotations? and source.annotations.length>0
              @terminal.clear()
              source.annotations = []
              @app.project.notifyListeners "annotations"
        when "log"
          @terminal.echo msg.data

        when "output"
          if msg.data?
            if msg.id and @command_table[msg.id]?
              c = @command_table[msg.id]
              @command_table[msg.id] = null
              c msg.data
            else
              @terminal.echo msg.data
        when "focus"
          e = document.getElementById("runiframe")
          if e?
            e.contentWindow.focus()

    catch err

  runCommand:(command,output_callback)->
    @nesting = 0
    return if command.trim().length==0
    iframe = document.getElementById("runiframe")
    if iframe?
      @command_table[@command_id] = output_callback if output_callback?
      iframe.contentWindow.postMessage(JSON.stringify(
        name: "command"
        line: command
        id: if output_callback? then @command_id++ else undefined
      ),"*")
    else
      if not @local_vm?
        meta =
          print: (text)=>
            if typeof text == "object"
              text = Program.toString(text)
            @terminal.echo(text)
            return

        global = {}
        @local_vm = new MicroVM(meta,global,null,true)

      if @multiline?
        @multiline += "\n"+command
        command = @multiline

      parser = new Parser(command)
      parser.parse()
      if parser.error_info
        @nesting = parser.nesting
        if parser.unexpected_eof
          @multiline = command
        else
          @multiline = null
          @logError parser.error_info
      else
        @nesting = 0
        @multiline = null
        @local_vm.clearWarnings()
        res = @local_vm.run(command)
        @reportWarnings()
        if output_callback?
          output_callback(res)
        else if @local_vm.error_info
          @logError(@local_vm.error_info)
        else
          if not command.trim().startsWith("print") and not parser.program.isAssignment()
            @local_vm.context.meta.print(res)

  reportWarnings:()->
    if @local_vm?
      for key,value of @local_vm.context.warnings.invoking_non_function
        if not value.reported
          value.reported = true
          @logError
            error: ""
            type: "non_function"
            expression: value.expression
            line: value.line
            column: value.column
            file: value.file

      for key,value of @local_vm.context.warnings.using_undefined_variable
        if not value.reported
          value.reported = true
          @logError
            error: ""
            type: "undefined_variable"
            expression: value.expression
            line: value.line
            column: value.column
            file: value.file

      for key,value of @local_vm.context.warnings.assigning_field_to_undefined
        if not value.reported
          value.reported = true
          @logError
            error: ""
            type: "assigning_undefined"
            expression: value.expression
            line: value.line
            column: value.column
            file: value.file

  projectOpened:()->
    iframe = document.getElementById("runiframe")
    if iframe?
      iframe.parentElement.removeChild iframe
    @terminal.clear()

  projectClosed:()->
    @floating_window.close()
