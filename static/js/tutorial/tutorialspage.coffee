class TutorialsPage
  constructor:(@tutorials)->
    @app = @tutorials.app
    @sections = ["core","community","examples"]
    @initSections()
    @setSection @sections[0],false
    @search = ""

    document.querySelector("#tutorials-example-view-topbar i").addEventListener "click",()=>
      @closeExampleView()
      @pushState()

    document.getElementById("example-search-input").addEventListener "input",()=>
      @search = document.getElementById("example-search-input").value
      @planExamplesUpdate()

    document.querySelector("#tutorials-content-examples .project-search-bar select").addEventListener "change",()=>@planExamplesUpdate()
    
  planExamplesUpdate:()->
    if @search_timeout?
      clearTimeout @search_timeout
    @search_timeout = setTimeout (()=>
      @queryExamples 0,(list)=>
        @displayExamples list
      ),1500
    document.querySelector("#tutorials-examples-list").style.opacity = .25

  initSections:()->
    for s in @sections
      do (s)=>
        document.getElementById("tutorials-#{s}").addEventListener "click",()=>
          @setSection(s)

  pushState:()->
    if @current == "core"
      @app.app_state.pushState "tutorials","/tutorials/"
    else
      if @current == "examples" and @current_project?
        @app.app_state.pushState "tutorials.#{@current}.#{@current_project.owner}.#{@current_project.slug}","/tutorials/#{@current}/#{@current_project.owner}/#{@current_project.slug}/"
      else
        @app.app_state.pushState "tutorials.#{@current}","/tutorials/#{@current}/"

  setSection:(section,push_state=true)->
    console.info(section)
    @current = section
    if push_state
      @pushState()

    for s in @sections
      if s == section
        document.getElementById("tutorials-#{s}").classList.add "selected"
        document.getElementById("tutorials-content-#{s}").style.display = "block"
      else
        document.getElementById("tutorials-#{s}").classList.remove "selected"
        document.getElementById("tutorials-content-#{s}").style.display = "none"

    if section == "community"
      @updateCommunity()
    else if section == "examples"
      @updateExamples()

  queryExamples:(offset=0,callback,list=[])->
    language = document.querySelector("#tutorials-content-examples .project-search-bar select").value.toLowerCase()

    @app.client.sendRequest {
      name:"get_public_projects"
      ranking: "hot"
      type: "example"
      language: language
      tags: []
      search: @search.toLowerCase()
      position: 0
      offset: offset
    },(msg)=>
        if msg.list.length == 0
          if callback?
            callback list
        else
          list = list.concat msg.list
          @queryExamples(msg.offset,callback,list)

  fetchAll:(type,offset=0,callback,list=[])->
      @app.client.sendRequest {
        name:"get_public_projects"
        ranking: "hot"
        type: type
        tags: []
        search: "" #@search.toLowerCase()
        position: 0
        offset: offset
      },(msg)=>
          if msg.list.length == 0
            callback list
          else
            list = list.concat msg.list
            @fetchAll(type,msg.offset,callback,list)

  createProjectBox:(p)->
    console.info(p)
    if not p.flags.approved and not p.owner_info.approved and window.ms_project_moderation
      return null

    div = document.createElement "div"
    div.classList.add "launch-project-box"
    title = document.createElement "div"
    title.innerText = p.title
    icon = new Image
    if p.icon
      icon.src = "#{run_domain}/#{p.owner}/#{p.slug}/sprites/icon.png"
    else
      icon.src = "#{dev_domain}/img/lightbulb16.png"
    icon.classList.add "pixelated"
    div.appendChild icon
    i = document.createElement "i"
    i.classList.add "fa"
    i.classList.add "fa-play"
    div.appendChild title
    div.appendChild i
    div

  updateCommunity:()->
    parent = document.getElementById "tutorials-content-community"
    parent.innerHTML = ""
    @fetchAll "tutorial",0,(list)=>
      for p in list
        box = @createProjectBox p
        if box
          parent.appendChild box
          do (p)=>
            box.addEventListener "click",()=>
              window.open dev_domain+"/tutorial/#{p.owner}/#{p.slug}/","_blank"


  updateExamples:()->
    @queryExamples 0,(list)=>
      @displayExamples(list)

  displayExamples:(list)->
    parent = document.getElementById "tutorials-examples-list"
    parent.innerHTML = ""
    parent.style.opacity = 1
    for p in list
      box = @createProjectBox p
      if box
        parent.appendChild box
        do (p,box)=>
          box.addEventListener "click",()=>
            @current_project =
              owner: p.owner
              slug: p.slug
            @loadExample(p)
            @openExampleView()
            @pushState()
    return

  reloadExample:(owner,slug)->
    @app.client.sendRequest {
      name:"get_public_project"
      owner: owner
      project: slug
    },(msg)=>
      project = msg.project
      if project?
        @loadExample project
        @openExampleView()
        @current_project =
          owner: project.owner
          slug: project.slug

  openExampleView:()->
    document.getElementById("tutorials-examples-list").style.display = "none"
    document.querySelector("#tutorials-content-examples .project-search-bar").style.display = "none"
    document.getElementById("tutorials-examples-view").style.display = "block"
    document.getElementById("tutorials-example-view-topbar").style.display = "block"

  closeExampleView:()->
    document.getElementById("tutorials-examples-list").style.display = "block"
    document.querySelector("#tutorials-content-examples .project-search-bar").style.display = "block"
    document.getElementById("tutorials-examples-view").style.display = "none"    
    document.getElementById("tutorials-example-view-topbar").style.display = "none"
    device = document.getElementById "tutorials-examples-run"
    device.innerHTML = ""        
    delete @current_project

  loadExample:(project)->
    delete @selected_source
    if not @examples_initialized
      @examples_initialized = true
      @examples_splitbar = new SplitBar("tutorials-examples-view","horizontal")
      @examples_splitbar.auto = 1
      @examples_code_splitbar = new SplitBar("tutorials-examples-code","horizontal")
      @examples_code_splitbar.auto = .5
      @examples_code_splitbar.position = 20


      @examples_editor = ace.edit "tutorials-examples-code-editor"
      @examples_editor.$blockScrolling = Infinity
      @examples_editor.setTheme("ace/theme/tomorrow_night_bright")
      @examples_editor.getSession().setMode("ace/mode/microscript2")
      @examples_editor.getSession().setOptions
        tabSize: 2
        useSoftTabs: true
        useWorker: false # disables lua autocorrection ; preserves syntax coloring

      @examples_editor.getSession().on "change",()=>
        @codeEdited()
    
    if project.icon
      icon = run_domain + "/#{project.owner}/#{project.slug}/sprites/icon.png"
    else
      icon = "#{dev_domain}/img/lightbulb16.png"
    document.querySelector("#tutorials-example-view-topbar img").src = icon
    document.querySelector("#tutorials-example-view-topbar span").innerText = project.title

    @app.appui.createProjectLikesButton document.getElementById("tutorials-example-view-topbar"),project

    @app.client.sendRequest {
      name: "list_public_project_files"
      project: project.id
      folder: "ms"
    },(msg)=>
      @setSourceList msg.files, project

      @examples_splitbar.update()
      @examples_code_splitbar.update()
      @examples_splitbar.update()
      device = document.getElementById "tutorials-examples-run"
      origin = run_domain
      url = "#{run_domain}/#{project.owner}/#{project.slug}/"
      device.innerHTML = "<iframe id='exampleiframe' allow='autoplay #{origin}; gamepad #{origin}; midi #{origin}; camera #{origin}; microphone #{origin}' src='#{url}?debug'></iframe><i class='fas fa-redo'></i>"
      device.querySelector("i").addEventListener "click",()=>
        @postMessage
          name: "command"
          line: "init()"
        

  setSelectedSource:(file)->
    @selected_source = file
    @source_folder.setSelectedItem file

    source = @project_sources[file]
    if source? and source.parent?
      source.parent.setOpen true
    
    if @project? and @project.language?
      lang = @project.language
      if lang == "microscript_v2" and @sources[file]? and /^\s*\/\/\s*javascript\s*\n/.test(@sources[file])
        lang = "javascript"
      lang = @app.languages[lang] or @app.languages["microscript2"]
      @examples_editor.getSession().setMode(lang.ace_mode)

    @examples_editor.setValue @sources[file],-1

  setSourceList:(files,project)->
    table = {}
    manager =
      folder: "ms"
      item: "source"
      openItem:(item)=>
        @setSelectedSource item

    @project_sources = {}
    @sources = {}

    project = JSON.parse(JSON.stringify(project)) # create a clone
    project.app = @app
    project.notifyListeners = (source)=>
      @sources[source.name] = source.content
      if not @selected_source?
        @setSelectedSource(source.name)

    project.getFullURL = ()->
      url = location.origin+"/#{project.owner}/#{project.slug}/"

    folder = new ProjectFolder null,"source"
    for f in files
      s = new ExploreProjectSource project,f.file
      @project_sources[s.name] = s
      folder.push s
      table[s.name] = s

    view = new FolderView manager,document.querySelector("#tutorials-examples-code-files")
    @source_folder = view
    view.editable = false
    view.rebuildList folder

    @project = project
    return

  codeEdited:()->
    if @selected_source
      @updateCode( @selected_source+".ms", @examples_editor.getValue() )

  updateCode:(file,src)->
    @postMessage
      name: "code_updated"
      file: file
      code: src

  postMessage:(data)->
    iframe = document.getElementById("exampleiframe")
    if iframe?
      iframe.contentWindow.postMessage JSON.stringify(data),"*"

