class @Explore
  constructor:(@app)->
    @get("explore-back-button").addEventListener "click",()=>
      @closeDetails()
      @app.appui.setMainSection "explore",true

    @sort = "hot"

    @sort_types = ["hot","new","top"]

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
      @loadProjects()

    document.getElementById("explore-search-input").addEventListener "input",()=>
      @loadProjects()

    document.getElementById("explore-contents").addEventListener "scroll",()=>
      contents = document.getElementById "explore-box-list"
      scrollzone = document.getElementById "explore-contents"
      while @remaining? and @remaining.length>0 and contents.getBoundingClientRect().height<scrollzone.scrollTop+window.innerHeight*2
        contents.appendChild @createProjectBox @remaining.splice(0,1)[0]
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

  closeDetails:()->
    @closeProject()
      #@app.setHomeState()

  findBestTag:(p)->
    tag = p.tags[0]
    score = 0
    for t in p.tags
      if @tag_scores[t]>score
        score = @tag_scores[t]
        tag = t

    tag

  createProjectBox:(p)->
    if @boxes[p.owner+"/"+p.slug]
      return @boxes[p.owner+"/"+p.slug]
    element = document.createElement "div"
    element.classList.add "explore-project-box"

    if p.tags.length>0 and @tag_scores?
      tag = document.createElement "div"
      tag.innerText = @findBestTag p
      tag.classList.add "project-tag"
      element.appendChild tag

    icon = PixelatedImage.create location.origin+"/#{p.owner}/#{p.slug}/icon.png",200
    icon.classList.add "icon"
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

    @boxes[p.owner+"/"+p.slug] = element

  get:(id)->
    document.getElementById(id)

  findProject:(owner,slug)->
    if @projects?
      for p in @projects
        if p.owner == owner and p.slug == slug
          return p
    return null

  openProject:(p)->
    @project = p
    if @cloned[@project.id]
      @get("project-details-clonebutton").style.display = "none"
    else
      @get("project-details-clonebutton").style.display = "inline-block"

    @get("explore-back-button").style.display = "inline-block"
    @get("explore-tools").style.display = "none"
    @get("explore-contents").style.display = "none"
    @get("explore-project-details").style.display = "block"

    PixelatedImage.setURL @get("project-details-image"),location.origin+"/#{p.owner}/#{p.slug}/icon.png",200
    @get("project-details-title").innerText = p.title
    @get("project-details-description").innerHTML = DOMPurify.sanitize marked p.description
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
    @get("explore-contents").style.display = "block"
    @get("explore-project-details").style.display = "none"
    @project = null

  createTags:()->
    @active_tags = []
    tags = {}
    count = {}

    for p in @projects
      for t in p.tags
        if not tags[t]?
          tags[t] = {}
          count[t] = 1

        tags[t][p.owner] = true
        count[t] += 1

    for t of tags
      tags[t] = Object.keys(tags[t]).length+count[t]*.001

    list = []
    for tag,count of tags
      list.push
        tag: tag
        count: count

    @tag_scores = tags

    list.sort (a,b)->b.count-a.count

    document.getElementById("explore-tags").innerHTML = ""
    for t in list
      div = document.createElement "div"
      div.innerText = t.tag
      #span = document.createElement "span"
      #span.innerText = t.count
      #div.appendChild span
      document.getElementById("explore-tags").appendChild div
      do (t,div)=>
        div.addEventListener "click",()=>
          index = @active_tags.indexOf(t.tag)
          if index>=0
            @active_tags.splice index,1
            div.classList.remove "active"
          else
            @active_tags.push t.tag
            div.classList.add "active"
          @loadProjects()

    return

  loadProjects:()->
    return if not @projects?
    contents = document.getElementById "explore-box-list"
    scrollzone = document.getElementById "explore-contents"
    contents.innerHTML = ""
    @remaining = []

    if @sort == "hot" and @projects.length>4
      now = Date.now()
      @projects.sort @sort_functions.top
      maxLikes = Math.max(1,@projects[4].likes)
      @projects.sort @sort_functions.new
      maxAge = now-@projects[@projects.length-1].date_published

      h = 1/24/7
      h = Math.max(0,(now-@projects[4].date_published))/1000/3600

      # note = (p)->
      #   hours = Math.max(0,(now-p.date_published))/1000/3600
      #   agemark = Math.min(1,Math.exp(-hours/h)/Math.exp(-1))
      #   p.likes/maxLikes*50+50*agemark

      # note = (p)->
      #   bump = Math.min(1,(now-p.date_published)/1000/3600/24/30)
      #   bump = .5+.5*Math.cos(bump*Math.PI)
      #   p.likes + maxLikes*(bump*1+.4*Math.exp(Math.log(.5)*(now-p.date_published)/1000/3600/24/4))

      note = (p)->
        bump = Math.min(1,(now-p.date_published)/1000/3600/24/10)
        bump = .5+.5*Math.cos(bump*Math.PI)
        p.likes + maxLikes*(bump*.5+1.5*Math.exp(Math.log(.5)*(now-p.date_published)/1000/3600/24/180))

      @sort_functions.hot = (a,b)->
        note(b)-note(a)

    @projects.sort @sort_functions[@sort]
    search = document.getElementById("explore-search-input").value.toLowerCase()
    for p in @projects
      if @active_tags.length>0
        found = false
        for t in @active_tags
          if p.tags.indexOf(t)>=0
            found = true
        continue if not found

      if search.length>0
        found = p.title.toLowerCase().indexOf(search)>=0
        found |= p.description.toLowerCase().indexOf(search)>=0
        found |= p.owner.toLowerCase().indexOf(search)>=0
        if found
          console.info "found: "+p.owner
        for t in p.tags
          found |= t.toLowerCase().indexOf(search)>=0

        continue if not found

      if contents.getBoundingClientRect().height<scrollzone.scrollTop+window.innerHeight*2
        contents.appendChild @createProjectBox p
      else
        @remaining.push p
    return

  update:(callback)->
    if @list_received
      callback() if callback?
      return

    if not @initialized and location.pathname.startsWith "/i/"
      document.getElementById("explore-section").style.opacity = 0

    contents = document.getElementById "explore-box-list"
    contents.innerHTML = ""

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
      @app.client.sendRequest {
        name:"get_public_projects"
        ranking: "hot"
        tags: []
      },(msg)=>
        @projects = msg.list
        @list_received = true
        #console.info "PUBLIC PROJECTS SIZE: "+(JSON.stringify(@projects)).length
        @boxes = {}
        @createTags()
        @loadProjects()

        if not @initialized
          @initialized = true
          document.getElementById("explore-section").style.opacity = 1

          #@app.setHomeState()
      callback() if callback?
      return
