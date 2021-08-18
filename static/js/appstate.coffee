class @AppState
  constructor:(@app)->
    window.addEventListener "popstate",(event)=>@popState()

  pushState:(name,path,obj = {})->
    obj.name = name
    history.pushState obj,"",path

  popState:()->
    if history.state?
      s = history.state.name.split(".")
      if history.state.name in ["documentation","tutorials","about","projects","explore"]
        if history.state.name == "projects"
          if @app.project and @app.project.pending_changes.length>0
            history.forward()
            alert("Please wait while saving your changes...")
          else
            @app.appui.backToProjectList()
        if history.state.name == "explore"
          @app.explore.closeProject()
        @app.appui.setMainSection ((p)->{"documentation":"help"}[p] or p)(history.state.name)
      else if history.state.name == "home"
        @app.appui.setMainSection "home"
      else if history.state.name.startsWith("project.") and s[1]? and s[2]?
        project = s[1]
        if not @app.project? or @app.project.slug != project
          if @app.projects
            for p in @app.projects
              if p.slug == project
                @app.openProject(p,false)
                break

        @app.appui.setMainSection "projects"
        @app.appui.setSection s[2]
      else if history.state.name == "project_details"
        if history.state.project?
          @app.explore.openProject(history.state.project)
          @app.appui.setMainSection "explore"
        else
          s = location.pathname.split("/")
          if s[2]? and s[3]?
            if @app.explore.projects?
              p = @app.explore.findProject(s[2],s[3])
              if p
                @app.explore.openProject(p)
                @app.appui.setMainSection "explore"
            else
              @app.explore.update ()=>
                p = @app.explore.findProject(s[2],s[3])
                if p
                  @app.explore.openProject(p)
                  @app.appui.setMainSection "explore"


  initState:()->
    if location.pathname.startsWith("/login/")
      path = if @app.translator.lang != "en" then "/#{@app.translator.lang}/" else "/"
      history.replaceState {name:"home"},"",path
      @app.appui.setMainSection("home")
      @app.appui.showLoginPanel()
    else if location.pathname.startsWith("/tutorial/")
      path = location.pathname.split("/")
      path.splice 0,2
      if path[path.length-1] == ""
        path.splice path.length-1,1

      path = path.join("/")
      path = location.origin+"/#{path}/doc/doc.md?v=#{Date.now()}"
      console.info path
      tuto = new Tutorial(path,false)
      tuto.load ()=>
        @app.tutorial.start(tuto)
      ,(err)=>
        console.info err
        alert(@app.translator.get("Tutorial not found"))
        history.replaceState {name:"home"},"","/"

      @app.client.listen "project_file_updated",(msg)=>
        if msg.type == "doc" and msg.file == "doc"
          tuto.update(msg.data)
          @app.tutorial.update()

      user = location.pathname.split("/")[2]
      project = location.pathname.split("/")[3]

      @app.client.send
        name: "listen_to_project"
        user: user
        project: project

    else if location.pathname.startsWith("/i/")
      @app.appui.setMainSection("explore",false)
      history.replaceState {name:"project_details"},"",location.pathname
    else
      for p in ["about","tutorials","explore","documentation"]
        if location.pathname.startsWith("/#{p}/") or location.pathname == "/#{p}"
          history.replaceState {name:p},"",location.pathname
          return @app.appui.setMainSection ((p)=>{"documentation":"help"}[p] or p)(p)

      if @app.user?
        s = location.pathname.split("/")
        if location.pathname.startsWith("/projects/") and s[2] and s[3]
          project = s[2]
          tab = s[3]
          history.replaceState {name:"project.#{s[2]}.#{s[3]}"},"",location.pathname
        else
          @app.appui.setMainSection("projects")
          history.replaceState {name:"projects"},"","/projects/"
      else
        path = if @app.translator.lang != "en" then "/#{@app.translator.lang}/" else "/"
        history.replaceState {name:"home"},"",path
        @app.appui.setMainSection("home")

  projectsFetched:()->
    if history.state? and history.state.name?
      if history.state.name.startsWith "project."
        @popState()
