class @Publish
  constructor:(@app)->
    @app.appui.setAction "publish-button",()=>
      @setProjectPublic(true)

    @app.appui.setAction "unpublish-button",()=>
      @setProjectPublic(false)

    @tags_validator = new InputValidator document.getElementById("publish-add-tags"),
      document.getElementById("publish-add-tags-button"),
      null,
      (value)=>
        @addTags(value[0])

    @description_save = 0
    document.querySelector("#publish-box-textarea").addEventListener "input",()=>
      @description_save = Date.now()+2000

    setInterval (()=>@checkDescriptionSave()),1000

    @builders = []
    @builders.push new AppBuild(@app,"android")
    @builders.push new AppBuild(@app,"windows")
    @builders.push new AppBuild(@app,"macos")
    @builders.push new AppBuild(@app,"linux")
    @builders.push new AppBuild(@app,"raspbian")

    @checks = ["original","useful","icon","copyright","license"]
    for c in @checks
      document.getElementById("publish-check-#{c}").addEventListener "input",(event)=>@checkChecks()

  checkChecks:()->
    all = true
    for c in @checks
      if not document.getElementById("publish-check-#{c}").checked
        all = false

    if all
      document.querySelector("#publish-box .publish-button").classList.remove "disabled"
    else if @app.project.public
      document.querySelector("#publish-box .publish-button").classList.remove "disabled"
    else
      document.querySelector("#publish-box .publish-button").classList.add "disabled"

    return all

  loadProject:(project)->
    if project.public
      document.getElementById("publish-box").style.display = "none"
      document.getElementById("unpublish-box").style.display = "block"
    else
      document.getElementById("publish-box").style.display = "block"
      document.getElementById("unpublish-box").style.display = "none"

    document.getElementById("publish-checklist").style.display = "none"
    for c in @checks
      document.getElementById("publish-check-#{c}").checked = false
    @checkChecks()

    document.getElementById("publish-validate-first").style.display = if @app.user.flags["validated"] then "none" else "block"

    document.querySelector("#publish-box-textarea").value = project.description
    @updateTags()
    project.addListener @

    if @app.user.flags["validated"]
      document.querySelector("#publish-box .publish-button").classList.remove "disabled"
    else
      document.querySelector("#publish-box .publish-button").classList.add "disabled"

    b = document.querySelector("#html-export .publish-button")
    b.onclick = ()=>
      loc = "/#{project.owner.nick}/#{project.slug}/"
      if not project.public
        loc += project.code+"/"
      window.location = loc+"publish/html/"

    for build in @builders
      build.loadProject(project)
    return

  updateTags:()->
    list = document.getElementById("publish-tag-list")
    list.innerHTML = ""
    for t in @app.project.tags
      do (t)=>
        e = document.createElement "div"
        t = t.replace(/[<>&;"']/g,"")
        span = document.createElement "span"
        span.innerText = t
        e.appendChild span
        i = document.createElement "i"
        i.classList.add "fa"
        i.classList.add "fa-times-circle"
        i.addEventListener "click",()=>
          @removeTag(t)
        e.appendChild i
        list.appendChild e
    return

  removeTag:(t)->
    tags = @app.project.tags
    if tags.indexOf(t)>=0
      tags.splice(tags.indexOf(t),1)
      @app.client.sendRequest {
        name:"set_project_tags"
        project: @app.project.id
        tags: tags
      },(msg)=>
        @updateTags()

  addTags:(value)->
    tags = @app.project.tags
    value = value.toLowerCase().split(",")
    change = false
    for v in value
      v = v.trim()
      if tags.indexOf(v)<0
        change = true
        tags.push(v)
    if change
      @app.client.sendRequest {
        name:"set_project_tags"
        project: @app.project.id
        tags: tags
      },(msg)=>
        @updateTags()
        @tags_validator.reset()

  projectUpdate:(type)->
    switch type
      when "tags"
        @updateTags()

  checkDescriptionSave:(force=false)->
    if @description_save>0 and (Date.now()>@description_save or force)
      @description_save = 0
      @app.project.description = document.querySelector("#publish-box-textarea").value
      @app.client.sendRequest {
        name:"set_project_option"
        project: @app.project.id
        option: "description"
        value: document.querySelector("#publish-box-textarea").value
      },(msg)=>

  setProjectPublic:(pub)->
    return if pub and not @app.user.flags["validated"]
    if pub and not @checkChecks()
      document.getElementById("publish-checklist").style.display = "block"
      document.querySelector("#publish-box .publish-button").classList.add "disabled"
      return

    if pub
      document.getElementById("publish-checklist").style.display = "none"

    @checkDescriptionSave(true)
    if @app.project?
      @app.client.sendRequest {
        name:"set_project_public"
        project: @app.project.id
        public: pub
      },(msg)=>
        if msg.public?
          @app.project.public = msg.public
          @app.project.notifyListeners("public")
          @loadProject(@app.project)
