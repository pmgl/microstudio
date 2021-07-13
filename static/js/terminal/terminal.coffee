class @Terminal
  constructor:(@runwindow)->
    @commands =
      clear: ()=>@clear()

    @loadHistory()

  loadHistory:()->
    @history = []
    try
      if localStorage.getItem("console_history")?
        @history = JSON.parse localStorage.getItem("console_history")
    catch err

  saveHistory:()->
    localStorage.setItem("console_history",JSON.stringify(@history))

  start:()->
    return if @started
    @started = true
    document.getElementById("terminal").addEventListener "mousedown",(event)=>
      @pressed = true
      @moved = false
      true

    document.getElementById("terminal").addEventListener "mousemove",(event)=>
      if @pressed
        @moved = true
      true

    document.getElementById("terminal").addEventListener "mouseup",(event)=>
      if not @moved
        document.getElementById("terminal-input").focus()

      @moved = false
      @pressed = false
      true

    document.getElementById("terminal-input").addEventListener "paste",(event)=>
      event.preventDefault()
      text = event.clipboardData.getData("text/plain")
      s = text.split("\n")
      if s.length>1
        for line in s
          document.getElementById("terminal-input").value = ""
          @validateLine line
        return

      document.getElementById("terminal-input").value = s[0]

    document.getElementById("terminal-input").addEventListener "keydown",(event)=>
      # console.info event.key
      if event.key == "Enter"
        v = document.getElementById("terminal-input").value
        document.getElementById("terminal-input").value = ""
        @validateLine v

      else if event.key == "ArrowUp"
        if not @history_index?
          @history_index = @history.length-1
          @current_input = document.getElementById("terminal-input").value
        else
          @history_index = Math.max(0,@history_index-1)

        if @history_index == @history.length-1
          @current_input = document.getElementById("terminal-input").value

        if @history_index>=0 and @history_index<@history.length
          document.getElementById("terminal-input").value = @history[@history_index]
          @setTrailingCaret()

      else if event.key == "ArrowDown"
        return if @history_index == @history.length
        if @history_index?
          @history_index = Math.min(@history.length,@history_index+1)

        if @history_index>=0 and @history_index<@history.length
          document.getElementById("terminal-input").value = @history[@history_index]
          @setTrailingCaret()
        else if @history_index == @history.length
          document.getElementById("terminal-input").value = @current_input
          @setTrailingCaret()

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
        document.querySelector("#terminal-input-gt i").classList.add("fa-ellipsis-v")
        for i in [0..@runwindow.nesting*2-1] by 1
          document.getElementById("terminal-input").value += " "
        @setTrailingCaret()
      else
        document.querySelector("#terminal-input-gt i").classList.remove("fa-ellipsis-v")

  setTrailingCaret:()->
    setTimeout (()=>
      val = document.getElementById("terminal-input").value
      document.getElementById("terminal-input").setSelectionRange(val.length,val.length)
    ),0

  echo:(text,scroll=false,classname)->
    if not scroll
      e = document.getElementById("terminal-view")
      if Math.abs(e.getBoundingClientRect().height+e.scrollTop-e.scrollHeight)<10
        scroll = true

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
    document.getElementById("terminal-lines").appendChild div
    if scroll
      div.scrollIntoView()
    @truncate()

  error:(text,scroll=false)->
    @echo(text,scroll,"error")

  truncate:()->
    e = document.getElementById("terminal-lines")
    while e.childElementCount>1000
      e.removeChild e.firstChild
    return

  clear:()->
    document.getElementById("terminal-lines").innerHTML = ""
    delete @runwindow.multiline
