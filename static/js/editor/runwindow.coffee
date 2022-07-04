class @RunWindow
  constructor:(@app)->
    @app.appui.setAction "run-button",()=> @play()
    @app.appui.setAction "pause-button",()=> @pause()
    @app.appui.setAction "reload-button",()=> @reload()
    @app.appui.setAction "run-button-win",()=> @play()
    @app.appui.setAction "pause-button-win",()=> @pause()
    @app.appui.setAction "reload-button-win",()=> @reload()
    @app.appui.setAction "detach-button",()=> @detach()
    @app.appui.setAction "qrcode-button",()=> @showQRCode()
    @app.appui.setAction "take-picture-button",()=> @takePicture()

    @app.appui.setAction "step-forward-button",()=> @stepForward()
    @app.appui.setAction "step-forward-button-win",()=> @stepForward()

    if window.ms_standalone
      document.getElementById("qrcode-button").style.display = "none"

    @app.appui.setAction "clear-button",()=> @clear()
    @app.appui.setAction "console-options-button",()=> @toggleConsoleOptions()

    @rulercanvas = new RulerCanvas @app

    window.addEventListener "resize",()=>
      @windowResized()

    @terminal = new Terminal @

    window.addEventListener "message", (msg)=>
      iframe = document.getElementById("runiframe")
      if iframe? and msg.source == iframe.contentWindow
        @messageReceived msg.data

    @command_table = {}
    @command_id = 0

    @floating_window = new FloatingWindow @app,"run-window",@
    @floating_window.max_ratio = 1

    @initWarnings()

    @message_listeners = {}
    @listeners = []
    @project_access = new ProjectAccess @app,null,@

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

    device = document.getElementById("device")
    code = if @app.project.public then "" else "#{@app.project.code}/"
    url = "#{location.origin.replace(".dev",".io")}/#{@app.project.owner.nick}/#{@app.project.slug}/#{code}"
    origin = "#{location.origin.replace(".dev",".io")}"

    @app.project.savePendingChanges ()=>
      device.innerHTML = "<iframe id='runiframe' allow='autoplay #{origin}; gamepad #{origin}; midi #{origin}' src='#{url}?debug'></iframe>"
      #document.getElementById("runiframe").focus()
      @windowResized()
      document.getElementById("take-picture-button").style.display = "inline-block"

  reload:()->
    @terminal.clear()
    @run()
    document.getElementById("run-button").classList.add("selected")
    document.getElementById("pause-button").classList.remove("selected")
    document.getElementById("reload-button").classList.remove("selected")
    document.getElementById("run-button-win").classList.add("selected")
    document.getElementById("pause-button-win").classList.remove("selected")
    document.getElementById("reload-button-win").classList.remove("selected")

    document.getElementById("step-forward-button").style.display = "none"
    document.getElementById("step-forward-button-win").style.display = "none"
    @propagate "reload"

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

      document.getElementById("step-forward-button").style.display = "none"
      document.getElementById("step-forward-button-win").style.display = "none"

      @propagate "play"

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

    document.getElementById("step-forward-button").style.display = "inline-block"
    document.getElementById("step-forward-button-win").style.display = "inline-block"

    @propagate "pause"

  isPaused:()->
    document.getElementById("pause-button").classList.contains("selected") or document.getElementById("pause-button-win").classList.contains("selected")


  stepForward:()->
    @postMessage
      name: "step_forward"

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

    document.getElementById("step-forward-button").style.display = "none"
    document.getElementById("step-forward-button-win").style.display = "none"

    @propagate "resume"

  resetButtons:()->
    document.getElementById("run-button").classList.remove("selected")
    document.getElementById("pause-button").classList.add("selected")
    document.getElementById("reload-button").classList.add("selected")
    document.getElementById("run-button-win").classList.remove("selected")
    document.getElementById("pause-button-win").classList.add("selected")
    document.getElementById("reload-button-win").classList.add("selected")

    document.getElementById("step-forward-button").style.display = "none"
    document.getElementById("step-forward-button-win").style.display = "none"

  clear:()->
    @terminal.clear()

  toggleConsoleOptions:()->
    div = document.getElementById("console-options")
    if div.getBoundingClientRect().height<= 41
      div.style.height = "115px"
      document.getElementById("terminal-view").style.top = "155px"
    else
      div.style.height = "0px"
      document.getElementById("terminal-view").style.top = "40px"
    setTimeout (()=>@app.appui.runtime_splitbar.update()),600

  updateCode:(file,src)->
    if @error_check?
      clearTimeout @error_check

    @error_buffer = []
    @error_check = setTimeout (()=>
      @error_check = null
      if @terminal.error_lines > 0
        @terminal.clear()

      for err in @error_buffer
        @logError err

    ),3000

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

    #if not ratio? and @app.project.orientation in ["portrait","landscape"]
    #  ratio = 16/9

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
      c.style["margin-top"] = "0px" #{}Math.round((ch-h)/2)+"px"
      c.style.width = Math.round(cw)+"px"
      c.style.height = Math.round(ch)+"px"

    @rulercanvas.resize Math.round(w),Math.round(h),Math.round((ch-h)/2)

  logError:(err)->
    if @error_check?
      @error_buffer.push err
      return

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
      when "assigning_api_variable"
        error = @app.translator.get("Warning: overwriting global API variable '%EXP%'").replace("%EXP%",err.expression)
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
#    if @app.editor.selected_source == info.file
      source = @app.project.getSource(info.file)
      if source?
        if not source.annotations?
          source.annotations = []
        source.annotations.push
          row: info.line-1
          column: info.column-1
          type: "warning"
          text: warning

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
              # @terminal.clear()
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

        when "picture_taken"
          @showPicture(msg.data)

        when "code_paused"
          @pause()

        when "exit"
          @exit()

        when "started"
          @propagate "started"

          if @pending_command?
            iframe = document.getElementById("runiframe")
            if iframe?
              @command_table[@command_id] = @pending_command.output_callback if @pending_command.output_callback?
              iframe.contentWindow.postMessage(JSON.stringify(
                name: "command"
                line: @pending_command.command
                id: if @pending_command.output_callback? then @command_id++ else undefined
              ),"*")
            @pending_command = null

        when "time_machine"
          @app.debug.time_machine.messageReceived msg

        else
          if msg.name? and @message_listeners[msg.name]?
            @message_listeners[msg.name](msg)
          else
            @project_access.messageReceived msg

    catch err

  runCommand:(command,output_callback)->
    @nesting = 0
    return if command.trim().length==0

    if @app.project? and @app.project.language.startsWith "microscript"
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
        return
      else
        @nesting = 0
        @multiline = null

    iframe = document.getElementById("runiframe")
    if iframe?
      @command_table[@command_id] = output_callback if output_callback?
      iframe.contentWindow.postMessage(JSON.stringify(
        name: "command"
        line: command
        id: if output_callback? then @command_id++ else undefined
      ),"*")
    else
      @pending_command =
        command: command
        output_callback: output_callback

      @play()

  projectOpened:()->
    iframe = document.getElementById("runiframe")
    if iframe?
      iframe.parentElement.removeChild iframe
    @terminal.clear()

  projectClosed:()->
    @floating_window.close()
    iframe = document.getElementById("runiframe")
    if iframe?
      iframe.parentElement.removeChild iframe
    document.getElementById("take-picture-button").style.display = "none"
    @hideAll()

  hideQRCode:()->
    if @qrcode?
      document.body.removeChild @qrcode
      @qrcode = null

  showQRCode:()->
    if @app.project?
      if @qrcode?
        @hideQRCode()
      else
        url = location.origin.replace(".dev",".io")+"/"
        url += @app.project.owner.nick+"/"
        url += @app.project.slug+"/"
        if not @app.project.public
          url += @app.project.code + "/"

        qrcode = QRCode.toDataURL url,{margin:2,scale:8},(err,url)=>
          if not err? and url?
            img = new Image
            img.src = url
            img.onload = ()=>
              b = document.getElementById("qrcode-button").getBoundingClientRect()
              img.style.position = "absolute"
              img.style.top = "#{b.y+b.height+20}px"
              img.style.left = "#{Math.min(b.x+b.width/2-132,window.innerWidth-img.width-10)}px"

              @qrcode = img
              @qrcode.addEventListener "click",()=>@showQRCode()
              document.body.appendChild @qrcode

  takePicture:()->
    iframe = document.getElementById("runiframe")
    if iframe?
      iframe.contentWindow.postMessage(JSON.stringify(
        name: "take_picture"
      ),"*")



  hidePicture:()->
    if @picture?
      document.body.removeChild @picture
      @picture = null

  showPicture:(data)->
    @hidePicture()

    @picture = div = document.createElement "div"
    div.classList.add "show-picture"
    div.style.position = "absolute"
    b = document.getElementById("take-picture-button").getBoundingClientRect()
    div.style.top = "#{b.y+b.height+20}px"
    div.style.left = "#{Math.min(b.x+b.width/2-180,window.innerWidth-360-10)}px"
    document.body.appendChild div

    img = new Image
    img.src = data
    img.style.width = "320px"
    div.appendChild img
    div.appendChild document.createElement "br"

    save_button = document.createElement "div"
    save_button.innerText = @app.translator.get "Save"
    save_button.classList.add "save"
    save_button.addEventListener "click",()=>
      @savePicture data,save_button
    div.appendChild save_button
    div.appendChild document.createElement "br"

    set_button = document.createElement "div"
    set_button.innerText = @app.translator.get "Set as project poster image"
    set_button.addEventListener "click",()=>
      @setAsPoster data,set_button
    div.appendChild set_button
    div.appendChild document.createElement "br"

    button = document.createElement "div"
    button.innerText = @app.translator.get "Close"
    button.classList.add "close"
    button.addEventListener "click",()=>
      @hidePicture()
    div.appendChild button

  savePicture:(data,button)->
    link = document.createElement("a")
    link.setAttribute("href", data);
    link.setAttribute("download", "#{@app.project.slug}.png")
    link.click()
    button.style.display = "none"

  setAsPoster:(data,button)->
    button.style.display = "none"
    img = new Image
    img.src = data
    img.onload = ()=>
      canvas = document.createElement "canvas"
      iw = img.width
      ih = img.height
      if iw<ih
        h = Math.min(360,ih)
        r = h/ih*1.2
        canvas.width = w = h/9*16
        canvas.height = h
        canvas.getContext("2d").fillStyle = "#000"
        canvas.getContext("2d").fillRect(0,0,canvas.width,canvas.height)
        canvas.getContext("2d").drawImage img,w/2-r*img.width/2,h/2-r*img.height/2,img.width*r,img.height*r
      else
        w = Math.min(640,iw,ih/9*16)
        h = w/16*9
        r = Math.max(w/img.width,h/img.height)
        canvas.width = w
        canvas.height = h
        canvas.getContext("2d").drawImage img,w/2-r*img.width/2,h/2-r*img.height/2,img.width*r,img.height*r

      data = canvas.toDataURL().split(",")[1]
      poster = @app.project.getSprite "poster"
      @app.client.sendRequest {
        name: "write_project_file"
        project: @app.project.id
        file: "sprites/poster.png"
        properties:
          frames: 1
          fps: 5
        content: data
      },(msg)=>
        @app.project.updateSpriteList()
        if poster?
          poster.reload()

  hideAll:()->
    @hideQRCode()
    @hidePicture()

  exit:()->
    @projectClosed()
    document.getElementById("run-button").classList.remove("selected")
    document.getElementById("pause-button").classList.remove("selected")
    document.getElementById("reload-button").classList.remove("selected")
    document.getElementById("run-button-win").classList.remove("selected")
    document.getElementById("pause-button-win").classList.remove("selected")
    document.getElementById("reload-button-win").classList.remove("selected")
    @propagate "exit"

  postMessage:(data)->
    iframe = document.getElementById("runiframe")
    if iframe?
      iframe.contentWindow.postMessage JSON.stringify(data),"*"

  addMessageListener:(name,callback)->
    @message_listeners[name] = callback

  addListener:(callback)->
    @listeners.push(callback)

  propagate:(event)->
    for l in @listeners
      l(event)
