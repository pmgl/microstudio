class @Editor
  constructor:(@app)->
    @editor = ace.edit "editor-view"
    @editor.$blockScrolling = Infinity
    @editor.setTheme("ace/theme/tomorrow_night_bright")
    @editor.getSession().setMode("ace/mode/microscript")
    @editor.setFontSize("14px")
    @editor.getSession().setOptions
      tabSize: 2
      useSoftTabs: true
      useWorker: false # disables lua autocorrection ; preserves syntax coloring
      #enableBasicAutocompletion: true
      #enableSnippets: true
      #enableLiveAutocompletion: true

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

    @editor.on "focus",()=>
      @checkValueToolButtons()
      @cancelValueTool()

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
    document.querySelector("#help-window").addEventListener "click",()=>
      @show_help = not @show_help
      if not @show_help
        document.querySelector("#help-window").classList.add "disabled"
        document.querySelector("#help-window .content").style.display = "none"
      else
        document.querySelector("#help-window").classList.remove "disabled"
        @liveHelp()

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

    document.getElementById("source-list-header").addEventListener "click",(event)=>
      @toggleFileList()

    @app.appui.setAction "create-source-button",()=>
      @createSource()
      @toggleFileList(false)

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

  toggleFileList:(close)->
    view = document.getElementById("editor-view")
    list = document.getElementById("source-list-panel")
    if not close?
      close = list.clientWidth>100

    if close
      list.style.width = "40px"
      view.style.left = "40px"
      document.querySelector(".source-list-header i").classList.remove("fa-chevron-circle-left")
      document.querySelector(".source-list-header i").classList.add("fa-chevron-circle-right")
      document.getElementById("code-toolbar").style["padding-left"] = "50px"
      setTimeout (()=>@editor.resize()),600
    else
      list.style.width = "180px"
      view.style.left = "180px"
      document.querySelector(".source-list-header i").classList.add("fa-chevron-circle-left")
      document.querySelector(".source-list-header i").classList.remove("fa-chevron-circle-right")
      document.getElementById("code-toolbar").style["padding-left"] = "190px"
      setTimeout (()=>@editor.resize()),600

  editorContentsChanged:()->
    return if @ignore_changes
    src = @editor.getValue()
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
      parser = new Parser(@editor.getValue())
      p = parser.parse()
      if not parser.error_info?
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

  addDocButton:(pointer)->
    content = document.querySelector("#help-window .content")
    button = document.createElement "div"
    button.classList.add "see-doc-button"
    button.innerHTML = "<i class='fa fa-book-open'></i> "+@app.translator.get("View doc")
    button.addEventListener "click",(event)=>
      event.stopPropagation()
      @app.appui.setMainSection "help",true
      element = document.getElementById pointer
      if element?
        element.scrollIntoView()

    content.insertBefore button,content.firstChild


  liveHelp:()->
    return if not @show_help
    line = @getCurrentLine()
    column = @editor.getSelectionRange().start.column
    suggest = @app.documentation.findSuggestMatch(line,column)
    content = document.querySelector("#help-window .content")

    if suggest.length == 0
      help = @app.documentation.findHelpMatch(line)
      if help.length>0
        content.innerHTML = DOMPurify.sanitize marked help[0].value
        content.style.display = "block"
        document.querySelector("#help-window").classList.add("showing")
        @addDocButton(help[0].pointer)
      else
        content.innerHTML = ""
        content.style.display = "none"
    else if suggest.length == 1
      content.innerHTML = DOMPurify.sanitize marked suggest[0].value
      content.style.display = "block"
      document.querySelector("#help-window").classList.add("showing")
      @addDocButton(suggest[0].pointer)
    else
      md = ""
      for res in suggest
        md += res.ref + "\n\n"
      content.innerHTML = DOMPurify.sanitize marked md
      content.style.display = "block"
      document.querySelector("#help-window").classList.add("showing")
      @addDocButton(suggest[0].pointer)

  tokenizeLine:(line)->
    tokenizer = new Tokenizer(line)
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
            console.info value
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

  drawHelper:(row,column)->
    try
      res = @analyzeLine(row,column)
      if res?
        if res.function.indexOf("Polygon")>0 or res.function == "drawLine"
          args = []
          funk = (i)=>
            @app.runwindow.runCommand res.args[i],(v)=>
              args[i] = v
              if i<res.args.length-1
                funk(i+1)
              else
                @app.runwindow.rulercanvas.showPolygon(args,res.arg)
          funk(0)
        else
          @app.runwindow.runCommand res.args[0],(v1)=>
            @app.runwindow.runCommand res.args[1],(v2)=>
              @app.runwindow.runCommand res.args[2],(v3)=>
                @app.runwindow.runCommand res.args[3],(v4)=>
                  switch res.arg
                    when 0 then @app.runwindow.rulercanvas.showX(v1,v2,v3,v4)
                    when 1 then @app.runwindow.rulercanvas.showY(v1,v2,v3,v4)
                    when 2 then @app.runwindow.rulercanvas.showW(v1,v2,v3,v4)
                    when 3 then @app.runwindow.rulercanvas.showH(v1,v2,v3,v4)
                    else @app.runwindow.rulercanvas.showBox(v1,v2,v3,v4)
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

    parser = new Parser(line+" ")
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

  setSelectedSource:(name)->
    @checkSave(true)
    if @selected_source?
      @sessions[@selected_source] =
        range: @editor.getSelectionRange()

    different = name != @selected_source

    @selected_source = name
    list = document.getElementById("source-list").childNodes

    if @selected_source?
      document.getElementById("code-toolbar").innerHTML = "<i class='fa fa-file-code'></i> "+@selected_source
      for e in list
        if e.getAttribute("id") == "source-list-item-#{name}"
          e.classList.add("selected")
        else
          e.classList.remove("selected")
    else
      for e in list
        e.classList.remove("selected")

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
    @sessions = {}
    @app.project.addListener @
    @app.runwindow.resetButtons()
    @app.runwindow.windowResized()
    @setSelectedSource null
    @updateRunLink()

  projectUpdate:(change)->
    if change == "sourcelist"
      @rebuildSourceList()
    else if change instanceof ProjectSource
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
    if @selected_source?
      @editor.setReadOnly @app.project.isLocked("ms/#{@selected_source}.ms")

    lock = document.getElementById("editor-locked")
    if @selected_source? and @app.project.isLocked("ms/#{@selected_source}.ms")
      user = @app.project.isLocked("ms/#{@selected_source}.ms").user
      lock.style = "display: block; background: #{@app.appui.createFriendColor(user)}"
      lock.innerHTML = "<i class='fa fa-user'></i> Locked by #{user}"
    else
      lock.style = "display: none"

  rebuildSourceList:()->
    list = document.getElementById "source-list"
    list.innerHTML = ""

    for s in @app.project.source_list
      element = @createSourceBox s
      list.appendChild element

    if not @selected_source? or not @app.project.getSource(@selected_source)?
      if @app.project.source_list.length>0
        @setSelectedSource @app.project.source_list[0].name

    @updateActiveUsers()

    return

  updateActiveUsers:()->
    list = document.getElementById("source-list").childNodes
    for e in list
      file = e.id.split("-")[3]
      lock = @app.project.isLocked("ms/#{file}.ms")
      if lock? and Date.now()<lock.time
        e.querySelector(".active-user").style = "display: block; background: #{@app.appui.createFriendColor(lock.user)};"
      else
        e.querySelector(".active-user").style = "display: none;"
    return

  createSourceBox:(source)->

    #  div.source-list-item.selected(title="main")
    #    div.source-tools
    #      i(class="fa fa-edit" title=translator.get("Rename file"))
    #      i(class="fa fa-trash" title=translator.get("Delete this file"))
    #    i(class="fa fa-file")
    #    span main

    element = document.createElement "div"
    element.classList.add "source-list-item"
    element.setAttribute "id","source-list-item-#{source.name}"
    element.title = source.name
    element.addEventListener "click",()=>
      @setSelectedSource source.name

    if source.name == @selected_source
      element.classList.add "selected"

    tools = document.createElement "div"
    tools.classList.add "source-tools"
    element.appendChild tools

    i = document.createElement "i"
    i.classList.add "fa"
    i.classList.add "fa-file-code"
    element.appendChild i

    span = document.createElement "div"
    span.classList.add "filename"
    span.innerText = source.name
    #span.contentEditable = true
    element.appendChild span

    input = document.createElement "input"

    span.addEventListener "dblclick",()=>
      return if @app.project.isLocked("ms/#{source.name}.ms")
      @app.project.lockFile "ms/#{source.name}.ms"
      span.parentNode.replaceChild input,span
      input.value = source.name
      input.focus()

    input.addEventListener "blur",()=>
      input.parentNode.replaceChild span,input
      value = RegexLib.fixFilename(input.value)
      if value != source.name
        if RegexLib.filename.test(value)
          if not @app.project.getSource(value)?
            if @selected_source == source.name
              @app.project.lockFile "ms/#{value}.ms"
              @selected_source = value
              old = source.name
              @saveCode ()=>
                @app.client.sendRequest {
                  name: "delete_project_file"
                  project: @app.project.id
                  file: "ms/#{old}.ms"
                },(msg)=>
                  @app.project.updateSourceList()
                  #callback() if callback?

    input.addEventListener "keydown",(event)=>
      @app.project.lockFile "ms/#{source.name}.ms"
      if event.key == "Enter"
        event.preventDefault()
        input.blur()
        false
      else
        true

    #edit = document.createElement "i"
    #edit.classList.add("fa")
    #edit.classList.add("fa-edit")
    #edit.title = @app.translator.get("Rename file")
    #tools.appendChild edit
    #edit.addEventListener "click",()=>
    #  console.info "edit #{source.name}"

    trash = document.createElement "i"
    trash.classList.add("fa")
    trash.classList.add("fa-trash")
    trash.title = @app.translator.get("Delete file")
    tools.appendChild trash
    trash.addEventListener "click",()=>
      if confirm "Really delete #{source.name}?"
        @app.client.sendRequest {
          name: "delete_project_file"
          project: @app.project.id
          file: "ms/#{source.name}.ms"
        },(msg)=>
          @app.project.updateSourceList()

    activeuser = document.createElement "i"
    activeuser.classList.add "active-user"
    activeuser.classList.add "fa"
    activeuser.classList.add "fa-user"
    element.appendChild activeuser
    element

  createSource:()->
    @checkSave(true)
    source = @app.project.createSource()
    @rebuildSourceList()
    @setSelectedSource source.name
    @saveCode()

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
