class @LibManager
  constructor:(@app)->
    @known_libs = {}

  projectOpened:()->
    @active_libs = {}
    @updateLibSelection()

  createLibBox:(project)->
    console.info project

    nick = if typeof project.owner == "string" then project.owner else project.owner.nick
    id = project.id
    path = "/#{nick}/#{project.slug}"

    if project.code?
      path += "/#{project.code}"

    @known_libs[id] =
      nick: nick
      slug: project.slug
      title: project.title
      code: project.code
      url: "#{location.origin}#{path}/"
      language: project.language

    div = document.createElement "div"
    div.classList.add "lib-box"
    div.dataset.id = id
    desc = project.description
    if desc.length>300
      desc = desc.substring(0,300)+" (...)"
    div.innerHTML = """
    <img class="pixelated icon" src="#{location.origin}#{path}/sprites/icon.png"/>
    <div class="description md dark">
      <div class="plugin-author"></div>
      <h4>#{project.title}</h4>
      <p>#{DOMPurify.sanitize marked desc}</p>
      <div class="docbutton"><i class="fa fa-book-open"></i> #{@app.translator.get("Documentation")}</div>
#{if not project.code? then """<a class="docbutton" href="#{location.origin}/i/#{nick}/#{project.slug}/" target="_blank"><i class="fa fa-eye"></i> #{@app.translator.get("Library Details")}</a>""" else ""}
      <i class="fa fa-check check"></i>
    </div>
    """

    list = div.getElementsByTagName "a"
    for e in list
      e.target = "_blank"
      e.addEventListener "click",(event)=>event.stopPropagation()

    if project.owner_info
      user = @app.appui.createUserTag(nick,project.owner_info.tier,project.owner_info.profile_image,20)
    else if project.owner.nick == @app.user.nick
      user = @app.appui.createUserTag(@app.user.nick,@app.user.flags.tier or "",@app.user.flags.profile_image,20)
    else
      user = @app.appui.createUserTag(project.owner.nick,"",false,20)

    div.querySelector(".plugin-author").appendChild user
    div.id = "lib-box-#{id}"

    div.addEventListener "click",()=>
      if div.querySelector("input") != document.activeElement
        @toggleLib id

    div.querySelector(".docbutton").addEventListener "click",(event)=>
      event.stopPropagation()
      @openDoc id
    div

  toggleLib:(id)->
    if @isLibActive(id)
      @setLibActive id,false
    else
      @setLibActive id,true

  resetLibs:()->
    @libs_fetched = false

  fetchAvailableLibs:(callback)->
    return callback() if @libs_fetched

    @libs_fetched = true

    your_libs = document.querySelector "#your-libs"
    your_list = document.querySelector "#your-libs .lib-list"

    your_list.innerHTML = ""

    for p in @app.projects
      if p.type == "library"
        box = @createLibBox(p)
        your_list.appendChild box

    if your_list.childNodes.length == 0
      your_libs.style.display = "none"
    else
      your_libs.style.display = "block"

    @app.client.sendRequest {
      name:"get_public_libraries"
    },(msg)=>
      console.info msg.list

      public_libs = document.querySelector "#public-libs"
      public_list = document.querySelector "#public-libs .lib-list"

      for p in msg.list
        if not @known_libs[p.id]?
          box = @createLibBox p
          public_list.appendChild box

      if public_list.childNodes.length == 0
        public_libs.style.display = "none"
      else
        public_libs.style.display = "block"

      callback()

  updateLibSelection:()->
    @fetchAvailableLibs ()=>
      list = document.querySelectorAll ".lib-box"
      libs = @app.project.libraries or {}
      for e in list
        if libs[e.dataset.id]
          e.classList.add "selected"
        else
          e.classList.remove "selected"

        lib = @known_libs[e.dataset.id]
        if lib? and lib.language.split("_")[0] == @app.project.language.split("_")[0]
          e.style.display = "block"
        else
          e.style.display = "none"

      for key,value of libs
        if not @active_libs[key]
          @active_libs[key] = value
          @createLibUI key

      for key,value of @active_libs
        if not libs[key]
          delete @active_libs[key]
          @app.documentation.removeLib key
      return

  isLibActive:(id)->
    p = @app.project
    return false if not p
    libs = p.libraries or {}
    libs[id]?

  setLibActive:(id,active)->
    p = @app.project
    if not p.libraries?
      p.libraries = {}
    if active
      p.libraries[id] =
        active: true
    else
      delete p.libraries[id]

    @updateLibSelection()

    if active
      @install id
    else
      @remove id

    @app.client.sendRequest {
      name: "set_project_option"
      project: @app.project.id
      option: "libraries"
      value: p.libraries
    },(msg)=>

  createLibUI:(id)->
    data = @known_libs[id]
    return if not data?
    if data.code?
      path = "#{data.nick}/#{data.slug}/#{data.code}"
    else
      path = "#{data.nick}/#{data.slug}"

    doc_url = "#{location.origin}/#{path}/doc/doc.md"
    @app.documentation.addLib id,data.title,doc_url

  openDoc:(id)->
    @createLibUI id
    data = @known_libs[id]
    return if not data?
    if data.code?
      path = "#{data.nick}/#{data.slug}/#{data.code}"
    else
      path = "#{data.nick}/#{data.slug}"

    doc_url = "#{location.origin}/#{path}/doc/doc.md"
    @app.documentation.setSection id,(()=>),doc_url
    @app.appui.setMainSection "help",true

  projectClosed:()->
    @app.documentation.removeAllLibs()
    return

  install:(id)->
    lib = @known_libs[id]
    if lib?
      @app.client.sendRequest {
        name: "list_project_files"
        project: id
        folder: "ms"
      },(msg)=>
        console.info msg.files
        files = []
        for f in msg.files
          if f.file.startsWith "lib-"
            files.push f

        if files.length == 0
          for f in msg.files
            if not f.file.includes("demo") and not f.file.includes("main") and not f.file.includes("test") and not f.file.includes("example")
              files.push f

        if files.length == 0
          files = msg.files

        for f in files
          do (f)=>
            name = f.file
            if name.startsWith "lib-"
              name = name.substring(4)
            name = "lib-#{RegexLib.fixFilename lib.nick}-#{RegexLib.fixFilename lib.slug}-#{name.substring(0,name.length-3)}"
            @app.client.sendRequest {
              name: "read_project_file"
              project: id
              file: "ms/#{f.file}"
            },(msg)=>
              console.info msg.content
              @app.project.writeSourceFile name,msg.content

  remove:(id)->
    lib = @known_libs[id]
    if lib?
      start = "lib-#{RegexLib.fixFilename lib.nick}-#{RegexLib.fixFilename lib.slug}"
      list = []
      for file in @app.project.source_list
        if file.name.startsWith start
          list.push file

      for file in list
        @app.client.sendRequest {
          name: "delete_project_file"
          project: @app.project.id
          file: "ms/#{file.name}.ms"
        },(msg)=>
          console.info msg
          @app.project.updateSourceList()
