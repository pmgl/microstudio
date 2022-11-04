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
    @selectInput "projectoption-type",(value)=>@typeChanged(value)
    @selectInput "projectoption-graphics",(value)=>@graphicsChanged(value)
    @selectInput "projectoption-language",(value)=>@languageChanged(value)
    @checkInput "projectoption-networking",(value)=>@networkingChanged(value)

    advanced = document.getElementById("advanced-project-options-button")
    advanced.addEventListener "click",()=>
      if advanced.classList.contains "open"
        advanced.classList.remove "open"
        document.getElementById("advanced-project-options").style.display = "none"
        advanced.childNodes[1].innerText = @app.translator.get "Show advanced options"
      else
        advanced.classList.add "open"
        document.getElementById("advanced-project-options").style.display = "block"
        advanced.childNodes[1].innerText = @app.translator.get "Hide advanced options"

    @app.appui.setAction "add-project-user",()=>
      @addProjectUser()

    document.getElementById("add-project-user-nick").addEventListener "keyup",(event)=>
      if event.keyCode == 13
        @addProjectUser()

    list = document.querySelectorAll("#project-option-libs input")
    for input in list
      do(input)=>
        input.addEventListener "change",()=>
          id = input.id.split("-")
          id = id[id.length-1]
          if input.checked
            if id not in @app.project.libs
              @app.project.libs.push id
              @optionChanged "libs",@app.project.libs
          else
            index = @app.project.libs.indexOf id
            if index>=0
              @app.project.libs.splice index,1
              @optionChanged "libs",@app.project.libs

    @library_tip = document.querySelector "#project-option-type .library"

  textInput:(element,action)->
    e = document.getElementById(element)
    e.addEventListener "input",(event)=>action(e.value)

  selectInput:(element,action)->
    e = document.getElementById(element)
    e.addEventListener "change",(event)=>action(e.options[e.selectedIndex].value)

  checkInput:(element,action)->
    e = document.getElementById(element)
    e.addEventListener "change",(event)=>action(e.checked)

  projectOpened:()->
    document.getElementById("projectoptions-icon").src = @app.project.getFullURL()+"icon.png"
    #document.getElementById("projectoptions-icon").setAttribute("src","#{@app.project.getFullURL()}icon.png")
    document.getElementById("projectoption-name").value = @app.project.title
    @project_slug_validator.set @app.project.slug

    document.getElementById("projectoption-slugprefix").innerText = location.origin.replace(".dev",".io")+"/#{@app.project.owner.nick}/"
    document.getElementById("projectoption-orientation").value = @app.project.orientation
    document.getElementById("projectoption-aspect").value = @app.project.aspect
    document.getElementById("projectoption-type").value = @app.project.type or "app"
    document.getElementById("projectoption-graphics").value = @app.project.graphics or "M1"
    document.getElementById("projectoption-language").value = @app.project.language or "microscript_v1_i"

    document.getElementById("projectoption-networking").checked = @app.project.networking or false

    @library_tip.style.display = if @app.project.type == "library" then "block" else "none"

    list = document.querySelectorAll("#project-option-libs input")
    for input in list
      input.checked = false

    for lib in @app.project.libs
      e = document.getElementById "project-option-lib-#{lib}"
      if e?
        e.checked = true

    @updateSecretCodeLine()
    @updateUserList()
    @app.project.addListener @

    if window.ms_standalone or @app.user.flags.guest
      document.querySelector("#projectoptions-users-content").style.display = "none"
    else
      document.querySelector("#projectoptions-users-content").style.display = "block"

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
    return if value.trim? and value.trim().length == 0
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

  typeChanged:(value)->
    @app.project.setType(value)
    @library_tip.style.display = if value == "library" then "block" else "none"
    @app.client.sendRequest {
      name: "set_project_option"
      project: @app.project.id
      option: "type"
      value: value
    },(msg)=>

    @app.tab_manager.resetPlugins()
    @app.lib_manager.resetLibs()

  graphicsChanged:(value)->
    @app.project.setGraphics(value)
    @app.debug.updateDebuggerVisibility()
    @app.client.sendRequest {
      name: "set_project_option"
      project: @app.project.id
      option: "graphics"
      value: value
    },(msg)=>

  languageChanged:(value)->
    if value != @app.project.language
      if @app.project.source_list.length == 1 and @app.project.source_list[0].content.split("\n").length<20
        if not @app.project.language.startsWith("microscript") or not value.startsWith("microscript")
          ConfirmDialog.confirm @app.translator.get("Your current code will be overwritten. Do you wish to proceed?"),
            @app.translator.get("OK"),
            @app.translator.get("Cancel"),
            (()=>
              @app.project.setLanguage(value)
              @app.editor.updateLanguage()
              @app.debug.updateDebuggerVisibility()
              if DEFAULT_CODE[value]?
                @app.editor.setCode DEFAULT_CODE[value]
              else
                @app.editor.setCode DEFAULT_CODE["microscript"]
              @app.editor.editorContentsChanged()
              @setLanguage(value)
            ),
            (()=>
              document.getElementById("projectoption-language").value = @app.project.language
            )
          return

      @setLanguage(value)

  setLanguage:(value)->
    @app.project.setLanguage(value)
    @app.editor.updateLanguage()
    @app.debug.updateDebuggerVisibility()
    @app.client.sendRequest {
      name: "set_project_option"
      project: @app.project.id
      option: "language"
      value: value
    },(msg)=>

  networkingChanged:(value)->
    @app.project.networking = value
    @app.runwindow.updateServerBar()
    @app.publish.updateServerExport()
    @app.client.sendRequest {
      name: "set_project_option"
      project: @app.project.id
      option: "networking"
      value: value
    },(msg)=>


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


DEFAULT_CODE =
  python: """
def init():
  pass

def update():
  pass

def draw():
  pass
  """
  javascript: """
init = function() {
}

update = function() {
}

draw = function() {
}
  """
  lua: """
init = function()
end

update = function()
end

draw = function()
end
  """
  microscript: """
init = function()
end

update = function()
end

draw = function()
end
  """
