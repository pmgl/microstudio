class @Editor extends Manager
  constructor:(app)->
    super(app)
    
    @language = @app.languages.microscript

    @folder = "ms"
    @item = "source"
    @main_splitpanel = "code-editor"
    @list_change_event = "sourcelist"
    @get_item = "getSource"
    @use_thumbnails = false
    @extensions = ["ms"]
    @update_list = "updateSourceList"
    @file_icon = "fa fa-file"

    @init()
    ace.require("ace/ext/language_tools");
    
    @editor = ace.edit "editor-view"
    @editor.$blockScrolling = Infinity
    @editor.setTheme("ace/theme/tomorrow_night_bright")
    @editor.getSession().setMode(@language.ace_mode)
    @editor.setFontSize("14px")
    @editor.setOptions
      tabSize: 2
      useSoftTabs: true
      useWorker: false # disables lua autocorrection ; preserves syntax coloring
      enableBasicAutocompletion: true
      enableSnippets: true
      enableLiveAutocompletion: true

    @update_delay = 50
    @update_time = 0
    setInterval (()=>@check()),@update_delay/2

    @save_delay = 3000
    @save_time = 0
    setInterval (()=>@checkSave()),@save_delay/2

    @keydown_count = 0
    @lines_of_code = 0

    @editor.getSession().on "change",()=>
      @editorContentsChanged()

    @editor.on "blur",()=>
      @app.runwindow.rulercanvas.hide()
      document.getElementById("help-window").classList.add("disabled")

    @editor.on "focus",()=>
      @checkValueToolButtons()
      @cancelValueTool()
      if @show_help
        document.getElementById("help-window").classList.remove("disabled")
        @liveHelp()

    @RULER_FUNCTIONS = ["fillRect","fillRound","fillRoundRect","drawRect","drawRound","drawRoundRect","drawSprite","drawMap","drawText","drawLine","drawPolygon","fillPolygon"]

    @number_tool_button = document.getElementById("number-value-tool-button")
    @color_tool_button = document.getElementById("color-value-tool-button")

    @number_tool_button.addEventListener "click",(event)=>
      event.preventDefault()
      if @value_tool
        @cancelValueTool()
      else
        @showValueTool()

    @color_tool_button.addEventListener "click",(event)=>
      event.preventDefault()
      if @value_tool
        @cancelValueTool()
      else
        @showValueTool()

    @editor.selection.on "changeCursor", ()=>
      @liveHelp()
      @drawHelper() if not @value_tool?
      @checkValueToolButtons()

    @show_help = true
    document.querySelector("#help-window-content").addEventListener "mousedown",(event)=>
      event.stopPropagation()
      @show_help = not @show_help
      event.preventDefault()
      if not @show_help
        document.querySelector("#help-window").classList.add "disabled"
        document.querySelector("#help-window-content").classList.remove "displaycontent"
      else
        document.querySelector("#help-window").classList.remove "disabled"
        @liveHelp()
        @editor.focus()

    document.addEventListener "keydown",(event)=>
      try
        if event.keyCode == 13 and @editor.getSelectionRange().start.column>1
          @lines_of_code += 1
        else if event.keyCode != 13
          @keydown_count += 1
      catch err
        console.error err

      if event.keyCode != 17 and event.ctrlKey
        @cancelValueTool()
        @ignore_ctrl_up = true
      return

    document.addEventListener "keyup",(event)=>
      return if not document.getElementById("editor-view").offsetParent?
      if event.keyCode == 17 and not event.altKey
        if @ignore_ctrl_up
          @ignore_ctrl_up = false
          return

        if @value_tool
          @cancelValueTool()
        else
          @showValueTool()
      return

    document.querySelector("#code-search").addEventListener "click",(event)=>
      @editor.execCommand("find")

    @font_size = 14
    @MIN_FONT_SIZE = 8
    @MAX_FONT_SIZE = 30

    f = localStorage.getItem("code_editor_font_size")
    if f?
      try
        f = parseInt(f)
        if f>=@MIN_FONT_SIZE and f<@MAX_FONT_SIZE
          @font_size = f
          @editor.setOptions({ fontSize: @font_size })

    document.querySelector("#code-font-minus").addEventListener "click",(event)=>
      @font_size = Math.max(@MIN_FONT_SIZE,@font_size-1)
      @editor.setOptions({ fontSize: @font_size })
      localStorage.setItem("code_editor_font_size",@font_size)

    document.querySelector("#code-font-plus").addEventListener "click",(event)=>
      @font_size = Math.min(@MAX_FONT_SIZE,@font_size+1)
      @editor.setOptions({ fontSize: @font_size })
      localStorage.setItem("code_editor_font_size",@font_size)

    @lib_manager_button = document.querySelector "#manage-libs-button"
    @lib_manager = document.querySelector ".lib-manager-container"
    @editor_view = document.querySelector "#editor-view"

    @lib_manager_button.addEventListener "click",()=>
      @toggleLibManager()

  updateLanguage:()->
    if @app.project
      switch @app.project.language
        when "python" then @language = @app.languages.python
        when "javascript" then @language = @app.languages.javascript
        when "lua" then @language = @app.languages.lua
        when "microscript_v2" then @language = @app.languages.microscript2
        else
          @language = @app.languages.microscript

    @editor.getSession().setMode(@language.ace_mode)
    @updateSourceLanguage()

  checkEmbeddedJavaScript:(src)->
    if @app.project.language == "microscript_v2"
      if /^\s*\/\/\s*javascript\s*\n/.test(src)
        if @language != @app.languages.javascript
          @language = @app.languages.javascript
          @editor.getSession().setMode(@language.ace_mode)
      else
        if @language != @app.languages.microscript2
          @language = @app.languages.microscript2
          @editor.getSession().setMode(@language.ace_mode)

  editorContentsChanged:()->
    return if @ignore_changes
    src = @editor.getValue()
    @checkEmbeddedJavaScript src
    @update_time = Date.now()
    @save_time = Date.now()
    @app.project.addPendingChange @
    if @selected_source?
      @app.project.lockFile "ms/#{@selected_source}.ms"
      source = @app.project.getSource @selected_source
      if source?
        source.content = @getCode()

    @drawHelper() if not @value_tool?

  check:()->
    if @update_time>0 and (@value_tool or Date.now()>@update_time+@update_delay)
      @update_time = 0
      if @language.parser
        parser = new @language.parser(@editor.getValue())
        p = parser.parse()
        if not parser.error_info?
          @app.runwindow.updateCode(@selected_source+".ms",@getCode())
      else
        @app.runwindow.updateCode(@selected_source+".ms",@getCode())

  getCurrentLine:()->
    range = @editor.getSelectionRange()
    row = range.start.row
    @editor.session.getLine(row)

  checkSave:(immediate=false,callback)->
    if @save_time>0 and (immediate or Date.now()>@save_time+@save_delay)
      @saveCode(callback)
      @save_time = 0

  forceSave:(callback)->
    @checkSave(true,callback)

  saveCode:(callback)->
    source = @app.project.getSource(@selected_source)
    saved = false
    lines = @lines_of_code
    keycount = @keydown_count
    @keydown_count = 0
    @lines_of_code = 0

    @app.client.sendRequest {
      name: "write_project_file"
      project: @app.project.id
      file: "ms/#{@selected_source}.ms"
      characters: keycount
      lines: lines
      content: @getCode()
    },(msg)=>
      saved = true
      @app.project.removePendingChange(@) if @save_time == 0
      if source
        source.size = msg.size
      callback() if callback?

    setTimeout (()=>
      if not saved
       @save_time = Date.now()
       console.info("retrying code save...")
      ),10000

  getCode:()->
    @editor.getValue()

  setCode:(code)->
    @ignore_changes = true
    @editor.setValue(code,-1)
    @editor.getSession().setUndoManager(new ace.UndoManager())
    @ignore_changes = false
    @updateCurrentFileLock()
    @checkEmbeddedJavaScript code

  addDocButton:(pointer,section)->
    content = document.querySelector("#help-window .content")
    button = document.createElement "div"
    button.classList.add "see-doc-button"
    button.innerHTML = "<i class='fa fa-book-open'></i> "+@app.translator.get("View doc")
    button.addEventListener "mousedown",(event)=>
      event.stopPropagation()
      @app.documentation.setSection section or "API"
      @app.appui.setMainSection "help",true
      element = document.getElementById pointer
      if element?
        element.scrollIntoView()

    content.insertBefore button,content.firstChild


  liveHelp:()->
    return if not @show_help
    line = @getCurrentLine().replace(":",".")
    column = @editor.getSelectionRange().start.column
    suggest = @app.documentation.findSuggestMatch(line,column)
    content = document.querySelector("#help-window .content")

    if suggest.length == 0
      help = @app.documentation.findHelpMatch(line)
      if help.length>0
        content.innerHTML = DOMPurify.sanitize marked help[0].value
        document.querySelector("#help-window").classList.add("showing")
        @addDocButton(help[0].pointer,help[0].section)
      else
        content.innerHTML = ""
        c = document.querySelector "#help-window-content"
        c.classList.remove "displaycontent"
        return
    else if suggest.length == 1
      content.innerHTML = DOMPurify.sanitize marked suggest[0].value
      document.querySelector("#help-window").classList.add("showing")
      @addDocButton(suggest[0].pointer,suggest[0].section)
    else
      md = ""
      for res in suggest
        md += res.ref + "\n\n"
      content.innerHTML = DOMPurify.sanitize marked md
      document.querySelector("#help-window").classList.add("showing")
      @addDocButton(suggest[0].pointer,suggest[0].section)

    c = document.querySelector "#help-window-content"
    if window.innerWidth < 800
      c.style["max-width"] = (window.innerWidth-120) + "px"
    else
      c.style["max-width"] = "unset"
    if @app.appui.code_splitbar.type == "vertical"
      c.classList.add "displaycontent"
      c.classList.add "vertical"
    else
      c.classList.add "displaycontent"
      c.classList.remove "vertical"

  tokenizeLine:(line)->
    tokenizer = new Tokenizer(line.replace(":","."))
    index = 0
    list = []
    try
      loop
        token = tokenizer.next()
        break if not token?
        list.push
          token: token
          start: index
          end: tokenizer.index
        index = tokenizer.index
    catch err

    list

  checkValueToolButtons:()->
    range = @editor.getSelectionRange()
    row = range.start.row
    column = range.start.column
    line = @editor.session.getLine(row)
    list = @tokenizeLine(line)
    for token,index in list
      break if column>=token.start and column<=token.end and token.token.type in [Token.TYPE_NUMBER,Token.TYPE_STRING]
      if column>=token.start and column<=token.end and token.token.type == Token.TYPE_MINUS and index<list.length-1
        if list[index+1].token.type == Token.TYPE_NUMBER
          index += 1
          token = list[index]
          break

    if token?
      switch token.token.type
        when Token.TYPE_NUMBER
          @color_tool_button.style.display = "none"
          @number_tool_button.style.display = "inline-block"
          return

        when Token.TYPE_STRING
          if RegexLib.csscolor.test(token.token.value)
            @color_tool_button.style.display = "inline-block"
            @number_tool_button.style.display = "none"
            return

    @color_tool_button.style.display = "none"
    @number_tool_button.style.display = "none"

  hideValueToolButtons:()->
    @color_tool_button.style.display = "none"
    @number_tool_button.style.display = "none"

  showValueTool:()->
    return if @value_tool?
    @cancelValueTool()

    range = @editor.getSelectionRange()
    row = range.start.row
    return if range.end.row != range.start.row
    column = range.start.column
    endcolumn = range.end.column
    line = @editor.session.getLine(row)
    list = @tokenizeLine(line)
    for token,index in list
      if column>=token.start and column<=token.end and token.token.type in [Token.TYPE_NUMBER,Token.TYPE_STRING]
        start = token.start
        end = token.end
        break
      if column>=token.start and column<=token.end and token.token.type == Token.TYPE_MINUS and index<list.length-1
        if list[index+1].token.type == Token.TYPE_NUMBER
          start = token.start
          index += 1
          token = list[index]
          end = token.end
          break

    if token? and column>=start and endcolumn<=end
      switch token.token.type
        when Token.TYPE_NUMBER
          value = token.token.value
          start_token = token
          if index>0 and list[index-1].token.type == Token.TYPE_MINUS and (index<2 or list[index-2].token.type not in [Token.TYPE_NUMBER,Token.TYPE_IDENTIFIER,Token.TYPE_CLOSED_BRACE,Token.TYPE_CLOSED_BRACKET])
            value = -value
            start_token = list[index-1]

          start = line.substring(0,start_token.start)
          end = line.substring(token.end,line.length)
          pos = @editor.renderer.$cursorLayer.getPixelPosition(range.start,true)
          #@editor.selection.setRange(new ace.Range(row,start_token.start,row,token.end),true)
          @editor.blur()
          @value_tool = new ValueTool @,pos.left,pos.top,value,(value)=>
            @editor.session.replace({ start: {row: row, column: 0},end: {row: row, column: Number.MAX_VALUE}}, start+value+end)
            @editor.selection.setRange(new ace.Range(row,start_token.start,row,start_token.start+(""+value).length),true)
            @drawHelper(row,column)
          return true

        when Token.TYPE_STRING
          if RegexLib.csscolor.test(token.token.value)
            start = line.substring(0,token.start)
            end = line.substring(token.end,line.length)
            pos = @editor.renderer.$cursorLayer.getPixelPosition(range.start,true)
            @editor.blur()
            @value_tool = new ColorValueTool @,pos.left,pos.top,token.token.value,(value)=>
              value = "\"#{value}\""
              @editor.session.replace({ start: {row: row, column: 0},end: {row: row, column: Number.MAX_VALUE}}, start+value+end)
            return true
    false

  cancelValueTool:()->
    if @value_tool
      @value_tool.dispose()
      @value_tool = null
      @app.runwindow.rulercanvas.hide()
      @editor.focus()

  evalArg:(arg,callback)->
    if document.getElementById("runiframe")?
      @app.runwindow.runCommand arg,callback
    else
      callback(if isFinite(arg) then arg*1 else 0)

  drawHelper:(row,column)->
    try
      res = @analyzeLine(row,column)
      if res?
        if @app.project.language.startsWith("microscript")
          if res.function.indexOf("Polygon") > 0 or res.function == "drawLine"
            args = []
            funk = (i)=>
              @evalArg res.args[i],(v)=>
                args[i] = v
                if i < res.args.length-1
                  funk(i+1)
                else
                  @app.runwindow.rulercanvas.showPolygon(args,res.arg)
            funk(0)
          else
            @evalArg res.args[0],(v1)=>
              @evalArg res.args[1],(v2)=>
                @evalArg res.args[2],(v3)=>
                  @evalArg res.args[3],(v4)=>
                    switch res.arg
                      when 0 then @app.runwindow.rulercanvas.showX(v1,v2,v3,v4)
                      when 1 then @app.runwindow.rulercanvas.showY(v1,v2,v3,v4)
                      when 2 then @app.runwindow.rulercanvas.showW(v1,v2,v3,v4)
                      when 3 then @app.runwindow.rulercanvas.showH(v1,v2,v3,v4)
                      else @app.runwindow.rulercanvas.showBox(v1,v2,v3,v4)
        else
          if res.function.indexOf("Polygon")>0 or res.function == "drawLine"
            args = res.args
            @app.runwindow.rulercanvas.showPolygon(args,res.arg)
          else
            args = res.args
            for i in [0..args.length-1] by 1
              args[i] = args[i]|0

            switch res.arg
              when 0 then @app.runwindow.rulercanvas.showX(args[0],args[1],args[2],args[3])
              when 1 then @app.runwindow.rulercanvas.showY(args[0],args[1],args[2],args[3])
              when 2 then @app.runwindow.rulercanvas.showW(args[0],args[1],args[2],args[3])
              when 3 then @app.runwindow.rulercanvas.showH(args[0],args[1],args[2],args[3])
              else @app.runwindow.rulercanvas.showBox(args[0],args[1],args[2],args[3])
      else
        @app.runwindow.rulercanvas.hide()

    catch err
      console.error err

  analyzeLine:(row,column)->
    range = @editor.getSelectionRange()
    if not row? or not column?
      row = range.start.row
      column = range.start.column
    line = @editor.session.getLine(row)

    parser = new Parser(line.replace(":",".")+" ")
    p = parser.parse()

    if parser.last_function_call?
      f = parser.last_function_call
      if f.expression.expression? and f.expression.expression.identifier == "screen" and f.expression.chain? and f.expression.chain[0]? and (f.expression.chain[0].value in @RULER_FUNCTIONS)
        arg = -1
        args = ["0","0","20","20"]
        for a,i in f.argslimits
          if column>=a.start and column<=a.end
            arg = i

          arg_value = line.substring(a.start,a.end)
          if arg_value.trim().length>0
            args[i] = arg_value

        if f.expression.chain[0].value in ["drawSprite","drawMap","drawText"]
          args.splice(0,1)
          arg -= 1
          if f.argslimits.length<5 and f.expression.chain[0].value != "drawText"
            args[3] = args[2]

        if f.expression.chain[0].value == "drawText"
          args[3] = args[2]
          args[2] = args[2]*4+""
          if arg >= 2
            arg += 1

        if f.expression.chain[0].value.indexOf("Polygon")>0 or f.expression.chain[0].value == "drawLine"
          while args.length>Math.max(2,f.argslimits.length)
            args.splice(args.length-1,1)

        return {
          function: f.expression.chain[0].value
          arg: arg
          value: arg_value
          args: args
        }

    null

  updateSourceLanguage:()->
    lang = @app.project.language.split("_")[0]
    element = document.querySelector("#source-asset-bar .language")
    element.innerText = lang
    element.className = ""
    element.classList.add(lang)
    element.classList.add("language")

    # document.getElementById("code-toolbar").innerHTML += "<span class='language #{lang}'>#{lang}</span>"

  setSelectedItem:(name)->
    @setSelectedSource name
    super(name)

  setSelectedSource:(name)->
    @toggleLibManager false
    @checkSave(true)
    if @selected_source?
      @sessions[@selected_source] =
        range: @editor.getSelectionRange()

    different = name != @selected_source

    @selected_source = name

    if @selected_source?
      @updateSourceLanguage()

    if @selected_source?
      source = @app.project.getSource(@selected_source)
      @setCode(source.content)
      @updateCurrentFileLock()

      @updateAnnotations()
      if @sessions[@selected_source] and different
        @editor.selection.setRange(@sessions[@selected_source].range)
        @editor.revealRange(@sessions[@selected_source].range)
        @editor.focus()
    else
      @setCode("")

  projectOpened:()->
    super()
    @sessions = {}
    @app.project.addListener @
    @app.runwindow.resetButtons()
    @app.runwindow.windowResized()
    @setSelectedItem null
    @updateRunLink()
    @updateLanguage()
    @update()

  projectUpdate:(change)->
    super(change)
    if change instanceof ProjectSource
      if @selected_source?
        if change == @app.project.getSource(@selected_source)
          @setCode(change.content)
    else if change == "locks"
      @updateCurrentFileLock()
      @updateActiveUsers()
    else if change == "code" or change == "public" or change == "slug"
      @updateRunLink()
    else if change == "annotations"
      @updateAnnotations()

  updateAnnotations:()->
    if @selected_source?
      source = @app.project.getSource(@selected_source)
      if source?
        @editor.session.setAnnotations source.annotations or []

  updateCurrentFileLock:()->
    lock = document.getElementById("editor-locked")

    if @selected_source?
      if @app.project.isLocked("ms/#{@selected_source}.ms")
        @editor.setReadOnly true
        user = @app.project.isLocked("ms/#{@selected_source}.ms").user
        @showLock "<i class='fa fa-user'></i> Locked by #{user}",@app.appui.createFriendColor(user)
      else
        source = @app.project.getSource(@selected_source)
        if source? and not source.fetched
          @editor.setReadOnly true
          @showLock """<i class="fas fa-spinner fa-spin"></i> """+@app.translator.get("Loading..."),"hsl(200,50%,50%)"
        else
          @hideLock()
          @editor.setReadOnly false
    else
      @hideLock()
      @editor.setReadOnly true

  showLock:(html,color)->
    lock = document.getElementById("editor-locked")
    @lock_shown = true
    lock.style = "display: block; background: #{color}; opacity: 1"
    lock.innerHTML = html
    document.getElementById("editor-view").style.opacity = .5

  hideLock:()->
    lock = document.getElementById("editor-locked")
    @lock_shown = false
    lock.style.opacity = 0
    document.getElementById("editor-view").style.opacity = 1
    setTimeout (()=>
        if not @lock_shown
          lock.style.display = "none"
      ),1000


  selectedItemRenamed:()->
    @selected_source = @selected_item


  rebuildList:()->
    super()
    if not @selected_source? or not @app.project.getSource(@selected_source)?
      if @app.project.source_list.length>0
        @setSelectedItem @app.project.source_list[0].name

  fileDropped:(file,folder)->
    console.info "processing #{file.name}"
    console.info "folder: "+folder
    reader = new FileReader()
    reader.addEventListener "load",()=>
      console.info "file read, size = "+ reader.result.length
      return if reader.result.length>1000000

      name = file.name.split(".")[0]
      name = RegexLib.fixFilename name

      console.info(reader.result)
      @createAsset folder,name,reader.result

    reader.readAsText(file)

  createAsset:(folder,name="source",content="")->
    @checkSave(true)

    if folder?
      name = folder.getFullDashPath()+"-#{name}"
      folder.setOpen true

    source = @app.project.createSource(name)
    source.content = content
    name = source.name
    @app.client.sendRequest {
      name: "write_project_file"
      project: @app.project.id
      file: "ms/#{name}.ms"
      properties: {}
      content: content
    },(msg)=>
      console.info msg
      @app.project.updateSourceList()
      @setSelectedItem name

  updateRunLink:()->
    element = document.getElementById("run-link")
    if @app.project?
      url = location.origin.replace(".dev",".io")+"/"
      url += @app.project.owner.nick+"/"
      url += @app.project.slug+"/"
      if not @app.project.public
        url += @app.project.code + "/"

      element.innerText = url
      element.href = url
      element.title = url

      iframe = document.querySelector("#device iframe")
      if iframe? then iframe.src = url

      qrcode = QRCode.toDataURL url,{margin:0},(err,url)=>
        if not err? and url?
          img = new Image
          img.src = url
          document.getElementById("qrcode-button").innerHTML = ""
          document.getElementById("qrcode-button").appendChild img


  toggleLibManager:(view = @editor_view.style.display != "none")->
    if view
      @lib_manager.style.display = "block"
      @editor_view.style.display = "none"
      @lib_manager_button.classList.add "selected"
    else
      @lib_manager.style.display = "none"
      @editor_view.style.display = "block"
      @lib_manager_button.classList.remove "selected"
