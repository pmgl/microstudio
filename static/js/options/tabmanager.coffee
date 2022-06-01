class @TabManager
  constructor:(@app)->
    @initProjectTabSelection()
    @known_plugins = {}
    @plugin_views = {}

  projectOpened:()->
    @updateProjectTabSelection()
    @updatePluginSelection()

  isTabActive:(t)->
    p = @app.project
    return false if not p
    tabs = p.tabs or {}
    if tabs[t]? then return tabs[t] else return TabManager.DEFAULT_TABS[t]

  setTabActive:(t,active)->
    p = @app.project
    if not p.tabs?
      p.tabs = {}
    p.tabs[t] = active
    @updateProjectTabs()
    @app.client.sendRequest {
      name: "set_project_option"
      project: @app.project.id
      option: "tabs"
      value: p.tabs
    },(msg)=>

  updateProjectTabSelection:()->
    for tab of TabManager.DEFAULT_TABS
      element = document.getElementById("project-option-active-tab-#{tab}")
      if element?
        element.checked = @isTabActive tab
    return

  updateProjectTabs:()->
    for tab of TabManager.DEFAULT_TABS
      element = document.getElementById("menuitem-#{tab}")
      if element?
        element.style.display = if @isTabActive(tab) then "block" else "none"

    plugins = @app.project.plugins or {}
    list = document.querySelectorAll ".menuitem-plugin"
    for element in list
      id = element.id.split("-")[1]*1
      if not plugins[id]?
        element.parentNode.removeChild element
        if @plugin_views[id]?
          @plugin_views[id].close()
          delete @plugin_views[id]

        @app.documentation.removePlugin id


    for id,value of plugins
      element = document.getElementById "menuitem-#{id}"
      if not element
        @createPluginUI id
    return

  initProjectTabSelection:()->
    for tab of TabManager.DEFAULT_TABS
      do (tab)=>
        element = document.getElementById("project-option-active-tab-#{tab}")
        element.addEventListener "change",()=>
          @setTabActive(tab,not @isTabActive(tab))
    return


  createPluginBox:(project)->
    console.info project

    nick = if typeof project.owner == "string" then project.owner else project.owner.nick
    id = project.id
    path = "/#{nick}/#{project.slug}"

    if project.code?
      path += "/#{project.code}"

    @known_plugins[id] =
      nick: nick
      slug: project.slug
      title: project.title
      code: project.code
      url: "#{location.origin}#{path}/"

    div = document.createElement "div"
    div.classList.add "plugin-box"
    div.dataset.id = id
    desc = project.description
    if desc.length>300
      desc = desc.substring(0,300)+" (...)"
    div.innerHTML = """
    <img class="pixelated icon" src="#{location.origin}#{path}/sprites/icon.png"/>
    <div class="description">
      <div class="plugin-author"></div>
      <h4>#{project.title}</h4>
      <p>#{DOMPurify.sanitize marked desc}</p>
      <div class="plugin-folder">
        <label for="plugin-folder-#{id}">Working folder</label><br/>
        <input id="plugin-folder-#{id}" type="text" value="#{project.slug}"></input><br/>
        This plugin file access will be restricted to the specified folder (or to the root folder if left blank).
      </div>
      <i class="fa fa-check check"></i>
    </div>
    """

    list = div.getElementsByTagName "a"
    for e in list
      e.target = "_blank"

    if project.owner_info
      user = @app.appui.createUserTag(nick,project.owner_info.tier,project.owner_info.profile_image,20)
    else if project.owner.nick == @app.user.nick
      user = @app.appui.createUserTag(@app.user.nick,@app.user.flags.tier or "",@app.user.flags.profile_image,20)
    else
      user = @app.appui.createUserTag(project.owner.nick,"",false,20)

    div.querySelector(".plugin-author").appendChild user
    div.id = "plugin-box-#{id}"

    plugins = @app.project.plugins or {}
    if plugins[id]? and plugins[id].folder?
      div.querySelector("input").value = plugins[id].folder

    div.querySelector("input").addEventListener "keydown",(event)=>
      if event.key == "Enter"
        prop = "input_validation_#{id}"
        if @[prop]
          clearTimeout @[prop]
        @updatePluginFolder id
        div.querySelector("input").blur()

    div.querySelector("input").addEventListener "input",()=>
      prop = "input_validation_#{id}"
      if @[prop]
        clearTimeout @[prop]
      @[prop] = setTimeout (()=>
        @updatePluginFolder id
        div.querySelector("input").blur()
        ),2000

    div.addEventListener "click",()=>
      if div.querySelector("input") != document.activeElement
        @togglePlugin id
    div

  togglePlugin:(id)->
    if @isPluginActive(id)
      @setPluginActive id,false
    else
      folder = RegexLib.fixFilePath document.querySelector("#plugin-box-#{id} input").value
      @setPluginActive id,true,folder


  updatePluginFolder:(id)->
    if @isPluginActive id
      e = document.querySelector("#plugin-box-#{id} input")
      e.value = RegexLib.fixFilePath e.value
      @setPluginActive id,true,e.value
      if @plugin_views[id]?
        @plugin_views[id].setFolder e.value

  fetchAvailablePlugins:(callback)->
    return callback() if @plugins_fetched

    @plugins_fetched = true

    your_plugins = document.querySelector "#project-tabs-your-plugins"
    your_list = document.querySelector "#project-tabs-your-plugins .plugin-list"

    your_list.innerHTML = ""

    for p in @app.projects
      if p.type == "plugin"
        box = @createPluginBox(p)
        your_list.appendChild box

    if your_list.childNodes.length == 0
      your_plugins.style.display = "none"
    else
      your_plugins.style.display = "block"

    @app.client.sendRequest {
      name:"get_public_plugins"
    },(msg)=>
      console.info msg.list

      public_plugins = document.querySelector "#project-tabs-public-plugins"
      public_list = document.querySelector "#project-tabs-public-plugins .plugin-list"

      for p in msg.list
        if not @known_plugins[p.id]?
          box = @createPluginBox p
          public_list.appendChild box

      if public_list.childNodes.length == 0
        public_plugins.style.display = "none"
      else
        public_plugins.style.display = "block"

      callback()

  updatePluginSelection:()->
    @fetchAvailablePlugins ()=>
      list = document.querySelectorAll ".plugin-box"
      plugins = @app.project.plugins or {}
      for e in list
        if plugins[e.dataset.id]
          e.classList.add "selected"
        else
          e.classList.remove "selected"
      @updateProjectTabs()
      return

  isPluginActive:(id)->
    p = @app.project
    return false if not p
    plugins = p.plugins or {}
    plugins[id]?

  setPluginActive:(id,active,folder="plugin")->
    p = @app.project
    if not p.plugins?
      p.plugins = {}
    if active
      p.plugins[id] =
        folder: folder
    else
      delete p.plugins[id]

    @updatePluginSelection()
    @updateProjectTabs()

    @app.client.sendRequest {
      name: "set_project_option"
      project: @app.project.id
      option: "plugins"
      value: p.plugins
    },(msg)=>

  createPluginUI:(id)->
    data = @known_plugins[id]
    return if not data?
    if data.code?
      path = "#{data.nick}/#{data.slug}/#{data.code}"
    else
      path = "#{data.nick}/#{data.slug}"

    li = document.createElement "li"
    li.classList.add "menuitem-plugin"
    li.id = "menuitem-#{id}"
    li.innerHTML = """
    <img class="pixelated" src="/#{path}/sprites/icon.png" />
    <br>
    <span>#{data.title}</span>
    """
    parent = document.querySelector "#sidemenu ul"
    last = document.getElementById "menuitem-tabs"
    li.addEventListener "click",()=>
      @app.appui.setSection id

    parent.insertBefore li,last

    doc_url = "#{location.origin}/#{path}/doc/doc.md"
    @app.documentation.addPlugin id,data.title,doc_url

  setTabView:(id)->
    for viewid,view of @plugin_views
      if viewid != id
        view.hide()

    view = @plugin_views[id]
    if not view?
      data = @known_plugins[id]
      return if not data?

      settings = @app.project.plugins[id]
      return if not settings?

      data.folder = settings.folder
      @plugin_views[id] = view = new PluginView @app,data

    view.show()

  projectClosed:()->
    for id,view of @plugin_views
      view.close()

    list = document.querySelectorAll ".menuitem-plugin"
    for element in list
      element.parentNode.removeChild element

    @plugin_views = {}
    @app.documentation.removeAllPlugins()
    return

  @DEFAULT_TABS =
    code: true
    sprites: true
    maps: true
    sounds: true
    music: true
    assets: false
    doc: true
    publish: true
