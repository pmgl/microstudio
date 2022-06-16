class @Sync
  constructor:(@app)->
    @select = document.getElementById "project-sync-source"
    @project_sync_list = document.getElementById "project-sync-list"
    @project_sync_proceed = document.getElementById "project-sync-proceed"
    @project_sync_input = document.querySelector "#project-sync-proceed input"
    @project_sync_button = document.querySelector "#project-sync-proceed .proceed"

    @project_sync_button.addEventListener "click",()=>
      console.info @checklist
      @app.client.sendRequest {
        name: "sync_project_files"
        ops: @checklist
        source: @source.id
        dest: @app.project.id

      },(msg)=>
        console.info msg
        @app.project.load()
        @diff()

    @select.addEventListener "change", (event)=>
      id = @select.options[@select.selectedIndex].value*1
      for p in @app.projects
        if p.id == id
          @source = p
          @diff()
          @app.client.sendRequest
            name: "set_project_property"
            project: @app.project.id
            property: "sync_source"
            value: p.id
          return

      @app.client.sendRequest
        name: "set_project_property"
        project: @app.project.id
        property: "sync_source"

      @project_sync_list.innerHTML = ""
      @project_sync_proceed.style.display = "none"


    @project_sync_input.addEventListener "input",(event)=>
      if @project_sync_input.value == "SYNC NOW"
        @project_sync_button.style.display = "inline-block"
      else
        @project_sync_button.style.display = "none"

  projectOpened:()->
    @reset()

  reset:()->
    @select.innerHTML = ""
    @project_sync_list.innerHTML = ""
    @project_sync_proceed.style.display = "none"
    @project_sync_input.value = ""
    @project_sync_button.style.display = "none"


  update:()->
    @select.innerHTML = ""
    if @app.projects?
      option_none = document.createElement "option"
      option_none.value = -1
      option_none.innerText = @app.translator.get("No source project")
      option_none.name = ""
      option_none.selected = true
      @select.appendChild option_none

      for p in @app.projects
        if p.id != @app.project.id
          option = document.createElement "option"
          option.value = p.id
          option.innerText = p.title + "    - [#{p.slug}]"
          option.name = p.slug
          @select.appendChild option

          if @app.project? and @app.project.properties.sync_source == p.id
            option_none.selected = false
            option.selected = true
            @source = p
            @diff()


  diff:()->
    text = @app.translator.get("The following changes will be made to your project %PROJECT%:").replace("%PROJECT%","#{@app.project.title}  - [#{@app.project.slug}]")
    @project_sync_list.innerHTML = """<h3>#{text}</h3>"""

    @source_view = new Sync.ProjectView(@app,@source.id)

    @checklist = []

    @source_view.load ()=>
      @dest_view = new Sync.ProjectView(@app,@app.project.id)
      @dest_view.load ()=>
        for path,file of @source_view.files
          f = @dest_view.files[path]
          hr_path = path.replace(/-/g,"/")
          if not f?
            @addSyncLine "create",@app.translator.get("File %FILE% will be created").replace("%FILE%",hr_path)
            @checklist.push
              op: "sync"
              file: file
          else if file.version > f.version
            @addSyncLine "upgrade",@app.translator.get("File %FILE% will be upgraded from version %V1% to version %V2%").replace("%FILE%",hr_path).replace("%V1%",f.version).replace("%V2%",file.version)
            @checklist.push
              op: "sync"
              file: file
          else if file.version < f.version
            @addSyncLine "downgrade",@app.translator.get("File %FILE% will be downgraded from version %V1% to version %V2%").replace("%FILE%",hr_path).replace("%V1%",f.version).replace("%V2%",file.version)
            @checklist.push
              op: "sync"
              file: file
          else if file.size != f.size
            @addSyncLine "sync",@app.translator.get("File %FILE% will be changed").replace("%FILE%",hr_path)
            @checklist.push
              op: "sync"
              file: file

        for path,file of @dest_view.files
          s = @source_view.files[path]
          hr_path = path.replace(/-/g,"/")
          if not s?
            @addSyncLine "delete",@app.translator.get("File %FILE% will be deleted").replace("%FILE%",hr_path)
            @checklist.push
              op: "delete"
              file: file

        if @checklist.length == 0
          text = @app.translator.get("Your project is 100% in sync with %PROJECT%").replace("%PROJECT%","#{@app.project.title}  - [#{@app.project.slug}]")
          @project_sync_list.innerHTML = """<h3>#{text}</h3>"""
          @project_sync_proceed.style.display = "none"
        else
          @project_sync_proceed.style.display = "block"

  addSyncLine:(type,text)->
    div = document.createElement "div"
    div.classList.add type
    div.innerHTML = """<i class="fa"></i> #{text}"""
    @project_sync_list.appendChild div

  fetchList:(folder)->
    @app.client.sendRequest {
      name: "list_project_files"
      project: @app.project.id
      folder: folder
    },(msg)=>
      @[callback] msg.files

class @Sync.ProjectView
  constructor:(@app,@id)->
    @files = {}

  load:(callback)->
    list = ["ms","sprites","maps","sounds","music","assets","doc"]

    funk = ()=>
      if list.length>0
        e = list.splice(0,1)[0]
        @fetch e,funk
      else
        callback()

    funk()

  fetch:(folder,next)->
    @app.client.sendRequest {
      name: "list_project_files"
      project: @id
      folder: folder
    },(msg)=>
      for f in msg.files
        console.info f
        path = "#{folder}/#{f.file}"
        @files[path] = f
        f.path = path

      next()
