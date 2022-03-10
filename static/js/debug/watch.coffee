class @Watch
  constructor:(@app)->
    @runwindow = @app.runwindow
    @runwindow.addMessageListener "watch_update",(msg)=>@watchUpdate(msg)

    @types = ["number","string","function","object","list"]
    for t in @types
      do (t)=>
        @["filtered_type_"+t] = false
        document.getElementById("debug-watch-type-#{t}").addEventListener "click",()=>
          @["filtered_type_"+t] = not @["filtered_type_"+t]
          if @["filtered_type_"+t]
            document.getElementById("debug-watch-type-#{t}").classList.add "filtered"
          else
            document.getElementById("debug-watch-type-#{t}").classList.remove "filtered"
          @updateFilters()

    document.getElementById("debug-watch-filter").addEventListener "input",()=>
      @text_filter = document.getElementById("debug-watch-filter").value
      @updateFilters()

    @reset()
    @app.runwindow.addListener (event)=>@runtimeEvent(event)

  reset:()->
    @watch_lines = {}
    @watch_list = ["global"]
    @text_filter = ""
    document.getElementById("debug-watch-filter").value = ""
    document.getElementById("debug-watch-content").innerHTML = ""

  start:()->
    @started = true
    @runwindow.postMessage
      name: "watch"
      list: @watch_list

  stop:()->
    @started = false
    @runwindow.postMessage
      name: "stop_watching"

  addWatch:(w)->
    console.info "adding watch: "+w
    @watch_list.push w
    @watch_list_updated = true
    @start()

  removeWatch:(w)->
    console.info "removing watch: "+w
    index = @watch_list.indexOf w
    if w.indexOf(".")>0
      delete @watch_lines[w]
    if index >= 0
      @watch_list.splice index,1
      @start()

  watchUpdate:(msg)->
    return if not @started
    data = msg.data
    #console.info data
    alive = {}

    for set_key,set_value of data
      if set_key != "global"
        if @watch_lines.hasOwnProperty(set_key)
          alive[set_key] = true
          @watch_lines[set_key].updateContents set_value

    e = document.getElementById("debug-watch-content")
    for key,value of data.global
      if @watch_lines.hasOwnProperty(key)
        @watch_lines[key].updateValue(value)
      else
        @watch_lines[key] = new WatchLine(@,e,key,value)
      alive[key] = true

    if not @watch_list_updated
      for key,value of @watch_lines
        if not alive[key]
          value.remove()
          e.removeChild value.element
          delete @watch_lines[key]

    @watch_list_updated = false
    return

  isFiltered:(w)->
    v = w.value
    return true if @["filtered_type_"+v.type]
    if @text_filter? and @text_filter.length>0 and w.prefixed.indexOf(@text_filter) < 0
      return true
    false

  updateFilters:()->
    for key,value of @watch_lines
      value.filterUpdate()

  runtimeEvent:(event)->
    switch event
      when "play","reload"
        @reset()

      when "started"
        if not @app.appui.debug_splitbar.closed2
          @reset()
          @start()

      #when "pause"
      #when "resume"
      when "exit"
        @started = false
        @reset()

class @WatchLine
  constructor:(@watch,@parent_element,@variable,@value,@prefix)->
    @prefixed = if @prefix? then @prefix+"."+@variable else @variable
    @element = document.createElement "div"
    @element.classList.add "watch-line"
    @element.innerHTML = """
    <div class="watch-line-name"><i class="fa"></i> #{@variable}</div>
    <div class="watch-line-value">#{@textValue()}</div>
    """
    @element.classList.add @value.type
    @parent_element.appendChild(@element)

    @element.querySelector(".watch-line-value").addEventListener "click",()=>
      @editValue()

    @element.querySelector("i").addEventListener "click",()=>
      if @value.type in ["object","list"]
        if not @open
          @open = true
          @watch.addWatch @prefixed
          @watch.watch_lines[@prefixed] = @
          @element.classList.add "open"
          if @content?
            @content.style.display = "block"
        else
          @open = false
          @watch.removeWatch @prefixed
          @element.classList.remove "open"
          @watch_lines = {}
          if @content?
            @element.removeChild @content
            @content = null


    @hidden = false
    @filterUpdate()
    @watch_lines = {}

  remove:()->
    @watch.removeWatch @prefixed
    @watch_lines = {}
    if @content?
      @element.removeChild @content
      @content = null
    @element.classList.remove "open"
    @open = false

  textValue:()->
    switch @value.type
      when "string" then '"'+@value.value+'"'
      when "function" then "function()"
      when "list" then "[list:#{@value.length}]"
      when "object" then @value.value or "object .. end"
      else @value.value

  updateValue:(value)->
    if value.type != @value.type
      @element.classList.remove @value.type
      @element.classList.add value.type
      @value.type = value.type

      if @content? and @value.type not in ["object","list"]
        @remove()

    if value.value != @value.value or value.length != @value.length
      @value.value = value.value
      @value.length = value.length
      @element.querySelector(".watch-line-value").innerText = @textValue()

  updateContents:(data)->
    # console.info data
    return if not @open

    if not @content
      @content = document.createElement "div"
      @content.classList.add "watch-line-content"
      @element.appendChild @content

    active = {}
    for key,value of data
      if @watch_lines.hasOwnProperty(key)
        @watch_lines[key].updateValue(value)
      else
        @watch_lines[key] = new WatchLine(@watch,@content,key,value,@prefixed)
      active[key] = true

    for key,value of @watch_lines
      if not active[key]
        delete @watch_lines[key]
        value.remove()
        if @content?
          @content.removeChild value.element
        # @watch.watch_lines[@watch_lines[key].prefixed] = @watch_lines[key] NOPE

  filterUpdate:()->
    if @hidden != @watch.isFiltered @
      @hidden = not @hidden
      @element.style.display = if @hidden then "none" else "block"

    for key,value of @watch_lines
      value.filterUpdate()

  editValue:()->
    if @value.type == "number" or @value.type == "string"
      input = document.createElement "input"
      input.type = "text"
      input.value = @value.value
      @element.appendChild input
      input.addEventListener "blur",()=>
        @element.removeChild input

      input.addEventListener "keydown",(event)=>
        if event.key == "Enter"
          event.preventDefault()
          if input.value != @value.value
            try
              if @value.type == "number"
                if isFinite(parseFloat(input.value))
                  @watch.app.runwindow.runCommand("#{@prefixed} = #{input.value}",->)
              else if @value.type == "string"
                @watch.app.runwindow.runCommand("""#{@prefixed} = "#{input.value}" """,->)
            catch err
              console.error err
          input.blur()

      input.focus()
