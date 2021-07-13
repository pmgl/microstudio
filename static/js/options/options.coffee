class @Options
  constructor:(@app)->
    @textInput "projectoption-name",(value)=>@optionChanged("title",value)

    @project_slug_validator = new InputValidator document.getElementById("projectoption-slug"),
      document.getElementById("project-slug-button"),
      null,
      (value)=>
        @optionChanged("slug",value[0])

    @project_code_validator = new InputValidator document.getElementById("projectoption-code"),
      document.getElementById("project-code-button"),
      null,
      (value)=>
        @optionChanged("code",value[0])

    @selectInput "projectoption-orientation",(value)=>@orientationChanged(value)
    @selectInput "projectoption-aspect",(value)=>@aspectChanged(value)
    @selectInput "projectoption-graphics",(value)=>@graphicsChanged(value)

    @app.appui.setAction "add-project-user",()=>
      @addProjectUser()

    document.getElementById("add-project-user-nick").addEventListener "keyup",(event)=>
      if event.keyCode == 13
        @addProjectUser()

  textInput:(element,action)->
    e = document.getElementById(element)
    e.addEventListener "input",(event)=>action(e.value)

  selectInput:(element,action)->
    e = document.getElementById(element)
    e.addEventListener "change",(event)=>action(e.options[e.selectedIndex].value)

  projectOpened:()->
    PixelatedImage.setURL document.getElementById("projectoptions-icon"),@app.project.getFullURL()+"icon.png",160
    #document.getElementById("projectoptions-icon").setAttribute("src","#{@app.project.getFullURL()}icon.png")
    document.getElementById("projectoption-name").value = @app.project.title
    @project_slug_validator.set @app.project.slug

    document.getElementById("projectoption-slugprefix").innerText = location.origin.replace(".dev",".io")+"/#{@app.project.owner.nick}/"
    document.getElementById("projectoption-orientation").value = @app.project.orientation
    document.getElementById("projectoption-aspect").value = @app.project.aspect
    document.getElementById("projectoption-graphics").value = @app.project.graphics or "M1"
    @updateSecretCodeLine()
    @updateUserList()
    @app.project.addListener @

    document.querySelector("#projectoptions-users").style.display = if @app.user.flags.guest then "none" else "block"

  updateSecretCodeLine:()->
    @project_code_validator.set @app.project.code
    document.getElementById("projectoption-codeprefix").innerText = location.origin.replace(".dev",".io")+"/#{@app.project.owner.nick}/#{@app.project.slug}/"

  projectUpdate:(name)->
    if name == "spritelist"
      icon = @app.project.getSprite("icon")
      if icon?
        icon.addImage document.getElementById("projectoptions-icon"),160

  update:()->
    storage = @app.appui.displayByteSize @app.project.getSize()
    document.getElementById("projectoption-storage-used").innerText = storage

  optionChanged:(name,value)->
    return if value.trim().length == 0
    switch name
      when "title"
        @app.project.setTitle value
      when "slug"
        if value != RegexLib.slugify value
          value = RegexLib.slugify value
          @project_slug_validator.set value

        return if value.length == 0 or value == @app.project.slug
        @app.project.setSlug value
        @updateSecretCodeLine()

      when "code"
        @app.project.setCode value

    @app.client.sendRequest {
      name: "set_project_option"
      project: @app.project.id
      option: name
      value: value
    },(msg)=>
      if msg.name == "error" and msg.value?
        switch name
          when "title"
            document.getElementById("projectoption-name").value = msg.value
            @app.project.setTitle msg.value
          when "slug"
            @project_slug_validator.set msg.value
            @app.project.setSlug msg.value
            @updateSecretCodeLine()

  orientationChanged:(value)->
    @app.project.setOrientation(value)
    @app.client.sendRequest {
      name: "set_project_option"
      project: @app.project.id
      option: "orientation"
      value: value
    },(msg)=>

  aspectChanged:(value)->
    @app.project.setAspect(value)
    @app.client.sendRequest {
      name: "set_project_option"
      project: @app.project.id
      option: "aspect"
      value: value
    },(msg)=>

  graphicsChanged:(value)->
    @app.project.setGraphics(value)
    @app.client.sendRequest {
      name: "set_project_option"
      project: @app.project.id
      option: "graphics"
      value: value
    },(msg)=>
    @app.appui.updateAllowedSections()

  setType:(type)->
    if type != @app.project.type
      console.info("setting type to #{type}")
      @app.project.setType(type)
      @app.client.sendRequest {
        name: "set_project_option"
        project: @app.project.id
        option: "type"
        value: type
      },(msg)=>

  addProjectUser:()->
    nick = document.getElementById("add-project-user-nick").value
    if nick.trim().length>0
      @app.client.sendRequest {
        name: "invite_to_project"
        project: @app.project.id
        user: nick
      },(msg)=>
        console.info msg
      document.getElementById("add-project-user-nick").value = ""


  updateUserList:()->
    div = document.getElementById("project-user-list")
    div.innerHTML = ""
    for user in @app.project.users
      do (user)=>
        e = document.createElement "div"
        e.classList.add "user"
        name = document.createElement "div"
        name.classList.add "username"
        name.innerHTML = user.nick+" "+if user.accepted then "<i class='fa fa-check'></i>" else "<i class='fa fa-clock'></i>"
        remove = document.createElement "div"
        remove.classList.add "remove"
        remove.innerHTML = "<i class='fa fa-times'></i> Remove"
        remove.addEventListener "click",(event)=>
          @app.client.sendRequest
            name:"remove_project_user"
            project: @app.project.id
            user: user.nick

        e.appendChild remove
        e.appendChild name

        div.appendChild e
    return
