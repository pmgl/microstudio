class @Explore
  constructor:(@app)->
    @get("explore-back-button").addEventListener "click",()=>
      @closeDetails()
      @app.appui.setMainSection "explore",true

    @sort = "hot"
    @active_tags = []
    @search = ""

    @tags = []

    @visited_projects = {}

    @sort_types = ["hot","new","top"]

    @project_types = ["all","app","library","plugin","tutorial"]
    @project_type = "all"

    @sort_functions =
      hot: (a,b)-> b.likes-a.likes+b.date_published/(1000*3600*24)-a.date_published/(1000*3600*24)
      top: (a,b)-> b.likes-a.likes
      new: (a,b)-> b.date_published-a.date_published

    document.getElementById("explore-sort-button").addEventListener "click",()=>
      s = @sort_types.indexOf @sort
      s = (s+1)%@sort_types.length
      @sort = @sort_types[s]
      e = document.getElementById("explore-sort-button")
      for s in @sort_types
        if s == @sort
          e.classList.add s
        else
          e.classList.remove s
      document.querySelector("#explore-sort-button span").innerText = @app.translator.get @sort.substring(0,1).toUpperCase()+@sort.substring(1)
      @query()

    document.getElementById("explore-type-button").addEventListener "click",()=>
      s = @project_types.indexOf @project_type
      s = (s+1)%@project_types.length
      @project_type = @project_types[s]
      e = document.getElementById("explore-type-button")
      for s in @project_types
        if s == @project_type
          e.classList.add s
        else
          e.classList.remove s
      document.querySelector("#explore-type-button span").innerText = @app.translator.get @project_type.substring(0,1).toUpperCase()+@project_type.substring(1)
      @query()

    document.getElementById("explore-search-input").addEventListener "input",()=>
      @search = document.getElementById("explore-search-input").value
      if @search_timeout?
        clearTimeout @search_timeout
      @search_timeout = setTimeout (()=>@query()),1500

    document.getElementById("explore-contents").addEventListener "scroll",()=>
      contents = document.getElementById "explore-box-list"
      scrollzone = document.getElementById "explore-contents"
      h1 = contents.getBoundingClientRect().height
      h2 = scrollzone.getBoundingClientRect().height
      if scrollzone.scrollTop > h1-h2-100 #contents.getBoundingClientRect().height < scrollzone.scrollTop+window.innerHeight*2
        if not @completed
          pos = @projects.length
          if pos != @query_position
            @query pos

      return

    @cloned = {}

    @get("project-details-clonebutton").addEventListener "click",()=>
      if not @app.user?
        return alert(@app.translator.get("Log in or create your account to clone this project."))
      @get("project-details-clonebutton").style.display = "none"
      @cloned[@project.id] = true
      @app.client.sendRequest {
        name: "clone_public_project"
        project: @project.id
      },(msg)=>
        @app.appui.setMainSection("projects")
        @app.appui.backToProjectList()
        @app.updateProjectList(msg.id)
        @app.appui.showNotification(@app.translator.get("Project cloned! Here is your copy."))

    likes = @get("project-details-likes")

    likes.addEventListener "click",()=>
      if not @app.user.flags.validated
        return alert(@app.translator.get("Validate your e-mail address to enable votes."))
      if @project?
        @app.client.sendRequest {
          name:"toggle_like"
          project: @project.id
        },(msg)=>
          if msg.name == "project_likes"
            likes.innerHTML = "<i class='fa fa-thumbs-up'></i> "+msg.likes
            if msg.liked
              likes.classList.add "voted"
            else
              likes.classList.remove "voted"

    document.querySelector("#explore-tags-bar i").addEventListener "click",()=>
      bar = document.querySelector("#explore-tags-bar")
      icon = bar.querySelector "i"
      if bar.classList.contains "collapsed"
        bar.classList.remove "collapsed"
        icon.classList.remove "fa-caret-right"
        icon.classList.add "fa-caret-down"
      else
        bar.classList.add "collapsed"
        icon.classList.add "fa-caret-right"
        icon.classList.remove "fa-caret-down"

  closeDetails:()->
    @closeProject()
      #@app.setHomeState()

  closed:()->
    if !document.title.startsWith("microStudio")
      document.title = "microStudio"

  findBestTag:(p)->
    tag = p.tags[0]
    score = @tags.indexOf(tag)
    if score < 0 then score = 1000
    for t in p.tags
      index = @tags.indexOf t
      if index >= 0 and index < score
        score = index
        tag = t

    tag

  createProjectBox:(p)->
    element = document.createElement "div"
    element.classList.add "explore-project-box"

    if p.tags.length>0
      tag = document.createElement "div"
      tag.innerText = @findBestTag p
      tag.classList.add "project-tag"
      element.appendChild tag

    if p.poster
      icon = new Image
      icon.src = location.origin+"/#{p.owner}/#{p.slug}/poster.png"
      icon.classList.add "poster"
      #icon.classList.add "pixelated"
      icon.alt = p.title
      icon.title = p.title
      element.appendChild icon

      smallicon = new Image
      smallicon.src = location.origin+"/#{p.owner}/#{p.slug}/icon.png"
      smallicon.classList.add "smallicon"
      smallicon.classList.add "pixelated"
      smallicon.alt = p.title
      smallicon.title = p.title
      element.appendChild smallicon

    else
      icon = new Image
      icon.src = location.origin+"/#{p.owner}/#{p.slug}/icon.png"
      icon.classList.add "icon"
      icon.classList.add "pixelated"
      icon.alt = p.title
      icon.title = p.title
      element.appendChild icon

    element.style.opacity = 0
    element.style["transition-duration"] = "1s"
    element.style["transition-property"] = "opacity"
    icon.onload = ()=>
      element.style.opacity = 1

    infobox = document.createElement "div"
    infobox.classList.add "explore-infobox"
    element.appendChild infobox

    title = document.createElement "div"
    title.classList.add "explore-project-title"
    title.innerText = p.title
    infobox.appendChild title

    author = @app.appui.createUserTag p.owner,p.owner_info.tier,p.owner_info.profile_image

    infobox.appendChild author

    likes = document.createElement "div"
    likes.classList.add "explore-project-likes"
    likes.innerHTML = "<i class='fa fa-thumbs-up'></i> "+p.likes
    likes.classList.add("voted") if p.liked
    infobox.appendChild likes

    runbutton = document.createElement "div"
    runbutton.classList.add "run-button"
    runbutton.innerHTML = "<i class='fa fa-play'></i> "+@app.translator.get("Run")
    element.appendChild runbutton

    likes.addEventListener "click",(event)=>
      event.stopImmediatePropagation()
      if not @app.user.flags.validated
        return alert(@app.translator.get("Validate your e-mail address to enable votes."))
      @app.client.sendRequest {
        name:"toggle_like"
        project: p.id
      },(msg)=>
        if msg.name == "project_likes"
          likes.innerHTML = "<i class='fa fa-thumbs-up'></i> "+msg.likes
          p.likes = msg.likes
          if msg.liked
            likes.classList.add "voted"
            p.liked = true
          else
            p.liked = false
            likes.classList.remove "voted"

    if p.type != "app"
      label = document.createElement "div"
      label.classList.add "type-label"
      label.classList.add p.type
      switch p.type
        when "library" then label.innerHTML = """<i class="fas fa-file-code"></i> #{@app.translator.get("Library")}"""
        when "plugin" then label.innerHTML = """<i class="fas fa-plug"></i> #{@app.translator.get("Plug-in")}"""
        when "tutorial" then label.innerHTML = """<i class="fas fa-graduation-cap"></i> #{@app.translator.get("Tutorial")}"""

      element.appendChild label

    runbutton.addEventListener "click",(event)=>
      event.stopPropagation()
      if p.type == "tutorial"
        window.open location.origin.replace(".dev",".io")+"/tutorial/#{p.owner}/#{p.slug}/","_blank"
      else
        window.open location.origin.replace(".dev",".io")+"/#{p.owner}/#{p.slug}/","_blank"

    element.addEventListener "click",()=>
      if screen.width<=700
        window.open location.origin.replace(".dev",".io")+"/#{p.owner}/#{p.slug}/","_blank"
      else
        @app.app_state.pushState "project_details","/i/#{p.owner}/#{p.slug}/",{project: p}
        @openProject(p)
        @canBack = true

    element

  get:(id)->
    document.getElementById(id)

  findProject:(owner,slug)->
    id = "#{owner}.#{slug}"
    if @visited_projects[id]?
      return @visited_projects[id]

    if @projects?
      for p in @projects
        if p.owner == owner and p.slug == slug
          return p

    return null

  openProject:(p)->
    @visited_projects["#{p.owner}.#{p.slug}"] = p
    @project = p
    if @cloned[@project.id]
      @get("project-details-clonebutton").style.display = "none"
    else
      @get("project-details-clonebutton").style.display = "inline-block"

    document.title = @app.translator.get("%PROJECT% - by %USER%").replace("%PROJECT%",p.title).replace("%USER%",p.owner)

    @get("explore-back-button").style.display = "inline-block"
    @get("explore-tools").style.display = "none"
    @get("explore-tags-bar").style.display = "none"
    @get("explore-contents").style.display = "none"
    @get("explore-project-details").style.display = "block"

    @get("project-details-image").src = location.origin+"/#{p.owner}/#{p.slug}/icon.png"
    @get("project-details-title").innerText = p.title
    desc = DOMPurify.sanitize marked p.description

    if p.poster
      @get("project-details-info").style.background = "linear-gradient(to bottom, hsla(200,10%,10%,0.8), hsla(200,10%,10%,0.9)),url(/#{p.owner}/#{p.slug}/poster.png)"
      @get("project-details-info").style["background-size"] = "100%"
      @get("project-details-info").style["background-repeat"] = "no-repeat"
    else
      @get("project-details-info").style.background = "none"

    desc += """<p style="margin-bottom: 5px; font-size: 14px; color: rgba(255,255,255,.5)"><i class="fas fa-calendar-alt" style="color:hsl(160,50%,40%)"></i>#{@app.translator.get("First published on %DATE%").replace("%DATE%",new Date(p.date_published).toLocaleDateString())}</p>"""
    desc += """<p style="margin-bottom: 5px; font-size: 14px; color: rgba(255,255,255,.5)"><i class="fas fa-calendar-alt" style="color:hsl(160,50%,40%)"></i>#{@app.translator.get("Last modified on %DATE%").replace("%DATE%",new Date(p.last_modified).toLocaleDateString())}</p>"""

    for lib in p.libs
      desc = """<p><i class="fas fa-info-circle" style="color:hsl(20,100%,70%)"></i>#{@app.translator.get("This project uses this optional library:")} #{lib}</p>"""+desc

    if p.graphics != "M1"
      desc = """<p><i class="fas fa-info-circle" style="color:hsl(20,100%,70%)"></i>#{@app.translator.get("This project uses this graphics API:")} #{p.graphics}</p>"""+desc

    if p.language?
      desc = """<br /><div class="explore-project-language #{p.language.split("_")[0]}">#{p.language.split("_")[0]}</div><br />"""+desc

    @get("project-details-description").innerHTML = desc
    document.querySelector("#project-details-author").innerHTML = ""
    document.querySelector("#project-details-author").appendChild @app.appui.createUserTag p.owner,p.owner_info.tier,p.owner_info.profile_image,12

    likes = @get("project-details-likes")
    likes.innerHTML = "<i class='fa fa-thumbs-up'></i> "+p.likes
    if p.liked
      likes.classList.add("voted")
    else
      likes.classList.remove "voted"

    if p.type == "tutorial"
      @get("project-details-runbutton").href = location.origin.replace(".dev",".io")+"/tutorial/#{p.owner}/#{p.slug}/"
    else
      @get("project-details-runbutton").href = location.origin.replace(".dev",".io")+"/#{p.owner}/#{p.slug}/"

    list = @get("project-details-tags")
    list.innerHTML = ""
    for t in p.tags
      div = document.createElement "div"
      div.classList.add("tag")
      div.innerText = t
      list.appendChild div
      if @app.user? and @app.user.flags.admin
        do (t)=>
          div.addEventListener "click",()=>
            if confirm("really delete tag?")
              index = p.tags.indexOf(t)
              if index>=0
                p.tags.splice index,1
                @app.client.sendRequest {
                  name:"set_project_tags"
                  project: p.id
                  tags: p.tags
                },(msg)=>
                  @openProject p
    if @app.user? and @app.user.flags.admin
      div = document.createElement "div"
      div.innerText = "Unpublish"
      div.style.padding = "10px"
      div.style.background = "hsl(20,50%,50%)"
      div.style.cursor = "pointer"
      div.style.display = "inline-block"
      div.style["border-radius"] = "5px"
      div.addEventListener "click",()=>
        if confirm("Really unpublish project?")
          @app.client.sendRequest {
            name:"set_project_public"
            id: p.id
            public: false
          },(msg)=>
            @closeDetails()
            @app.appui.setMainSection "explore",true

      document.getElementById("project-details-description").appendChild div

      div = document.createElement "div"
      div.classList.add("tag")
      div.innerText = "+ add"
      div.style = "background: hsl(0,50%,50%)"
      list.appendChild div
      div.addEventListener "click",()=>
        value = prompt("add tag")
        if value? and value.length>1
          p.tags.push value
          @app.client.sendRequest {
            name:"set_project_tags"
            project: p.id
            tags: p.tags
          },(msg)=>
            @openProject p


    if not @details?
      @details = new ProjectDetails @app
    @details.set p

  closeProject:(p)->
    @get("explore-back-button").style.display = "none"
    @get("explore-tools").style.display = "inline-block"
    @get("explore-tags-bar").style.display = "block"
    @get("explore-contents").style.display = "block"
    @get("explore-project-details").style.display = "none"
    @project = null
    @closed()

  createTags:(@tags)->
    document.getElementById("explore-tags").innerHTML = ""
    for t in @tags
      div = document.createElement "div"
      div.innerText = t
      if @active_tags.includes t
        div.classList.add "active"
      #span = document.createElement "span"
      #span.innerText = t.count
      #div.appendChild span
      document.getElementById("explore-tags").appendChild div
      do (t,div)=>
        div.addEventListener "click",()=>
          index = @active_tags.indexOf(t)
          if index>=0
            @active_tags.splice index,1
            div.classList.remove "active"
          else
            @active_tags.push t
            div.classList.add "active"
          @query()

    return

  loadProjects:(pos=0)->
    return if not @projects?
    contents = document.getElementById "explore-box-list"
    scrollzone = document.getElementById "explore-contents"
    if pos == 0 then contents.innerHTML = ""

    for i in [pos..@projects.length-1] by 1
      p = @projects[i]
      contents.appendChild @createProjectBox p
    return

  update:()->
    if not @initialized and location.pathname.startsWith "/i/"
      document.getElementById("explore-section").style.opacity = 0

    if not @initialized and location.pathname.startsWith "/i/"
      @initialized = true
      owner = location.pathname.split("/")[2]
      project = location.pathname.split("/")[3]
      @app.client.sendRequest {
        name:"get_public_project"
        owner: owner
        project: project
      },(msg)=>
        project = msg.project
        if project?
          @openProject project
          document.getElementById("explore-section").style.opacity = 1
          return
    else
      if not @projects? or @projects.length == 0
        @query()

  query:(position=0)->
    @query_position = position

    if position == 0 or not @current_offset?
      @current_offset = 0

    f = ()=>
    @app.client.sendRequest {
      name:"get_public_projects"
      ranking: @sort
      type: @project_type
      tags: @active_tags
      search: @search.toLowerCase()
      position: position
      offset: @current_offset
    },(msg)=>
      if position == 0
        @current_position = position
        @current_offset = msg.offset
        @completed = false
        @projects = msg.list
        @createTags(msg.tags)
        @loadProjects()
        document.getElementById("explore-contents").scrollTop = 0
      else
        if msg.list.length == 0
          @completed = true

        @current_position = position
        @current_offset = msg.offset
        pos = @projects.length
        @projects = @projects.concat msg.list
        @loadProjects(pos)

      if not @initialized
        @initialized = true
        document.getElementById("explore-section").style.opacity = 1

        #@app.setHomeState()
    return
