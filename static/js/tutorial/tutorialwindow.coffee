class @TutorialWindow
  constructor:(@app)->
    @window = document.getElementById("tutorial-window")


    document.querySelector("#tutorial-window").addEventListener "mousedown",(event)=>@moveToFront()

    document.querySelector("#tutorial-window .titlebar").addEventListener "click",(event)=>@uncollapse()

    document.querySelector("#tutorial-window .titlebar").addEventListener "mousedown",(event)=>@startMove(event)
    document.querySelector("#tutorial-window .navigation .resize").addEventListener "mousedown",(event)=>@startResize(event)
    document.addEventListener "mousemove",(event)=>@mouseMove(event)
    document.addEventListener "mouseup",(event)=>@mouseUp(event)
    window.addEventListener "resize",()=>
      b = @window.getBoundingClientRect()
      @setPosition b.x,b.y

    document.querySelector("#tutorial-window .navigation .previous").addEventListener "click",()=>@previousStep()
    document.querySelector("#tutorial-window .navigation .next").addEventListener "click",()=>@nextStep()
    document.querySelector("#tutorial-window .titlebar .minify").addEventListener "click",()=>@close()

    @highlighter = new Highlighter @
    @max_ratio = .75


  moveToFront:()->
    list = document.getElementsByClassName "floating-window"
    for e in list
      if e.id == "tutorial-window"
        e.style["z-index"] = 11
      else
        e.style["z-index"] = 10
    return

  start:(@tutorial)->
    @shown = true
    @uncollapse()
    if @tutorial.project_title? and not @app.user?
      @app.appui.accountRequired ()=>
        @start @tutorial
      return

    @openProject()

    document.getElementById("tutorial-window").style.display = "block"
    document.querySelector("#tutorial-window .title").innerText = @tutorial.title

    progress = @app.getTutorialProgress(@tutorial.link)
    @current_step = Math.round(progress/100*(@tutorial.steps.length-1))
    if @current_step == @tutorial.steps.length-1
      @current_step = 0
    @setStep(@current_step)

  openProject:()->
    if @tutorial.project_title?
      slug = RegexLib.slugify @tutorial.project_title.split("{")[0]
      project = null
      for p in @app.projects
        if p.slug == slug
          if not @app.project? or @app.project.id != p.id
            @app.openProject p
          project = p
          break

      if not project?
        i1 = @tutorial.project_title.indexOf("{")
        i2 = @tutorial.project_title.lastIndexOf("}")

        if i1 > 0 and i2>i1
          options = {}
          try
            options = JSON.parse(@tutorial.project_title.substring(i1,i2+1))
          catch err
            console.error err

          @app.createProject @tutorial.project_title.substring(0,i1).trim(),slug,options,()=>
            @start @tutorial
          return
        else
          @app.createProject @tutorial.project_title,slug,()=>
            @start @tutorial
          return

      @app.setProjectTutorial(slug,@tutorial.link)
      @app.appui.setMainSection("projects")

  update:()->
    if @tutorial?
      @setStep(@current_step)

  setStep:(index)->
    if @tutorial?
      index = Math.max(0,Math.min(@tutorial.steps.length-1,index))
      @current_step = index
      step = @tutorial.steps[index]
      e = document.querySelector("#tutorial-window .content")
      e.innerHTML = ""
      for c in step.content
        e.appendChild c

      e.scrollTo 0,0

      document.querySelector("#tutorial-window .navigation .step").innerText = (index+1)+" / "+@tutorial.steps.length

      percent = Math.round(@current_step/(@tutorial.steps.length-1)*100)

      document.querySelector("#tutorial-window .navigation .step").style.background = "linear-gradient(90deg,hsl(200,50%,80%) 0%,hsl(200,50%,80%) #{percent}%,transparent #{percent}%)"

      if step.navigate?
        s = step.navigate.split(".")
        @app.appui.setMainSection s[0]
        if s[1]?
          @app.appui.setSection s[1]
        switch s[2]
          when "console"
            @app.appui.code_splitbar.setPosition(0)
            @app.appui.runtime_splitbar.setPosition(0)

      if step.position?
        s = step.position.split(",")
        if s.length == 4
          w = Math.floor Math.max(200,Math.min(window.innerWidth*s[2]/100))
          h = Math.floor Math.max(200,Math.min(window.innerHeight*s[3]/100))
          @window.style.width = "#{w}px"
          @window.style.height = "#{h}px"
          @setPosition(s[0]*window.innerWidth/100,s[1]*window.innerHeight/100)

      if step.highlight?
        @highlighter.highlight step.highlight,step.auto == true
      else
        @highlighter.hide()

      if step.auto? and step.auto != true
        element = document.querySelector(step.auto)
        if element?
          @highlighter.setAuto(element)

      if step.overlay
        document.getElementById("tutorial-overlay").style.display = "block"
      else
        document.getElementById("tutorial-overlay").style.display = "none"

    #if @current_step>0
    progress = @app.getTutorialProgress(@tutorial.link)
    percent = Math.round(@current_step/(@tutorial.steps.length-1)*100)
    #if percent>progress
    @app.setTutorialProgress(@tutorial.link,percent)

    if @current_step == @tutorial.steps.length-1
      document.querySelector("#tutorial-window .navigation .next").classList.add "fa-check"
      document.querySelector("#tutorial-window .navigation .next").classList.remove "fa-arrow-right"
    else
      document.querySelector("#tutorial-window .navigation .next").classList.remove "fa-check"
      document.querySelector("#tutorial-window .navigation .next").classList.add "fa-arrow-right"

    return

  nextStep:()->
    if @current_step == @tutorial.steps.length-1
      @close()
    else
      @setStep(@current_step+1)

  previousStep:()->
    @setStep(@current_step-1)

  close:()->
    if @current_step == @tutorial.steps.length-1
      @shown = false
      if @tutorial.back_to_tutorials
        @app.appui.setMainSection("tutorials")
      document.getElementById("tutorial-window").style.display = "none"
      @highlighter.hide()
      document.getElementById("tutorial-overlay").style.display = "none"
    else
      @highlighter.hide()
      document.getElementById("tutorial-overlay").style.display = "none"
      @pos_top = @window.style.top
      @pos_left = @window.style.left
      @pos_width = @window.style.width
      @pos_height = @window.style.height

      button = document.getElementById "menu-tutorials"
      b = button.getBoundingClientRect()
      @window.classList.add "minimized"

      setTimeout (()=>
        @window.style.top = (b.y+b.height-10)+"px"
        @window.style.left = (b.x+b.width/2+20)+"px"
        @window.style.width = "30px"
        @window.style.height = "30px"
        @collapsed = true
      ),100

  uncollapse:()->
    if @collapsed
      @collapsed = false
      @openProject()
      @window.style.top = @pos_top
      @window.style.left = @pos_left
      @window.style.width = @pos_width
      @window.style.height = @pos_height
      setTimeout (()=>
        @window.classList.remove "minimized"
        @setStep @current_step
      ),100

  startMove:(event)->
    @moving = true
    @drag_start_x = event.clientX
    @drag_start_y = event.clientY
    @drag_pos_x = @window.getBoundingClientRect().x
    @drag_pos_y = @window.getBoundingClientRect().y

  startResize:(event)->
    @resizing = true
    @drag_start_x = event.clientX
    @drag_start_y = event.clientY
    @drag_size_w = @window.getBoundingClientRect().width
    @drag_size_h = @window.getBoundingClientRect().height

  mouseMove:(event)->
    if @moving
      dx = event.clientX-@drag_start_x
      dy = event.clientY-@drag_start_y
      @setPosition(@drag_pos_x+dx,@drag_pos_y+dy)

    if @resizing
      dx = event.clientX-@drag_start_x
      dy = event.clientY-@drag_start_y
      w = Math.floor Math.max(200,Math.min(window.innerWidth*@max_ratio,@drag_size_w+dx))
      h = Math.floor Math.max(200,Math.min(window.innerHeight*@max_ratio,@drag_size_h+dy))
      @window.style.width = "#{w}px"
      @window.style.height = "#{h}px"
      b = @window.getBoundingClientRect()
      if w>window.innerWidth-b.x or h>window.innerHeight-b.y
        @setPosition(Math.min(b.x,window.innerWidth-w-4),Math.min(b.y,window.innerHeight-h-4))

  mouseUp:(event)->
    @moving = false
    @resizing = false

  setPosition:(x,y)->
    b = @window.getBoundingClientRect()
    x = Math.max(4,Math.min(window.innerWidth-b.width-4,x))
    y = Math.max(4,Math.min(window.innerHeight-b.height-4,y))
    @window.style.top = y+"px"
    @window.style.left = x+"px"
