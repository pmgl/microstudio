class @ProjectDetails
  constructor:(@app)->
    @menu = ["code","sprites","sounds","music","doc"]
    for s in @menu
      do (s)=>
        document.getElementById("project-contents-menu-#{s}").addEventListener "click",()=>
          @setSection s

    @splitbar = new SplitBar("explore-project-details","horizontal")
    @splitbar.setPosition(45)

    @editor = ace.edit "project-contents-view-editor"
    @editor.$blockScrolling = Infinity
    @editor.setTheme("ace/theme/tomorrow_night_bright")
    @editor.getSession().setMode("ace/mode/microscript")
    @editor.setReadOnly(true)
    @editor.getSession().setOptions
      tabSize: 2
      useSoftTabs: true
      useWorker: false # disables lua autocorrection ; preserves syntax coloring

    document.querySelector("#project-contents-source-import").addEventListener "click",()=>
      return if not @app.project?
      file = @selected_source
      return if not file?
      return if @imported_sources[file]
      @imported_sources[file] = true

      name = file.split(".")[0]
      count = 1
      while @app.project.getSource(name)?
        count += 1
        name = file.split(".")[0]+count

      file = name+".ms"

      @app.client.sendRequest {
        name: "write_project_file"
        project: @app.project.id
        file: "ms/#{file}"
        content: @sources[@selected_source]
      },(msg)=>
        @app.project.updateSourceList()
        @setSelectedSource(@selected_source)

    document.querySelector("#project-contents-doc-import").addEventListener "click",()=>
      return if not @app.project?
      return if @imported_doc or not @doc?
      @imported_doc = true

      value = @app.doc_editor.editor.getValue()
      if value? and value.length>0
        value = value + "\n\n"+@doc
      else
        value = @doc

      @app.client.sendRequest {
        name: "write_project_file"
        project: @app.project.id
        file: "doc/doc.md"
        content: value
      },(msg)=>
        @app.project.loadDoc()
        document.querySelector("#project-contents-doc-import").classList.add "done"
        document.querySelector("#project-contents-doc-import i").classList.add "fa-check"
        document.querySelector("#project-contents-doc-import i").classList.remove "fa-download"
        document.querySelector("#project-contents-doc-import span").innerText = @app.translator.get "Doc imported"

    document.getElementById("post-project-comment-button").addEventListener "click",()=>
      text = document.querySelector("#post-project-comment textarea").value
      if text? and text.length>0
        @postComment(text)
        document.querySelector("#post-project-comment textarea").value = ""

    document.getElementById("login-to-post-comment").addEventListener "click",()=>
      @app.appui.showLoginPanel()

    document.getElementById("validate-to-post-comment").addEventListener "click",()=>
      @app.appui.setMainSection("usersettings")

  set:(@project)->
    @splitbar.update()
    @sources = []
    @sprites = []
    @sounds = []
    @music = []
    @maps = []
    @imported_sources = {}
    @imported_doc = false

    document.querySelector("#project-contents-doc-import").classList.remove "done"
    document.querySelector("#project-contents-doc-import").style.display = if @app.project? then "block" else "none"
    document.querySelector("#project-contents-source-import").style.display = if @app.project? then "block" else "none"

    if @app.project?
      document.querySelector("#project-contents-doc-import span").innerText = @app.translator.get("Import doc to")+" "+@app.project.title

    document.querySelector("#project-contents-view .code-list").innerHTML = ""
    document.querySelector("#project-contents-view .sprite-list").innerHTML = ""
    document.querySelector("#project-contents-view .sound-list").innerHTML = ""
    document.querySelector("#project-contents-view .music-list").innerHTML = ""
    #document.querySelector("#project-contents-view .maps").innerHTML = ""
    document.querySelector("#project-contents-view .doc-render").innerHTML = ""

    section = "code"
    for t in @project.tags
      if t.indexOf("sprite")>=0
        section = "sprites"
      else if t.indexOf("tutorial")>=0 or t.indexOf("tutoriel")>=0
        section = "doc"

    if @project.type == "tutorial"
      section = "doc"

    @setSection(section)

    @sources = {}
    @selected_source = null

    @app.client.sendRequest {
      name: "list_public_project_files"
      project: @project.id
      folder: "ms"
    },(msg)=>
      @setSourceList msg.files

    @app.client.sendRequest {
      name: "list_public_project_files"
      project: @project.id
      folder: "sprites"
    },(msg)=>
      @setSpriteList msg.files

    @app.client.sendRequest {
      name: "list_public_project_files"
      project: @project.id
      folder: "sounds"
    },(msg)=>
      @setSoundList msg.files

    @app.client.sendRequest {
      name: "list_public_project_files"
      project: @project.id
      folder: "music"
    },(msg)=>
      @setMusicList msg.files

    #@app.client.sendRequest {
    #  name: "list_public_project_files"
    #  project: @project.id
    #  folder: "maps"
    #},(msg)=>
    #  @setMapList msg.files

    @app.client.sendRequest {
      name: "list_public_project_files"
      project: @project.id
      folder: "doc"
    },(msg)=>
      @setDocList msg.files

    @updateComments()
    @updateCredentials()

    a = document.querySelector("#project-contents-view .sprites .export-panel a")
    a.href = "/#{@project.owner}/#{@project.slug}/export/sprites/"
    a.download = "#{@project.slug}_sprites.zip"

    a = document.querySelector("#project-details-exportbutton")
    a.href = "/#{@project.owner}/#{@project.slug}/export/project/"
    a.download = "#{@project.slug}_files.zip"

  updateCredentials:()->
    if @app.user?
      document.getElementById("login-to-post-comment").style.display = "none"
      if @app.user.flags.validated
        document.getElementById("validate-to-post-comment").style.display = "none"
        document.getElementById("post-project-comment").style.display = "block"
      else
        document.getElementById("validate-to-post-comment").style.display = "inline-block"
        document.getElementById("post-project-comment").style.display = "none"
    else
      document.getElementById("login-to-post-comment").style.display = "inline-block"
      document.getElementById("validate-to-post-comment").style.display = "none"
      document.getElementById("post-project-comment").style.display = "none"

  loadFile:(url,callback)->
    req = new XMLHttpRequest()
    req.onreadystatechange = (event) =>
      if req.readyState == XMLHttpRequest.DONE
        if req.status == 200
          callback(req.responseText)

    req.open "GET",url
    req.send()

  setSection:(section)->
    for s in @menu
      if s == section
        document.getElementById("project-contents-menu-#{s}").classList.add "selected"
        document.querySelector("#project-contents-view .#{s}").style.display = "block"
      else
        document.getElementById("project-contents-menu-#{s}").classList.remove "selected"
        document.querySelector("#project-contents-view .#{s}").style.display = "none"
    return

  createSourceEntry:(file)->
    @app.client.sendRequest {
      name: "read_public_project_file"
      project: @project.id
      file: "ms/#{file}"
    },(msg)=>
      @sources[file] = msg.content
      div = document.createElement "div"
      div.innerHTML = "<i class='fa fa-file-code'></i> #{file.split(".")[0]}"
      document.querySelector("#project-contents-view .code-list").appendChild div
      div.id = "project-contents-view-source-#{file}"
      div.addEventListener "click",()=>@setSelectedSource(file)
      if not @selected_source?
        @setSelectedSource(file)

  setSelectedSource:(file)->
    @selected_source = file
    for key of @sources
      if key == file
        document.getElementById("project-contents-view-source-#{key}").classList.add "selected"
      else
        document.getElementById("project-contents-view-source-#{key}").classList.remove "selected"

    @editor.setValue @sources[file],-1
    return if not @app.project?
    if @imported_sources[file]
      document.querySelector("#project-contents-source-import").classList.add "done"
      document.querySelector("#project-contents-source-import i").classList.remove "fa-download"
      document.querySelector("#project-contents-source-import i").classList.add "fa-check"
      document.querySelector("#project-contents-source-import span").innerText = @app.translator.get("Source file imported")
    else
      document.querySelector("#project-contents-source-import").classList.remove "done"
      document.querySelector("#project-contents-source-import i").classList.add "fa-download"
      document.querySelector("#project-contents-source-import i").classList.remove "fa-check"
      document.querySelector("#project-contents-source-import span").innerText = @app.translator.get("Import source file to")+" "+@app.project.title

  setSourceList:(files)->
    for f in files
      @createSourceEntry(f.file)
    return

  createSpriteBox:(file,prefs)->
    div = document.createElement "div"
    div.classList.add "sprite"

    img = @createSpriteThumb(new Sprite(location.origin+"/#{@project.owner}/#{@project.slug}/#{file}",null,prefs))
    div.appendChild img

    if @app.project?
      button = document.createElement "div"
      i = document.createElement "i"
      i.classList.add "fa"
      i.classList.add "fa-download"
      button.appendChild i
      span = document.createElement "span"
      span.innerText = @app.translator.get("Import to project")+" #{@app.project.title}"
      button.appendChild span
      clicked = false
      button.addEventListener "click",()=>
        return if clicked
        clicked = true
        source = new Image
        source.crossOrigin = "Anonymous"
        source.src = location.origin+"/#{@project.owner}/#{@project.slug}/#{file}"
        source.onload = ()=>
          canvas = document.createElement "canvas"
          canvas.width = source.width
          canvas.height = source.height
          canvas.getContext("2d").drawImage source,0,0

          name = file.split(".")[0]
          count = 1
          while @app.project.getSprite(name)?
            count += 1
            name = file.split(".")[0]+count

          file = name+".png"

          @app.client.sendRequest {
            name: "write_project_file"
            project: @app.project.id
            file: "sprites/#{file}"
            content: canvas.toDataURL().split(",")[1]
            properties: prefs
          },(msg)=>
            @app.project.updateSpriteList()
            div.style.width = "0px"
            setTimeout (()=>div.style.display = "none"),1000

      div.appendChild button

    document.querySelector("#project-contents-view .sprite-list").appendChild div


  createSpriteThumb:(sprite)->
    canvas = document.createElement "canvas"
    canvas.width = 100
    canvas.height = 100
    sprite.loaded = ()=>
      context = canvas.getContext "2d"
      frame = sprite.frames[0].getCanvas()
      r = Math.min(100/frame.width,100/frame.height)
      context.imageSmoothingEnabled = false
      w = r*frame.width
      h = r*frame.height
      context.drawImage frame,50-w/2,50-h/2,w,h

    mouseover = false
    update = ()=>
      if mouseover and sprite.frames.length>1
        requestAnimationFrame ()=>update()

      return if sprite.frames.length<1

      dt = 1000/sprite.fps
      t = Date.now()
      frame = if mouseover then Math.floor(t/dt)%sprite.frames.length else 0
      context = canvas.getContext "2d"
      context.imageSmoothingEnabled = false
      context.clearRect 0,0,100,100
      frame = sprite.frames[frame].getCanvas()
      r = Math.min(100/frame.width,100/frame.height)
      w = r*frame.width
      h = r*frame.height
      context.drawImage frame,50-w/2,50-h/2,w,h

    canvas.addEventListener "mouseenter",()=>
      mouseover = true
      update()

    canvas.addEventListener "mouseout",()=>
      mouseover = false

    canvas.updateSprite = update

    canvas

  setSpriteList:(files)->
    for f in files
      @createSpriteBox(f.file,f.properties)
    return

  createImportButton:(div,file,folder)->
    button = document.createElement "div"
    i = document.createElement "i"
    i.classList.add "fa"
    i.classList.add "fa-download"
    button.appendChild i
    span = document.createElement "span"
    span.innerText = @app.translator.get("Import to project")+" #{@app.project.title}"
    button.appendChild span
    clicked = false
    button.addEventListener "click",()=>
      return if clicked
      clicked = true
      source = new Image
      source.crossOrigin = "Anonymous"
      source.src = location.origin+"/#{@project.owner}/#{@project.slug}/#{file}"
      source.onload = ()=>
        canvas = document.createElement "canvas"
        canvas.width = source.width
        canvas.height = source.height
        canvas.getContext("2d").drawImage source,0,0

        name = file.split(".")[0]
        count = 1
        while @app.project.getSprite(name)?
          count += 1
          name = file.split(".")[0]+count

        file = name+".png"

        @app.client.sendRequest {
          name: "write_project_file"
          project: @app.project.id
          file: "sprites/#{file}"
          content: canvas.toDataURL().split(",")[1]
          properties: prefs
        },(msg)=>
          @app.project.updateSpriteList()
          div.style.width = "0px"
          setTimeout (()=>div.style.display = "none"),1000

  createSoundBox:(file,prefs)->
    div = document.createElement "div"
    div.classList.add "sound"

    img = new Image
    img.src = location.origin+"/#{@project.owner}/#{@project.slug}/sounds_th/#{file.replace(".wav",".png")}"
    div.appendChild img

    div.appendChild document.createElement "br"
    span = document.createElement "span"
    span.innerText = file.split(".")[0]
    div.appendChild span

    div.addEventListener "click",()=>
      url = location.origin+"/#{@project.owner}/#{@project.slug}/sounds/#{file}"
      audio = new Audio(url)
      audio.play()

      funk = ()->
        audio.pause()
        document.body.removeEventListener "mousedown",funk

      document.body.addEventListener "mousedown",funk


#    if @app.project?
#      createImportButton div

    document.querySelector("#project-contents-view .sound-list").appendChild div

  setSoundList:(files)->
    if files.length>0
      document.getElementById("project-contents-menu-sounds").style.display = "block"
    else
      document.getElementById("project-contents-menu-sounds").style.display = "none"

    for f in files
      @createSoundBox(f.file)
    return

  createMusicBox:(file,prefs)->
    div = document.createElement "div"
    div.classList.add "music"

    img = new Image
    img.src = location.origin+"/#{@project.owner}/#{@project.slug}/music_th/#{file.replace(".mp3",".png")}"
    div.appendChild img

    div.appendChild document.createElement "br"
    span = document.createElement "span"
    span.innerText = file.split(".")[0]
    div.appendChild span

    div.addEventListener "click",()=>
      url = location.origin+"/#{@project.owner}/#{@project.slug}/music/#{file}"
      audio = new Audio(url)
      audio.play()

      funk = ()->
        audio.pause()
        document.body.removeEventListener "mousedown",funk

      document.body.addEventListener "mousedown",funk


#    if @app.project?
#      createImportButton div

    document.querySelector("#project-contents-view .music-list").appendChild div

  setMusicList:(files)->
    if files.length>0
      document.getElementById("project-contents-menu-music").style.display = "block"
    else
      document.getElementById("project-contents-menu-music").style.display = "none"

    for f in files
      @createMusicBox(f.file,f.properties)
    return

  setMapList:(files)->
    console.info files

  setDocList:(files)->
    if files.length>0
      document.getElementById("project-contents-menu-doc").style.display = "block"
      @app.client.sendRequest {
        name: "read_public_project_file"
        project: @project.id
        file: "doc/#{files[0].file}"
      },(msg)=>
        @doc = msg.content
        if @doc? and @doc.trim().length>0
          document.querySelector("#project-contents-view .doc-render").innerHTML = DOMPurify.sanitize marked msg.content
        else
          document.getElementById("project-contents-menu-doc").style.display = "none"
    else
      document.getElementById("project-contents-menu-doc").style.display = "none"
    #console.info files

  updateComments:()->
    @app.client.sendRequest {
      name: "get_project_comments"
      project: @project.id
    },(msg)=>
      e = document.getElementById("project-comment-list")
      e.innerHTML = ""
      if msg.comments?
        for c in msg.comments
          @createCommentBox(c)
      return

  createCommentBox:(c)->
    console.info c
    div = document.createElement("div")
    div.classList.add "comment"
    author = document.createElement("div")
    author.classList.add "author"
    i = document.createElement("i")
    i.classList.add "fa"
    i.classList.add "fa-user"
    span = document.createElement "span"
    span.innerText = c.user
    author.appendChild i
    author.appendChild span

    author = @app.appui.createUserTag(c.user,c.user_info.tier,c.user_info.profile_image,12)

    time = document.createElement "div"
    time.classList.add "time"
    t = (Date.now()-c.time)/60000
    if t<2
      tt = @app.translator.get("now")
    else if t<120
      tt = @app.translator.get("%NUM% minutes ago").replace("%NUM%",Math.round(t))
    else
      t /= 60
      if t<48
        tt = @app.translator.get("%NUM% hours ago").replace("%NUM%",Math.round(t))
      else
        t/= 24
        if t<14
          tt = @app.translator.get("%NUM% days ago").replace("%NUM%",Math.round(t))
        else if t<30
          tt = @app.translator.get("%NUM% weeks ago").replace("%NUM%",Math.round(t/7))
        else
          tt = new Date(c.time).toLocaleDateString(@app.translator.lang,{ year: 'numeric', month: 'long', day: 'numeric' })

    time.innerText = tt
    div.appendChild time

    div.appendChild author

    if @app.user? and (@app.user.nick == c.user or @app.user.flags.admin)
      buttons = document.createElement "div"
      buttons.classList.add "buttons"
      #buttons.appendChild @createButton "edit","Edit","green",()=>
      #  @editComment c
      #buttons.appendChild document.createElement "br"
      buttons.appendChild @createButton "trash","Delete","red",()=>
        @deleteComment c
      div.appendChild buttons

    contents = document.createElement "div"
    contents.classList.add "contents"
    contents.innerHTML = DOMPurify.sanitize marked c.text

    div.appendChild contents
    clear = document.createElement "div"
    clear.style = "clear:both"
    div.appendChild clear

    document.getElementById("project-comment-list").appendChild div

  createButton:(icon,text,color,callback)->
    button = document.createElement "div"
    button.classList.add "small"+color+"button"
    i = document.createElement "i"
    i.classList.add "fa"
    i.classList.add "fa-#{icon}"
    button.appendChild i
    span = document.createElement "span"
    span.innerText = text
    button.appendChild span
    button.addEventListener "click",()=>callback()
    button

  postComment:(text)->
    @app.client.sendRequest {
      name: "add_project_comment"
      project: @project.id
      text: text
    },(msg)=>
      @updateComments()

  editComment:(id,text)->

  deleteComment:(c)->
    if confirm @app.translator.get("Do you really want to delete this comment?")
      @app.client.sendRequest {
        name: "delete_project_comment"
        project: @project.id
        id: c.id
      },(msg)=>
        @updateComments()
