class @Terminal
  constructor:(@runwindow,@tid="terminal")->
    @localStorage = localStorage
    @commands =
      clear: ()=>@clear()

    @loadHistory()
    @buffer = []
    @length = 0
    @error_lines = 0

  loadHistory:()->
    @history = []
    try
      if @localStorage.getItem("console_history")?
        @history = JSON.parse @localStorage.getItem("console_history")
    catch err

  saveHistory:()->
    @localStorage.setItem("console_history",JSON.stringify(@history))

  start:()->
    return if @started
    @started = true
    document.getElementById("#{@tid}").addEventListener "mousedown",(event)=>
      @pressed = true
      @moved = false
      true

    document.getElementById("#{@tid}").addEventListener "mousemove",(event)=>
      if @pressed
        @moved = true
      true

    document.getElementById("#{@tid}").addEventListener "mouseup",(event)=>
      if not @moved
        document.getElementById("#{@tid}-input").focus()

      @moved = false
      @pressed = false
      true

    document.getElementById("#{@tid}-input").addEventListener "paste",(event)=>
      text = event.clipboardData.getData("text/plain")
      s = text.split("\n")
      if s.length>1
        event.preventDefault()
        for line in s
          document.getElementById("#{@tid}-input").value = ""
          @validateLine line
        return
      else
        false
      #document.getElementById("#{@tid}-input").value = s[0]

    document.getElementById("#{@tid}-input").addEventListener "keydown",(event)=>
      # console.info event.key
      if event.key == "Enter"
        v = document.getElementById("#{@tid}-input").value
        document.getElementById("#{@tid}-input").value = ""
        @validateLine v
        @force_scroll = true

      else if event.key == "ArrowUp"
        if not @history_index?
          @history_index = @history.length-1
          @current_input = document.getElementById("#{@tid}-input").value
        else
          @history_index = Math.max(0,@history_index-1)

        if @history_index == @history.length-1
          @current_input = document.getElementById("#{@tid}-input").value

        if @history_index>=0 and @history_index<@history.length
          document.getElementById("#{@tid}-input").value = @history[@history_index]
          @setTrailingCaret()

      else if event.key == "ArrowDown"
        return if @history_index == @history.length
        if @history_index?
          @history_index = Math.min(@history.length,@history_index+1)
        else
          return

        if @history_index>=0 and @history_index<@history.length
          document.getElementById("#{@tid}-input").value = @history[@history_index]
          @setTrailingCaret()
        else if @history_index == @history.length
          document.getElementById("#{@tid}-input").value = @current_input
          @setTrailingCaret()

    setInterval (()=>@update()),16

  validateLine:(v)->
    @history_index = null

    if v.trim().length>0 and v != @history[@history.length-1]
      @history.push v
      if @history.length>1000
        @history.splice(0,1)
      @saveHistory()

    @echo("#{v}",true,"input")
    if @commands[v.trim()]?
      @commands[v.trim()]()
    else
      @runwindow.runCommand v
      if @runwindow.multiline
        document.querySelector("##{@tid}-input-gt i").classList.add("fa-ellipsis-v")
        for i in [0..@runwindow.nesting*2-1] by 1
          document.getElementById("#{@tid}-input").value += " "
        @setTrailingCaret()
      else
        document.querySelector("##{@tid}-input-gt i").classList.remove("fa-ellipsis-v")

  setTrailingCaret:()->
    setTimeout (()=>
      val = document.getElementById("#{@tid}-input").value
      document.getElementById("#{@tid}-input").setSelectionRange(val.length,val.length)
    ),0

  update:()->
    if @buffer.length>0
      if @force_scroll
        @scroll = true
        @force_scroll = false
      else
        e = document.getElementById("#{@tid}-view")
        @scroll = Math.abs(e.getBoundingClientRect().height+e.scrollTop-e.scrollHeight) < 10

      div = document.createDocumentFragment()
      container = document.createElement "div"
      div.appendChild container
      for t in @buffer
        container.appendChild element = @echoReal t.text,t.classname
      document.getElementById("#{@tid}-lines").appendChild div
      if @scroll
        element.scrollIntoView()
      @length += @buffer.length
      @buffer = []

  echo:(text,scroll=false,classname)->
    @buffer.push
      text: text
      classname: classname
    return

  echoReal:(text,classname)->
    div = document.createElement("div")
    if classname == "input"
      d = document.createTextNode(" "+text)
      i = document.createElement("i")
      i.classList.add("fa")
      i.classList.add("fa-angle-right")
      div.appendChild i
      div.appendChild d
    else
      div.innerText = text

    if classname?
      div.classList.add classname
    @truncate()
    div

  error:(text,scroll=false)->
    @echo(text,scroll,"error")
    @error_lines += 1

  truncate:()->
    e = document.getElementById("#{@tid}-lines")
    while @length>10000 and e.firstChild?
      c = e.firstChild.children.length
      e.removeChild e.firstChild
      @length -= c
    return

  clear:()->
    document.getElementById("#{@tid}-lines").innerHTML = ""
    @buffer = []
    @length = 0
    @error_lines = 0
    document.querySelector("##{@tid}-input-gt i").classList.remove("fa-ellipsis-v")
    delete @runwindow.multiline
